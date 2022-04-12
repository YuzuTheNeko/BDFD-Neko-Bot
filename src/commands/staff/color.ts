import { MessageEmbed, MessageAttachment } from "discord.js";
import { Command } from "../../structures/Command";
import { createCanvas, loadImage } from 'canvas';
import StaffRoles from "../../util/constants/StaffRoles";

export default new Command<[string]>({
    name: 'color',
    aliases: [
        "colour",
        "col"
    ],
    description: 'get color from a given value. accepts RGB(A) and Hex values.',
    args: [{
            name:'value',
            required: true,
            type:'STRING'
           }],
    roles: [ 
          StaffRoles.ADMIN_TEST, 
          StaffRoles.STAFF 
  ],
    execute: async function(message, [ value ]){
        const canvas = createCanvas(200, 200)
        const ctx = canvas.getContext('2d')
        ctx.fillStyle = value
        ctx.rect(0, 0, 200, 200)
        ctx.fill()
        
        const att = new MessageAttachment(canvas.toBuffer(), 'color.png');
        const embed = new MessageEmbed()
        .setAuthor(message.author.tag, message.author.displayAvatarURL({ dynamic: true }))
        .setDescription(`**Color Given**: ${value}`)
        .setImage('attachment://color.png')
        .setColor('#2f2136')
        .setTimestamp()

        await message.reply({
            files:[att], 
            embeds:[embed], 
            allowedMentions: { repliedUser: false }
        })
     }
})
