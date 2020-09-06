const getSearchResult = async (url) => {
    let res = await fetch(url);
    let data = await res.json();

    return data.tracks[0].url;
};

const getSamples = async (url) => {
    let res = await fetch(url);
    let html = await res.text();

    let samples = [];
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    const smplSection = doc.querySelector('#content > div > div.layout-container.leftContent > section:nth-child(7)');
    const samplesList = smplSection.querySelectorAll('.sampleEntry');
    samplesList.forEach((sample) => {
        let sampleData = {};
        sampleData['artist'] = sample.querySelector('.trackArtist a').textContent;
        sampleData['title'] = sample.querySelector('.trackName.playIcon').textContent;
        sampleData['cover'] = sample.querySelector('a img').getAttribute('src');
        sampleData['element'] = sample.querySelector('.trackBadge .topItem').textContent;
        sampleData['genre'] = sample.querySelector('.trackBadge .bottomItem').textContent;
        sampleData['link'] = sample.querySelector('.trackName.playIcon').getAttribute('href');

        samples.push(sampleData);
    });

    return samples;
};

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.getSample) {
        const url = `https://www.whosampled.com/ajax/search/?q=${encodeURI(request.getSample)}&_=`;

        getSearchResult(url).then((data) => {
            getSamples(`https://www.whosampled.com${data}`).then((samples) => {
                sendResponse(samples);
            });
        });
    }
    return true;
});
