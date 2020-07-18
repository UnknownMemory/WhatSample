chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.getSample) {
        const url = `https://www.whosampled.com/ajax/search/?q=${encodeURI(request.getSample)}&_=`;
        fetch(url)
            .then((response) => response.json())
            .then((data) => {
                sendResponse(data.tracks);
            });
        return true;
    }
});
