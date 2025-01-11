import type IMember from "./IMember";

export interface IReaction {
	user_id?: string;
	channel_id: string;
	message_id: string;
	guild_id?: string;
	message_author_id?: string;
	count: number;
	me: boolean;
	me_burst: boolean;
	member?: IMember;
	count_details: {
		burst: number;
		normal: number;
	};
	emoji: IEmoji;
	burst_colors: string[];
}

export interface IEmoji {
  id?: string;
  name?: string;
  animated?: boolean;
}
