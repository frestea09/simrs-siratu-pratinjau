import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { RisksService } from './risks.service';
import { CreateRiskDto, UpdateRiskDto } from './risks.types';

@Controller('risks')
export class RisksController {
  constructor(private readonly service: RisksService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Post()
  create(@Body() dto: CreateRiskDto) {
    return this.service.create(dto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateRiskDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
