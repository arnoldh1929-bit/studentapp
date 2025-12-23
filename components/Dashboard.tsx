
import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { Class, Student } from '../types';
import { Calendar, UserCheck, GraduationCap, ChevronRight } from 'lucide-react';

interface Props {
  onQuickAttendance: () => void;
}

const Dashboard: React.FC<Props> = ({ onQuickAttendance }) => {
  const [classes, setClasses] = useState<Class[]>([]);
  const [stats, setStats] = useState({ students: 0, classes: 0 });

  useEffect(() => {
    const fetchData = async () => {
      const classSnap = await getDocs(collection(db, 'classes'));
      const studentSnap = await getDocs(collection(db, 'students'));
      
      const loadedClasses = classSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Class));
      setClasses(loadedClasses);
      setStats({
        classes: classSnap.size,
        students: studentSnap.size
      });
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Chào buổi sáng, Giáo viên! 👋</h2>
          <p className="text-slate-500">Đây là tóm tắt tình hình lớp học của bạn.</p>
        </div>
        <button 
          onClick={onQuickAttendance}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl font-semibold shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2"
        >
          <UserCheck size={20} />
          Điểm danh hôm nay
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard icon={<GraduationCap className="text-blue-600" />} label="Tổng học sinh" value={stats.students} color="bg-blue-50" />
        <StatCard icon={<Calendar className="text-indigo-600" />} label="Số lớp học" value={stats.classes} color="bg-indigo-50" />
        <StatCard icon={<ReceiptText className="text-emerald-600" />} label="Tháng này" value="12/2025" color="bg-emerald-50" />
      </div>

      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold">Danh sách lớp học</h3>
          <button className="text-indigo-600 text-sm font-semibold">Xem tất cả</button>
        </div>
        
        <div className="space-y-4">
          {classes.length === 0 ? (
            <div className="text-center py-8 bg-slate-50 rounded-2xl">
              <p className="text-slate-400">Chưa có lớp học nào được tạo.</p>
            </div>
          ) : (
            classes.map(cls => (
              <div key={cls.id} className="group flex items-center justify-between p-4 rounded-2xl bg-slate-50 hover:bg-white hover:shadow-md border border-transparent hover:border-slate-100 transition-all cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-indigo-600 shadow-sm font-bold">
                    {cls.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800">{cls.name}</h4>
                    <p className="text-xs text-slate-500">Click để xem chi tiết</p>
                  </div>
                </div>
                <ChevronRight size={20} className="text-slate-300 group-hover:text-indigo-600 transition-all" />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value, color }: { icon: React.ReactNode, label: string, value: string | number, color: string }) => (
  <div className={`${color} p-4 rounded-3xl border border-white/50`}>
    <div className="bg-white/80 w-10 h-10 rounded-xl flex items-center justify-center mb-3 shadow-sm">
      {icon}
    </div>
    <p className="text-slate-500 text-xs font-medium">{label}</p>
    <p className="text-xl font-bold mt-1">{value}</p>
  </div>
);

const ReceiptText = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><path d="M12 17.5V6.5"/></svg>
);

export default Dashboard;
