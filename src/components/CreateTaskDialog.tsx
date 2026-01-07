import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { getStudents } from '@/lib/store';
import { Student } from '@/types';
import { Search, User2, Calendar, ClipboardList, HelpCircle, Send, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface CreateTaskDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onTaskCreate: (task: any) => void;
}

export const CreateTaskDialog = ({ open, onOpenChange, onTaskCreate }: CreateTaskDialogProps) => {
    const [step, setStep] = useState(1);
    const [students, setStudents] = useState<Student[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

    const [taskData, setTaskData] = useState({
        title: '',
        isPracticeQuestion: false,
        questionContent: '',
        dueDate: '',
    });

    // Fetch students when dialog opens
    useEffect(() => {
        if (open) {
            getStudents().then(setStudents);
            setStep(1);
            setSelectedStudent(null);
            setTaskData({ title: '', isPracticeQuestion: false, questionContent: '', dueDate: '' });
        }
    }, [open]);

    const filteredStudents = students.filter(s =>
        !s.isAlumni && (
            s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.roomNo.toString().toLowerCase().includes(searchQuery.toLowerCase()) ||
            (s.mobile && s.mobile.toString().includes(searchQuery))
        )
    );

    const handleSubmit = () => {
        if (!taskData.title || !taskData.dueDate) {
            toast.error("Please fill in all required fields");
            return;
        }

        const newTask = {
            id: Date.now().toString(),
            title: taskData.title,
            dueDate: taskData.dueDate,
            status: 'pending',
            category: 'General',
            assignedTo: selectedStudent?.id,
            assignedToName: selectedStudent?.name, // Helper for UI
            isPracticeQuestion: taskData.isPracticeQuestion,
            questionContent: taskData.questionContent
        };

        // "Send to WhatsApp" Logic
        if (selectedStudent?.mobile && taskData.isPracticeQuestion) {
            const cleanNumber = selectedStudent.mobile.replace(/[^0-9]/g, '');
            const message = `*New Task Assigned: ${taskData.title}*\n\n${taskData.questionContent}\n\n📅 Due Date: ${taskData.dueDate}\n\nPlease submit by the deadline.`;
            const url = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
            window.open(url, '_blank');
            toast.success("WhatsApp link opened!");
        }

        onTaskCreate(newTask);
        onOpenChange(false);
        toast.success("Task created successfully");
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Create New Task</DialogTitle>
                </DialogHeader>

                {step === 1 && (
                    <div className="space-y-4 animate-fade-in">
                        <div className="space-y-1">
                            <h3 className="font-bold text-lg">Select Student</h3>
                            <p className="text-sm text-muted-foreground">Who is this task for?</p>
                        </div>

                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Search name, room..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9 bg-background/50"
                            />
                        </div>

                        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                            {filteredStudents.map(student => (
                                <div
                                    key={student.id}
                                    onClick={() => setSelectedStudent(student)}
                                    className={cn(
                                        "p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between",
                                        selectedStudent?.id === student.id
                                            ? "border-primary bg-primary/5 ring-1 ring-primary"
                                            : "border-border/40 hover:border-border hover:bg-muted/50"
                                    )}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                                            {student.roomNo}
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm">{student.name}</p>
                                            <p className="text-xs text-muted-foreground">{student.mobile || 'No Mobile'}</p>
                                        </div>
                                    </div>
                                    {selectedStudent?.id === student.id && <CheckCircle2 className="w-5 h-5 text-primary" />}
                                </div>
                            ))}
                        </div>

                        <Button
                            className="w-full"
                            disabled={!selectedStudent}
                            onClick={() => setStep(2)}
                        >
                            Next Step
                        </Button>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-6 animate-fade-in">
                        <div className="space-y-1">
                            <h3 className="font-bold text-lg">Task Details</h3>
                            <p className="text-sm text-muted-foreground">Assigning to <span className="text-primary font-bold">{selectedStudent?.name}</span></p>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>Task Topic</Label>
                                <Input
                                    placeholder="e.g. Complete Assignment 1"
                                    value={taskData.title}
                                    onChange={(e) => setTaskData({ ...taskData, title: e.target.value })}
                                />
                            </div>

                            <div className="flex items-center space-x-2 border p-4 rounded-xl">
                                <Checkbox
                                    id="practice"
                                    checked={taskData.isPracticeQuestion}
                                    onCheckedChange={(c) => setTaskData({ ...taskData, isPracticeQuestion: !!c })}
                                />
                                <Label htmlFor="practice" className="cursor-pointer flex-1">
                                    Is this a Practice Question?
                                    <span className="block text-xs text-muted-foreground font-normal">If checked, we'll draft a WhatsApp message.</span>
                                </Label>
                            </div>

                            {taskData.isPracticeQuestion && (
                                <div className="space-y-2 animate-slide-in">
                                    <Label>Question Content</Label>
                                    <Textarea
                                        placeholder="Enter the practice question here..."
                                        value={taskData.questionContent}
                                        onChange={(e) => setTaskData({ ...taskData, questionContent: e.target.value })}
                                        className="min-h-[100px]"
                                    />
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label>Deadline Date</Label>
                                <Input
                                    type="date"
                                    value={taskData.dueDate}
                                    onChange={(e) => setTaskData({ ...taskData, dueDate: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <Button variant="outline" className="flex-1" onClick={() => setStep(1)}>Back</Button>
                            <Button className="flex-1" onClick={handleSubmit}>
                                {taskData.isPracticeQuestion ? (
                                    <>
                                        <Send className="w-4 h-4 mr-2" />
                                        Assign & Send
                                    </>
                                ) : 'Assign Task'}
                            </Button>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
};

