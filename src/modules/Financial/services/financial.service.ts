import { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import prisma from "../../../database/PgDB";
import { UserRepository } from "../../../shared/repository/userRepository";
import { AcademicSessionModel } from "../../AcademicSession/application/academicSession.model";
import { AcademicSessionTermModel } from "../../Term/application/term.model";
import { SchoolClassSubjectModels } from "../../SchoolClass/application/class.model";
import { BadRequestError } from "../../../errors";

export class FinancialServices {
  private userRepository = new UserRepository();
  private academicSession = new AcademicSessionModel();
  private academicSessionTerm = new AcademicSessionTermModel();
  private schoolClass = new SchoolClassSubjectModels();
  public setFeeType: RequestHandler = async (req, res, next) => {
    try {
      const school = await this.userRepository.findSchoolByUserId(req.params.schoolId);
      await this.academicSession.findAcademicSessionById(req.body.academicSessionId);
      await this.academicSessionTerm.findAcademicSessionTermById(req.body.academicSessionTermId);
      await this.schoolClass.findClass(req.body.classId);
      const findIfExists = await prisma.financialType.findFirst({
        where: {
          academicSessionId: req.body.academicSessionId as string,
          academicSessionTermId: req.body.academicSessionTermId as string,
          classId: req.body.classId,
          schoolId: school.id,
        },
      });
      if (findIfExists) {
        throw new BadRequestError("Already exist");
      }
      await prisma.financialType.createMany({
        data: {
          academicSessionId: req.body.academicSessionId as string,
          academicSessionTermId: req.body.academicSessionTermId as string,
          schoolId: school.id,
          feeAmount: Number(req.body.feeAmount),
          name: req.body.name,
          classId: req.body.classId,
        },
      });
      res.status(StatusCodes.CREATED).json({ message: "Created successfully" });
    } catch (error) {
      next(error);
    }
  };
  public fetchFeeBySessionTermClass: RequestHandler = async (req, res, next) => {
    try {
      const school = await this.userRepository.findSchoolByUserId(req.params.schoolId);
      await this.academicSession.findAcademicSessionById(req.query.academicSessionId as string);
      await this.academicSessionTerm.findAcademicSessionTermById(
        req.query.academicSessionTermId as string
      );
      await this.schoolClass.findClass(req.query.classId as string);
      const fetchFeeBySessionTerm = await prisma.financialType.findMany({
        where: {
          academicSessionId: req.query.academicSessionId as string,
          academicSessionTermId: req.query.academicSessionTermId as string,
          classId: req.query.classId as string,
          schoolId: school.id,
        },
      });
      res
        .status(StatusCodes.OK)
        .json({ message: "Records fetched successfully", data: fetchFeeBySessionTerm });
    } catch (error) {
      next(error);
    }
  };
  public updateFeeBySessionTerm: RequestHandler = async (req, res, next) => {
    try {
      await this.userRepository.findSchoolByUserId(req.params.schoolId);
      await prisma.financialType.update({
        where: {
          id: req.body.feeTypeId,
        },
        data: {
          feeAmount: Number(req.body.feeAmount),
          name: req.body.name,
        },
      });
      res.status(StatusCodes.CREATED).json({ message: "Updated successfully" });
    } catch (error) {
      next(error);
    }
  };
  public makePayment: RequestHandler = async (req, res, next) => {
    try {
      const school = await this.userRepository.findSchoolByUserId(req.params.schoolId);
      await this.academicSession.findAcademicSessionById(req.body.academicSessionId);
      await this.academicSessionTerm.findAcademicSessionTermById(req.body.academicSessionTermId);
      await this.schoolClass.findClass(req.body.classId);
      const findIfExists = await prisma.financialType.findFirst({
        where: {
          academicSessionId: req.body.academicSessionId as string,
          academicSessionTermId: req.body.academicSessionTermId as string,
          schoolId: school.id,
        },
      });
      if (!findIfExists) {
        throw new BadRequestError("Already exist");
      }
      if (req.body.amount > findIfExists.feeAmount) {
        throw new BadRequestError(
          `Amount must be within the Fee amount range: ${findIfExists.feeAmount}`
        );
      }
      const checkIfPaymentExist = await prisma.financial.findFirst({
        where: {
          academicSessionId: req.body.academicSessionId as string,
          academicSessionTermId: req.body.academicSessionTermId as string,
          schoolId: school.id,
          classId: req.body.classId,
        },
      });
      if (checkIfPaymentExist) {
        const ifHalfPaymentExist = findIfExists.feeAmount - parseInt(checkIfPaymentExist.amount);
        if (req.body.amount > ifHalfPaymentExist) {
          throw new BadRequestError(
            `You already made payment for this student and the student balance is ${ifHalfPaymentExist}`
          );
        }
        await prisma.financial.create({
          data: {
            academicSessionId: req.body.academicSessionId as string,
            academicSessionTermId: req.body.academicSessionTermId as string,
            schoolId: school.id,
            receipt: req.body.receipt,
            classId: req.body.classId,
            studentAcademicSessionId: req.body.studentAcademicSessionId,
            currency: "NAIRA",
            amount: req.body.amount,
            feeTypeId: findIfExists.id,
            status: "PAID",
            paymentMethod: req.body.paymentMethod,
          },
        });
      }
      await prisma.financial.create({
        data: {
          academicSessionId: req.body.academicSessionId as string,
          academicSessionTermId: req.body.academicSessionTermId as string,
          schoolId: school.id,
          receipt: req.body.receipt,
          classId: req.body.classId,
          studentAcademicSessionId: req.body.studentAcademicSessionId,
          currency: "NAIRA",
          amount: req.body.amount,
          feeTypeId: findIfExists.id,
          status: "PAID",
          paymentMethod: req.body.paymentMethod,
        },
      });
      res.status(StatusCodes.OK).json({ message: "Payment record saved successfully" });
    } catch (error) {
      next(error);
    }
  };
  public fetchPaymentHistory: RequestHandler = async (req, res, next) => {
    try {
      const school = await this.userRepository.findSchoolByUserId(req.params.schoolId);

      const whereClause: any = {
        schoolId: school.id,
      };
      if (req.query.academicSessionId) {
        whereClause.academicSessionId = req.query.academicSessionId as string;
        await this.academicSession.findAcademicSessionById(req.query.academicSessionId as string);
      }
      if (req.query.academicSessionTermId) {
        whereClause.academicSessionTermId = req.query.academicSessionTermId;
        await this.academicSessionTerm.findAcademicSessionTermById(
          req.query.academicSessionTermId as string
        );
      }
      if (req.query.status) {
        whereClause.status = (req.query.status as any).toUpperCase();
      }
      if (req.query.feeTypeId) {
        whereClause.feeTypeId = req.query.feeTypeId as string;
        const findIfExists = await prisma.financialType.findFirst({
          where: {
            id: req.query.feeTypeId as string,
          },
        });
        if (!findIfExists) {
          throw new BadRequestError("feeTypeId does not exist");
        }
      }
      if (req.query.classId) {
        whereClause.classId = req.query.classId as string;
        await this.schoolClass.findClass(req.query.classId as string); // Assuming this line is necessary
      }
      const findPaymentHistories = await prisma.financial.findMany({
        where: {
          ...whereClause,
        },
        include: {
          class: true,
          school: true,
          feeType: true,
          academicSessionTerm: true,
          studentAcademicSessions: {
            include: {
              class: true,
              student: {
                include: {
                  student: true,
                },
              },
            },
          },
        },
      });
      res
        .status(StatusCodes.OK)
        .json({ message: "Fetched successfully", data: findPaymentHistories });
    } catch (error) {
      next(error);
    }
  };
  public studentPaymentHistory: RequestHandler = async (req, res, next) => {
    try {
      const school = await this.userRepository.findSchoolByUserId(req.params.schoolId);
      await this.academicSession.findAcademicSessionById(req.query.academicSessionId as string);
      await this.academicSessionTerm.findAcademicSessionTermById(
        req.query.academicSessionTermId as string
      );
      await this.schoolClass.findClass(req.query.classId as string);
      const findPaymentHistory = await prisma.financial.findFirst({
        where: {
          academicSessionId: req.query.academicSessionId as string,
          academicSessionTermId: req.query.academicSessionTermId as string,
          schoolId: school.id,
          studentAcademicSessionId: req.query.studentAcademicSessionId as string,
          classId: req.query.classId as string,
        },
        include: {
          studentAcademicSessions: {
            include: {
              student: {
                include: {
                  student: true,
                },
              },
            },
          },
        },
      });
      res
        .status(StatusCodes.OK)
        .json({ message: "Fetched successfully", data: findPaymentHistory });
    } catch (error) {
      next(error);
    }
  };
}
