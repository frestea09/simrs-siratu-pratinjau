
import { subDays, startOfMonth, startOfYear, subMonths } from 'date-fns';
import type { Indicator } from '@/store/indicator-store';

export type TimeRange = '7d' | '30d' | '3m' | '6m' | '1y';

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
        case '3m': return subMonths(now, 2);
        case '6m': return subMonths(now, 5);
        case '1y': return startOfYear(now);
        default: return subMonths(now, 5);
    }
}

export const timeRangeToLabel = (range: TimeRange): string => {
    switch (range) {
        case '7d': return '7 Hari Terakhir';
        case '30d': return '30 Hari Terakhir';
        case '3m': return '3 Bulan Terakhir';
        case '6m': return '6 Bulan Terakhir';
        case '1y': return '1 Tahun Ini';
        default: return 'Data';
    }
}
