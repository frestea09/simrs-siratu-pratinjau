
"use client"

import { createWithEqualityFn } from "zustand/traditional"
import { persist, createJSONStorage } from 'zustand/middleware'

// --- Tipe Data ---

// Struktur untuk skor per dimensi survei
export type DimensionScore = {
    score: number;
    positiveResponses: number;
    neutralResponses: number;
    negativeResponses: number;
};

// Struktur utama untuk satu entri hasil survei
export type SurveyResult = {
    id: string;
    submissionDate: string;
    unit: string;
    scores: Record<string, DimensionScore>; // Kunci adalah ID dimensi
    totalScore: number;
    positivePercentage: number;
    neutralPercentage: number;
    negativePercentage: number;
    answers: Record<string, string>;
};

// State untuk store Zustand
type SurveyState = {
    surveys: SurveyResult[];
    addSurvey: (survey: Omit<SurveyResult, 'id' | 'submissionDate'>) => void;
    removeSurvey: (id: string) => void;
    updateSurvey: (id: string, survey: Omit<SurveyResult, 'id' | 'submissionDate'>) => void;
};

// --- Store Zustand ---

export const useSurveyStore = createWithEqualityFn<SurveyState>()(
    persist(
        (set) => ({
            surveys: [], // Data awal kosong

            // Aksi untuk menambah hasil survei baru
            addSurvey: (surveyData) => {
                const newSurvey: SurveyResult = {
                    ...surveyData,
                    id: `SURVEY-${Date.now()}`, // ID unik berdasarkan waktu
                    submissionDate: new Date().toISOString(),
                };
                set((state) => ({
                    surveys: [newSurvey, ...state.surveys],
                }));
            },

            // Aksi untuk menghapus hasil survei
            removeSurvey: (id) => {
                set((state) => ({
                    surveys: state.surveys.filter((survey) => survey.id !== id),
                }));
            },

            // Aksi untuk memperbarui hasil survei
            updateSurvey: (id, surveyData) => {
                set((state) => ({
                    surveys: state.surveys.map((survey) =>
                        survey.id === id ? { ...survey, ...surveyData } : survey
                    ),
                }));
            },
        }),
        {
            name: 'survey-results-storage', // Nama untuk penyimpanan di localStorage
            storage: createJSONStorage(() => localStorage),
        }
    )
);
