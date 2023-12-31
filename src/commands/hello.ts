import { Message, SlashCommandBuilder } from "discord.js";
import { intextCommand } from "./cCommand.template";

const hello: intextCommand = {
    name: "hello",
    description: "Greets people back if they are greeting.",
    triggers: [/\bhello\b/, /\bhi\b/],
    type: "in-text",
    exec: (message: Message) => {
        message.channel.send("Hello there.");
        return;
    }
}

export default hello;