import { CategoryChannel, Client, TextChannel } from "discord.js";
import { getChannel } from 'squidly/utils/discord';
import DiscordAPI from 'api/discord-api';
import { sortChannels } from 'squidly/actions/sort-channels';

export const moveChannels = async (client: Client, guildID: string, channels: TextChannel[], targetChannelName: string) => {
  const targetCategory: CategoryChannel = getChannel(client, {
    type: 'category',
    name: targetChannelName,
    'guild.id': guildID,
  }) as CategoryChannel;

  await Promise.all(channels.map(async channel => {
    if(channel.parentID !== targetCategory.id) {
      const parent: CategoryChannel = await client.channels.fetch(targetCategory.id) as CategoryChannel;
      await channel.edit({
        parentID: parent.id,
        permissionOverwrites: parent.permissionOverwrites,
      })
    }
  }));

  const guildChannels = await DiscordAPI.guilds.channels.get(guildID);
  const categoryChannels = guildChannels
    .filter(channel => channel.parent_id === targetCategory.id);

  await sortChannels(guildID, categoryChannels);
}