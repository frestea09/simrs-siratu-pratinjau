import { EventEmitter } from 'events'

export type SubmittedIndicatorEventPayload = {
  id: string
  name: string
  category: 'INM' | 'IMP-RS' | 'IMPU' | 'SPM'
  description: string
  unit: string
  frequency: 'Harian' | 'Mingguan' | 'Bulanan' | 'Triwulan' | 'Tahunan'
  status: 'Menunggu Persetujuan' | 'Diverifikasi' | 'Ditolak'
  submissionDate: string
  standard: number
  standardUnit: '%' | 'menit'
  rejectionReason?: string
  submittedById?: string
  profileId?: string
  locked?: boolean
  lockedReason?: string
}

export type IndicatorProfileEventPayload = {
  id: string
  title: string
  purpose: string
  definition: string
  implication: string
  calculationMethod: 'percentage' | 'average'
  numerator: string
  denominator: string
  target: number
  targetUnit: '%' | 'menit'
  inclusionCriteria: string
  exclusionCriteria: string
  dataRecording: string
  unitRecap: string
  analysisReporting: string
  area: string
  pic: string
  status: 'Draf' | 'Menunggu Persetujuan' | 'Disetujui' | 'Ditolak'
  rejectionReason?: string
  createdBy: string
  createdAt: string
  updatedAt: string
  unit: string
  locked?: boolean
  lockedReason?: string
}

export type NotificationEventPayload = {
  id: string
  timestamp: string
  title: string
  description: string
  isRead: boolean
  link?: string
  recipientRole?: string
  recipientUnit?: string
}

type AppEvents = {
  'profile:created': IndicatorProfileEventPayload
  'profile:updated': IndicatorProfileEventPayload
  'profile:deleted': { id: string }
  'submittedIndicator:created': SubmittedIndicatorEventPayload
  'submittedIndicator:updated': SubmittedIndicatorEventPayload
  'submittedIndicator:deleted': { id: string }
  'notification:new': NotificationEventPayload
}

class TypedEventBus {
  private emitter = new EventEmitter()

  on<Event extends keyof AppEvents>(event: Event, listener: (payload: AppEvents[Event]) => void) {
    this.emitter.on(event, listener)
  }

  off<Event extends keyof AppEvents>(event: Event, listener: (payload: AppEvents[Event]) => void) {
    this.emitter.off(event, listener)
  }

  emit<Event extends keyof AppEvents>(event: Event, payload: AppEvents[Event]) {
    this.emitter.emit(event, payload)
  }
}

export const eventBus = new TypedEventBus()
