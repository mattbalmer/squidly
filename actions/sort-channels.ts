import { allSettled } from 'squidly/utils/promises';
import DiscordAPI from 'squidly/api/discord-api';

export const sortChannels = async (guildID: string, channels: any[]) => {
  const positions: {
    channel: string,
    position: number,
  }[] = channels
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((channel, i) => ({
      position: i + 1,
      channel: channel.id,
    }));

  return await allSettled(positions.map(async ({ channel, position }) => {
    return await DiscordAPI.channels.update(channel, { position });
  }));
}