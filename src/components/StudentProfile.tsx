import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, Mail, Calendar, BookOpen, GraduationCap, Heart, Edit, UserMinus, User, Hash, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Student } from '@/types';
import { useToast } from '@/hooks/use-toast';

interface StudentProfileProps {
    student: Student;
    onClose?: () => void;
}

export const StudentProfile = ({ student, onClose }: StudentProfileProps) => {
    const navigate = useNavigate();
    const { toast } = useToast();

    const handleMoveToAlumni = async () => {
        toast({
            title: 'Moved to Alumni',
            description: `${student.name} has been moved to alumni list.`,
        });
        if (onClose) onClose();
    };

    const infoGroups = [
        {
            title: "Personal Information",
            items: [
                { label: 'Full Name', value: student.name, icon: User },
                { label: 'Date of Birth', value: student.dob, icon: Calendar },
                { label: 'Age', value: `${student.age} Years`, icon: User },
            ]
        },
        {
            title: "Hostel Details",
            items: [
                { label: 'Room Number', value: student.roomNo, icon: Hash },
            ]
        },
        {
            title: "Contact Details",
            items: [
                { label: 'Mobile Number', value: student.mobile, icon: Phone },
                { label: 'Email Address', value: student.email, icon: Mail },
            ]
        },
        {
            title: "Academic Information",
            items: [
                { label: 'Degree', value: student.degree, icon: BookOpen },
                { label: 'Year', value: student.year, icon: GraduationCap },
                { label: 'Result/CGPA', value: student.result, icon: Award },
                { label: 'Interests', value: student.interest, icon: Heart },
            ]
        }
    ];

    return (
        <div className="space-y-6">
            {/* Profile Card */}
            <div className="bg-white border border-border/50 rounded-3xl shadow-soft p-6 sm:p-8 text-center relative overflow-hidden">
                <div className="w-32 h-32 mx-auto mb-6 rounded-3xl overflow-hidden shadow-soft-lg bg-muted/20 border-4 border-white">
                    {student.image ? (
                        <img src={student.image} alt={student.name} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full bg-primary flex items-center justify-center">
                            <span className="text-5xl font-extrabold text-white">
                                {student.name.charAt(0)}
                            </span>
                        </div>
                    )}
                </div>

                <div className="space-y-1">
                    <h2 className="text-xl sm:text-3xl font-extrabold text-foreground tracking-tight truncate px-2">{student.name}</h2>
                    <p className="text-primary font-bold uppercase tracking-[0.2em] text-[10px] sm:text-xs">Room {student.roomNo}</p>
                </div>

                <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3">
                    {!student.isAlumni ? (
                        <>
                            <Button
                                size="lg"
                                className="rounded-2xl h-12 px-8 font-bold bg-primary hover:bg-primary/90 shadow-soft w-full sm:w-auto"
                                onClick={() => navigate(`/students/${student.id}/edit`)}
                            >
                                <Edit className="w-4 h-4 mr-2" />
                                Edit Profile
                            </Button>
                            <Button
                                size="lg"
                                variant="secondary"
                                className="rounded-2xl h-12 px-8 font-bold border border-border/50 w-full sm:w-auto"
                                onClick={handleMoveToAlumni}
                            >
                                <UserMinus className="w-4 h-4 mr-2" />
                                Move to Alumni
                            </Button>
                        </>
                    ) : (
                        <div className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-accent/20 text-accent text-xs sm:text-sm font-bold rounded-2xl border border-accent/10 uppercase tracking-widest w-full sm:w-auto">
                            <GraduationCap className="w-5 h-5" />
                            Alumni Member
                        </div>
                    )}
                </div>
            </div>

            {/* Info Groups */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                {infoGroups.map((group, groupIdx) => (
                    <div key={group.title} className="space-y-3">
                        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1">{group.title}</h3>
                        <div className="bg-white border border-border/50 rounded-2xl shadow-soft divide-y divide-border/30 overflow-hidden text-left">
                            {group.items.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <div
                                        key={item.label}
                                        className="flex items-center gap-4 px-4 py-3 sm:px-6 sm:py-4 hover:bg-primary/[0.02] transition-colors"
                                    >
                                        <div className="w-10 h-10 rounded-xl bg-muted/30 flex items-center justify-center shrink-0">
                                            {Icon && <Icon className="w-5 h-5 text-muted-foreground" />}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight leading-none mb-1">{item.label}</p>
                                            <p className="text-sm sm:text-base font-bold text-foreground truncate">{item.value || "N/A"}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
