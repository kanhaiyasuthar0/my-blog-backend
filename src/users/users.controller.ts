import { Controller, Post, Body,Get } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/user.dto';
import { of } from 'rxjs'; // ✅ Importing of from rxjs
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Controller('users')
export class UsersController {
  constructor(@InjectRepository(User)
  private readonly userRepository: Repository<User>,private readonly usersService: UsersService) {} // ✅ Injected here

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto); // ✅ Now it works
  }
  
}
