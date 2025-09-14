import { ArticleRepository } from "@infra/db/article/article.repo";
import { OtpRepository } from "@infra/db/auth/otp.repo";
import { TokenBlacklistRepository } from "@infra/db/auth/token.blacklist.repo";
import { SectionRepository } from "@infra/db/section/section.repo";
import { UserRepository } from "@infra/db/user/user.repo";
import { AdvertisementRepository } from "@infra/db/advertisement/advertisement.repo";
import { TYPES } from "@infra/entity/injection-tokens";
import { PrismaClient } from "@prisma/client";
import { Container } from "inversify";
import { EmailServices } from "./communications/mail/mail.services";
import { JWTProvider } from "./security/jwt/jwt.provider";
import { ArticleServices } from "./services/article/article.services";
import { AuthServices } from "./services/auth/auth.services";
import { SectionServices } from "./services/section/section.services";
import { AdvertisementServices } from "./services/advertisement/advertisement.services";

const container = new Container();

container.bind(TYPES.prisma).toConstantValue(new PrismaClient());

container.bind(TYPES.userRepo).to(UserRepository);
container.bind(TYPES.otpRepo).to(OtpRepository);
container.bind(TYPES.articleRepo).to(ArticleRepository);
container.bind(TYPES.sectionRepo).to(SectionRepository);
container.bind(TYPES.advertisementRepo).to(AdvertisementRepository);

container.bind(TYPES.emailServices).to(EmailServices);
container.bind(TYPES.jwt).to(JWTProvider);
container.bind(TYPES.tokenBlacklist).to(TokenBlacklistRepository);

container.bind(AuthServices).toSelf();
container.bind(ArticleServices).toSelf();
container.bind(SectionServices).toSelf();
container.bind(AdvertisementServices).toSelf();

export const authServices = container.get<AuthServices>(AuthServices);
export const articleServices = container.get<ArticleServices>(ArticleServices);
export const sectionServices = container.get<SectionServices>(SectionServices);
export const advertisementServices = container.get<AdvertisementServices>(AdvertisementServices);
