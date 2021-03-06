import { GuildTextBasedChannel, Message, TextBasedChannel } from "discord.js";
import { Option } from "../typings/types/Option";
import deleteAfter from "./deleteAfter";
import noop from "./noop";

export default async function(
    channel: GuildTextBasedChannel, 
    id: string,
    text: string, 
    time = 30_000
): Promise<Option<Message | undefined>> {
    const msg = await channel.send({
        content: `${text}\nYou have ${time / 1000} seconds to reply.\nType \`cancel\` to cancel the operation.`
    })

    const collected = await channel.awaitMessages({
        filter: m => m.author.id === id,
        time,
        max: 1,
        errors: [ 'time' ]
    })
    .catch(noop)

    msg.delete().catch(noop)

    if (!collected) {
        channel.send(`You did not reply in time, operation cancelled.`).then(deleteAfter).catch(noop)
        return null
    }

    const m = collected.first()!

    if (m.content.toLowerCase() === 'cancel') {
        channel.send(`Operation has been cancelled.`).then(deleteAfter).catch(noop)
        return undefined
    }

    return m 
}