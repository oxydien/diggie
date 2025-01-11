export default interface IAttachment {
	id: string;
	filename: string;
	description: string;
	content_type?: string;
	size: number;
	url: string;
	proxy_url: string;
	ephemeral?: boolean;
	duration_secs?: number;
	height?: number;
	width?: number;
	waveform?: number[];
}
