
import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  ClipboardCheck, 
  ReceiptText, 
  Users, 
  Settings as SettingsIcon,
  Plus
} from 'lucide-react';
import Dashboard from './components/Dashboard';
import Attendance from './components/Attendance';
import Billing from './components/Billing';
import Students from './components/Students';
import Classes from './components/Classes';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'attendance' | 'billing' | 'students' | 'classes'>('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard onQuickAttendance={() => setActiveTab('attendance')} />;
      case 'attendance':
        return <Attendance />;
      case 'billing':
        return <Billing />;
      case 'students':
        return <Students />;
      case 'classes':
        return <Classes />;
      default:
        return <Dashboard onQuickAttendance={() => setActiveTab('attendance')} />;
    }
  };

  return (
    <div className="min-h-screen pb-24 md:pb-0 md:pl-64">
      {/* Mobile Top Header */}
      <header className="md:hidden flex items-center justify-between p-4 bg-white border-b sticky top-0 z-20">
        <h1 className="text-xl font-bold text-indigo-600">EngClass</h1>
        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
          <SettingsIcon size={18} />
        </div>
      </header>

      {/* Sidebar Navigation (Desktop) */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r h-screen fixed left-0 top-0 z-30">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-indigo-600 tracking-tight">EngClass Manager</h1>
          <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest font-semibold">Teacher Dashboard</p>
        </div>
        <nav className="flex-1 px-4 space-y-2">
          <NavItem 
            icon={<LayoutDashboard size={20} />} 
            label="Tổng quan" 
            isActive={activeTab === 'dashboard'} 
            onClick={() => setActiveTab('dashboard')} 
          />
          <NavItem 
            icon={<ClipboardCheck size={20} />} 
            label="Điểm danh" 
            isActive={activeTab === 'attendance'} 
            onClick={() => setActiveTab('attendance')} 
          />
          <NavItem 
            icon={<ReceiptText size={20} />} 
            label="Tính học phí" 
            isActive={activeTab === 'billing'} 
            onClick={() => setActiveTab('billing')} 
          />
          <div className="pt-4 pb-2">
            <p className="text-xs font-semibold text-slate-400 px-3 uppercase">Quản lý</p>
          </div>
          <NavItem 
            icon={<Users size={20} />} 
            label="Học sinh" 
            isActive={activeTab === 'students'} 
            onClick={() => setActiveTab('students')} 
          />
          <NavItem 
            icon={<Plus size={20} />} 
            label="Lớp học" 
            isActive={activeTab === 'classes'} 
            onClick={() => setActiveTab('classes')} 
          />
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="max-w-5xl mx-auto p-4 md:p-8 animate-in fade-in duration-500">
        {renderContent()}
      </main>

      {/* Mobile Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around p-2 z-40">
        <MobileNavItem 
          icon={<LayoutDashboard size={24} />} 
          isActive={activeTab === 'dashboard'} 
          onClick={() => setActiveTab('dashboard')} 
        />
        <MobileNavItem 
          icon={<ClipboardCheck size={24} />} 
          isActive={activeTab === 'attendance'} 
          onClick={() => setActiveTab('attendance')} 
        />
        <MobileNavItem 
          icon={<ReceiptText size={24} />} 
          isActive={activeTab === 'billing'} 
          onClick={() => setActiveTab('billing')} 
        />
        <MobileNavItem 
          icon={<Users size={24} />} 
          isActive={activeTab === 'students'} 
          onClick={() => setActiveTab('students')} 
        />
      </nav>
    </div>
  );
};

const NavItem = ({ icon, label, isActive, onClick }: { icon: React.ReactNode, label: string, isActive: boolean, onClick: () => void }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
      isActive ? 'bg-indigo-50 text-indigo-600 font-semibold' : 'text-slate-600 hover:bg-slate-50'
    }`}
  >
    {icon}
    <span>{label}</span>
  </button>
);

const MobileNavItem = ({ icon, isActive, onClick }: { icon: React.ReactNode, isActive: boolean, onClick: () => void }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center p-2 rounded-xl transition-all ${
      isActive ? 'text-indigo-600 bg-indigo-50' : 'text-slate-400'
    }`}
  >
    {icon}
  </button>
);

export default App;
