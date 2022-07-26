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
        spawnContainer(timeout, options.widgetOverlap).then(container => {
            console.log(container);
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
        });
    }
}


async function spawnContainer(timeout, overlap) {
    let container = document.createElement("div");
    let c = await browser.storage.sync.get(["offsetX", "offsetY"]);
    let coordsX = cursorX + parseInt(c.offsetX) + 'px';
    let coordsY = cursorY + parseInt(c.offsetY) + 'px';
    let id = coordsX + coordsY;
    if (!overlap && document.getElementById(id) !== null) {
        return null;
    }

    container.className = "widget-cont";
    container.style.left = coordsX;
    container.style.top  = coordsY;
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