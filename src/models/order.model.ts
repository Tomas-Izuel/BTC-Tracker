import {
  Table,
  Column,
  Model,
  PrimaryKey,
  AutoIncrement,
  DataType,
  CreatedAt,
  UpdatedAt,
  AllowNull,
  BelongsTo,
  ForeignKey,
} from "sequelize-typescript";
import Snapshot from "./snapshot.model";

@Table({
  tableName: "orders",
  timestamps: true,
  createdAt: "created_at",
  updatedAt: "updated_at",
  underscored: true,
})
class Order extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column
  declare id: number;

  @Column(DataType.DECIMAL(20, 2))
  declare price: number;

  @Column({
    type: DataType.ENUM("buy", "sell"),
    allowNull: false,
  })
  declare type: "buy" | "sell";

  // Campos de Binance
  @AllowNull(true)
  @Column(DataType.BIGINT)
  declare binance_order_id: number | null;

  @AllowNull(true)
  @Column(DataType.STRING)
  declare binance_client_order_id: string | null;

  @AllowNull(true)
  @Column(DataType.STRING)
  declare binance_status: string | null;

  @AllowNull(true)
  @Column(DataType.DECIMAL(20, 8))
  declare executed_qty: number | null;

  @AllowNull(true)
  @Column(DataType.DECIMAL(20, 8))
  declare cummulative_quote_qty: number | null;

  @AllowNull(true)
  @Column(DataType.TEXT)
  declare binance_response: string | null;

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
    defaultValue: DataType.NOW,
  })
  declare updated_at: Date;

  @ForeignKey(() => Snapshot)
  @AllowNull(false)
  @Column
  snapshotId!: number;

  @BelongsTo(() => Snapshot)
  snapshot!: Snapshot;
}

export default Order;
