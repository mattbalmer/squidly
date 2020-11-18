import { Message } from 'discord.js';
import { Command } from 'squidly/types';
import { random } from 'squidly/utils/math';
import { randomElement } from 'squidly/utils/arrays';
import { capitalize } from 'squidly/utils/strings';

const Keywords = [
  'hello',
  'hello!',
  'hey',
  'hi',
  'hallo',
  'hola'
];

const HappyEmoji = [
  ':grinning:',
  ':slight_smile:',
  ':wink:',
  ':smiley:'
];

const AngryEmoji = [
  ':unamused:',
  ':rage:',
  ':poop:',
  ':shit:',
];

export const HelloCommand: Command = {
  shouldHandle: (message, { command }) =>
    Keywords.includes(command),

  handle: async (message: Message, { command }) => {
    const chance = random();

    if(chance < .05) {
      const emoji = randomElement(AngryEmoji);
      message.channel.send(`Oh ... hey <@${message.author.id}> ${emoji}`);
    } else {
      const emoji = randomElement(HappyEmoji);
      message.channel.send(`${capitalize(command)}, <@${message.author.id}>! ${emoji}`);
    }
  },
};