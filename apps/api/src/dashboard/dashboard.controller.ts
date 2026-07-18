import {
  Controller,
  Get,
  UseGuards,
} from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { AuthGuard } from '../common/guards/auth.guard';
import { AdminGuard } from '../common/guards/admin.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller()
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('dashboard/stats')
  @UseGuards(AuthGuard)
  getUserStats(@CurrentUser('id') userId: string) {
    return this.dashboardService.getUserStats(userId);
  }

  @Get('admin/stats')
  @UseGuards(AuthGuard, AdminGuard)
  getAdminStats() {
    return this.dashboardService.getAdminStats();
  }
}
