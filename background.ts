'use strict';
const HTMLparser = require('node-html-parser');
import { SampleData, ServiceWorkerMessage } from './samplify'

interface Track {
    artist_name: string;
    counts: string;
    id: number;
    image_url: string;
    track_name: string;
    url: string;
}

const getSearchResult = async (url: string, artist: string, trackname: string): Promise<object> => {
    // Search for samples on WhoSampled.com
    let res = await fetch(url);
    let data = await res.json();
    let result_url: object = { notFound: 'No samples found for this track' };

    if (Array.isArray(data.tracks) && data.tracks.length > 0) {
        const track_url: boolean | string = checkResult(data.tracks, artist, trackname);

        if (track_url) {
            result_url = { res: track_url };
        }
    }

    return result_url;
};

const checkResult = (data: Track[], artist: string, trackname: string): boolean | string => {
    let url: boolean | string = false;

    data.some(e => {
        const artistRegExp = new RegExp(escapeRegEx(artist).toLowerCase());
        if (artistRegExp.test(e.artist_name.toLowerCase())) {
            e.track_name = e.track_name.replace(/[',\s]/g, '');
            trackname = trackname.replace(/[',\s]/g, '');

            const tracknameRegExp = new RegExp(escapeRegEx(trackname).toLowerCase());
            if (tracknameRegExp.test(e.track_name.toLowerCase())) {
                url = e.url;
                return true;
            }
        }
    });

    return url;
};

const getSamples = async (url: string): Promise<object | SampleData> => {
    // Get the list of samples
    let res = await fetch(url);
    let html = await res.text();

    let samples: Partial<SampleData[]> = [];
    const doc = HTMLparser.parse(html);

    const smplSection = doc.querySelector('#content > div > div.leftContent > section:nth-child(6)');

    if (smplSection != null) {
        const smplHeader = smplSection.querySelector('.section-header-title');

        if (smplHeader !== null && smplHeader.textContent.includes('Contains samples')) {
            const samplesList: HTMLElement[] = smplSection.querySelectorAll('.sampleEntry');
            samplesList.forEach((sample: HTMLElement) => {
                let sampleData: SampleData = {
                    artist: sample.querySelector('.trackArtist a')?.textContent,
                    title: sample.querySelector('.trackName.playIcon')?.textContent,
                    element: sample.querySelector('.trackBadge .topItem')?.textContent,
                    link: sample.querySelector('.trackName.playIcon')?.getAttribute('href'),
                }
                samples.push(sampleData);
            });

            return samples;
        }
    }

    return { notFound: 'No samples found for this track' };
};


const escapeRegEx = (str: string): string => {
    return str.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&').replace(/-/g, '\\x2d');
};

chrome.runtime.onMessage.addListener((request, sender, sendResponse): boolean => {
    // Search for samples and send the result to the content script
    if (request.artist && request.trackname) {
        const query: string = request.artist.concat(' ', request.trackname);
        const url: string = `https://www.whosampled.com/ajax/search/?q=${encodeURI(query)}&_=`;

        getSearchResult(url, request.artist, request.trackname).then((data: ServiceWorkerMessage) => {
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
