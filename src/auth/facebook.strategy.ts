// src/auth/facebook.strategy.ts
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { Strategy, Profile, StrategyOptions } from 'passport-facebook';
import { UsersService } from '../users/users.service';
import { VerifyCallback } from 'passport-google-oauth20';

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
  constructor(private readonly userService: UsersService) {
    // Using non-null assertion operator (!) to assure TypeScript the values exist.
    super({
      clientID: process.env.FACEBOOK_APP_ID!, // Assert string
      clientSecret: process.env.FACEBOOK_APP_SECRET!,
      callbackURL: 'http://localhost:3000/auth/facebook/callback',
      profileFields: ['id', 'emails', 'name', 'displayName'],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any, done: VerifyCallback): Promise<any> {
      let user = await this.userService.findOrCreate(profile,'facebook');
      done(null, user);
    }
}
