import { Module } from '@nestjs/common';
import { JobsController } from './jobs.controller';
import { JobsService } from './jobs.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Users } from 'src/entities/users.entity';
import { Tasks } from 'src/entities/tasks.entity';
import { Jobs } from 'src/entities/jobs.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Users, Tasks, Jobs])],
    controllers: [JobsController],
    providers: [JobsService],
})
export class JobsModule {}
