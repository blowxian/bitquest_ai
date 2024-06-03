interface SearchResult {
    title: string;
    link: string;
    snippet: string;
    source: string;  // Adding 'source' here to match the normalized data structure
}

export interface SearchResponse {
    items: SearchResult[];
    nextPageToken: string | null;  // Replacing 'queries' with a simpler 'nextPageToken'
}