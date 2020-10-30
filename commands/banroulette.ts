import * as Discord from 'discord.js';
import { GuildMember, Message, VoiceChannel } from 'discord.js';
import { Command } from 'squidly/types';
import { randomElement } from 'squidly/utils/arrays';
import { EMBED_COLORS } from 'squidly/constants/colors';
import { allSettled } from 'squidly/utils/promises';

const ROLE_NAME = 'Banrouletter';

const ONE_HOUR = 1000 * 60 * 60;
const ONE_DAY = ONE_HOUR * 24;
const ONE_WEEK = ONE_DAY * 7;
const ONE_MONTH = ONE_WEEK * 4;

const PREVIOUS_KICK_TIMES_BY_USER: Record<string, number[]> = {};
const KICK_ALLOWED_TIMES_BY_USER: Record<string, number> = {};

const MAX_KICKS_PER_HOUR_PRE_BUFFER = 3;
const MAX_KICKS_PER_DAY_PRE_BUFFER_INCREASE = 1;

const getNextKickableDate = (userID, now) => {
  const previousKicksWithinWeek = (PREVIOUS_KICK_TIMES_BY_USER[userID] || []).filter(time => {
    const difference = now - time;
    return difference <= ONE_WEEK;
  });
  const previousKicksWithinThreeDays = previousKicksWithinWeek.filter(time => {
    const difference = now - time;
    return difference <= (ONE_DAY * 3);
  });
  const previousKicksWithinDay = previousKicksWithinThreeDays.filter(time => {
    const difference = now - time;
    return difference <= ONE_DAY;
  });
  const previousKicksWithinHour = previousKicksWithinDay.filter(time => {
    const difference = now - time;
    return difference <= ONE_HOUR;
  });

  // Get # of unique kicks per timeframe
  const numKicksThisHour = previousKicksWithinHour.length;
  const numKicksToday = previousKicksWithinDay.length - numKicksThisHour;
  const numKicksPastThreeDays = previousKicksWithinDay.length - numKicksToday;
  const numKicksThisWeek = previousKicksWithinWeek.length - numKicksPastThreeDays;

  // If 4th time being kicked within 1 hr, make unkickable for next an hour
  if (numKicksThisHour > MAX_KICKS_PER_HOUR_PRE_BUFFER) {
    return now + ONE_HOUR;
  }

  // If has already been kicked twice today
  if (numKicksToday > MAX_KICKS_PER_DAY_PRE_BUFFER_INCREASE) {

    // If also has been kicked within past 3 days
    if (numKicksPastThreeDays > 0) {

      // If also has been kicked within past 7 days
      // Then make buffer three days
      if (numKicksPastThreeDays > 0) {
        return now + (ONE_DAY * 3);
      }

      // Then make buffer a full day
      return now + (ONE_DAY * 1);
    }

    // Then make buffer an hour
    return now + ONE_HOUR;
  }

  // If first time this hour, and first time today, but has been kicked within past three days
  // Then set buffer time to 1 day
  if (numKicksPastThreeDays > 0) {
    return now + ONE_DAY;
  }

  // If first time being kicked, set for now
  return now;
};

const getKickableMembers = async (channel: VoiceChannel, now) => {
  const validMembersByTimestamp = channel.members.filter(member => {
    const nextKickable = KICK_ALLOWED_TIMES_BY_USER[member.id] || now;
    return nextKickable <= now;
  });

  const refreshedMembersPromises = validMembersByTimestamp.array().map(async (member) =>
    await member.fetch(true)
  );

  const refreshedMembers = (await allSettled(refreshedMembersPromises))
    .map(response => response.value);

  return refreshedMembers.filter(member => {
    const isMemberBanrouletter = member.roles.cache.some(role => role.name === ROLE_NAME);
    return isMemberBanrouletter;
  });
}

const Keywords = [
  'banroulette',
];

export const BanRoulette: Command = {
  shouldHandle: (message, { command }) =>
    Keywords.includes(command),

  handle: async (message: Message, { tag, command, args }) => {
    const now = (new Date()).getTime();
    const actor: GuildMember = await message?.member.fetch(true);
    const targetChannel: VoiceChannel = (await message.guild.fetch()).afkChannel;

    const isActorBanrouletter = actor?.roles.cache.some(role => role.name === ROLE_NAME);

    if (!actor || !isActorBanrouletter) {
      message.channel.send(new Discord.MessageEmbed()
        .setColor(EMBED_COLORS.FAILURE)
        .setDescription(`You may not use banroulette if you do not have the ${ROLE_NAME} role`)
        .addField('Role lacking', ROLE_NAME));
      return;
    }

    const actorName = actor.nickname || actor.displayName;

    const channel: VoiceChannel = await message.member?.voice?.channel?.fetch(true) as VoiceChannel;

    const kickableMembers = await getKickableMembers(channel, now);

    const unluckyMember: GuildMember = randomElement(kickableMembers);

    if (!unluckyMember) {
      message.channel.send(new Discord.MessageEmbed()
        .setColor(EMBED_COLORS.FAILURE)
        .setDescription(`No valid members for banroulette. Slow down!`));
      return;
    }

    KICK_ALLOWED_TIMES_BY_USER[unluckyMember.id] = getNextKickableDate(unluckyMember.id, now);
    PREVIOUS_KICK_TIMES_BY_USER[unluckyMember.id] = [
      now,
      ...(PREVIOUS_KICK_TIMES_BY_USER[unluckyMember.id] || []),
    ];

    const hasBuffer = KICK_ALLOWED_TIMES_BY_USER[unluckyMember.id] !== now;

    const safeDate = new Date(KICK_ALLOWED_TIMES_BY_USER[unluckyMember.id]).toLocaleString('en-US', {
      weekday: 'long',
    });
    const safeTime = new Date(KICK_ALLOWED_TIMES_BY_USER[unluckyMember.id]).toLocaleString('en-US', {
      hour12: true,
      hour: 'numeric',
      minute: '2-digit',
      timeZone: 'America/New_York',
      timeZoneName: 'short',
    });

    try {
      await unluckyMember.edit({
        channel: targetChannel,
      });

      message.channel.send(new Discord.MessageEmbed()
        .setColor(EMBED_COLORS.SUCCESS)
        .setDescription(`${unluckyMember.nickname || unluckyMember.displayName} got Banrouletted by ${actorName}.${hasBuffer ? `\nThey are safe until ${safeTime} ${safeDate}.` : ''}`));
    } catch(error) {
      message.channel.send(new Discord.MessageEmbed()
        .setColor(EMBED_COLORS.FAILURE)
        .setDescription(`Something went wrong during banroulette`)
        .addField('Error', error.message)
      );
      throw error;
    }

    try {
      (await unluckyMember.createDM())
        .send(`You got Banrouletted by ${actorName}. Please feel free to rejoin and give them shit.\n${hasBuffer ? `And don't worry, you're safe until ${safeTime} ${safeDate}.` : ''}`);
    } catch (error) {
      console.log(`Swallow this, it's not super important`)
    }
  },
};