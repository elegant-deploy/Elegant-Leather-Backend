import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LeathersService } from './leathers.service';
import { LeathersController } from './leathers.controller';
import { Leather, LeatherSchema } from './schemas/leather.schema';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Leather.name, schema: LeatherSchema }]),
        CloudinaryModule,
        AuditLogsModule,
    ],
    controllers: [LeathersController],
    providers: [LeathersService],
    exports: [LeathersService],
})
export class LeathersModule { }