import { Message, SlashCommandBuilder } from "discord.js";
import { cCommand } from "./cCommand.template";

const hello: cCommand = {
    name: "hello",
    triggers: ["hello", "hi"],
    type: "common",
    exec: (message: Message) => {
        message.channel.send("Hello there.");
        return;
    },
    data: new SlashCommandBuilder()
        .setName("hello")
        .setDescription("Replies with hello.")
}

export default hello;