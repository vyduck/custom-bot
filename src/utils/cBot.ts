import { BaseInteraction, Client, Message } from "discord.js";
import path from "path";
import fs from "fs";

import { cEvent } from "../events/cEvent.template";
import { cCommand, intextCommand, isIntext, isPrefix, prefixCommand } from "../commands/cCommand.template";
import { registerCommands } from "./registerCommands";

interface Config {
    token: string;
    prefix: string;
    clientId: string;
    database_url: string;
}

export interface cBot {
    config: Config;
    client: Client;
    commandList: Map<string, cCommand | intextCommand | prefixCommand>;
    commands: Map<string, prefixCommand>;
    intext: Map<string, intextCommand>;
}


export async function createBot(config: Config) {
    // Init bot ========
    let bot: cBot = {
        config: config,
        client: new Client({
            intents: [
                "Guilds",
                "GuildMessages",
                "MessageContent"
            ],
            failIfNotExists: false,
            allowedMentions: {
                repliedUser: false
            }
        }),
        commands: new Map(),
        commandList: new Map(),
        intext: new Map()
    };

    // Add event listeners ========
    console.time("events");
    console.log("Adding event listeners...");
    const EventFolder = fs.readdirSync(path.resolve(__dirname, "../events")).filter(filename => filename.endsWith(".js") && !filename.endsWith(".template.js"));
    for (let eventFile of EventFolder) {
        const event: cEvent = require("../events/" + eventFile).default;
        if (event.once) {
            bot.client.once(event.name, (...args) => event.exec(...args));
        } else {
            bot.client.on(event.name, (...args) => event.exec(...args));
        };
    }
    console.log("Done.")
    console.timeEnd("events");

    // Add commands ========
    console.time("commands");
    console.log("Adding command handlers...");
    const CommandFolder = fs.readdirSync(path.resolve(__dirname, "../commands")).filter(filename => filename.endsWith(".js") && !filename.endsWith(".template.js"));
    const commandsRegistering: any[] = [];

    // Load Commands
    for (let commandFile of CommandFolder) {
        const command: cCommand = require("../commands/" + commandFile).default;
        bot.commandList.set(command.name, command);
        
        if (isIntext(command)) {
            for (let trigger of command.triggers) {
                bot.intext.set(trigger, command);
            };
        } else if (isPrefix(command)) {
            for (let alias of command.aliases) {
                bot.commands.set(alias, command);
            };
            commandsRegistering.push(command.data.toJSON());
        }
    };
    if (commandsRegistering.length > 0) { // Register slash commands with Discord
        await registerCommands(commandsRegistering, bot);
    };

    // Add actual command handling event listeners
    bot.client.on("messageCreate", async (message: Message) => {
        if (message.author.bot) return;
        if (message.content.startsWith(bot.config.prefix)) { // Check for prefix commands
            const commandArgs = message.content.split(" ");
            const commandName = commandArgs.shift()?.slice(1);
            const command = bot.commands.get(commandName as string);
            if (command?.type == "common") {
                command.exec(message, bot);
            };
        } else { // Check for in-text commands
            for (let trigger of bot.intext.keys()) {
                if (message.content.toLowerCase().includes(trigger)) {
                    bot.intext.get(trigger)?.exec(message, bot);
                };
            };
        }
        return;
    });

    bot.client.on("interactionCreate", async (interaction: BaseInteraction) => {
        if (interaction.isChatInputCommand()) {
            bot.commands.get(interaction.commandName)?.exec(interaction, bot);
        };
        return;
    });

    console.log("Done.");
    console.timeEnd("commands");

    // Login to discord ========
    await bot.client.login(bot.config.token);

    return bot;
}