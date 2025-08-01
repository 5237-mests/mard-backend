import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import Shop from "./Shop";
import Item from "./Item";

export interface IShopItem {
  id: number;
  shop: Shop;
  item: Item;
  quantity: number;
}

@Entity("shop_items")
export class ShopItem implements IShopItem {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Shop)
  @JoinColumn({ name: "shop_id" })
  shop: Shop;

  @ManyToOne(() => Item)
  @JoinColumn({ name: "item_id" })
  item: Item;

  @Column({ type: "int" })
  quantity: number;
}

export default ShopItem;
