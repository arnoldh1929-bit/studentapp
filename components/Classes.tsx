
import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { Class } from '../types';
import { PlusCircle, Trash2, BookOpen, AlertTriangle, X } from 'lucide-react';

const Classes: React.FC = () => {
  const [classes, setClasses] = useState<Class[]>([]);
  const [name, setName] = useState('');
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; classId: string | null; className: string }>({
    isOpen: false,
    classId: null,
    className: ''
  });

  const fetchClasses = async () => {
    const snap = await getDocs(collection(db, 'classes'));
    setClasses(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Class)));
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    await addDoc(collection(db, 'classes'), { name });
    setName('');
    fetchClasses();
  };

  const confirmDelete = (cls: Class) => {
    setDeleteModal({
      isOpen: true,
      classId: cls.id,
      className: cls.name
    });
  };

  const executeDelete = async () => {
    if (deleteModal.classId) {
      try {
        await deleteDoc(doc(db, 'classes', deleteModal.classId));
        setDeleteModal({ isOpen: false, classId: null, className: '' });
        fetchClasses();
      } catch (error) {
        console.error("Error deleting class:", error);
        alert("Không thể xóa lớp học này.");
      }
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">Quản lý lớp học</h2>

      <form onSubmit={handleAdd} className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex gap-2">
        <input 
          type="text" 
          placeholder="Tên lớp (VD: IELTS 6.5 T2-4-6)" 
          className="flex-1 p-3 rounded-2xl bg-slate-50 border-none outline-indigo-500 font-medium"
          value={name}
          onChange={e => setName(e.target.value)}
        />
        <button type="submit" className="bg-indigo-600 text-white p-3 rounded-2xl shadow-md hover:bg-indigo-700 transition-colors">
          <PlusCircle size={24} />
        </button>
      </form>

      <div className="grid grid-cols-1 gap-4">
        {classes.map(cls => (
          <div key={cls.id} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between group animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                <BookOpen size={24} />
              </div>
              <span className="font-bold text-slate-700 text-lg">{cls.name}</span>
            </div>
            <button 
              onClick={() => confirmDelete(cls)}
              className="p-3 text-red-100 group-hover:text-red-400 hover:bg-red-50 hover:text-red-500 rounded-2xl transition-all"
              title="Xóa lớp học"
            >
              <Trash2 size={20} />
            </button>
          </div>
        ))}
        {classes.length === 0 && (
          <div className="text-center py-12 text-slate-400 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
            Chưa có lớp học nào.
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center text-red-500">
                <AlertTriangle size={24} />
              </div>
              <button 
                onClick={() => setDeleteModal({ ...deleteModal, isOpen: false })}
                className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
              >
                <X size={20} className="text-slate-400" />
              </button>
            </div>
            
            <h3 className="text-xl font-bold text-slate-800 mb-2">Xác nhận xóa lớp?</h3>
            <p className="text-slate-500 text-sm mb-6">
              Bạn có chắc chắn muốn xóa lớp <span className="font-bold text-slate-700">"{deleteModal.className}"</span>? 
              Học sinh trong lớp vẫn sẽ được giữ lại nhưng thông tin phân lớp của họ sẽ bị mất.
            </p>

            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => setDeleteModal({ ...deleteModal, isOpen: false })}
                className="p-3 rounded-2xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                Hủy bỏ
              </button>
              <button 
                onClick={executeDelete}
                className="p-3 rounded-2xl font-bold text-white bg-red-500 hover:bg-red-600 transition-colors shadow-lg shadow-red-100"
              >
                Xác nhận xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Classes;
