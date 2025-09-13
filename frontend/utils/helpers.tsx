import {GradeScale} from "@/utils/types";

let gradeScale: GradeScale[] = [];

export const setGradeScale = (newScale: GradeScale[]) => {
    gradeScale = newScale;
};

export const toLetterGrade = (grade: number): string => {
    if (!grade) return "N/A";
    const match = gradeScale.find(s => grade >= s.minPercent);
    return match ? match.letter : "N/A";
};

export const toNumberGrade = (letter: string): number => {
    const match = gradeScale.find(s => s.letter === letter);
    return match ? match.minPercent : 0;
};

export const gradeToGradePoints = (grade: number): number => {
    if (!grade) return 0;
    const match = gradeScale.find(s => grade >= s.minPercent);
    return match ? match.gpaValue : 0;
};
