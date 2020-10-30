import { Client, GuildChannel } from "discord.js";
import { valueAtPath } from 'squidly/utils/objects';

export const buildQueryFromNameOrID = (nameOrID: string) => {
  const query: any = {};

  if (nameOrID.startsWith('<#')) {
    query.id = (/<#(.*?)>/g).exec(nameOrID)[1];
  } else {
    query.name = nameOrID;
  }

  return query;
}

function doValuesMatch(path, source, test) {
  const sourceValue = valueAtPath(source, path);
  const testValue = test[path];
  if (path === 'name') {
    return sourceValue?.toLowerCase() === testValue?.toLowerCase()
  } else {
    return sourceValue === testValue;
  }
}

export const getChannel = (client: Client, props: object): GuildChannel =>
  client.channels.cache.find(channel => {
    return Object.keys(props).reduce((contains, path) => {
      return contains
        ? doValuesMatch(path, channel, props)
        : false;
    }, true);
  }) as GuildChannel;
