export type LoadType = 'TRACK_LOADED' | 'PLAYLIST_LOADED' | 'SEARCH_RESULT' | 'NO_MATCHES' | 'LOAD_FAILED';

export interface Track {
    encoded: string;
    info: TrackInfo;
    pluginInfo: Record<string, unknown>;
}

export interface TrackInfo {
    identifier: string;
    isSeekable: boolean;
    author: string;
    length: number;
    isStream: boolean;
    position: number;
    title: string;
    uri?: string;
    sourceName: string;
}

export interface PlaylistInfo {
    name: string;
    selectedTrack: number;
}

export interface LoadTracksResult {
    loadType: LoadType;
    data: Track[] | PlaylistInfo;
}

export interface PlayerUpdateData {
    encodedTrack?: string | null;
    identifier?: string;
    position?: number;
    endTime?: number;
    volume?: number;
    paused?: boolean;
    filters?: any;
    voice?: {
        token: string;
        endpoint: string;
        sessionId: string;
    };
}