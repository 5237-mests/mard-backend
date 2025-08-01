import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import User from "./user";

export interface IStore {
  id: number;
  name: string;
  location: string;
  storekeeper?: User;
}

@Entity("stores")
export class Store implements IStore {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", length: 255 })
  name: string;

  @Column({ type: "varchar", length: 255 })
  location: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: "storekeeper_id" })
  storekeeper: User;
}

export default Store;
