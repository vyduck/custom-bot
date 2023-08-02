import { SlashCommandBuilder } from "discord.js";

export interface cCommand {
    name: string;
    exec: Function;
    type: "in-text" |
        "slash" |
        "common";
    data?: SlashCommandBuilder;
    triggers: string[];
}