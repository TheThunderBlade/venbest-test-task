import { Column, Entity, PrimaryGeneratedColumn, ManyToMany, JoinTable } from 'typeorm';
import { Jobs } from './jobs.entity';

@Entity()
export class Users {
    @PrimaryGeneratedColumn()
    id: number;

    @Column('text')
    name: string;

    @Column('int')
    rate: string;

    @ManyToMany(() => Jobs, (job) => job.userId)
    @JoinTable({ name: 'jobsInUsers' })
    job: Jobs;
}
