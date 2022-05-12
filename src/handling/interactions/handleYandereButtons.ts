import createInteractionHandler from "../../functions/createInteractionHandler";
import displayYandereEmbed from "../../functions/displayYandereEmbed";
import noop from "../../functions/noop";

export default createInteractionHandler("button", function(btn) {
    if (!btn.customId.startsWith("yandere") || !btn.customId.includes(btn.user.id)) return;

    const [
        ,
        action,
        rawIndex,
        ,
        ...str
    ] = btn.customId.split(/_/)

    const s = str.join('_')

    const index = Number(rawIndex)

    const exists = this.postCache.get(s)

    if (!exists) return void btn.reply({
        ephemeral: true,
        content: `Cache expired.`
    })
    .catch(noop)

    exists.timeout.refresh()

    btn.update(displayYandereEmbed(
        exists.posts,
        s,
        action === 'back' ? index - 1 : index + 1,
        btn.user
    ))
    .catch(noop)
})