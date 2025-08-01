import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import Store from "./Store";
import Item from "./Item";

export interface IStoreItem {
  id: number;
  store: Store;
  item: Item;
  quantity: number;
}

@Entity("store_items")
export class StoreItem implements IStoreItem {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Store)
  @JoinColumn({ name: "store_id" })
  store: Store;

  @ManyToOne(() => Item)
  @JoinColumn({ name: "item_id" })
  item: Item;

  @Column({ type: "int" })
  quantity: number;
}

export default StoreItem;
