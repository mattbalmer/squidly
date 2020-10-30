import { Env } from 'squidly/types';

// IMPORTANT: PLEASE USE A NEW FILE OR RENAME THIS FILE FOR YOUR OWN BOT TOKEN & CLIENT ID
// IF YOU DON'T, YOUR BOT TOKEN AND CLIENT ID MAY BE PUBLIC

// 1000ms * 60s * 60m * 24h
const MAX_LIVE_CHANNEL_MESSAGE_AGE = (1000 * 60 * 60 * 24);

const EXAMPLE_CONFIG: Env = {
  // A simple identifier for your bot. Currently only used in logging
  BOT_NAME: 'squidlier',

  // You can choose different aliases for the bot to trigger from (eg. !sqd hello)
  ALIASES: [
    'sqd',
    'sqdr',
  ],

  // Your bot's token
  BOT_TOKEN: `LONG_TOKEN_STRING`,

  // Your application's client ID
  CLIENT_ID: `SHORT_CLIENT_ID_STRING`,

  LIVE_CHANNEL: {
    NAME: 'live',
    MAX_AGE: MAX_LIVE_CHANNEL_MESSAGE_AGE,
  },

  GAME_CHANNEL_NAME: 'game channels',

  ARCHIVE_CHANNEL_NAME: 'archived',
};

export default EXAMPLE_CONFIG;