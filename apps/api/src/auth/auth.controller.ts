import {
  Controller,
  Post,
  Get,
  Body,
  Req,
  Res,
  HttpCode,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { auth } from './better-auth';
import { PrismaService } from '../prisma/prisma.service';
import { Throttle } from '@nestjs/throttler';
import { SignUpDto } from '../common/dto/signup.dto';
import { SignInDto } from '../common/dto/signin.dto';

const COOKIE_NAME = 'better-auth.session_token';

function getCookieOptions() {
  const isProduction = process.env.NODE_ENV === 'production';
  return {
    path: '/',
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: isProduction,
    maxAge: 604800,
  };
}

@Controller()
export class AuthController {
  constructor(private prisma: PrismaService) {}

  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('signup')
  @HttpCode(200)
  async signup(
    @Body() body: SignUpDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const response = await auth.api.signUpEmail({
      body: {
        email: body.email,
        password: body.password,
        name: body.name || body.email.split('@')[0],
      },
    });

    if (response.token) {
      res.cookie(COOKIE_NAME, response.token, getCookieOptions());
    }

    const fullUser = await this.prisma.user.findUnique({
      where: { id: response.user.id },
    });

    return fullUser;
  }

  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('signin')
  @HttpCode(200)
  async signin(
    @Body() body: SignInDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const response = await auth.api.signInEmail({
      body: {
        email: body.email,
        password: body.password,
      },
    });

    if (response.token) {
      res.cookie(COOKIE_NAME, response.token, getCookieOptions());
    }

    const fullUser = await this.prisma.user.findUnique({
      where: { id: response.user.id },
    });

    return fullUser;
  }

  @Post('signout')
  @HttpCode(200)
  async signout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const cookie = req.headers.cookie;
    const match = cookie?.match(new RegExp(`${COOKIE_NAME}=([^;]+)`));
    if (match) {
      await this.prisma.session.deleteMany({ where: { token: match[1] } });
    }

    res.cookie(COOKIE_NAME, '', { ...getCookieOptions(), maxAge: 0 });

    return { success: true };
  }

  @Get('session')
  async getSession(@Req() req: Request) {
    const cookie = req.headers.cookie;
    const match = cookie?.match(new RegExp(`${COOKIE_NAME}=([^;]+)`));
    if (!match) {
      return { user: null, session: null };
    }

    const session = await this.prisma.session.findUnique({
      where: { token: match[1] },
      include: { user: true },
    });

    if (!session || session.expiresAt <= new Date()) {
      return { user: null, session: null };
    }

    return {
      user: session.user,
      session: { id: session.id, expiresAt: session.expiresAt },
    };
  }
}
