
export interface Student {
  id: string;
  name: string;
  parent_phone: string;
  default_fee: number;
  class_id: string;
}

export interface Class {
  id: string;
  name: string;
}

export interface AttendanceRecord {
  student_id: string;
  status: 'Present' | 'Absent';
}

export interface Session {
  id: string;
  class_id: string;
  date: string; // ISO String
  topic: string;
  attendance_list: AttendanceRecord[];
}

export interface Invoice {
  id: string;
  student_id: string;
  month: string; // MM/YYYY
  total_sessions: number;
  total_amount: number;
  status: 'Pending' | 'Paid';
}
