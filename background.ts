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
 * @param spotifyId
 */
const getSearchResult = async (query: string, spotifyId: string): Promise<object> => {
    let response = await fetchService(`search-track/?q=${query}&offset=0&format=json`)
    let result_url: object = { notFound: 'No samples found for this track' };

    if(!response.error && response.objects.length !== 0){
        const trackId: boolean | string = checkSearchResult(response.objects, spotifyId);

        if (trackId) {
            result_url = { res: trackId };
        }
    }

    return result_url;
};

/**
 *
 * @param data
 * @param spotifyId
 */
const checkSearchResult = (data: Track[], spotifyId: string): boolean | string => {
    let trackId: boolean | number = false;

    data.some(track => {
        if (track.spotify_id == spotifyId) {
            trackId = track.id;
        }
    });

    return trackId;
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

/**
 * Search for samples and send the result to the content script
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.artist && request.trackname && request.spotifyId) {
        const query: string = request.artist.concat(' ', request.trackname);

        getSearchResult(query, request.spotifyId).then((data: ServiceWorkerMessage) => {
            if (data.res) {
                getSamples(data.res).then(samples => {
                    sendResponse(samples);
                });
            } else if (data.notFound) {
                sendResponse(data);
            }
        })
    }
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
}).then(r => {})
