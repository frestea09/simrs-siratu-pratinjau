
import { subDays, startOfMonth, startOfYear } from 'date-fns';
import type { Indicator } from '@/store/indicator-store';

export type TimeRange = '7d' | '30d' | '6m' | '1y';

export const calculateRatio = (indicator: Omit<Indicator, 'id' | 'ratio' | 'status'>): string => {
    if (indicator.standardUnit === "menit") {
        if (indicator.denominator === 0) return "0";
        const average = indicator.numerator / indicator.denominator;
        return `${average.toFixed(1)}`
    }
    if (indicator.denominator === 0) return "0.0"
    const ratio = (indicator.numerator / indicator.denominator) * 100;
    return `${ratio.toFixed(1)}`
}

export const calculateStatus = (indicator: Omit<Indicator, 'id' |'ratio' | 'status'>): Indicator['status'] => {
    let achievementValue: number;
    
    if (indicator.standardUnit === 'menit') {
        if (indicator.denominator === 0) return 'N/A';
        achievementValue = indicator.numerator / indicator.denominator;
        // Lower is better for wait times
        return achievementValue <= indicator.standard ? 'Memenuhi Standar' : 'Tidak Memenuhi Standar';
    } else {
        if (indicator.denominator === 0) return 'N/A';
        achievementValue = (indicator.numerator / indicator.denominator) * 100;
        // Higher is better for percentages
        return achievementValue >= indicator.standard ? 'Memenuhi Standar' : 'Tidak Memenuhi Standar';
    }
}

export const getStartDate = (range: TimeRange) => {
    const now = new Date();
    switch (range) {
        case '7d': return subDays(now, 6);
        case '30d': return subDays(now, 29);
        case '6m': return startOfMonth(subDays(now, 30 * 5)); // 5 months ago to include current month
        case '1y': return startOfYear(now);
        default: return startOfMonth(subDays(now, 30 * 5));
    }
}
