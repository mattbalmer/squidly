import * as Discord from 'discord.js';
import ENV from 'squidly/env';
import { Message, GuildChannel, TextChannel } from 'discord.js';
import { Command } from 'squidly/types';
import { mostFrequentElements, randomElement } from 'squidly/utils/arrays';
import { EMBED_COLORS } from 'squidly/constants/colors';
import { allSettled } from 'squidly/utils/promises';
import { handle } from 'squidly/hooks/message';

const Keywords = [
  'squotable',
  'squoteable',
  'squotiest',
  'squoteist',
  'quotable',
  'quoteable',
  'most',
];

async function fetchAllMessages(channel: Discord.TextChannel) {
  const BATCH_SIZE = 100;
  let fetchedMessages = await channel.messages.fetch({ limit: BATCH_SIZE });
  let allMessages: Message[] = [];
  allMessages = allMessages.concat(fetchedMessages.array());

  while(fetchedMessages.array().length === BATCH_SIZE) {
    let oldestMessage = allMessages[allMessages.length - 1];
    fetchedMessages = await channel.messages.fetch({
      limit: BATCH_SIZE,
      before: oldestMessage.id,
    });
    allMessages = allMessages.concat(fetchedMessages.array());
  }
  return allMessages;
};

const handlePlural = (memberNames: string[]) => {
  if (memberNames.length === 2) {
    return `${memberNames[0]} and ${memberNames[1]}`
  } else {
    const allOtherMemberNames = memberNames.slice(0, -1);
    const lastMentionedMemberName = memberNames[memberNames.length - 1];
    return `${allOtherMemberNames.join(', ')}, and ${lastMentionedMemberName}`;
  }
};

// TODO: incorporate squoteCount
// TODO: more plural botReplies
export const MostSquotable: Command = {
  shouldHandle: (message, { command }) =>
    Keywords.includes(command),
  
  handle: async (message: Message, { tag, command, args }) => {
    const squotesChannel = message.guild.channels.cache
      .find((channel: GuildChannel) => channel.name === ENV.QUOTES_CHANNEL_NAME) as TextChannel;

    const messageCollection = await fetchAllMessages(squotesChannel);

    const mentionedMembers: Discord.User[] = messageCollection.reduce((mentionedMembers, message) => {
      return [...mentionedMembers, ...message.mentions.users.array()];
    }, []);

    const mostSquotedMembers: {
      count: number,
      value: Discord.GuildMember,
    }[] = (await allSettled(mostFrequentElements(mentionedMembers, element => element.id)
      .map(async (element) => {
        const member = await message.guild.members.fetch(element.value.id);
        return {
          count: element.count,
          value: member,
        };
      })
    )).map(response => response.value);

    const serverName = message.guild.name;

    if (mostSquotedMembers.length > 1) {
      const memberNames = mostSquotedMembers.map((result) => result.value.nickname || result.value.displayName);
      const squoteCount = mostSquotedMembers[0].count;

      const botReplies = [
        `Pack your bags, fuckers -- ${handlePlural(memberNames)} are funnier than you!`,
      ];

      message.channel.send(new Discord.MessageEmbed()
          .setColor(EMBED_COLORS.SUCCESS)
          .setDescription(randomElement(botReplies))
          .addFields([{
            name: 'Squotes: ',
            value: `${squoteCount}`
          }])
      );
    } else if (mostSquotedMembers.length === 1) {
      const mostSquotedMember = mostSquotedMembers[0];
      const memberName = mostSquotedMember.value.nickname || mostSquotedMember.value.displayName;
      const squoteCount = mostSquotedMember.count;
  
      const botReplies = [
        `Looks as though people think ${memberName} is the funniest member of ${serverName}! Try harder, everyone else!`,
        `Would you look at that? The squotiest member of ${serverName} is apparently ${memberName}!`,
        `What a day it is to be ${memberName}, the funniest member of ${serverName}!`,
        `Pack your bags, fuckers -- ${memberName} is funnier than you!`,
        `If I had two cents for every time ${memberName} was the funniest member of ${serverName}, I'd have the sense to give up!`,
        `What's that? It's the sound of ${memberName} being more squotable than you!`,
        `Looks like ${memberName} has the most squotes! You deserve a raise, but I pay you nothing!`,
        `"Knock knock! "Hello?" "It's me, ${memberName}, the most squoted person in ${serverName}!"`,
        `""A facility for quotation covers the absence of original thought." -- Dorothy Sayers" --${memberName}`,
        `Really, everyone? ${memberName} is the funniest one here? Seriously?`,
      ];
  
      // a bot reply that responds with something different in the event of a tie
  
      message.channel.send(new Discord.MessageEmbed()
          .setColor(EMBED_COLORS.SUCCESS)
          .setDescription(randomElement(botReplies))
      );
    } else {
      // TODO: handle null case
    }
  },
};
