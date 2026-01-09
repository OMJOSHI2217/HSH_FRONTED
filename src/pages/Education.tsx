import { useState, useEffect } from 'react';
import { AppHeader } from '@/components/AppHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Video, Link as LinkIcon, Plus, Trash2, Send, Search, Users, Filter, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { getEducationResources, addEducationResource, deleteEducationResource, getStudents, getCategories, EducationResource, Karyakarta } from '@/lib/store';
import { Student } from '@/types';
import api from '@/lib/api';

export default function Education() {
    // Data State
    const [resources, setResources] = useState<EducationResource[]>([]);
    const [students, setStudents] = useState<Student[]>([]);
    const [karyakartas, setKaryakartas] = useState<Karyakarta[]>([]);
    const [loading, setLoading] = useState(true);

    // Filter/Selection State
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
    const [selectedStudentIds, setSelectedStudentIds] = useState<Set<string>>(new Set());
    const [selectedResourceId, setSelectedResourceId] = useState<string | null>(null);
    const [sending, setSending] = useState(false);

    // New Resource State
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [newTitle, setNewTitle] = useState("");
    const [newType, setNewType] = useState<'video' | 'link'>('link');
    const [newUrl, setNewUrl] = useState("");
    const [newDesc, setNewDesc] = useState("");

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [resData, studData, catData] = await Promise.all([
                getEducationResources(),
                getStudents(),
                getCategories()
            ]);
            setResources(resData);
            setStudents(studData);
            setKaryakartas(catData);
        } catch (error) {
            toast.error("Failed to load data");
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async () => {
        if (!newTitle || !newUrl) {
            toast.error("Title and URL are required");
            return;
        }

        try {
            const added = await addEducationResource({
                title: newTitle,
                type: newType,
                url: newUrl,
                description: newDesc
            });
            setResources([added, ...resources]);
            setIsAddOpen(false);
            setNewTitle("");
            setNewUrl("");
            setNewDesc("");
            toast.success("Resource added");
        } catch (error) {
            toast.error("Failed to add resource");
        }
    };

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm("Are you sure?")) return;

        try {
            await deleteEducationResource(id);
            setResources(resources.filter(r => r.id !== id));
            if (selectedResourceId === id) setSelectedResourceId(null);
            toast.success("Resource deleted");
        } catch (error) {
            toast.error("Failed to delete resource");
        }
    };

    const filteredStudents = students.filter(s => {
        const matchesSearch = !s.isAlumni && (
            s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.roomNo.toString().includes(searchQuery)
        );
        if (!matchesSearch) return false;

        if (selectedGroupId) {
            const group = karyakartas.find(k => k.id === selectedGroupId);
            return group?.studentIds.includes(s.id) || false;
        }
        return true;
    });

    const toggleSelection = (id: string) => {
        const newSet = new Set(selectedStudentIds);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setSelectedStudentIds(newSet);
    };

    const toggleSelectAll = () => {
        if (selectedStudentIds.size === filteredStudents.length) setSelectedStudentIds(new Set());
        else setSelectedStudentIds(new Set(filteredStudents.map(s => s.id)));
    };

    const handleSend = async () => {
        const resource = resources.find(r => r.id === selectedResourceId);
        if (!resource || selectedStudentIds.size === 0) {
            toast.error("Select a resource and students");
            return;
        }

        setSending(true);
        const recipients = students.filter(s => selectedStudentIds.has(s.id));
        let successCount = 0;

        const message = `📚 *New Education Resource*\n\n*${resource.title}*\n${resource.description ? resource.description + '\n' : ''}\n🔗 ${resource.url}`;

        console.log("🚀 Recipients:", recipients);
        let skippedCount = 0;

        for (const student of recipients) {
            if (!student.mobile) {
                console.warn(`Skipping student ${student.name} (No Mobile)`);
                skippedCount++;
                continue;
            }
            try {
                console.log(`Sending to ${student.name} (${student.mobile})`);
                await api.post('/api/send', { number: student.mobile, message });
                successCount++;
            } catch (e: any) {
                console.error(`Failed to send to ${student.name}:`, e);
                const errMsg = e.response?.data?.message || e.message;
                toast.error(`Failed to send to ${student.name}: ${errMsg}`);
            }
        }

        setSending(false);
        if (successCount > 0) toast.success(`Sent to ${successCount} students`);
        if (skippedCount > 0) toast.warning(`Skipped ${skippedCount} students (No Mobile Number)`);

        setSelectedStudentIds(new Set());
    };

    return (
        <div className="min-h-screen bg-background relative animate-fade-in flex flex-col pb-20">
            <AppHeader title="Education" />

            <main className="flex-1 p-4 md:p-6 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* Left: Resources List (4 cols) */}
                <div className="lg:col-span-4 space-y-4 flex flex-col h-[calc(100vh-8rem)]">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <BookOpen className="w-5 h-5 text-primary" />
                            Resources
                        </h2>
                        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                            <DialogTrigger asChild>
                                <Button size="sm" className="gap-1"><Plus className="w-4 h-4" /> Add</Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Add Resource</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                    <Input placeholder="Title" value={newTitle} onChange={e => setNewTitle(e.target.value)} />
                                    <Select value={newType} onValueChange={(v: any) => setNewType(v)}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="link">Link</SelectItem>
                                            <SelectItem value="video">Video</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <Input placeholder="URL" value={newUrl} onChange={e => setNewUrl(e.target.value)} />
                                    <Textarea placeholder="Description (Optional)" value={newDesc} onChange={e => setNewDesc(e.target.value)} />
                                    <Button onClick={handleAdd} className="w-full">Save Resource</Button>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                        {loading ? <div className="text-center py-10"><Loader2 className="animate-spin mx-auto" /></div> :
                            resources.length === 0 ? <p className="text-muted-foreground text-center py-10">No resources found</p> :
                                resources.map(res => (
                                    <div
                                        key={res.id}
                                        onClick={() => setSelectedResourceId(res.id)}
                                        className={`p-4 rounded-xl border cursor-pointer transition-all hover:shadow-md ${selectedResourceId === res.id ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'bg-white border-border/50'}`}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-2">
                                                {res.type === 'video' ? <Video className="w-4 h-4 text-blue-500" /> : <LinkIcon className="w-4 h-4 text-orange-500" />}
                                                <h3 className="font-semibold line-clamp-1">{res.title}</h3>
                                            </div>
                                            <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:bg-destructive/10" onClick={(e) => handleDelete(res.id, e)}>
                                                <Trash2 className="w-3 h-3" />
                                            </Button>
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{res.description || res.url}</p>
                                    </div>
                                ))}
                    </div>
                </div>

                {/* Right: Send Panel (8 cols) */}
                <div className="lg:col-span-8 flex flex-col h-[calc(100vh-8rem)] glass-card rounded-2xl border-white/40 shadow-soft overflow-hidden">
                    <div className="p-4 border-b bg-white/50 flex items-center justify-between">
                        <div>
                            <h2 className="font-bold text-lg">Send Resource</h2>
                            <p className="text-xs text-muted-foreground">Select students to share the selected resource with</p>
                        </div>
                        {selectedResourceId ? (
                            <Badge variant="default" className="bg-primary/10 text-primary hover:bg-primary/20">
                                Selected: {resources.find(r => r.id === selectedResourceId)?.title}
                            </Badge>
                        ) : (
                            <Badge variant="destructive" className="opacity-50">No Resource Selected</Badge>
                        )}
                    </div>

                    {/* Filters */}
                    <div className="p-4 flex gap-2 border-b bg-slate-50/50">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input placeholder="Search students..." className="pl-9 h-9" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                        </div>
                        <Select value={selectedGroupId || "all"} onValueChange={v => setSelectedGroupId(v === "all" ? null : v)}>
                            <SelectTrigger className="w-[180px] h-9">
                                <SelectValue placeholder="Filter Group" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Students</SelectItem>
                                {karyakartas.filter(k => k.type === 'main').map(g => (
                                    <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Button variant="outline" size="sm" onClick={toggleSelectAll} className="h-9">
                            {selectedStudentIds.size === filteredStudents.length ? "Deselect All" : "Select All"}
                        </Button>
                    </div>

                    {/* Student List */}
                    <div className="flex-1 overflow-y-auto p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-3 content-start">
                        {filteredStudents.map(student => (
                            <div
                                key={student.id}
                                onClick={() => toggleSelection(student.id)}
                                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${selectedStudentIds.has(student.id) ? "bg-primary/5 border-primary" : "bg-white border-transparent hover:bg-slate-50"}`}
                            >
                                <Checkbox checked={selectedStudentIds.has(student.id)} />
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-sm truncate">{student.name}</p>
                                    <p className="text-xs text-muted-foreground">Room: {student.roomNo}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Footer Send Action */}
                    <div className="p-4 border-t bg-white flex justify-between items-center">
                        <p className="text-sm font-medium text-muted-foreground">
                            {selectedStudentIds.size} students selected
                        </p>
                        <Button
                            onClick={handleSend}
                            disabled={sending || !selectedResourceId || selectedStudentIds.size === 0}
                            className="gap-2 shadow-lg hover:shadow-xl transition-all"
                        >
                            {sending ? <Loader2 className="animate-spin w-4 h-4" /> : <Send className="w-4 h-4" />}
                            Send via WhatsApp
                        </Button>
                    </div>
                </div>
            </main>
        </div>
    );
}
