import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import configImport from './config/config.module';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';
import { JobsModule } from './job/jobs.module';

@Module({
    imports: [
        configImport,
        JobsModule,
        TypeOrmModule.forRootAsync({
            imports: [configImport],
            inject: [ConfigService],
            useFactory: (sonfigService: ConfigService) => ({
                type: 'postgres',
                host: sonfigService.get('POSTGRES_HOST'),
                port: sonfigService.get('POSTGRESS_PORT'),
                username: sonfigService.get('POSTGRES_USER'),
                password: sonfigService.get('POSTGRESS_PASSWORD'),
                database: sonfigService.get('POSTGRES_DB'),
                entities: [join(__dirname, '**', '*.entity.{ts,js}')],
                synchronize: true,
            }),
        }),
    ],
    controllers: [],
})
export class AppModule {}
