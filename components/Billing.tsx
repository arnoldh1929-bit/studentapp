
import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, query, where, Timestamp } from 'firebase/firestore';
import { Student, Session, Class } from '../types';
import { Search, Download, Share2, Receipt, CreditCard } from 'lucide-react';

const Billing: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [month, setMonth] = useState<string>(`${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`);
  const [billData, setBillData] = useState<{
    sessions: Session[],
    totalAmount: number,
    student: Student | null
  } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchStudents = async () => {
      const snap = await getDocs(collection(db, 'students'));
      setStudents(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Student)));
    };
    fetchStudents();
  }, []);

  const calculateBill = async () => {
    if (!selectedStudent || !month) return;
    setLoading(true);
    
    try {
      const student = students.find(s => s.id === selectedStudent) || null;
      if (!student) return;

      const sessionsSnap = await getDocs(collection(db, 'sessions'));
      const allSessions = sessionsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Session));
      
      const filteredSessions = allSessions.filter(session => {
        const sessionDate = new Date(session.date);
        const [targetYear, targetMonth] = month.split('-').map(Number);
        
        const isSameMonth = sessionDate.getFullYear() === targetYear && (sessionDate.getMonth() + 1) === targetMonth;
        const isPresent = session.attendance_list.some(a => a.student_id === selectedStudent && a.status === 'Present');
        
        return isSameMonth && isPresent;
      });

      const totalAmount = filteredSessions.length * student.default_fee;
      setBillData({
        sessions: filteredSessions.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
        totalAmount,
        student
      });
    } catch (e) {
      console.error(e);
      alert("Có lỗi xảy ra khi tính tiền.");
    } finally {
      setLoading(false);
    }
  };

  const getQRLink = () => {
    if (!billData) return '';
    const bankId = "MB"; // Ngân hàng Quân Đội
    const accountNo = "0987654321"; // STK mẫu
    const amount = billData.totalAmount;
    const content = encodeURIComponent(`HOC PHI THANG ${month} ${billData.student?.name.toUpperCase()}`);
    return `https://img.vietqr.io/image/${bankId}-${accountNo}-compact.png?amount=${amount}&addInfo=${content}`;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold">Phiếu báo học phí</h2>
      </div>

      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-slate-500 mb-1">Tháng tính tiền</label>
          <input 
            type="month"
            className="w-full p-3 rounded-2xl bg-slate-50 border-none outline-indigo-500 font-medium"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
          />
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium text-slate-500 mb-1">Chọn học sinh</label>
          <select 
            className="w-full p-3 rounded-2xl bg-slate-50 border-none outline-indigo-500 font-medium"
            value={selectedStudent}
            onChange={(e) => setSelectedStudent(e.target.value)}
          >
            <option value="">-- Chọn học sinh --</option>
            {students.map(s => <option key={s.id} value={s.id}>{s.name} ({s.parent_phone})</option>)}
          </select>
        </div>
        <div className="flex items-end">
          <button 
            onClick={calculateBill}
            disabled={loading || !selectedStudent}
            className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white px-8 py-3 rounded-2xl font-bold shadow-lg shadow-indigo-100 transition-all flex items-center justify-center gap-2"
          >
            <Search size={20} />
            {loading ? "Đang tính..." : "Tính tiền"}
          </button>
        </div>
      </div>

      {billData && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in slide-in-from-bottom-4 duration-500">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-xl relative overflow-hidden">
              {/* Header Bill */}
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h3 className="text-2xl font-extrabold text-slate-800">HÓA ĐƠN HỌC PHÍ</h3>
                  <p className="text-slate-400 text-sm mt-1">Học sinh: <span className="text-slate-700 font-bold">{billData.student?.name}</span></p>
                  <p className="text-slate-400 text-sm">Tháng: <span className="text-indigo-600 font-bold">{month}</span></p>
                </div>
                <Receipt className="text-indigo-100 w-16 h-16" />
              </div>

              {/* Table Body */}
              <div className="space-y-4">
                <div className="flex text-xs font-bold text-slate-400 uppercase tracking-wider px-2">
                  <div className="w-1/3">Ngày học</div>
                  <div className="flex-1">Nội dung</div>
                  <div className="w-1/4 text-right">Đơn giá</div>
                </div>
                <div className="space-y-2">
                  {billData.sessions.map((session, idx) => (
                    <div key={session.id} className="flex items-center p-3 rounded-xl bg-slate-50 text-sm">
                      <div className="w-1/3 font-semibold">{new Date(session.date).toLocaleDateString('vi-VN')}</div>
                      <div className="flex-1 text-slate-500 italic">{session.topic || "Nội dung học tập"}</div>
                      <div className="w-1/4 text-right font-bold">{formatCurrency(billData.student?.default_fee || 0)}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer Total */}
              <div className="mt-8 pt-6 border-t border-dashed border-slate-200 flex justify-between items-center">
                <div className="text-slate-500 font-medium">Tổng số buổi: <span className="text-slate-800 font-bold">{billData.sessions.length}</span></div>
                <div className="text-right">
                  <p className="text-sm text-slate-500 font-medium uppercase tracking-widest">Tổng cộng</p>
                  <p className="text-3xl font-black text-indigo-600">{formatCurrency(billData.totalAmount)}</p>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 p-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all">
                <Download size={20} />
                Lưu PDF
              </button>
              <button className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-100 transition-all">
                <Share2 size={20} />
                Gửi phụ huynh
              </button>
            </div>
          </div>

          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-lg text-center">
              <h4 className="font-bold text-slate-800 mb-4 flex items-center justify-center gap-2">
                <CreditCard size={20} className="text-indigo-600" />
                Quét mã chuyển khoản
              </h4>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-4 inline-block">
                <img 
                  src={getQRLink()} 
                  alt="VietQR Payment" 
                  className="w-full max-w-[240px] mx-auto rounded-lg shadow-sm"
                />
              </div>
              <p className="text-xs text-slate-500 px-4">Phụ huynh có thể quét mã VietQR trên bằng ứng dụng ngân hàng để thanh toán nhanh.</p>
              
              <div className="mt-6 pt-6 border-t border-slate-100 text-left">
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-2">Thông tin tài khoản</p>
                <div className="space-y-1">
                  <p className="text-sm flex justify-between">
                    <span className="text-slate-500">Ngân hàng:</span>
                    <span className="font-bold">MB Bank</span>
                  </p>
                  <p className="text-sm flex justify-between">
                    <span className="text-slate-500">Số tài khoản:</span>
                    <span className="font-bold">0987654321</span>
                  </p>
                  <p className="text-sm flex justify-between">
                    <span className="text-slate-500">Chủ TK:</span>
                    <span className="font-bold">NGUYEN VAN A</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Billing;
