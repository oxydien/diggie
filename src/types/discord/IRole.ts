export default interface IRole {
  id: string;
  name: string;
  guild_id: string;
  color: number | string;
  hoist: boolean;
  position: number;
  permissions: string;
  mentionable: boolean;
  managed: string;
  tags: {
    bot_id?: string;
    integration_id?: string;
    premium_subscriber?: boolean;
    subscription_listing_id?: string;
    available_for_purchase?: boolean;
    guild_connections?: boolean;
  };
  icon?: string;
  unicode_emoji?: string;
}
