# RaftLink: The Definitive Lavalink V4 Client

<p align="center">
  <img src="https://i.imgur.com/hUe2iS6.png" alt="RaftLink Logo" width="200"/>
</p>

<p align="center">
  <strong>An unparalleled, feature-rich, and modern Lavalink v4 client for Node.js, meticulously crafted in TypeScript.</strong>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/raftlink"><img src="https://img.shields.io/npm/v/raftlink.svg?style=for-the-badge" alt="NPM Version"></a>
  <a href="https://www.npmjs.com/package/raftlink"><img src="https://img.shields.io/npm/dt/raftlink.svg?style=for-the-badge" alt="NPM Downloads"></a>
  <a href="https://github.com/fugaxproofficial/RaftLink/blob/main/LICENSE"><img src="https://img.shields.io/npm/l/raftlink.svg?style=for-the-badge" alt="License"></a>
</p>

---

**RaftLink** is engineered to be the most robust and performant Lavalink client available. It provides a seamless, developer-friendly interface for all of Lavalink's capabilities, empowering you to build sophisticated, large-scale music bots with confidence and ease.

## Why RaftLink Dominates the Competition

While other clients offer basic functionality, RaftLink is built on a foundation of performance, reliability, and modern features. Here’s how it stands apart:

| Feature                  | Standard Clients                               | RaftLink                                                                                                                            |
| ------------------------ | ---------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| **Architecture**         | Often a simple wrapper around the API.         | **Intelligent, multi-node architecture** with automatic load balancing based on CPU and player count. Ensures optimal performance.      |
| **Reliability**          | Basic connection handling.                     | **Automatic node reconnection** and failover. If a node goes down, RaftLink seamlessly handles it, ensuring uninterrupted service. |
| **Performance**          | Standard performance, can struggle under load. | **Highly optimized for low memory and CPU usage.** Designed for scalability, from small bots to massive, multi-guild services.     |
| **Developer Experience** | JavaScript-based, often with basic types.    | **Natively written in TypeScript** with comprehensive, detailed type definitions for a superior, error-free development experience. |
| **Source Support**       | Limited to basic sources.                      | **Extensive, out-of-the-box support** for YouTube, Spotify, SoundCloud, Apple Music, and more.                                      |

## Core Features

-   👑 **Intelligent Node Management:** Automatic load balancing and failover across multiple Lavalink nodes.
-   🚀 **High-Performance Playback:** Optimized for speed and efficiency, ensuring smooth audio even at scale.
-   🎵 **Extensive Source Support:** Natively handles YouTube, Spotify, Apple Music, SoundCloud, and more.
-   🔧 **Robust Event-Driven System:** A comprehensive set of events for precise control over your players.
-   📚 **Fully Typed:** Written in TypeScript for a superior and safer development experience.
-   ⚙️ **Full Lavalink v4 Support:** Utilizes all the latest features of the Lavalink API.
-   📝 **Comprehensive Queue System:** Advanced queue management with shuffle, remove, and more.

## Supported Sources

RaftLink allows you to stream from a vast array of platforms right out of the box:

<p align="center">
  <img src="https://i.imgur.com/tG3Yk4j.png" alt="Supported Sources" width="400"/>
</p>

## Installation

Get started with the future of Discord music bots. All you need is Node.js and npm.

```bash
npm install raftlink
```

## Getting Started

This example demonstrates how to set up a basic music bot with RaftLink in just a few lines of code.

```javascript
const { Client, GatewayIntentBits } = require('discord.js');
const { RaftLinkManager, SourceType } = require('raftlink');
const config = require('./config.json');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates,
    ],
});

const nodes = [
    {
        host: config.lavalink.host,
        port: config.lavalink.port,
        password: config.lavalink.password,
    },
];

const raftLink = new RaftLinkManager({
    send: (guildId, payload) => {
        const guild = client.guilds.cache.get(guildId);
        if (guild) guild.shard.send(payload);
    },
    nodes: nodes, // Pass nodes in the constructor
});

client.on('ready', () => {
    const botId = client.user.id;
    raftLink.init(botId); // Only pass userId
    console.log(`Bot is ready! Logged in as ${client.user.tag}`);
    console.log('RaftLink initialized with nodes:', nodes);
    console.log('Discord Client Intents:', client.options.intents.toArray()); // Log active intents
});

client.on('raw', (d) => {
    // Only handle VOICE_STATE_UPDATE and VOICE_SERVER_UPDATE events for RaftLink
    if (d.t === 'VOICE_STATE_UPDATE' || d.t === 'VOICE_SERVER_UPDATE') {
        console.log(`[Discord Raw Payload] Handling voice update: Type: ${d.t}, Guild ID: ${d.d ? d.d.guild_id : 'N/A'}, Channel ID: ${d.d ? d.d.channel_id : 'N/A'}`);
        try {
            raftLink.handleVoiceUpdate(d.d);
        } catch (error) {
            console.error(`[Error] Failed to handle voice update for raw payload type ${d.t}:`, error);
        }
    } else {
        // Log other raw Discord events for debugging if needed, but don't pass to RaftLink
        console.log(`[Discord Raw Payload] Ignoring non-voice event: Type: ${d.t}, Guild ID: ${d.d ? d.d.guild_id : 'N/A'}, Channel ID: ${d.d ? d.d.channel_id : 'N/A'}`);
    }
});

// Enhanced handleVoiceUpdate logging within RaftLinkPlayer.ts (already done in RaftLink library)
// Adding a check here for completeness, though the primary issue is Discord not sending the event.
raftLink.on('playerUpdate', (payload) => {
    if (payload.state && payload.state.voice) {
        const { sessionId, token, endpoint } = payload.state.voice;
        if (!sessionId) console.warn(`[RaftLink] [Player] Missing sessionId in playerUpdate voice state for guild ${payload.guildId}`);
        if (!token) console.warn(`[RaftLink] [Player] Missing token in playerUpdate voice state for guild ${payload.guildId}`);
        if (!endpoint) console.warn(`[RaftLink] [Player] Missing endpoint in playerUpdate voice state for guild ${payload.guildId}`);
    }
});

client.on('messageCreate', async (message) => {
    if (message.author.bot) {
        console.log(`[Message] Ignoring bot message from ${message.author.tag}`);
        return;
    }
    if (!message.guild) {
        console.log(`[Message] Ignoring DM from ${message.author.tag}`);
        return;
    }

    console.log(`[Command] Received command "${message.content}" from ${message.author.tag} in guild ${message.guild.name}`);

    if (message.content.startsWith('!play') || message.content.startsWith('!yt') || message.content.startsWith('!sc') || message.content.startsWith('!sp') || message.content.startsWith('!am')) {
        const command = message.content.split(' ')[0];
        const args = message.content.split(' ').slice(1);
        const query = args.join(' ');

        if (!query) {
            console.log(`[Command: ${command}] No query provided by ${message.author.tag}`);
            return message.channel.send('Please provide a song name or URL to play.');
        }

        const voiceChannel = message.member.voice.channel;
        if (!voiceChannel) {
            console.log(`[Command: ${command}] ${message.author.tag} not in a voice channel.`);
            return message.channel.send('You need to be in a voice channel to play music!');
        }

        try {
            let player = raftLink.players.get(message.guild.id);
            console.log(`[Command: ${command}] Current player for guild ${message.guild.id}: ${player ? 'exists' : 'does not exist'}`);

            if (!player) {
                console.log(`[Command: ${command}] Creating new player for guild ${message.guild.id} in channel ${voiceChannel.name}`);
                player = raftLink.createPlayer({
                    guildId: message.guild.id,
                    channelId: voiceChannel.id,
                    textChannelId: message.channel.id,
                });
                console.log(`[Command: ${command}] Attempting to connect to voice channel ${voiceChannel.id}`);
                await player.connect(voiceChannel.id);
                console.log(`[Command: ${command}] Bot connected to voice channel ${voiceChannel.name} in guild ${message.guild.name}.`);

                // Add a small delay to allow Discord to send voice updates
                console.log(`[Command: ${command}] Waiting for 1.5 seconds for Discord voice updates...`);
                await new Promise(resolve => setTimeout(resolve, 1500));
                console.log(`[Command: ${command}] Finished waiting.`);
            } else if (player.channelId !== voiceChannel.id) {
                console.log(`[Command: ${command}] Player already exists in a different channel (${player.channelId}), requested channel ${voiceChannel.id}`);
                return message.channel.send('I am already playing in another voice channel in this guild. Please join my channel or stop the current playback.');
            }

            let source = SourceType.YouTube; // Default to YouTube for !play
            switch (command) {
                case '!yt':
                    source = SourceType.YouTube;
                    break;
                case '!sc':
                    source = SourceType.SoundCloud;
                    break;
                case '!sp':
                    source = SourceType.Spotify;
                    break;
                case '!am':
                    source = SourceType.AppleMusic;
                    break;
            }

            console.log(`[Command: ${command}] Searching for "${query}" on source "${source}" requested by ${message.author.tag}`);
            const res = await raftLink.search(query, message.author, source);
            console.log(`[Command: ${command}] Search result loadType: ${res ? res.loadType : 'N/A'}`);

            if (!res || res.loadType === 'NO_MATCHES' || (res.loadType !== 'PLAYLIST_LOADED' && res.data.length === 0)) {
                console.log(`[Command: ${command}] No results found for query "${query}" on source "${source}"`);
                return message.channel.send('No results found for your query.');
            }

            let tracksToAdd = [];
            if (res.loadType === 'PLAYLIST_LOADED') {
                tracksToAdd = res.data.tracks;
                console.log(`[Command: ${command}] Enqueuing playlist "${res.data.name}" with ${res.data.tracks.length} tracks.`);
                message.channel.send(`Enqueuing playlist **${res.data.name}** with ${res.data.tracks.length} tracks.`);
            } else {
                tracksToAdd = [res.data[0]];
                console.log(`[Command: ${command}] Enqueuing single track "${tracksToAdd[0].info.title}" by "${tracksToAdd[0].info.author}".`);
                message.channel.send(`Enqueuing **${tracksToAdd[0].info.title}** by **${tracksToAdd[0].info.author}**.`);
            }

            const initialQueueSize = player.queue.size;
            player.queue.add(tracksToAdd);
            console.log(`[Command: ${command}] Tracks added to queue. New queue size: ${player.queue.size}`);

            if (!player.playing && !player.paused && initialQueueSize === 0) {
                console.log(`[Command: ${command}] Player not playing, not paused, and queue was empty. Starting playback.`);
                player.play();
            } else {
                console.log(`[Command: ${command}] Player state: playing=${player.playing}, paused=${player.paused}, initialQueueSize=${initialQueueSize}. Not starting playback.`);
            }
        } catch (error) {
            console.error(`[Error] Command ${command} failed for guild ${message.guild.id}:`, error);
            if (error.message.includes('Missing access') || error.message.includes('Not permitted')) {
                message.channel.send('I do not have permission to connect to your voice channel. Please check my permissions.');
            } else if (error.message.includes('Connection timed out')) {
                message.channel.send('Failed to connect to the voice channel. The connection timed out.');
            } else {
                message.channel.send(`An error occurred while trying to play the song: ${error.message}`);
            }
        }
    } else if (message.content === '!stop') {
        const player = raftLink.players.get(message.guild.id);
        if (player) {
            console.log(`[Command: !stop] Stopping player for guild ${message.guild.id}`);
            player.destroy();
            raftLink.players.delete(message.guild.id);
            message.channel.send('Stopped playback and cleared the queue.');
        } else {
            console.log(`[Command: !stop] No player found for guild ${message.guild.id}`);
            message.channel.send('No music is currently playing.');
        }
    } else if (message.content === '!skip') {
        const player = raftLink.players.get(message.guild.id);
        if (player && player.queue.size > 0) {
            console.log(`[Command: !skip] Skipping track for guild ${message.guild.id}`);
            player.stop();
            message.channel.send('Skipped the current track.');
        } else {
            console.log(`[Command: !skip] No track to skip or queue is empty for guild ${message.guild.id}`);
            message.channel.send('No track to skip or queue is empty.');
        }
    } else if (message.content === '!queue') {
        const player = raftLink.players.get(message.guild.id);
        if (player && player.queue.size > 0) {
            const queueList = player.queue.map((track, index) => `${index + 1}. ${track.info.title}`).join('\n');
            console.log(`[Command: !queue] Displaying queue for guild ${message.guild.id}. Size: ${player.queue.size}`);
            message.channel.send(`**Current Queue:**\n${queueList}`);
        } else {
            console.log(`[Command: !queue] Queue is empty for guild ${message.guild.id}`);
            message.channel.send('The queue is empty.');
        }
    }
});

// RaftLink Player Events for detailed error logging
raftLink.on('nodeConnect', node => {
    console.log(`[RaftLink Event] Node "${node.options.host}" connected.`);
});

raftLink.on('nodeDisconnect', (node, code, reason) => { // Added 'code' parameter
    console.error(`[RaftLink Event] Node "${node.options.host}" disconnected. Code: ${code}, Reason: ${reason || 'Unknown'}`);
    for (const player of raftLink.players.values()) {
        if (player.node === node) {
            console.log(`[RaftLink Event] Informing guild ${player.guildId} about node disconnect.`);
            client.channels.cache.get(player.textChannelId).send(`The music service (Lavalink) node **${node.options.host}** disconnected. Playback might be interrupted. Reason: ${reason || 'Unknown'}`);
            player.destroy();
            raftLink.players.delete(player.guildId);
        }
    }
});

raftLink.on('nodeError', (node, error) => {
    console.error(`[RaftLink Event] Node "${node.options.host}" encountered an error:`, error);
    for (const player of raftLink.players.values()) {
        if (player.node === node) {
            console.log(`[RaftLink Event] Informing guild ${player.guildId} about node error.`);
            client.channels.cache.get(player.textChannelId).send(`The music service (Lavalink) node **${node.options.host}** encountered an error: ${error.message}. Playback might be affected.`);
        }
    }
});

raftLink.on('trackStart', (player, track) => {
    console.log(`[RaftLink Event] Now playing: "${track.info.title}" in guild ${player.guildId}.`);
    client.channels.cache.get(player.textChannelId).send(`Now playing: **${track.info.title}**`);
});

raftLink.on('trackEnd', (player, track, reason) => {
    console.log(`[RaftLink Event] Track ended: "${track ? track.info.title : 'Unknown'}" in guild ${player.guildId}. Reason: ${reason}.`);
    if (reason === 'REPLACED') {
        console.log('[RaftLink Event] Track was replaced, not playing next.');
        return;
    }
    if (player.queue.size > 0) {
        console.log('[RaftLink Event] Queue not empty, playing next track.');
        player.play();
    } else {
        console.log('[RaftLink Event] Queue finished. Destroying player.');
        client.channels.cache.get(player.textChannelId).send('Queue finished.');
        player.destroy();
        raftLink.players.delete(player.guildId);
    }
});

raftLink.on('trackStuck', (player, track, threshold) => {
    console.error(`[RaftLink Event] Track stuck: "${track.info.title}" in guild ${player.guildId}. Threshold: ${threshold}.`);
    client.channels.cache.get(player.textChannelId).send(`Error: Track **${track.info.title}** got stuck after ${threshold / 1000} seconds. Skipping to the next track.`);
    player.stop();
});

raftLink.on('trackError', (player, track, error) => {
    console.error(`[RaftLink Event] Track error: "${track ? track.info.title : 'Unknown'}" in guild ${player.guildId}. Error:`, error);
    client.channels.cache.get(player.textChannelId).send(`Error playing **${track ? track.info.title : 'Unknown'}**: ${error.message}. Skipping to the next track.`);
    player.stop();
});

raftLink.on('socketClosed', async (player, payload) => {
    console.error(`[RaftLink Event] Socket closed for guild ${player.guildId}. Code: ${payload.code}, Reason: ${payload.reason}, By Remote: ${payload.byRemote}.`);
    if (payload.byRemote) {
        console.log(`[RaftLink Event] Attempting to reconnect for guild ${player.guildId}...`);
        client.channels.cache.get(player.textChannelId).send(`Voice connection closed unexpectedly. Code: ${payload.code}, Reason: ${payload.reason}. Attempting to reconnect...`);
        try {
            await player.connect(player.channelId);
            console.log(`[RaftLink Event] Successfully reconnected for guild ${player.guildId}.`);
            client.channels.cache.get(player.textChannelId).send(`Successfully reconnected to voice channel.`);
        } catch (error) {
            console.error(`[RaftLink Event] Failed to reconnect for guild ${player.guildId}:`, error);
            client.channels.cache.get(player.textChannelId).send(`Failed to reconnect to voice channel. Please try playing a song again.`);
            player.destroy();
            raftLink.players.delete(player.guildId);
        }
    } else {
        console.log(`[RaftLink Event] Socket closed by bot for guild ${player.guildId}. Destroying player.`);
        player.destroy();
        raftLink.players.delete(player.guildId);
    }
});

client.login(config.discord_bot_token).catch(err => {
    console.error('[Error] Failed to login to Discord:', err);
});
```
## config.json 
```{
  "discord_bot_token": "bot_token",
  "lavalink": {
    "host": "host",
    "port": port,
    "password": "password"
  }
}
```
## API Reference

### `RaftLinkManager`

The central hub for managing nodes and players.

#### `new RaftLinkManager(options: ManagerOptions)`

Creates a new manager instance.

-   `options.nodes`: `NodeOptions[]` - An array of Lavalink node configurations.
-   `options.send`: `(guildId: string, payload: any) => void` - The function to send voice payloads to Discord.
-   `options.userId`: `string` (optional) - The bot's user ID. Can be set later with `init()`.

#### `raftLink.init(userId: string)`

Initializes the manager and connects to the provided nodes. Must be called after your bot is ready.

#### `raftLink.createPlayer(options: PlayerOptions): RaftLinkPlayer`

Creates a new player for a guild or returns an existing one.

-   `options.guildId`: `string`
-   `options.channelId`: `string` (Voice Channel ID)
-   `options.textChannelId`: `string` (optional, for bot messages)

#### `raftLink.search(query: string, requester: any, source?: SourceType): Promise<LoadTracksResult>`

Searches for tracks.

-   `source`: Use the `SourceType` enum (e.g., `SourceType.YouTube`, `SourceType.Spotify`) for specific platform searches.

### `RaftLinkPlayer`

Represents a single guild's music player.

#### Properties

-   `queue: Queue` - The guild's song queue.
-   `playing: boolean` - Whether the player is currently playing.
-   `paused: boolean` - Whether the player is paused.
-   `currentTrack: Track | null` - The currently playing track.

#### Methods

-   `connect(channelId: string, options?: { selfDeaf?: boolean; selfMute?: boolean })`: Connects to a voice channel.
-   `disconnect()`: Disconnects from the voice channel.
-   `destroy()`: Disconnects, clears the queue, and removes the player instance.
-   `play(track?: Track)`: Starts playing the next track in the queue.
-   `pause(state: boolean = true)`: Pauses or resumes the player.
-   `stop()`: Stops playback and clears the player.
-   `seek(position: number)`: Seeks to a position in the current track (in milliseconds).
-   `setVolume(volume: number)`: Sets the volume (0-1000).

### Events

Harness RaftLink's event-driven architecture for full control.

#### Manager Events

-   `nodeConnect(node: RaftLinkNode)`
-   `nodeDisconnect(node: RaftLinkNode, code: number, reason: string)`
-   `nodeError(node: RaftLinkNode, error: Error)`
-   `nodeReady(node: RaftLinkNode, payload: any)`

#### Player Events

-   `trackStart(player: RaftLinkPlayer, track: Track)`
-   `trackEnd(player: RaftLinkPlayer, track: Track, payload: any)`
-   `trackException(player: RaftLinkPlayer, track: Track, payload: any)`
-   `trackStuck(player: RaftLinkPlayer, track: Track, payload: any)`
-   `queueEnd(player: RaftLinkPlayer)`

## Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## License

Distributed under the MIT License. See `LICENSE` for more information.