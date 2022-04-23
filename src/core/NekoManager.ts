import axios from "axios";
import { execSync } from "child_process";
import { Database } from "dbdts.db";
import { ClientEvents, Collection, GuildMember, Message, Role, TextChannel, Webhook, WebhookClient } from "discord.js";
import { readdirSync } from "fs";
import Parser from "ms-utility";
import cast from "../functions/cast";
import getDataFromWebhookURL from "../functions/getDataFromWebhookURL";
import noop from "../functions/noop";
import { CacheRecord } from "../structures/CacheRecord";
import { Command } from "../structures/Command";
import { Giveaway } from "../structures/Giveaway";
import { PunishmentType } from "../typings/enums/PunishmentType";
import { CacheItems } from "../typings/interfaces/CacheItems";
import { ChannelData } from "../typings/interfaces/database/ChannelData";
import { DatabaseInterface } from "../typings/interfaces/database/DatabaseInterface";
import { GuildSettingsData } from "../typings/interfaces/database/GuildSettingsData";
import { SystemMemberData } from "../typings/interfaces/database/SystemMemberData";
import { SystemMemberFrontRequest } from "../typings/interfaces/http/SystemMemberFrontRequest";
import { SystemMemberRequest } from "../typings/interfaces/http/SystemMemberRequest";
import { DiscordEvent } from "../typings/types/DiscordEvent";
import { Option } from "../typings/types/Option";
import DurationUnits from "../util/constants/DurationUnits";
import { PunishmentRoles } from "../util/constants/PunishmentRoles";
import { LogExecutionTime } from "../util/decorators/LogExecutionTime";
import { WrapAsyncMethodWithErrorHandler } from "../util/decorators/WrapMethodWithErrorHandler";
import { NekoClient } from "./NekoClient";
import { CoffeeLava, LavaEvents } from "lavacoffee"
import { LavalinkGuild } from "../structures/LavalinkGuild";
import { DatabaseTables } from "../typings/interfaces/database/DatabaseTables";

export class NekoManager {
    client: NekoClient
    
    guilds = new Collection<string, LavalinkGuild>()
    settings = new Collection<string, GuildSettingsData>()

    systemMembers = new Collection<string, SystemMemberData>()
    fronters = new Collection<string, SystemMemberRequest>()
    cache = new CacheRecord<CacheItems>()
    parser = new Parser(DurationUnits)
    giveaways = new Collection<string, Giveaway>()
    channels = new Collection<string, ChannelData>()
    scamDomains = new Set<string>()

    esnipes = new Collection<string, Message<true>>()
    snipes = new Collection<string, Message<true>>()

    lavalink = new CoffeeLava({
        defaultSearchPlatform: 'yt',
        send: (id, packet) => {
            this.client.guilds.cache.get(id)!.shard.send(packet)
        },
        autoPlay: false,
        autoReplay: true,
        autoResume: true
    })

    db = new Database<DatabaseTables>({
        path: './neko.db',
        sanitize: true,
        length: 10
    })

    commands = new Collection<string, Command>()
    events = new Collection<string, Collection<string, unknown>>()

    constructor(client: NekoClient) {
        this.client = client
        this.refreshCache()
    }

    guild(id: string) {
        return this.guilds.ensure(id, () => new LavalinkGuild(this, id))
    }
    
    @WrapAsyncMethodWithErrorHandler()
    async getChannelWebhook(channel: TextChannel): Promise<Option<WebhookClient>> {
        const data = this.channel(channel.id)

        const webhook = data.webhook_url ? await new WebhookClient({ url: data.webhook_url }) : channel.permissionsFor(this.client.user)?.has('MANAGE_WEBHOOKS') ? await channel.createWebhook("System Ref").catch(noop) : null

        if (!webhook) {
            return null
        }

        if (!data.webhook_url) {
            data.webhook_url = webhook.url
            this.db.upsert("channels", cast(data), {
                column: 'channel_id',
                equals: data.channel_id
            })
        }

        return webhook instanceof Webhook ? new WebhookClient({ url: webhook.url }) : webhook
    }

    channel(id: string): ChannelData {
        const existing = this.channels.get(id)

        if (existing) return existing

        const data = this.db.get("channels", id) as unknown as ChannelData

        data.channel_id = id

        this.channels.set(data.channel_id, data)
        return data
    }

    async isBanned(id: string): Promise<boolean> {
        return Boolean(await this.client.mainGuild.bans.fetch(id).catch(noop))
    }

    getPunishmentRole(type: PunishmentType): Role {
        return this.client.mainGuild.roles.cache.get(PunishmentRoles[PunishmentType[type] as keyof typeof PunishmentRoles])!
    }

    systemMember(id: string): SystemMemberData {
        const existing = this.systemMembers.get(id)

        if (existing) return existing

        const data = this.db.get("systems", id) as unknown as SystemMemberData

        data.user_id = id

        this.systemMembers.set(data.user_id, data)
        return data
    }

    @WrapAsyncMethodWithErrorHandler()
    async getSystemMembers(id: string): Promise<Option<SystemMemberRequest[]>> {
        return await axios.get<SystemMemberRequest[]>(`https://api.pluralkit.me/v2/systems/${id}/members`).then(c => c.data)
    }

    refreshCache() {
        setInterval(async () => {
            for (const [id] of this.fronters) {
                await this.getFrontingMember(id, false).catch(noop)
            }
        }, 30000)
    }

    @WrapAsyncMethodWithErrorHandler()
    async getFrontingMember(id: string, cache = true): Promise<Option<SystemMemberRequest>> {
        const existing = cache ? this.fronters.get(id) : null

        if (existing) return existing

        const request = await axios.get<SystemMemberFrontRequest>(`https://api.pluralkit.me/v2/systems/${id}/fronters`).catch(noop)

        if (!request || !request.data.members.length) return null

        const member = request.data.members[0]

        this.fronters.set(id, member)
        return member
    }

    guildSettings(id: string) {
        const existing = this.settings.get(id)
        
        if (existing) return existing

        const settings = this.db.get('guilds', id) as unknown as GuildSettingsData

        settings.guild_id = id

        this.settings.set(settings.guild_id, settings)

        return settings
    }

    @LogExecutionTime()
    loadCommands(ref = false) {
        if (ref) {
            execSync('tsc')
        }

        this.commands.clear()

        for (const folder of readdirSync(`./dist/commands/`))
            for (const file of readdirSync(`./dist/commands/${folder}`)) {
                const path = `../commands/${folder}/${file}`

                if (ref) {
                    delete require.cache[require.resolve(path)]
                }

                const cmd = require(path).default as Command

                if (!cmd.data.category) {
                    cmd.data.category = folder
                }

                if (cmd.data.category === 'developer') {
                    cmd.data.owner = true
                }

                this.commands.set(cmd.data.name, cmd)
            }
    }

    @LogExecutionTime()
    loadEvents(ref = false) {
        if (ref) {
            execSync('tsc')
        }

        this.events.map((ev, key) => this.client.removeListener(key, cast(ev)))

        this.events.clear()

        for (const folder of readdirSync(`./dist/events/`)) {
            for (const file of readdirSync(`./dist/events/${folder}`)) {
                const name = file.split('.js')[0]

                const path = `../events/${folder}/${file}`
    
                if (ref) {
                    delete require.cache[require.resolve(path)]
                }
    
                const event = require(path).default
    
                const bind = event.bind(this.client)
    
                this.events.ensure(folder, () => new Collection()).set(name, bind)
                if (folder === 'discord.js') {
                    this.client.on(name, bind)
                } else {
                    this.lavalink.on(name as keyof LavaEvents, bind)
                }
            }
        }

        return this
    }

    get node() {
        return this.lavalink.nodes.get('neko')
    }
}