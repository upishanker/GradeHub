import React from "react";

interface ProgressBarProps {
    grade: number;
    goal: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ grade, goal }) => {
    const progress = Math.min(grade, goal);
    const percentage = Math.round((progress / goal) * 100);

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
