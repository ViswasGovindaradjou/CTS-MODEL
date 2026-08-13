import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import API from '../services/api';
import { 
  Bot, 
  User, 
  Send, 
  Sparkles, 
  Trash2, 
  Loader2, 
  Mic,
  MessageSquareHeart,
  Globe
} from 'lucide-react';

export default function ChatPage() {
  const { language, setLanguage, t } = useLanguage();
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: t('type_message'),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
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
        id: Date.now(),
        sender: 'bot',
        text: language === 'ta' 
          ? "வணக்கம்! நான் AuraHealth AI சுகாதார உதவியாளன். உங்கள் ஆரோக்கியம், நீரிழிவு நோய் மற்றும் இதய நோய் அபாயம் பற்றிய கேள்விகளைக் கேட்கலாம்."
          : (language === 'hi' 
            ? "नमस्ते! मैं AuraHealth AI स्वास्थ्य सहायक हूँ। आप मुझसे अपने स्वास्थ्य, मधुमेह और हृदय जोखिम के बारे में पूछ सकते हैं।"
            : "Hello! I am AuraHealth AI, your personalized healthcare companion. Ask me any questions regarding diabetes, heart disease, metrics, or preventive health."),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  }, [language]);

  const handleSend = async (textToSend) => {
    const query = textToSend || input;
    if (!query.trim() || loading) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await API.post('/chat', {
        message: query,
        language: language
      });

      const botMsg = {
        id: Date.now() + 1,
        sender: 'bot',
        text: res.data.bot_response,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error('Chat API Error:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'bot',
          text: "I am having trouble connecting right now. Please try again shortly.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: Date.now(),
        sender: 'bot',
        text: t('type_message'),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = language === 'ta' ? 'ta-IN' : (language === 'hi' ? 'hi-IN' : 'en-US');

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
    };

    recognition.start();
  };

  const quickPrompts = language === 'ta' ? [
    "என் இரத்த அழுத்தத்தைக் கட்டுப்படுத்துவது எப்படி?",
    "நீரிழிவு நோய்க்கான சிறந்த உணவு முறை யாவை?",
    "BMI அளவு 26.8 என்றால் என்ன பொருள்?"
  ] : (language === 'hi' ? [
    "ब्लड प्रेशर नियंत्रित करने के उपाय क्या हैं?",
    "मधुमेह रोगियों के लिए आहार चार्ट क्या है?",
    "BMI 26.8 का क्या अर्थ है?"
  ] : [
    "How to lower diastolic blood pressure naturally?",
    "Best low-glycemic diet for diabetes management?",
    "What does a BMI of 26.8 signify?"
  ]);

  return (
    <div className="space-y-4 max-w-4xl mx-auto flex flex-col h-[calc(100vh-120px)] pb-6">
      
      {/* Header Bar */}
      <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-sm">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-base font-black text-slate-900 flex items-center gap-2">
              {t('ai_health_assistant')}
              <Sparkles className="w-4 h-4 text-amber-500" />
            </h1>
            <p className="text-xs text-slate-500 font-medium">{t('chat_subtitle')}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center bg-slate-100 border border-slate-200 rounded-full px-3 py-1">
            <Globe className="w-3.5 h-3.5 text-indigo-600 mr-1.5" />
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

          <button
            onClick={clearChat}
            className="p-2 rounded-full text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
            title={t('clear_chat')}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages Feed Area */}
      <div className="flex-1 ref-card p-4 overflow-y-auto space-y-4 border border-slate-200/80 bg-slate-50/40">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
              msg.sender === 'user' 
                ? 'bg-indigo-600 text-white shadow-sm' 
                : 'bg-indigo-50 text-indigo-700 border border-indigo-100'
            }`}>
              {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            <div className={`max-w-[80%] space-y-1 ${msg.sender === 'user' ? 'items-end text-right' : ''}`}>
              <div className={`p-4 rounded-2xl text-xs leading-relaxed font-medium ${
                msg.sender === 'user'
                  ? 'bg-slate-900 text-white rounded-tr-none shadow-sm'
                  : 'bg-white text-slate-800 border border-slate-200/80 rounded-tl-none shadow-sm'
              }`}>
                {msg.text}
              </div>
              <span className="text-[10px] text-slate-400 font-medium px-1 block">{msg.timestamp}</span>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-xs text-indigo-600 font-bold p-3 bg-indigo-50 rounded-2xl border border-indigo-100 max-w-xs">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Formulating AI response...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts Bar */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 shrink-0">
        {quickPrompts.map((qp, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(qp)}
            className="px-3.5 py-1.5 rounded-full bg-white hover:bg-indigo-50 border border-slate-200 text-xs font-bold text-slate-700 hover:text-indigo-600 whitespace-nowrap transition-all shadow-sm cursor-pointer"
          >
            {qp}
          </button>
        ))}
      </div>

      {/* Input Box Bar */}
      <form
        onSubmit={(e) => { e.preventDefault(); handleSend(); }}
        className="p-2.5 bg-white border border-slate-200/80 rounded-2xl flex items-center gap-2 shrink-0 shadow-sm"
      >
        <button
          type="button"
          onClick={handleVoiceInput}
          className={`p-2.5 rounded-full transition-colors ${isListening ? 'bg-rose-500 text-white animate-pulse' : 'bg-slate-100 text-slate-500 hover:text-slate-900'}`}
          title="Voice input"
        >
          <Mic className="w-4 h-4" />
        </button>

        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t('type_message')}
          className="flex-1 bg-transparent px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none font-medium"
        />

        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="px-5 py-2.5 rounded-full bg-slate-900 hover:bg-indigo-600 disabled:opacity-50 text-white font-extrabold text-xs flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
        >
          <span>{t('send')}</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>

    </div>
  );
}
