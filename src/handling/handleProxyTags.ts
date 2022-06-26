import { Message } from "discord.js";
import { NekoClient } from "../core/NekoClient";
import { ProxyTagParser } from "../structures/ProxyTagParser";
import Roles from "../util/constants/Roles";
import handleAutoProxy from "./handleAutoProxy";

export default async function(
    client: NekoClient,
    message: Message,
) {
    if (!client.manager.hasSystemPerms(
        message.member
    )) return; 

    const members = await client.manager.getSystemMembers(message.author.id)

    if (members?.length) {
        const parsed = ProxyTagParser.parse(
            message.author.id,
            members,
            message.content
        )
    
        if (parsed.length) {
            for (let i = 0, len = parsed.length;i < len;i++) {
                const match = parsed[i]
                const system = ProxyTagParser.findDataOfMatch(members, match)
                if (!system) continue
                await handleAutoProxy(
                    client,
                    message,
                    system,
                    match.content,
                    true 
                )
            }
            return;
        }
    }

    // Fallback to auto proxy
    const fronter = await client.manager.getFrontingMember(message.author.id)
    if (!fronter) return;

    handleAutoProxy(
        client,
        message,
        fronter,
        message.content
    )
}