import { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import prisma from "../../../database/PgDB";
import { UserRepository } from "../../../shared/repository/userRepository";
import { AcademicSessionModel } from "../../AcademicSession/application/academicSession.model";
import { AcademicSessionTermModel } from "../../Term/application/term.model";

import { BadRequestError } from "../../../errors";


export class ExpenseServices {
    private userRepository = new UserRepository();
    private academicSession = new AcademicSessionModel();
    private academicSessionTerm = new AcademicSessionTermModel();
    public setExpenseCategory: RequestHandler = async (req, res, next) => {
        try {
            const school = await this.userRepository.findSchoolByUserId(req.params.schoolId);
            const findIfExists = await prisma.expenseCategory.findFirst({
                where: {
                    schoolId: school.id,
                }
            });
            if (findIfExists) {
                throw new BadRequestError("Already exist");
            }
            await prisma.expenseCategory.createMany({
                data: {
                    name: req.body.name,
                    schoolId: school.id
                },
            })
            res.status(StatusCodes.CREATED).json({ message: "Created successfully" });
        } catch (error) {
            next(error);
        }
    }

    public setExpenseVendor: RequestHandler = async (req, res, next) => {
        try {
            const school = await this.userRepository.findSchoolByUserId(req.params.schoolId);
            const findIfExists = await prisma.expenseVendor.findFirst({
                where: {
                    schoolId: school.id,
                }
            });
            if (findIfExists) {
                throw new BadRequestError("Already exist");
            }
            await prisma.expenseVendor.createMany({
                data: {
                    name: req.body.name,
                    schoolId: school.id,
                },
            })
            res.status(StatusCodes.CREATED).json({ message: "Created successfully" });
        } catch (error) {
            next(error);
        }
    } 
    public fetchExpenseCategory: RequestHandler = async (req, res, next) => {
        try {
            const school = await this.userRepository.findSchoolByUserId(req.params.schoolId);
            const fetchCategory = await prisma.expenseCategory.findMany({
                where: {
                    schoolId : school.id
                }
            })
            res
        .status(StatusCodes.OK)
        .json({ message: "Categories fetched successfully", data: fetchCategory });

        }catch (error) {
            next(error);
        }
    }
    public fetchExpenseVendor: RequestHandler = async (req, res, next) => {
        try {
            const school = await this.userRepository.findSchoolByUserId(req.params.schoolId);
            const fetchVendor = await prisma.expenseVendor.findMany({
                where: {
                    schoolId : school.id
                }
            })
            res
        .status(StatusCodes.OK)
        .json({ message: "Vendors fetched successfully", data: fetchVendor });

        }catch (error) {
            next(error);
        }
    }
    public updateCategory: RequestHandler = async (req, res, next) => {
        try {
          await this.userRepository.findSchoolByUserId(req.params.schoolId);
          await prisma.expenseCategory.update({
            where: {
              id: req.body.expenseCategoryId,
            },
            data: {
              name: req.body.name,
            },
          });
          res.status(StatusCodes.CREATED).json({ message: "Updated successfully" });
        } catch (error) {
          next(error);
        }
    };
    public updateVendor: RequestHandler = async (req, res, next) => {
        try {
          await this.userRepository.findSchoolByUserId(req.params.schoolId);
          await prisma.expenseVendor.update({
            where: {
              id: req.body.expenseVendorId,
            },
            data: {
              name: req.body.name,
            },
          });
          res.status(StatusCodes.CREATED).json({ message: "Updated successfully" });
        } catch (error) {
          next(error);
        }
    };
    public expense: RequestHandler = async (req, res, next) => {
        try {
            const school = await this.userRepository.findSchoolByUserId(req.params.schoolId);
            await this.academicSession.findAcademicSessionById(req.body.academicSessionId);
            await this.academicSessionTerm.findAcademicSessionTermById(req.body.academicSessionTermId);
            const findCategoryExists = await prisma.expenseCategory.findFirst({
                where: {
                    schoolId: school.id,
                    
                }
                
            })
  
            if (!findCategoryExists) {
                
                throw new BadRequestError("Category does not exist exist");
            }

            const findVendorExists = await prisma.expenseVendor.findFirst({
                where: {
                    schoolId: school.id,
                    
                }
            })
            if (!findVendorExists) {
                throw new BadRequestError("Already exist");
            }

            const checkIfExpenseExists = await prisma.expense.findFirst({
                where: {
                    academicSessionId: req.body.academicSessionId as string,
                    academicSessionTermId: req.body.academicSessionTermId as string,
                    schoolId: school.id,
                    expenseCategoryId: req.body.expenseCategoryId as string,
                    expenseVendorId: req.body.expenseVendorId as string,
                }
            })
            if(checkIfExpenseExists) {
                throw new BadRequestError('Expense already exists')
            }
            
            await prisma.expense.create({
                data: {
                    academicSessionId: req.body.academicSessionId as string,
                    academicSessionTermId: req.body.academicSessionTermId as string,
                    schoolId: school.id,
                    expenseCategoryId: req.body.expenseCategoryId as string,
                    expenseVendorId: req.body.expenseVendorId as string,
                    receipt: req.body.receipt,
                    paidAmount: req.body.paidAmount,
                    totalCostOfService: req.body.totalCostOfService,
                    description: req.body.description,
                },
                
            });

          
            

            res.status(StatusCodes.OK).json({ message: "Expense added successfully"})

        } catch (error) {
            next(error)
        }
       


    }
    public fetchExpenses: RequestHandler = async (req, res, next) => {
        try {
            const school = await this.userRepository.findSchoolByUserId(req.params.schoolId);
            const fetchExpense = await prisma.expense.findMany({
                where: {
                    schoolId : school.id
                }
            })
            res
        .status(StatusCodes.OK)
        .json({ message: "Expenses fetched successfully", data: fetchExpense });

        }catch (error) {
            next(error);
        }
    }
    public fetchExpense: RequestHandler = async (req, res, next) => {
        try {
            const school = await this.userRepository.findSchoolByUserId(req.params.schoolId);
            const whereClause: any = {
                schoolId: school.id,
              };
        } catch (error) {
            next(error)
        }
    }
      
    public fetchAnExpense: RequestHandler = async (req, res, next) => {
        try {
          const school = await this.userRepository.findSchoolByUserId(req.params.schoolId);
          await this.academicSession.findAcademicSessionById(req.query.academicSessionId as string);
          await this.academicSessionTerm.findAcademicSessionTermById(
            req.query.academicSessionTermId as string
          );
          const findExpense = await prisma.expense.findFirst({
            where: {
              academicSessionId: req.query.academicSessionId as string,
              academicSessionTermId: req.query.academicSessionTermId as string,
              schoolId: school.id,
              expenseCategoryId: req.query.expenseCategoryId as string,
              expenseVendorId: req.query.expenseVendorId as string,
            },

          });
          res
            .status(StatusCodes.OK)
            .json({ message: "Fetched successfully", data: this.fetchAnExpense });
        } catch (error) {
          next(error);
        }
      };
   


}