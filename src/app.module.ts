import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { ConfigModule } from '@nestjs/config';
import { User } from './users/entities/user.entity';
import { Post } from './posts/entities/post.entity';
import { AuthModule } from './auth/auth.module';
import * as dotenv from 'dotenv';
import { PostsModule } from './posts/posts.module';

dotenv.config();
console.log('Loaded JWT_SECRET from .env:', process.env.JWT_SECRET);

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), // if you're using environment variables
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'database-1.cvg2yoqkkejc.eu-north-1.rds.amazonaws.com',
      port: 5432,
      username: 'postgres',
      password: 'sbvU9v]VUZkbfz3bKsyh8p?qV_Hk',
      database: 'postgres',
      synchronize: true, 
      ssl: {
        rejectUnauthorized: false, // Disable strict SSL validation (use only for testing)
      },
       entities: [User, Post]
      // Set to false in production
    }),
    UsersModule,
    AuthModule,
    PostsModule
  ],
})
export class AppModule {}