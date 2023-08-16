'use strict';

import {SampleData, ServiceWorkerMessage, Track} from './whatsample'

const fetchService = async (url: string) => {
    const rootURL: string = "https://www.whosampled.com/apimob/v1/"

    const res = await fetch(rootURL+url, {
        method: 'GET',
    })

    if(res.ok){
        return res.json()
    }

    return {'error': 'An error occured during the request'}
}

/**
 * Search the track on WhoSampled.com
 * @param query
 * @param artist
 * @param trackname
 */
const getSearchResult = async (query: string, artist: string, trackname: string): Promise<object> => {
    let response = await fetchService(`search-track/?q=${query}&offset=0&format=json`)
    let result_url: object = { notFound: 'No samples found for this track' };

    if(response.objects &&  response.objects.length !== 0){
        const trackID: boolean | string = checkResult(response.objects, artist, trackname);

        if (trackID) {
            result_url = { res: trackID };
        }
    }

    return result_url;
};

/**
 *
 * @param data
 * @param artist
 * @param trackName
 */
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

/**
 * Get the list of samples
 * @param trackID
 */
const getSamples = async (trackID: string | object[]): Promise<object> => {
    let response = await fetchService(`track/${trackID}/?format=json`)

    if(response.sample_count > 0){
        let samples = await fetchService(`track-samples/?dest_track=${trackID}&format=json`)
        return {res: samples.objects}
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

        getSearchResult(query, request.artist, request.trackname).then((data: ServiceWorkerMessage) => {
            if (data.res) {
                getSamples(data.res).then(samples => {
                    sendResponse(samples);
                });
            } else if (data.notFound) {
                sendResponse(data);
            }
        })
    }
    return true;
});

chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: [123],
    addRules: [{
        "id": 123,
        "action": {
            "type": chrome.declarativeNetRequest.RuleActionType.MODIFY_HEADERS,
            "requestHeaders": [{
                "header": "User-Agent",
                "operation": chrome.declarativeNetRequest.HeaderOperation.SET,
                "value": "okhttp/4.9.3"
            },
            {
                "header": "Cookie",
                "operation": chrome.declarativeNetRequest.HeaderOperation.SET,
                "value": "sessionid=''"
            },
            ]
        },
        "condition": {
            "urlFilter": "||www.whosampled.com/apimob/*",
            //@ts-ignore
            "resourceTypes": ["xmlhttprequest"]
        }
    }
    ]
})
