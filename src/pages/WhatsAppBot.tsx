import { useState, useEffect } from 'react';
import { AppHeader } from '@/components/AppHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Wifi, WifiOff, Loader, RefreshCw, Send, MessageSquare, Smartphone, Search, User, CheckCircle, Phone } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import { getStudents } from '@/lib/store';
import { Student } from '@/types';
import { cn } from '@/lib/utils';

const WhatsAppBot = () => {
    const [status, setStatus] = useState({ state: 'loading', message: 'Initializing...', qr: null });
    const [msgForm, setMsgForm] = useState({ to: '', message: '' });
    const [sendingMsg, setSendingMsg] = useState(false);

    // Sender - Student Search State
    const [students, setStudents] = useState<Student[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [showDropdown, setShowDropdown] = useState(false);

    // --- Dashboard Logic ---
    const fetchStatus = async () => {
        try {
            // NOTE: Backend endpoints are currently removed, this might fail until restored.
            const response = await axios.get('/api/whatsapp/connect');
            const data = response.data;

            if (data.status === 'connected') {
                setStatus({ state: 'connected', message: 'WhatsApp is connected', qr: null });
            } else if (data.status === 'qr') {
                setStatus({ state: 'disconnected', message: 'Scan QR Code', qr: data.qrCode });
            } else {
                setStatus({ state: 'loading', message: data.message || 'Loading...', qr: null });
            }
        } catch (error) {
            console.log("Backend not reachable for status");
            setStatus({ state: 'error', message: 'Backend disconnected (API missing)', qr: null });
        }
    };

    useEffect(() => {
        fetchStatus();
        const interval = setInterval(fetchStatus, 5000);
        return () => clearInterval(interval);
    }, []);

    // --- Sender Logic ---
    useEffect(() => {
        // Load students from store for search
        getStudents().then(setStudents);
    }, []);

    useEffect(() => {
        if (searchQuery.trim() === '') {
            setFilteredStudents([]);
            setShowDropdown(false);
            return;
        }

        const lowerQuery = searchQuery.toLowerCase();
        const filtered = students.filter(student =>
            !student.isAlumni && (
                (student.name && student.name.toLowerCase().includes(lowerQuery)) ||
                (student.roomNo && student.roomNo.toLowerCase().includes(lowerQuery))
            )
        );
        setFilteredStudents(filtered);
        setShowDropdown(true);
    }, [searchQuery, students]);

    const handleSelectStudent = (student: Student) => {
        setSelectedStudent(student);
        setMsgForm({ ...msgForm, to: student.mobile || '' });
        setSearchQuery(`${student.name} (Room: ${student.roomNo})`);
        setShowDropdown(false);
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        setSendingMsg(true);
        try {
            await axios.post('/api/whatsapp/send', msgForm);
            toast.success('Message sent successfully!');
            setMsgForm({ to: '', message: '' });
            setSelectedStudent(null);
            setSearchQuery('');
        } catch (error) {
            toast.error('Failed to send message');
        } finally {
            setSendingMsg(false);
        }
    };

    return (
        <div className="min-h-screen bg-background pb-20 relative animate-fade-in">
            <AppHeader title="WhatsApp Bot" />

            <main className="p-4 md:p-6 max-w-5xl mx-auto space-y-8">

                {/* Header */}
                <div className="space-y-1">
                    <h2 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-3">
                        <Smartphone className="w-8 h-8 text-primary" />
                        WhatsApp Automation
                    </h2>
                    <p className="text-muted-foreground font-medium uppercase tracking-widest text-xs">Manage connections and automated messages</p>
                </div>

                <Tabs defaultValue="dashboard" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 p-1.5 bg-muted/30 backdrop-blur-sm rounded-2xl border border-border/50 mb-8 max-w-md">
                        <TabsTrigger value="dashboard" className="rounded-xl font-bold py-3 data-[state=active]:bg-primary data-[state=active]:text-white">Dashboard</TabsTrigger>
                        <TabsTrigger value="sender" className="rounded-xl font-bold py-3 data-[state=active]:bg-primary data-[state=active]:text-white">Send Message</TabsTrigger>
                    </TabsList>

                    {/* DASHBOARD TAB */}
                    <TabsContent value="dashboard" className="space-y-6 animate-fade-in">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-white/80 backdrop-blur-md border border-white/20 shadow-soft rounded-3xl p-8 flex flex-col items-center justify-center text-center gap-4 min-h-[300px]">
                                <div className={`w-4 h-4 rounded-full ${status.state === 'connected' ? 'bg-success shadow-[0_0_15px_rgba(16,185,129,0.5)]' : 'bg-destructive shadow-[0_0_15px_rgba(239,68,68,0.5)]'}`} />

                                <div className="p-4 bg-muted/20 rounded-full">
                                    {status.state === 'connected' ? <Wifi className="w-10 h-10 text-success" /> : status.state === 'loading' ? <Loader className="w-10 h-10 animate-spin text-primary" /> : <WifiOff className="w-10 h-10 text-destructive" />}
                                </div>

                                <div>
                                    <h3 className="text-2xl font-bold mb-1">{status.state === 'connected' ? 'Connected' : status.state === 'loading' ? 'Initializing' : 'Disconnected'}</h3>
                                    <p className="text-muted-foreground font-medium">{status.message}</p>
                                </div>

                                {status.state === 'disconnected' && status.qr && (
                                    <div className="p-4 bg-white rounded-xl shadow-inner mt-4">
                                        <img src={status.qr} alt="QR Code" className="w-48 h-48 object-contain" />
                                    </div>
                                )}
                            </div>

                            <div className="bg-white/80 backdrop-blur-md border border-white/20 shadow-soft rounded-3xl p-8 flex flex-col items-center justify-center text-center gap-4">
                                <RefreshCw className="w-12 h-12 text-blue-500 opacity-80" />
                                <div>
                                    <h3 className="text-xl font-bold">Auto-Replies Active</h3>
                                    <p className="text-muted-foreground mt-2">Bot is currently running and listening for incoming messages.</p>
                                </div>
                            </div>
                        </div>
                    </TabsContent>

                    {/* SENDER TAB */}
                    <TabsContent value="sender" className="space-y-6 animate-fade-in">
                        <Card className="max-w-xl mx-auto p-8 border-border/50 shadow-soft rounded-3xl overflow-visible">
                            <div className="text-center mb-8">
                                <h3 className="text-2xl font-bold mb-2">Send Message</h3>
                                <p className="text-muted-foreground">Search for a student to send a message</p>
                            </div>

                            <form onSubmit={handleSendMessage} className="space-y-6">

                                {/* Student Search */}
                                <div className="space-y-2 relative">
                                    <Label>Search Student</Label>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <Input
                                            className="pl-9 h-12 rounded-xl"
                                            placeholder="Start typing name or room no..."
                                            value={searchQuery}
                                            onChange={e => {
                                                setSearchQuery(e.target.value);
                                                if (selectedStudent) {
                                                    setSelectedStudent(null);
                                                    setMsgForm({ ...msgForm, to: '' });
                                                }
                                            }}
                                        />
                                    </div>

                                    {/* Dropdown */}
                                    {showDropdown && filteredStudents.length > 0 && (
                                        <div className="absolute top-full left-0 right-0 mt-2 bg-white/90 backdrop-blur-xl border border-white/20 shadow-xl rounded-xl z-50 max-h-[250px] overflow-y-auto p-2">
                                            {filteredStudents.map(student => (
                                                <div
                                                    key={student.id}
                                                    onClick={() => handleSelectStudent(student)}
                                                    className="p-3 hover:bg-muted/50 rounded-lg cursor-pointer flex items-center gap-3 transition-colors"
                                                >
                                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                                        <User className="w-4 h-4" />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-sm">{student.name}</p>
                                                        <p className="text-xs text-muted-foreground">Room: {student.roomNo} • {student.mobile}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {showDropdown && filteredStudents.length === 0 && searchQuery && !selectedStudent && (
                                        <div className="absolute top-full left-0 right-0 mt-2 bg-white/90 backdrop-blur-xl border border-white/20 shadow-xl rounded-xl z-50 p-4 text-center text-muted-foreground text-sm">
                                            No students found
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label>Phone Number</Label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <Input
                                            className="pl-9 h-12 rounded-xl"
                                            placeholder="Auto-detected from search"
                                            value={msgForm.to}
                                            readOnly
                                        />
                                        {selectedStudent && <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-success" />}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Message</Label>
                                    <div className="relative">
                                        <MessageSquare className="absolute left-3 top-4 w-4 h-4 text-muted-foreground" />
                                        <Textarea className="pl-9 min-h-[120px] rounded-xl resize-none" placeholder="Type your message here..." value={msgForm.message} onChange={e => setMsgForm({ ...msgForm, message: e.target.value })} required />
                                    </div>
                                </div>

                                <Button type="submit" disabled={sendingMsg || !msgForm.to} className="w-full h-12 rounded-xl font-bold bg-primary hover:bg-primary/90 flex items-center justify-center gap-2">
                                    {sendingMsg ? <Loader className="animate-spin w-5 h-5" /> : <Send className="w-5 h-5" />}
                                    {sendingMsg ? 'Sending...' : 'Send Message'}
                                </Button>
                            </form>
                        </Card>
                    </TabsContent>

                </Tabs>
            </main>
        </div>
    );
};

export default WhatsAppBot;
