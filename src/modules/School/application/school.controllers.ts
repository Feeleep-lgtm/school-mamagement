import { Router } from "express";
import { SchoolAuthLogics } from "../services/school.auth.service";
import { UploadSchoolAssets } from "../services/shool.uploads.service";
import { validate } from "express-validation";
import {
  completeShoolProfileValidation,
  createSchoolValidation,
  tokenVerification,
  updatePasswordVerification,
  requestTokenValidation,
  admitStudentValidation,
  searchStudentValidation,
  searchParentValidation,
  createAcademicSessionAssessmentValidation,
  uploadResultValidation,
  viewResultValidation,
  filterAcademicTermClassValidation,
  filterEditsResultValidation,
  editResultValidation,
  createRemarksValidation,
  createAttendanceValidation,
  promoteStudentValidation,
  approveResultToParentsValidation,
} from "./validations";
import { AuthMiddleware } from "../../../middlewares/auth/authToken";
import { SchoolResult } from "../services/school.result.service";
import { SchoolManagement } from "../services/school.management.service";
import { StudentService } from "../../Students/services/student.service";
import { createStudentValidation } from "../../Students/application/validations";
import { SchoolAcademicSessionAssessment } from "../services/school.assessment.service";
import { AttendanceService } from "../services/school.attendance.service";
import { ResultsAndApproval } from "../services/school.results-approval.service";
import { ApprovalsService } from "../services/school.approvals.service";
import { SchoolRecords } from "../services/school.records.service";

export class SchoolRoutes {
  private router: Router;
  private authService: SchoolAuthLogics;
  private upload: UploadSchoolAssets;
  private auth: AuthMiddleware;
  private result: SchoolResult;
  private student: StudentService;
  private management: SchoolManagement;
  private assessment: SchoolAcademicSessionAssessment;
  private attendance: AttendanceService;
  private resultsAndApproval: ResultsAndApproval;
  private approvalService: ApprovalsService;
  private schoolRecords: SchoolRecords;
  constructor() {
    this.router = Router();
    this.authService = new SchoolAuthLogics();
    this.upload = new UploadSchoolAssets();
    this.auth = new AuthMiddleware();
    this.result = new SchoolResult();
    this.management = new SchoolManagement();
    this.student = new StudentService();
    this.assessment = new SchoolAcademicSessionAssessment();
    this.result = new SchoolResult();
    this.attendance = new AttendanceService();
    this.resultsAndApproval = new ResultsAndApproval();
    this.approvalService = new ApprovalsService();
    this.schoolRecords = new SchoolRecords();
    this.initRoutes();
  }

  private initRoutes() {
    this.initAuthRoutes();
    this.initManagementRoutes();
    this.initApprovals();
    this.initAssessmentsRoutes();
    this.initResults();
    this.initAttendanceRoutes();
    this.initRecordsRoutes();
  }

  private initRecordsRoutes() {
    this.router.post(
      "/:schoolId/records",
      this.auth.Auth,
      this.auth.schoolAuth,
      this.schoolRecords.getSchoolRecords
    );
  }

  private initAttendanceRoutes() {
    this.router.post(
      "/:schoolId/attendance",
      this.auth.Auth,
      validate(createAttendanceValidation),
      this.auth.schoolAuth,
      this.attendance.attendance
    );
    this.router.get(
      "/:schoolId/attendance",
      this.auth.Auth,
      validate(filterAcademicTermClassValidation),
      this.auth.schoolAuth,
      this.attendance.fetchAttendance
    );
  }

  private initAuthRoutes() {
    this.router.post("/auth/signup", validate(createSchoolValidation), this.authService.signup);
    this.router.post("/auth/login", this.authService.login);
    this.router.post(
      "/auth/request-otp",
      validate(requestTokenValidation),
      this.authService.requestOtp
    );
    this.router.patch(
      "/auth/verify-email",
      validate(tokenVerification),
      this.authService.verifyEmailAccount
    );
    this.router.patch(
      "/auth/reset-password",
      validate(updatePasswordVerification),
      this.authService.updateSchoolPassword
    );
    this.router.patch(
      "/auth/onboarding/:schoolId",
      this.auth.Auth,
      validate(completeShoolProfileValidation),
      this.authService.onboarding
    );
    this.router.post(
      "/profile/:schoolId",
      this.auth.Auth,
      this.upload.getMulter().single("image"),
      this.upload.uploadProfilePicture
    );
    this.router.delete("/profile/:schoolId", this.auth.Auth, this.upload.deleteProfilePicture);
  }

  private initManagementRoutes() {
    this.router.get(
      "/school/:schoolId",
      this.auth.Auth,
      this.auth.schoolAuth,
      this.management.getSchoolAccount
    );
    this.router.get(
      "/students/:schoolId",
      this.auth.Auth,
      this.auth.schoolAuth,
      this.student.students
    );
    this.router.post(
      "/management/:schoolId/create-student-account",
      this.auth.Auth,
      this.auth.schoolAuth,
      validate(createStudentValidation),
      this.student.createStudent
    );
    this.router.post(
      "/management/:schoolId/admit-student",
      this.auth.Auth,
      this.auth.schoolAuth,
      validate(admitStudentValidation),
      this.student.admitStudent
    );
    this.router.post(
      "/management/:schoolId/remarks",
      this.auth.Auth,
      this.auth.schoolAuth,
      validate(createRemarksValidation),
      this.management.remarks
    );
    this.router.post(
      "/management/:schoolId/search-student",
      this.auth.Auth,
      this.auth.schoolAuth,
      validate(searchStudentValidation),
      this.student.searchStudent
    );
    this.router.post(
      "/management/:schoolId/search-parent",
      this.auth.Auth,
      this.auth.schoolAuth,
      validate(searchParentValidation),
      this.management.searchParent
    );
    this.router.post(
      "/management/complete-parent-onboarding/:schoolId",
      this.auth.Auth,
      this.auth.schoolAuth,
      this.management.completeParentOnboarding
    );
    this.router.delete(
      "/:schoolId/management/delete-account",
      this.auth.Auth,
      this.auth.schoolAuth,
      this.management.deactivateAccount
    );
    this.router.post(
      "/:schoolId/management/promote-student",
      this.auth.Auth,
      this.auth.schoolAuth,
      validate(promoteStudentValidation, {}, {}),
      this.management.promoteStudent
    );
  }

  private initAssessmentsRoutes() {
    this.router.post(
      "/assessments/:schoolId/:academicSessionId",
      this.auth.Auth,
      validate(createAcademicSessionAssessmentValidation, {}, {}),
      this.assessment.createAcademicSessionAssessment
    );
    this.router.get(
      "/assessments/:schoolId/:assessmentId",
      this.auth.Auth,
      this.auth.schoolAuth,
      this.assessment.getAcademicSessionAssessment
    );
    this.router.get(
      "/assessments/:schoolId",
      this.auth.Auth,
      this.auth.schoolAuth,
      this.assessment.getAcademicSessionAssessments
    );
    this.router.patch(
      "/assessments/:schoolId/:academicSessionId",
      this.auth.Auth,
      this.auth.schoolAuth,
      this.assessment.updateAcademicSessionAssessment
    );
  }

  private initApprovals() {
    //approvals to parent
    this.router.post(
      "/:schoolId/results/approve-results-to-parent",
      this.auth.Auth,
      validate(approveResultToParentsValidation, {}, {}),
      this.auth.schoolAuth,
      this.approvalService.approveStudentAcademicResultsToParent
    );

    this.router.get(
      "/:schoolId/results/view-results-to-approve",
      this.auth.Auth,
      this.auth.schoolAuth,
      this.approvalService.studentsThatNeedsApprovals
    );

    this.router.post(
      "/:schoolId/results/approve-results-by-assessment",
      this.auth.Auth,
      this.auth.schoolAuth,
      validate(approveResultToParentsValidation, {}, {}),
      this.approvalService.approveResultsByAssessment
    );
  }

  private initResults() {
    this.router.post(
      "/results/:schoolId",
      this.auth.Auth,
      validate(uploadResultValidation, {}, {}),
      this.auth.schoolAuth,
      this.result.uploadResult
    );
    this.router.post(
      "/new-upload-results/:schoolId",
      this.auth.Auth,
      validate(uploadResultValidation, {}, {}),
      this.auth.schoolAuth,
      this.resultsAndApproval.uploadResult
    );
    this.router.get(
      "/results/student/:schoolId",
      this.auth.Auth,
      validate(viewResultValidation, {}, {}),
      this.auth.schoolAuth,
      this.result.viewStudentResult
    );
    this.router.get(
      "/results/view-student-class-result/:schoolId",
      this.auth.Auth,
      validate(viewResultValidation, {}, {}),
      this.auth.schoolAuth,
      this.resultsAndApproval.viewStudentClassResult
    );
    this.router.get(
      "/results/filter/:schoolId",
      this.auth.Auth,
      validate(filterAcademicTermClassValidation, {}, {}),
      this.auth.schoolAuth,
      this.result.filterResults
    );
    this.router.get(
      "/results/fetch-class-results/:schoolId",
      this.auth.Auth,
      validate(filterAcademicTermClassValidation, {}, {}),
      this.auth.schoolAuth,
      this.resultsAndApproval.fetchClassResults
    );
    this.router.get(
      "/results/filter-edit-results/:schoolId",
      this.auth.Auth,
      validate(filterEditsResultValidation, {}, {}),
      this.auth.schoolAuth,
      this.result.filterEditResults
    );
    this.router.put(
      "/results/edit-results/:schoolId",
      this.auth.Auth,
      validate(editResultValidation, {}, {}),
      this.auth.schoolAuth,
      this.result.updateResults
    );
  }

  public getRouters() {
    return this.router;
  }
}
