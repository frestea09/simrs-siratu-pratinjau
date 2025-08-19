import { Injectable } from '@nestjs/common';
import { Incident, CreateIncidentDto, UpdateIncidentDto } from './incidents.types';

@Injectable()
export class IncidentsService {
  private incidents: Incident[] = [];

  create(dto: CreateIncidentDto): Incident {
    const incident: Incident = { id: Date.now().toString(), ...dto };
    this.incidents.push(incident);
    return incident;
  }

  findAll(): Incident[] {
    return this.incidents;
  }

  update(id: string, dto: UpdateIncidentDto): Incident {
    const incident = this.incidents.find((i) => i.id === id);
    if (!incident) {
      throw new Error('Incident not found');
    }
    Object.assign(incident, dto);
    return incident;
  }

  remove(id: string): void {
    this.incidents = this.incidents.filter((i) => i.id !== id);
  }
}
