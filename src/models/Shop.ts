import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import User from "./user";

export interface IShop {
  id: number;
  name: string;
  location: string;
  shopkeeper?: User;
}

@Entity("shops")
export class Shop implements IShop {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", length: 255 })
  name: string;

  @Column({ type: "varchar", length: 255 })
  location: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: "shopkeeper_id" })
  shopkeeper: User;
}

export default Shop;
