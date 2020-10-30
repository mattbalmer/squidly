import ENV from 'squidly/env';
import fetch from 'node-fetch';

const authfetch = (method, url, body = null, options = {}) =>
  fetch(`https://discordapp.com/api${url}`, {
    method,
    body: body ? JSON.stringify(body) : undefined,
    headers: {
      'Authorization': `Bot ${ENV.BOT_TOKEN}`,
      'Content-Type': 'application/json',
    },
  })

/*
 To be completely honest, I don't recall why exactly I created this.
 It was either a lack of specific functionality from discord.js, or
 I just couldn't figure out how to get it to do what I wanted and
 wrote these to avoid reading more docs. Will replace one day.
 */
const DiscordAPI = {
  channels: {
    async get(channelID: string) {
      return await authfetch('GET', `/channels/${channelID}`).then(res => res.json())
        .catch(err => {
          throw err;
        });
    },
    async update(channelID: string, patch: object) {
      return await authfetch('PATCH', `/channels/${channelID}`, patch).then(res => res.json())
        .catch(err => {
          throw err;
        });
    },
    messages: {
      async post(channelID: string, body: object) {
        return await authfetch('POST', `/channels/${channelID}/messages`, body).then(res => res.json())
          .catch(err => {
            throw err;
          });
      },
    },
  },
  guilds: {
    async get(guildID: string) {
      return await authfetch('GET', `/guilds/${guildID}`).then(res => res.json())
        .catch(err => {
          throw err;
        });
    },
    channels: {
      async get(guildID: string) {
        return await authfetch('GET', `/guilds/${guildID}/channels`).then(res => res.json())
          .catch(err => {
            throw err;
          });
      },
      async updatePositions(guildID: string, patch) {
        return await authfetch('PATCH', `/guilds/${guildID}/channels`, patch)
          .catch(err => {
            throw err;
          });
      },
    },
  },
};

export default DiscordAPI;