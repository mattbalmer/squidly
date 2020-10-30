import { Message } from 'discord.js';

export type Env = {
  BOT_NAME: string,
  ALIASES: string[],
  BOT_TOKEN: string,
  CLIENT_ID: string,
  LIVE_CHANNEL: null | {
    NAME: string,
    MAX_AGE: number,
  },
  GAME_CHANNEL_NAME: string,
  ARCHIVE_CHANNEL_NAME: string,
}

export interface Command {
  shouldHandle: (message: Message, metadata: { tag: string, command: string, args: string[] }) => boolean,
  handle: (message: Message, ...args: any[]) => void,
}