import { Model, Column, Table, ForeignKey, Unique, BelongsTo } from "sequelize-typescript";
import sequelize from "sequelize";

import { StudentModel } from "./StudentModel";
import { SalaryModel } from "./SalaryModel";
import { OfferStatusEnum } from "src/enums/offerStatus.enum";

@Table({
  tableName: "OnCampusOffer",
})
export class OnCampusOfferModel extends Model<OnCampusOfferModel> {
  @Column({
    type: sequelize.UUID,
    defaultValue: sequelize.UUIDV4,
    primaryKey: true,
    allowNull: false,
  })
  id: string;

  @Unique("StudentJobSalaryUnique")
  @ForeignKey(() => StudentModel)
  @Column({
    type: sequelize.UUID,
    allowNull: false,
  })
  studentId: string;

  @Unique("StudentJobSalaryUnique")
  @ForeignKey(() => SalaryModel)
  @Column({
    type: sequelize.UUID,
    allowNull: false,
  })
  salaryId: string;

  // Delete OnCampusOffer onDelete of Salary
  @BelongsTo(() => SalaryModel, {
    foreignKey: "salaryId",
    onDelete: "CASCADE",
  })
  salary: SalaryModel;

  @Column({
    type: sequelize.ENUM(...Object.values(OfferStatusEnum)),
  })
  status: OfferStatusEnum;
}
