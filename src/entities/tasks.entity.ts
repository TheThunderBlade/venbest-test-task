import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Jobs } from './jobs.entity';

@Entity()
export class Tasks {
    @PrimaryGeneratedColumn()
    id: number;

    @Column('int')
    costs: number;

    @Column('timestamp')
    startTime: Date;

    @Column('timestamp')
    endTime: Date;

    @OneToMany(() => Jobs, (job) => job.taskId)
    job: Jobs[];
}
