import { Router, type Request, type Response } from "express";
import {
  zStudentId,
  zCourseId,
} from "../libs/zodValidators.js";

import type { Student, Course, Enrollment } from "../libs/types.js";

// import database
import { students, enrollments, courses } from "../db/db.js";

const router = Router();

router.get("/", (req: Request, res: Response) => {
  try {
    const courseNo = req.query.courseNo as string | undefined;
    const studentId = req.query.studentId as string | undefined;
    if ((courseNo && studentId) || (!courseNo && !studentId)) {
      return res.status(400).json({
        ok: false,
        message: "Please provide either studentId or courseNo and not both!",
      });
    }

    if (courseNo) {
      const validate = zCourseId.safeParse(courseNo);

      if (!validate.success) {
        return res.status(400).json({
          ok: false,
          message: validate.error.issues[0]?.message,
        });
      }

      const ids = enrollments
        .filter((e: any) => (e.courseNo || e.courseId) === courseNo)
        .map((s) => s.studentId);

      const filterStds = students
        .filter((std: Student) => ids.includes(std.studentId))
        .map((std: Student) => ({
          studentId: std.studentId,
          firstName: std.firstName,
          lastName: std.lastName,
          program: std.program,
        }));

      return res.status(200).json({
        ok: true,
        students: filterStds,
      });
    }

    if (studentId) {
      const validate = zStudentId.safeParse(studentId);

      if (!validate.success) {
        return res.status(400).json({
          ok: false,
          message: validate.error.issues[0]?.message,
        });
      }

      const filteredCourseNos = enrollments
        .filter((e) => e.studentId === studentId)
        .map((d: any) => d.courseNo || d.courseId);

      const result = courses
        .filter((c) => filteredCourseNos.includes(c.courseId))
        .map((d) => ({
          courseNo: d.courseId,
          title: d.courseTitle,
        }));
      return res.status(200).json({
        ok: true,
        courses: result,
      });
    }
  } catch (err) {
    return res.status(500).json({
      ok: false,
      error: err,
    });
  }
});

export default router;