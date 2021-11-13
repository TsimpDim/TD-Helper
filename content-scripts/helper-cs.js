function copyReviewText() {
    let storageKeys = ["ytHost"]
    browser.storage.sync.get(storageKeys)
    .then(r => {
        let finalText = getReviewText(r);

        if (!window.chrome) {
            navigator.clipboard.writeText(finalText)
            .then(() => {
                console.log("Link copied to clipboard.");
            })
            .catch(e => {console.log(e)});
        } else {
            self.hardcoreCopy(finalText);
        }
    });
}

function getReviewText(r) {
    let pageTitle = document.title;
    let issueIDMatches = new RegExp(/\w+-\d+/).exec(pageTitle);
    let issueID = "";
    if (issueIDMatches && issueIDMatches.length != 0) issueID = issueIDMatches[0];

    let issueTitle = "";
    let issueTitleGroups = new RegExp(/\w+-\d+ (.*)/).exec(pageTitle);
    if (issueTitleGroups && issueTitleGroups.length != 0) issueTitle = issueTitleGroups[1];

    let diffURL = window.location.href;
    let diffID = "";
    let diffIDMatches = new RegExp(/\w+\d+/).exec(pageTitle);
    if (diffIDMatches && diffIDMatches.length != 0) diffID = diffIDMatches[0];

    let issueURL = `https://${r.ytHost}/youtrack/issue/${issueID}`;
    let finalText = `[${diffID}](${diffURL}) | [${issueID}](${issueURL}) "${issueTitle}"`;
    return finalText
}

browser.runtime.onMessage.addListener(message => {
    if (message.command === "copyReviewText") {
        copyReviewText(message.beastURL);
    }
});

function hardcoreCopy(text) {
    const ta = document.createElement('textarea');
    ta.style.cssText = 'opacity:0; position:fixed; width:1px; height:1px; top:0; left:0;';
    ta.value = text;
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    document.execCommand('copy');
    ta.remove();
}