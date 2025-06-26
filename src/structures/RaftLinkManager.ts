import { EventEmitter } from 'events';
import { RaftLinkNode } from './RaftLinkNode';
import { RaftLinkPlayer } from './RaftLinkPlayer';
import { ManagerOptions, NodeOptions, PlayerOptions, VoiceServerUpdate, VoiceStateUpdate, LoadTracksResult, StatsPayload } from '../types';

/**
 * The main hub for RaftLink, manages all nodes and players.
 */
export class RaftLinkManager extends EventEmitter {
    public readonly nodes = new Map<string, RaftLinkNode>();
    public readonly players = new Map<string, RaftLinkPlayer>();
    public userId: string;

    private readonly send: (guildId: string, payload: any) => void;

    constructor(options: ManagerOptions) {
        super();
        this.userId = options.userId;
        this.send = options.send;
        for (const nodeOptions of options.nodes) this.addNode(nodeOptions);
    }

    /**
     * Adds a new Lavalink node to the manager.
     * @param options The options for the node.
     */
    public addNode(options: NodeOptions): RaftLinkNode {
        const identifier = options.identifier || options.host;
        console.log(`[RaftLink] [Manager] Adding node ${identifier}`);
        const node = new RaftLinkNode(this, { ...options, identifier });
        node.on('connect', () => this.emit('nodeConnect', node));
        node.on('disconnect', (code, reason) => this.emit('nodeDisconnect', node, code, reason));
        node.on('error', (err) => this.emit('nodeError', node, err));
        node.on('reconnecting', () => this.emit('nodeReconnecting', node));
        node.on('ready', (payload) => this.emit('nodeReady', node, payload));
        node.connect();
        this.nodes.set(identifier, node);
        return node;
    }

    /**
     * Creates a new player or returns an existing one.
     * @param options The options for creating a player.
     */
    public createPlayer(options: PlayerOptions): RaftLinkPlayer {
        const existingPlayer = this.players.get(options.guildId);
        if (existingPlayer) return existingPlayer;
        const node = this.getIdealNode();
        if (!node) {
            console.error('[RaftLink] [Manager] No available nodes to create a player.');
            throw new Error('No available Lavalink nodes to create a player.');
        }
        console.log(`[RaftLink] [Manager] Creating player for guild ${options.guildId} on node ${node.options.identifier}`);
        const player = new RaftLinkPlayer(node, options);
        this.players.set(options.guildId, player);
        return player;
    }

    /**
     * Forwards voice updates from your Discord library to the relevant player.
     * @param payload The raw voice state or server update payload.
     */
    public handleVoiceUpdate(payload: VoiceStateUpdate | VoiceServerUpdate): void {
        const player = this.players.get(payload.guild_id);
        if (player) player.handleVoiceUpdate(payload);
    }

    /**
     * Searches for tracks using the best available node.
     * @param query The search query or URL.
     */
    public async search(query: string, requester: any): Promise<LoadTracksResult> {
        const node = this.getIdealNode();
        if (!node) throw new Error('No available Lavalink nodes to perform a search.');
        return node.rest.loadTracks(query);
    }

    /**
     * Gets the most ideal node for new players based on player count and CPU load.
     * @returns The best available RaftLinkNode.
     */
    public getIdealNode(): RaftLinkNode | undefined {
        return [...this.nodes.values()]
            .filter((node) => node.connected)
            .sort((a, b) => {
                const aStats = a.stats as StatsPayload;
                const bStats = b.stats as StatsPayload;
                if (!aStats.cpu) return 1; // Prioritize nodes with stats
                if (!bStats.cpu) return -1;
                return (aStats.cpu.lavalinkLoad / aStats.cpu.cores) * 100 - (bStats.cpu.lavalinkLoad / bStats.cpu.cores) * 100;
            })[0];
    }
}