import { Prisma } from "@prisma/client";
import { generateAvatar, generateUsername, hashPassword, prisma } from "./utils";

export const createParentBackdoorAccount = async (data: any) => {
  try {
    const response = await prisma.$transaction(
      async (tx) => {
        const findParent = await tx.user.findUnique({
          where: {
            email: data["Column1"],
          },
        });
        if (!findParent) {
          const findParentByPhoneNumber = await tx.parent.findUnique({
            where: {
              parentPhoneNumber: String(data["GSM No"]),
            },
          });
          if (findParentByPhoneNumber) {
            throw new Error("This is GSM No is taken by another user");
          }
          const username = generateUsername("");
          const hashedPassword = await hashPassword(data["Column2"]);
          const parent = await tx.user.create({
            data: {
              email: data["Column1"],
              password: hashedPassword,
              isEmailVerified: true,
              userType: "parent",
              userName: username,
              profileCompleted: true,
              avatar: generateAvatar(data["Column1"]),
              profilePicture: generateAvatar(data["Column1"]),
              status: "ACTIVE",
            },
          });
          await tx.parent.create({
            data: {
              occupation: data["Occupation"],
              parentPhoneNumber: String(data["GSM No"]),
              parentAddress: data["Address"],
              userId: parent.id,
              fullName: data["Parents Guardian Name"],
            },
          });
        }
        console.log("Parent account created successfully");
      },
      {
        maxWait: 10000,
        timeout: 10000,
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      }
    );
  } catch (error) {
    console.log(error);
  }
};

export const updateParentBackdoorAccountPassword = async (data: any) => {
  try {
    const response = await prisma.$transaction(
      async (tx) => {
        let findParent;
        let email;
        if (data["Parent Email"]) {
          findParent = await tx.user.findUnique({
            where: {
              email: data["Parent Email"],
            },
          });
          email = data["Parent Email"];
        } else if (data["E-mail"]) {
          findParent = await tx.user.findUnique({
            where: {
              email: data["E-mail"],
            },
          });
          email = data["E-mail"];
        } else if (data["Column1"]) {
          findParent = await tx.user.findUnique({
            where: {
              email: data["Column1"],
            },
          });
          email = data["Column1"];
        }
        if (findParent) {
          const hashedPassword = await hashPassword("Kings@2023");
          await tx.user.update({
            where: {
              email: email,
            },
            data: {
              password: hashedPassword,
            },
          });
        }
        console.log("Parent account updated successfully");
      },
      {
        maxWait: 10000,
        timeout: 10000,
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      }
    );
  } catch (error) {
    console.log(error);
  }
};
