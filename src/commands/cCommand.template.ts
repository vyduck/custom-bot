import { SlashCommandBuilder } from "discord.js";
import { cooldownManager } from "../utils/cooldown";

export interface cCommand {
    name: string;
    description: string;
    exec: Function;
    type: "slash" |
    "common" |
    "in-text";
}

export interface prefixCommand extends cCommand {
    type: "slash" |
    "common";
    aliases: string[];
    data: SlashCommandBuilder;
    cooldown?: cooldownManager;
}

export interface intextCommand extends cCommand {
    type: "in-text";
    triggers: RegExp[];
}

export function isIntext(command: cCommand): command is intextCommand {
    if (command.type == "in-text") return true;
    else return false;
}

export function isPrefix(command: cCommand): command is prefixCommand {
    if (command.type == "common" || command.type == "slash") return true;
    else return false;
}