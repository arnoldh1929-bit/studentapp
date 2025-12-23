
import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { Student, Class } from '../types';
import { UserPlus, Trash2, Edit2, X, Check, Filter } from 'lucide-react';

const Students: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingFeeId, setEditingFeeId] = useState<string | null>(null);
  const [tempFeeValue, setTempFeeValue] = useState<number>(0);
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>('all');

  const [formData, setFormData] = useState({
    name: '',
    parent_phone: '',
    default_fee: 150000,
    class_id: ''
  });

  const fetchData = async () => {
    const sSnap = await getDocs(collection(db, 'students'));
    const cSnap = await getDocs(collection(db, 'classes'));
    setStudents(sSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Student)));
    setClasses(cSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Class)));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.class_id) return;
    
    await addDoc(collection(db, 'students'), formData);
    setFormData({ name: '', parent_phone: '', default_fee: 150000, class_id: '' });
    setIsAdding(false);
    fetchData();
  };

  const handleDelete = async (id: string) => {
    if (confirm("Xác nhận xóa học sinh này?")) {
      await deleteDoc(doc(db, 'students', id));
      fetchData();
    }
  };

  const startEditingFee = (student: Student) => {
    setEditingFeeId(student.id);
    setTempFeeValue(student.default_fee);
  };

  const cancelEditingFee = () => {
    setEditingFeeId(null);
  };

  const saveFeeUpdate = async (id: string) => {
    setIsUpdating(true);
    try {
      await updateDoc(doc(db, 'students', id), {
        default_fee: tempFeeValue
      });
      setEditingFeeId(null);
      await fetchData();
    } catch (error) {
      console.error("Error updating fee:", error);
      alert("Không thể cập nhật học phí.");
    } finally {
      setIsUpdating(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const filteredStudents = selectedClassFilter === 'all' 
    ? students 
    : students.filter(s => s.class_id === selectedClassFilter);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-slate-800">Quản lý học sinh</h2>
        <div className="flex items-center gap-3">
          <div className="relative flex-1 sm:flex-initial">
            <select 
              className="w-full sm:w-48 appearance-none pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-sm"
              value={selectedClassFilter}
              onChange={(e) => setSelectedClassFilter(e.target.value)}
            >
              <option value="all">Tất cả lớp</option>
              {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
          <button 
            onClick={() => setIsAdding(!isAdding)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-all shadow-md whitespace-nowrap"
          >
            {isAdding ? <X size={20} /> : <UserPlus size={20} />}
            <span className="hidden sm:inline">{isAdding ? "Hủy" : "Thêm mới"}</span>
            <span className="sm:hidden">{isAdding ? "" : ""}</span>
          </button>
        </div>
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-lg animate-in slide-in-from-top-4 duration-300">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Tên học sinh</label>
              <input 
                type="text" 
                required
                className="w-full p-3 rounded-2xl bg-slate-50 border-none outline-indigo-500 font-medium"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Số điện thoại PH</label>
              <input 
                type="tel" 
                className="w-full p-3 rounded-2xl bg-slate-50 border-none outline-indigo-500 font-medium"
                value={formData.parent_phone}
                onChange={e => setFormData({...formData, parent_phone: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Lớp</label>
              <select 
                required
                className="w-full p-3 rounded-2xl bg-slate-50 border-none outline-indigo-500 font-medium"
                value={formData.class_id}
                onChange={e => setFormData({...formData, class_id: e.target.value})}
              >
                <option value="">-- Chọn lớp --</option>
                {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Học phí / Buổi</label>
              <input 
                type="number" 
                className="w-full p-3 rounded-2xl bg-slate-50 border-none outline-indigo-500 font-medium"
                value={formData.default_fee}
                onChange={e => setFormData({...formData, default_fee: Number(e.target.value)})}
              />
            </div>
          </div>
          <button type="submit" className="mt-6 w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-indigo-100">
            Lưu học sinh
          </button>
        </form>
      )}

      <div className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Họ tên</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider hidden md:table-cell">Lớp</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider hidden lg:table-cell">Điện thoại</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Học phí/buổi</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredStudents.length === 0 ? (
              <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-400">Không có học sinh nào thỏa mãn bộ lọc.</td></tr>
            ) : (
              filteredStudents.map(s => (
                <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-semibold text-slate-700">
                    <div>
                      {s.name}
                      <p className="text-[10px] text-slate-400 md:hidden">{classes.find(c => c.id === s.class_id)?.name}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-500 hidden md:table-cell">
                    {classes.find(c => c.id === s.class_id)?.name || "Chưa xếp lớp"}
                  </td>
                  <td className="px-6 py-4 text-slate-500 hidden lg:table-cell">{s.parent_phone}</td>
                  <td className="px-6 py-4">
                    {editingFeeId === s.id ? (
                      <div className="flex items-center gap-1 animate-in zoom-in-95 duration-200">
                        <input 
                          type="number"
                          autoFocus
                          className="w-24 p-1.5 rounded-lg bg-white border border-indigo-300 outline-none text-sm font-bold text-indigo-600"
                          value={tempFeeValue}
                          onChange={(e) => setTempFeeValue(Number(e.target.value))}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') saveFeeUpdate(s.id);
                            if (e.key === 'Escape') cancelEditingFee();
                          }}
                        />
                        <button 
                          onClick={() => saveFeeUpdate(s.id)}
                          disabled={isUpdating}
                          className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                          title="Lưu"
                        >
                          <Check size={16} />
                        </button>
                        <button 
                          onClick={cancelEditingFee}
                          disabled={isUpdating}
                          className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Hủy"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <div 
                        onClick={() => startEditingFee(s)}
                        className="group flex items-center gap-2 cursor-pointer hover:text-indigo-600 transition-colors"
                        title="Click để sửa học phí"
                      >
                        <span className="font-bold text-slate-600 group-hover:text-indigo-600">
                          {formatCurrency(s.default_fee)}
                        </span>
                        <Edit2 size={12} className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400" />
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => handleDelete(s.id)} className="p-2 text-red-400 hover:bg-red-50 hover:text-red-600 rounded-lg transition-all" title="Xóa học sinh">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Students;
