import { useState, useEffect } from 'react';
import { Tags, Plus, Users, Search, CheckCircle2, X, Trash2, ChevronRight, ChevronDown, Loader2 } from 'lucide-react';
import { AppHeader } from '@/components/AppHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { getStudents, getCategories, addCategory, deleteCategory, updateCategory, Karyakarta } from '@/lib/store';
import { Student } from '@/types';
import { toast } from 'sonner';

const Categories = () => {
  const [karyakartas, setKaryakartas] = useState<Karyakarta[]>([]);
  const [loading, setLoading] = useState(true);

  const [newKaryakartaName, setNewKaryakartaName] = useState('');
  const [newKaryakartaType, setNewKaryakartaType] = useState<'main' | 'sub'>('main');
  const [selectedParentId, setSelectedParentId] = useState<string>('');

  const [students, setStudents] = useState<Student[]>([]);
  const [selectedKaryakartaId, setSelectedKaryakartaId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch Data on mount
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      const [studentsData, categoriesData] = await Promise.all([
        getStudents(),
        getCategories()
      ]);
      setStudents(studentsData);
      setKaryakartas(categoriesData);
      setLoading(false);
    };
    init();
  }, []);

  const handleAddKaryakarta = async () => {
    if (!newKaryakartaName.trim()) return;

    if (newKaryakartaType === 'sub' && !selectedParentId) {
      toast.error('Please select a Main Karyakarta');
      return;
    }

    const newKaryakarta: Karyakarta = {
      id: crypto.randomUUID(), // Temporarily generate ID, but DB will likely ignore or overwrite if using serial, but UUID is fine if DB expects text id.
      // Usually supbase auto-generates ID. Let's see if we can omit ID.
      // The store.ts `addCategory` takes `Karyakarta` which has `id`. 
      // Ideally we shouldn't pass ID if it's auto-generated.
      // Let's assume for now we generate it or the types need adjustment.
      // `addCategory` implementation: `insert([dbPayload])`.

      name: newKaryakartaName.trim(),
      studentIds: [],
      type: newKaryakartaType,
      parentId: newKaryakartaType === 'sub' ? selectedParentId : undefined
    };

    try {
      // If DB generates ID, we should let it. But `Karyakarta` interface requires ID.
      // Let's check `addCategory` implementation in store.ts. It calls `toDbCategory`.
      // `toDbCategory` doesn't remove ID. So we can pass a UUID or let DB handle it.
      // If DB is UUID primary key, we can generate it here or let DB do it.
      // Let's assume we can generate client side or just omit and cast.

      // Actually, let's just generate a UUID here to be safe and update UI optimistically or wait.
      // Wait for DB response is better.

      const saved = await addCategory(newKaryakarta);
      if (saved) {
        setKaryakartas([...karyakartas, saved]);
        setNewKaryakartaName('');
        setNewKaryakartaType('main');
        setSelectedParentId('');
        toast.success(`${newKaryakartaType === 'main' ? 'Main' : 'Sub'} Karyakarta added`);
      }
    } catch (e) {
      toast.error("Failed to add category");
    }
  };

  const handleDeleteKaryakarta = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();

    // Check if it has subs
    const hasSubs = karyakartas.some(k => k.parentId === id);
    if (hasSubs) {
      if (!confirm('This Karyakarta has Sub-Karyakartas. Deleting it will also delete them. Continue?')) return;
    }

    try {
      await deleteCategory(id);
      setKaryakartas(prev => prev.filter(k => k.id !== id && k.parentId !== id));
      toast.success('Karyakarta deleted');
    } catch (e) {
      toast.error("Failed to delete category");
    }
  };

  const toggleStudentAssignment = async (karyakartaId: string, studentId: string) => {
    const karyakarta = karyakartas.find(k => k.id === karyakartaId);
    if (!karyakarta) return;

    const isAssigned = karyakarta.studentIds.includes(studentId);
    const newStudentIds = isAssigned
      ? karyakarta.studentIds.filter(id => id !== studentId)
      : [...karyakarta.studentIds, studentId];

    // Optimistic Update
    setKaryakartas(prev => prev.map(k =>
      k.id === karyakartaId ? { ...k, studentIds: newStudentIds } : k
    ));

    try {
      await updateCategory(karyakartaId, { studentIds: newStudentIds });
    } catch (e) {
      // Revert
      setKaryakartas(prev => prev.map(k =>
        k.id === karyakartaId ? { ...k, studentIds: karyakarta.studentIds } : k
      ));
      toast.error("Failed to update assignment");
    }
  };

  const selectedKaryakarta = karyakartas.find(k => k.id === selectedKaryakartaId);
  const mainKaryakartas = karyakartas.filter(k => k.type === 'main');

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
            Karyakarta Hierarchy
          </h2>
          <p className="text-muted-foreground font-medium uppercase tracking-widest text-xs">Manage groups and sub-groups</p>
        </div>

        {/* Add Karyakarta Section */}
        <div className="bg-white p-5 rounded-3xl shadow-soft border border-border/50 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="w-full md:w-48 shrink-0">
              <Select
                value={newKaryakartaType}
                onValueChange={(val: 'main' | 'sub') => setNewKaryakartaType(val)}
              >
                <SelectTrigger className="h-12 rounded-xl text-base font-medium">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="main">Main Group</SelectItem>
                  <SelectItem value="sub">Sub Group</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {newKaryakartaType === 'sub' && (
              <div className="w-full md:w-64 shrink-0 animate-in fade-in slide-in-from-left-4">
                <Select
                  value={selectedParentId}
                  onValueChange={setSelectedParentId}
                >
                  <SelectTrigger className="h-12 rounded-xl text-base font-medium">
                    <SelectValue placeholder="Select Parent Group" />
                  </SelectTrigger>
                  <SelectContent>
                    {mainKaryakartas.map(k => (
                      <SelectItem key={k.id} value={k.id}>{k.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="flex-1 flex gap-2">
              <Input
                placeholder={newKaryakartaType === 'main' ? "Enter Main Karyakarta Name..." : "Enter Sub-Karyakarta Name..."}
                value={newKaryakartaName}
                onChange={(e) => setNewKaryakartaName(e.target.value)}
                className="h-12 text-lg rounded-xl"
                onKeyDown={(e) => e.key === 'Enter' && handleAddKaryakarta()}
              />
              <Button onClick={handleAddKaryakarta} size="lg" className="h-12 px-6 rounded-xl">
                <Plus className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Hierarchical List */}
        <div className="space-y-6">
          {loading ? (
            <div className="py-20 text-center text-muted-foreground flex flex-col items-center">
              <Loader2 className="w-10 h-10 animate-spin mb-2" />
              <p>Loading Karyakartas...</p>
            </div>
          ) : (
            <>
              {mainKaryakartas.map((main) => {
                const subKaryakartas = karyakartas.filter(k => k.parentId === main.id);

                return (
                  <div key={main.id} className="bg-white border border-border/50 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                    {/* Main Karyakarta Header */}
                    <div className="p-6 bg-gray-50/50 flex items-center justify-between group cursor-pointer" onClick={() => setSelectedKaryakartaId(main.id)}>
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary font-bold text-xl">
                          {main.name.charAt(0)}
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-foreground">{main.name}</h3>
                          <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <Users className="w-3.5 h-3.5" />
                            {main.studentIds.length} Direct Students
                          </p>
                        </div>
                      </div>

                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => handleDeleteKaryakarta(main.id, e)}
                      >
                        <Trash2 className="w-5 h-5" />
                      </Button>
                    </div>

                    {/* Sub Karyakartas List */}
                    {subKaryakartas.length > 0 && (
                      <div className="border-t border-border/50">
                        <div className="px-6 py-3 bg-gray-50 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                          Sub Groups
                        </div>
                        <div className="divide-y divide-border/50">
                          {subKaryakartas.map(sub => (
                            <div
                              key={sub.id}
                              className="p-4 pl-12 hover:bg-gray-50 cursor-pointer flex items-center justify-between group/sub transition-colors"
                              onClick={() => setSelectedKaryakartaId(sub.id)}
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-primary/40" />
                                <span className="font-semibold text-foreground">{sub.name}</span>
                                <Badge variant="secondary" className="bg-gray-100 text-gray-600 hover:bg-gray-200 ml-2">
                                  {sub.studentIds.length} Students
                                </Badge>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-destructive opacity-0 group-hover/sub:opacity-100 transition-opacity"
                                onClick={(e) => handleDeleteKaryakarta(sub.id, e)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {subKaryakartas.length === 0 && (
                      <div className="px-6 py-4 text-sm text-muted-foreground italic border-t border-border/50 pl-20">
                        No sub-groups added.
                      </div>
                    )}
                  </div>
                );
              })}

              {mainKaryakartas.length === 0 && (
                <div className="py-20 text-center text-muted-foreground border-2 border-dashed border-border/50 rounded-3xl">
                  <p>No Karyakarta hierarchies created yet.</p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Assignment Dialog (Reused for both Main and Sub) */}
        <Dialog open={!!selectedKaryakartaId} onOpenChange={(open) => !open && setSelectedKaryakartaId(null)}>
          <DialogContent className="max-w-2xl h-[80vh] flex flex-col">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="flex items-center gap-2">
                    {selectedKaryakarta?.type === 'sub' && (
                      <span className="text-muted-foreground font-normal text-lg">
                        {karyakartas.find(k => k.id === selectedKaryakarta?.parentId)?.name} /
                      </span>
                    )}
                    {selectedKaryakarta?.name}
                  </span>
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest mt-1">
                    {selectedKaryakarta?.type === 'main' ? 'Main Group' : 'Sub Group'}
                  </span>
                </div>
                <Badge variant="secondary" className="text-lg px-3">
                  {selectedKaryakarta?.studentIds.length} Students
                </Badge>
              </DialogTitle>
            </DialogHeader>

            <div className="relative mt-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search students..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 text-base"
              />
            </div>

            <ScrollArea className="flex-1 pr-4 mt-2">
              <div className="space-y-2">
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

