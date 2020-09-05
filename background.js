const getSearchResult = async (url) => {
    let res = await fetch(url);
    let data = await res.json();

    return data.tracks[0].url;
};

const getSamples = async (url) => {
    let res = await fetch(url);
    let html = await res.text();

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    return doc.documentElement.innerHTML;
};

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.getSample) {
        const url = `https://www.whosampled.com/ajax/search/?q=${encodeURI(request.getSample)}&_=`;

        getSearchResult(url).then((data) =>
            getSamples(`https://www.whosampled.com${data}`).then((html) => sendResponse(html))
        );
    }
    return true;
});
