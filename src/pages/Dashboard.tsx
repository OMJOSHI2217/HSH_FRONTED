import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Search, Plus } from 'lucide-react';
import { AppHeader } from '@/components/AppHeader';
import { StatCard } from '@/components/StatCard';
import { StudentListItem } from '@/components/StudentListItem';
import { Input } from '@/components/ui/input';
import { getStudents } from '@/lib/store';
import { Student } from '@/types';
import { cn } from '@/lib/utils';

const Dashboard = () => {
  const navigate = useNavigate();
  const [showAlumni, setShowAlumni] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const data = await getStudents();
      setStudents(data);
    } catch (error) {
      console.error(error);
    }
  };

  // Filter students based on state
  const filteredStudents = students.filter(student => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.roomNo.includes(searchQuery) ||
      student.mobile.includes(searchQuery);

    const matchesFilter = showAlumni ? student.isAlumni : !student.isAlumni;

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-background pb-20 relative animate-fade-in">
      <AppHeader title="Hostel Hub" />

      <main className="p-4 md:p-6 space-y-8 max-w-5xl mx-auto">
        {/* Welcome Section */}
        <div className="space-y-1">
          <h2 className="text-3xl font-extrabold tracking-tight text-foreground">Welcome back!</h2>
          <p className="text-muted-foreground font-medium uppercase tracking-widest text-xs">Manage your students efficiently</p>
        </div>

        {/* Student List Section */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input
                placeholder="Search name, room, mobile..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-14 bg-white border-border/50 rounded-2xl shadow-soft focus:ring-primary/20 focus:border-primary transition-all text-base"
              />
            </div>

            <div className="flex gap-2">
              <div className="flex p-1.5 bg-muted/30 backdrop-blur-sm rounded-2xl border border-border/50 shadow-sm">
                <button
                  onClick={() => setShowAlumni(false)}
                  className={cn(
                    "px-6 py-2.5 text-sm font-bold rounded-xl transition-all duration-300",
                    !showAlumni
                      ? "bg-primary text-white shadow-soft"
                      : "text-muted-foreground hover:text-foreground hover:bg-white/50"
                  )}
                >
                  Current
                </button>
                <button
                  onClick={() => setShowAlumni(true)}
                  className={cn(
                    "px-6 py-2.5 text-sm font-bold rounded-xl transition-all duration-300",
                    showAlumni
                      ? "bg-primary text-white shadow-soft"
                      : "text-muted-foreground hover:text-foreground hover:bg-white/50"
                  )}
                >
                  Alumni
                </button>
              </div>

              <button
                onClick={() => navigate('/students/add')}
                className="w-14 h-14 bg-primary text-white rounded-2xl shadow-soft flex items-center justify-center hover:bg-primary/90 hover:scale-[1.05] active:scale-[0.95] transition-all duration-300 shrink-0"
                title="Add Student"
              >
                <Plus className="w-6 h-6" />
              </button>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-1 mb-8">
            {filteredStudents.length > 0 ? (
              filteredStudents.map((student, index) => (
                <div
                  key={student.id}
                  className="animate-slide-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <StudentListItem
                    student={student}
                    onClick={() => navigate(`/students/${student.id}`)}
                  />
                </div>
              ))
            ) : (
              <div className="text-center py-20 bg-white/50 border border-dashed border-border rounded-3xl animate-fade-in">
                <div className="w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-bold text-foreground">No students found</h3>
                <p className="text-muted-foreground mt-1">Try adjusting your search criteria</p>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
