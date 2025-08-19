import { Injectable } from '@nestjs/common';
import {
  IndicatorSubmission,
  CreateIndicatorSubmissionDto,
  UpdateIndicatorSubmissionDto,
  UpdateSubmissionStatusDto,
} from './indicator-submissions.types';

@Injectable()
export class IndicatorSubmissionsService {
  private submissions: IndicatorSubmission[] = [];

  create(dto: CreateIndicatorSubmissionDto): IndicatorSubmission {
    const submission: IndicatorSubmission = {
      id: Date.now().toString(),
      status: 'Pending',
      submissionDate: new Date().toISOString(),
      ...dto,
    };
    this.submissions.push(submission);
    return submission;
  }

  findAll(unit?: string): IndicatorSubmission[] {
    if (unit) {
      return this.submissions.filter((s) => s.unit === unit);
    }
    return this.submissions;
  }

  update(id: string, dto: UpdateIndicatorSubmissionDto): IndicatorSubmission {
    const submission = this.submissions.find((s) => s.id === id);
    if (!submission) {
      throw new Error('Submission not found');
    }
    Object.assign(submission, dto);
    return submission;
  }

  updateStatus(
    id: string,
    dto: UpdateSubmissionStatusDto,
  ): IndicatorSubmission {
    const submission = this.submissions.find((s) => s.id === id);
    if (!submission) {
      throw new Error('Submission not found');
    }
    submission.status = dto.status;
    submission.rejectionReason = dto.rejectionReason;
    return submission;
  }
}
