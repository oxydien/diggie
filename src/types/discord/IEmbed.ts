export interface IEmbed {
	title?: string;
	description?: string;
	url?: string;
	color?: number;
	type?: string;
  author?: IEmbedAuthor;
	thumbnail?: IEmbedImage;
  fields?: IEmbedField[];
	image?: IEmbedImage;
  video?: IEmbedVideo;
	timestamp?: string;
	footer?: IEmbedFooter;
  provider?: IEmbedProvider;
}

export interface IEmbedAuthor {
	name: string;
	url?: string;
	icon_url?: string;
	proxy_icon_url?: string;
}

export interface IEmbedImage {
	url: string;
	proxy_url?: string;
	height?: number;
	width?: number;
}

export interface IEmbedField {
	name: string;
	value: string;
	inline?: boolean;
}

export interface IEmbedVideo {
	url: string;
	proxy_url?: string;
	height?: number;
	width?: number;
}

export interface IEmbedFooter {
	text: string;
	icon_url?: string;
}

export interface IEmbedProvider {
	name: string;
	url?: string;
}

