import { Controller, Get, Post, Put, Body, Param, Query } from '@nestjs/common';
import { IndicatorSubmissionsService } from './indicator-submissions.service';
import {
  CreateIndicatorSubmissionDto,
  UpdateIndicatorSubmissionDto,
  UpdateSubmissionStatusDto,
} from './indicator-submissions.types';

@Controller('indicatorSubmissions')
export class IndicatorSubmissionsController {
  constructor(private readonly service: IndicatorSubmissionsService) {}

  @Get()
  findAll(@Query('unit') unit?: string) {
    return this.service.findAll(unit);
  }

  @Post()
  create(@Body() dto: CreateIndicatorSubmissionDto) {
    return this.service.create(dto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateIndicatorSubmissionDto) {
    return this.service.update(id, dto);
  }

  @Put(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateSubmissionStatusDto,
  ) {
    return this.service.updateStatus(id, dto);
  }
}
