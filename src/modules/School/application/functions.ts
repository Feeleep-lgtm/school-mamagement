import { ClassResult, ClassWithStudentCount, SchoolClass } from "./types";

export const calculateSubjectTotalScores = (
  results: ClassResult[]
): Record<string, Record<string, number>> => {
  const subjectTotals: Record<string, Record<string, number>> = {};
  results.forEach((result) => {
    const { score, subject, studentAcademicSessionId } = result;
    const subjectName = subject.subject;
    if (!subjectTotals[studentAcademicSessionId]) {
      subjectTotals[studentAcademicSessionId] = {};
    }
    if (!subjectTotals[studentAcademicSessionId][subjectName]) {
      subjectTotals[studentAcademicSessionId][subjectName] = 0;
    }
    subjectTotals[studentAcademicSessionId][subjectName] += score;
  });

  return subjectTotals;
};

export const calculateTotalSubjectCount = (classResults: ClassResult[]): number => {
  const totalSubjectsSet: Record<string, Set<string>> = {};

  classResults.forEach((result) => {
    if (!totalSubjectsSet[result.studentAcademicSessionId]) {
      totalSubjectsSet[result.studentAcademicSessionId] = new Set();
    }
    totalSubjectsSet[result.studentAcademicSessionId].add(result.subject.subject);
  });

  const totalSubjectsCount = Object.values(totalSubjectsSet).reduce(
    (total, subjectsSet) => total + subjectsSet.size,
    0
  );

  return totalSubjectsCount;
};

export const calculateTotalScores = (
  subjectTotals: Record<string, Record<string, number>>
): Record<string, number> => {
  const studentTotals: Record<string, number> = {};

  Object.keys(subjectTotals).forEach((studentId) => {
    const totalScore = Object.values(subjectTotals[studentId]).reduce(
      (acc, score) => acc + score,
      0
    );
    studentTotals[studentId] = totalScore;
  });

  return studentTotals;
};
export const calculateTotalScorePercentage = (
  classResults: ClassResult[],
  studentId: string
): number | null => {
  const studentResults = classResults.filter(
    (result) => result.studentAcademicSessionId === studentId
  );
  const subjectTotals: Record<string, Record<string, number>> = {};
  studentResults.forEach((result) => {
    const { score, subject, studentAcademicSessionId, assessment } = result;
    const subjectName = subject.subject;
    const assessmentName = assessment.assessmentName;
    const key = `${studentAcademicSessionId}_${subjectName}`;
    if (!subjectTotals[key]) {
      subjectTotals[key] = {};
    }
    if (!subjectTotals[key][assessmentName]) {
      subjectTotals[key][assessmentName] = 0;
    }
    subjectTotals[key][assessmentName] += score;
  });
  const totalSubjectsCount = Object.keys(subjectTotals).length;
  const totalScores = Object.values(subjectTotals).map((subjectTotal) =>
    Object.values(subjectTotal).reduce((acc, score) => acc + score, 0)
  );
  const totalScore = totalScores.reduce((acc, score) => acc + score, 0);
  const totalScorePercentage = totalScore / totalSubjectsCount;
  return totalScorePercentage;
};

export const getPositionInClass = (
  studentTotals: Record<string, number>,
  studentId: string
): number | null => {
  const sortedStudentTotals = Object.entries(studentTotals).sort((a, b) => b[1] - a[1]);
  const studentIndex = sortedStudentTotals.findIndex(([id]) => id === studentId);
  return studentIndex !== -1 ? studentIndex + 1 : null;
};

export async function findClassWithMostStudents(
  schoolClasses: SchoolClass[]
): Promise<ClassWithStudentCount | null> {
  let maxStudentCount = 0;
  let classWithMaxStudents: ClassWithStudentCount | null = null;
  schoolClasses.forEach((schoolClass) => {
    const currentStudents = schoolClass.studentAcademicSession.filter(
      (session) => session.academicSession.current
    );
    const studentCount = currentStudents.length;
    if (studentCount > maxStudentCount) {
      maxStudentCount = studentCount;
      classWithMaxStudents = {
        className: schoolClass.className,
        totalStudents: studentCount,
      };
    }
  });

  return classWithMaxStudents;
}

interface StudentData {
  [key: string]: any;
}

export const processStudentResults = (results: any[]) => {
  const subjectTotalScores = calculateSubjectTotalScores(results);
  const totalScores = calculateTotalScores(subjectTotalScores);
  const studentsData: any[] = [];
  results.forEach((result) => {
    const {
      studentAcademicSessionId,
      studentAcademicSession,
      assessment,
      academicSession,
      class: studentClass,
      academicSessionTerm,
      firstApprovalStatus,
      secondApprovalStatus,
      parentApprovalStatus,
    } = result;
    const studentId = studentAcademicSession.id;
    const totalScorePercentage = calculateTotalScorePercentage(results, studentAcademicSessionId);
    const positionInClass = getPositionInClass(totalScores, studentAcademicSessionId);
    let studentRecord = studentsData.find((student) => student.id === studentId);
    if (!studentRecord) {
      studentRecord = {
        ...studentAcademicSession,
        assessment,
        totalScorePercentage,
        positionInClass,
        academicSession,
        class: studentClass,
        academicSessionTerm,
        studentAcademicSessionId,
        firstApprovalStatus,
        secondApprovalStatus,
      };
      studentsData.push(studentRecord);
    }
  });
  return studentsData;
};


export const checkApprovals = (results: any[]) => {
  const subjectTotalScores = calculateSubjectTotalScores(results);
  const totalScores = calculateTotalScores(subjectTotalScores);
  const studentsData: any[] = [];
  results.forEach((result) => {
    const {
      studentAcademicSessionId,
      studentAcademicSession,
      assessment,
      academicSession,
      firstApprovalStatus,
      class: studentClass,
      academicSessionTerm,
    } = result;
    const studentId = studentAcademicSession.id;
    const totalScorePercentage = calculateTotalScorePercentage(results, studentAcademicSessionId);
    const positionInClass = getPositionInClass(totalScores, studentAcademicSessionId);
    let studentRecord = studentsData.find((student) => student.id === studentId);
    if (!studentRecord) {
      studentRecord = {
        ...studentAcademicSession,
        assessment,
        totalScorePercentage,
        positionInClass,
        academicSession,
        class: studentClass,
        academicSessionTerm,
        studentAcademicSessionId,
        firstApprovalStatus,
      };
      studentsData.push(studentRecord);
    }
  });
  return studentsData;
};