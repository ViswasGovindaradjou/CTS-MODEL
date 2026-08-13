import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import QuickActionModal from './QuickActionModal';
import { 
  Search, 
  Bell, 
  Languages, 
  LogOut, 
  Plus, 
  ChevronDown, 
  MessageSquareHeart,
  Calendar,
  X,
  CheckCircle2
} from 'lucide-react';

export default function Navbar({ toggleChat, unreadAlertsCount = 0 }) {
  const { user, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('Dashboard');
  const [isQuickActionOpen, setIsQuickActionOpen] = useState(false);
  const [timeframe, setTimeframe] = useState('Week');
  const [selectedDay, setSelectedDay] = useState('Tue 23');
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);

  const changeTimeframe = (newTf) => {
    setTimeframe(newTf);
    const newDays = getDaysForTimeframe(newTf);
    if (newDays.length > 0) {
      setSelectedDay(`${newDays[2].day} ${newDays[2].date}`);
    }
    window.dispatchEvent(new CustomEvent('timeframeChanged', { detail: newTf }));
  };

  const handleDateSelect = (e) => {
    const val = e.target.value;
    setSelectedDate(val);
    if (val) {
      const d = new Date(val);
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      const dayNum = d.getDate();
      setSelectedDay(`${dayName} ${dayNum}`);
    }
  };

  const getDaysForTimeframe = (tf) => {
    switch (tf) {
      case 'Last Week':
        return [
          { day: 'Sun', date: '14' },
          { day: 'Mon', date: '15' },
          { day: 'Tue', date: '16' },
          { day: 'Wed', date: '17' },
          { day: 'Thu', date: '18' },
        ];
      case 'Month':
        return [
          { day: 'W1', date: '1-7' },
          { day: 'W2', date: '8-14' },
          { day: 'W3', date: '15-21' },
          { day: 'W4', date: '22-28' },
          { day: 'W5', date: '29+' },
        ];
      case 'Today':
        return [
          { day: '8 AM', date: '72' },
          { day: '11 AM', date: '85' },
          { day: '2 PM', date: '93' },
          { day: '5 PM', date: '88' },
          { day: '8 PM', date: '80' },
        ];
      case 'Week':
      default:
        return [
          { day: 'Sun', date: '21' },
          { day: 'Mon', date: '22' },
          { day: 'Tue', date: '23' },
          { day: 'Wed', date: '24' },
          { day: 'Thu', date: '25' },
        ];
    }
  };

  const days = getDaysForTimeframe(timeframe);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const currentDateStr = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    day: 'numeric',
    month: 'short'
  });

  return (
    <header className="w-full bg-slate-100/60 backdrop-blur-md border-b border-slate-200/60 px-4 lg:px-8 py-3 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto space-y-3">
        
        {/* Main Navbar Top Row */}
        <div className="flex items-center justify-between gap-4">
          
          {/* Main Greeting & Page Title matching Reference */}
          <div>
            <p className="text-xs font-bold text-slate-500">
              Welcome to <span className="text-slate-900 font-extrabold">{user?.full_name || 'Alex'}!</span>
            </p>
            <h1 className="text-xl lg:text-2xl font-black text-slate-900 tracking-tight leading-tight mt-0.5">
              Health Monitoring
            </h1>
          </div>

          {/* Middle Navigation Pill Container matching Reference */}
          <div className="hidden md:flex items-center gap-1.5 bg-white border border-slate-200/80 p-1.5 rounded-full shadow-sm">
            <button className="p-2 rounded-full text-slate-400 hover:text-slate-700 transition-colors">
              <Search className="w-4 h-4" />
            </button>
            {['Dashboard', 'Analytics', 'Reports'].map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  if (tab === 'Dashboard') navigate('/');
                  if (tab === 'Analytics') navigate('/history');
                  if (tab === 'Reports') navigate('/prediction-history');
                }}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  activeTab === tab
                    ? 'bg-slate-100 text-slate-900'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Right Profile & Utility Actions matching Reference */}
          <div className="flex items-center gap-3">
            
            {/* Multilingual Selector */}
            <div className="flex items-center bg-white border border-slate-200/80 rounded-full px-3 py-1.5 shadow-sm">
              <Languages className="w-4 h-4 text-indigo-600 mr-1.5" />
              <select 
                value={language} 
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="en">English 🇺🇸</option>
                <option value="ta">தமிழ் 🇮🇳</option>
                <option value="hi">हिंदी 🇮🇳</option>
              </select>
            </div>

            {user && (
              <>
                {/* AI Chatbot Button */}
                <button 
                  onClick={toggleChat}
                  className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 hover:bg-indigo-100/80 text-indigo-700 text-xs font-bold transition-all cursor-pointer"
                  title={t('ask_chatbot')}
                >
                  <MessageSquareHeart className="w-4 h-4 text-indigo-600" />
                  <span className="hidden lg:inline">{t('chatbot')}</span>
                </button>

                {/* Bell Icon Notification */}
                <Link 
                  to="/alerts" 
                  className="relative p-2.5 rounded-full bg-white border border-slate-200/80 hover:bg-slate-50 text-slate-600 transition-colors shadow-sm"
                >
                  <Bell className="w-4 h-4" />
                  {unreadAlertsCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                      {unreadAlertsCount}
                    </span>
                  )}
                </Link>

                {/* Profile Card matching Reference */}
                <div className="flex items-center gap-2.5 bg-white border border-slate-200/80 pl-2 pr-3 py-1 rounded-full shadow-sm">
                  <Link to="/profile" className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                      {user.full_name ? user.full_name.charAt(0).toUpperCase() : 'A'}
                    </div>
                    <div className="text-left hidden lg:block">
                      <div className="text-xs font-extrabold text-slate-800 leading-none">
                        Hi, {user.full_name?.split(' ')[0] || 'Alex'}
                      </div>
                      <div className="text-[10px] font-medium text-slate-400 mt-0.5">
                        {currentDateStr}
                      </div>
                    </div>
                  </Link>

                  <button 
                    onClick={handleLogout}
                    className="p-1 rounded-full text-slate-400 hover:text-rose-600 transition-colors ml-1"
                    title={t('logout')}
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              </>
            )}

            {!user && (
              <div className="flex items-center gap-2">
                <Link to="/login" className="px-3.5 py-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors">
                  {t('login')}
                </Link>
                <Link to="/signup" className="px-4 py-1.5 text-xs font-extrabold bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-md transition-all">
                  {t('signup')}
                </Link>
              </div>
            )}

          </div>
        </div>

        {/* Sub-header Date Bar & Quick Action Button matching Reference */}
        {user && (
          <div className="flex items-center justify-end gap-3 pt-1 relative">
            
            {/* Interactive Calendar Button */}
            <div className="relative">
              <button 
                onClick={() => setIsCalendarOpen(!isCalendarOpen)} 
                className="p-2 rounded-full bg-white border border-slate-200/80 text-indigo-600 hover:bg-indigo-50 transition-colors shadow-sm cursor-pointer flex items-center justify-center"
                title="Select Date & Timeframe"
              >
                <Calendar className="w-4 h-4" />
              </button>

              {/* Interactive Calendar Popover Modal */}
              {isCalendarOpen && (
                <div className="absolute right-0 top-11 z-50 w-72 bg-white rounded-2xl border border-slate-200 shadow-2xl p-4 space-y-3 animate-fadeIn">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-indigo-600" />
                      Select Date & View
                    </span>
                    <button 
                      onClick={() => setIsCalendarOpen(false)}
                      className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">Custom Date Picker</label>
                    <input 
                      type="date" 
                      value={selectedDate}
                      onChange={handleDateSelect}
                      className="w-full p-2 text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                    />
                  </div>

                  <div className="space-y-1 pt-1">
                    <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">Select Timeframe</label>
                    <div className="grid grid-cols-2 gap-1.5">
                      {['Week', 'Month', 'Last Week', 'Today'].map((tf) => (
                        <button
                          key={tf}
                          onClick={() => {
                            changeTimeframe(tf);
                            setIsCalendarOpen(false);
                          }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                            timeframe === tf
                              ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                              : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          {tf}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Week Date Selector Pills matching reference */}
            <div className="flex items-center gap-1 bg-white border border-slate-200/80 p-1 rounded-full shadow-sm">
              {days.map((item) => {
                const label = `${item.day} ${item.date}`;
                const isSelected = selectedDay === label;
                return (
                  <button
                    key={label}
                    onClick={() => setSelectedDay(label)}
                    className={`flex flex-col items-center px-3 py-1 rounded-full transition-all text-[11px] cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-600 text-white font-extrabold shadow-sm'
                        : 'text-slate-600 hover:bg-slate-100 font-medium'
                    }`}
                  >
                    <span className="text-[10px] opacity-80">{item.day}</span>
                    <span className="font-bold">{item.date}</span>
                  </button>
                );
              })}
            </div>

            {/* Interactive "Week" / "Month" Dropdown Pill */}
            <div className="relative flex items-center bg-white border border-slate-200/80 px-3 py-1.5 rounded-full text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50 cursor-pointer">
              <select
                value={timeframe}
                onChange={(e) => changeTimeframe(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-700 focus:outline-none appearance-none pr-4 cursor-pointer"
              >
                <option value="Week">Week</option>
                <option value="Last Week">Last Week</option>
                <option value="Month">Month</option>
                <option value="Today">Today</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 pointer-events-none" />
            </div>

            {/* Black Circular "+" Quick Action Button matching Reference */}
            <button
              onClick={() => setIsQuickActionOpen(true)}
              className="w-9 h-9 rounded-full bg-slate-900 hover:bg-indigo-600 text-white flex items-center justify-center shadow-md transition-all transform hover:scale-105 cursor-pointer"
              title="Quick Action"
            >
              <Plus className="w-5 h-5" />
            </button>

          </div>
        )}

      </div>

      {/* Quick Action Modal Triggered by "+" Button */}
      <QuickActionModal 
        isOpen={isQuickActionOpen}
        onClose={() => setIsQuickActionOpen(false)}
        onToggleChat={toggleChat}
      />
    </header>
  );
}
