import { execSync } from "child_process";
import { Database } from "dbdts.db";
import { ClientEvents, Collection, GuildMember, Message, Role } from "discord.js";
import { readdirSync } from "fs";
import Parser from "ms-utility";
import cast from "../functions/cast";
import noop from "../functions/noop";
import { CacheRecord } from "../structures/CacheRecord";
import { Command } from "../structures/Command";
import { Giveaway } from "../structures/Giveaway";
import { PunishmentType } from "../typings/enums/PunishmentType";
import { CacheItems } from "../typings/interfaces/CacheItems";
import { DatabaseInterface } from "../typings/interfaces/database/DatabaseInterface";
import { GuildSettingsData } from "../typings/interfaces/database/GuildSettingsData";
import { DiscordEvent } from "../typings/types/DiscordEvent";
import { Option } from "../typings/types/Option";
import DurationUnits from "../util/constants/DurationUnits";
import { PunishmentRoles } from "../util/constants/PunishmentRoles";
import { LogExecutionTime } from "../util/decorators/LogExecutionTime";
import { NekoClient } from "./NekoClient";

export class NekoManager {
    client: NekoClient

    settings = new Collection<string, GuildSettingsData>()

    cache = new CacheRecord<CacheItems>()
    parser = new Parser(DurationUnits)
    giveaways = new Collection<string, Giveaway>()

    esnipes = new Collection<string, Message<true>>()
    snipes = new Collection<string, Message<true>>()

    db = new Database({
        path: './neko.db',
        sanitize: true,
        length: 10
    })

    commands = new Collection<string, Command>()
    events = new Collection<keyof ClientEvents, DiscordEvent>()

    constructor(client: NekoClient) {
        this.client = client
    }

    async isBanned(id: string): Promise<boolean> {
        return Boolean(await this.client.mainGuild.bans.fetch(id).catch(noop))
    }

    getPunishmentRole(type: PunishmentType): Role {
        return this.client.mainGuild.roles.cache.get(PunishmentRoles[PunishmentType[type] as keyof typeof PunishmentRoles])!
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

        for (const file of readdirSync(`./dist/events/`)) {
            const name = file.split('.js')[0] as keyof ClientEvents

            const path = `../events/${file}`

            if (ref) {
                delete require.cache[require.resolve(path)]
            }

            const event = require(path).default as DiscordEvent

            const bind = event.bind(this.client)

            this.events.set(name, bind)
            this.client.on(name, bind)
        }

        return this
    }
}