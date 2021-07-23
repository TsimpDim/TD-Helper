function saveOptions(e) {
    e.preventDefault();

    let objToSet = {
        ytHost: document.getElementById("yt-host").value,
        phabHost: document.getElementById("phab-host").value,
        phabToggle: document.getElementById("phab-toggle").checked
    }
    
    if (!window.chrome) {
        browser.storage.sync.set(objToSet);
    } else {
        chrome.storage.sync.set(objToSet);
    }
}

function restoreOptions() {

    function setCurrentChoice(result) {
        document.getElementById("yt-host").value = result.ytHost || "jetbrains.com";
        document.getElementById("phab-host").value = result.phabHost || "phabricator.org";
        document.getElementById("phab-toggle").checked = result.phabToggle || false;
    }

    function onError(error) {
        console.log(`Error: ${error}`);
    }

    let storageKeys = ["ytHost", "phabHost", "phabToggle"];

    if (!window.chrome) {
        browser.storage.sync.get(storageKeys)
        .then(setCurrentChoice, onError);
    } else {
        chrome.storage.sync.get(storageKeys, setCurrentChoice)
    }
}

document.addEventListener("DOMContentLoaded", function() {
    restoreOptions();
    document.querySelector("form").addEventListener("submit", saveOptions);
});
