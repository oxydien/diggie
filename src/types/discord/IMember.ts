import type IUser from "./IUser";
import type IRole from "./IRole";
import type IActivity from "./IActivity";

export default interface IMember {
	user: IUser;
	nick?: string;
	avatar?: string;
	roles: IRole[];
	joined_at?: string;
	premium_since?: string;
	deaf: boolean;
	mute: boolean;
	flags: number;
	pending: boolean;
	permissions: string;
	communication_disabled_until?: string;
	guild_id: string;
	unusual_dm_activity_until?: string;

	// Diggie specific
	status: string;
	activities: IActivity[];
}
