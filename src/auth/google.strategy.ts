import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { Strategy, Profile, VerifyCallback } from 'passport-google-oauth20';
import { AuthService } from './auth.service';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private userService: UsersService, private authService : AuthService) {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID!, // non-null assertion
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: 'http://localhost:3000/auth/google/callback',
      scope: ['email', 'profile'],
      // Removed passReqToCallback since we're not using req in validate()
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any, done: VerifyCallback): Promise<any> {
   
    ;
    let user = await this.userService.findOrCreate(profile,'google');
    done(null, user);
  }
}
