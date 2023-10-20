'use strict';

import {ServiceWorkerMessage, Track} from './whatsample'

const fetchService = async (url: string) => {
    const rootURL: string = "https://www.whosampled.com/apimob/v1/"

    const res = await fetch(rootURL+url, {
        method: 'GET',
        headers: {
            'cache': 'no-store',
            'User-Agent': 'okhttp/4.9.3'
        }
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
 * @param artist
 * @param trackname
 */
const getSearchResult = async (query: string, spotifyId: string, artist: string, trackname: string): Promise<object> => {
    let response = await fetchService(`search-track/?q=${query}&offset=0&format=json`)
    let result_url: object = { notFound: 'No samples found for this track' };

    if(response.objects.length !== 0){
        const trackId: boolean | string = checkSearchResult(response.objects, spotifyId, artist, trackname);

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
const checkSearchResult = (data: Track[], spotifyId: string, artist: string, trackname: string): boolean | string => {
    let trackId: boolean | number = false;

    data.some(track => {
        if (track.spotify_id == spotifyId || (track.full_artist_name.includes(artist) && track.track_name == trackname)) {
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

    return { notFound: 'No sample was found for this track' };
};

/**
 * Search for samples and send the result to the content script
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.artist && request.trackname && request.spotifyId) {
        const query: string = request.artist.concat(' ', request.trackname);

        getSearchResult(query, request.spotifyId, request.artist, request.trackname).then((data: ServiceWorkerMessage) => {
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
