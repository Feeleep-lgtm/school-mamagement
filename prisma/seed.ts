import { prisma } from "./functions/utils";
// import { updateParentBackdoorAccountPassword } from "./functions/parent-backdoor";
// import { convertAllXLSXFiles } from "./functions/csv-to-json";

async function createAdminAccount() {
  await prisma.guidentAdmin.upsert({
    where: {
      email: "guident.team@gmail.com",
    },
    update: {
      email: "guident.team@gmail.com",
    },
    create: {
      email: "guident.team@gmail.com",
    },
  });
}

// async function seedResults() {
//   const results = await prisma.studentAcademicSessionResult.findMany({});
//   for (let result of results) {
//     const findClassResults = await prisma.classResult.findFirst({
//       where: {
//         classId: result.classId,
//         academicSessionId: result.academicSessionId,
//         academicSessionTermId: result.academicSessionTermId,
//         schoolId: result.schoolId,
//       },
//     });
//     if (!findClassResults) {
//       await prisma.classResult.create({
//         data: {
//           classId: result.classId,
//           academicSessionId: result.academicSessionId,
//           academicSessionTermId: result.academicSessionTermId,
//           schoolId: result.schoolId,
//         },
//       });
//     }
//   }
// }

async function seedSecondResults() {
  const results = await prisma.remark.findMany({});
  for (let result of results) {
    const findClassResults = await prisma.classResult.findFirst({
      where: {
        classId: result.classId,
        academicSessionId: result.academicSessionId,
        academicSessionTermId: result.academicSessionTermId,
        schoolId: result.schoolId,
      },
    });
    await prisma.remark.updateMany({
      where: {
        classId: result.classId,
        academicSessionId: result.academicSessionId,
        academicSessionTermId: result.academicSessionTermId,
        schoolId: result.schoolId,
        studentAcademicSessionId: result.studentAcademicSessionId,
      },
      data: {
        classResultId: findClassResults?.id,
      },
    });
  }
}

async function main() {
  // readTheJSONParentData()
  //   .then(async (mergedData) => {
  //     console.log("Merged JSON Data:", mergedData.length);
  //     for (let data of mergedData) {
  //       await updateParentBackdoorAccountPassword(data);
  //     }
  //   })
  //   .catch((err) => {
  //     console.error("Error:", err);
  //   });
  await seedSecondResults();
}
main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
