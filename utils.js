export function httpRequest(url, method = 'GET'){
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open(method, url);
      xhr.onload = () => {
        if (xhr.status === 200) { resolve(xhr.responseText); }
        else { reject(new Error(xhr.responseText)); }
      };
      xhr.send();
    });
}

export function copy(text) {
    if (!window.chrome) {
        navigator.clipboard.writeText(text)
        .then(() => {
            console.log("Link copied to clipboard.");
        })
        .catch(e => {console.log(e)});
    } else {
        hardcoreCopy(text);
    }
}

export function chunk(str, n) {
    let ret = [];
    let i;
    let len;

    for(i = 0, len = str.length; i < len; i += n) {
       ret.push(str.substr(i, n))
    }

    return ret
};

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