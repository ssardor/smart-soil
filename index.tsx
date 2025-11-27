import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { GoogleGenAI } from "@google/genai";

// --- Types ---

type Language = 'uz' | 'ru' | 'en';

interface Translation {
  title: string;
  subtitle: string;
  startBtn: string;
  locationLabel: string;
  locationPlaceholder: string;
  cropLabel: string;
  cropPlaceholder: string;
  detailsLabel: string;
  detailsPlaceholder: string;
  sizeLabel: string;
  analyzeBtn: string;
  analyzing: string;
  dashboardTitle: string;
  weather: string;
  ndvi: string;
  moisture: string;
  recommendations: string;
  irrigation: string;
  fertilizer: string;
  historyChart: string;
  scheduleTitle: string;
  weeklyPlan: string;
  monthlyPlan: string;
  source: string;
  features: {
    title: string;
    items: { icon: string; title: string; desc: string }[];
  };
  about: {
    title: string;
    problemTitle: string;
    problemText: string;
    solutionTitle: string;
    solutionText: string;
  };
  howItWorks: {
    title: string;
    steps: { num: string; title: string; desc: string }[];
  };
  team: {
    title: string;
    members: { name: string; role: string; link: string }[];
  };
}

interface AnalysisData {
  location: string;
  crop: string;
  weather: {
    temp: number;
    humidity: number;
    condition: string;
    wind: number;
    forecast_summary: string;
  };
  ndvi: number; // 0 to 1
  soil_moisture: number; // 0 to 100
  historical_ndvi: { day: string; value: number }[];
  recommendations: string[];
  irrigation_plan: string;
  fertilizer_plan: string;
  soil_health_score: number;
  weekly_schedule: {
    day: string;
    activity: string;
    type: 'water' | 'fertilizer' | 'check';
  }[];
  monthly_schedule: {
    week: string;
    focus: string;
    actions: string[];
    detailed_instructions: string[]; 
  }[];
}

interface GroundingMetadata {
  groundingChunks?: {
    web?: {
      uri: string;
      title: string;
    };
  }[];
}

// --- Content & Translations ---

const translations: Record<Language, Translation> = {
  uz: {
    title: "SmartSoil",
    subtitle: "Datchiklarsiz o'g'it va sug'orishni optimallashtirish",
    startBtn: "Tahlilni boshlash",
    locationLabel: "Maydon joylashuvi",
    locationPlaceholder: "Masalan: Toshkent, Chinoz",
    cropLabel: "Ekin turi",
    cropPlaceholder: "Masalan: Paxta",
    detailsLabel: "Qo'shimcha ma'lumot",
    detailsPlaceholder: "Masalan: Tuproq sho'r, o'tgan yili bug'doy ekilgan, suv tanqis...",
    sizeLabel: "Maydon o'lchami (ga)",
    analyzeBtn: "Tahlil qilish",
    analyzing: "Ob-havo va tuproq tahlil qilinmoqda...",
    dashboardTitle: "Tahlil Natijalari",
    weather: "Aniq Ob-havo",
    ndvi: "NDVI (Vegetatsiya indeksi)",
    moisture: "Tuproq namligi",
    recommendations: "AI Tavsiyalari",
    irrigation: "Sug'orish rejasi",
    fertilizer: "O'g'itlash rejasi",
    historyChart: "Vegetatsiya dinamikasi (7 kun)",
    scheduleTitle: "Aqlli Rejalashtirish",
    weeklyPlan: "Haftalik Reja",
    monthlyPlan: "Oylik Prognoz",
    source: "Manba",
    features: {
      title: "Nima uchun SmartSoil?",
      items: [
        { icon: "fa-robot", title: "AI Tahlil", desc: "Sun'iy intellekt tuproq va ob-havo ma'lumotlarini o'rganib, aniq tavsiyalar beradi." },
        { icon: "fa-satellite", title: "Sun'iy Yo'ldosh", desc: "Datchiklarsiz, faqat sun'iy yo'ldosh tasvirlari orqali masofaviy monitoring." },
        { icon: "fa-droplet", title: "Suvni Tejash", desc: "Aniq sug'orish rejasi orqali suv sarfini 30% gacha kamaytirish." },
        { icon: "fa-sack-dollar", title: "Iqtisodiy Samaradorlik", desc: "O'g'itlarni to'g'ri taqsimlash orqali xarajatlarni qisqartirish." }
      ]
    },
    about: {
      title: "Loyiha Haqida",
      problemTitle: "Muammo",
      problemText: "Dehqonlar ko'pincha o'g'itlarni me'yordan ortiq ishlatadilar, bu esa tuproq unumdorligini pasaytiradi va yer osti suvlarini ifloslantiradi. Shuningdek, noto'g'ri sug'orish hosildorlikka salbiy ta'sir qiladi.",
      solutionTitle: "Yechim",
      solutionText: "SmartSoil — bu ochiq sun'iy yo'ldosh ma'lumotlari va ob-havo prognozlaridan foydalanib, har bir maydon uchun individual parvarish rejasini tuzadigan aqlli tizim. Biz qimmat datchiklarsiz aniq natijalarni taqdim etamiz."
    },
    howItWorks: {
      title: "Qanday ishlaydi?",
      steps: [
        { num: "01", title: "Ma'lumot kiritish", desc: "Maydon joylashuvi va ekin turini kiriting." },
        { num: "02", title: "AI Tahlili", desc: "Tizim sun'iy yo'ldosh va ob-havo ma'lumotlarini tahlil qiladi." },
        { num: "03", title: "Reja olish", desc: "Sizga maxsus sug'orish va o'g'itlash rejasi taqdim etiladi." }
      ]
    },
    team: {
      title: "Bizning Jamoa",
      members: [
        { name: "Doston Husanov", role: "Jamoa Rahbari (Team Lead)", link: "https://www.linkedin.com/in/doston-husanov-822a18337" },
        { name: "Sardor Ismatullaev", role: "Full Stack Dasturchi", link: "https://www.linkedin.com/in/sardor-ismatullaev" },
        { name: "Saidjahon Fayzullaev", role: "Ma'lumotlar Tahlilchisi", link: "https://www.linkedin.com/in/saidjahon-fayzullaev-52480a384" }
      ]
    }
  },
  ru: {
    title: "SmartSoil",
    subtitle: "Оптимизация удобрений и полива без датчиков",
    startBtn: "Начать анализ",
    locationLabel: "Расположение поля",
    locationPlaceholder: "Например: Ташкент, Чиназ",
    cropLabel: "Тип культуры",
    cropPlaceholder: "Например: Хлопок",
    detailsLabel: "Дополнительная информация",
    detailsPlaceholder: "Например: Почва соленая, в прошлом году росла пшеница, нехватка воды...",
    sizeLabel: "Размер поля (га)",
    analyzeBtn: "Анализировать",
    analyzing: "Анализ погоды и почвы...",
    dashboardTitle: "Результаты Анализа",
    weather: "Точная Погода",
    ndvi: "NDVI (Индекс вегетации)",
    moisture: "Влажность почвы",
    recommendations: "Рекомендации ИИ",
    irrigation: "План полива",
    fertilizer: "План удобрений",
    historyChart: "Динамика вегетации (7 дней)",
    scheduleTitle: "Умное Планирование",
    weeklyPlan: "План на неделю",
    monthlyPlan: "Месячный прогноз",
    source: "Источник",
    features: {
      title: "Почему SmartSoil?",
      items: [
        { icon: "fa-robot", title: "ИИ Анализ", desc: "Искусственный интеллект изучает данные почвы и погоды, давая точные рекомендации." },
        { icon: "fa-satellite", title: "Спутниковые данные", desc: "Удаленный мониторинг без датчиков через спутниковые снимки." },
        { icon: "fa-droplet", title: "Экономия воды", desc: "Снижение расхода воды до 30% благодаря точному плану полива." },
        { icon: "fa-sack-dollar", title: "Экономическая эффективность", desc: "Сокращение расходов за счет правильного распределения удобрений." }
      ]
    },
    about: {
      title: "О Проекте",
      problemTitle: "Проблема",
      problemText: "Фермеры часто используют избыточное количество удобрений, что убивает почву и загрязняет воды. Неправильный полив также негативно сказывается на урожайности.",
      solutionTitle: "Решение",
      solutionText: "SmartSoil — это сервис, который на основе спутниковых снимков и прогноза погоды рассчитывает точный план полива и внесения удобрений для конкретного участка без использования физических датчиков."
    },
    howItWorks: {
      title: "Как это работает?",
      steps: [
        { num: "01", title: "Ввод данных", desc: "Укажите местоположение поля и тип выращиваемой культуры." },
        { num: "02", title: "Анализ ИИ", desc: "Система анализирует спутниковые данные и погоду в реальном времени." },
        { num: "03", title: "Получение плана", desc: "Вы получаете персональный план полива и удобрений." }
      ]
    },
    team: {
      title: "Наша Команда",
      members: [
        { name: "Doston Husanov", role: "Team Lead", link: "https://www.linkedin.com/in/doston-husanov-822a18337" },
        { name: "Sardor Ismatullaev", role: "Full Stack Разработчик", link: "https://www.linkedin.com/in/sardor-ismatullaev" },
        { name: "Saidjahon Fayzullaev", role: "Аналитик Данных", link: "https://www.linkedin.com/in/saidjahon-fayzullaev-52480a384" }
      ]
    }
  },
  en: {
    title: "SmartSoil",
    subtitle: "Fertilizer and irrigation optimization without sensors",
    startBtn: "Start Analysis",
    locationLabel: "Field Location",
    locationPlaceholder: "E.g. Tashkent, Chinaz",
    cropLabel: "Crop Type",
    cropPlaceholder: "E.g. Cotton",
    detailsLabel: "Additional Details",
    detailsPlaceholder: "E.g. Salty soil, wheat was planted last year, water shortage...",
    sizeLabel: "Field Size (ha)",
    analyzeBtn: "Analyze",
    analyzing: "Analyzing weather and soil...",
    dashboardTitle: "Analysis Results",
    weather: "Exact Weather",
    ndvi: "NDVI (Vegetation Index)",
    moisture: "Soil Moisture",
    recommendations: "AI Recommendations",
    irrigation: "Irrigation Plan",
    fertilizer: "Fertilizer Plan",
    historyChart: "Vegetation Dynamics (7 days)",
    scheduleTitle: "Smart Scheduling",
    weeklyPlan: "Weekly Plan",
    monthlyPlan: "Monthly Forecast",
    source: "Source",
    features: {
      title: "Why SmartSoil?",
      items: [
        { icon: "fa-robot", title: "AI Analysis", desc: "Artificial intelligence analyzes soil and weather data to provide precise recommendations." },
        { icon: "fa-satellite", title: "Satellite Data", desc: "Remote monitoring using satellite imagery without physical sensors." },
        { icon: "fa-droplet", title: "Water Saving", desc: "Reduce water usage by up to 30% with precise irrigation plans." },
        { icon: "fa-sack-dollar", title: "Cost Efficiency", desc: "Reduce costs by optimizing fertilizer distribution." }
      ]
    },
    about: {
      title: "About The Project",
      problemTitle: "The Problem",
      problemText: "Farmers often overuse fertilizers, damaging the soil and polluting water sources. Incorrect irrigation also negatively impacts crop yields.",
      solutionTitle: "The Solution",
      solutionText: "SmartSoil is an intelligent service that calculates precise irrigation and fertilizer plans using open satellite data and weather forecasts, without needing expensive physical sensors."
    },
    howItWorks: {
      title: "How It Works",
      steps: [
        { num: "01", title: "Input Data", desc: "Enter your field location and crop type." },
        { num: "02", title: "AI Analysis", desc: "System analyzes real-time satellite and weather data." },
        { num: "03", title: "Get Plan", desc: "Receive your personalized irrigation and fertilizer schedule." }
      ]
    },
    team: {
      title: "Our Team",
      members: [
        { name: "Doston Husanov", role: "Team Lead", link: "https://www.linkedin.com/in/doston-husanov-822a18337" },
        { name: "Sardor Ismatullaev", role: "Full Stack Developer", link: "https://www.linkedin.com/in/sardor-ismatullaev" },
        { name: "Saidjahon Fayzullaev", role: "Data Analyst", link: "https://www.linkedin.com/in/saidjahon-fayzullaev-52480a384" }
      ]
    }
  }
};

// --- Components ---

const Navbar = ({ lang, setLang, transparent }: { lang: Language, setLang: (l: Language) => void, transparent: boolean }) => {
  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${transparent ? 'bg-transparent py-4' : 'bg-white/90 backdrop-blur-md shadow-sm py-2'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center cursor-pointer group" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-2 transition-colors ${transparent ? 'bg-white/20 backdrop-blur-sm' : 'bg-leaf-100'}`}>
              <i className={`fa-solid fa-leaf text-xl ${transparent ? 'text-white' : 'text-leaf-600'}`}></i>
            </div>
            <span className={`font-bold text-xl tracking-tight ${transparent ? 'text-white' : 'text-gray-900'}`}>SmartSoil</span>
          </div>
          <div className={`flex space-x-1 p-1 rounded-full ${transparent ? 'bg-white/20 backdrop-blur-md' : 'bg-gray-100'}`}>
            {(['uz', 'ru', 'en'] as Language[]).map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all transform hover:scale-105 ${
                  lang === l 
                    ? 'bg-leaf-600 text-white shadow-md' 
                    : transparent ? 'text-white hover:bg-white/20' : 'text-gray-600 hover:bg-white'
                }`}
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};

const Hero = ({ t, onStart }: { t: Translation, onStart: () => void }) => {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Parallax-like fixity */}
      <div className="absolute inset-0 z-0">
        <img
          className="w-full h-full object-cover"
          src="https://media.istockphoto.com/id/1465642013/photo/a-vibrant-green-soybean-field-nestled-in-a-natural-setting.jpg?s=612x612&w=0&k=20&c=ukaUysAFOmCHYpOkVHZi-dYjKXNMh-QnIq40KEG3NuQ="
          alt="Agriculture Field"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/40 to-leaf-900/60 mix-blend-multiply"></div>
      </div>
      
      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
        <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-leaf-100 text-sm font-medium mb-8 animate-fade-in">
          <i className="fa-solid fa-satellite-dish mr-2 text-leaf-300"></i> AI-Powered Agriculture
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white mb-6 drop-shadow-lg leading-tight">
          {t.title}
        </h1>
        
        <p className="mt-4 max-w-2xl text-xl md:text-2xl text-gray-100 drop-shadow-md font-light">
          {t.subtitle}
        </p>
        
        <div className="mt-12 flex flex-col sm:flex-row gap-4">
          <button
            onClick={onStart}
            className="px-8 py-4 bg-leaf-500 hover:bg-leaf-600 text-white text-lg font-bold rounded-full shadow-lg hover:shadow-leaf-500/50 transition-all transform hover:-translate-y-1 hover:scale-105 flex items-center justify-center"
          >
            {t.startBtn} <i className="fa-solid fa-arrow-right ml-2"></i>
          </button>
          <button
            onClick={() => document.getElementById('how-it-works')?.scrollIntoView({behavior: 'smooth'})}
            className="px-8 py-4 bg-white/10 backdrop-blur-md border border-white/30 hover:bg-white/20 text-white text-lg font-bold rounded-full transition-all flex items-center justify-center"
          >
            <i className="fa-solid fa-play mr-2"></i> Demo
          </button>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
        <i className="fa-solid fa-chevron-down text-white/70 text-2xl"></i>
      </div>
    </div>
  );
};

const Features = ({ t }: { t: Translation }) => {
  return (
    <section className="py-24 bg-gray-50 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-leaf-50/50 skew-x-12 transform translate-x-20"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-20">
          <h2 className="text-4xl font-bold text-gray-900 tracking-tight mb-4">{t.features.title}</h2>
          <div className="w-24 h-1.5 bg-gradient-to-r from-leaf-400 to-leaf-600 mx-auto rounded-full"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {t.features.items.map((item, idx) => (
            <div key={idx} className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 group">
              <div className="w-16 h-16 bg-leaf-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-leaf-500 transition-colors duration-300">
                <i className={`fa-solid ${item.icon} text-leaf-600 text-2xl group-hover:text-white transition-colors`}></i>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
              <p className="text-gray-600 leading-relaxed text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const About = ({ t }: { t: Translation }) => {
  return (
    <section className="py-24 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="relative order-2 lg:order-1">
            <div className="absolute -inset-4 bg-gradient-to-r from-leaf-200 to-teal-200 rounded-3xl blur-lg opacity-30 transform rotate-3"></div>
            <img 
            src="https://media.istockphoto.com/id/1465642013/photo/a-vibrant-green-soybean-field-nestled-in-a-natural-setting.jpg?s=612x612&w=0&k=20&c=ukaUysAFOmCHYpOkVHZi-dYjKXNMh-QnIq40KEG3NuQ="
            alt="Fermer planshetda" 
              className="relative rounded-3xl shadow-2xl z-10 w-full object-cover transform transition-transform duration-500 hover:scale-[1.01]"
            />
            {/* Floating Stats Card */}
            <div className="absolute -bottom-6 -right-6 bg-white p-6 rounded-xl shadow-xl z-20 max-w-xs border-l-4 border-leaf-500 hidden sm:block">
              <div className="flex items-center space-x-4">
                <div className="bg-leaf-100 p-3 rounded-full">
                  <i className="fa-solid fa-check text-leaf-600"></i>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Samaradorlik oshirildi</p>
                  <p className="text-xl font-bold text-gray-900">+35% daromad</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="order-1 lg:order-2">
            <span className="text-leaf-600 font-bold tracking-wider uppercase text-sm mb-2 block">{t.about.title}</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 leading-tight">
              Ma’lumotlar bilan qishloq xo‘jaligini tubdan o‘zgartirish
            </h2>
            
            <div className="space-y-8">
              <div className="flex items-start">
                 <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mt-1">
                    <i className="fa-solid fa-triangle-exclamation text-red-500"></i>
                 </div>
                 <div className="ml-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{t.about.problemTitle}</h3>
                    <p className="text-gray-600 leading-relaxed">{t.about.problemText}</p>
                 </div>
              </div>
              
              <div className="flex items-start">
                 <div className="flex-shrink-0 w-12 h-12 bg-leaf-100 rounded-full flex items-center justify-center mt-1">
                    <i className="fa-solid fa-lightbulb text-leaf-600"></i>
                 </div>
                 <div className="ml-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{t.about.solutionTitle}</h3>
                    <p className="text-gray-600 leading-relaxed">{t.about.solutionText}</p>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const HowItWorks = ({ t }: { t: Translation }) => {
  return (
    <section id="how-it-works" className="py-24 bg-gray-900 text-white relative overflow-hidden">
      {/* Abstract Background */}
      <div className="absolute inset-0 opacity-10">
         <div className="absolute -top-24 -left-24 w-96 h-96 bg-leaf-500 rounded-full blur-3xl"></div>
         <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-20">
          <h2 className="text-4xl font-bold tracking-tight mb-4">{t.howItWorks.title}</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">Simple steps to get your professional agricultural insights.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
           {/* Connector Line (Desktop) */}
          <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gray-700 -z-10"></div>
          
          {t.howItWorks.steps.map((step, idx) => (
            <div key={idx} className="relative flex flex-col items-center text-center group">
              <div className="w-24 h-24 bg-gray-800 rounded-full border-4 border-gray-700 flex items-center justify-center text-3xl font-bold mb-8 shadow-2xl group-hover:border-leaf-500 group-hover:bg-leaf-600 transition-all duration-300 z-10">
                {step.num}
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">{step.title}</h3>
              <p className="text-gray-400 leading-relaxed px-4">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Team = ({ t }: { t: Translation }) => {
  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').substring(0, 2);

  return (
    <section className="py-24 bg-gray-50 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 tracking-tight mb-4">{t.team.title}</h2>
          <div className="w-24 h-1.5 bg-gradient-to-r from-leaf-400 to-leaf-600 mx-auto rounded-full"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 justify-center">
          {t.team.members.map((member, idx) => (
            <div key={idx} className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 text-center group">
              <div className="w-24 h-24 mx-auto bg-gradient-to-br from-leaf-100 to-leaf-200 rounded-full flex items-center justify-center mb-6 shadow-inner text-leaf-700 font-bold text-2xl border-4 border-white group-hover:scale-105 transition-transform">
                {getInitials(member.name)}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">{member.name}</h3>
              <p className="text-leaf-600 font-medium text-sm mb-6">{member.role}</p>
              
              <a 
                href={member.link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all duration-300 shadow-sm"
              >
                <i className="fa-brands fa-linkedin-in text-lg"></i>
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const AnalyticsChart = ({ data, label }: { data: { day: string; value: number }[], label: string }) => {
  const height = 150;
  const width = 300;
  const padding = 20;
  
  const minVal = Math.min(...data.map(d => d.value));
  const maxVal = Math.max(...data.map(d => d.value));
  const range = maxVal - minVal || 1; 

  const points = data.map((d, i) => {
    const x = padding + (i / (data.length - 1)) * (width - 2 * padding);
    const y = height - padding - ((d.value - minVal) / range) * (height - 2 * padding);
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="w-full h-full flex flex-col items-center justify-center">
      <h4 className="text-sm font-semibold text-gray-500 mb-2">{label}</h4>
      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
        <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#e5e7eb" strokeWidth="1" />
        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#e5e7eb" strokeWidth="1" />
        <polyline
          fill="none"
          stroke="#16a34a"
          strokeWidth="3"
          points={points}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {data.map((d, i) => {
           const x = padding + (i / (data.length - 1)) * (width - 2 * padding);
           const y = height - padding - ((d.value - minVal) / range) * (height - 2 * padding);
           return (
             <circle key={i} cx={x} cy={y} r="4" fill="white" stroke="#16a34a" strokeWidth="2" />
           )
        })}
      </svg>
      <div className="flex justify-between w-full text-xs text-gray-400 mt-2 px-2">
        {data.map((d, i) => (
          <span key={i}>{d.day}</span>
        ))}
      </div>
    </div>
  );
};

const ScheduleWidget = ({ data, t }: { data: AnalysisData, t: Translation }) => {
  const [activeTab, setActiveTab] = useState<'weekly' | 'monthly'>('weekly');
  const [expandedWeek, setExpandedWeek] = useState<number | null>(null);

  const toggleWeek = (idx: number) => {
    if (expandedWeek === idx) {
      setExpandedWeek(null);
    } else {
      setExpandedWeek(idx);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6 mt-8">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-gray-900 flex items-center mb-4 sm:mb-0">
          <i className="fa-regular fa-calendar-check text-leaf-600 mr-2"></i>
          {t.scheduleTitle}
        </h3>
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('weekly')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
              activeTab === 'weekly' ? 'bg-white text-leaf-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.weeklyPlan}
          </button>
          <button
            onClick={() => setActiveTab('monthly')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
              activeTab === 'monthly' ? 'bg-white text-leaf-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.monthlyPlan}
          </button>
        </div>
      </div>

      <div className="animate-fade-in">
        {activeTab === 'weekly' ? (
          <div className="space-y-3">
            {data.weekly_schedule.map((item, idx) => {
              let iconClass = "fa-circle-check text-gray-400";
              let bgClass = "bg-gray-50 border-gray-100";
              
              if (item.type === 'water') {
                iconClass = "fa-droplet text-blue-500";
                bgClass = "bg-blue-50 border-blue-100";
              } else if (item.type === 'fertilizer') {
                iconClass = "fa-flask text-orange-500";
                bgClass = "bg-orange-50 border-orange-100";
              } else if (item.type === 'check') {
                iconClass = "fa-eye text-leaf-500";
                bgClass = "bg-leaf-50 border-leaf-100";
              }

              return (
                <div key={idx} className={`flex items-center p-4 rounded-lg border ${bgClass} transition hover:shadow-sm`}>
                  <div className="flex-shrink-0 w-24 sm:w-32 text-left sm:text-center border-r border-gray-200 pr-4 mr-4">
                    <span className="block text-sm font-bold text-gray-700">{item.day}</span>
                  </div>
                  <div className="flex-shrink-0 hidden sm:block">
                    <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center shadow-sm">
                      <i className={`fa-solid ${iconClass} text-lg`}></i>
                    </div>
                  </div>
                  <div className="flex-1 ml-0 sm:ml-4">
                    <p className="text-gray-900 font-medium">{item.activity}</p>
                    <span className="text-xs text-gray-500 uppercase tracking-wider">{item.type}</span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="relative border-l-2 border-leaf-200 ml-4 space-y-8 py-2">
            {data.monthly_schedule.map((week, idx) => (
              <div key={idx} className="relative pl-8">
                <span className="absolute -left-[9px] top-6 h-4 w-4 rounded-full bg-leaf-500 border-2 border-white shadow"></span>
                <div 
                  onClick={() => toggleWeek(idx)}
                  className={`bg-white border rounded-lg p-5 transition-all shadow-sm cursor-pointer group ${
                    expandedWeek === idx ? 'border-leaf-500 ring-1 ring-leaf-500' : 'border-gray-200 hover:border-leaf-300'
                  }`}
                >
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center space-x-3">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide bg-leaf-100 text-leaf-800">
                        {week.week}
                      </span>
                    </div>
                    <button className="text-gray-400 group-hover:text-leaf-600 transition-colors">
                      <i className={`fa-solid fa-chevron-down transform transition-transform duration-200 ${expandedWeek === idx ? 'rotate-180' : ''}`}></i>
                    </button>
                  </div>
                  
                  <h4 className="text-lg font-bold text-gray-800 mb-2">{week.focus}</h4>
                  
                  {/* Summary Actions (Always Visible) */}
                  <div className="flex flex-wrap gap-2 mb-2">
                    {week.actions.slice(0, 2).map((action, i) => (
                      <span key={i} className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                         {action}
                      </span>
                    ))}
                    {week.actions.length > 2 && !expandedWeek && (
                      <span className="text-xs text-gray-500 flex items-center">
                        +{week.actions.length - 2} more
                      </span>
                    )}
                  </div>

                  {/* Expanded Content */}
                  {expandedWeek === idx && (
                    <div className="mt-4 pt-4 border-t border-gray-100 animate-fade-in">
                       <h5 className="text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wider">Detailed Plan:</h5>
                       <ul className="space-y-3">
                         {week.detailed_instructions?.map((instruction, i) => (
                           <li key={i} className="flex items-start text-sm text-gray-700">
                             <i className="fa-solid fa-circle-check text-leaf-500 mt-1 mr-3 flex-shrink-0 text-xs"></i>
                             <span>{instruction}</span>
                           </li>
                         )) || (
                           // Fallback if no detailed instructions (legacy data)
                           week.actions.map((action, i) => (
                            <li key={i} className="flex items-start text-sm text-gray-700">
                              <i className="fa-solid fa-angle-right text-leaf-500 mt-1 mr-3 flex-shrink-0"></i>
                              <span>{action}</span>
                            </li>
                           ))
                         )}
                       </ul>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const Dashboard = ({ data, t, grounding }: { data: AnalysisData, t: Translation, grounding?: GroundingMetadata }) => {
  if (!data) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in">
      <h2 className="text-3xl font-bold text-gray-900 mb-8 border-l-4 border-leaf-500 pl-4">
        {t.dashboardTitle}: <span className="text-leaf-600">{data.location}</span>
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Weather Card */}
        <div className="bg-white rounded-xl shadow-md p-6 border-t-4 border-blue-400 relative overflow-hidden group">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-700">{t.weather}</h3>
            <i className="fa-solid fa-cloud-sun text-blue-400 text-2xl"></i>
          </div>
          <div className="flex items-end">
            <span className="text-4xl font-bold text-gray-900">{data.weather.temp}°C</span>
            <span className="ml-2 text-gray-500 mb-1">{data.weather.condition}</span>
          </div>
          <div className="mt-4 flex items-center text-sm text-gray-600">
            <i className="fa-solid fa-droplet mr-2"></i> {data.weather.humidity}%
          </div>
          <div className="mt-1 flex items-center text-sm text-gray-600">
            <i className="fa-solid fa-wind mr-2"></i> {data.weather.wind} km/h
          </div>
          {grounding?.groundingChunks && (
            <div className="mt-4 pt-2 border-t border-gray-100 text-xs text-gray-400 truncate">
               <span className="font-semibold">{t.source}:</span> 
               {grounding.groundingChunks.map((chunk, i) => chunk.web?.uri && (
                 <a key={i} href={chunk.web.uri} target="_blank" rel="noopener noreferrer" className="ml-1 text-blue-400 hover:underline">
                    {new URL(chunk.web.uri).hostname}
                 </a>
               )).slice(0, 1)}
            </div>
          )}
        </div>

        {/* NDVI Card */}
        <div className="bg-white rounded-xl shadow-md p-6 border-t-4 border-green-500">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-700">{t.ndvi}</h3>
            <i className="fa-solid fa-layer-group text-green-500 text-2xl"></i>
          </div>
          <div className="relative pt-1">
            <div className="flex mb-2 items-center justify-between">
              <div>
                <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-green-600 bg-green-200">
                  {data.ndvi > 0.6 ? 'Healthy' : data.ndvi > 0.3 ? 'Moderate' : 'Low'}
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold inline-block text-green-600">
                  {data.ndvi.toFixed(2)}
                </span>
              </div>
            </div>
            <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-green-200">
              <div style={{ width: `${data.ndvi * 100}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-500"></div>
            </div>
          </div>
          <p className="text-xs text-gray-500">Index from 0.0 (Soil) to 1.0 (Dense Green)</p>
        </div>

        {/* Moisture Card */}
        <div className="bg-white rounded-xl shadow-md p-6 border-t-4 border-soil-500">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-700">{t.moisture}</h3>
            <i className="fa-solid fa-water text-soil-500 text-2xl"></i>
          </div>
          <div className="flex items-center justify-center py-2">
            <div className="relative w-24 h-24">
               <svg className="w-full h-full" viewBox="0 0 36 36">
                  <path
                    className="text-gray-200"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="text-soil-500"
                    strokeDasharray={`${data.soil_moisture}, 100`}
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
               </svg>
               <div className="absolute inset-0 flex items-center justify-center">
                 <span className="text-xl font-bold text-gray-800">{data.soil_moisture}%</span>
               </div>
            </div>
          </div>
        </div>

        {/* Health Score Card */}
        <div className="bg-white rounded-xl shadow-md p-6 border-t-4 border-purple-500">
          <div className="flex items-center justify-between mb-4">
             <h3 className="text-lg font-semibold text-gray-700">Soil Health</h3>
             <i className="fa-solid fa-heart-pulse text-purple-500 text-2xl"></i>
          </div>
          <div className="text-center">
             <span className="text-5xl font-bold text-purple-600">{data.soil_health_score}</span>
             <span className="text-gray-400 text-sm"> / 100</span>
          </div>
          <p className="text-center text-sm text-gray-500 mt-4">Based on comprehensive analysis</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="bg-white rounded-xl shadow-md p-6 lg:col-span-2">
          <h3 className="text-lg font-semibold text-gray-800 mb-6">{t.historyChart}</h3>
          <div className="h-64">
             <AnalyticsChart data={data.historical_ndvi} label="NDVI Trend" />
          </div>
        </div>

        {/* Recommendations Panel */}
        <div className="bg-white rounded-xl shadow-md p-6">
           <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
             <i className="fa-solid fa-robot text-leaf-600 mr-2"></i>
             {t.recommendations}
           </h3>
           <ul className="space-y-3">
             {data.recommendations.map((rec, idx) => (
               <li key={idx} className="flex items-start text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-100">
                 <i className="fa-solid fa-check text-green-500 mt-1 mr-2 flex-shrink-0"></i>
                 <span>{rec}</span>
               </li>
             ))}
           </ul>
        </div>
      </div>

      {/* Action Plans */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <div className="bg-leaf-50 rounded-xl p-6 border border-leaf-200">
           <h3 className="text-lg font-bold text-leaf-800 mb-3 flex items-center">
             <i className="fa-solid fa-faucet mr-2"></i> {t.irrigation}
           </h3>
           <p className="text-leaf-900 text-sm leading-relaxed whitespace-pre-line">{data.irrigation_plan}</p>
        </div>
        <div className="bg-orange-50 rounded-xl p-6 border border-orange-200">
           <h3 className="text-lg font-bold text-orange-800 mb-3 flex items-center">
             <i className="fa-solid fa-flask mr-2"></i> {t.fertilizer}
           </h3>
           <p className="text-orange-900 text-sm leading-relaxed whitespace-pre-line">{data.fertilizer_plan}</p>
        </div>
      </div>

      {/* Schedule Widget */}
      <ScheduleWidget data={data} t={t} />

    </div>
  );
};

// --- Main App Component ---

const App = () => {
  const [lang, setLang] = useState<Language>('uz');
  const [loading, setLoading] = useState(false);
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [groundingMetadata, setGroundingMetadata] = useState<GroundingMetadata | undefined>(undefined);
  const [navbarTransparent, setNavbarTransparent] = useState(true);
  const [formData, setFormData] = useState({
    location: '',
    crop: '',
    size: '',
    details: '',
  });

  const t = translations[lang];

  useEffect(() => {
    const handleScroll = () => {
      // If we are on dashboard (analysisData exists), navbar is always solid.
      // If on landing, it is transparent at top, solid when scrolled.
      if (analysisData) {
        setNavbarTransparent(false);
      } else {
        setNavbarTransparent(window.scrollY < 50);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [analysisData]);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.location || !formData.crop) return;

    setLoading(true);
    setAnalysisData(null);
    setGroundingMetadata(undefined);
    setNavbarTransparent(false); // Force solid navbar on analysis

    try {
      const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
      
      const langNames = {
        uz: 'Uzbek',
        ru: 'Russian',
        en: 'English'
      };
      
      // We do not use responseMimeType: 'application/json' because we are using googleSearch tool
      // which prohibits responseMimeType config.
      const prompt = `
        You are an expert agronomist AI for the SmartSoil application.
        
        TASK 1: Search for the CURRENT weather forecast for the next 7 days in "${formData.location}".
        
        TASK 2: Based on the REAL weather data found and the crop type "${formData.crop}", generate a detailed agricultural analysis JSON.
        
        Additional context provided by user: "${formData.details}". Use this information to tailor recommendations if relevant.

        Output strictly valid JSON string only. Do not wrap in markdown code blocks.
        
        JSON Schema:
        {
          "location": "${formData.location}",
          "crop": "${formData.crop}",
          "weather": { 
            "temp": number (current temp), 
            "humidity": number, 
            "condition": string (e.g. "Sunny", "Cloudy"), 
            "wind": number,
            "forecast_summary": string (summary of the search result)
          },
          "ndvi": number (float 0.1-0.9),
          "soil_moisture": number (int 0-100),
          "historical_ndvi": [{ "day": string (e.g. 'Mon'), "value": number }],
          "recommendations": [string, string, string],
          "irrigation_plan": string (detailed text based on real weather),
          "fertilizer_plan": string (detailed text),
          "soil_health_score": number (0-100),
          "weekly_schedule": [
            { "day": string (e.g. "Monday, Oct 24"), "activity": string, "type": "water" | "fertilizer" | "check" }
          ],
          "monthly_schedule": [
            { 
              "week": string (e.g. "Week 1: Oct 24-30"), 
              "focus": string, 
              "actions": [string, string],
              "detailed_instructions": [string, string, string] 
            }
          ]
        }
        
        Output Language: ${langNames[lang]}. 
        All text values inside the JSON (including summaries, plans, recommendations, descriptions, and schedule details) MUST be in ${langNames[lang]}.
        
        Ensure "weekly_schedule" has 7 days.
        Ensure "monthly_schedule" has EXACTLY 4 distinct weeks.
        IMPORTANT: In "monthly_schedule", "detailed_instructions" must contain at least 3-4 distinct, actionable sentences explaining exactly WHAT to do and WHY for that week. This data appears when the user expands the week.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }] // Enabled search for real weather
        }
      });

      // Handle Parsing manually since we can't enforce JSON mode with tools
      let text = response.text;
      if (text) {
        // Clean markdown if present
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();
        try {
          const data = JSON.parse(text);
          setAnalysisData(data);
          
          // Extract grounding metadata if available
          const grounding = response.candidates?.[0]?.groundingMetadata as GroundingMetadata;
          setGroundingMetadata(grounding);
        } catch (e) {
          console.error("JSON Parse Error", e);
          console.log("Raw Text:", text);
          // Fallback or retry logic could go here
        }
      }
    } catch (error) {
      console.error("Error generating analysis:", error);
      alert("Error generating analysis. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const scrollToInput = () => {
    document.getElementById('analysis-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Navbar lang={lang} setLang={setLang} transparent={navbarTransparent} />
      
      {!analysisData && (
        <>
          <Hero t={t} onStart={scrollToInput} />
          <Features t={t} />
          <About t={t} />
          <HowItWorks t={t} />
          <Team t={t} />
        </>
      )}

      <div id="analysis-form" className={`py-20 ${!analysisData ? 'bg-gray-100' : 'bg-gray-50'}`}>
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden transform transition-all hover:scale-[1.01] duration-500">
             <div className="bg-gradient-to-r from-leaf-600 to-leaf-800 px-8 py-6">
                <h3 className="text-2xl font-bold text-white flex items-center">
                  <i className="fa-solid fa-satellite-dish mr-3"></i>
                  {analysisData ? t.startBtn : "Start New Analysis"}
                </h3>
             </div>
             <form onSubmit={handleAnalyze} className="p-10 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">{t.locationLabel}</label>
                    <div className="relative rounded-xl shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <i className="fa-solid fa-location-dot text-gray-400 text-lg"></i>
                      </div>
                      <input
                        type="text"
                        required
                        className="block w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:ring-4 focus:ring-leaf-100 focus:border-leaf-500 transition-all text-gray-800 bg-gray-50 focus:bg-white"
                        placeholder={t.locationPlaceholder}
                        value={formData.location}
                        onChange={(e) => setFormData({...formData, location: e.target.value})}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">{t.cropLabel}</label>
                     <div className="relative rounded-xl shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <i className="fa-solid fa-seedling text-gray-400 text-lg"></i>
                      </div>
                      <input
                        type="text"
                        required
                        className="block w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:ring-4 focus:ring-leaf-100 focus:border-leaf-500 transition-all text-gray-800 bg-gray-50 focus:bg-white"
                        placeholder={t.cropPlaceholder}
                        value={formData.crop}
                        onChange={(e) => setFormData({...formData, crop: e.target.value})}
                      />
                    </div>
                  </div>
                </div>

                {/* Additional Details Input */}
                <div>
                   <label className="block text-sm font-bold text-gray-700 mb-2">{t.detailsLabel}</label>
                   <div className="relative rounded-xl shadow-sm">
                      <div className="absolute top-4 left-0 pl-4 flex items-start pointer-events-none">
                        <i className="fa-solid fa-circle-info text-gray-400 text-lg"></i>
                      </div>
                      <textarea
                        rows={3}
                        className="block w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:ring-4 focus:ring-leaf-100 focus:border-leaf-500 transition-all text-gray-800 bg-gray-50 focus:bg-white"
                        placeholder={t.detailsPlaceholder}
                        value={formData.details}
                        onChange={(e) => setFormData({...formData, details: e.target.value})}
                      />
                   </div>
                </div>

                <div>
                   <label className="block text-sm font-bold text-gray-700 mb-2">{t.sizeLabel}</label>
                   <input
                        type="number"
                        className="block w-full px-6 py-4 border border-gray-200 rounded-xl focus:ring-4 focus:ring-leaf-100 focus:border-leaf-500 transition-all text-gray-800 bg-gray-50 focus:bg-white"
                        value={formData.size}
                        onChange={(e) => setFormData({...formData, size: e.target.value})}
                      />
                </div>
                
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full flex justify-center py-5 px-6 border border-transparent rounded-xl shadow-lg text-lg font-bold text-white bg-gradient-to-r from-leaf-600 to-leaf-700 hover:from-leaf-700 hover:to-leaf-800 focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-leaf-500 transition-all transform hover:-translate-y-0.5 ${loading ? 'opacity-80 cursor-not-allowed' : ''}`}
                >
                  {loading ? (
                    <span className="flex items-center">
                      <i className="fa-solid fa-circle-notch fa-spin mr-3"></i>
                      {t.analyzing}
                    </span>
                  ) : (
                    <span>{t.analyzeBtn}</span>
                  )}
                </button>
             </form>
          </div>
        </div>
      </div>

      {analysisData && <Dashboard data={analysisData} t={t} grounding={groundingMetadata} />}

      <footer className="bg-gray-900 text-gray-400 py-12 text-center mt-auto border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-center items-center mb-8">
            <i className="fa-solid fa-leaf text-2xl text-leaf-600 mr-2"></i>
            <span className="text-2xl font-bold text-white">SmartSoil</span>
          </div>
          <p className="mb-6 max-w-md mx-auto">Empowering sustainable agriculture through artificial intelligence and satellite data.</p>
          <div className="flex justify-center space-x-8 text-2xl mb-8">
            <i className="fa-brands fa-github hover:text-white cursor-pointer transition-colors"></i>
            <i className="fa-brands fa-telegram hover:text-blue-400 cursor-pointer transition-colors"></i>
            <i className="fa-brands fa-instagram hover:text-pink-500 cursor-pointer transition-colors"></i>
            <i className="fa-brands fa-linkedin hover:text-blue-600 cursor-pointer transition-colors"></i>
          </div>
          <p className="text-sm">© 2024 SmartSoil Project. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);