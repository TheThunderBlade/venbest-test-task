import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { IResponceHelper } from 'src/globalInterfaces/IResponceHelper';
import { ICreateJob } from './interfaces/ICreateJob.interface';

@Controller('jobs')
export class JobsController {
    constructor(private jobsService: JobsService) {}

    @Get('/getTaskList')
    async getList(@Query('percent') percent?: number): Promise<IResponceHelper> {
        const tasks = await this.jobsService.getList(percent);
        return { status: 200, data: tasks };
    }

    @Post('/createJob')
    async createJob(@Body() createJobDto: ICreateJob): Promise<IResponceHelper> {
        const percent = await this.jobsService.createJob(createJobDto);
        return { status: 200, data: { percent } };
    }
}
