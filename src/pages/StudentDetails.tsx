import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Phone, Mail, Calendar, BookOpen, GraduationCap, Heart, Edit, UserMinus, User, Hash, Briefcase, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getStudents } from '@/lib/store';
import { Student } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const StudentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [student, setStudent] = useState<Student | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const students = await getStudents();
        const found = students.find(s => s.id === id);
        setStudent(found);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchStudent();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          <p className="text-muted-foreground font-bold uppercase tracking-widest text-xs">Loading Details...</p>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center mx-auto text-destructive">
            <UserMinus className="w-10 h-10" />
          </div>
          <h1 className="text-2xl font-bold">Student not found</h1>
          <Button onClick={() => navigate('/dashboard')} variant="secondary">Go Back</Button>
        </div>
      </div>
    );
  }

  const handleMoveToAlumni = async () => {
    toast({
      title: 'Moved to Alumni',
      description: `${student.name} has been moved to alumni list.`,
    });
    navigate('/dashboard');
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
    <div className="min-h-screen bg-background pb-20 relative animate-fade-in">
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-border shadow-soft">
        <div className="flex items-center gap-4 h-16 px-4 max-w-7xl mx-auto">
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <h1 className="text-xl font-bold tracking-tight text-foreground">Student Profile</h1>
        </div>
      </header>

      <main className="p-4 md:p-6 space-y-8 max-w-4xl mx-auto mt-4">
        {/* Profile Card */}
        <div className="bg-white border border-border/50 rounded-3xl shadow-soft p-8 text-center animate-scale-in relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-[100px] -z-1" />

          <div className="w-28 h-28 mx-auto mb-6 rounded-2xl bg-primary flex items-center justify-center shadow-soft transform rotate-3">
            <span className="text-5xl font-extrabold text-white -rotate-3">
              {student.name.charAt(0)}
            </span>
          </div>

          <div className="space-y-1">
            <h2 className="text-3xl font-extrabold text-foreground tracking-tight">{student.name}</h2>
            <p className="text-primary font-bold uppercase tracking-[0.2em] text-xs">Room {student.roomNo}</p>
          </div>

          <div className="mt-8 flex justify-center gap-3">
            {!student.isAlumni ? (
              <>
                <Button
                  size="lg"
                  className="rounded-2xl h-12 px-8 font-bold bg-primary hover:bg-primary/90 shadow-soft"
                  onClick={() => navigate(`/students/${id}/edit`)}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
                <Button
                  size="lg"
                  variant="secondary"
                  className="rounded-2xl h-12 px-8 font-bold border border-border/50"
                  onClick={handleMoveToAlumni}
                >
                  <UserMinus className="w-4 h-4 mr-2" />
                  Move to Alumni
                </Button>
              </>
            ) : (
              <div className="inline-flex items-center gap-2 px-6 py-2.5 bg-accent/20 text-accent text-sm font-bold rounded-2xl border border-accent/10 uppercase tracking-widest">
                <GraduationCap className="w-5 h-5" />
                Alumni Member
              </div>
            )}
          </div>
        </div>

        {/* Info Groups */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {infoGroups.map((group, groupIdx) => (
            <div key={group.title} className="space-y-3 animate-slide-in" style={{ animationDelay: `${groupIdx * 50}ms` }}>
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1">{group.title}</h3>
              <div className="bg-white border border-border/50 rounded-2xl shadow-soft divide-y divide-border/30 overflow-hidden">
                {group.items.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.label}
                      className="flex items-center gap-4 px-6 py-4 hover:bg-primary/[0.02] transition-colors"
                    >
                      <div className="w-10 h-10 rounded-xl bg-muted/30 flex items-center justify-center shrink-0">
                        {Icon && <Icon className="w-5 h-5 text-muted-foreground" />}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight leading-none mb-1">{item.label}</p>
                        <p className="text-base font-bold text-foreground truncate">{item.value || "N/A"}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default StudentDetails;
