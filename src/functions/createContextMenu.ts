import { MessageApplicationCommandData } from "discord.js";
import { WithExecutor } from "../typings/types/WithExecution";

export default function(data: WithExecutor<MessageApplicationCommandData>) {
    return data
}