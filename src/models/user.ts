import { Entity, PrimaryGeneratedColumn, Column, BeforeInsert, BeforeUpdate } from "typeorm";
import bcrypt from "bcrypt";

export interface IUser {
  id: number;
  name: string;
  email: string;
  phone: string;
  password: string;
  role: "admin" | "shopkeeper" | "storekeeper" | "user";
  isVerified?: boolean;
  verificationToken?: string;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

@Entity("users")
export class User implements IUser {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", length: 255 })
  name: string;

  @Column({ type: "varchar", length: 255, unique: true })
  email: string;

  @Column({ type: "varchar", length: 20 })
  phone: string;

  @Column({ type: "varchar", length: 1024 })
  password: string;

  @Column({
    type: "enum",
    enum: ["admin", "shopkeeper", "storekeeper", "user"],
    default: "user",
  })
  role: "admin" | "shopkeeper" | "storekeeper" | "user";

  @Column({ type: "boolean", default: false })
  isVerified: boolean;

  @Column({ type: "varchar", length: 255, nullable: true })
  verificationToken: string;

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.password && !this.password.startsWith('$2')) {
      this.password = await bcrypt.hash(this.password, 10);
    }
  }

  async comparePassword(candidatePassword: string): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.password);
  }
}

export default User;
