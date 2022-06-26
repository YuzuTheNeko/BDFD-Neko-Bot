import { GuildBasedChannel, MessageEmbed, TextChannel } from "discord.js";
import cast from "../../functions/cast";
import noop from "../../functions/noop";
import { Command } from "../../structures/Command";
import StaffRoles from "../../util/constants/StaffRoles";

export default new Command<[
    GuildBasedChannel
]>({
    name: 'esnipe',
    description: 'shows last message edited in a channel.',
    args: [
        {
            name: 'channel',
            required: false,
            type: 'CHANNEL'
        }
    ],
    roles: [
        StaffRoles.ADMIN_TEST,
        StaffRoles.LEAD_STAFF,
        StaffRoles.MODERATOR
    ],
    execute: async function(message, [ channel ]) {
        channel = channel ?? message.channel

        if (!channel.isText()) {
            return void message.channel.send({
                embeds: [
                    this.embed(message.member!, 'RED')
                    .setTitle(`Unknown Channel`)
                    .setDescription(`This channel has nothing to esnipe or it is not valid or you do not have permissions to see it.`)
                ]
            })
        }

        const ch: TextChannel = cast(channel)

        const snipe = this.manager.esnipes.get(channel.id)

        if (!snipe || !ch.permissionsFor(message.member!).has('VIEW_CHANNEL')) {
            return void message.channel.send({
                embeds: [
                    this.embed(message.member!, 'RED')
                    .setTitle(`Unknown Channel`)
                    .setDescription(`This channel has nothing to esnipe or it is not valid or you do not have permissions to see it.`)
                ]
            })
        }

        const embed = new MessageEmbed()
        .setColor(snipe.member?.displayHexColor ?? 'BLUE')
        .setAuthor({
            name: snipe.author.tag,
            iconURL: snipe.member?.displayAvatarURL({ dynamic: true }) ?? snipe.author.displayAvatarURL({ dynamic: true })
        })
        .setDescription(snipe.content || "No content")
        .setFooter({
            text: snipe.id
        })
        .setTimestamp(snipe.createdTimestamp)

        if (snipe.attachments.size) {
            embed.setThumbnail(snipe.attachments.first()?.url!)
        }

        message.channel.send({
            embeds: [
                embed
            ]
        })
        .catch(noop)
    }
})