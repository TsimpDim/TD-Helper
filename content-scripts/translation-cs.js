let cursorX, cursorY;
let languageConfiguration;

if (window == top) {
    browser.storage.sync.get(["languageTranslation", "languageConfiguration"]).then(results => {
        console.log(results);
        if (results.languageTranslation === true) {
            languageConfiguration = JSON.parse(results.languageConfiguration);
            window.addEventListener('mouseup', checkForHighlights, false);
        }
    });
}

// Get the current mouse pointer position
document.onmousemove = function(e){
    cursorX = e.pageX;
    cursorY = e.pageY;
};

function checkForHighlights(e) {
    let selection = window.getSelection().toString();

    if (selection.length > 0) {
        spawnAllButtons(selection);
    }
}

function spawnAllButtons(textToTranslate) {
    spawnButton(textToTranslate, "german");
    spawnButton(textToTranslate, "english", 25);
}

function spawnButton(textToTranslate, language, extraOffsetX = 0){
    let newBut = document.createElement("button"); // Insert a button (the X) in the HTML
    newBut.className= "translation-btn";

    newBut.innerHTML = languageConfiguration[language].displayText;
    newBut.id = cursorX.toString() + cursorY.toString() + Math.random();
    document.body.appendChild(newBut);

    let offsetX = 5;   // Position the button near the pointer
    let offsetY = 5;
    newBut.style.left = (cursorX + offsetX + extraOffsetX) +'px';
    newBut.style.top  = (cursorY + offsetY) +'px';


    let languageCode = languageConfiguration[language].languageCode;
    let sourceLanguageCode = languageConfiguration[languageConfiguration[language].sourceLanguage].languageCode;
    newBut.onclick = function() {
        window.open('https://translate.google.com/?sl=' + sourceLanguageCode + '&tl=' + languageCode + '&text=' + textToTranslate + '&op=translate')
    }

    // setTimeout(function(){
    //     document.getElementById(newBut.id).remove();
    // },1500);
}


