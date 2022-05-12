import { ErrorHandler } from "../../core/ErrorHandler";
import cast from "../../functions/cast";
import createDiscordEvent from "../../functions/createDiscordEvent";
import handleAltBan from "../../handling/interactions/handleAltBan";
import handleAppealRequest from "../../handling/interactions/handleAppealRequest";
import handleGiveawayRequest from "../../handling/interactions/handleGiveawayRequest";
import handleHelpCommand from "../../handling/interactions/handleHelpCommand";
import handleMusicQueue from "../../handling/interactions/handleMusicQueue";
import handleNicknameRequest from "../../handling/interactions/handleNicknameRequest";
import handleRndInteraction from "../../handling/interactions/handleRndInteraction";
import handleSystemPagination from "../../handling/interactions/handleSystemPagination";
import handleUserLocale from "../../handling/interactions/handleUserLocale";
import handleYandereButtons from "../../handling/interactions/handleYandereButtons";

export default createDiscordEvent("interactionCreate", async function(i) {
    if (i.isButton()) {
        ErrorHandler.wrap(handleYandereButtons).runAsync(this, cast(i))
        ErrorHandler.wrap(handleNicknameRequest).runAsync(this, cast(i))
        ErrorHandler.wrap(handleUserLocale).runAsync(this, cast(i))
        ErrorHandler.wrap(handleMusicQueue).runAsync(this, cast(i))
        ErrorHandler.wrap(handleAppealRequest).runAsync(this, cast(i))
        ErrorHandler.wrap(handleGiveawayRequest).runAsync(this, cast(i))
        ErrorHandler.wrap(handleHelpCommand).runAsync(this, cast(i))
        ErrorHandler.wrap(handleAltBan).runAsync(this, cast(i))
        ErrorHandler.wrap(handleRndInteraction).runAsync(this, cast(i))
        ErrorHandler.wrap(handleSystemPagination).runAsync(this, cast(i))
    }
})