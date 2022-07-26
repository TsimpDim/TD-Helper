let cursorX, cursorY;

if (window == top) {
    browser.storage.sync.get(
        [
            "highlightingToggle",
            "languageTranslation",
            "languageConfiguration",
            "widgetDuration",
            "widgetOverlap",
            "toGoogle"
        ]
    ).then(results => {
        if (results.highlightingToggle === true) {
            window.addEventListener('mouseup', () => {
                handleAllWidgets(results);
            }, false);
        }
    });
}

// Get the current mouse pointer position
document.onmousemove = function(e){
    cursorX = e.pageX;
    cursorY = e.pageY;
};

function handleAllWidgets(options) {
    let languageConfiguration = null;
    if (options.languageTranslation === true) {
        languageConfiguration = JSON.parse(options.languageConfiguration);
    }

    let timeout = parseInt(options.widgetDuration);
    let selection = window.getSelection().toString();

    if (selection.length > 0) {
        let container = spawnContainer(timeout, options.widgetOverlap);
        if (container === null) {
            return;
        }

        if (options.toGoogle === true) {
            spawnToGoogleButton(container, selection);
        }

        // in case it is turned off
        if (languageConfiguration !== null) {
            spawnTranslationButtons(container, selection, languageConfiguration);
        }
    }
}


function spawnContainer(timeout, overlap) {
    let container = document.createElement("div");
    let c = getButtonSpawnCoords();
    let id = c.x + c.y;

    if (!overlap && document.getElementById(id) !== null) {
        return null;
    }

    container.className = "widget-cont";
    container.style.left = c.x;
    container.style.top  = c.y;
    container.id = id;
    document.body.appendChild(container);

    // setTimeout(function(){
    //     container.remove();
    // }, timeout);

    return container;
}


function spawnToGoogleButton(container, selection) {
    spawnButton(container, "G", function(){
        window.open('https://google.com/search?q=' + encodeURIComponent(selection));
    });
}

function spawnTranslationButtons(container, textToTranslate, langConfiguration) {
    Object.keys(langConfiguration).forEach(el => {
        let languageCode = langConfiguration[el].languageCode;
        let sourceLanguageCode = langConfiguration[langConfiguration[el].sourceLanguage].languageCode;

        spawnButton(container, langConfiguration[el].displayText, function(){
            window.open('https://translate.google.com/?sl=' + sourceLanguageCode + '&tl=' + languageCode + '&text=' + encodeURIComponent(textToTranslate) + '&op=translate')
        });
    });
}

function spawnButton(container, displayText, onclickf){
    let newBut = document.createElement("button");
    newBut.className = "widget-btn";
    newBut.innerHTML = displayText;
    newBut.onclick = onclickf;
    container.appendChild(newBut);
}

function getButtonSpawnCoords() {
    let offsetX = 5;
    let offsetY = 5;
    return {'x': cursorX + offsetX + 'px', 'y': cursorY + offsetY + 'px'}
}
