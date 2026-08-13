import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import API from '../services/api';
import { 
  X, 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  Languages, 
  Loader2, 
  HelpCircle 
} from 'lucide-react';

export default function ChatbotDrawer({ isOpen, onClose }) {
  const { language, setLanguage, t } = useLanguage();
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: t('type_message')
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  useEffect(() => {
    setMessages((prev) => [
      {
        sender: 'bot',
        text: language === 'ta' 
          ? "வணக்கம்! நான் HealthSync AI உதவியாளன். உங்கள் ஆரோக்கியம், நீரிழிவு மற்றும் இதய நோய் பற்றிய கேள்விகளைக் கேட்கலாம்."
          : (language === 'hi' 
            ? "नमस्ते! मैं HealthSync AI स्वास्थ्य सहायक हूँ। आप मुझसे अपने स्वास्थ्य, मधुमेह और हृदय जोखिम के बारे में पूछ सकते हैं।"
            : "Hello! I am HealthSync AI Assistant. Ask me any questions regarding diabetes, heart disease, clinical metrics, or preventive health.")
      }
    ]);
  }, [language]);

  const handleSend = async (textToSend) => {
    const query = textToSend || input;
    if (!query.trim() || loading) return;

    const userMsg = { sender: 'user', text: query };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await API.post('/chat', {
        message: query,
        language: language
      });
      const botMsg = { sender: 'bot', text: res.data.bot_response };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error('Chat API Error:', err);
      setMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: "I'm having trouble connecting right now. Please try again shortly."
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const quickPrompts = language === 'ta' ? [
    "என் இரத்த அழுத்தத்தைக் கட்டுப்படுத்துவது எப்படி?",
    "நீரிழிவு நோய்க்கான உணவு முறைகள் யாவை?",
    "BMI அளவு 28 என்றால் என்ன பொருள்?"
  ] : (language === 'hi' ? [
    "ब्लड प्रेशर नियंत्रित करने के उपाय क्या हैं?",
    "मधुमेह रोगियों के लिए आहार चार्ट क्या है?",
    "BMI 28 का क्या अर्थ है?"
  ] : [
    "How to lower diastolic blood pressure?",
    "Best diet for diabetes risk management?",
    "What does a BMI of 28 signify?"
  ]);

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-96 bg-white border-l border-slate-200 shadow-2xl z-50 flex flex-col transition-all">
      
      {/* Header */}
      <div className="p-4 border-b border-slate-200/80 flex items-center justify-between bg-slate-50/80">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-sm">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
              AI Health Assistant
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            </h3>
            <p className="text-[11px] text-indigo-600 font-bold">Multilingual AI (Tamil / EN / HI)</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <select 
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-white text-[11px] font-bold text-slate-700 border border-slate-200 rounded-full px-2 py-1 focus:outline-none cursor-pointer"
          >
            <option value="en">EN</option>
            <option value="ta">தமிழ்</option>
            <option value="hi">हिंदी</option>
          </select>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/40">
        {messages.map((msg, idx) => (
          <div 
            key={idx} 
            className={`flex items-start gap-2.5 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
              msg.sender === 'user' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-indigo-50 text-indigo-700 border border-indigo-100'
            }`}>
              {msg.sender === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
            </div>

            <div className={`max-w-[82%] p-3.5 rounded-2xl text-xs leading-relaxed font-medium ${
              msg.sender === 'user' 
                ? 'bg-slate-900 text-white rounded-tr-none shadow-sm' 
                : 'bg-white text-slate-800 border border-slate-200/80 rounded-tl-none shadow-sm'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-xs text-indigo-600 font-bold p-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Formulating AI response...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts */}
      <div className="px-3 py-2 bg-white border-t border-slate-200/80 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        {quickPrompts.map((qp, i) => (
          <button
            key={i}
            onClick={() => handleSend(qp)}
            className="px-3 py-1 rounded-full bg-slate-100 hover:bg-indigo-50 border border-slate-200 text-[11px] font-semibold text-slate-700 hover:text-indigo-600 whitespace-nowrap transition-colors cursor-pointer"
          >
            {qp}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <form 
        onSubmit={(e) => { e.preventDefault(); handleSend(); }}
        className="p-3 border-t border-slate-200/80 bg-white flex items-center gap-2"
      >
        <input 
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t('type_message')}
          className="flex-1 bg-slate-100 border border-slate-200 rounded-full px-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 font-medium"
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="p-2.5 rounded-full bg-slate-900 hover:bg-indigo-600 disabled:opacity-50 text-white font-bold transition-all shadow-sm cursor-pointer"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
