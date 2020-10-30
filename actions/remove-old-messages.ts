import { Client, Message, TextChannel } from "discord.js";
import { getChannel } from 'squidly/utils/discord';

const getOldMessages = async (channel: TextChannel, maxAgeTimestamp) => {
  const messages = await channel.messages.fetch();

  return messages.filter(message => {
    return message.createdTimestamp <= maxAgeTimestamp && !message.pinned;
  });
};

export const removeOldMessages = async (client: Client, channelName: string, maxAgeTimestamp: number) => {
  const targetChannels: TextChannel[] = client.guilds.cache.map(guild => {
    return getChannel(client, {
      type: 'text',
      name: channelName,
      'guild.id': guild.id,
    }) as TextChannel
  }).filter(channel => !!channel);

  const oldMessagesPerChannel: {
    channel: TextChannel,
    messages: Message[],
  }[] = await Promise.all(
    targetChannels.map(async channel => {
      const messages = await getOldMessages(channel, maxAgeTimestamp);
      return {
        channel,
        messages: Array.from(messages).map(([, message]) => message),
      }
    })
  );

  await Promise.all(oldMessagesPerChannel.map(async ({ channel, messages }) => {
    return await channel.bulkDelete(messages);
  }));
}