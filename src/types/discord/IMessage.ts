import type IAttachment from "./IAttachment";
import type IChannel from "./IChannel";
import type { IEmbed } from "./IEmbed";
import type IMember from "./IMember";
import type { IPoll } from "./IPoll";
import type { IReaction } from "./IReaction";
import  type IUser from "./IUser";

export default interface IMessage {
  id: string;
  channel_id: string;
  guild_id: string;
  author: IUser;
  content: string;
  timestamp: string;
  edited_timestamp?: string;
  tts: boolean;
  mention_everyone: boolean;
  mentions: IUser[];
  mention_roles: string[];
  mention_channels: {
    id: string;
    name: string;
    type: number;
    guild_id: string;
  }[];
  attachments: IAttachment[];
  embeds: IEmbed[];
  reactions: IReaction[];
  nonce?: string;
  pinned: boolean;
  webhook_id?: string;
  type: number;
  activity?: {
    type: number;
    party_id?: string;
  };
  application?: {
    id: string;
    name: string;
    icon?: string;
    description?: string;
    cover_image?: string;
  };
  application_id?: string;
  message_reference?: {
    message_id: string;
    channel_id: string;
    guild_id: string;
  };
  flags?: number;
  referenced_message?: IMessage;
  interaction?: unknown;
  interaction_metadata?: {
    id: string;
    type: number;
    user: IUser;
  };
  thread?: IChannel,
  components?: unknown[];
  sticker_items?: unknown[];
  position?: number;
  role_subscription_data?: unknown;
  member?: IMember;
  poll?: IPoll;

  // Diggie only
  deleted?: boolean
}