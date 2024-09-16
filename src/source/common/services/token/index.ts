
import otpGenerator from "otp-generator";
export class ISystemTokenService{
   public generateOTP(): string {
    const OTP = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      specialChars: false,
      digits: true,
      lowerCaseAlphabets: false,
    });
    return OTP;
  }
}