import { Client } from "discord.js";
import { cEvent } from "./cEvent.template";

const ready: cEvent = {
    name: "ready",
    once: true,
    exec: async (Client: Client) => {
        console.log(`Logged in as: ${Client.user?.username}#${Client.user?.discriminator}`);
        return;
    }
}

export default ready;