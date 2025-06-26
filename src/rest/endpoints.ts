// All endpoints are prefixed with /v4
export const Endpoints = {
    loadTracks: (identifier: string) => `/loadtracks?identifier=${encodeURIComponent(identifier)}`,
    decodeTrack: (encodedTrack: string) => `/decodetrack?encodedTrack=${encodedTrack}`,
    sessions: (sessionId: string) => `/sessions/${sessionId}`,
    player: (sessionId: string, guildId: string) => `/sessions/${sessionId}/players/${guildId}`,
    players: (sessionId: string) => `/sessions/${sessionId}/players`,
};