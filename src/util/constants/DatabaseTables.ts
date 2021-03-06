import { Column } from "dbdts.db";
import { DatabaseInterface } from "../../typings/interfaces/database/DatabaseInterface";

export const DatabaseTables: DatabaseInterface = {
    nicknames: {
        user_id: new Column()
        .setName('user_id')
        .setPrimary(true)
        .setType('TEXT'),
        nickname: new Column()
        .setName('nickname')
        .setType('TEXT')
    },

    giveaways: {
        user_id: new Column()
        .setName('user_id')
        .setType('TEXT'),

        title: new Column()
        .setName('title')
        .setType('TEXT'),

        guild_id: new Column()
        .setName('guild_id')
        .setType('TEXT'),

        message_id: new Column()
        .setName('message_id')
        .setPrimary(true)
        .setType('TEXT'),

        channel_id: new Column()
        .setName('channel_id')
        .setType('TEXT'),

        winner_count: new Column()
        .setName('winner_count')
        .setType('INTEGER'),

        participants: new Column()
        .setName('participants')
        .setType('JSON'),

        ended: new Column()
        .setType('BOOLEAN')
        .setName('ended'),

        ends_at: new Column()
        .setName('ends_at')
        .setType('INTEGER')
    },

    systems: {
        user_id: new Column()
        .setName('user_id')
        .setType('TEXT')
        .setPrimary(true),

        autosend: new Column()
        .setName('autosend')
        .setDefault(false)
        .setType('BOOLEAN'),

        tag: new Column()
        .setName('tag')
        .setType('TEXT')
    },

    channels: {
        old_pin_message_id: new Column()
        .setName('old_pin_message_id')
        .setType('TEXT'),

        channel_id: new Column()
        .setName('channel_id')
        .setType('TEXT')
        .setPrimary(true),

        webhook_url: new Column()
        .setName('webhook_url')
        .setType('TEXT')
    },
    
    guilds: {
        pin_message_id: new Column()
        .setName('pin_message_id')
        .setType('TEXT'),

        sticky_message_channel_id: new Column()
        .setName('sticky_message_channel_id')
        .setType('TEXT'),
        
        guild_id: new Column()
        .setName('guild_id')
        .setType('TEXT')
        .setPrimary(true),

        scam_links_log_channel_id: new Column()
        .setName('scam_links_log_channel_id')
        .setType('TEXT'),

        detect_scam_links: new Column()
        .setName('detect_scam_links')
        .setDefault(false)
        .setType('BOOLEAN')
    },

    appeals: {
        user_id: new Column()
        .setName('user_id')
        .setPrimary(true)
        .setType('TEXT'),
        reason: new Column()
        .setName('reason')
        .setType('TEXT'),
        type: new Column()
        .setType('INTEGER')
        .setName('type')
    }
}