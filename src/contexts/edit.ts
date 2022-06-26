import { GuildTextBasedChannel, MessageActionRow, Modal, TextChannel, TextInputComponent } from "discord.js";
import { ApplicationCommandTypes, TextInputStyles } from "discord.js/typings/enums";
import createContextMenu from "../functions/createContextMenu";
import noop from "../functions/noop";

export default createContextMenu({
    name: `edit`,
    type: ApplicationCommandTypes.MESSAGE,
    async execute(i) {
        if (!this.manager.hasSystemPerms(i.member)) return;
        if (!i.channel) return;

        const msg = i.options.getMessage('message', true)
        if (!msg.author) return;

        if (!msg.author.bot) return void i.reply({
            ephemeral: true,
            content: `Nice try <3`
        })
        .catch(noop)
        
        const data = await this.manager.getSystemMembers(i.user.id)
        const { tag } = this.manager.systemMember(i.user.id)

        if (!data) return;

        const system = data.find(
            c => {
                const name = c.display_name ?? c.name
                if (tag) {
                    return name === msg.author.username.replace(tag, '').trimEnd()
                }
                return name === msg.author.username
            }
        )

        if (!system) {
            return i.reply({
                ephemeral: true,
                content: `Whoops, we failed to verify that you sent this message... forgive me pwz <3 (your best friend neko)`
            })
            .catch(noop)
        }

        const modal = new Modal()
        .setTitle(`Edit Form`)
        .setCustomId(`webhook_edit_${msg.id}`)
        .setComponents(
            new MessageActionRow<TextInputComponent>()
            .addComponents(
                new TextInputComponent()
                .setLabel(`New Message`)
                .setStyle(TextInputStyles.PARAGRAPH)
                .setCustomId(`text`)
                .setPlaceholder(`Your message here...`)
                .setMinLength(1)
                .setMaxLength(2000)
                .setValue(msg.content.slice(0, 2000))
                .setRequired(true)
            )
        )

        i.showModal(modal)
        .catch(noop)
    },
})