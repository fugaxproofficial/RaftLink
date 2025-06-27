
# RaftLink

A robust and feature-rich Lavalink client for your Discord bot, written in TypeScript. RaftLink is designed to be easy to use, flexible, and highly performant, providing a solid foundation for your bot's music functionality.

## Features

-   **Multi-Node Support:** Connect to multiple Lavalink nodes for high availability and load balancing.
-   **Player Management:** Easily create, manage, and destroy music players for each guild.
-   **Queue System:** A comprehensive queue system with support for adding, removing, shuffling, and more.
-   **Event-Driven:** A rich set of events for handling everything from track start to WebSocket closures.
-   **REST API:** A full-featured REST manager for interacting with the Lavalink API.
-   **TypeScript Support:** Written entirely in TypeScript for a better development experience.

## Installation

To install RaftLink, you'll need to have Node.js and npm installed. Then, you can install RaftLink using npm:

```bash
npm install raftlink
```

## Getting Started

Here's a simple example of how to use RaftLink in your Discord bot:

```typescript
import { RaftLinkManager } from 'raftlink';
import { Client } from 'discord.js';

const client = new Client();

const nodes = [
    {
        host: 'localhost',
        port: 2333,
        password: 'youshallnotpass',
    },
];

const raftLink = new RaftLinkManager({
    nodes,
    userId: client.user.id,
    send: (guildId, payload) => {
        const guild = client.guilds.cache.get(guildId);
        if (guild) guild.shard.send(payload);
    },
});

client.on('ready', () => {
    raftLink.init(client.user.id);
    console.log('Bot is ready!');
});

client.on('raw', (d) => raftLink.updateVoiceState(d));

client.on('message', async (message) => {
    if (message.content.startsWith('!play')) {
        const args = message.content.split(' ').slice(1);
        const query = args.join(' ');

        const player = raftLink.create({
            guild: message.guild.id,
            voiceChannel: message.member.voice.channel.id,
            textChannel: message.channel.id,
        });

        player.connect();

        const res = await raftLink.search(query, message.author);

        if (res.loadType === 'NO_MATCHES') {
            message.channel.send('No results found.');
        } else {
            player.queue.add(res.tracks[0]);
            message.channel.send(`Enqueuing ${res.tracks[0].title}.`);
            if (!player.playing && !player.paused && !player.queue.size) {
                player.play();
            }
        }
    }
});

client.login('YOUR_BOT_TOKEN');
```

## Documentation

### `RaftLinkManager`

The main class for managing Lavalink nodes and players.

#### `new RaftLinkManager(options)`

-   `options` `<ManagerOptions>`
    -   `nodes` `<NodeOptions[]>` - An array of Lavalink node options.
    -   `userId` `<string>` - The user ID of the bot.
    -   `send` `<Function>` - A function to send voice state updates to Discord.

#### `raftLink.init(userId)`

-   `userId` `<string>` - The user ID of the bot.

Initializes the RaftLink manager.

#### `raftLink.create(options)`

-   `options` `<PlayerOptions>`
    -   `guild` `<string>` - The ID of the guild.
    -   `voiceChannel` `<string>` - The ID of the voice channel.
    -   `textChannel` `<string>` - The ID of the text channel.

Creates a new player for a guild.

#### `raftLink.search(query, requester)`

-   `query` `<string>` - The search query.
-   `requester` `<User>` - The user who requested the search.

Searches for tracks on Lavalink.

#### `raftLink.updateVoiceState(data)`

-   `data` `<any>` - The raw voice state update from Discord.

Updates the voice state of a player.

### `RaftLinkPlayer`

The class for managing a single player.

#### `player.connect()`

Connects the player to the voice channel.

#### `player.play()`

Starts playing the next track in the queue.

#### `player.pause(pause)`

-   `pause` `<boolean>` - Whether to pause or resume the player.

Pauses or resumes the player.

#### `player.stop()`

Stops the player and clears the queue.

#### `player.seek(position)`

-   `position` `<number>` - The position to seek to in milliseconds.

Seeks to a position in the current track.

#### `player.setVolume(volume)`

-   `volume` `<number>` - The volume to set, from 0 to 1000.

Sets the volume of the player.

#### `player.destroy()`

Destroys the player.

### `Queue`

The class for managing the queue.

#### `queue.add(track)`

-   `track` `<Track>` - The track to add to the queue.

Adds a track to the queue.

#### `queue.remove(index)`

-   `index` `<number>` - The index of the track to remove.

Removes a track from the queue.

#### `queue.clear()`

Clears the queue.

#### `queue.shuffle()`

Shuffles the queue.



## Contributing

Contributions are welcome! If you have any ideas, suggestions, or bug reports, please open an issue on the [GitHub repository](<https://github.com/fugaxproofficial/RaftLink>).

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.