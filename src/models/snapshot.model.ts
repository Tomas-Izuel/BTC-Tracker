import {
  Table,
  Column,
  Model,
  PrimaryKey,
  AutoIncrement,
  DataType,
  CreatedAt,
  UpdatedAt,
} from "sequelize-typescript";

@Table({
  tableName: "snapshots",
  timestamps: true,
  createdAt: "created_at",
  updatedAt: "updated_at",
  underscored: true,
})
class Snapshot extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column
  declare id: number;

  @Column(DataType.DECIMAL(20, 2))
  declare price: number;

  @Column(DataType.DECIMAL(10, 2))
  declare delta: number;

  @CreatedAt
  @Column({
    type: DataType.DATE,
    allowNull: false,
    defaultValue: DataType.NOW,
  })
  declare created_at: Date;

  @UpdatedAt
  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  declare updated_at: Date;
}

export default Snapshot;
