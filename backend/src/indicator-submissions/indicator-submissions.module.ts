import { Module } from '@nestjs/common';
import { IndicatorSubmissionsService } from './indicator-submissions.service';
import { IndicatorSubmissionsController } from './indicator-submissions.controller';

@Module({
  controllers: [IndicatorSubmissionsController],
  providers: [IndicatorSubmissionsService],
})
export class IndicatorSubmissionsModule {}
