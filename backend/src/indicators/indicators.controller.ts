import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { IndicatorsService } from './indicators.service';
import { CreateIndicatorDto, UpdateIndicatorDto } from './indicators.types';

@Controller('indicators')
export class IndicatorsController {
  constructor(private readonly service: IndicatorsService) {}

  @Get()
  findAll(
    @Query('category') category?: string,
    @Query('start') start?: string,
    @Query('end') end?: string,
  ) {
    return this.service.findAll(category, start, end);
  }

  @Post()
  create(@Body() dto: CreateIndicatorDto) {
    return this.service.create(dto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateIndicatorDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
