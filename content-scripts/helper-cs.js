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

function onVisibilityChange(callback) {
    // https://stackoverflow.com/a/38710376/8020959
    var visible = true;

    if (!callback) {
        throw new Error('no callback given');
    }

    function focused() {
        if (!visible) {
            callback(visible = true);
        }
    }

    function unfocused() {
        if (visible) {
            callback(visible = false);
        }
    }

    // Standards:
    if ('hidden' in document) {
        visible = !document.hidden;
        document.addEventListener('visibilitychange',
            function() {(document.hidden ? unfocused : focused)()});
    }
    if ('mozHidden' in document) {
        visible = !document.mozHidden;
        document.addEventListener('mozvisibilitychange',
            function() {(document.mozHidden ? unfocused : focused)()});
    }
    if ('webkitHidden' in document) {
        visible = !document.webkitHidden;
        document.addEventListener('webkitvisibilitychange',
            function() {(document.webkitHidden ? unfocused : focused)()});
    }
    if ('msHidden' in document) {
        visible = !document.msHidden;
        document.addEventListener('msvisibilitychange',
            function() {(document.msHidden ? unfocused : focused)()});
    }
    // IE 9 and lower:
    if ('onfocusin' in document) {
        document.onfocusin = focused;
        document.onfocusout = unfocused;
    }
    // All others:
    window.onpageshow = window.onfocus = focused;
    window.onpagehide = window.onblur = unfocused;
};

function isURL(str) {
    // https://stackoverflow.com/a/22648406/8020959
    var urlRegex = '^(?!mailto:)(?:(?:http|https|ftp)://)(?:\\S+(?::\\S*)?@)?(?:(?:(?:[1-9]\\d?|1\\d\\d|2[01]\\d|22[0-3])(?:\\.(?:1?\\d{1,2}|2[0-4]\\d|25[0-5])){2}(?:\\.(?:[0-9]\\d?|1\\d\\d|2[0-4]\\d|25[0-4]))|(?:(?:[a-z\\u00a1-\\uffff0-9]+-?)*[a-z\\u00a1-\\uffff0-9]+)(?:\\.(?:[a-z\\u00a1-\\uffff0-9]+-?)*[a-z\\u00a1-\\uffff0-9]+)*(?:\\.(?:[a-z\\u00a1-\\uffff]{2,})))|localhost)(?::\\d{2,5})?(?:(/|\\?|#)[^\\s]*)?$';
    var url = new RegExp(urlRegex, 'i');
    return str.length < 2083 && url.test(str);
}