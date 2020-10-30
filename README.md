# Squidly

Squidly is a bot for Discord server management.

If it seems like it doesn't have a ton of functionality, that's because I'm basically writing functions into it as my server needs them. Feel free to fork or open a PR if you'd like to introduce new ones!

## Commands

### Help

`!sqd help` or `!sqd commands`

Lists all commands.

### Hello

`!sqd hello`

Just a simple ping, responds back with ~ `Hello @user!` 

### Archive

`!sqd archive #channel`

Moves a channel to archive

### Unarchive

`!sqd unarchive #channel`

Moves a channel out of archive

## Code Structure

### actions

These are specific actions, not tied to a command, that achieve a specific effect.

For example, `move-channels` is an action. This action is used by multiple commands, and each command could conceivably consist of _multiple_ actions. Keep these separate.

### api

Clients to talk to various external APIs. Currently, just has some extra Discord-related functions.

### commands

This is where you'd want to put a file for every command.

Commands are composed of multiple actions (probably) or very simple internal functions.

Each command has two methods:
- `shouldHandle`: This is called to determine whether or not this command _should_ be called
- `handle`: This is called when the program determines this is the appropriate command to call, and `handle` actually executes the command

### constants

Any constants you want. Currently just has colors for embed messages

### env

Store your specific application credentials here. See example for details on the config options

### hooks

These handle different hooks into your application. From either the Discord interface (message) or a simple timed hook (cron).

The hook files should determine which commands to execute, given the trigger, run then, and return any necessary feedback (success message) to the users.

### types

TypeScript types for this program.

### utils

Various helper functions

## Contact & License
Author: Matthew Balmer  
Email: contact@mattbalmer.com  
Twitter: @mattbalmer  
Website: http://mattbalmer.com  
License: MIT 