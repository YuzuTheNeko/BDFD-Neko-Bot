import { Message, MessageAttachment, MessageMentionOptions, TextChannel } from "discord.js";
import { NekoClient } from "../core/NekoClient";
import cast from "../functions/cast";
import noop from "../functions/noop";
import StaffRoles from "../util/constants/StaffRoles";

export default async function(client: NekoClient, message: Message) {
    if (![
        StaffRoles.MODERATOR,
        StaffRoles.ADMIN_TEST,
        StaffRoles.LEAD_STAFF,
        StaffRoles.STAFF
    ].some(c => message.member?.roles.cache.has(c))) {
        return;
    }

    const data = client.manager.systemMember(message.author.id)

    if (!data.autosend) return;

    if (message.content.startsWith('\\')) {
        return;
    }

    const fronter = await client.manager.getFrontingMember(message.author.id)
 
    if (!fronter) return null

    const webhook = await client.manager.getChannelWebhook(message.channel as TextChannel).catch(noop)

    if (!webhook) return;

    message.delete().catch(noop)

    const ref = message.reference ? await message.fetchReference().catch(noop) : null

    webhook.send(
        {
            content: ref ? ref.content ? `${ref.content.split(/\n/).slice(0, 3).map(c => `> [${c}](${ref.url})`).join('\n')}\n${ref.author} ${message.content}` : `> [Click to see attachments](${ref.url})\n${ref.author} ${message.content}` : message.content || null,
            avatarURL: fronter.avatar_url ?? undefined,
            files: [
                ...message.attachments.map((c, y) => new MessageAttachment(c.url, `${c.name ?? `${y}.png`}`)),
                ...message.stickers.map((c, y) => new MessageAttachment(c.url, `sticker_${y}.${c.format === 'APNG' ? 'apng' : 'png'}`))
            ],
            username: `${fronter.display_name ?? fronter.name} ${data.tag ?? ''}`,
            allowedMentions: {
                parse: [
                    'users'
                ]
            }
        }
    )
    .catch(err => {
        if (!err.message.toLowerCase().includes("unknown")) return;
        const data = client.manager.channel(message.channel.id)
        data.webhook_url = null
        client.db.upsert("channels", cast(data), {
            column: 'channel_id',
            equals: message.channel.id
        })
    })
}