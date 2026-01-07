import { supabase } from '@/lib/supabase';
import { Student } from '@/types';

// Helper to map DB result (snake_case to camelCase)
const fromDbStudent = (db: any): Student => ({
    id: db.id,
    roomNo: db.room_no,
    name: db.name,
    age: db.age,
    dob: db.dob,
    mobile: db.mobile,
    email: db.email,
    degree: db.degree,
    year: db.year,
    result: db.result,
    interest: db.interest,
    isAlumni: db.is_alumni,
    createdAt: db.created_at,
});

// Helper to map Frontend object (camelCase to snake_case)
const toDbStudent = (student: Partial<Student>) => {
    const db: any = { ...student };
    if (student.roomNo !== undefined) db.room_no = student.roomNo;
    if (student.isAlumni !== undefined) db.is_alumni = student.isAlumni;
    if (student.createdAt !== undefined) db.created_at = student.createdAt;

    // Remove camelCase keys to avoid errors if strict
    delete db.roomNo;
    delete db.isAlumni;
    delete db.createdAt;

    return db;
};

export const getStudents = async (): Promise<Student[]> => {
    try {
        const { data, error } = await supabase
            .from('students')
            .select('*');

        if (error) {
            console.error('Error fetching students:', error);
            return [];
        }

        return (data || []).map(fromDbStudent);
    } catch (error) {
        console.error('Unexpected error fetching students:', error);
        return [];
    }
};

export const addStudent = async (student: Omit<Student, 'id' | 'createdAt'>) => {
    try {
        const dbPayload = toDbStudent(student);
        const { data, error } = await supabase
            .from('students')
            .insert([dbPayload])
            .select()
            .single();

        if (error) throw error;
        return fromDbStudent(data);
    } catch (error) {
        console.error('Error adding student:', error);
        throw error;
    }
};

export const updateStudent = async (id: string, updates: Partial<Student>) => {
    try {
        const dbPayload = toDbStudent(updates);
        const { data, error } = await supabase
            .from('students')
            .update(dbPayload)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return fromDbStudent(data);
    } catch (error) {
        console.error('Error updating student:', error);
        throw error;
    }
};

export const deleteStudent = async (id: string) => {
    try {
        const { error } = await supabase
            .from('students')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return true;
    } catch (error) {
        console.error('Error deleting student:', error);
        throw error;
    }
};

export const upsertStudents = async (students: Student[]) => {
    try {
        const dbPayloads = students.map(toDbStudent);
        const { data, error } = await supabase
            .from('students')
            .upsert(dbPayloads)
            .select();

        if (error) throw error;
        return (data || []).map(fromDbStudent);
    } catch (error) {
        console.error('Error upserting students:', error);
        throw error;
    }
};
