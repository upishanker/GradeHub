const toLetterGrade = (grade: number) => {
    if (!grade) return "N/A";
    if (grade >= 92) return "A";
    if (grade >= 90) return "A-";
    if (grade >= 87) return "B+";
    if (grade >= 82) return "B";
    if (grade >= 80) return "B-";
    if (grade >= 77) return "C+";
    if (grade >= 72) return "C";
    if (grade >= 70) return "C-";
    if (grade >= 67) return "D+";
    if (grade >= 62) return "D";
    if (grade >= 60) return "D-";
    return "F";
}
const gradeToGradePoints = (grade: number) => {
    if (!grade) return 0;
    if (grade >= 92) return 4.0;
    if (grade >= 90) return 3.75;
    if (grade >= 87) return 3.3;
    if (grade >= 82) return 3.0;
    if (grade >= 80) return 2.7;
    if (grade >= 77) return 2.3;
    if (grade >= 72) return 2.0;
    if (grade >= 70) return 1.7;
    if (grade >= 67) return 1.3;
    if (grade >= 62) return 1.0;
    if (grade >= 60) return 0.7;
    return 0;
}

export default toLetterGrade;
export { gradeToGradePoints };
