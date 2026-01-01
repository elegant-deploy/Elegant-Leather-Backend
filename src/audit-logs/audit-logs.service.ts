import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AuditLog, AuditLogDocument } from './schemas/audit-log.schema';

@Injectable()
export class AuditLogsService {
  constructor(
    @InjectModel(AuditLog.name) private auditLogModel: Model<AuditLogDocument>,
  ) {}

  async logAction(logData: {
    userId: string;
    action: string;
    resource: string;
    oldValue?: any;
    newValue?: any;
    details?: string;
    ipAddress?: string;
  }): Promise<AuditLog> {
    const log = new this.auditLogModel(logData);
    return log.save();
  }

  async findAll(): Promise<AuditLog[]> {
    return this.auditLogModel.find().populate('userId').sort({ createdAt: -1 }).exec();
  }

  async findByUser(userId: string): Promise<AuditLog[]> {
    return this.auditLogModel.find({ userId }).sort({ createdAt: -1 }).exec();
  }

  async findByEntity(entity: string, entityId: string): Promise<AuditLog[]> {
    return this.auditLogModel.find({ entity, entityId }).sort({ createdAt: -1 }).exec();
  }
}