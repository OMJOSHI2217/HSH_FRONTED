import { Student, Task, Category, Activity } from '@/types';

export const mockStudents: Student[] = [
  {
    id: '1',
    roomNo: 'Admin',
    name: 'Harshil Patel',
    age: 18,
    dob: '2007-03-29',
    mobile: '+91 9876543210',
    email: 'harshil2937patel@gmail.com',
    degree: 'Hostel Admin',
    year: 'Staff',
    result: 'N/A',
    interest: 'Administration',
    isAlumni: false,
    createdAt: new Date().toISOString().split('T')[0],
  }
];

export const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Room inspection for Block A',
    dueDate: '2024-01-20',
    status: 'pending',
    category: 'Maintenance',
  },
  {
    id: '2',
    title: 'Collect monthly fees',
    dueDate: '2024-01-15',
    status: 'done',
    category: 'Finance',
  },
  {
    id: '3',
    title: 'Update student records',
    dueDate: '2024-01-25',
    status: 'pending',
    category: 'Administration',
  },
  {
    id: '4',
    title: 'Fire safety drill',
    dueDate: '2024-01-30',
    status: 'pending',
    category: 'Safety',
  },
  {
    id: '5',
    title: 'Wi-Fi maintenance',
    dueDate: '2024-01-18',
    status: 'done',
    category: 'IT',
  },
];

export const mockCategories: Category[] = [
  { id: '1', name: 'Single Room', type: 'room', description: '1 bed, AC' },
  { id: '2', name: 'Double Room', type: 'room', description: '2 beds, AC' },
  { id: '3', name: 'Triple Room', type: 'room', description: '3 beds, Non-AC' },
  { id: '4', name: 'Monthly Fee', type: 'fee', description: 'Regular monthly' },
  { id: '5', name: 'Mess Fee', type: 'fee', description: 'Food charges' },
  { id: '6', name: 'Maintenance', type: 'task', description: 'Room maintenance' },
  { id: '7', name: 'Administration', type: 'task', description: 'Admin tasks' },
];

export const mockActivities: Activity[] = [
  {
    id: '1',
    type: 'student_added',
    description: 'Amit Kumar was added to Room 103',
    timestamp: '2024-01-20T10:30:00',
  },
  {
    id: '2',
    type: 'task_created',
    description: 'New task: Room inspection for Block A',
    timestamp: '2024-01-19T15:45:00',
  },
  {
    id: '3',
    type: 'student_updated',
    description: 'Priya Patel records updated',
    timestamp: '2024-01-18T09:20:00',
  },
  {
    id: '4',
    type: 'room_updated',
    description: 'Room 105 marked as vacant',
    timestamp: '2024-01-17T14:00:00',
  },
];

export const dashboardStats = {
  totalStudents: 45,
  occupiedRooms: 38,
  vacantRooms: 12,
  alumniStudents: 15,
};
