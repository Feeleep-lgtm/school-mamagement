// Import necessary modules/functions
import { SchoolEmails } from "../../../modules/School/emails/emails";
import sendEmail from "../../../configurations/handlebars";
import transporter from "../../../configurations/transporter";

jest.mock("../../../configurations/handlebars.ts");
jest.mock("../../../configurations/transporter");
jest.mock("../../../errors/InternalServerError.ts");

describe("SchoolEmails - blastSchoolLoginMessage", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should send a login alert email successfully", async () => {
    const mailTransporter = transporter();
    const schoolEmails = new SchoolEmails();
    const data = {
      email: "olatunjijohn@yopmail.com",
    };
    const result = await schoolEmails.blastSchoolLoginMessage(data);
    expect(sendEmail).toHaveBeenCalledWith({
      template: "login-school-alert",
      context: data,
      to: data.email,
      from: "guident.team@gmail.com",
      subject: "Login alert",
      transporter: mailTransporter,
    });

    expect(result).toBe("Email sent successfully!");
  });
});
