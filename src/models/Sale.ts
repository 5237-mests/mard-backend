import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from "typeorm";
import Shop from "./Shop";
import User from "./user";
import Item from "./Item";

export interface ISaleItem {
  itemId: number;
  quantitySold: number;
}

export interface ISale {
  id: number;
  shop: Shop;
  items: ISaleItem[];
  soldBy: User;
  soldAt: Date;
}

@Entity("sales")
export class Sale implements ISale {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Shop)
  @JoinColumn({ name: "shop_id" })
  shop: Shop;

  @Column("json")
  items: ISaleItem[];

  @ManyToOne(() => User)
  @JoinColumn({ name: "sold_by_id" })
  soldBy: User;

  @CreateDateColumn()
  soldAt: Date;
}

export default Sale;
