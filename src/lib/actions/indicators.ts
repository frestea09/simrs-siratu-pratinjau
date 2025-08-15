
"use server"

import prisma from "@/lib/prisma"
import { Indicator, IndicatorCategory } from "@prisma/client"

export async function getIndicators(category: IndicatorCategory) {
  try {
    const indicators = await prisma.indicator.findMany({
      where: { category: category },
      orderBy: {
        period: 'desc'
      }
    });
    return indicators;
  } catch (error) {
    console.error("Failed to fetch indicators:", error);
    return [];
  }
}

export async function addIndicator(data: Omit<Indicator, 'id' | 'ratio' | 'status' | 'createdAt' | 'updatedAt'>) {
    // Calculation logic should be here before saving
    // This is simplified
    const ratio = "0"; // Replace with actual calculation
    const status = "N/A"; // Replace with actual calculation

    try {
        const newIndicator = await prisma.indicator.create({
            data: {
                ...data,
                ratio,
                status
            }
        });
        return newIndicator;
    } catch (error) {
        console.error("Failed to add indicator:", error);
        return null;
    }
}
