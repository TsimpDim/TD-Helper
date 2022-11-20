import { decToHex, hexToDec } from '../external/hex2dec.js';
import { copy, httpRequest, chunk } from '../utils.js';

let fields = {
    "dec": document.getElementById("dec-eui"),
    "hex": document.getElementById("hex-eui"),
    "hex-colon": document.getElementById("hex-colon"),
    "rev-txt": document.getElementById("review-text-btn"),
    "unix-ts": document.getElementById("unix-ts"),
    "f-date": document.getElementById("f-date"),
    "b64-encoded": document.getElementById("b64-encoded"),
    "b64-decoded": document.getElementById("b64-decoded"),
    "url-encoded": document.getElementById("url-encoded"),
    "url-decoded": document.getElementById("url-decoded"),
    "raw-json": document.getElementById("raw-json"),
    "beaut-json": document.getElementById("beaut-json"),
    "copy-json": document.getElementById("copy-beaut-json-btn"),
    "myip": document.getElementById("myIpv4"),
    "ip-indicator": document.getElementById("ip-indicator"),
    "ipvalue": document.getElementById("myIpv4"),
    "cur-unix": document.getElementById("cur-unix")
};

document.addEventListener('DOMContentLoaded', function() {
    let storageKeys = [
        "showHexDec",
        "showUnixTime",
        "showBase64",
        "showBeautJson",
        "showUrl",
        "phabHost",
        "phabToggle",
        "showIp",
        "ignoreIpList"
    ]
    let currentURL = "";

    browser.storage.sync.get(storageKeys).then(results => {
        // Remove Phabricator related entries
        if (results.phabToggle === false) {
            document.getElementById("phab-section").remove();
            document.getElementById("phab-functions").remove();
        }

        // Remove disabled widgets
        let totalWidgets = 5;
        let removedWidgets = 0;
        if (results.showHexDec === false) {
            document.getElementById("hex-dec-container").remove();
            removedWidgets++;
        }
        if (results.showUnixTime === false) {
            document.getElementById("unix-time-container").remove();
            removedWidgets++;
        }
        if (results.showBase64 === false) {
            document.getElementById("base64-container").remove();
            removedWidgets++;
        }
        if (results.showBeautJson === false) {
            document.getElementById("beautify-json-container").remove();
            removedWidgets++;
        }
        if (results.showUrl === false) {
            document.getElementById("url-container").remove();
            removedWidgets++;
        }

        if (removedWidgets === totalWidgets) {
            document.getElementById("no-widgets-message").style.display = 'block';
        }

        // Show myIpv4 fields if chosen
        var ignoreIpList = "";
        delete results.ignoreIpList
        if (results.showIp === true) {
            if ('ignoreIpList' in results) {
                ignoreIpList = results.ignoreIpList;
            }

            document.getElementById("ip-container").style.visibility = "visible";
            handleIpRequest(ignoreIpList);
        }

        // Start listener for the copy review text button
        browser.tabs.query({ active:true, currentWindow:true})
        .then(tabs => {
            currentURL = new URL(tabs[0].url);

            if (currentURL.hostname == results.phabHost) {
                browser.tabs.executeScript({file: "/external/browser-polyfill.min.js"});
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
    getField("b64-decoded").addEventListener('keyup', encodeB64, true);
    getField("b64-encoded").addEventListener('keyup', decodeB64, true);
    getField("url-encoded").addEventListener('keyup', decodeUrl, true);
    getField("url-decoded").addEventListener('keyup', encodeUrl, true);
    getField("raw-json").addEventListener('keyup', beautifyJson, true);
    getField("copy-json").addEventListener('click', copyJson, true);
    getField("ipvalue").addEventListener('click', copyIp, true);
    getField("cur-unix").addEventListener('click', copyCurrUnix, true);
    setCurrUnix();
});

function handleIpRequest(ignoredIpList) {
    httpRequest("https://api.db-ip.com/v2/free/self")
    .then((d) => {
        let data = JSON.parse(d);
        let newIpv4 = data.ipAddress;
        let ignoredList = ignoredIpList.split(',');

        browser.storage.sync.get("ipv4").then(r => {
            if(!ignoredList.includes(newIpv4) && r.ipv4 != newIpv4) {
                browser.storage.sync.set({"ipv4": newIpv4})

                if(r.ipv4 != undefined) { // case where it's enabled for the first time
                    getField("ip-indicator").style.backgroundColor = "red";
                }
            }
        })

        getField("myip").innerHTML = newIpv4
    });
}

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
    hexToColonHex()
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
        if (!window.chrome) {
            browser.tabs.query({active: true, currentWindow: true})
            .then((tabs) => {
                browser.tabs.sendMessage(tabs[0].id, {
                    command: "copyReviewText",
                });
            })
            .catch(error => {
                console.log(`Error: ${error}`);
            })
        } else {
            chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
                chrome.tabs.sendMessage(tabs[0].id, {
                    command: "copyReviewText",
                });
            })
        }
    }, true);
}

function unixToDate() {
    let unixTs = getField("unix-ts").value;
    if (unixTs === "") {
        getField("f-date").value = "";
        return ;
    }

    let date = new Date(unixTs * 1000).toISOString().replace('Z', '');
    getField("f-date").value = date;
}

function dateToUnix() {
    let dateString = getField("f-date").value;
    if (dateString === "") {
        getField("unix-ts").value = "";
        return ;
    }

    if (dateString.slice(-1) != 'Z') {
        dateString += 'Z';
    }

    let dateObject = new Date(dateString);
    getField("unix-ts").value = dateObject.getTime() / 1000;
}

function decodeB64() {
    let b64Text = getField('b64-encoded').value;
    if (b64Text === "") {
        getField('b64-decoded').value = "";
        return ;
    }

    getField('b64-decoded').value = atob(b64Text);
}

function encodeB64() {
    let ascText = getField('b64-decoded').value;
    if (ascText === "") {
        getField('b64-encoded').value = "";
        return ;
    }

    getField('b64-encoded').value = btoa(ascText);
}

function decodeUrl() {
    let encUrl = getField('url-encoded').value;
    if (encUrl === "") {
        getField('url-decoded').value = "";
        return ;
    }

    getField('url-decoded').value = decodeURIComponent(encUrl);
}

function encodeUrl() {
    let urlText = getField('url-decoded').value;
    if (urlText === "") {
        getField('url-encoded').value = "";
        return ;
    }

    getField('url-encoded').value = encodeURIComponent(urlText);
}

function beautifyJson() {
    let rawJson = getField('raw-json').value;
    if (rawJson === "") {
        getField('beaut-json').innerHTML = "output will appear here";
        return ;
    }

    // '1637823600': {'avg_value': -1539, 'max_value': -15052, 'min_value': -1573}
    if (rawJson[0] !== '{') {rawJson = '{' + rawJson}
    if (rawJson[rawJson.length-1] !== '}') {rawJson = rawJson + '}'}
    const openingBrackets = rawJson.match(/{/g).length;
    const closingBrackets = rawJson.match(/}/g).length;

    if (openingBrackets > closingBrackets) {
        rawJson = rawJson + '}'.repeat(openingBrackets-closingBrackets);
    }

    try {
        var str = JSON.stringify(JSON.parse(rawJson.replaceAll("'", '"')), null, 2);
    } catch (e) {
        getField('beaut-json').innerHTML = str;
    }

    getField('beaut-json').innerHTML = str;
}

function copyIp() {
    let ip = getField('ipvalue').innerHTML;
    copy(ip);
}

function copyCurrUnix() {
    let unix = getField('cur-unix').innerHTML;
    copy(unix);
}

function setCurrUnix() {
    let currUnix = getField('cur-unix');
    currUnix.innerHTML = Math.floor(Date.now() / 1000);
}

function copyJson() {
    let beautJson = getField("beaut-json").innerHTML;
    copy(JSON.stringify(JSON.parse(beautJson), null, "\t")); // Copy tabbed version
}

function getField(field) {
    return fields[field];
}


