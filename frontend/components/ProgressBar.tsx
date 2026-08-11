import React from "react";

interface ProgressBarProps {
    grade: number;
    goal: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ grade, goal }) => {
    // A goal of 0 (the fallback the course page passes when `goal` is null) or
    // any non-finite input would make `progress / goal` produce Infinity/NaN,
    // which renders as an invalid CSS width. Fall back to an empty bar.
    const hasValidGoal = Number.isFinite(goal) && goal > 0;
    const safeGrade = Number.isFinite(grade) ? grade : 0;

    const progress = hasValidGoal ? Math.min(safeGrade, goal) : 0;
    const percentage = hasValidGoal
        ? Math.max(0, Math.min(100, Math.round((progress / goal) * 100)))
        : 0;

    return (
        <div className="w-full max-w-xl mx-auto">
            <div className="flex justify-between mb-2 text-lg">
                <span>Grade: {grade}</span>
                <span>Goal: {goal}</span>
            </div>
            <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
                <div
                    className="h-full bg-green-500 transition-all duration-500 ease-in-out"
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
};

export default ProgressBar;
