// src/users/users.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) // Injects the repository provided by TypeOrmModule.forFeature
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const newUser = this.userRepository.create(createUserDto);
    return await this.userRepository.save(newUser);
  }

  async findOrCreate(profile: any,provider: string): Promise<User> {
    // For example purposes, find a user by provider-specific ID
    let user = await this.userRepository.findOne({ where: { email: profile.emails?.[0]?.value } });
    if (!user) {
        const { id, emails, displayName } = profile;
        user = this.userRepository.create({
            provider_id: id,
            email: emails[0].value,
            name: displayName,
            provider: provider
        });
      await this.userRepository.save(user);
    }
    return user;
  }
  async findByEmail(email: string): Promise<User | undefined> {
    const user = await this.userRepository.findOne({ where: { email } });
    return user ?? undefined;
  }
}
