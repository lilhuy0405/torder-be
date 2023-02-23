import { Column, Entity, PrimaryColumn } from "typeorm"

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
}

export default Order