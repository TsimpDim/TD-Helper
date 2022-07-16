let cursorX, cursorY;

if (window == top) {
    browser.storage.sync.get(["languageTranslation", "languageConfiguration", "languageTimeout"]).then(results => {
        if (results.languageTranslation === true) {
            languageConfiguration = JSON.parse(results.languageConfiguration);

            window.addEventListener('mouseup', (e) => {
                checkForHighlights(e, languageConfiguration);
            }, false);
        }
    });
}

// Get the current mouse pointer position
document.onmousemove = function(e){
    cursorX = e.pageX;
    cursorY = e.pageY;
};

function checkForHighlights(e, configuration) {
    let selection = window.getSelection().toString();

    if (selection.length > 0) {
        spawnAllButtons(selection, configuration);
    }
}

function spawnAllButtons(textToTranslate, configuration) {
    let container = document.createElement("div");
    let offsetX = 5;   // Position the button near the pointer
    let offsetY = 5;
    let id = cursorX.toString() + cursorY.toString();

    if (document.getElementById(id) !== null) {
        return;
    }

    container.className = "translation-cont";
    container.style.left = (cursorX + offsetX) +'px';
    container.style.top  = (cursorY + offsetY) +'px';
    container.id = id;
    document.body.appendChild(container);

    setTimeout(function(){
        document.getElementById(container.id).remove();
    }, configuration.timeout);

    Object.keys(configuration).forEach(el => {
        if (el !== "timeout") {
            spawnButton(textToTranslate, el, container, configuration);
        }
    });
}

function spawnButton(textToTranslate, language, container, configuration){
    let newBut = document.createElement("button"); // Insert a button (the X) in the HTML
    newBut.className = "translation-btn";
    newBut.innerHTML = configuration[language].displayText;
    container.appendChild(newBut);
    
    let languageCode = configuration[language].languageCode;

    let sourceLanguageCode = configuration[configuration[language].sourceLanguage].languageCode;
    newBut.onclick = function() {
        window.open('https://translate.google.com/?sl=' + sourceLanguageCode + '&tl=' + languageCode + '&text=' + encodeURIComponent(textToTranslate) + '&op=translate')
    }
}


