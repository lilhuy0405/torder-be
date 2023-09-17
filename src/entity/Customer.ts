import {Column, Entity, PrimaryGeneratedColumn} from "typeorm";

@Entity()
class Customer {
  @PrimaryGeneratedColumn('increment', {
    type: 'int',
  })
  id: number;

  @Column()
  name: string;

  @Column({
    unique: true,
  })
  phone: string;

  @Column({
    nullable: true,
  })
  address: string;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date

}

export default Customer
