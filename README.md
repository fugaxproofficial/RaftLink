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

```typescript
import { RaftLinkManager, SourceType, RaftLinkPlayer, Track } from 'raftlink';
import { Client, GatewayIntentBits, TextChannel } from 'discord.js';

// --- Bot and RaftLink Initialization ---

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates,
    ],
});

const raftLink = new RaftLinkManager({
    nodes: [{
        host: 'localhost',
        port: 2333,
        password: 'youshallnotpass',
    }],
    send: (guildId, payload) => {
        const guild = client.guilds.cache.get(guildId);
        if (guild) guild.shard.send(payload);
    },
});

// --- RaftLink Event Handling ---

raftLink.on('nodeConnect', (node) => {
    console.log(`[RaftLink] Node "${node.options.identifier}" connected.`);
});

raftLink.on('trackStart', (player: RaftLinkPlayer, track: Track) => {
    const channel = client.channels.cache.get(player.textChannelId!) as TextChannel;
    if (channel) {
        channel.send(`▶️ Now playing: **${track.info.title}** by *${track.info.author}*`);
    }
});

raftLink.on('queueEnd', (player: RaftLinkPlayer) => {
    const channel = client.channels.cache.get(player.textChannelId!) as TextChannel;
    if (channel) {
        channel.send('✅ Queue has finished. Leaving voice channel.');
    }
    player.destroy();
});

// --- Discord.js Event Handling ---

client.on('ready', () => {
    raftLink.init(client.user!.id);
    console.log(`Bot is ready! Logged in as ${client.user!.tag}`);
});

client.on('raw', (d) => {
    // Forward voice updates to RaftLink
    if (d.t === 'VOICE_STATE_UPDATE' || d.t === 'VOICE_SERVER_UPDATE') {
        raftLink.handleVoiceUpdate(d.d);
    }
});

client.on('messageCreate', async (message) => {
    if (!message.guild || message.author.bot) return;

    const prefix = '!';
    if (!message.content.startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const command = args.shift()!.toLowerCase();

    if (command === 'play') {
        const query = args.join(' ');
        const voiceChannel = message.member?.voice.channel;

        if (!voiceChannel) {
            return message.channel.send('You need to be in a voice channel to play music!');
        }

        let player = raftLink.createPlayer({
            guildId: message.guild.id,
            channelId: voiceChannel.id,
            textChannelId: message.channel.id,
        });

        player.connect(voiceChannel.id);

        const res = await raftLink.search(query, message.author);

        if (res.loadType === 'NO_MATCHES') {
            return message.channel.send('No results found for your query.');
        }

        player.queue.add(res.data[0]);
        message.channel.send(`Enqueuing **${res.data[0].info.title}**.`);

        if (!player.playing && !player.paused) {
            player.play();
        }
    }
});

client.login('YOUR_BOT_TOKEN');
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