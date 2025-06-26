import { Track } from './LavalinkRest';

export interface ReadyPayload {
    op: 'ready';
    resumed: boolean;
    sessionId: string;
}

export interface PlayerUpdatePayload {
    op: 'playerUpdate';
    guildId: string;
    state: {
        time: number;
        position: number;
        connected: boolean;
        ping: number;
    };
}

export interface StatsPayload {
    op: 'stats';
    players: number;
    playingPlayers: number;
    uptime: number;
    memory: {
        free: number;
        used: number;
        allocated: number;
        reservable: number;
    };
    cpu: {
        cores: number;
        systemLoad: number;
        lavalinkLoad: number;
    };
    frameStats?: {
        sent: number;
        nulled: number;
        deficit: number;
    };
}

export type EventPayload = TrackStartEvent | TrackEndEvent | TrackExceptionEvent | TrackStuckEvent | WebSocketClosedEvent;

interface BaseEventPayload {
    op: 'event';
    guildId: string;
}

export interface TrackStartEvent extends BaseEventPayload {
    type: 'TrackStartEvent';
    track: Track;
}

export interface TrackEndEvent extends BaseEventPayload {
    type: 'TrackEndEvent';
    track: Track;
    reason: 'FINISHED' | 'LOAD_FAILED' | 'STOPPED' | 'REPLACED' | 'CLEANUP';
}

export interface TrackExceptionEvent extends BaseEventPayload {
    type: 'TrackExceptionEvent';
    track: Track;
    exception: {
        message: string;
        severity: 'COMMON' | 'SUSPICIOUS' | 'FATAL';
        cause: string;
    };
}

export interface TrackStuckEvent extends BaseEventPayload {
    type: 'TrackStuckEvent';
    track: Track;
    thresholdMs: number;
}

export interface WebSocketClosedEvent extends BaseEventPayload {
    type: 'WebSocketClosedEvent';
    code: number;
    reason: string;
    byRemote: boolean;
}

export type LavalinkWSPayload = ReadyPayload | PlayerUpdatePayload | StatsPayload | EventPayload;