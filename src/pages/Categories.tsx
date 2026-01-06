import { useState, useEffect } from 'react';
import { Tags, Plus, Users, Search, CheckCircle2, X, Trash2 } from 'lucide-react';
import { AppHeader } from '@/components/AppHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { getStudents } from '@/lib/store';
import { Student } from '@/types';
import { toast } from 'sonner';

interface Karyakarta {
  id: string;
  name: string;
  studentIds: string[];
}

const Categories = () => {
  const [karyakartas, setKaryakartas] = useState<Karyakarta[]>(() => {
    const saved = localStorage.getItem('karyakartas');
    return saved ? JSON.parse(saved) : [];
  });
  const [newKaryakartaName, setNewKaryakartaName] = useState('');
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedKaryakartaId, setSelectedKaryakartaId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch students on mount
  useEffect(() => {
    const fetchStudents = async () => {
      const data = await getStudents();
      setStudents(data);
    };
    fetchStudents();
  }, []);

  // Save to localStorage whenever karyakartas change
  useEffect(() => {
    localStorage.setItem('karyakartas', JSON.stringify(karyakartas));
  }, [karyakartas]);

  const handleAddKaryakarta = () => {
    if (!newKaryakartaName.trim()) return;
    const newKaryakarta: Karyakarta = {
      id: crypto.randomUUID(),
      name: newKaryakartaName.trim(),
      studentIds: []
    };
    setKaryakartas([...karyakartas, newKaryakarta]);
    setNewKaryakartaName('');
    toast.success('Karyakarta added successfully');
  };

  const handleDeleteKaryakarta = (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent opening dialog
    setKaryakartas(prev => prev.filter(k => k.id !== id));
    toast.success('Karyakarta deleted');
  };

  const toggleStudentAssignment = (karyakartaId: string, studentId: string) => {
    setKaryakartas(prev => prev.map(k => {
      if (k.id !== karyakartaId) return k;
      const isAssigned = k.studentIds.includes(studentId);
      return {
        ...k,
        studentIds: isAssigned
          ? k.studentIds.filter(id => id !== studentId)
          : [...k.studentIds, studentId]
      };
    }));
  };

  const selectedKaryakarta = karyakartas.find(k => k.id === selectedKaryakartaId);

  // Filter students for the dialog list
  const filteredStudents = students.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.mobile?.includes(searchQuery)
  );

  return (
    <div className="min-h-screen bg-background pb-20 relative animate-fade-in">
      <AppHeader title="Hostel Hub" />

      <main className="p-4 md:p-6 space-y-8 max-w-5xl mx-auto">
        {/* Header Section */}
        <div className="space-y-1">
          <h2 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-3">
            <Users className="w-8 h-8 text-primary" />
            Karyakarta Management
          </h2>
          <p className="text-muted-foreground font-medium uppercase tracking-widest text-xs">Manage assignments and student groups</p>
        </div>

        {/* Add Karyakarta Input */}
        <div className="flex gap-4 items-center bg-white p-4 rounded-2xl shadow-sm border border-border/50">
          <Input
            placeholder="Enter Karyakarta Name..."
            value={newKaryakartaName}
            onChange={(e) => setNewKaryakartaName(e.target.value)}
            className="h-12 text-lg"
            onKeyDown={(e) => e.key === 'Enter' && handleAddKaryakarta()}
          />
          <Button onClick={handleAddKaryakarta} size="lg" className="h-12 px-6">
            <Plus className="w-5 h-5 mr-2" /> Add
          </Button>
        </div>

        {/* Karyakarta List Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {karyakartas.map((k) => (
            <div
              key={k.id}
              onClick={() => {
                setSelectedKaryakartaId(k.id);
                setSearchQuery('');
              }}
              className="bg-white p-6 rounded-2xl shadow-soft border border-border/50 cursor-pointer hover:shadow-lg transition-all active:scale-[0.98] group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4 opacity-50 text-9xl font-black text-gray-50 -z-0 pointer-events-none group-hover:scale-110 transition-transform">
                {k.studentIds.length}
              </div>
              <div className="relative z-10 flex flex-col h-full justify-between">
                <div>
                  <div className="flex justify-between items-start">
                    <h3 className="text-xl font-bold mb-2">{k.name}</h3>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-destructive -mr-2 -mt-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => handleDeleteKaryakarta(k.id, e)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="w-4 h-4" />
                    <span className="font-medium">{k.studentIds.length} Students Assigned</span>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {karyakartas.length === 0 && (
            <div className="col-span-full py-20 text-center text-muted-foreground border-2 border-dashed border-border/50 rounded-3xl">
              <p>No Karyakartas added yet. Add one above to get started.</p>
            </div>
          )}
        </div>

        {/* Assignment Dialog */}
        <Dialog open={!!selectedKaryakartaId} onOpenChange={(open) => !open && setSelectedKaryakartaId(null)}>
          <DialogContent className="max-w-2xl h-[80vh] flex flex-col">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold flex items-center justify-between">
                <span>{selectedKaryakarta?.name}</span>
                <Badge variant="secondary" className="text-lg px-3">
                  {selectedKaryakarta?.studentIds.length} Students
                </Badge>
              </DialogTitle>
            </DialogHeader>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search students..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <ScrollArea className="flex-1 pr-4">
              <div className="space-y-2 mt-4">
                {filteredStudents.map(student => {
                  const isAssigned = selectedKaryakarta?.studentIds.includes(student.id);
                  return (
                    <div
                      key={student.id}
                      onClick={() => selectedKaryakartaId && toggleStudentAssignment(selectedKaryakartaId, student.id)}
                      className={`
                        flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all
                        ${isAssigned
                          ? 'bg-primary/5 border-primary shadow-sm'
                          : 'bg-white border-border/50 hover:bg-gray-50'}
                      `}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`
                          w-10 h-10 rounded-full flex items-center justify-center font-bold
                          ${isAssigned ? 'bg-primary text-white' : 'bg-gray-100 text-gray-500'}
                        `}>
                          {student.name.charAt(0)}
                        </div>
                        <div>
                          <p className={`font-bold ${isAssigned ? 'text-primary' : 'text-foreground'}`}>
                            {student.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {student.roomNo ? `Room: ${student.roomNo}` : 'No Room'} • {student.mobile || 'No Mobile'}
                          </p>
                        </div>
                      </div>

                      {isAssigned && (
                        <CheckCircle2 className="w-5 h-5 text-primary fill-primary/20" />
                      )}
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>

      </main>
    </div>
  );
};

export default Categories;
