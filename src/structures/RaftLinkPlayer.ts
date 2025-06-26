import { EventEmitter } from 'events';
import { RaftLinkNode } from './RaftLinkNode';
import { PlayerOptions, Track, VoiceServerUpdate, VoiceStateUpdate } from '../types';
import { Queue } from './Queue';

/**
 * Represents a music player for a specific guild.
 */
export class RaftLinkPlayer extends EventEmitter {
    public readonly node: RaftLinkNode;
    public readonly guildId: string;
    public textChannelId: string | null;
    public channelId: string | null;

    public readonly queue = new Queue();
    public currentTrack: Track | null = null;
    public playing = false;
    public paused = false;
    public volume = 100;
    public position = 0;

    private voiceState: Partial<VoiceStateUpdate> = {};
    private voiceServer: Partial<VoiceServerUpdate> = {};

    constructor(node: RaftLinkNode, options: PlayerOptions) {
        super();
        this.node = node;
        this.guildId = options.guildId;
        this.channelId = options.channelId;
        this.textChannelId = options.textChannelId ?? null;

        this.node.on('event', (payload) => {
            if (payload.guildId !== this.guildId) return;
            switch (payload.type) {
                case 'TrackStartEvent':
                    this.playing = true;
                    this.emit('trackStart', this, this.currentTrack);
                    break;
                case 'TrackEndEvent':
                    this.playing = false;
                    if (payload.reason !== 'REPLACED') {
                        this.currentTrack = null;
                        this.play();
                    }
                    this.emit('trackEnd', this, this.currentTrack, payload);
                    break;
                case 'TrackExceptionEvent':
                    console.error(`[RaftLink] [Player] Track exception for guild ${this.guildId}:`, payload);
                    this.emit('trackException', this, this.currentTrack, payload);
                    this.emit('trackError', this, this.currentTrack, payload); // Generic error event
                    break;
                case 'TrackStuckEvent': this.emit('trackStuck', this, this.currentTrack, payload); break;
                case 'WebSocketClosedEvent': this.emit('wsClosed', this, payload); break;
            }
        });

        this.node.on('playerUpdate', (payload) => {
            if (payload.guildId !== this.guildId) return;
            this.position = payload.state.position;
        });
    }

    /**
     * Plays the next track in the queue. If a track is provided, it will be added to the queue first.
     * @param track An optional track to add to the queue before playing.
     */
    public async play(track?: Track): Promise<void> {
        if (track) this.queue.add(track);
        if (this.playing) return;

        const nextTrack = this.queue.removeFirst();
        if (!nextTrack) {
            console.log(`[RaftLink] [Player] Queue is empty for guild ${this.guildId}`);
            this.emit('queueEnd', this);
            return;
        }

        this.currentTrack = nextTrack;
        this.playing = true;
        console.log(`[RaftLink] [Player] Now playing '${nextTrack.info.title}' in guild ${this.guildId}`);
        await this.node.rest.updatePlayer(this.guildId, { encodedTrack: nextTrack.encoded });
    }

    /** Stops the current track, clears the player, and disconnects. */
    public async stop(): Promise<void> {
        this.playing = false;
        await this.node.rest.updatePlayer(this.guildId, { encodedTrack: null });
    }

    /**
     * Pauses or resumes the player.
     * @param state True to pause, false to resume. Defaults to true.
     */
    public async pause(state = true): Promise<void> {
        if (this.paused === state) return;
        this.paused = state;
        await this.node.rest.updatePlayer(this.guildId, { paused: state });
    }

    /**
     * Seeks to a specific position in the current track.
     * @param position The position in milliseconds.
     */
    public async seek(position: number): Promise<void> {
        await this.node.rest.updatePlayer(this.guildId, { position });
    }

    /**
     * Sets the player's volume.
     * @param volume The volume, from 0 to 1000.
     */
    public async setVolume(volume: number): Promise<void> {
        this.volume = Math.max(0, Math.min(volume, 1000));
        await this.node.rest.updatePlayer(this.guildId, { volume: this.volume });
    }

    /**
     * Connects to a voice channel.
     * @param channelId The ID of the voice channel.
     */
    public connect(channelId: string): this {
        this.channelId = channelId;
        this.node.manager['send'](this.guildId, {
            op: 4, d: { guild_id: this.guildId, channel_id: this.channelId, self_mute: false, self_deaf: true },
        });
        return this;
    }

    /** Disconnects from the voice channel. */
    public disconnect(): void {
        this.channelId = null;
        this.node.manager['send'](this.guildId, {
            op: 4, d: { guild_id: this.guildId, channel_id: null, self_mute: false, self_deaf: false },
        });
    }

    /** Disconnects from the voice channel and destroys the player instance. */
    public destroy(): void {
        this.disconnect();
        this.node.rest.destroyPlayer(this.guildId);
        this.node.manager.players.delete(this.guildId);
    }

    /** @internal */
    public handleVoiceUpdate(payload: VoiceStateUpdate | VoiceServerUpdate): void {
        'token' in payload ? (this.voiceServer = payload) : (this.voiceState = payload);

        if (this.voiceState.session_id && this.voiceServer.token && this.voiceServer.endpoint) {
            this.node.rest.updatePlayer(this.guildId, {
                voice: { token: this.voiceServer.token, endpoint: this.voiceServer.endpoint, sessionId: this.voiceState.session_id },
            });
        }
    }
}