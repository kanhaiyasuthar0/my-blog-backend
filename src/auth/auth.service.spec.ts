import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { OAuth2Client } from 'google-auth-library';
import axios from 'axios';

jest.mock('bcryptjs');
jest.mock('google-auth-library');
jest.mock('axios');

describe('AuthService', () => {
  let service: AuthService;
  let usersService: Partial<UsersService>;
  let jwtService: Partial<JwtService>;
  let googleClientMock: jest.Mocked<OAuth2Client>;

  beforeEach(async () => {
    googleClientMock = new OAuth2Client() as jest.Mocked<OAuth2Client>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            create: jest.fn(),
            findByEmail: jest.fn(),
            findOrCreate: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
    service['googleClient'] = googleClientMock;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('signup', () => {
    it('should hash the password and create a new user', async () => {
      const createUserDto = { name: 'Test User', email: 'test@example.com', password: 'password' };
      const hashedPassword = 'hashedPassword';
      const createdUser = { id: 1, email: 'test@example.com', password: hashedPassword };

      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
      (usersService.create as jest.Mock).mockResolvedValue(createdUser);

      const result = await service.signup(createUserDto);

      expect(bcrypt.hash).toHaveBeenCalledWith(createUserDto.password, 10);
      expect(usersService.create).toHaveBeenCalledWith({
        ...createUserDto,
        password: hashedPassword,
      });
      expect(result).toEqual({ id: 1, email: 'test@example.com' });
    });
  });

  describe('login', () => {
    it('should validate a user and return a JWT token', async () => {
      const loginDto = { email: 'test@example.com', password: 'password' };
      const user = { id: 1, email: 'test@example.com', password: 'hashedPassword' };

      (usersService.findByEmail as jest.Mock).mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwtService.sign as jest.Mock).mockReturnValue('jwtToken');

      const result = await service.login(loginDto);

      expect(usersService.findByEmail).toHaveBeenCalledWith(loginDto.email);
      expect(bcrypt.compare).toHaveBeenCalledWith(loginDto.password, user.password);
      expect(jwtService.sign).toHaveBeenCalledWith({ id: user.id, email: user.email });
      expect(result).toEqual({ token: 'jwtToken' });
    });

    it('should throw UnauthorizedException for invalid credentials', async () => {
      const loginDto = { email: 'test@example.com', password: 'wrongPassword' };
      const user = { id: 1, email: 'test@example.com', password: 'hashedPassword' };

      (usersService.findByEmail as jest.Mock).mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if user is not found', async () => {
      const loginDto = { email: 'test@example.com', password: 'password' };

      (usersService.findByEmail as jest.Mock).mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('verifyGoogleToken', () => {
    it('should verify a valid Google token and return the user', async () => {
      const googleToken = 'validGoogleToken';
      const payload = { email: 'test@example.com', name: 'Test User' };
      const user = { id: 1, email: 'test@example.com', name: 'Test User' };

      googleClientMock.verifyIdToken = jest.fn().mockResolvedValue({
        getPayload: jest.fn().mockReturnValue(payload),
      });
      (usersService.findOrCreate as jest.Mock).mockResolvedValue(user);

      const result = await service.verifyGoogleToken(googleToken);

      expect(googleClientMock.verifyIdToken).toHaveBeenCalledWith({
        idToken: googleToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      expect(usersService.findOrCreate).toHaveBeenCalledWith(payload, 'google');
      expect(result).toEqual(user);
    });

    it('should throw UnauthorizedException for an invalid Google token', async () => {
      const googleToken = 'invalidGoogleToken';

      googleClientMock.verifyIdToken = jest.fn().mockRejectedValue(new Error('Invalid token'));

      await expect(service.verifyGoogleToken(googleToken)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('verifyFacebookToken', () => {
    it('should verify a valid Facebook token and return the user', async () => {
      const facebookToken = 'validFacebookToken';
      const payload = { id: '123', email: 'test@example.com', name: 'Test User' };
      const user = { id: 1, email: 'test@example.com', name: 'Test User' };

      (axios.get as jest.Mock).mockResolvedValue({ data: payload });
      (usersService.findOrCreate as jest.Mock).mockResolvedValue(user);

      const result = await service.verifyFacebookToken(facebookToken);

      expect(axios.get).toHaveBeenCalledWith(
        `https://graph.facebook.com/me?fields=id,name,email&access_token=${facebookToken}`,
      );
      expect(usersService.findOrCreate).toHaveBeenCalledWith(payload, 'facebook');
      expect(result).toEqual(user);
    });

    it('should throw UnauthorizedException for an invalid Facebook token', async () => {
      const facebookToken = 'invalidFacebookToken';

      (axios.get as jest.Mock).mockRejectedValue(new Error('Invalid token'));

      await expect(service.verifyFacebookToken(facebookToken)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('generateToken', () => {
    it('should generate a JWT token', () => {
      const payload = { id: 1, email: 'test@example.com' };

      (jwtService.sign as jest.Mock).mockReturnValue('jwtToken');

      const token = service.generateToken(payload);

      expect(jwtService.sign).toHaveBeenCalledWith(payload);
      expect(token).toBe('jwtToken');
    });
  });
});