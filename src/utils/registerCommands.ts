import { REST, Routes } from "discord.js";
import { cBot } from "./cBot";

export async function registerCommands (commandData: any[], bot: cBot) {
    const rest = new REST().setToken(bot.config.token);
    console.log(`  Registering ${commandData.length} commands...`);
    await rest.put(
        Routes.applicationCommands(bot.config.clientId),
        { body: commandData }
    );
    console.log("  Done.")
}