import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

export interface IItem {
  id: number;
  name: string;
  code: string;
  unit: string;
  description: string;
}

@Entity("items")
export class Item implements IItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", length: 255 })
  name: string;

  @Column({ type: "varchar", length: 100, unique: true })
  code: string;

  @Column({ type: "varchar", length: 50 })
  unit: string;

  @Column({ type: "text", nullable: true })
  description: string;
}

export default Item;
