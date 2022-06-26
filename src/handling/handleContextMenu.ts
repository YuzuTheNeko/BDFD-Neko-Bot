import { ContextMenuInteraction } from "discord.js";
import { NekoClient } from "../core/NekoClient";
import noop from "../functions/noop";

export default async function(this: NekoClient, i: ContextMenuInteraction<'cached'>) {
    const found = this.manager.contextMenus.get(i.commandName)
    if (!found) return void i.reply({
        ephemeral: true,
        content: `Command ${i.commandName} not found.`
    })
    .catch(noop)

    try {
        await found.execute.call(
            this,
            i 
        )
    } catch (error: any) {
        console.error(error)
    }
}