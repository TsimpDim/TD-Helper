let cursorX, cursorY, switchKeyPressed, hoveredElement, highlightedSelection, detectedChunk;

if (window == top) {
    browser.storage.sync.get(
        [
            "highlightingToggle",
            "actionPopup",
            "actionConfiguration",
            "widgetDuration",
            "widgetOverlap",
            "toGoogle",
            "toGoogleText",
            "toClipboard",
            "toClipboardText",
            "onLinkHoverToggle",
            "linkOpenText",
            "linkOpenToggle",
            "linkWidgetDuration",
            "linkCopyToggle",
            "forceHoverListener"
        ]
    ).then(results => {
        if (results.highlightingToggle === true) {
            window.addEventListener('mouseup', () => {
                handleAllHighlightingWidgets(results, {
                    'linkHover': false
                });
            }, false);
        }

        if (results.onLinkHoverToggle === true) {
            // Search every element, as well as potentially plaintext URLs
            document.addEventListener('mousemove', (e) => {
                const el = document.elementFromPoint(e.clientX, e.clientY);
                if (!el || el === null) return;
                if (el === hoveredElement) return; else hoveredElement = el;


                const urlChunk = el.textContent.split(' ').find(c => isURL(c));
                const coords = {
                    'X': el.getBoundingClientRect().right + document.documentElement.scrollLeft,
                    'Y': el.getBoundingClientRect().top + document.documentElement.scrollTop,
                }
                
                if(switchKeyPressed) {

                    if (el.localName === 'a') {
                        handleAllLinkHoverWidgets(results, coords, el.href);
                    }
                    else if (isURL(el.textContent)) {
                        handleAllLinkHoverWidgets(results, coords, el.textContent);
                    }
                    else if (urlChunk) {
                        if (urlChunk === detectedChunk) return; else detectedChunk = urlChunk;

                        handleAllLinkHoverWidgets(results, {'X': cursorX, 'Y': cursorY}, urlChunk);
                    }
                }
            });

            if(results.forceHoverListener) {
                // Specifically search a's
                document.querySelectorAll('a').forEach(el =>
                    el.onmouseover = function(e) {
                        if(e.target.localName === 'a' && switchKeyPressed) {
                            handleAllLinkHoverWidgets(results, {
                                'X': el.getBoundingClientRect().right + document.documentElement.scrollLeft,
                                'Y': el.getBoundingClientRect().top + document.documentElement.scrollTop,
                            }, e.target.href);
                        }
                    }
                )
            }
        }
    });
}

// Get the current mouse pointer position
document.onmousemove = function(e){
    cursorX = e.pageX;
    cursorY = e.pageY;
};

// If focus change, set switchKeyPressed to false
onVisibilityChange(function(e) {
    switchKeyPressed = false;
});

document.addEventListener('keydown', function(e){
    browser.storage.sync.get(["linkHoverKey"]).then(r => {
        if(e.key === r.linkHoverKey) {
            switchKeyPressed = true;
        }
    });
});

document.addEventListener('keyup', function(e){
    browser.storage.sync.get(["linkHoverKey"]).then(r => {
        if(e.key === r.linkHoverKey) {
            switchKeyPressed = false;
        }
    });
});

browser.storage.sync.get(['removeOnClick']).then(response => {
    const removeOnClick = response.removeOnClick;
    if (removeOnClick && removeOnClick === true) {
        document.addEventListener('click', function(e){
            const el = document.elementFromPoint(e.clientX, e.clientY);
            const container = document.getElementsByClassName('widget-cont');

            if (container.length > 0 && !!el && !el.classList.contains('widget-cont')) {
                document.getElementsByClassName('widget-cont')[0].remove();
                highlightedSelection = '';
            }
        });
    }
});

function handleAllHighlightingWidgets(options) {
    let timeout = parseInt(options.widgetDuration);

    let actionConfiguration = null;
    if (options.actionPopup) {
        actionConfiguration = JSON.parse(options.actionConfiguration);
    }

    let selection = window.getSelection().toString();
    if (selection.length > 0) {
        if (selection === highlightedSelection) return; else highlightedSelection = selection;

        spawnContainer(timeout, options.widgetOverlap, cursorX, cursorY, ["offsetX", "offsetY"]).then(container => {
            if (container === null) {
                return;
            }

            if (options.toGoogle) {
                spawnToGoogleButton(container, selection, options.toGoogleText, 'to-google');
            }

            // in case it is turned off
            if (actionConfiguration !== null) {
                spawnActionButtons(container, selection, actionConfiguration, 'helper-btn-primary');
            }

            if (options.toClipboard) {
                spawnToClipboardButton(container, selection, options.toClipboardText, 'helper-btn-secondary');
            }
        });
    }
}

function handleAllLinkHoverWidgets(options, coords, hoveredUrl) {
    spawnContainer(options.linkWidgetDuration, false, coords.X, coords.Y, ["linkOffsetX", "linkOffsetY"])
    .then(container => {
        if (container === null) {
            return;
        }

        if (options.linkOpenToggle) {
            spawnOpenInNewTabButton(container, options.linkOpenText, hoveredUrl, 'secondary');
        }

        if (options.linkCopyToggle) {
            spawnToClipboardButton(container, hoveredUrl, options.toClipboardText, 'secondary')
        }
    })
}

async function spawnContainer(timeout, overlap, cX, cY, offsetParams) {
    let container = document.createElement("div");
    let c = await browser.storage.sync.get(offsetParams);
    let coordsX = cX + parseInt(c[offsetParams[0]]) + 'px';
    let coordsY = cY + parseInt(c[offsetParams[1]]) + 'px';
    let id = coordsX + coordsY;
    if (document.getElementById(id)) {
        document.getElementById(id).remove();
    }

    container.className = "widget-cont";
    container.style.left = coordsX;
    container.style.top  = coordsY;
    container.id = id;
    document.body.appendChild(container);

    setTimeout(function(){
        container.remove();
        detectedChunk = '';
    }, timeout);

    return container; 
}


function spawnToGoogleButton(container, selection, toGoogleText, desiredClass) {
    spawnButton(container, toGoogleText, desiredClass, function(){
        window.open('https://google.com/search?q=' + encodeURIComponent(selection));
    });
}

function spawnOpenInNewTabButton(container, linkOpenText, selection, desiredClass) {
    spawnButton(container, linkOpenText, desiredClass, function(){
        window.open(selection, '_blank');
    });
}

function spawnToClipboardButton(container, selection, toClipboardText, desiredClass) {
    spawnButton(container, toClipboardText, desiredClass, function() {
        if (!window.chrome) {
            navigator.clipboard.writeText(selection)
            .then(() => {
                console.log("Link copied to clipboard.");
            })
            .catch(e => {console.log(e)});
        } else {
            self.hardcoreCopy(selection);
        }
        
        // Immediately kill container
        container.remove();
    }); 
}

function spawnActionButtons(container, highlightedText, actionConfiguration, desiredClass) {
    actionConfiguration.forEach(el => {
        const finalUrl = el.url.replace('{text}', encodeURIComponent(highlightedText));

        spawnButton(container, el.displayText, desiredClass, function(){
            window.open(finalUrl)
        });
    });
}

function spawnButton(container, displayText, desiredClass, onclickf){
    let newBut = document.createElement("button");
    newBut.innerHTML = displayText;
    newBut.classList.add(desiredClass);
    newBut.classList.add('widget-btn');
    newBut.onclick = onclickf;
    container.appendChild(newBut);
}