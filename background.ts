'use strict';

import HTMLparser from 'node-html-parser';
import {SampleData, ServiceWorkerMessage, Track} from './samplify'
import {search} from "./data";


// const fetchService = async (url: string) => {
//     const rootURL: string = "https://www.whosampled.com/apimob/v1/"
//
//     const res = await fetch(rootURL+url, {
//         method: 'GET',
//         headers: {
//             'User-Agent': 'okhttp/4.9.3',
//             'Cookie': 'sessionid=""'
//         }
//     })
//
//     if(res.ok){
//         return res.json()
//     }
//
//     return {'error': 'An error occured during the request'}
// }

const getSearchResult = async (query: string, artist: string, trackname: string): Promise<object> => {
    // Search for samples on WhoSampled.com
    // let response = fetchService(`search-track/?q=${query}&offset=0&format=json`)
    let response = search
    let result_url: object = { notFound: 'No samples found for this track' };

    if(response.objects.length !== 0){
        const trackID: boolean | string = checkResult(response.objects, artist, trackname);

        if (trackID) {
            result_url = { res: trackID };
        }
    }

    return result_url;
};

const checkResult = (data: Track[], artist: string, trackName: string): boolean | string => {
    let trackID: boolean | number = false;

    data.some(e => {
        const artistRegExp = new RegExp(escapeRegEx(artist).toLowerCase());
        if (artistRegExp.test(e.full_artist_name.toLowerCase())) {
            e.track_name = e.track_name.replace(/[',\s]/g, '');
            trackName = trackName.replace(/[',\s]/g, '');

            const tracknameRegExp = new RegExp(escapeRegEx(trackName).toLowerCase());
            if (tracknameRegExp.test(e.track_name.toLowerCase())) {
                trackID = e.id;
                return true;
            }
        }
    });

    return trackID;
};

// const getSamples = async (url: string): Promise<object | SampleData> => {
//     // Get the list of samples
//     let res = await fetch(url);
//     let html = await res.text();
//
//     let samples: Partial<SampleData[]> = [];
//     const doc = HTMLparser.parse(html);
//
//     const smplSection = doc.querySelector('#content > div > div.leftContent > section:nth-child(6)');
//
//     if (smplSection != null) {
//         const smplHeader = smplSection.querySelector('.section-header-title');
//
//         if (smplHeader !== null && smplHeader.textContent.includes('Contains samples')) {
//             const samplesList: HTMLElement[] = smplSection.querySelectorAll('.sampleEntry');
//             samplesList.forEach((sample: HTMLElement) => {
//                 let sampleData: SampleData = {
//                     artist: sample.querySelector('.trackArtist a')?.textContent,
//                     title: sample.querySelector('.trackName.playIcon')?.textContent,
//                     element: sample.querySelector('.trackBadge .topItem')?.textContent,
//                     link: sample.querySelector('.trackName.playIcon')?.getAttribute('href'),
//                 }
//                 samples.push(sampleData);
//             });
//
//             return { res: samples };
//         }
//     }
//
//     return { notFound: 'No samples found for this track' };
// };


const escapeRegEx = (str: string): string => {
    return str.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&').replace(/-/g, '\\x2d');
};

chrome.runtime.onMessage.addListener((request, sender, sendResponse): boolean => {
    // Search for samples and send the result to the content script
    if (request.artist && request.trackname) {
        const query: string = request.artist.concat(' ', request.trackname);

        // getSearchResult(query, request.artist, request.trackname).then((data: ServiceWorkerMessage) => {
        //     if (data.res) {
        //         getSamples(`https://www.whosampled.com${data.res}`).then(samples => {
        //             sendResponse(samples);
        //         });
        //     } else if (data.notFound) {
        //         sendResponse(data);
        //     }
        // });
        getSearchResult(query, request.artist, request.trackname).then(data => {
            console.log(data)
        })
    }
    return true;
});
