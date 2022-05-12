import { MessageActionRow, MessageButton, MessageEmbed, User } from "discord.js"
import { Search } from "yande.re-api/dist/structures/Search"

export default function(query: Search, str: string, index = 0, user: User) {
    const row = new MessageActionRow()
    .addComponents(
        new MessageButton()
        .setStyle('PRIMARY')
        .setLabel(`Back`)
        .setDisabled(index === 0)
        .setCustomId(`yandere_back_${index}_${user.id}_${str}`),
        new MessageButton()
        .setLabel(`Next`) 
        .setStyle("PRIMARY")
        .setDisabled(query.length === index + 1)
        .setCustomId(`yandere_next_${index}_${user.id}_${str}`)
    )

    const post = query[index]

    const embed = new MessageEmbed()
    .setColor(`RANDOM`)
    .setAuthor({
        name: user.tag,
        iconURL: user.displayAvatarURL()
    })
    .addFields({
        name: `ID`,
        value: post.data.id.toString(),
        inline: true 
    }, {
        name: `Author`,
        value: post.data.author,
        inline: true 
    }, {
        name: `Tags`,
        value: post.data.tags,
        inline: true 
    }, {
        name: `Size`,
        value: `${post.data.width}x${post.data.height}`,
        inline: true 
    })
    .setImage(post.data.file_url)
    .setFooter({
        text: `Image ${index + 1} / ${query.length}`
    })

    return {
        embeds: [
            embed
        ],
        components: [
            row
        ]
    }
}