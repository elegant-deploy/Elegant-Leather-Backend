import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { CategoriesModule } from './categories/categories.module';
import { ProductsModule } from './product/products.module';
import { LeathersModule } from './leathers/leathers.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { MediaModule } from './media/media.module';
import { ContactUsModule } from './contact-us/contact-us.module';
import { databaseConfig } from './config/database.config';
import * as mongoose from 'mongoose';

mongoose.connection.on('connected', () => {
  console.log('MongoDB connected successfully');
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(databaseConfig.uri),
    UsersModule,
    AuthModule,
    CategoriesModule,
    ProductsModule,
    LeathersModule,
    CloudinaryModule,
    MediaModule,
    ContactUsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }