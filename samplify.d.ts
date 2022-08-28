export interface SampleData {
    artist: string | null | undefined;
    title: string | null | undefined;
    element: string | null | undefined;
    link: string | null | undefined;
}

export interface ServiceWorkerMessage {
    res?: string,
    notFound?: string,
}
