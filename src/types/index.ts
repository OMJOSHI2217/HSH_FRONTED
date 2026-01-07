export interface Student {
  id: string;
  roomNo: string;
  name: string;
  age: number;
  dob: string;
  mobile: string;
  email: string;
  degree: string;
  year: string;
  result: string;
  interest: string;
  isAlumni: boolean;
  createdAt: string;

}

export interface Task {
  id: string;
  title: string;
  dueDate: string;
  status: 'pending' | 'done';
  assignedTo?: string; // Student ID
  assignedToName?: string;
  category?: string;
  description?: string;
  isPracticeQuestion?: boolean;
  questionContent?: string;
}

export interface Category {
  id: string;
  name: string;
  type: 'room' | 'fee' | 'task';
  description?: string;
}

export interface RoomCategory {
  id: string;
  name: string;
  capacity: number;
  price: number;
}

export interface Activity {
  id: string;
  type: 'student_added' | 'student_updated' | 'task_created' | 'room_updated';
  description: string;
  timestamp: string;
}
