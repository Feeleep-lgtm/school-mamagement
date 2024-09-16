import prisma from "../../database/PgDB";

export const removeDuplicateKeyValues = <T extends object, K extends keyof T>(
  data: T[],
  lookUpKey: K
) => {
  if (Array.isArray(data)) {
    const mappingData = new Map<T[K], T>();
    for (let i of data) {
      if (lookUpKey in i) {
        mappingData.set(i[lookUpKey], i);
      }
    }
    const result = Array.from(mappingData.values());
    return result;
  }
  return [];
};



export async function findOrCreateClassResult(
  classId: string,
  academicSessionId: string,
  academicSessionTermId: string,
  schoolId: string
): Promise<string> {
  let classResultId: string = "";

  const findClassResult = await prisma.classResult.findFirst({
    where: {
      classId,
      academicSessionId,
      academicSessionTermId,
    },
  });

  if (!findClassResult) {
    const createAndClassToResults = await prisma.classResult.create({
      data: {
        classId,
        academicSessionId,
        academicSessionTermId,
        schoolId,
      },
    });
    classResultId = createAndClassToResults.id;
  } else {
    classResultId = findClassResult.id;
  }

  return classResultId;
}