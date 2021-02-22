const getSearchResult = async (url, artist, trackname) => {
    let res = await fetch(url);
    let data = await res.json();
    let result_url = {notFound: 'No samples found for this track'};

    if (Array.isArray(data.tracks) && data.tracks.length > 0) {
        const track_url = checkResult(data.tracks, artist, trackname);
        if (track_url) {
            result_url = {res: track_url};
        }
    }

    return result_url;
};

const checkResult = (data, artist, trackname) => {
    let url = false;
    data.map(e => {
        e.artist_name = textProcessing(e.artist_name, true);

        if (e.artist_name.toLowerCase() === artist.toLowerCase()) {
            e.track_name.replace((/[',\s]/g, ''));
            e.track_name = textProcessing(e.track_name);
            trackname.replace((/[',\s]/g, ''));

            if (e.track_name.toLowerCase() === trackname.toLowerCase()) {
                url = e.url;
            }
        }
    });
    return url;
};

const textProcessing = (text, artist = false) => {
    if (text.includes('(')) {
        return text.substring(0, text.indexOf('(')).trim();
    } else if (text.includes('feat')) {
        return text.substring(0, text.indexOf('feat')).trim();
    } else if (artist && text.includes('and')) {
        return text.substring(0, text.indexOf('and')).trim();
    } else {
        return text;
    }
};

const getSamples = async url => {
    let res = await fetch(url);
    let html = await res.text();

    let samples = [];
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    const smplSection = doc.querySelector('#content > div > div.leftContent > section:nth-child(6)');
    const smplHeader = smplSection.querySelector('.section-header-title').textContent;

    if (smplHeader.includes('Contains samples')) {
        const samplesList = smplSection.querySelectorAll('.sampleEntry');
        samplesList.forEach(sample => {
            let sampleData = {};
            sampleData['artist'] = sample.querySelector('.trackArtist a').textContent;
            sampleData['title'] = sample.querySelector('.trackName.playIcon').textContent;
            sampleData['element'] = sample.querySelector('.trackBadge .topItem').textContent;
            sampleData['link'] = sample.querySelector('.trackName.playIcon').getAttribute('href');

            samples.push(sampleData);
        });

        return samples;
    } else {
        return {notFound: 'No samples found for this track'};
    }
};

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.artist && request.trackname) {
        const query = request.artist.concat(' ', request.trackname);
        const url = `https://www.whosampled.com/ajax/search/?q=${encodeURI(query)}&_=`;

        getSearchResult(url, request.artist, request.trackname).then(data => {
            if (data.res) {
                getSamples(`https://www.whosampled.com${data.res}`).then(samples => {
                    sendResponse(samples);
                });
            } else if (data.notFound) {
                sendResponse(data);
            }
        });
    }
    return true;
});
