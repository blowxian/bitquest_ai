interface UrlTemplate {
    type: string;
    template: string;
}

interface Query {
    title: string;
    totalResults: string;
    searchTerms: string;
    count: number;
    startIndex: number;
    inputEncoding: string;
    outputEncoding: string;
    safe: string;
    cx: string;
}

interface Queries {
    request: Query[];
    nextPage?: Query[];
}

interface Context {
    title: string;
}

interface SearchInformation {
    searchTime: number;
    formattedSearchTime: string;
    totalResults: string;
    formattedTotalResults: string;
}

interface Item {
    kind: string;
    title: string;
    htmlTitle: string;
    link: string;
    displayLink: string;
    snippet: string;
    htmlSnippet: string;
    cacheId: string;
    formattedUrl: string;
    htmlFormattedUrl: string;
    pagemap: {
        hcard?: {
            fn: string;
            nickname: string;
            category: string;
        }[];
        metatags?: {
            referrer: string;
            ogImage: string;
            themeColor: string;
            ogImageWidth: string;
            ogType: string;
            viewport: string;
            ogTitle: string;
            ogImageHeight: string;
            formatDetection: string;
        }[];
    };
}

export interface GoogleCustomSearchResponse {
    queries: Queries;
    items: Item[];
}
