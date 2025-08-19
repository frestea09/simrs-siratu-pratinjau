import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { IndicatorSubmissionsModule } from './indicator-submissions/indicator-submissions.module';
import { IndicatorsModule } from './indicators/indicators.module';
import { IncidentsModule } from './incidents/incidents.module';
import { RisksModule } from './risks/risks.module';

@Module({
  imports: [
    UsersModule,
    IndicatorSubmissionsModule,
    IndicatorsModule,
    IncidentsModule,
    RisksModule,
  ],
})
export class AppModule {}
