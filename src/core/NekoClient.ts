import { Client, ClientOptions, Collection, ColorResolvable, GuildMember, MessageEmbed, TextChannel, User } from "discord.js";
import { BuildType } from "../typings/enums/BuildType";
import config from "../config.json"
import { WrapAsyncMethodWithErrorHandler } from "../util/decorators/WrapMethodWithErrorHandler";
import { NekoManager } from "./NekoManager";
import { DatabaseTables } from "../util/constants/DatabaseTables";
import { Column } from "dbdts.db";
import { DatabaseInterface } from "../typings/interfaces/database/DatabaseInterface";
import { SearchQuery } from "yande.re-api/dist/typings/interfaces/SearchQuery";
import { search } from "yande.re-api";
import noop from "../functions/noop";
import { stringify } from "querystring";
import cast from "../functions/cast";
import { PostCacheData } from "../typings/interfaces/PostCacheData";

export class NekoClient extends Client<true> {
    #mode!: BuildType
    manager = new NekoManager(this)
    postCache = new Collection<string, PostCacheData>()

    constructor(options: ClientOptions) {
        super(options)
    }

    get mode() {
        return this.#mode
    }

    async yandere(query: SearchQuery) {
        const str = stringify(cast(query))

        const existing = this.postCache.get(str)

        if (existing) {
            existing.timeout.refresh()
            return existing.posts
        }

        const got = await search(query)
        .catch(noop)

        if (!got || !got.length) return []

        this.postCache.set(str, {
            posts: got,
            timeout: setTimeout(() => {
                this.postCache.delete(str)
            }, 60_000)
        })

        return got
    }

    get prefixes() {
        return this.cache.ensure("prefixes", () => [
            ...this.config.prefixes,
            this.user.toString(),
            this.user.toString().replace('@', '@!')
        ])
    }

    get cache() {
        return this.manager.cache
    }

    async fetchOwners(): Promise<string[]> {
        if (this.application.owner === null) {
            await this.application.fetch()
            return this.fetchOwners()
        }
        const data = this.application.owner

        if (data instanceof User) {
            return [ data.id ]
        } else {
            return data.members.map(c => c.id)
        }
    }

    embed(user: User | GuildMember, color: ColorResolvable): MessageEmbed {
        return new MessageEmbed()
        .setAuthor({
            name: user instanceof User ? user.tag : user.user.tag,
            iconURL: user.displayAvatarURL({ dynamic: true })
        })
        .setColor(color)
        .setTimestamp()
    }

    get db() {
        return this.manager.db
    }

    get build() {
        return this.config[this.#mode]
    }

    get config() {
        return config
    }

    get node() {
        return this.manager.node
    }

    get changeNicknameChannel() {
        return this.mainGuild.channels.cache.get(this.build.change_nickname_channel_id)! as TextChannel
    }

    get changeNicknameLogChannel() {
        return this.mainGuild.channels.cache.get(this.build.change_nickname_log_channel_id)! as TextChannel
    }

    get altLogChannel() {
        return this.mainGuild.channels.cache.get(this.build.alt_channel_log_id)! as TextChannel
    }

    get changeNicknameRole() {
        return this.mainGuild.roles.cache.get(this.build.change_nickname_role)!
    }

    get mainGuild() {
        return this.guilds.cache.get(this.build.main_guild_id)!
    }

    get appealsGuild() {
        return this.guilds.cache.get(this.build.appeals_guild_id)!
    }

    get appealsChannel() {
        return this.mainGuild.channels.cache.get(this.build.appeals_channel_id)! as TextChannel
    }
    
    @WrapAsyncMethodWithErrorHandler()
    async init(mode: BuildType) {
        this.#mode = mode

        for (const [ table, columns ] of Object.entries(DatabaseTables)) {
            const got = Object.values<Column>(columns)
            this.db.createTable(table as keyof DatabaseInterface).addColumns(got)
        }

        this.db.once("ready", () => {
            console.log(`Database ready`)
            
            this.on("raw", data => this.manager.lavalink.updateVoiceData(data))

            this.manager.lavalink.add({
                name: 'neko',
                password: this.config.lavalink_password,
                url: `${this.config.lavalink_url}:${this.config.port}`,
                secure: false
            })

            this.login(this.build.token)
        })

        this.db.connect()
    }
}