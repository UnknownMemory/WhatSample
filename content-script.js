let artist;
let trackname;

const setButton = () => {
    if (document.querySelector('#sampled-track')) {
        return;
    } else {
        const spotifySampled = document.createElement('div');
        spotifySampled.id = 'spotify-sampled';

        const sampled = document.createElement('div');
        sampled.id = 'sampled-track';

        /* Insert the button to the player */
        const extra = document.querySelector('.ExtraControls');
        extra.prepend(spotifySampled);

        /* Add an icon to the button */
        const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        icon.setAttributeNS(null, 'viewBox', '0 0 24 24');
        icon.setAttributeNS(null, 'fill', '#b3b3b3');
        icon.setAttributeNS(null, 'width', '18px');
        icon.setAttributeNS(null, 'height', '18px');

        const path1 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path1.setAttributeNS(null, 'd', 'M0 0h24v24H0z');
        path1.setAttributeNS(null, 'fill', 'none');
        icon.append(path1);

        const path2 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path2.setAttributeNS(
            null,
            'd',
            'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 14.5c-2.49 0-4.5-2.01-4.5-4.5S9.51 7.5 12 7.5s4.5 2.01 4.5 4.5-2.01 4.5-4.5 4.5zm0-5.5c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1z'
        );
        icon.append(path2);
        sampled.append(icon);
        spotifySampled.append(sampled);

        /* Add sample list container*/
        const sampleList = document.createElement('div');
        sampleList.id = 'sample-list';

        const h4 = document.createElement('h4');
        h4.textContent = 'Samples';
        sampleList.append(h4);

        sampled.append(sampleList);
        sampled.addEventListener('click', () => {
            document.querySelector('#sample-list').classList.toggle('is-visible');
        });

        document.addEventListener('click', e => {
            const sampleList = document.querySelector('#sample-list');
            if (e.target.closest('#sample-list') == null && e.target.closest('#sampled-track') == null) {
                sampleList.classList.remove('is-visible');
            }
        });

        return;
    }
};

const setSample = response => {
    const list = document.createElement('ul');
    list.className = 'samples-list';
    const smplList = document.querySelector('#sample-list');
    smplList.append(list);

    response.forEach(e => {
        const sampleDetails = document.createElement('li');
        sampleDetails.className = 'sample-details';

        const sampleSong = document.createElement('a');
        sampleSong.className = 'sample-song';
        sampleSong.href = `https://www.whosampled.com${e.link}`;
        sampleSong.setAttribute('target', '_blank');

        const sampleSongInfo = document.createElement('div');
        sampleSongInfo.className = 'sample-song-info';
        sampleSong.append(sampleSongInfo);

        const sampleSongTitle = document.createElement('div');
        sampleSongTitle.className = 'sample-song-title';
        sampleSongTitle.textContent = `${e.artist} - ${e.title}`;
        sampleSongInfo.append(sampleSongTitle);

        const sampleSongElement = document.createElement('div');
        sampleSongElement.className = 'sample-song-element';
        sampleSongElement.textContent = e.element;
        sampleSongInfo.append(sampleSongElement);

        sampleDetails.append(sampleSong);

        list.append(sampleDetails);
    });
};

const setError = data => {
    const nfElement = document.createElement('div');
    nfElement.className = 'samples-not-found';
    nfElement.textContent = data;

    const smplList = document.querySelector('#sample-list');
    smplList.append(nfElement);
};

const getSample = () => {
    artist = document.querySelector('.b6d18e875efadd20e8d037931d535319-scss a').textContent;
    trackname = textProcessing(document.querySelector('a[data-testid=nowplaying-track-link]').textContent);

    chrome.runtime.sendMessage({artist: artist, trackname: trackname}, response => {
        const queryS = document.querySelector('#sample-list > ul');
        const prevList = queryS !== null ? queryS : document.querySelector('#sample-list > div');

        if (prevList) {
            prevList.remove();
        }

        if (response.notFound) {
            setError(response.notFound);
        } else {
            setSample(response);
        }
    });

    return;
};

const textProcessing = trackname => {
    if (trackname.includes('(')) {
        return trackname.substring(0, trackname.indexOf('(')).trim();
    }
    return trackname;
};

const songObs = () => {
    const target = document.querySelector('.now-playing');
    const config = {characterData: true, subtree: true};
    const observer = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
            getSample();
        });
    });

    observer.observe(target, config);
};

(() => {
    const target = document.body;
    const config = {childList: true, subtree: true};
    const observer = new MutationObserver((mutations, observer) => {
        if (document.querySelector('#main') && document.querySelector('.now-playing')) {
            setButton();

            observer.disconnect();
            return songObs();
        }
    });

    observer.observe(target, config);
})();
