import type IUser from "./IUser";
import type IActivity from "./IActivity";

export default interface IPresence {
  user: IUser;
  guild_id?: string;
  status: string;
  activities: IActivity[];
  client_status: {
    desktop?: string;
    mobile?: string;
    web?: string;
  }
}
