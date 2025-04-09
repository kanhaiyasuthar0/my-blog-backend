// src/auth/auth.controller.ts
import { Body, Controller, Get, HttpCode, HttpStatus, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { CreateUserDto } from 'src/users/dto/user.dto';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  async signup(@Body() createUserDto: CreateUserDto) {
    // The authService.signup method should handle user creation, hashing the password, etc.
    const user = await this.authService.signup(createUserDto);
    // Return the created user details or a meaningful message
    return { message: 'User successfully registered', user };
  }

  // POST /auth/login
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    console.log('Login DTO:', loginDto);
    // The authService.login method should validate the credentials,
    // and generate & return tokens (e.g. JWT tokens) if successful.
    const token = await this.authService.login(loginDto);
    return { message: 'Login successful', token };
  }


 
  @Post('google')
  @HttpCode(HttpStatus.OK)
  async googleLoginWithToken(@Body('token') googleToken: string) {
    // Validate the Google token and process the user
    const user = await this.authService.verifyGoogleToken(googleToken);
    // Generate a JWT for the user
    const jwtToken = await this.authService.generateToken(user);
    return { message: 'Login successful', token: jwtToken };
  }

  @Post('facebook')
  @HttpCode(HttpStatus.OK)
  async facebookLoginWithToken(@Body('token') googleToken: string) {
    // Validate the Google token and process the user
    const user = await this.authService.verifyGoogleToken(googleToken);
    // Generate a JWT for the user
    const jwtToken = await this.authService.generateToken(user);
    return { message: 'Login successful', token: jwtToken };
  }
}
