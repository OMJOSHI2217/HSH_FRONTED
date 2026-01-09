import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Cake, Sparkles, Send } from 'lucide-react';
import { AppHeader } from '@/components/AppHeader';
import { Button } from '@/components/ui/button';
import { getStudents } from '@/lib/store';
import { Student } from '@/types';
import api from '@/lib/api';
import { toast } from 'sonner';

const Birthdays = () => {
    const navigate = useNavigate();
    const [students, setStudents] = useState<Student[]>([]);

    useEffect(() => {
        const fetchStudents = async () => {
            const data = await getStudents();
            setStudents(data);
        };
        fetchStudents();
    }, []);

    // Filter students whose birthday is TODAY
    const birthdayStudents = students.filter(student => {
        if (!student.dob) return false;

        const today = new Date();
        const currentMonth = today.getMonth() + 1; // 0-indexed
        const currentDay = today.getDate();

        const [year, month, day] = student.dob.split('-').map(Number);

        return month === currentMonth && day === currentDay;
    });

    return (
        <div className="min-h-screen pb-20 relative animate-fade-in">
            <AppHeader title="Hostel Hub" />

            <main className="p-4 md:p-6 space-y-8 max-w-5xl mx-auto">
                {/* Header Section */}
                <div className="relative overflow-hidden rounded-3xl p-8 glass-card animate-slide-in">
                    <div className="absolute inset-0 gradient-primary opacity-5"></div>
                    <div className="relative z-10 space-y-2">
                        <h2 className="text-4xl font-extrabold tracking-tight text-foreground flex items-center gap-3">
                            <Cake className="w-8 h-8 text-primary" />
                            Birthdays
                        </h2>
                        <p className="text-muted-foreground font-medium uppercase tracking-widest text-xs">Celebrate with your students today</p>
                    </div>
                </div>

                <section className="space-y-6 animate-slide-up">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold text-foreground/80 flex items-center gap-2">
                            Today's Celebrations
                            <span className="px-3 py-1 gradient-primary text-white text-xs font-bold rounded-full shadow-soft">
                                {birthdayStudents.length}
                            </span>
                        </h3>
                    </div>

                    <div className="space-y-4 pb-safe">
                        {birthdayStudents.length > 0 ? (
                            birthdayStudents.map((student, index) => (
                                <div
                                    key={student.id}
                                    className="animate-slide-in w-full flex items-center justify-between p-5 bg-white border border-border/50 rounded-2xl shadow-soft transition-all duration-300 hover:shadow-soft-lg"
                                    style={{ animationDelay: `${index * 50}ms` }}
                                >
                                    <div
                                        className="flex items-center gap-4 flex-1 cursor-pointer"
                                        onClick={() => navigate(`/students/${student.id}`)}
                                    >
                                        <div className="w-14 h-14 rounded-2xl bg-primary flex flex-col items-center justify-center shadow-soft">
                                            <span className="text-white font-bold text-lg leading-none">{student.roomNo}</span>
                                            <span className="text-white/70 font-bold text-[10px] uppercase tracking-tighter mt-0.5">Room</span>
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg text-foreground">{student.name}</h3>
                                            <p className="text-sm font-medium text-muted-foreground">{student.mobile || 'No Mobile'}</p>
                                        </div>
                                    </div>

                                    <Button
                                        onClick={async (e) => {
                                            e.stopPropagation();
                                            if (!student.mobile) {
                                                toast.error("No mobile number found");
                                                return;
                                            }
                                            try {
                                                const message = `Happy Birthday, ${student.name}! 🎉🎂 Wishing you a fantastic day filled with joy and happiness!`;
                                                toast.info(`Sending wish to ${student.name}...`);

                                                await api.post('/api/send', {
                                                    number: student.mobile,
                                                    message: message
                                                });
                                                toast.success(`Birthday wish sent to ${student.name}!`);
                                            } catch (error) {
                                                toast.error(`Failed to send wish to ${student.name}`);
                                            }
                                        }}
                                        className="rounded-xl font-bold gap-2 bg-primary text-white hover:bg-primary/90 shadow-md"
                                    >
                                        <Send className="w-4 h-4" /> Send Wish
                                    </Button>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-20 glass-card border-dashed border-2 border-border/50 rounded-3xl animate-fade-in flex flex-col items-center justify-center gap-4">
                                <div className="w-20 h-20 bg-gradient-to-br from-primary/10 to-blue-500/10 rounded-full flex items-center justify-center animate-pulse">
                                    <Sparkles className="w-10 h-10 text-muted-foreground/40" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-foreground">No birthdays today</h3>
                                    <p className="text-muted-foreground mt-1">Check back tomorrow for more celebrations!</p>
                                </div>
                            </div>
                        )}
                    </div>
                </section>
            </main>
        </div>
    );
};

export default Birthdays;
