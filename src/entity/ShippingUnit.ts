import {Column, Entity, OneToMany, PrimaryColumn, PrimaryGeneratedColumn} from "typeorm"
import Order from "./Order";

@Entity()
class ShippingUnit {
  @PrimaryGeneratedColumn('increment', {
    type: 'int',
  })
  id: number;

  @Column({
    name: 'name',
  })
  name: string

  @Column({
    nullable: true,
  })
  trackingWebsite: string

  @Column({
    nullable: true,
  })
  appName: string

  @Column({
    nullable: true,
    default: 1,
  })
  status: number

  @OneToMany(type => Order, order => order.shippingUnit)
  orders: Order[];

}

export default ShippingUnit
