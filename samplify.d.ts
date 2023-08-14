export interface SampleData {
    artist: string | null | undefined;
    title: string | null | undefined;
    element: string | null | undefined;
    link: string | null | undefined;
}

export interface ServiceWorkerMessage {
    res?: SampleData[],
    notFound?: string,
}

interface Track {
    "full_artist_name": string,
    "id": number,
    "label": string
    "large_image_url": string,
    "medium_image_url": string,
    "release_name": string,
    "release_year": string,
    "small_image_url": string,
    "spotify_id": string,
    "spotify_id_verified": boolean,
    "track_name": string;
}