import * as Discord from 'discord.js';
import { Message, GuildChannel, TextChannel } from 'discord.js';
import { Command } from 'squidly/types';
import { mostFrequentElement } from 'squidly/utils/arrays';
import { EMBED_COLORS } from 'squidly/constants/colors';

const Keywords = [
  'squotable',
  'squoteable',
  'most_squotable',
  'most_squoteable',
  'squotiest',
  'squoteist',
  'most_squotiest',
  'most_squoteist',
  'top_squoter',
  'best_squoter',
  'funniest_member',
  'funniest_user'
];

export const MostSquotable: Command = {
  shouldHandle: (message, { command }) =>
  Keywords.includes(command),
  
  handle: async (message: Message, { tag, command, args }) => {
    const squotesChannel = message.guild.channels.cache.find((channel: GuildChannel) => {
      if (channel.name === "squotes") {
        return true;
      };
    }) as TextChannel;

    const messageCollection = await squotesChannel.messages.fetch();
    const squotesMessages = messageCollection.array();
    let mentionedDisplayNames: string[] = [];

    for (let i: number = 0; i < squotesMessages.length; i++) {
      let currentMembersMentioned = squotesMessages[i].mentions.members.array();
      if (currentMembersMentioned.length > 0) {
        let lastMentionedMember = currentMembersMentioned[currentMembersMentioned.length - 1];
        mentionedDisplayNames.push(lastMentionedMember.displayName);
      };
    };

    let mostSquotedMember = mostFrequentElement(mentionedDisplayNames);

    message.channel.send(new Discord.MessageEmbed()
        .setColor(EMBED_COLORS.SUCCESS)
        .setDescription(`Looks as though people think ${mostSquotedMember} is the funniest member of Spanksquad! Try harder, everyone else!`)
    )
  }
};
