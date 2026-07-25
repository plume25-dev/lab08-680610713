import { Router, type Request, type Response } from "express";
import { zEnrollmentBody } from "../libs/zodValidators.js";
import { enrollments } from "../db/db.js";

const router = Router();

router.delete("/", (req: Request, res: Response) => {
  try {
    const studentIdReq = req.body?.studentId;
    const courseNoReq = req.body?.courseNo || req.body?.courseId;

    if (!studentIdReq || !courseNoReq) {
      return res.status(400).json({
        ok: false,
        message: "Please provide studentId and courseNo in request body",
      });
    }

    const bodyToValidate = {
      studentId: String(studentIdReq),
      courseId: String(courseNoReq),
    };

    const result = zEnrollmentBody.safeParse(bodyToValidate);
    if (!result.success) {
      return res.status(400).json({
        ok: false,
        message: "Validation failed",
        error: result.error.issues,
      });
    }

    const { studentId, courseId } = result.data;

    const index = enrollments.findIndex(
      (e: any) =>
        e.studentId === studentId &&
        (e.courseNo === courseId || e.courseId === courseId)
    );

    if (index === -1) {
      return res.status(404).json({
        ok: false,
        message: "Enrollment does not exist",
      });
    }

    enrollments.splice(index, 1);
    return res.status(200).json({
      ok: true,
      message: "Enrollment has been deleted",
    });
  } catch (err) {
    return res.status(500).json({
      ok: false,
      message: "something is wrong",
      error: err,
    });
  }
});

export default router;