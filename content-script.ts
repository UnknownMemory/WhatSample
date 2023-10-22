'use strict';

import {SampleData, ServiceWorkerMessage} from './whatsample'

let artist: string = '';
let trackname: string = '';
let spotifyId: string = '';

const setButton = () => {
    // Insert Samplify on the Spotify player
    if (document.querySelector('#sampled-track')) {
        return;
    } else {
        const html: string = `<div id="samplify">
                        <div id="sampled-track">
                            <svg viewBox="0 0 32 32" fill="#b3b3b3" width="20px" height="20px">
                                <path d="M29.0712891,15.0410156C29.0512695,7.8505859,23.1874943,2,16,2C8.7924805,2,2.9287109,7.8632812,2.9287109,15.0712891  c0,7.0224609,5.706543,12.8818359,12.7202148,13.0625c0.0087891,0,0.0175781,0,0.0263672,0  c0.5405273,0,0.9853516-0.4306641,0.9990234-0.9746094c0.0141602-0.5517578-0.421875-1.0107422-0.9736328-1.0253906  c-5.9399414-0.1523438-10.7719727-5.1152344-10.7719727-11.0625C4.9287109,8.9667969,9.8955078,4,16,4  c6.0878906,0,11.0541992,4.9550781,11.0712891,11.046875c0.0014648,0.5507812,0.4487305,0.9970703,1,0.9970703  c0.0009766,0,0.0019531,0,0.0029297,0C28.6264648,16.0419922,29.0727539,15.59375,29.0712891,15.0410156z"/><path d="M22.7597656,14.2851562c0.0585938,0.5097656,0.4912109,0.8857422,0.9921875,0.8857422  c0.0380859,0,0.0766602-0.0019531,0.1157227-0.0068359c0.5483398-0.0625,0.9423828-0.5585938,0.8793945-1.1074219  C24.2363281,9.6132812,20.4760742,6.2617188,16,6.2617188c-0.5522461,0-1,0.4472656-1,1s0.4477539,1,1,1  C19.4594727,8.2617188,22.3657227,10.8515625,22.7597656,14.2851562z"/>
                                <path d="M9.1943359,15.0712891c0-0.5527344-0.4477539-1-1-1s-1,0.4472656-1,1c0,4.8554688,3.9501953,8.8056641,8.8056641,8.8056641  c0.5522461,0,1-0.4472656,1-1s-0.4477539-1-1-1C12.2475586,21.8769531,9.1943359,18.8242188,9.1943359,15.0712891z"/><path d="M20.25,15.0712891c0-2.34375-1.9067383-4.25-4.25-4.25s-4.25,1.90625-4.25,4.25s1.9067383,4.25,4.25,4.25  S20.25,17.4150391,20.25,15.0712891z M16,17.3212891c-1.2407227,0-2.25-1.0097656-2.25-2.25s1.0092773-2.25,2.25-2.25  s2.25,1.0097656,2.25,2.25S17.2407227,17.3212891,16,17.3212891z"/>
                                <path d="M21.7553711,30c1.8720703,0,3.3950195-1.5224609,3.3950195-3.3945312v-6.78125  c1.2138672,0.4941406,2.246582,0.1123047,2.8579102-0.2509766c0.4746094-0.2832031,0.6298828-0.8964844,0.3476562-1.3710938  s-0.8950195-0.6308594-1.3710938-0.3476562c-0.3144531,0.1865234-0.96875,0.5771484-2.0922852-0.6669922  c-0.2773438-0.3085938-0.7148438-0.4111328-1.1010742-0.2636719c-0.3862305,0.1484375-0.6411133,0.5195312-0.6411133,0.9335938  v8.7480469C23.1503906,27.3740234,22.5244141,28,21.7553711,28s-1.3945312-0.6259766-1.3945312-1.3945312  c0-0.7695312,0.6254883-1.3955078,1.3945312-1.3955078c0.5522461,0,1-0.4472656,1-1s-0.4477539-1-1-1  c-1.871582,0-3.3945312,1.5234375-3.3945312,3.3955078S19.8837891,30,21.7553711,30z"/>
                            </svg>
                            <div id="sample-list">
                                <h3>Samples</h3>
                            </div>
                        </div>
                      </div>`;

        const extra: HTMLElement | null = document.querySelector('.mwpJrmCgLlVkJVtWjlI1');
        extra?.insertAdjacentHTML('afterbegin', html);

        return;
    }
};

const setSample = (response: ServiceWorkerMessage['res']) => {
    // Add the list of samples to the DOM
    const e: HTMLElement | null = document.querySelector('#sample-list');
    e?.insertAdjacentHTML('beforeend', '<ul class="samples-list"></ul>');

    const list: HTMLElement | null = document.querySelector('.samples-list');

    if(Array.isArray(response)){
        response!.forEach((sample: SampleData) => {
            const fullTitle = `${sample.source_track.full_artist_name} - ${sample.source_track.track_name}`
            const html = `<li class="sample-details">
                        <a class="sample-song" href=https://www.whosampled.com/sample/${sample.id} target="_blank" title="${fullTitle}">
                            <div class="sample-song-info">
                                <div class="sample-song-title standalone-ellipsis-one-line">${fullTitle}</div>
                            </div>
                        </a>
                      </li>`;

            list?.insertAdjacentHTML('afterbegin', html);
        });
    }
    return;
};

/**
 * Display a message if no sample was found
 * @param response
 */
const setError = (response: string) => {
    const e: HTMLElement | null = document.querySelector('#sample-list');
    e?.insertAdjacentHTML('beforeend', `<div class="samples-not-found">${response}</div>`);
    return;
};

/**
 * Send the artist & track to the background script then pass the result to a callback function
 */
const getSample = () => {
    const newArtist: string = document.querySelector('a[data-testid=context-item-info-artist]')?.textContent!;
    const newTrack: string = textProcessing(document.querySelector('a[data-testid=context-item-link]')?.textContent!);
    const newSpotifyId: string = getSpotifyId(document.querySelector('a[data-testid=context-link]')?.getAttribute("href")!)

    if (trackname != newTrack || artist != newArtist || spotifyId != newSpotifyId) {
        const queryS: HTMLElement | null = document.querySelector('#sample-list > ul');
        const prevList: HTMLElement = queryS !== null ? queryS : document.querySelector('#sample-list > div')!;

        if (prevList) {
            prevList.remove();
        }

        artist = newArtist;
        trackname = textProcessing(newTrack);
        spotifyId = newSpotifyId

        chrome.runtime.sendMessage({ artist: artist, trackname: trackname, spotifyId: spotifyId }, (response: ServiceWorkerMessage) => {
            if (response.notFound) {
                setError(response.notFound);
            } else {
                setSample(response.res);
            }
        });
    }
};

const getSpotifyId = (url: string) => {
    const uri: string | null = new URLSearchParams(url).get('uri')
    if(uri){
        return uri.replace('spotify:track:', '')
    }

    return ''
}

const textProcessing = (trackname: string): string => {
    // filter the track
    if (trackname.includes('(')) {
        return trackname.substring(0, trackname.indexOf('(')).trim();
    }
    return trackname;
};

(() => {
    const target: HTMLElement = document.body;
    const config: object = { childList: true, subtree: true };
    const observer: MutationObserver = new MutationObserver((mutations, observer) => {
        if (document.querySelector('#main') && document.querySelector('footer')) {
            setButton();

            const e: HTMLElement | null = document.querySelector('#sampled-track');

            e?.addEventListener('click', () => {
                document.querySelector('#sample-list')?.classList.toggle('is-visible');
                if (document.querySelector('#sample-list')?.classList.contains('is-visible')) {
                    getSample();
                }
            });

            document.addEventListener('click', (e: MouseEvent) => {
                const sampleList: HTMLElement | null = document.querySelector('#sample-list');
                const element = e.target as HTMLElement

                if (element.closest('#sample-list') == null && element.closest('#sampled-track') == null) {
                    sampleList?.classList.remove('is-visible');
                }
            });

            observer.disconnect();
            return;
        }
    });

    observer.observe(target, config);
})();
