import { Column, Entity, PrimaryGeneratedColumn, JoinColumn, ManyToMany, ManyToOne, JoinTable } from 'typeorm';
import { Tasks } from './tasks.entity';
import { Users } from './users.entity';

@Entity()
export class Jobs {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Tasks, (task) => task.job)
    @JoinColumn({ name: 'taskId' })
    taskId: Tasks;

    @ManyToMany(() => Users, (user) => user.job)
    @JoinTable({ name: 'jobsInUsers' })
    userId: Users[];

    @Column('timestamp')
    startTime: Date;

    @Column('timestamp')
    endTime: Date;
}
