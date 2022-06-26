import { TextChannel } from "discord.js";
import createInteractionHandler from "../../functions/createInteractionHandler";
import noop from "../../functions/noop";

export default createInteractionHandler("modal", async function(i) {
    if (!i.customId.startsWith('webhook_edit')) return;

    const [
        ,
        , 
        id 
    ] = i.customId.split(/_/)

    const input = i.components[0].components[0].value
    const webhook = await this.manager.getChannelWebhook(i.channel as TextChannel)
    .catch(noop)

    if (!webhook) return void i.reply({
        ephemeral: true,
        content: `Webhook not found.`
    })
    .catch(noop)

    const m = await webhook.editMessage(id, input)
    .catch(noop)

    if (!m) return void i.reply({
        ephemeral: true,
        content: `Failed to edit message.`
    })
    .catch(noop)

    i.reply({
        ephemeral: true,
        content: `Successfully edited message`
    })
    .catch(noop)
})