import { useState } from 'react';
import { Plus, CheckCircle2, CircleDashed, ClipboardList } from 'lucide-react';
import { AppHeader } from '@/components/AppHeader';
import { TaskItem } from '@/components/TaskItem';
import { Button } from '@/components/ui/button';
import { Task } from '@/types';
import { Input } from '@/components/ui/input';
import { CreateTaskDialog } from '@/components/CreateTaskDialog';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';
const Tasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'done'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const toggleTask = (taskId: string) => {
    setTasks(prev =>
      prev.map(task =>
        task.id === taskId
          ? { ...task, status: task.status === 'pending' ? 'done' : 'pending' }
          : task
      )
    );
  };

  const filteredTasks = tasks.filter(task => {
    const matchesFilter = filter === 'all' ? true : task.status === filter;
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleCreateTask = (newTask: Task) => {
    setTasks(prev => [newTask, ...prev]);
  };

  const pendingCount = tasks.filter(t => t.status === 'pending').length;
  const doneCount = tasks.filter(t => t.status === 'done').length;

  return (
    <div className="min-h-screen bg-background pb-20 relative animate-fade-in">
      <AppHeader title="Hostel Hub" />

      <main className="p-4 md:p-6 space-y-8 max-w-5xl mx-auto">
        {/* Header Section */}
        <div className="space-y-1">
          <h2 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-3">
            <ClipboardList className="w-8 h-8 text-primary" />
            Tasks
          </h2>
          <p className="text-muted-foreground font-medium uppercase tracking-widest text-xs">Stay on top of your responsibilities</p>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 h-14 bg-white border-border/50 rounded-2xl shadow-soft focus:ring-primary/20 focus:border-primary transition-all text-base"
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-5 bg-white border border-border/50 rounded-2xl shadow-soft flex items-center gap-4 transition-all hover:shadow-soft-lg">
            <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center">
              <CircleDashed className="w-6 h-6 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-extrabold text-foreground">{pendingCount}</p>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Pending</p>
            </div>
          </div>
          <div className="p-5 bg-white border border-border/50 rounded-2xl shadow-soft flex items-center gap-4 transition-all hover:shadow-soft-lg">
            <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-success" />
            </div>
            <div>
              <p className="text-2xl font-extrabold text-foreground">{doneCount}</p>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Completed</p>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex p-1.5 bg-muted/30 backdrop-blur-sm rounded-2xl border border-border/50 shadow-sm w-full sm:w-max">
          {(['all', 'pending', 'done'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-8 py-2.5 text-sm font-bold rounded-xl transition-all duration-300 capitalize min-w-[100px]",
                filter === f
                  ? "bg-primary text-white shadow-soft"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/50"
              )}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Task List */}
        <div className="space-y-4 mb-20">
          {filteredTasks.length > 0 ? (
            filteredTasks.map((task, index) => (
              <div
                key={task.id}
                className="animate-slide-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <TaskItem
                  task={task}
                  onToggle={() => toggleTask(task.id)}
                />
              </div>
            ))
          ) : (
            <div className="text-center py-20 bg-white/50 border border-dashed border-border rounded-3xl animate-fade-in flex flex-col items-center justify-center gap-3">
              <div className="w-20 h-20 bg-muted/20 rounded-full flex items-center justify-center">
                <ClipboardList className="w-10 h-10 text-muted-foreground/30" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground">No tasks found</h3>
                <p className="text-muted-foreground mt-1">Try switching filters or add a new task</p>
              </div>
            </div>
          )}
        </div>

        <Button
          className="fixed bottom-8 right-8 w-16 h-16 rounded-2xl shadow-soft-lg bg-primary hover:bg-primary/90 hover:scale-[1.1] active:scale-[0.9] transition-all z-50 group"
          size="icon"
          onClick={() => setShowCreateDialog(true)}
        >
          <Plus className="w-8 h-8 group-hover:rotate-90 transition-transform duration-300" />
        </Button>

        <CreateTaskDialog
          open={showCreateDialog}
          onOpenChange={setShowCreateDialog}
          onTaskCreate={handleCreateTask}
        />
      </main>
    </div >
  );
};

export default Tasks;
