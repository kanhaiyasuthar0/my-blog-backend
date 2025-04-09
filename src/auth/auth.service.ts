import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { CreateUserDto } from '../users/dto/user.dto';
import * as bcrypt  from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { OAuth2Client } from 'google-auth-library';
import axios from 'axios';

@Injectable()
export class AuthService {
    private googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async signup(createUserDto: CreateUserDto) {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const user = await this.usersService.create({
      ...createUserDto,
      password: hashedPassword,
    });
    // Remove sensitive information
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findByEmail(loginDto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    
    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Use the new generateToken method.
    return { token: this.generateToken({ id: user.id, email: user.email }) };
  }
  async verifyGoogleToken(googleToken: string) {
    try {
      // Verify the Google token
      const ticket = await this.googleClient.verifyIdToken({
        idToken: googleToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();

      if (!payload) {
        throw new UnauthorizedException('Invalid Google token');
      }
      console.log('Payload:', payload);

      // Check if the user already exists in the database
      let user = await this.usersService.findOrCreate(payload,'google');

      return user;
    } catch (error) {
      throw new UnauthorizedException('Invalid Google token');
    }
  }
  async verifyFacebookToken(facebookToken: string) {
    try {
      // Verify the Facebook token by calling the Facebook Graph API
      const response = await axios.get(
        `https://graph.facebook.com/me?fields=id,name,email&access_token=${facebookToken}`
      );
  
      const payload = response.data;
  
      if (!payload || !payload.id) {
        throw new UnauthorizedException('Invalid Facebook token');
      }
      console.log('Facebook Payload:', payload);
  
      // Check if the user already exists in the database
      let user = await this.usersService.findOrCreate(payload, 'facebook');
  
      return user;
    } catch (error) {
      throw new UnauthorizedException('Invalid Facebook token');
    }
  }
  // Define generateToken to create a JWT
  generateToken(payload: any): string {
    return this.jwtService.sign(payload);
  }
}
