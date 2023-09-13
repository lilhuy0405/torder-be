import {Column, Entity, ManyToOne, OneToMany, PrimaryColumn} from "typeorm"
import ShippingUnit from "./ShippingUnit";

@Entity()
class Order {
  @Column({
    name: 'customer_name',
  })
  customerName: string

  @PrimaryColumn({
    name: 'phone_number',
  })
  phoneNumber: string

  @PrimaryColumn({
    name: 'ship_code',
  })
  shipCode: string

  @Column()
  product: string

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

  @Column({
    name: 'source_file',
    nullable: true,
  })
  sourceFile: string

  @ManyToOne(type => ShippingUnit, x => x.orders, {
    nullable: true,
  })
  shippingUnit: ShippingUnit


}

export default Order
