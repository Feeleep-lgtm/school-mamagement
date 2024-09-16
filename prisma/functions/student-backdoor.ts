import otpGenerator from "otp-generator";
import gravatar from "gravatar";
import { prisma } from "./utils";
import { Prisma } from "@prisma/client";



const generateAvatar = (parentEmail: string) => {
  const options: gravatar.Options = {
    s: "200",
    r: "pg",
    d: "mm",
  };
  const avatar = gravatar.url(parentEmail, options, true);
  return avatar;
};

const generateUsername = (studentName: string) => {
  const random = otpGenerator.generate(3, {
    upperCaseAlphabets: false,
    specialChars: false,
    digits: true,
  });
  return studentName.split(" ")[0]?.toLowerCase() + random;
};


export const createParentChildBackdoorAccount = async (data: any) => {
  try {
    const response = await prisma.$transaction(
      async (tx) => {
        const findParent = await tx.user.findUnique({
          where: {
            email: data["Parent Email"],
          },
          include: {
            parent: true,
          },
        });
        const lastName = `${String(data["Students Name"]).split(" ")[1]} ${
          String(data["Students Name"]).split(" ")[2] || ""
        }`;
        const firstName = String(data["Students Name"]).split(" ")[0];
        if (findParent) {
          const findStudent = await tx.student.findFirst({
            where: {
              parentId: findParent.parent?.id,
              firstName: firstName,
              lastName: lastName,
            },
          });
          console.log(`${firstName} ${lastName}`);
          if (findStudent) {
            throw new Error("This parent already have a child with the information provided");
          }
          const userName = generateUsername(firstName);
          const createdStudent = await tx.student.create({
            data: {
              firstName: firstName,
              lastName: lastName,
              otherName: "",
              nationality: "Nigerian",
              dateOfBirth: "2018/12/12",
              stateOfOrigin: "Delta State",
              localGovernmentArea: "Uvwie",
              userName: userName,
              profilePicture: generateAvatar(firstName),
              imageUrl: "",
              parentId: findParent.parent?.id,
            },
          });
          if (!createdStudent) {
            throw new Error("Error encountered while creating student");
          }
          console.log(
            createdStudent,
            `${data[findParent?.parent?.fullName as string]} is admitted successfully`
          );
        }
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
