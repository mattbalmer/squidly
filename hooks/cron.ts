import * as cron from 'node-cron';
import { Client } from 'discord.js';
import ENV from 'squidly/env';
import { removeOldMessages } from 'squidly/actions/remove-old-messages';

export default (client: Client) => {
  cron.schedule('* * * * *', () => {
    const now = Date.now();
    const threshold = now - ENV.LIVE_CHANNEL.MAX_AGE;
    console.log('Remove old messages', new Date(threshold));
    removeOldMessages(client, ENV.LIVE_CHANNEL.NAME, threshold);
  });
}