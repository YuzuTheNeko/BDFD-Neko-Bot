import createDiscordEvent from "../../functions/createDiscordEvent";
import fetchGiveaways from "../../functions/fetchGiveaways";
import { toPluralWith } from "../../functions/toPlural";

export default createDiscordEvent("ready", async function() {
    this.manager.lavalink.init(this.user.id)
    
    this.manager.loadCommands()
    this.manager.loadContextMenus()

    this.mainGuild.commands.set([...this.manager.contextMenus.values()])

    fetchGiveaways(this)

    console.log(`Ready on client ${this.user.tag} and loaded ${toPluralWith('command', this.manager.commands.size)}.`)
})