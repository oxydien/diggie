export interface ISavedAuth {
    token: string;
    last_touched: {
        secs_since_epoch: number;
        nanos_since_epoch: number;
    },
    account: IAccount;
}

export interface IAccount {
    id: string;
    username: string;
    avatar?: string;
}