import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            signup: jest.fn(), // Mock the signup method
            login: jest.fn(), // Mock the login method
          },
        },
        {
          provide: UsersService,
          useValue: {
            findByEmail: jest.fn(), // Mock the findByEmail method
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(), // Mock the sign method
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});