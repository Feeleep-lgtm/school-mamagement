import bcrypt from "bcrypt";
import { IHashingService } from ".";

export class BcryptHashingService implements IHashingService {
  private salt = async () => <string>await bcrypt.genSalt(10);
  async hash(value: string): Promise<string> {
    return await bcrypt.hash(value, await this.salt());
  }
  async verify(value: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(value, hash);
  }

  isHashed(value: string): boolean {
    return value.startsWith("$argon2");
  }
}
