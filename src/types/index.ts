export * from './LavalinkEvents';
export * from './LavalinkRest';
export * from './RaftLinkOptions';

// Discord Voice Update Payloads
export interface VoiceStateUpdate {
    guild_id: string;
    channel_id: string | null;
    user_id: string;
    session_id: string;
}

export interface VoiceServerUpdate {
    token: string;
    guild_id: string;
    endpoint: string;
}