import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Users2, CheckCircle2, Clock, AlertCircle, Smartphone, RefreshCw } from 'lucide-react';
import { AppHeader } from '@/components/AppHeader';
import { StudentListItem } from '@/components/StudentListItem';
import { WhatsAppStatus } from '@/components/WhatsAppStatus';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
  SelectSeparator,
} from "@/components/ui/select"
import { getStudents, updateStudent } from '@/lib/store';
import { WhatsAppService } from '@/lib/whatsapp';
import { useToast } from '@/hooks/use-toast';
import { Student } from '@/types';
import { cn } from '@/lib/utils';

const Students = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showAlumni, setShowAlumni] = useState(false);
  const [whatsappFilter, setWhatsappFilter] = useState<'all' | 'verified' | 'pending' | 'unverified'>('all');
  const [showConnectDialog, setShowConnectDialog] = useState(false);
  const { toast } = useToast();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const data = await getStudents();
      setStudents(data);
    } catch (error) {
      console.error('Failed to fetch students', error);
      toast({
        title: "Error",
        description: "Failed to load students. Check connection.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.roomNo.includes(searchQuery) ||
      student.mobile.includes(searchQuery);

    const matchesFilter = showAlumni ? student.isAlumni : !student.isAlumni;

    const matchesWhatsapp = whatsappFilter === 'all'
      ? true
      : whatsappFilter === 'verified'
        ? student.whatsappVerified === 'verified'
        : whatsappFilter === 'pending'
          ? student.whatsappVerified === 'pending'
          : (student.whatsappVerified === 'unverified' || !student.whatsappVerified);

    return matchesSearch && matchesFilter && matchesWhatsapp;
  });

  const whatsappStats = {
    verified: students.filter(s => s.whatsappVerified === 'verified').length,
    pending: students.filter(s => s.whatsappVerified === 'pending').length,
    unverified: students.filter(s => s.whatsappVerified === 'unverified' || !s.whatsappVerified).length
  };

  const handleVerify = async (student: Student) => {
    if (!student.mobile) {
      toast({ title: "Error", description: "No mobile number to verify", variant: "destructive" });
      return;
    }

    toast({ title: "Verifying...", description: `Checking ${student.mobile} on WhatsApp` });

    try {
      const result = await WhatsAppService.verifyNumber(student.mobile);
      if (result.registered) {
        await updateStudent(student.id, { whatsappVerified: 'verified' });
        toast({ title: "Verified!", description: "Student number confirmed on WhatsApp.", className: "bg-green-100 border-green-200 text-green-800" });
        fetchStudents();
      } else {
        await updateStudent(student.id, { whatsappVerified: 'unverified' });
        toast({ title: "Not Found", description: "Number is not registered on WhatsApp.", variant: "destructive" });
        fetchStudents();
      }
    } catch (error) {
      console.error(error);
      toast({ title: "Verification Failed", description: "Is the WhatsApp server connected?", variant: "destructive" });
    }
  };


  return (
    <div className="min-h-screen bg-background pb-20 relative animate-fade-in">
      <AppHeader title="Hostel Hub" />

      <main className="p-4 md:p-6 space-y-8 max-w-5xl mx-auto">
        {/* Header Section */}
        <div className="space-y-1">
          <h2 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-3">
            <Users2 className="w-8 h-8 text-primary" />
            Student Directory
          </h2>
          <p className="text-muted-foreground font-medium uppercase tracking-widest text-xs">Browse and search for any resident</p>
        </div>

        {/* Search & Toggle Section */}
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

            <WhatsAppStatus />

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
                Current ({students.filter(s => !s.isAlumni).length})
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
                Alumni ({students.filter(s => s.isAlumni).length})
              </button>
            </div>

            {/* WhatsApp Filter Dropdown */}
            <Select
              value={whatsappFilter}
              onValueChange={(value: any) => {
                if (value === 'action_connect') {
                  setShowConnectDialog(true);
                } else if (value === 'action_generate_qr') {
                  toast({ title: "Regenerating QR...", description: "Please wait while we refresh the session." });
                  WhatsAppService.restart().then(() => setShowConnectDialog(true));
                } else {
                  setWhatsappFilter(value);
                }
              }}
            >
              <SelectTrigger className="w-full sm:w-[220px] h-14 rounded-2xl border-border/50 shadow-soft bg-white">
                <SelectValue placeholder="WhatsApp & Filters" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Filter Students</SelectLabel>
                  <SelectItem value="all">All Students ({students.length})</SelectItem>
                  <SelectItem value="verified">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-success" />
                      <span>Verified ({whatsappStats.verified})</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="pending">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-warning" />
                      <span>Pending ({whatsappStats.pending})</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="unverified">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-destructive" />
                      <span>Unverified ({whatsappStats.unverified})</span>
                    </div>
                  </SelectItem>
                </SelectGroup>

                <SelectSeparator />

                <SelectGroup>
                  <SelectLabel>Server Actions</SelectLabel>
                  <SelectItem value="action_connect" className="text-primary font-medium cursor-pointer">
                    <div className="flex items-center gap-2">
                      <Smartphone className="w-4 h-4" />
                      <span>Connection Status</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="action_generate_qr" className="text-primary font-medium cursor-pointer">
                    <div className="flex items-center gap-2">
                      <RefreshCw className="w-4 h-4" />
                      <span>Generate QR Code</span>
                    </div>
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>

            <WhatsAppStatus open={showConnectDialog} onOpenChange={setShowConnectDialog} hideTrigger />
          </div>

          {/* Student List */}
          <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-1 mb-20">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                <p className="text-muted-foreground font-bold uppercase tracking-widest text-[10px]">Updating Directory...</p>
              </div>
            ) : filteredStudents.length > 0 ? (
              filteredStudents.map((student, index) => (
                <div
                  key={student.id}
                  className="animate-slide-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <StudentListItem
                    student={student}
                    onClick={() => navigate(`/students/${student.id}`)}
                    onVerify={(e) => handleVerify(student)}
                  />
                </div>
              ))
            ) : (
              <div className="text-center py-20 bg-white/50 border border-dashed border-border rounded-3xl animate-fade-in flex flex-col items-center justify-center gap-3">
                <div className="w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-bold text-foreground">No records found</h3>
                <p className="text-muted-foreground mt-1">Try refining your search terms</p>
              </div>
            )}
          </div>
        </section>

        {/* FAB */}
        <Button
          onClick={() => navigate('/students/add')}
          className="fixed bottom-8 right-8 w-16 h-16 rounded-2xl shadow-soft-lg bg-primary hover:bg-primary/90 hover:scale-[1.1] active:scale-[0.9] transition-all z-50 group"
          size="icon"
        >
          <Plus className="w-8 h-8 group-hover:rotate-90 transition-transform duration-300" />
        </Button>
      </main>
    </div>
  );
};

export default Students;
