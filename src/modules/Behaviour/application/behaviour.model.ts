import prisma from "../../../database/PgDB";
import { ReferenceParams, StudentBehaviourUpdate, UpdateBehaviourReferenceParams, ViewBehaviourReferenceParams } from "../types";



export class BehaviourModels {
    public async updateBehavioursMutation(referenceParams: UpdateBehaviourReferenceParams, requiredStudentsBehaviours: StudentBehaviourUpdate[], schoolId: string) {
        return Promise.all(
            requiredStudentsBehaviours.map(async (studentBehaviourUpdate) => {
                const behaviour = await prisma.behaviour.findFirst({
                  where: {
                    academicSessionId: referenceParams.academicSessionId,
                    academicSessionTermId: referenceParams.academicSessionTermId,
                    classId: referenceParams.classId,
                    behaviourType: referenceParams.behaviourType,
                    schoolId: schoolId,
                  },
                });
                if (!behaviour) {
                    throw new Error(
                      `Behaviour for student with ID ${studentBehaviourUpdate.studentSchoolId} not found`
                    );
                }
                return prisma.behaviour.update({
                    where: {
                        id: behaviour.id
                    },
                    data: {
                        score: studentBehaviourUpdate.score
                    }
                });
            })
        );
    }
    public async filterBehaviourQuery(referenceParams: ReferenceParams, schoolId: string) {
        return prisma.behaviour.findMany({
            where: {
                academicSessionId: referenceParams.academicSessionId,
                academicSessionTermId: referenceParams.academicSessionTermId,
                classId: referenceParams.classId,
                behaviourType: referenceParams.behaviourType,
                schoolId: schoolId
            }
        });
    }
    public async viewBehaviourQuery(referenceParams: ViewBehaviourReferenceParams, schoolId: string) {
        return prisma.behaviour.findMany({
          where: {
            academicSessionId: referenceParams.academicSessionId,
            academicSessionTermId: referenceParams.academicSessionTermId,
            classId: referenceParams.classId,
            studentAcademicSessionId: referenceParams.studentAcademicSessionId,
            schoolId: schoolId,
          },
        });
    }
}







