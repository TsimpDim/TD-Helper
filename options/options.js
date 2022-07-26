function saveOptions(e) {
    e.preventDefault();

    let objToSet = {
        showHexDec: document.getElementById("showhexdec-toggle").checked,
        showUnixTime: document.getElementById("showunixtime-toggle").checked,
        showBase64: document.getElementById("showbase64-toggle").checked,
        showUrl: document.getElementById("showurl-toggle").checked,
        showBeautJson: document.getElementById("showbeautjson-toggle").checked,
        ytHost: document.getElementById("yt-host").value,
        phabHost: document.getElementById("phab-host").value,
        phabToggle: document.getElementById("phab-toggle").checked,
        showIp: document.getElementById("showip-toggle").checked,
        ignoreIpList: document.getElementById("ignore-ip-list").value,
        highlightingToggle: document.getElementById("highlighting-toggle").checked,
        widgetDuration: document.getElementById("widget-duration").value,
        widgetOverlap: document.getElementById("widget-overlap").checked,
        languageTranslation: document.getElementById("language-translation").checked,
        languageConfiguration: document.getElementById("language-configuration").value,
        toGoogle: document.getElementById("to-google").checked
    }

    if (!window.chrome) {
        browser.storage.sync.set(objToSet);
    } else {
        chrome.storage.sync.set(objToSet);
    }
}

function restoreOptions() {

    function setCurrentChoice(result) {
        let defaultLanguageConfig = {
            'english': {
                'languageCode': 'en',
                'displayText': '2E',
                'sourceLanguage': 'german'
            },
            'german': {
                'languageCode': 'de',
                'displayText': '2G',
                'sourceLanguage': 'english'
            }
        }

        document.getElementById("showhexdec-toggle").checked = result.showHexDec ?? true;
        document.getElementById("showunixtime-toggle").checked = result.showUnixTime ?? true;
        document.getElementById("showbase64-toggle").checked = result.showBase64 ?? true;
        document.getElementById("showurl-toggle").checked = result.showUrl ?? true;
        document.getElementById("showbeautjson-toggle").checked = result.showBeautJson ?? true;
        document.getElementById("yt-host").value = result.ytHost || "jetbrains.com";
        document.getElementById("phab-host").value = result.phabHost || "phabricator.org";
        document.getElementById("phab-toggle").checked = result.phabToggle ?? false;
        document.getElementById("showip-toggle").checked = result.showIp ?? false;
        document.getElementById("highlighting-toggle").checked = result.highlightingToggle ?? true;
        document.getElementById("widget-duration").value = result.widgetDuration || 1500;
        document.getElementById("widget-overlap").checked = result.widgetOverlap ?? false;
        document.getElementById("language-translation").checked = result.languageTranslation ?? false;
        document.getElementById("language-configuration").value = result.languageConfiguration || JSON.stringify(defaultLanguageConfig);
        document.getElementById("to-google").checked = result.toGoogle ?? false;
    }

    function onError(error) {
        console.log(`Error: ${error}`);
    }

    let storageKeys = [
        "showHexDec", "showUnixTime", "showBase64", "showBeautJson",
        "showUrl","ytHost", "phabHost", "phabToggle",
        "showIp", "ignoreIpList", "highlightingToggle",
        "widgetOverlap", "widgetDuration",
        "languageTranslation", "languageConfiguration", "toGoogle"
    ];

    if (!window.chrome) {
        browser.storage.sync.get(storageKeys)
            .then(setCurrentChoice, onError);
    } else {
        chrome.storage.sync.get(storageKeys, setCurrentChoice)
    }
}

document.addEventListener("DOMContentLoaded", function () {
    restoreOptions();
    document.querySelector("form").addEventListener("submit", saveOptions);
});
