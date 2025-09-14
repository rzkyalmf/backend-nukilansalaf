export interface ITokenBlacklist {
	isBlacklisted(token: string): Promise<boolean>;
	addToBlacklist(token: string): Promise<void>;
}
