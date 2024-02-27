import { BadRequestException, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Jobs } from 'src/entities/jobs.entity';
import { ICreateJob } from './interfaces/ICreateJob.interface';
import { Users } from 'src/entities/users.entity';
import { Tasks } from 'src/entities/tasks.entity';

@Injectable()
export class JobsService {
    constructor(
        @InjectRepository(Jobs)
        private readonly jobsRepository: Repository<Jobs>,
        @InjectRepository(Users)
        private readonly usersRepository: Repository<Users>,
        @InjectRepository(Tasks)
        private readonly tasksRepository: Repository<Tasks>,
    ) {}

    private _hoursBetween(startTime: Date, endTime: Date): number {
        const oneHourInMs = 1000 * 60 * 60;
        const fifteenMinutesInMs = 15 * 60 * 1000;

        const millisecondsDiff = endTime.getTime() - startTime.getTime();
        const hours = millisecondsDiff / oneHourInMs;

        if (millisecondsDiff % oneHourInMs >= fifteenMinutesInMs) {
            return Math.ceil(hours);
        } else {
            return Math.floor(hours);
        }
    }

    private _totalRateForUser(userRate: number, jobInProgress: number) {
        let rate = 0;
        for (let i = 0; i < jobInProgress; i++) {
            rate += userRate;
        }
        return rate;
    }

    async getList(percent?: number) {
        try {
            const tasks = await this.tasksRepository.find({
                relations: ['job', 'job.userId'],
            });

            const processedTasks = tasks.map((task) => {
                const { costs } = task;

                let totalCost = 0;
                for (const job of task.job) {
                    const { startTime, endTime } = job;

                    const jobInProgress = this._hoursBetween(startTime, endTime);
                    const totalRate = job.userId.reduce((total: number, user: any) => total + this._totalRateForUser(user.rate, jobInProgress), 0);
                    totalCost += totalRate;
                }

                return {
                    ...task,
                    costPercent: Number(((totalCost / costs) * 100).toFixed(1)),
                };
            });
            return percent ? processedTasks.filter((job) => job.costPercent > percent) : processedTasks;
        } catch (e) {
            throw new HttpException(
                {
                    status: e.status || HttpStatus.INTERNAL_SERVER_ERROR,
                    error: e.message,
                },
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    async createJob({ estimate, taskId, userIds }: ICreateJob) {
        try {
            const users = await this.usersRepository.findByIds(userIds);
            if (users.length === 0) {
                throw new BadRequestException('Users not found');
            }
            const task = await this.tasksRepository.findOneBy({ id: taskId });
            if (!task) {
                throw new BadRequestException('Task not found');
            }

            const jobStartTime = new Date();
            const jobEndTime = new Date(jobStartTime);
            jobEndTime.setTime(jobEndTime.getTime() + estimate * 60 * 60 * 1000);
            const timeForJobInHours = this._hoursBetween(jobStartTime, jobEndTime);

            const currentJobs = await this.jobsRepository
                .createQueryBuilder('job')
                .leftJoinAndSelect('job.taskId', 'task')
                .where('task.id = :id', { id: task.id })
                .leftJoinAndSelect('job.userId', 'user')
                .getMany();

            let totalCurrentCost = 0;
            let totalCurrentTimeInHours = 0;
            if (currentJobs.length > 0) {
                for (const currentJob of currentJobs) {
                    const { startTime, endTime } = currentJob;
                    const timeForCurrentJobInHours = this._hoursBetween(startTime, endTime);
                    totalCurrentTimeInHours += timeForCurrentJobInHours;

                    const costForCurrentJob = currentJob.userId.reduce((total: number, user: any) => total + this._totalRateForUser(user.rate, timeForCurrentJobInHours), 0);
                    totalCurrentCost += costForCurrentJob;
                }
            }

            if (totalCurrentCost > task.costs && totalCurrentTimeInHours > timeForJobInHours) {
                throw new BadRequestException('The sum of the task is exhaustive');
            }

            const newJobSchema = new Jobs();
            newJobSchema.userId = users;
            newJobSchema.taskId = task;
            newJobSchema.startTime = jobStartTime;
            newJobSchema.endTime = jobEndTime;

            const newJob = await this.jobsRepository.save(newJobSchema);

            const spentedFundsForNewJob = newJob.userId.reduce((total: number, user: any) => total + this._totalRateForUser(user.rate, timeForJobInHours), 0);

            return `${Number(((spentedFundsForNewJob / task.costs) * 100).toFixed(1))}%`;
        } catch (e) {
            throw new HttpException(
                {
                    status: e.status || HttpStatus.INTERNAL_SERVER_ERROR,
                    error: e.message,
                },
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }
}
