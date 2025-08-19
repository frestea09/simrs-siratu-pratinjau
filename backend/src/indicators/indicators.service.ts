import { Injectable } from '@nestjs/common';
import { Indicator, CreateIndicatorDto, UpdateIndicatorDto } from './indicators.types';

@Injectable()
export class IndicatorsService {
  private indicators: Indicator[] = [];

  create(dto: CreateIndicatorDto): Indicator {
    const indicator: Indicator = { id: Date.now().toString(), ...dto };
    this.indicators.push(indicator);
    return indicator;
  }

  findAll(category?: string, start?: string, end?: string): Indicator[] {
    return this.indicators.filter((i) => {
      const withinCategory = category ? i.submissionId === category : true;
      const period = new Date(i.period).getTime();
      const afterStart = start ? period >= new Date(start).getTime() : true;
      const beforeEnd = end ? period <= new Date(end).getTime() : true;
      return withinCategory && afterStart && beforeEnd;
    });
  }

  update(id: string, dto: UpdateIndicatorDto): Indicator {
    const indicator = this.indicators.find((i) => i.id === id);
    if (!indicator) {
      throw new Error('Indicator not found');
    }
    Object.assign(indicator, dto);
    return indicator;
  }

  remove(id: string): void {
    this.indicators = this.indicators.filter((i) => i.id !== id);
  }
}
