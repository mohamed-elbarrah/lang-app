import {
  Controller,
  Post,
  Get,
  Body,
  Req,
  Res,
  HttpCode,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { auth } from './better-auth';
import { PrismaService } from '../prisma/prisma.service';

@Controller()
export class AuthController {
  constructor(private prisma: PrismaService) {}

  @Post('signup')
  @HttpCode(200)
  async signup(
    @Body() body: { email: string; password: string; name?: string },
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
      res.setHeader(
        'Set-Cookie',
        `better-auth.session_token=${response.token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800`,
      );
    }

    return response.user;
  }

  @Post('signin')
  @HttpCode(200)
  async signin(
    @Body() body: { email: string; password: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    const response = await auth.api.signInEmail({
      body: {
        email: body.email,
        password: body.password,
      },
    });

    if (response.token) {
      res.setHeader(
        'Set-Cookie',
        `better-auth.session_token=${response.token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800`,
      );
    }

    return response.user;
  }

  @Post('signout')
  @HttpCode(200)
  async signout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const cookie = req.headers.cookie;
    const match = cookie?.match(/better-auth\.session_token=([^;]+)/);
    if (match) {
      await this.prisma.session.deleteMany({ where: { token: match[1] } });
    }

    res.setHeader(
      'Set-Cookie',
      'better-auth.session_token=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0',
    );

    return { success: true };
  }

  @Get('session')
  async getSession(@Req() req: Request) {
    const cookie = req.headers.cookie;
    const match = cookie?.match(/better-auth\.session_token=([^;]+)/);
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
