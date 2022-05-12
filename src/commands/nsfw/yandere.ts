import { MessageActionRow, MessageButton, MessageEmbed } from "discord.js";
import { stringify } from "querystring";
import { search } from "yande.re-api";
import { SearchQuery } from "yande.re-api/dist/typings/interfaces/SearchQuery";
import { RatingTypes } from "yande.re-api/dist/typings/types/RatingTypes";
import cast from "../../functions/cast";
import displayYandereEmbed from "../../functions/displayYandereEmbed";
import noop from "../../functions/noop";
import { Command } from "../../structures/Command";

export default new Command<[string, string | null, number | null]>({
    name: `yandere`,
    capturing: true,
    args: [
        {
            name: `tags`,
            required: true,
            type: 'STRING'
        },
        {
            name: `rating`,
            required: false,
            type: 'STRING',
            choices: [{
                name: `explicit`,
                value: 'explicit'
            }, {
                name: `safe`,
                value: `safe`
            }, {
                name: `questionable`,
                value: `questionable`
            }]
        },
        {
            name: `page`,
            required: false,
            type: 'NUMBER'
        }
    ],
    description: `Uses yande.re api to display pictures.`,
    execute: async function(message, args) {
        const [ tags, rating, page ] = args

        const q: SearchQuery = {
            tags,
            rating: rating as RatingTypes ?? 'safe',
            page: page ?? 1
        }

        const str = stringify(cast(q))

        if (str.length >= 50) return void message.channel.send(`The query is too long.`)
        .catch(noop)

        const query = await this.yandere(q)

        if (!query || !query.length) return void message.channel.send(`There was an error while processing your request.`)
        .catch(noop)

        const m = await message.channel.send(displayYandereEmbed(query, str, 0, message.author))
        .catch(noop)        
    }
})