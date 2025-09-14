export const TYPES = {
	userRepo: Symbol.for("UserRepository"),
	otpRepo: Symbol.for("OtpRepository"),
	articleRepo: Symbol.for("ArticleRepository"),
	sectionRepo: Symbol.for("SectionRepository"),
	advertisementRepo: Symbol.for("AdvertisementRepository"),
	emailServices: Symbol.for("EmailServices"),
	prisma: Symbol.for("PrismaClient"),
	jwt: Symbol.for("JWT"),
	tokenBlacklist: Symbol.for("TokenBlacklistRepository"),
};
