import { ContextMenuInteraction } from "discord.js"
import { NekoClient } from "../../core/NekoClient"

export type WithExecutor<T> = T & {
    execute: (this: NekoClient, i: ContextMenuInteraction<'cached'>) => void | Promise<void>
}