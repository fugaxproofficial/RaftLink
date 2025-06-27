import { EventEmitter } from 'events';
import WebSocket from 'ws';
import { RaftLinkManager } from './RaftLinkManager';
import { RestManager } from '../rest/RestManager';
import { LavalinkWSPayload, NodeOptions, ReadyPayload, StatsPayload } from '../types';

/**
 * Represents a single connection to a Lavalink server node.
 */
export class RaftLinkNode extends EventEmitter {
    public readonly manager: RaftLinkManager;
    public readonly rest: RestManager;
    public readonly options: NodeOptions;

    public connected = false;
    public sessionId: string | null = null;
    public stats: StatsPayload | {} = {};

    private ws: WebSocket | null = null;
    private reconnectTimeout: NodeJS.Timeout | null = null;
    private readonly retryInterval: number;

    constructor(manager: RaftLinkManager, options: NodeOptions) {
        super();
        this.manager = manager;
        this.options = { resumeTimeout: 60, ...options };
        this.retryInterval = options.retryInterval ?? 5000;
        this.rest = new RestManager(this);
    }

    public connect(): void {
        if (this.connected || this.ws) return;
        const headers: { [key: string]: string | undefined } = {
            Authorization: this.options.password,
            'User-Id': this.manager.userId ?? undefined,
            'Client-Name': `RaftLink/${require('../../package.json').version}`,
        };
        if (this.sessionId) headers['Resume-Key'] = this.sessionId;
        const url = `ws${this.options.secure ? 's' : ''}://${this.options.host}:${this.options.port}/v4/websocket`;

        this.ws = new WebSocket(url, { headers: Object.fromEntries(Object.entries(headers).filter(([, v]) => v !== undefined)) });
        this.ws.on('open', this.onOpen.bind(this));
        this.ws.on('message', this.onMessage.bind(this));
        this.ws.on('error', this.onError.bind(this));
        this.ws.on('close', this.onClose.bind(this));
    }

    public disconnect(): void {
        if (!this.connected) return;
        this.ws?.close(1000, 'Manually disconnected');
    }

    private onOpen(): void {
        if (this.reconnectTimeout) clearTimeout(this.reconnectTimeout);
        this.emit('connect');
    }

    private onMessage(data: Buffer | string): void {
        const payload = JSON.parse(data.toString()) as LavalinkWSPayload;
        switch (payload.op) {
            case 'ready': this.onReady(payload); break;
            case 'stats': this.stats = payload; this.emit('stats', payload); break;
            case 'playerUpdate': this.emit('playerUpdate', payload); break;
            case 'event': this.emit('event', payload); break;
            default: this.emit('raw', payload); break;
        }
    }

    private onError(err: Error): void { this.emit('error', err); }
    private onClose(code: number, reason: Buffer): void {
        this.connected = false;
        this.ws = null;
        this.emit('disconnect', code, reason.toString());
        if (code !== 1000 || reason.toString() !== 'Manually disconnected') this.reconnect();
    }

    private onReady(payload: ReadyPayload): void {
        this.connected = true;
        this.sessionId = payload.sessionId;
        this.emit('ready', payload);
        if (payload.resumed) return;
        this.rest.updateSession(true, this.options.resumeTimeout!);
    }

    private reconnect(): void {
        if (this.reconnectTimeout) return;
        this.emit('reconnecting');
        this.reconnectTimeout = setTimeout(() => this.connect(), this.retryInterval);
    }
}