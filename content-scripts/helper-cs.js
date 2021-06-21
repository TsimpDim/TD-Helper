function copyReviewText() {
    let pageTitle = document.title;
    browser.storage.sync.get(["ytIssuePre", "ytHost", "phabPre"]).then(r => {
        let issueIDMatches = new RegExp(`${r.ytIssuePre}-\\d+`).exec(pageTitle);
        let issueID = "";
        if (issueIDMatches && issueIDMatches.length != 0) issueID = issueIDMatches[0];

        let issueTitle = "";
        let issueTitleGroups = new RegExp(`${r.ytIssuePre}-\\d+ (.*)`).exec(pageTitle);
        if (issueTitleGroups && issueTitleGroups.length != 0) issueTitle = issueTitleGroups[1];

        let diffURL = window.location.href;
        let diffID = "";
        let diffIDMatches = new RegExp(`${r.phabPre}\\d+`).exec(pageTitle);
        if (diffIDMatches && diffIDMatches.length != 0) diffID = diffIDMatches[0];

        let issueURL = `https://${r.ytHost}/youtrack/issue/${issueID}`;
        let finalText = `[${diffID}](${diffURL} | [${issueID}](${issueURL}) ${issueTitle})`;

        navigator.clipboard.writeText(finalText)
        .then(() => {
            console.log("Link copied to clipboard.");
        })
        .catch(e => {console.log(e)});
    });
}


browser.runtime.onMessage.addListener(message => {
    if (message.command === "copyReviewText") {
        copyReviewText(message.beastURL);
    }
});