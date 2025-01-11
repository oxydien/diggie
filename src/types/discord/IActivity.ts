export default interface IActivity {
	application_id?: string;
	assets?: {
		large_image?: string;
		large_text?: string;
		small_image?: string;
		small_text?: string;
	};
	buttons?: {
		label: string;
		url: string;
	}[];
	created_at?: number;
	details?: string;
	emoji?: {
		id?: string;
		name?: string;
	};
	flags?: number;
	id?: string;
	instance?: boolean;
	name?: string;
}
