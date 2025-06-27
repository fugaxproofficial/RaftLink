import fetch from 'node-fetch';
import { RaftLinkNode } from '../structures/RaftLinkNode';
import { Endpoints } from './endpoints';
import { LoadTracksResult, PlayerUpdateData, Track } from '../types';

export class RestManager {
    private readonly node: RaftLinkNode;
    private readonly baseUrl: string;

    constructor(node: RaftLinkNode) {
        this.node = node;
        this.baseUrl = `http${node.options.secure ? 's' : ''}://${node.options.host}:${node.options.port}/v4`;
    }

    public async request<T>(endpoint: string, method: string, data?: unknown): Promise<T> {
        console.log(`[RaftLink] [RestManager] Making request to ${endpoint} with method ${method}`);
        const res = await fetch(`${this.baseUrl}${endpoint}`, {
            method,
            headers: { Authorization: this.node.options.password, 'Content-Type': 'application/json' },
            body: data ? JSON.stringify(data) : undefined,
        });

        if (!res.ok) {
            let errorBody: any = { message: `Request failed with status ${res.status}` };
            try {
                const text = await res.text();
                try {
                    errorBody = JSON.parse(text);
                } catch (e) {
                    errorBody.message = text;
                }
            } catch (e) {
                console.error('[RaftLink] [RestManager] Failed to read error body', e);
            }
            console.error(`[RaftLink] [RestManager] Request to ${endpoint} failed with status ${res.status}:`, errorBody.message || 'No error message');
            throw new Error(`Lavalink request to ${endpoint} failed with status ${res.status}: ${errorBody.message || 'No error message'}`);
        }

        if (res.status === 204) return undefined as T;
        const responseData = await res.json();
        console.log(`[RaftLink] [RestManager] Successfully received response from ${endpoint}`);
        return responseData as T;
    }

    public loadTracks(identifier: string): Promise<LoadTracksResult> {
        const searchPrefixes = [
            "ytsearch:", "scsearch:", "dzsearch:", "spsearch:", "bcsearch:", "ymsearch:",
            "spshortsearch:", "apple:", "deezer:", "spotify:", "soundcloud:", "bandcamp:",
            "youtube:", "yandexmusic:"
        ];
        const hasPrefix = searchPrefixes.some(prefix => identifier.startsWith(prefix));
        const finalIdentifier = hasPrefix ? identifier : `ytsearch:${identifier}`;
        return this.request<LoadTracksResult>(Endpoints.loadTracks(finalIdentifier), 'GET');
    }

    public decodeTrack(encodedTrack: string): Promise<Track> {
        return this.request<Track>(Endpoints.decodeTrack(encodedTrack), 'GET');
    }

    public updatePlayer(guildId: string, data: PlayerUpdateData): Promise<any> {
        if (!this.node.sessionId) throw new Error('No session ID available for player updates.');
        const endpoint = Endpoints.player(this.node.sessionId, guildId);
        return this.request(endpoint, 'PATCH', data);
    }

    public destroyPlayer(guildId: string): Promise<void> {
        if (!this.node.sessionId) return Promise.resolve();
        const endpoint = Endpoints.player(this.node.sessionId, guildId);
        return this.request(endpoint, 'DELETE');
    }

    public updateSession(resuming: boolean, timeout: number): Promise<void> {
        if (!this.node.sessionId) throw new Error('No session ID available to update.');
        const endpoint = Endpoints.sessions(this.node.sessionId);
        return this.request(endpoint, 'PATCH', { resuming, timeout });
    }
}