import {
  Controller, Post, Get, Body, Req, Res, HttpCode, HttpStatus,
  ConflictException, UnauthorizedException, BadRequestException, UseGuards,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { AuthGuard } from '../common/guards/auth.guard';
import { SignUpDto } from '../common/dto/signup.dto';
import { SignInDto } from '../common/dto/signin.dto';
import { ChangePasswordDto } from '../common/dto/change-password.dto';
import { ForgotPasswordDto } from '../common/dto/forgot-password.dto';
import { ResetPasswordDto } from '../common/dto/reset-password.dto';
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

  @UseGuards(AuthGuard)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  async changePassword(
    @Req() req: Request,
    @Body() body: ChangePasswordDto,
  ) {
    const token = req.cookies?.[AUTH_CONFIG.COOKIE_NAME] ??
      req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      throw new UnauthorizedException('Not authenticated');
    }

    try {
      await this.auth.changePassword(token, body.currentPassword, body.newPassword);
      return { success: true, message: 'Password changed successfully' };
    } catch (error: any) {
      if (error?.status === 400 || error?.message?.toLowerCase().includes('password')) {
        throw new BadRequestException('Current password is incorrect');
      }
      throw new BadRequestException('Failed to change password');
    }
  }

  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() body: ForgotPasswordDto) {
    try {
      await this.auth.requestPasswordReset(body.email);
    } catch {
      // Always return success to prevent email enumeration
    }
    return { success: true, message: 'If an account exists, a reset link has been sent' };
  }

  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() body: ResetPasswordDto) {
    try {
      await this.auth.resetPassword(body.token, body.newPassword);
      return { success: true, message: 'Password reset successfully' };
    } catch {
      throw new BadRequestException('Invalid or expired reset token');
    }
  }

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
