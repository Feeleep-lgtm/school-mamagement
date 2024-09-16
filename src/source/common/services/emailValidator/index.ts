

export class EmailValidator {
  private emailRegex: RegExp;
  private allowedDomains: string[];

  constructor() {
    // Use the provided regular expression
    this.emailRegex =
      /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

    // Add allowed domains
    this.allowedDomains = ["gmail.com", "example.com"];
  }

  isEmailValid(email: string): boolean {
    if (!this.emailRegex.test(email)) {
      return false;
    }

    // Additional checking of some things regex can't handle
    const parts: string[] = email.split("@");
    if (parts[0].length > 64) {
      return false; // Local part length exceeds the limit
    }

    const domain: string = parts[1].toLowerCase();
    if (this.allowedDomains.length > 0 && !this.allowedDomains.includes(domain)) {
      return false; // Domain not allowed
    }

    const domainParts: string[] = domain.split(".");
    if (domainParts.some((part) => part.length > 63)) {
      return false; // Domain part length exceeds the limit
    }

    return true;
  }
}