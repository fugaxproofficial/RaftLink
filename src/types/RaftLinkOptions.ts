export interface ManagerOptions {
    /** The user ID of the bot. */
    userId?: string;
    /** The array of nodes to connect to. */
    nodes?: NodeOptions[];
    /** The function to send voice channel updates to Discord. */
    send: (guildId: string, payload: any) => void;
}

export interface NodeOptions {
    /** The host of the Lavalink node. */
    host: string;
    /** The port of the Lavalink node. */
    port: number;
    /** The password of the Lavalink node. */
    password: string;
    /** Whether to use SSL for the WebSocket and REST connection. */
    secure?: boolean;
    /** A unique identifier for the node. Defaults to the host. */
    identifier?: string;
    /** The timeout for resuming a session, in seconds. Defaults to 60. */
    resumeTimeout?: number;
    /** The interval for retrying a connection, in milliseconds. Defaults to 5000. */
    retryInterval?: number;
}

export interface PlayerOptions {
    /** The ID of the guild for this player. */
    guildId: string;
    /** The ID of the voice channel to connect to. */
    channelId: string;
    /** The ID of the text channel for announcements. Stored for convenience. */
    textChannelId?: string;
}