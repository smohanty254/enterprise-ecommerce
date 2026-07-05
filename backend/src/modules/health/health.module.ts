import { Controller, Get, Module } from '@nestjs/common';
@Controller('health')
class HealthController {
  @Get() health() {
    return { status: 'ok', time: new Date().toISOString() };
  }
}
@Module({ controllers: [HealthController] })
export class HealthModule {}
