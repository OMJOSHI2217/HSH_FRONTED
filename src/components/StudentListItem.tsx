import React from 'react';
import { GraduationCap, Phone, MessageCircle } from 'lucide-react';
import { Student } from '@/types';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface StudentListItemProps {
  student: Student;
  onClick: () => void;
  hideContactActions?: boolean;
}

export const StudentListItem = ({ student, onClick, hideContactActions = false }: StudentListItemProps) => {
  const handleCall = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!student.mobile) return;
    window.location.href = `tel:${student.mobile}`;
  };

  const handleWhatsApp = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Remove all non-numeric characters for the WhatsApp API
    const cleanNumber = (student.mobile || '').replace(/[^0-9]/g, '');
    const url = `https://wa.me/${cleanNumber}`;
    window.open(url, '_blank');
  };



  return (
    <div
      onClick={onClick}
      className="w-full flex items-center gap-4 p-5 bg-white border border-border/50 rounded-2xl shadow-soft transition-all duration-300 hover:shadow-soft-lg hover:scale-[1.01] active:scale-[0.99] animate-fade-in text-left cursor-pointer group"
    >
      <div className="w-14 h-14 rounded-2xl bg-primary flex flex-col items-center justify-center shadow-soft">
        <span className="text-white font-bold text-lg leading-none">
          {student.roomNo}
        </span>
        <span className="text-white/70 font-bold text-[10px] uppercase tracking-tighter mt-0.5">
          Room
        </span>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-bold text-lg text-foreground truncate tracking-tight">{student.name}</h3>
          {student.isAlumni && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-accent/20 text-accent text-[10px] font-bold rounded-full uppercase tracking-wider border border-accent/10">
              <GraduationCap className="w-3 h-3" />
              Alumni
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Phone className="w-3.5 h-3.5" />
          <p className="text-sm font-medium truncate">{student.mobile || 'No Mobile'}</p>

        </div>
      </div>

      <div className="flex items-center gap-2">
        {!hideContactActions && (
          <div className="flex items-center gap-1.5 opacity-100 transition-opacity duration-200">
            <Button
              size="icon"
              variant="secondary"
              className="h-10 w-10 text-success bg-success/10 hover:bg-success hover:text-white rounded-xl transition-all shadow-sm"
              onClick={handleWhatsApp}
            >
              <MessageCircle className="w-5 h-5 text-green-600" />
            </Button>
            <Button
              size="icon"
              variant="secondary"
              className="h-10 w-10 text-blue-600 bg-blue-50 hover:bg-blue-600 hover:text-white rounded-xl transition-all shadow-sm"
              onClick={handleCall}
            >
              <Phone className="w-5 h-5" />
            </Button>

          </div>
        )}

      </div>
    </div>
  );
};
