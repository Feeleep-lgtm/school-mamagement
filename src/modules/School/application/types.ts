export interface ClassResult {
  score: number;
  subject: {
    subject: string;
  };
  assessment: {
    id: string;
    assessmentName: string;
  };
  studentAcademicSessionId: string;
}

export interface SchoolClass {
  id: string;
  className: string;
  studentAcademicSession: {
    id: string;
    academicSession: {
      current: boolean;
    };
  }[];
}

export interface ClassWithStudentCount {
  className: string;
  totalStudents: number;
}
