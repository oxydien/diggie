export default interface IChannel {
  id: string;
  bitrate?: number;
  parent_id?: string;
  guild_id?: string;
  type: number;
  owner_id?: string;
  last_message_id?: string;
  last_pin_timestamp?: string;
  name: string;
  permission_overwrites?: string[];
  position?: number;
  topic?: string;
  user_limit?: number;
  nsfw: boolean;
  rate_limit_per_user?: number;
  rtc_region?: string;
  video_quality_mode?: number;
  message_count?: number;
  member_count?: number;
  thread_metadata?: string; // ThreadMetadata, not string
  member?: unknown; // TODO: Member
  default_auto_archive_duration?: number;
  permissions?: string;
  flags?: number;
  total_message_sent?: number;
  available_tags: unknown[];
  applied_tags: number[];
  default_reaction_emoji?: unknown; // TODO: Emoji
  default_thread_rate_limit_per_user?: number;
  status?: string;
  default_sort_order?: number;
  default_forum_layout?: number;
}
