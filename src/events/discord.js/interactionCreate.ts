import { ButtonInteraction, ContextMenuInteraction } from "discord.js";
import { ErrorHandler } from "../../core/ErrorHandler";
import cast from "../../functions/cast";
import createDiscordEvent from "../../functions/createDiscordEvent";
import handleContextMenu from "../../handling/handleContextMenu";
import handleAltBan from "../../handling/interactions/handleAltBan";
import handleAppealRequest from "../../handling/interactions/handleAppealRequest";
import handleEditMessageModal from "../../handling/interactions/handleEditMessageModal";
import handleGiveawayRequest from "../../handling/interactions/handleGiveawayRequest";
import handleHelpCommand from "../../handling/interactions/handleHelpCommand";
import handleMusicQueue from "../../handling/interactions/handleMusicQueue";
import handleNicknameRequest from "../../handling/interactions/handleNicknameRequest";
import handleRndInteraction from "../../handling/interactions/handleRndInteraction";
import handleSystemPagination from "../../handling/interactions/handleSystemPagination";
import handleUserLocale from "../../handling/interactions/handleUserLocale";
import handleYandereButtons from "../../handling/interactions/handleYandereButtons";

export default createDiscordEvent("interactionCreate", async function(i) {
    if (!i.inCachedGuild()) return;

    if (i.isButton()) {
        ErrorHandler.wrap(handleYandereButtons).runAsync(this, i)
        ErrorHandler.wrap(handleNicknameRequest).runAsync(this, i)
        ErrorHandler.wrap(handleUserLocale).runAsync(this, i)
        ErrorHandler.wrap(handleMusicQueue).runAsync(this, i)
        ErrorHandler.wrap(handleAppealRequest).runAsync(this, i)
        ErrorHandler.wrap(handleGiveawayRequest).runAsync(this, i)
        ErrorHandler.wrap(handleHelpCommand).runAsync(this, i)
        ErrorHandler.wrap(handleAltBan).runAsync(this, i)
        ErrorHandler.wrap(handleRndInteraction).runAsync(this, i)
        ErrorHandler.wrap(handleSystemPagination).runAsync(this, i)
    } else if (i.isModalSubmit()) {
        handleEditMessageModal.call(this, i)
    } else if (i.isContextMenu()) {
        handleContextMenu.call(this, i)
    }
})