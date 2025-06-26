# RaftLink

> A resilient and buoyant Lavalink v4 client for your Discord fleet.

[![NPM Version](https://img.shields.io/npm/v/raftlink?style=for-the-badge&logo=npm)](https://www.npmjs.com/package/raftlink)
[![License](https://img.shields.io/github/license/YourUsername/RaftLink?style=for-the-badge)](https://github.com/YourUsername/RaftLink/blob/main/LICENSE)
[![Discord Support](https://img.shields.io/discord/YOUR_DISCORD_SERVER_ID?style=for-the-badge&logo=discord&label=support)](https://discord.gg/YOUR_INVITE_CODE)

**RaftLink** is a modern, robust, and feature-rich [Lavalink v4](https://github.com/lavalink-devs/Lavalink) client for Node.js. Built entirely in TypeScript, it provides a highly intuitive and powerful developer experience for building Discord music bots. It is designed to be 100% compliant with the Lavalink v4 API specification.

---

## Features

-   **✅ 100% Lavalink v4 Support**: Implements all REST endpoints and WebSocket interactions.
-   **🔒 Type-Safe**: Written entirely in TypeScript for excellent autocompletion, compile-time safety, and self-documenting code.
-   **🌐 Framework Agnostic**: Decoupled from any specific Discord library (discord.js, Eris, etc.) via a simple `send` function.
-   **🚀 Resilient & Performant**: Features automatic node reconnection, session resuming, and intelligent node balancing to distribute load.
-   **🎵 Feature-Rich Player**: Comes with a built-in, powerful `Queue` class and an intuitive `Player` for easy music control.
-   **✨ Modern & Event-Driven**: Built with modern async/await patterns and a rich set of events for fine-grained control.

---

## Prerequisites

Before using RaftLink, you will need:

1.  **Node.js v18 or newer**.
2.  A running **Lavalink v4 server**. You can find the latest version [here](https://github.com/lavalink-devs/Lavalink/releases).
3.  A basic `application.yml` file for your Lavalink server.
4.  (Optional but **Highly Recommended**) The [LavaSrc Plugin](https://github.com/topi314/LavaSrc) for your Lavalink server to enable support for **Spotify, Apple Music, Deezer, and more.**

---

## Installation

```bash
# Using npm
npm install raftlink discord.js

# Using yarn
yarn add raftlink discord.js