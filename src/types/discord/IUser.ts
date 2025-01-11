export default interface IUser {
  id: string;
  username: string;
  discriminator: string;
  global_name?: string;
  avatar?: string;
  bot: boolean;
  system: boolean;
  mfa_enabled: boolean;
  banner?: string;
  accent_color?: number;
  locale?: string;
  verified?: boolean;
  email?: string;
  flags: number;
  premium_type: number;
  public_flags?: number;
  member: null; // <- included only in message mentions; TODO: Member
}
