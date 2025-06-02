import { jwt } from "@elysiajs/jwt";
import { Elysia } from "elysia";
import { injectable } from "inversify";
import { error } from "node:console";
import { JWTError } from "./errors/jwt.error";
import type { IJWT, JWTPayload } from "./interfaces/jwt.interface";

@injectable()
export class JWTProvider implements IJWT {
  private shortTermHandler;
  private longTermHandler;

  constructor() {
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not defined");
    }

    const app = new Elysia();

    this.shortTermHandler = app.use(
      jwt({
        name: "shortTermJwt",
        secret: process.env.JWT_SECRET,
        exp: "1d",
      })
    ).decorator.shortTermJwt;

    this.longTermHandler = app.use(
      jwt({
        name: "longTermJwt",
        secret: process.env.JWT_SECRET,
        exp: "7d",
      })
    ).decorator.longTermJwt;
  }

  async sign(payload: JWTPayload) {
    try {
      const handler =
        payload.type === "login" ? this.longTermHandler : this.shortTermHandler;

      return await handler.sign(payload);
    } catch (error) {
      throw new JWTError("Error signing JWT");
    }
  }

  async verify(token: string) {
    try {
      const result =
        (await this.longTermHandler.verify(token)) ||
        (await this.shortTermHandler.verify(token));

      if (!result) {
        throw error;
      }

      return result as JWTPayload;
    } catch (error) {
      throw new JWTError("Error verifying JWT");
    }
  }
}
