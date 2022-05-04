'use strict';

let artist;
let trackname;

/**
 * Insert Samplify on the Spotify player
 */
const setButton = () => {
    if (document.querySelector('#sampled-track')) {
        return;
    } else {
        const html = `<div id="samplify">
                        <div id="sampled-track">
                            <svg viewBox="0 0 24 24" fill="#b3b3b3" width="18px" height="18px">
                                <path d="M0 0h24v24H0z" fill="none"></path>
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 
                                14.5c-2.49 0-4.5-2.01-4.5-4.5S9.51 7.5 12 7.5s4.5 2.01 4.5 4.5-2.01 4.5-4.5 
                                4.5zm0-5.5c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1z">
                                </path>
                            </svg>
                            <div id="sample-list">
                                <h4>Samples</h4>
                            </div>
                        </div>
                      </div>`;

        const extra = document.querySelector('footer > div > div:nth-child(3) > div');
        extra.insertAdjacentHTML('afterbegin', html);

        return;
    }
};

/**
 * Add the list of samples to the DOM
 * @param {Array} response Response from the background script
 */
const setSample = response => {
    const e = document.querySelector('#sample-list');
    e.insertAdjacentHTML('beforeend', '<ul class="samples-list"></ul>');

    const list = document.querySelector('.samples-list');
    response.forEach(sample => {
        const html = `<li class="sample-details">
                        <a class="sample-song" href=https://www.whosampled.com${sample.link} target="_blank">
                            <div class="sample-song-info">
                                <div class="sample-song-title">${sample.artist} - ${sample.title}</div>
                                <div class="sample-song-element">${sample.element}</div>
                            </div>
                        </a>
                      </li>`;

        list.insertAdjacentHTML('afterbegin', html);
    });

    return;
};

/**
 * Display a message if no sample was found
 * @param {string} response Response from the background script
 */
const setError = response => {
    const e = document.querySelector('#sample-list');
    e.insertAdjacentHTML('beforeend', `<div class="samples-not-found">${response}</div>`);
    return;
};

/**
 * Send the artist & track to the background script then pass the result to a callback function
 */
const getSample = () => {
    const newArtist = document.querySelector('a[data-testid=context-item-info-artist]').textContent;
    const newTrack = document.querySelector('a[data-testid=context-item-link]').textContent;

    if (trackname != newTrack || artist != newArtist) {
        const queryS = document.querySelector('#sample-list > ul');
        const prevList = queryS !== null ? queryS : document.querySelector('#sample-list > div');

        if (prevList) {
            prevList.remove();
        }

        artist = newArtist;
        trackname = textProcessing(newTrack);
        chrome.runtime.sendMessage({artist: artist, trackname: trackname}, response => {
            if (response.notFound) {
                setError(response.notFound);
            } else {
                setSample(response);
            }
        });

        return;
    }
};

/**
 * Filter the track
 * @param {string} trackname Current track
 * @returns {string}
 */
const textProcessing = trackname => {
    if (trackname.includes('(')) {
        return trackname.substring(0, trackname.indexOf('(')).trim();
    }
    return trackname;
};

(() => {
    const target = document.body;
    const config = {childList: true, subtree: true};
    const observer = new MutationObserver((mutations, observer) => {
        if (document.querySelector('#main') && document.querySelector('.Root__now-playing-bar')) {
            setButton();

            const e = document.querySelector('#sampled-track');
            e.addEventListener('click', () => {
                document.querySelector('#sample-list').classList.toggle('is-visible');
                if (document.querySelector('#sample-list').classList.contains('is-visible')) {
                    getSample();
                }
            });

            document.addEventListener('click', e => {
                const sampleList = document.querySelector('#sample-list');
                if (e.target.closest('#sample-list') == null && e.target.closest('#sampled-track') == null) {
                    sampleList.classList.remove('is-visible');
                }
            });

            observer.disconnect();
            return;
        }
    });

    observer.observe(target, config);
})();
