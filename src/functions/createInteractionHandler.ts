import { ButtonInteraction, CacheType, CommandInteraction, ContextMenuInteraction, ModalSubmitInteraction, SelectMenuInteraction } from "discord.js";
import { NekoClient } from "../core/NekoClient";
import { Async } from "../typings/types/Async";

export interface Interactions<T extends CacheType = 'cached'> {
    button: ButtonInteraction<T>
    menu: SelectMenuInteraction<T>
    context: ContextMenuInteraction<T>
    modal: ModalSubmitInteraction<T>
    slash: CommandInteraction<T>
}

export type InteractionEvent<T extends keyof Interactions> = (this: NekoClient, i: Interactions[T]) => Async<void> 

export default function<T extends keyof Interactions>(k: T, listener: InteractionEvent<T>): InteractionEvent<T> {
    return listener
}