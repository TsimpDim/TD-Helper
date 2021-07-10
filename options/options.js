function saveOptions(e) {
    e.preventDefault();

    let objToSet = {
        ytHost: document.getElementById("yt-host").value,
        ytIssuePre: document.getElementById("yt-issue-pre").value,
        phabHost: document.getElementById("phab-host").value,
        phabPre: document.getElementById("phab-pre").value
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
        document.getElementById("yt-issue-pre").value = result.ytIssuePre || "AB";
        document.getElementById("phab-host").value = result.phabHost || "phabricator.org";
        document.getElementById("phab-pre").value = result.phabPre || "D";
    }

    function onError(error) {
        console.log(`Error: ${error}`);
    }

    let storageKeys = ["ytHost", "ytIssuePre", "phabHost", "phabPre"];

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
