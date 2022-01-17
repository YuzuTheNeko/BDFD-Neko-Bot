import { User } from "discord.js";
import displaySystemMember from "../../functions/displaySystemMember";
import { Command } from "../../structures/Command";
import StaffRoles from "../../util/constants/StaffRoles";

export default new Command<[
    User | null
]>({
    name: 'fronter',
    description: 'shows current fronting member.',
    args: [
        {
            name: 'user',
            type: 'USER',
            required: false
        }
    ],
    roles: [
        StaffRoles.STAFF,
        StaffRoles.LEAD_STAFF,
        StaffRoles.ADMIN_TEST,
        StaffRoles.MODERATOR
    ],
    execute: async function(message, [ user ]) {
        user = user ?? message.author

        const data = await this.manager.getFrontingMember(user.id, false)

        if (!data) return void message.channel.send({
            embeds: [
                this.embed(message.member!, 'RED')
                .setTitle(`Unknown Fronter`)
                .setDescription(`User either has no fronting member or does not have system members.`)
            ]
        })

        message.channel.send({
            embeds: [
                displaySystemMember(data)
            ]
        })
    }
})