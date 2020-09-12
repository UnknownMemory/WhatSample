const getSearchResult = async (url) => {
    let res = await fetch(url);
    let data = await res.json();

    if (Array.isArray(data.tracks) && data.tracks.length > 0) {
        return {res: data.tracks[0].url};
    } else {
        return {notfound: 'No samples found for this track'};
    }
};

const getSamples = async (url) => {
    let res = await fetch(url);
    let html = await res.text();

    let samples = [];
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    const smplSection = doc.querySelector('#content > div > div.layout-container.leftContent > section:nth-child(7)');
    const smplHeader = smplSection.querySelector('.section-header-title').textContent;

    if (smplHeader.includes('Contains samples')) {
        const samplesList = smplSection.querySelectorAll('.sampleEntry');
        samplesList.forEach((sample) => {
            let sampleData = {};
            sampleData['artist'] = sample.querySelector('.trackArtist a').textContent;
            sampleData['title'] = sample.querySelector('.trackName.playIcon').textContent;
            sampleData['element'] = sample.querySelector('.trackBadge .topItem').textContent;
            sampleData['link'] = sample.querySelector('.trackName.playIcon').getAttribute('href');

            samples.push(sampleData);
        });

        return samples;
    } else {
        return {notfound: 'No samples found for this track'};
    }
};

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.getSample) {
        const url = `https://www.whosampled.com/ajax/search/?q=${encodeURI(request.getSample)}&_=`;

        getSearchResult(url).then((data) => {
            if (data.res) {
                getSamples(`https://www.whosampled.com${data.res}`).then((samples) => {
                    sendResponse(samples);
                });
            } else if (data.notfound) {
                sendResponse(data);
            }
        });
    }
    return true;
});
