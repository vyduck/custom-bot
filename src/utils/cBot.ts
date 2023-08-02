import { BaseInteraction, Client, CommandInteraction, SlashCommandBuilder } from "discord.js";
import { cEvent } from "../events/cEvent.template";
import { cCommand } from "../commands/cCommand.template";
import path from "path";
import fs from "fs";
import { registerCommands } from "./registerCommands";

interface Config {
    token: string;
    prefix: string;
    clientId: string;
}

export interface cBot {
    config: Config;
    client: Client;
    commandList: cCommand[];
    triggers: Map<string, cCommand>;
}


export function createBot(config: Config) {
    // Init bot
    let bot: cBot = {
        config: config,
        client: new Client({
            intents: [
                "Guilds",
                "GuildMessages",
                "MessageContent"
            ],
            failIfNotExists: false,
        }),
        triggers: new Map(),
        commandList: []
    };

    // Add event listeners
    console.log("Adding event listeners...")
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

    // Add commands
    console.log("Adding command handlers...")
    const CommandFolder = fs.readdirSync(path.resolve(__dirname, "../commands")).filter(filename => filename.endsWith(".js") && !filename.endsWith(".template.js"));
    const commandsRegistering: any[] = [];
    for (let commandFile of CommandFolder) {
        const command: cCommand = require("../commands/" + commandFile).default;
        for (let trigger of command.triggers) {
            bot.triggers.set(trigger, command);
        };
        bot.commandList.push(command);
        if (command.type == "common" || command.type == "slash") {
            commandsRegistering.push(command.data?.toJSON());
        }
    };
    if (commandsRegistering.length > 0) {
        registerCommands(commandsRegistering, bot);
    };

    bot.client.on("messageCreate", (message) => {
        if (message.author.bot) return;
        if (message.content.startsWith(bot.config.prefix)) {
            const commandArgs = message.content.split(" ");
            const commandName = commandArgs.shift()?.slice(1);
            const command = bot.triggers.get(commandName as string);
            if (command?.type == "common") {
                command.exec(message, bot);
            };
        } else {
            for (let trigger of bot.triggers.keys()) {
                if (message.content.toLowerCase().includes(trigger)) {
                    bot.triggers.get(trigger)?.exec(message);
                };
            };
        }
    });

    bot.client.on("interactionCreate", (interaction: BaseInteraction) => {
        if (interaction.isChatInputCommand()) {
            bot.triggers.get(interaction.commandName)?.exec(interaction, bot);
        };
    });
    
    console.log("Done.")

    // Login to discord    
    bot.client.login(bot.config.token);

    return bot;
}