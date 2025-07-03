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
    artworkUrl?: string;
}

export interface PlaylistInfo {
    name: string;
    selectedTrack: number;
    tracks: Track[];
}

export interface LoadTracksResult {
    loadType: LoadType;
    data: Track[] | PlaylistInfo;
}

export interface Filters {
    volume?: number;
    equalizer?: EqualizerBand[];
    karaoke?: Karaoke;
    timescale?: Timescale;
    tremolo?: Tremolo;
    vibrato?: Vibrato;
    rotation?: Rotation;
    distortion?: Distortion;
    channelMix?: ChannelMix;
    lowPass?: LowPass;
}

export interface EqualizerBand {
    band: number;
    gain: number;
}

export interface Karaoke {
    level?: number;
    monoLevel?: number;
    filterBand?: number;
    filterWidth?: number;
}

export interface Timescale {
    speed?: number;
    pitch?: number;
    rate?: number;
}

export interface Tremolo {
    frequency?: number;
    depth?: number;
}

export interface Vibrato {
    frequency?: number;
    depth?: number;
}

export interface Rotation {
    rotationHz?: number;
}

export interface Distortion {
    sinOffset?: number;
    sinScale?: number;
    cosOffset?: number;
    cosScale?: number;
    tanOffset?: number;
    tanScale?: number;
    offset?: number;
    scale?: number;
}

export interface ChannelMix {
    leftToLeft?: number;
    leftToRight?: number;
    rightToLeft?: number;
    rightToRight?: number;
}

export interface LowPass {
    res?: number;
}

export interface LyricsResult {
    lyrics: string;
    source: string;
}

export interface PlayerUpdateData {
    encodedTrack?: string | null;
    identifier?: string;
    position?: number;
    endTime?: number;
    volume?: number;
    paused?: boolean;
    filters?: Filters;
    voice?: {
        token: string;
        endpoint: string;
        sessionId: string;
    };
}