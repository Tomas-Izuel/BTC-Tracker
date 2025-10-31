import {
  Table,
  Column,
  Model,
  PrimaryKey,
  AutoIncrement,
  DataType,
} from "sequelize-typescript";

@Table({
  tableName: "config",
  timestamps: true,
  createdAt: "created_at",
  updatedAt: "updated_at",
  underscored: true,
})
class Config extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    unique: true,
    autoIncrement: true,
    allowNull: false,
  })
  declare id: number;

  @Column({
    type: DataType.FLOAT,
    allowNull: false,
  })
  declare delta_buy: number;

  @Column({
    type: DataType.FLOAT,
    allowNull: true,
    defaultValue: null,
  })
  declare delta_sell: number;

  @Column(DataType.FLOAT)
  declare amount_buy: number;

  @Column(DataType.FLOAT)
  declare amount_sell: number;
}

export default Config;
