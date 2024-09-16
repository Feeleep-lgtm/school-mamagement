import express from "express";
import { SchoolRoutes } from "../modules/School/application/school.controllers";
import { AcademicSessionRoutes } from "../modules/AcademicSession/application/academicSession.controller";
import { AcademicSessionTermRoutes } from "../modules/Term/application/term.controller";
import { SchoolClassSubjectRoutes } from "../modules/SchoolClass/application/class.controller";
import { TeacherRoutes } from "../modules/Teacher/application/teacher.controller";
import { SchoolTeacherRoutes } from "../modules/SchoolTeacher/application/schoolTeacher.controller";
import { ParentControllers } from "../modules/Parent/application/parent.controller";
import { BehaviourRoutes } from "../modules/Behaviour/application/behaviour.controller";
import { SkillsRoutes } from "../modules/Skills/application/skill.controller";
import { GuidentAdminRoutes } from "../modules/GuidentAdmin/application/app.controller";
import { FinancialRoutes } from "../modules/Financial/application/financial.controller";
import { ExpenseRoutes } from "../modules/Expenses/application/expense.controller";

const schoolRoutes = new SchoolRoutes();
const academicSession = new AcademicSessionRoutes();
const academicTerm = new AcademicSessionTermRoutes();
const classSubjectRoutes = new SchoolClassSubjectRoutes();
const teacherRoutes = new TeacherRoutes();
const schoolTeacherRoutes = new SchoolTeacherRoutes();
const parentRoutes = new ParentControllers();
const behavioursRoute = new BehaviourRoutes();
const skills = new SkillsRoutes();
const guidentAdminRoutes = new GuidentAdminRoutes();
const financialRoutes = new FinancialRoutes();
const expenseRoutes = new ExpenseRoutes

// migrating to version 2
const v2Api = express.Router();

v2Api.use("/v2/school", schoolRoutes.getRouters());
v2Api.use("/v2/school", academicSession.getRouters());
v2Api.use("/v2/school", academicTerm.getRouters());
v2Api.use("/v2/school", classSubjectRoutes.getRouters());
v2Api.use("/v2/teacher", teacherRoutes.getRoutes());
v2Api.use("/v2/school-teacher", schoolTeacherRoutes.getRouters());
v2Api.use("/v2/parent", parentRoutes.getRouters());
v2Api.use("/v2/school", behavioursRoute.getRouters());
v2Api.use("/v2/school", skills.getRouters());
v2Api.use("/v2/admin", guidentAdminRoutes.getRouters());
v2Api.use("/v2/school", financialRoutes.getRouters());
v2Api.use("/v2/school", expenseRoutes.getRouters())

export default v2Api;
