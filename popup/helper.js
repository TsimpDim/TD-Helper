import { decToHex, hexToDec } from '../external/hex2dec/hex2dec.js';

let fields = {
    "dec": document.getElementById("dec-eui"),
    "hex": document.getElementById("hex-eui"),
    "hex-colon": document.getElementById("hex-colon"),
    "rev-txt": document.getElementById("review-text-btn"),
    "unix-ts": document.getElementById("unix-ts"),
    "f-date": document.getElementById("f-date")
};

document.addEventListener('DOMContentLoaded', function() {
    browser.storage.sync.get("phabHost")
    .then(results => {
        let currentURL = "";
        browser.tabs.query({ active:true, currentWindow:true}, function(tabs){
            currentURL = new URL(tabs[0].url);

            if (currentURL.hostname == results.phabHost) {
                browser.tabs
                .executeScript({file: "/content-scripts/helper-cs.js"})
                .then(sendCopyReviewTextCommand);
            }
        });
    });

    
    getField("dec").addEventListener('keyup', decToHexField, true);
    getField("hex").addEventListener('keyup', hexToDecField, true);
    getField("hex-colon").addEventListener('change', hexToColonHex, true);
    getField("unix-ts").addEventListener('keyup', unixToDate, true);
    getField("f-date").addEventListener('keyup', dateToUnix, true);
});

function hexToDecField() {
    let hexContent = getField("hex").value;
    if (hexContent === "") {
        getField("dec").value = "";
        return;
    }

    hexContent = hexContent.replaceAll(':','');
    getField("dec").value = hexToDec(hexContent);;
};

function decToHexField() {
    let decContent = getField("dec").value;
    if (decContent === "") {
        getField("hex").value = "";
        return ;
    }

    getField("hex").value = decToHex(decContent).replace('0x', '');
};

function hexToColonHex() {
    let hexContent = getField("hex").value;
    
    if (getField("hex-colon").checked) {
        hexContent = chunk(hexContent, 4).join(':');
    } else {
        hexContent = hexContent.replaceAll(':', '');
    }
    
    getField("hex").value = hexContent
}

function sendCopyReviewTextCommand() {
    getField("rev-txt").addEventListener("click", () => {
        browser.tabs.query({active: true, currentWindow: true})
        .then((tabs) => {
            browser.tabs.sendMessage(tabs[0].id, {
                command: "copyReviewText",
            });
        })
        .catch(error => {
            console.log("error" + error);
        })
    }, true);
}

function unixToDate() {
    let unixTs = getField("unix-ts").value;
    if (unixTs === "") {
        getField("f-date").value = "";
        return ;
    }

    let date = new Date(unixTs * 1000);
    getField("f-date").value = date.toISOString().replace('Z', '');
}

function dateToUnix() {
    let dateString = getField("f-date").value;
    if (dateString === "") {
        getField("unix-ts").value = "";
        return ;
    }

    let dateObject = new Date(dateString);
    getField("unix-ts").value = dateObject.getTime() / 1000;
}

function getField(field) {
    return fields[field];
}

function chunk(str, n) {
    let ret = [];
    let i;
    let len;

    for(i = 0, len = str.length; i < len; i += n) {
       ret.push(str.substr(i, n))
    }

    return ret
};