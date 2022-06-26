import { ColorResolvable, Message, MessageAttachment, MessageEmbed, MessageMentionOptions, TextChannel } from "discord.js";
import { NekoClient } from "../core/NekoClient";
import cast from "../functions/cast";
import noop from "../functions/noop";
import { SystemMemberRequest } from "../typings/interfaces/http/SystemMemberRequest";
import { Option } from "../typings/types/Option";
import Roles from "../util/constants/Roles";
import StaffRoles from "../util/constants/StaffRoles";

export default async function(
    client: NekoClient, 
    message: Message, 
    fronter: Option<SystemMemberRequest>, 
    content: string,
    ignoreAutoProxy = false
) {
    const data = client.manager.systemMember(message.author.id)

    if (!ignoreAutoProxy) {
        if (!data.autosend) return;

        if (message.content.startsWith('\\')) {
            return;
        }
    }

    if (!fronter) return null

    const webhook = await client.manager.getChannelWebhook(message.channel as TextChannel).catch(noop)

    if (!webhook) return;

    const ref = message.reference ? await message.fetchReference().catch(noop) : null

    const authorContent = content

    let refContent = ref ? ref.stickers.size || ref.embeds.length || ref.attachments.size || ref.content ? `${ref.content || [
        ...ref.attachments.values(),
        ...ref.stickers.values()
    ].map(c => c.url).slice(0, 3).join(', ') || `(click to see attachments)`}` : null : null

    if (refContent && refContent.length > 100) refContent = `${refContent.slice(0, 100)}...`

    await webhook.send(
        {
            content: authorContent || null,
            embeds: ref ? [
                new MessageEmbed()
                .setAuthor({
                    name: `${ref.author.tag} ↩️`,
                    iconURL: ref.member ? ref.member.displayAvatarURL({ dynamic: true }) : ref.author.displayAvatarURL({ dynamic: true }),
                })
                .setColor(fronter.color as ColorResolvable)
                .setURL(ref.url)
                .setTitle(`**Reply to**: ${refContent!} 🔗`)
            ] : [],
            avatarURL: fronter.avatar_url ?? undefined,
            files: [
                ...message.attachments.map((c, y) => new MessageAttachment(c.url, `${c.name ?? `${y}.png`}`)),
                ...message.stickers.map((c, y) => new MessageAttachment(c.url, `sticker_${y}.${c.format === 'APNG' ? 'apng' : 'png'}`))
            ].slice(0, 10),
            username: `${fronter.display_name ?? fronter.name} ${data.tag ?? ''}`,
            allowedMentions: {
                parse: [
                    'users'
                ]
            }
        }
    )
    .then(() => {
        message.delete().catch(noop)
    })
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