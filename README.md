# Diggie

Diggie is a comprehensive Discord bot utility tool designed to streamline your developer experience by providing a simple, client-like application. This tool aims to enhance your interaction with Discord, offering a wide range of features and functionalities.

> ⚠️ This application may break [Discord Guidelines](https://discord.com/safety/platform-manipulation-policy-explainer)

## Download

To download Diggie, visit the [releases](https://github.com/oxydien/diggie/releases) page and select the version that suits your needs. 

Please also check the known issues section for any potential problems.

## Preview & Usage

Diggie is built on [Tauri](https://tauri.app/) and [Vue 3](https://vuejs.org/), offering a robust and efficient user interface.

For a visual preview and instalation of the application, visit the [Preview.md](/Preview.md) file.

## Features & Plans

### Core Features

- [x] Autosave token
  - [x] Encrypted (weak)
  - [x] Multi-account Support

### Basic Discord Features

- [x] View Servers
- [x] View Channels
  - [x] View Threads
- [x] View Members
- [x] React to messages
- [x] Send messages
  - [ ] Send polls
  - [x] View Polls
- [x] Send Embeds
  - [x] Embed Editor
  - [x] Embed Preview
  - [ ] Embed Components (buttons, select, ...)
- [ ] Check Permissions
  - Check if bot has permission to do some operation, before proceeding
- [ ] Leave Server
- [ ] Voice channel (low priority)

### Moderation tools

- [x] Edit messages
- [x] Delete messages
- [ ] Add roles to member
- [ ] Ban/Kick/Timeout member
- [x] Create/Edit/Remove channels
- [ ] Edit server settings
- [ ] Audit Log

### Utilities

- [ ] View Raw (messages, channels, members, ...)
- [ ] Interaction Viewer

## Contribution

Contributions to Diggie are welcome! I

f you're interested in contributing, follow these steps:
1. Clone the repository.
2. Create a new branch (e.g., "username/feature").
3. Make your modifications.
4. Once ready, create a pull request.

if any issues with running the application, try
```sh
export WEBKIT_DISABLE_COMPOSITING_MODE=1
export WEBKIT_DISABLE_DMABUF_RENDERER=1
```
or [open an issue](https://github.com/oxydien/diggie/issues).
