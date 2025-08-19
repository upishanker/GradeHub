import {useState} from "react";
import {Card, CardContent, CardHeader} from "@/components/ui/card";
import {Calculator, X} from "lucide-react";

const GradeCalculator = ({ assignments }: { assignments: any[] }) => {
    const [calculatorAssignments, setCalculatorAssignments] = useState<any[]>([]);
    const [draggedAssignment, setDraggedAssignment] = useState<any>(null);

    const handleDragStart = (assignment: any) => {
        setDraggedAssignment(assignment);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        if (draggedAssignment && !calculatorAssignments.find(a => a.id === draggedAssignment.id)) {
            setCalculatorAssignments([...calculatorAssignments, { ...draggedAssignment, calculatorGrade: draggedAssignment.grade ?? 0 }]);
        }
        setDraggedAssignment(null);
    };

    const removeFromCalculator = (assignmentId: string) => {
        setCalculatorAssignments(calculatorAssignments.filter(a => a.id !== assignmentId));
    };

    const updateCalculatorGrade = (assignmentId: string, grade: number) => {
        setCalculatorAssignments(calculatorAssignments.map(a =>
            a.id === assignmentId ? { ...a, calculatorGrade: grade } : a
        ));
    };

    const calculateWeightedGrade = () => {
        if (calculatorAssignments.length === 0) return 0;

        const totalWeightedPoints = calculatorAssignments.reduce((sum, assignment) => {
            return sum + (assignment.calculatorGrade * (assignment.weight ?? 0));
        }, 0);

        const totalWeight = calculatorAssignments.reduce((sum, assignment) => {
            return sum + (assignment.weight ?? 0);
        }, 0);

        return totalWeight > 0 ? totalWeightedPoints / totalWeight : 0;
    };

    return (
        <Card className="w-full mt-8">
            <CardHeader>
                <div className="flex items-center gap-2">
                    <Calculator className="w-6 h-6" />
                    <h3 className="text-2xl font-bold">Grade Calculator</h3>
                </div>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Available Assignments */}
                    <div>
                        <h4 className="text-lg font-semibold mb-3">Available Assignments</h4>
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                            {assignments.map((assignment) => (
                                <DraggableAssignment
                                    key={assignment.id}
                                    assignment={assignment}
                                    onDragStart={handleDragStart}
                                />
                            ))}
                        </div>
                        <div

                            className="bg-neutral-600 border-4 border-dashed rounded p-2 cursor-move hover:bg-neutral-300 hover:cursor-pointer transition-colors text-center mt-5"
                        >

                            Add Test Assignment
                        </div>
                    </div>

                    {/* Calculator Drop Zone */}
                    <div>
                        <h4 className="text-lg font-semibold mb-3">Calculator</h4>
                        <div
                            onDragOver={handleDragOver}
                            onDrop={handleDrop}
                            className="rounded-lg p-4 min-h-64 bg-neutral-400"
                        >
                            {calculatorAssignments.length === 0 ? (
                                <div className="text-center text-gray-500 py-8">
                                    Drag assignments here to calculate your grade
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {calculatorAssignments.map((assignment) => (
                                        <div key={assignment.id} className="bg-neutral-800 border rounded p-3">
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="font-medium">{assignment.name}</div>
                                                <button
                                                    onClick={() => removeFromCalculator(assignment.id)}
                                                    className="text-red-500 hover:text-red-700"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <label className="text-sm">Grade:</label>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    max="100"
                                                    value={assignment.calculatorGrade}
                                                    onChange={(e) => updateCalculatorGrade(assignment.id, parseFloat(e.target.value) || 0)}
                                                    className="border rounded px-2 py-1 w-20 text-sm"
                                                />
                                                <span className="text-sm text-neutral-400">
                                                    Weight: {assignment.weight ?? 0}%
                                                </span>
                                            </div>
                                        </div>
                                    ))}

                                    {/* Calculated Grade Display */}
                                    <div className="bg-green-50 border border-green-200 rounded p-3 mt-4">
                                        <div className="text-lg font-bold text-green-800">
                                            Calculated Grade: {calculateWeightedGrade().toFixed(2)}%
                                        </div>
                                        <div className="text-sm text-green-600">
                                            Based on {calculatorAssignments.length} assignment(s)
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

// Drag and Drop Assignment Component
const DraggableAssignment = ({ assignment, onDragStart }: { assignment: any, onDragStart: (assignment: any) => void }) => {
    return (
        <div
            draggable
            onDragStart={() => onDragStart(assignment)}
            className="bg-neutral-800 border  rounded p-2 cursor-move hover:bg-neutral-300 transition-colors"
        >
            <div className="text-sm font-medium">{assignment.name}</div>
            <div className="text-xs text-neutral-400">
                Grade: {assignment.grade ?? "N/A"}% | Weight: {assignment.weight ?? 0}%
            </div>
        </div>
    );
};

export default GradeCalculator;