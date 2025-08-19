import { Injectable } from '@nestjs/common';
import { Risk, CreateRiskDto, UpdateRiskDto } from './risks.types';

@Injectable()
export class RisksService {
  private risks: Risk[] = [];

  create(dto: CreateRiskDto): Risk {
    const risk: Risk = { id: Date.now().toString(), ...dto };
    this.risks.push(risk);
    return risk;
  }

  findAll(): Risk[] {
    return this.risks;
  }

  update(id: string, dto: UpdateRiskDto): Risk {
    const risk = this.risks.find((r) => r.id === id);
    if (!risk) {
      throw new Error('Risk not found');
    }
    Object.assign(risk, dto);
    return risk;
  }

  remove(id: string): void {
    this.risks = this.risks.filter((r) => r.id !== id);
  }
}
