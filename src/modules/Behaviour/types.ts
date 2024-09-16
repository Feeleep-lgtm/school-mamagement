

export interface ReferenceParams {
  academicSessionId: string;
  academicSessionTermId: string;
  classId: string;
  behaviourType: string;
}

export interface UpdateBehaviourReferenceParams {
  academicSessionId: string;
  academicSessionTermId: string;
  classId: string;
  behaviourId: string;
  behaviourType: string;
}

export interface StudentBehaviourUpdate {
  studentSchoolId: string;
  score: number;
  studentAcademicSessionId: string;
}

export interface ViewBehaviourReferenceParams {
  academicSessionId: string;
  academicSessionTermId: string;
  classId: string;
  studentAcademicSessionId: string;
}

