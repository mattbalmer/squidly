import * as Discord from 'discord.js';
import { Client, Message, Permissions, TextChannel, VoiceChannel } from 'discord.js';
import ENV from 'squidly/env';
import { moveChannels } from 'squidly/actions/move-channels';
import { EMBED_COLORS } from 'squidly/constants/colors';
import { HelloCommand } from 'squidly/commands';
import { buildQueryFromNameOrID, getChannel } from 'squidly/utils/discord';
import { CommandMetadata } from 'squidly/types';
import { BanRoulette } from 'squidly/commands/banroulette';
import { MostSquotable } from 'squidly/commands/most-squotable';

export async function handle(client: Client, message: Message) {
  const [tag, command, ...args] = message?.content?.split(' ') || [];
  const commandMetadata: CommandMetadata = { tag, command, args };
  const guildID = message.guild?.id;

  try {

    // Help command: list other commands
    if(command === 'commands' || command === 'help') {
      const embed = new Discord.MessageEmbed()
        .setColor(EMBED_COLORS.SUCCESS)
        .setTitle(`Squidly commands`)
        .addFields([{
          name: 'hello',
          value: `Returns a simple text response, to determine that the bot is functioning.\n\nUsage: !sqd hello`
        }, {
          name: 'archive',
          value: `Moves the given channel, or channels to the "archive" category.\n\nUsage: !sqd archive <channel>`
        }, {
          name: 'unarchive',
          value: `Moves the given channel, or channels to the "games" category.\n\nUsage: !sqd archive <channel>`
        }])
      ;
      message.channel.send(embed);

    // Example of contained commands
    // This one just pings back when it sees "hello"
    } else if(HelloCommand.shouldHandle(message, commandMetadata)) {
      HelloCommand.handle(message, commandMetadata);

    // Examples of inline commands
    // Move a channel from it's current category to the "ARCHIVED" channel category
    } else if(command === 'archive') {
      if (message.member?.permissions?.has(Permissions.FLAGS.MANAGE_CHANNELS)) {
        const channels: TextChannel[] = args
          .map(nameOrID => getChannel(client,{
            'guild.id': guildID,
            type: 'text',
            ...buildQueryFromNameOrID(nameOrID)
          }) as TextChannel);
        await moveChannels(client, guildID, channels, ENV.ARCHIVE_CHANNEL_NAME);
        const embed = new Discord.MessageEmbed()
          .setColor(EMBED_COLORS.SUCCESS)
          .setDescription(`Channels successfully archived.`)
          .addField('Channels', channels.map(channel => `<#${channel.id}>`).join(', '))
        ;
        message.channel.send(embed);
      } else {
        const embed = new Discord.MessageEmbed()
          .setColor(EMBED_COLORS.FAILURE)
          .setDescription(`You lack the necessary permissions to archive channels`)
          .addField('Permissions', 'MANAGE_CHANNELS')
        ;
        message.channel.send(embed);
      }

    // Move a channel to the "GAME CHANNELS" category (presumably from out of archive)
    } else if(command === 'unarchive') {
      if (message.member?.permissions?.has(Permissions.FLAGS.MANAGE_CHANNELS)) {
        const channels: TextChannel[] = args
          .map(nameOrID => getChannel(client,{
            'guild.id': guildID,
            type: 'text',
            ...buildQueryFromNameOrID(nameOrID)
          }) as TextChannel);
        await moveChannels(client, guildID, channels, ENV.GAME_CHANNEL_NAME);
        const embed = new Discord.MessageEmbed()
          .setColor(EMBED_COLORS.SUCCESS)
          .setDescription(`Channels successfully pulled from archive.`)
          .addField('Channels', channels.map(channel => `<#${channel.id}>`).join(', '))
        ;
        message.channel.send(embed);
      } else {
        const embed = new Discord.MessageEmbed()
          .setColor(EMBED_COLORS.FAILURE)
          .setDescription(`You lack the necessary permissions to unarchive channels`)
          .addField('Permissions', 'MANAGE_CHANNELS')
        ;
        message.channel.send(embed);
      }

    // Move a channel to the "GAME CHANNELS" category (presumably from out of archive)
    } else if(BanRoulette.shouldHandle(message, commandMetadata)) {
      BanRoulette.handle(message, commandMetadata);

    // Figure out the member who is squoted the most
    } else if(MostSquotable.shouldHandle(message, commandMetadata)) {
      MostSquotable.handle(message, commandMetadata);

    // Unrecognized command
    } else {
      const embed = new Discord.MessageEmbed()
        .setColor(EMBED_COLORS.WARNING)
        .setTitle(`Unrecognized command`)
        .setDescription(`Did not recognize command "${command}", try "!sqd help" for more info.`)
      ;
      message.channel.send(embed);
    }

  // Something went wrong
  } catch (error) {
    const embed = new Discord.MessageEmbed()
      .setColor(EMBED_COLORS.FAILURE)
      .setDescription(`An unknown error occurred`)
      .addField('Error', error.message)
    ;
    message.channel.send(embed);
    throw error;
  }
}