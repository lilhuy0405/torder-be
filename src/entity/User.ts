import { Column, Entity, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
import jwt = require('jsonwebtoken');
import 'dotenv/config';
@Entity('users')
class User {
    @PrimaryGeneratedColumn('increment', {
        type: 'int',
    })
    id: number;

    @Column()
    name: string;

    @Column()
    email: string;

    @Column()
    password: string;

    @Column()
    role: string;

    @Column({
        type: 'timestamp',
        default: () => 'CURRENT_TIMESTAMP',
    })
    createdAt: Date;

    @Column({
        type: 'timestamp',
        default: () => 'CURRENT_TIMESTAMP',
    })
    updatedAt: Date;

    generateJwt() {
        const payload = {
            id: this.id,
            name: this.name,
            email: this.email,
            role: this.role,
        };
        const token = jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRES_IN,
        });
        return token;
    }
}

export default User;