export interface IPoll {
	question: IPollMedia;
	answers: IPollAnswer[];
	expiry?: string;
	allow_multiselect: boolean;
	layout_type: number;
	results?: IPollResults;
}

export interface IPollMedia {
	text?: string;
	emoji?: { id: string } | { name: string };
}

export interface IPollAnswer {
	answer_id: string;
	poll_media: IPollMedia;
}

export interface IPollResults {
	is_finalized: boolean;
	answer_counts: IPollAnswerCount[];
}

export interface IPollAnswerCount {
	answer_id: string;
	count: number;
	me_voted: boolean;
}
