import fetch, { RequestInit, Response } from 'node-fetch';
import { RaftLinkNode } from '../structures/RaftLinkNode';
import { Endpoints } from './endpoints';
import { LavalinkError } from './LavalinkError';
import { LoadTracksResult, PlayerUpdateData, Track, LyricsResult } from '../types';

export class RestManager {
    private readonly node: RaftLinkNode;
    private readonly baseUrl: string;

    constructor(node: RaftLinkNode) {
        this.node = node;
        this.baseUrl = `http${node.options.secure ? 's' : ''}://${node.options.host}:${node.options.port}/v4`;
    }

    public async get<T>(endpoint: string): Promise<T> {
        return this.request<T>({ endpoint });
    }

    public async request<T>({ endpoint, method = 'GET', data }: { endpoint: string, method?: string, data?: unknown }): Promise<T> {
        const url = `${this.baseUrl}${endpoint}`;
        const headers = {
            Authorization: this.node.options.password,
            'Content-Type': 'application/json',
        };

        const init: RequestInit = {
            method,
            headers,
            body: data ? JSON.stringify(data) : undefined,
        };

        this.node.manager.emit('debug', `[RaftLink] [RestManager] -> [${method}] ${url}`);
        const res: Response = await fetch(url, init);

        if (!res.ok) {
            const errorBody = await res.json().catch(() => ({ message: 'Unknown error' }));
            this.node.manager.emit('debug', `[RaftLink] [RestManager] <- [${method}] ${url} | ${res.status} ${res.statusText}`, errorBody);
            throw new LavalinkError(res.status, errorBody.error || 'Unknown Error', errorBody.message || 'No error message');
        }

        if (res.status === 204) {
            this.node.manager.emit('debug', `[RaftLink] [RestManager] <- [${method}] ${url} | 204 No Content`);
            return undefined as T;
        }

        const responseData = await res.json();
        this.node.manager.emit('debug', `[RaftLink] [RestManager] <- [${method}] ${url} | ${res.status} ${res.statusText}`, responseData);
        return responseData as T;
    }

    public async loadTracks(identifier: string): Promise<LoadTracksResult> {
        const isUrl = /^https?:\/\//.test(identifier);
        const finalIdentifier = isUrl ? identifier : `ytsearch:${identifier}`;
        return this.get<LoadTracksResult>(Endpoints.loadTracks(finalIdentifier));
    }

    public async decodeTrack(encodedTrack: string): Promise<Track> {
        return this.get<Track>(Endpoints.decodeTrack(encodedTrack));
    }

    public async updatePlayer(guildId: string, data: PlayerUpdateData): Promise<any> {
        if (!this.node.sessionId) throw new Error('No session ID available for player updates.');
        const endpoint = Endpoints.player(this.node.sessionId, guildId);
        return this.request({ endpoint, method: 'PATCH', data });
    }

    public async destroyPlayer(guildId: string): Promise<void> {
        if (!this.node.sessionId) return Promise.resolve();
        const endpoint = Endpoints.player(this.node.sessionId, guildId);
        await this.request({ endpoint, method: 'DELETE' });
    }

    public async updateSession(resuming: boolean, timeout: number): Promise<void> {
        if (!this.node.sessionId) throw new Error('No session ID available to update.');
        const endpoint = Endpoints.sessions(this.node.sessionId);
        await this.request({ endpoint, method: 'PATCH', data: { resuming, timeout } });
    }

    public async getRecommendedTracks(identifier: string): Promise<LoadTracksResult> {
        return this.get<LoadTracksResult>(Endpoints.recommendations(identifier));
    }

    public async getLyrics(trackId: string): Promise<LyricsResult> {
        return this.get<LyricsResult>(Endpoints.lyrics(trackId));
    }
}
