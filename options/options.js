function saveOptions(e) {
    e.preventDefault();
    let objToSet = {}
    optionsData.options.forEach(option => {
        const domEl = document.getElementById(option.htmlId);
        if (option.type === "string") {
            objToSet[option.property] = domEl.value;
        } else if (option.type === "boolean") {
            objToSet[option.property] = domEl.checked;
        }
    });

    if (!window.chrome) {
        browser.storage.sync.set(objToSet);
    } else {
        chrome.storage.sync.set(objToSet);
    }
}

function restoreOptions() {

    function setCurrentChoice(result) {

        optionsData.options.forEach(option => {
            let value = result[option.property];
            if (!value) {
                value = option.default
            }

            if (option.type === "string") {
                if (option.containsJson === true) {
                    value = JSON.stringify(option.default);
                }

                document.getElementById(option.htmlId).value = value;
            } else if (option.type === "boolean") {
                document.getElementById(option.htmlId).checked = value;
            }
        });
    }

    function onError(error) {
        console.log(`Error: ${error}`);
    }

    let storageKeys = optionsData.options.map(o => {
        return o.property;
    });

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
