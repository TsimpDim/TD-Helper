function saveOptions(e) {
    e.preventDefault();

    let objToSet = {
        ytHost: document.getElementById("yt-host").value,
        phabHost: document.getElementById("phab-host").value,
        phabToggle: document.getElementById("phab-toggle").checked,
        showIp: document.getElementById("showip-toggle").checked,
        ignoreIpList: document.getElementById("ignore-ip-list").value,
        languageTranslation: document.getElementById("language-translation").checked,
        languageConfiguration: document.getElementById("language-configuration").value
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
            'german': {
                'languageCode': 'de',
                'displayText': '2G',
                'sourceLanguage': 'english'
            },
            'english': {
                'languageCode': 'en',
                'displayText': '2E',
                'sourceLanguage': 'german'
            }
        }

        document.getElementById("yt-host").value = result.ytHost || "jetbrains.com";
        document.getElementById("phab-host").value = result.phabHost || "phabricator.org";
        document.getElementById("phab-toggle").checked = result.phabToggle || false;
        document.getElementById("showip-toggle").checked = result.showIp || false;
        document.getElementById("language-translation").checked = result.languageTranslation || false;
        document.getElementById("language-configuration").value = result.languageConfiguration || JSON.stringify(defaultLanguageConfig);
    }

    function onError(error) {
        console.log(`Error: ${error}`);
    }

    let storageKeys = [
        "ytHost", "phabHost", "phabToggle",
        "showIp", "ignoreIpList", "languageTranslation",
        "languageConfiguration"
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
