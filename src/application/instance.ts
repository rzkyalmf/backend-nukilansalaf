import { PrismaClient } from "@prisma/client";
import { Container } from "inversify";
import { OtpRepository } from "../infrastructure/db/otp.repo";
import { TokenBlacklistRepository } from "../infrastructure/db/token.blacklist.repo";
import { UserRepository } from "../infrastructure/db/user.repo";
import { TYPES } from "../infrastructure/entity/types";
import { EmailServices } from "./communications/mail/mail.services";
import { JWTProvider } from "./security/jwt/jwt.provider";

import { AuthServices } from "./services/auth.services";

const container = new Container();

container.bind(TYPES.prisma).toConstantValue(new PrismaClient());

container.bind(TYPES.userRepo).to(UserRepository);
container.bind(TYPES.otpRepo).to(OtpRepository);
container.bind(TYPES.emailServices).to(EmailServices);
container.bind(TYPES.jwt).to(JWTProvider);
container.bind(TYPES.tokenBlacklist).to(TokenBlacklistRepository);

container.bind(AuthServices).toSelf();

export const authServices = container.get<AuthServices>(AuthServices);
