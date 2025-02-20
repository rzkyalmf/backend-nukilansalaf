export const TYPES = {
	userRepo: Symbol.for("UserRepository"),
	otpRepo: Symbol.for("OtpRepository"),
	quoteRepo: Symbol.for("QuoteRepository"),

	emailServices: Symbol.for("emailServices"),
	prisma: Symbol.for("PrismaClient"),
	jwt: Symbol.for("JWT"),
	tokenBlacklist: Symbol.for("TokenBlacklistRepository"),
};
