function saveOptions(e) {
    e.preventDefault();
    browser.storage.sync.set({
        ytHost: document.getElementById("yt-host").value,
        ytIssuePre: document.getElementById("yt-issue-pre").value,
        phabHost: document.getElementById("phab-host").value,
        phabPre: document.getElementById("phab-pre").value
    });
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

    let storageGet = browser.storage.sync.get(["ytHost", "ytIssuePre", "phabHost", "phabPre"]);

    storageGet.then(setCurrentChoice, onError);
}

document.addEventListener("DOMContentLoaded", function() {
    restoreOptions();
    document.querySelector("form").addEventListener("submit", saveOptions);
});
