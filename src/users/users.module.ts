// src/users/users.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from './entities/user.entity'; // ensure that user.entity.ts exports the User class

@Module({
  imports: [
    TypeOrmModule.forFeature([User]), // Makes repository available
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService], // Export if you need to use it elsewhere
})
export class UsersModule {}
