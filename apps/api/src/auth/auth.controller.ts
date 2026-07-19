import {
  Controller, Post, Get, Body, Req, Res, HttpCode, HttpStatus,
  ConflictException, UnauthorizedException,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { SignUpDto } from '../common/dto/signup.dto';
import { SignInDto } from '../common/dto/signin.dto';
import { AUTH_CONFIG, getCookieOptions } from './auth.config';

function forwardSetCookies(res: Response, headers?: Headers) {
  if (!headers) return;
  const cookies = headers.getSetCookie();
  if (cookies.length) {
    res.setHeader('Set-Cookie', cookies);
  }
}

@Controller()
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('signup')
  @HttpCode(HttpStatus.OK)
  async signup(@Body() body: SignUpDto, @Res({ passthrough: true }) res: Response) {
    try {
      const { headers, response } = await this.auth.signUp(body);

      forwardSetCookies(res, headers);

      return { user: response.user, token: response.token };
    } catch (error: any) {
      if (error?.status === 422 || error?.message?.toLowerCase().includes('already')) {
        throw new ConflictException('An account with this email already exists');
      }
      throw error;
    }
  }

  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('signin')
  @HttpCode(HttpStatus.OK)
  async signin(@Body() body: SignInDto, @Res({ passthrough: true }) res: Response) {
    try {
      const { headers, response } = await this.auth.signIn(body);

      forwardSetCookies(res, headers);

      return { user: response.user, token: response.token };
    } catch {
      throw new UnauthorizedException('Invalid email or password');
    }
  }

  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('signout')
  @HttpCode(HttpStatus.OK)
  async signout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const token =
      req.cookies?.[AUTH_CONFIG.COOKIE_NAME] ??
      req.headers.authorization?.replace('Bearer ', '');

    if (token) {
      try {
        const { headers } = await this.auth.signOut(token);
        forwardSetCookies(res, headers);
        return { success: true };
      } catch {
        // Still clear the cookie even if server signOut fails
        res.cookie(AUTH_CONFIG.COOKIE_NAME, '', getCookieOptions(0));
        return { success: true };
      }
    }

    res.cookie(AUTH_CONFIG.COOKIE_NAME, '', getCookieOptions(0));
    return { success: true };
  }

  @Get('session')
  @HttpCode(HttpStatus.OK)
  async getSession(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    if (req.user && req.session && req.session.expiresAt > new Date()) {
      return {
        user: req.user,
        session: { id: req.session.id, expiresAt: req.session.expiresAt },
      };
    }

    res.cookie(AUTH_CONFIG.COOKIE_NAME, '', getCookieOptions(0));
    return { user: null, session: null };
  }
}
