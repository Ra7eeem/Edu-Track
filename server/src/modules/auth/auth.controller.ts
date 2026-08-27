import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendSuccess } from "../../utils/response";
import * as AuthService from "./auth.service";
import { LoginDto, RegisterStudentDto } from "./auth.schemas";

export const loginController = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await AuthService.login(req.body as LoginDto);
    sendSuccess(res, result, 200, "تم تسجيل الدخول بنجاح");
  }
);

export const registerStudentController = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await AuthService.registerStudent(
      req.body as RegisterStudentDto
    );
    sendSuccess(res, result, 201, "تم إنشاء الحساب بنجاح، في انتظار موافقة المدرس");
  }
);

export const getMeController = asyncHandler(
  async (req: Request, res: Response) => {
    const { User } = await import("../../models/User");
    const user = await User.findById(req.user!.userId);
    if (!user) {
      const { ApiError } = await import("../../utils/ApiError");
      throw ApiError.notFound("المستخدم غير موجود");
    }
    sendSuccess(res, user);
  }
);
