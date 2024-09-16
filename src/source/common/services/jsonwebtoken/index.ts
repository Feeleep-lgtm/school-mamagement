import jwt from "jsonwebtoken";
import { config } from "../../../../configurations/config";

export class JsonWebTokenService {
  private readonly JWT_SECRET = config.jwt.JWT_SECRET;
  public sign<T>(payload: T | any, options?: jwt.SignOptions): string {
    return jwt.sign(payload, this.JWT_SECRET, options);
  }
  public verify<T>(token: string, options?: jwt.VerifyOptions): T | any | undefined {
    try {
      return jwt.verify(token, this.JWT_SECRET, options);
    } catch (err) {
      return undefined;
    }
  }
}
