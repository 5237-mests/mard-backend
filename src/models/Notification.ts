import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from "typeorm";
import User from "./user";

export interface INotification {
  id: number;
  user: User;
  message: string;
  read: boolean;
  createdAt: Date;
}

@Entity("notifications")
export class Notification implements INotification {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: "user_id" })
  user: User;

  @Column({ type: "text" })
  message: string;

  @Column({ type: "boolean", default: false })
  read: boolean;

  @CreateDateColumn()
  createdAt: Date;
}

export default Notification;
