import { Injectable, Inject, NotFoundException } from "@nestjs/common";
import { FindOptions, Transaction } from "sequelize";
import { STUDENT_DAO, USER_DAO } from "src/constants";
import { PenaltyModel, ProgramModel, ResumeModel, StudentModel, UserModel } from "src/db/models";
import { parsePagesize, parseFilter, parseOrder } from "src/utils";
import { GetStudentQueryDto } from "./dtos/studentGetQuery.dto";

@Injectable()
export class StudentService {
  constructor(
    @Inject(STUDENT_DAO) private studentRepo: typeof StudentModel,
    @Inject(USER_DAO) private userRepo: typeof UserModel
  ) {}

  async getStudents(where: GetStudentQueryDto) {
    // eslint-disable-next-line prefer-const
    let findOptions: FindOptions<StudentModel> = {
      include: [
        {
          model: UserModel,
          as: "user",
        },
        {
          model: ProgramModel,
          as: "program",
        },
      ],
    };

    // Add page size options
    const pageOptions = parsePagesize(where);
    Object.assign(findOptions, pageOptions);
    // Apply filter
    parseFilter(findOptions, where.filterBy || {});
    // Apply order
    findOptions.order = parseOrder(where.orderBy || {});

    const ans = await this.studentRepo.findAll(findOptions);

    return ans.map((student) => student.get({ plain: true }));
  }

  async getStudent(id: string) {
    const ans = await this.studentRepo.findByPk(id, {
      include: [
        {
          model: UserModel,
          as: "user",
        },
        {
          model: ProgramModel,
          as: "program",
        },
        {
          model: PenaltyModel,
          as: "penalties", //Not many penalties per student.
        },
        {
          model: ResumeModel,
          as: "resumes",
        },
      ],
    });
    if (!ans) throw new NotFoundException(`The Student with id: ${id} Not Found`);

    const res: StudentModel & { totalPenalty?: number } = ans.get({ plain: true });
    res.totalPenalty = 0;
    res.penalties.forEach((penalty) => (res.totalPenalty += penalty.penalty));

    return res;
  }

  async createStudents(students): Promise<string[]> {
    const ans = await this.studentRepo.bulkCreate(students, {
      include: [
        {
          model: UserModel,
          as: "user",
        },
      ],
    });

    return ans.map((student) => student.id);
  }

  async updateStudent(student, t: Transaction) {
    const ans = await this.studentRepo.findByPk(student.id);
    if (!ans) return [student.id];

    const pr = [];
    pr.push(
      this.studentRepo.update(student, {
        where: { id: ans.id },
        transaction: t,
      })
    );

    if (student.user) {
      pr.push(
        this.userRepo.update(student.user, {
          where: { id: ans.userId },
          transaction: t,
        })
      );
    }

    return [];
  }

  async deleteStudents(pids: string[]) {
    const students = await this.studentRepo.findAll({
      where: { id: pids },
      attributes: ["userId"],
    });

    const userIds = students.map((student) => student.userId);

    return await this.userRepo.destroy({
      where: { id: userIds },
    });
  }
}
