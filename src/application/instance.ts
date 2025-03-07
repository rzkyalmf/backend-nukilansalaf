import { PrismaClient } from "@prisma/client";
import { Container } from "inversify";
import { OtpRepository } from "../infrastructure/db/otp.repo";
import { UserRepository } from "../infrastructure/db/user.repo";
import { TYPES } from "../infrastructure/entity/types";
import { EmailServices } from "./communications/mail/mail.services";
import { JWTProvider } from "./security/jwt/jwt.provider";

import { PostRepository } from "../infrastructure/db/post.repo";
import { QuoteRepository } from "../infrastructure/db/quote.repo";
import { TokenBlacklistRepository } from "../infrastructure/db/token.blacklist.repo";
import { AuthServices } from "./services/auth.services";
import { PostServices } from "./services/post.services";
import { QuoteServices } from "./services/quote.services";

const container = new Container();

container.bind(TYPES.prisma).toConstantValue(new PrismaClient());

container.bind(TYPES.userRepo).to(UserRepository);
container.bind(TYPES.otpRepo).to(OtpRepository);
container.bind(TYPES.quoteRepo).to(QuoteRepository);
container.bind(TYPES.postRepo).to(PostRepository);

container.bind(TYPES.emailServices).to(EmailServices);
container.bind(TYPES.jwt).to(JWTProvider);
container.bind(TYPES.tokenBlacklist).to(TokenBlacklistRepository);

container.bind(AuthServices).toSelf();
container.bind(QuoteServices).toSelf();
container.bind(PostServices).toSelf();

export const authServices = container.get<AuthServices>(AuthServices);
export const quoteServices = container.get<QuoteServices>(QuoteServices);
export const postServices = container.get<PostServices>(PostServices);
