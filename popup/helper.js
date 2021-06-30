import { decToHex, hexToDec } from '../external/hex2dec/hex2dec.js';

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

    let fields = getFields();
    
    fields.dec.addEventListener('keyup', decToHexField, true);
    fields.hex.addEventListener('keyup', hexToDecField, true);
    fields["hex-colon"].addEventListener('change', hexToColonHex, true);
    fields["unix-ts"].addEventListener('keyup', unixToDate, true);
    fields["f-date"].addEventListener('keyup', dateToUnix, true);
});

function hexToDecField() {
    let fields = getFields();
    let hexContent = fields.hex.value;
    hexContent = hexContent.replaceAll(':','');
    fields.dec.value = hexToDec(hexContent);;
};

function decToHexField() {
    let fields = getFields();
    let decContent = fields.dec.value;
    fields.hex.value = decToHex(decContent).replace('0x', '');
};

function hexToColonHex() {
    let fields = getFields();
    let hexContent = fields.hex.value;
    
    if (fields["hex-colon"].checked) {
        hexContent = chunk(hexContent, 4).join(':');
    } else {
        hexContent = hexContent.replaceAll(':', '');
    }
    
    fields.hex.value = hexContent
}

function sendCopyReviewTextCommand() {
    getFields()["rev-txt"].addEventListener("click", () => {
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
    let fields = getFields();
    let unixTs = fields["unix-ts"].value;
    let date = new Date(unixTs * 1000);
    fields["f-date"].value = date.toISOString().replace('Z', '');
}

function dateToUnix() {
    let fields = getFields()
    let dateString = fields["f-date"].value;
    let dateObject = new Date(dateString);
    fields["unix-ts"].value = dateObject.getTime() / 1000;
}

function getFields() {
    return {
        "dec": document.getElementById("dec-eui"),
        "hex": document.getElementById("hex-eui"),
        "hex-colon": document.getElementById("hex-colon"),
        "rev-txt": document.getElementById("review-text-btn"),
        "unix-ts": document.getElementById("unix-ts"),
        "f-date": document.getElementById("f-date")
    }
}

function chunk(str, n) {
    var ret = [];
    var i;
    var len;

    for(i = 0, len = str.length; i < len; i += n) {
       ret.push(str.substr(i, n))
    }

    return ret
};


// External hex2dec.js