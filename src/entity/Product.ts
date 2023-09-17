import {Column, Entity, PrimaryGeneratedColumn} from "typeorm";

@Entity()
class Product {
  @PrimaryGeneratedColumn('increment', {
    type: 'int',
  })
  id: number;

  @Column()
  name: string;

  @Column({
    nullable: true,
  })
  price: number;

  @Column({
    nullable: true,
  })
  description: string;

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

export default Product
