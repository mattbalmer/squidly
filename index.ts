import ENV from 'squidly/env';
import * as Discord from 'discord.js';
import { ClientUser } from 'discord.js';
import { handle } from 'squidly/hooks/message';
import initCron from 'squidly/hooks/cron';

const ALIAS_TRIGGERS = ENV.ALIASES.map(alias => `!${alias}`);

const client = new Discord.Client();
let botUser: ClientUser = null;

client.on('ready', () => {
  console.info(`Logged in as ${client.user.tag}!`);
  botUser = client.user;
  initCron(client);
});

client.on('message', async (message) => {
  const [tag] = message?.content?.split(' ') || [];
  const isTagMention = tag === `<@${botUser.id}>` || tag === `<@!${botUser.id}>`;
  const isTagAlias = ALIAS_TRIGGERS.includes(tag);

  if (isTagAlias || isTagMention) {
    await handle(client, message);
  }
});

client.login(ENV.BOT_TOKEN)
  .then(() => console.log(`${ENV.BOT_NAME} bot successfully signed in.`))
  .catch(() => console.log(`Error signing in ${ENV.BOT_NAME} bot.`));