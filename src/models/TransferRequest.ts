import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import User from "./user";

export interface ITransferItem {
  itemId: number;
  quantity: number;
}

export interface ITransferRequest {
  id: number;
  from: number;
  to: number;
  items: ITransferItem[];
  status: "pending" | "approved" | "rejected";
  requestedBy: User;
  approvedBy?: User;
}

@Entity("transfer_requests")
export class TransferRequest implements ITransferRequest {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "int" })
  from: number;

  @Column({ type: "int" })
  to: number;

  @Column("json")
  items: ITransferItem[];

  @Column({
    type: "enum",
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  })
  status: "pending" | "approved" | "rejected";

  @ManyToOne(() => User)
  @JoinColumn({ name: "requested_by_id" })
  requestedBy: User;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: "approved_by_id" })
  approvedBy: User;
}

export default TransferRequest;
