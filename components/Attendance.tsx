
import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, addDoc, query, where } from 'firebase/firestore';
import { Class, Student, AttendanceRecord } from '../types';
import { Save, CheckCircle2, Circle } from 'lucide-react';

const Attendance: React.FC = () => {
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [topic, setTopic] = useState<string>('');
  const [students, setStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchClasses = async () => {
      const snap = await getDocs(collection(db, 'classes'));
      setClasses(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Class)));
    };
    fetchClasses();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      const fetchStudents = async () => {
        const q = query(collection(db, 'students'), where('class_id', '==', selectedClass));
        const snap = await getDocs(q);
        const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Student));
        setStudents(data);
        
        // Mặc định tất cả là có mặt
        const initialAttendance: Record<string, boolean> = {};
        data.forEach(s => initialAttendance[s.id] = true);
        setAttendance(initialAttendance);
      };
      fetchStudents();
    } else {
      setStudents([]);
    }
  }, [selectedClass]);

  const toggleAttendance = (studentId: string) => {
    setAttendance(prev => ({ ...prev, [studentId]: !prev[studentId] }));
  };

  const handleSave = async () => {
    if (!selectedClass || !date) {
      alert("Vui lòng chọn lớp và ngày.");
      return;
    }

    setLoading(true);
    try {
      const attendanceList: AttendanceRecord[] = students.map(s => ({
        student_id: s.id,
        status: attendance[s.id] ? 'Present' : 'Absent'
      }));

      await addDoc(collection(db, 'sessions'), {
        class_id: selectedClass,
        date,
        topic,
        attendance_list: attendanceList
      });

      setMessage("Đã lưu điểm danh thành công!");
      setTopic('');
      setTimeout(() => setMessage(''), 3000);
    } catch (e) {
      console.error(e);
      alert("Lỗi khi lưu điểm danh.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Điểm danh lớp học</h2>
      </div>

      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-500 mb-1">Chọn lớp</label>
            <select 
              className="w-full p-3 rounded-2xl bg-slate-50 border-none outline-indigo-500 font-medium"
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
            >
              <option value="">-- Chọn lớp --</option>
              {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-500 mb-1">Ngày dạy</label>
            <input 
              type="date"
              className="w-full p-3 rounded-2xl bg-slate-50 border-none outline-indigo-500 font-medium"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-500 mb-1">Nội dung bài học (Topic)</label>
          <input 
            type="text"
            placeholder="VD: Grammar Unit 10, IELTS Speaking Part 1..."
            className="w-full p-3 rounded-2xl bg-slate-50 border-none outline-indigo-500 font-medium"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          />
        </div>
      </div>

      {selectedClass && (
        <div className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm">
          <div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
            <span className="font-bold text-slate-700">Danh sách học sinh ({students.length})</span>
            <span className="text-xs text-slate-500 italic">Click vào học sinh để đổi trạng thái</span>
          </div>
          <div className="divide-y divide-slate-100">
            {students.length === 0 ? (
              <div className="p-8 text-center text-slate-400">Không tìm thấy học sinh trong lớp này.</div>
            ) : (
              students.map(student => (
                <div 
                  key={student.id} 
                  onClick={() => toggleAttendance(student.id)}
                  className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <div className="flex flex-col">
                    <span className="font-semibold text-slate-800">{student.name}</span>
                    <span className="text-xs text-slate-400">{student.parent_phone}</span>
                  </div>
                  {attendance[student.id] ? (
                    <div className="flex items-center gap-2 text-indigo-600 font-bold">
                      <CheckCircle2 size={24} />
                      <span className="text-sm">Có mặt</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-slate-300 font-medium">
                      <Circle size={24} />
                      <span className="text-sm">Vắng</span>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {selectedClass && (
        <div className="sticky bottom-24 md:static pb-4">
          <button 
            onClick={handleSave}
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white py-4 rounded-2xl font-bold shadow-lg shadow-indigo-100 transition-all flex items-center justify-center gap-2"
          >
            {loading ? "Đang lưu..." : (
              <>
                <Save size={20} />
                Lưu điểm danh
              </>
            )}
          </button>
          {message && <p className="text-center text-emerald-600 font-semibold mt-2 animate-bounce">{message}</p>}
        </div>
      )}
    </div>
  );
};

export default Attendance;
