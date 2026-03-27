import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ChevronRight, Mail, MessageCircle, Star, CheckCircle, Menu, X, Award, Zap, Users, TrendingUp } from 'lucide-react';
import emailjs from '@emailjs/browser';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy, addDoc, serverTimestamp } from 'firebase/firestore';

emailjs.init('njvn9St5gAnWLOI61');

const VERSION = '2.5.0';
const BUILD_DATE = new Date().toLocaleDateString('ar-SA');

interface Rating {
  id: string;
  name: string;
  comment: string;
  stars: number;
  date: any;
}

interface Service {
  id: string;
  name: string;
  description: string;
  whatsappMessage: string;
}

interface Portfolio {
  id: string;
  name: string;
  description: string;
  link: string;
}

export default function Home() {
  const [language, setLanguage] = useState<'ar' | 'en'>('ar');
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [portfolio, setPortfolio] = useState<Portfolio[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', message: '', honeypot: '' });
  const [loading, setLoading] = useState(false);
  const [formMessage, setFormMessage] = useState('');
  const [currentRatingIndex, setCurrentRatingIndex] = useState(0);
  const [stats, setStats] = useState({ projects: 150, satisfaction: 98, clients: 50 });

  const isArabic = language === 'ar';
  const dir = isArabic ? 'rtl' : 'ltr';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const ratingsQuery = query(collection(db, 'ratings'), orderBy('date', 'desc'));
        const ratingsSnapshot = await getDocs(ratingsQuery);
        const ratingsData = ratingsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Rating[];
        setRatings(ratingsData);

        const servicesSnapshot = await getDocs(collection(db, 'services'));
        const servicesData = servicesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Service[];
        setServices(servicesData);

        const portfolioSnapshot = await getDocs(collection(db, 'portfolio'));
        const portfolioData = portfolioSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Portfolio[];
        setPortfolio(portfolioData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (ratings.length === 0) return;
    const interval = setInterval(() => {
      setCurrentRatingIndex((prev) => (prev + 1) % ratings.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [ratings.length]);

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.honeypot) {
      setFormMessage('Error: Invalid submission');
      return;
    }

    if (!formData.name || !formData.email || !formData.message) {
      setFormMessage(isArabic ? 'يرجى ملء جميع الحقول' : 'Please fill all fields');
      return;
    }

    setLoading(true);

    try {
      await emailjs.send(
        'service_tllf68q',
        'template_j8bjlhw',
        {
          to_email: 'luxcode3@gmail.com',
          from_name: formData.name,
          from_email: formData.email,
          message: formData.message,
          reply_to: formData.email,
        }
      );

      setFormMessage(isArabic ? 'تم إرسال رسالتك بنجاح! سنتواصل معك خلال 24 ساعة.' : 'Message sent successfully! We will contact you within 24 hours.');
      setFormData({ name: '', email: '', message: '', honeypot: '' });
    } catch (error) {
      console.error('Error sending email:', error);
      setFormMessage(isArabic ? 'حدث خطأ في الإرسال. حاول مرة أخرى.' : 'Error sending message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsAppClick = (message: string) => {
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/966506572881?text=${encodedMessage}`, '_blank');
  };

  const content = {
    ar: {
      nav: {
        home: 'الرئيسية',
        why: 'لماذا موقع؟',
        services: 'خدماتنا',
        portfolio: 'أعمالنا',
        why_us: 'لماذا نحن؟',
        testimonials: 'آراء العملاء',
        contact: 'تواصل معنا',
      },
      hero: {
        headline: 'نبني تجارب رقمية تنمّي أعمالك',
        subheadline: 'مواقع وصفحات هبوط احترافية مصممة لجذب العملاء وتحقيق النمو',
        cta1: 'شاهد أعمالنا',
        cta2: 'تواصل معنا',
      },
      stats: {
        projects: 'مشروع مكتمل',
        satisfaction: 'رضا العملاء',
        clients: 'عميل سعيد',
        support: 'دعم فني',
      },
      whyWebsite: {
        title: 'لماذا تحتاج موقع إلكتروني؟',
        items: [
          { title: 'بيّن المصداقية', desc: 'الموقع الاحترافي يعرّف مشروعك بشكل احترافي على الساعة' },
          { title: 'يبحث الظهور', desc: 'زيد عرض ظهورك في نتائج البحث مع تحسينات SEO محترفة' },
          { title: 'يجذب العملاء', desc: 'بحيث لتحويل المستخدمين على حائل الزوار لعملاء فعليين' },
          { title: 'بيّن المصافية', desc: 'الموقع الاحترافي يعرّف مشروعك بشكل احترافي على الساعة' },
        ],
      },
      services: {
        title: 'خدماتنا',
        orderBtn: 'اطلب الخدمة',
      },
      portfolio: {
        title: 'أعمالنا',
        preview: 'معاينة',
      },
      whyChooseUs: {
        title: 'لماذا نحن؟',
        items: [
          '500+ عميل سعيد',
          '3 سنوات خبرة',
          '98% رضا العملاء',
          'تصميم احترافي',
          'تسليم سريع',
          'دعم مستمر',
        ],
      },
      testimonials: {
        title: 'آراء العملاء',
      },
      contact: {
        title: 'تواصل معنا',
        name: 'أدخل اسمك الكامل',
        phone: '05XXXXXXXX',
        message: 'اكتب رسالتك هنا...',
        send: 'إرسال الرسالة',
        sending: 'جاري الإرسال...',
      },
      footer: {
        text: '© 2024 LuxCod. جميع الحقوق محفوظة.',
        made: 'تم صنع ب',
        privacy: 'سياسة الخصوصية',
        terms: 'الشروط والأحكام',
      },
    },
    en: {
      nav: {
        home: 'Home',
        why: 'Why Website?',
        services: 'Services',
        portfolio: 'Portfolio',
        why_us: 'Why Us?',
        testimonials: 'Testimonials',
        contact: 'Contact',
      },
      hero: {
        headline: 'We Build Digital Experiences That Grow Your Business',
        subheadline: 'Professional websites and landing pages designed to attract customers and achieve growth',
        cta1: 'View Our Work',
        cta2: 'Contact Us',
      },
      stats: {
        projects: 'Projects Completed',
        satisfaction: 'Client Satisfaction',
        clients: 'Happy Clients',
        support: '24/7 Support',
      },
      whyWebsite: {
        title: 'Why Do You Need a Website?',
        items: [
          { title: 'Build Credibility', desc: 'A professional website presents your business professionally 24/7' },
          { title: 'Improve Visibility', desc: 'Increase your visibility in search results with professional SEO' },
          { title: 'Attract Customers', desc: 'Convert website visitors into actual paying customers' },
          { title: 'Build Trust', desc: 'A professional website builds customer trust and confidence' },
        ],
      },
      services: {
        title: 'Our Services',
        orderBtn: 'Order Service',
      },
      portfolio: {
        title: 'Our Work',
        preview: 'Preview',
      },
      whyChooseUs: {
        title: 'Why Choose Us?',
        items: [
          '500+ Happy Clients',
          '3 Years Experience',
          '98% Client Satisfaction',
          'Professional Design',
          'Fast Delivery',
          'Continuous Support',
        ],
      },
      testimonials: {
        title: 'Client Reviews',
      },
      contact: {
        title: 'Contact Us',
        name: 'Enter Your Full Name',
        phone: '05XXXXXXXX',
        message: 'Write your message here...',
        send: 'Send Message',
        sending: 'Sending...',
      },
      footer: {
        text: '© 2024 LuxCod. All rights reserved.',
        made: 'Made with',
        privacy: 'Privacy Policy',
        terms: 'Terms & Conditions',
      },
    },
  };

  const t = content[language];

  return (
    <div dir={dir} className="min-h-screen bg-black text-white overflow-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-yellow-500/20">
        <div className="container flex items-center justify-between py-4">
          <div className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-purple-500 bg-clip-text text-transparent">
            LuxCod
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            {Object.entries(t.nav).map(([key, label]) => (
              <a key={key} href={`#${key}`} className="text-sm font-medium hover:text-yellow-400 transition-colors">
                {label}
              </a>
            ))}
          </div>
          
          <div className="flex items-center gap-4">
            <button
              onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
              className="px-3 py-1 text-sm border border-yellow-400 text-yellow-400 rounded hover:bg-yellow-400 hover:text-black transition-colors"
            >
              {language === 'ar' ? 'EN' : 'AR'}
            </button>
            
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
        
        {mobileMenuOpen && (
          <div className="md:hidden bg-black/90 border-t border-yellow-500/20">
            <div className="container py-4 flex flex-col gap-4">
              {Object.entries(t.nav).map(([key, label]) => (
                <a
                  key={key}
                  href={`#${key}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-sm font-medium hover:text-yellow-400 transition-colors"
                >
                  {label}
                </a>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section
        id="home"
        className="pt-32 pb-20 md:pt-40 md:pb-32 relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #000000 0%, #1a0033 50%, #000000 100%)',
        }}
      >
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-10 w-72 h-72 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-yellow-600 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
        </div>

        <div className="container relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="mb-6 inline-block px-4 py-2 bg-yellow-500/10 border border-yellow-500/30 rounded-full">
              <span className="text-yellow-400 text-sm font-medium">وكالة لكس كود الرقمية</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-yellow-300 via-purple-300 to-yellow-300 bg-clip-text text-transparent leading-tight">
              {t.hero.headline}
            </h1>
            
            <p className="text-lg md:text-xl mb-8 text-gray-300 max-w-2xl mx-auto">
              {t.hero.subheadline}
            </p>
            
            <div className="flex flex-col md:flex-row gap-4 justify-center mb-16">
              <Button 
                className="px-8 py-3 bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-bold hover:shadow-lg hover:shadow-yellow-500/50 transition-all"
                onClick={() => document.getElementById('portfolio')?.scrollIntoView({ behavior: 'smooth' })}
              >
                {t.hero.cta1}
              </Button>
              <Button 
                className="px-8 py-3 border-2 border-yellow-400 text-yellow-400 bg-transparent hover:bg-yellow-400 hover:text-black transition-all"
                onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
              >
                {t.hero.cta2}
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="p-4 bg-white/5 border border-yellow-500/20 rounded-lg backdrop-blur">
                <div className="text-3xl font-bold text-yellow-400 mb-2">150+</div>
                <div className="text-sm text-gray-300">{t.stats.projects}</div>
              </div>
              <div className="p-4 bg-white/5 border border-yellow-500/20 rounded-lg backdrop-blur">
                <div className="text-3xl font-bold text-yellow-400 mb-2">98%</div>
                <div className="text-sm text-gray-300">{t.stats.satisfaction}</div>
              </div>
              <div className="p-4 bg-white/5 border border-yellow-500/20 rounded-lg backdrop-blur">
                <div className="text-3xl font-bold text-yellow-400 mb-2">50+</div>
                <div className="text-sm text-gray-300">{t.stats.clients}</div>
              </div>
              <div className="p-4 bg-white/5 border border-yellow-500/20 rounded-lg backdrop-blur">
                <div className="text-3xl font-bold text-yellow-400 mb-2">24/7</div>
                <div className="text-sm text-gray-300">{t.stats.support}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Website */}
      <section id="why" className="section-padding bg-gradient-to-b from-black to-purple-900/20">
        <div className="container">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 bg-gradient-to-r from-yellow-300 to-purple-300 bg-clip-text text-transparent">
            {t.whyWebsite.title}
          </h2>
          <div className="grid md:grid-cols-4 gap-6">
            {t.whyWebsite.items.map((item, idx) => (
              <Card key={idx} className="p-6 bg-white/5 border border-yellow-500/20 hover:border-yellow-500/50 transition-all backdrop-blur hover:bg-white/10">
                <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-purple-500 rounded-lg mb-4 flex items-center justify-center">
                  {idx === 0 && <Award size={24} className="text-black" />}
                  {idx === 1 && <TrendingUp size={24} className="text-black" />}
                  {idx === 2 && <Users size={24} className="text-black" />}
                  {idx === 3 && <Zap size={24} className="text-black" />}
                </div>
                <h3 className="text-lg font-bold mb-2 text-yellow-300">{item.title}</h3>
                <p className="text-gray-300 text-sm">{item.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="section-padding">
        <div className="container">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 bg-gradient-to-r from-yellow-300 to-purple-300 bg-clip-text text-transparent">
            {t.services.title}
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.length > 0 ? (
              services.map((service, idx) => (
                <Card key={service.id} className="p-6 bg-gradient-to-br from-white/5 to-white/10 border border-yellow-500/20 hover:border-yellow-500/50 transition-all backdrop-blur hover:shadow-lg hover:shadow-yellow-500/20 group cursor-pointer" style={{ animationDelay: `${idx * 0.1}s` }}>
                  <h3 className="text-xl font-bold mb-3 text-yellow-300 group-hover:text-yellow-200 transition-colors">{service.name}</h3>
                  <p className="text-gray-300 mb-6 text-sm">{service.description}</p>
                  <Button
                    className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-bold hover:shadow-lg hover:shadow-yellow-500/50 transition-all"
                    onClick={() => handleWhatsAppClick(service.whatsappMessage)}
                  >
                    {t.services.orderBtn}
                  </Button>
                </Card>
              ))
            ) : (
              <p className="text-center text-gray-400 col-span-full">{isArabic ? 'جاري تحميل الخدمات...' : 'Loading services...'}</p>
            )}
          </div>
        </div>
      </section>

      {/* Portfolio Section */}
      <section id="portfolio" className="section-padding bg-gradient-to-b from-black to-purple-900/20">
        <div className="container">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 bg-gradient-to-r from-yellow-300 to-purple-300 bg-clip-text text-transparent">
            {t.portfolio.title}
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {portfolio.length > 0 ? (
              portfolio.map((project, idx) => (
                <Card key={project.id} className="overflow-hidden bg-gradient-to-br from-white/5 to-white/10 border border-yellow-500/20 hover:border-yellow-500/50 transition-all backdrop-blur group cursor-pointer hover:shadow-lg hover:shadow-yellow-500/20" style={{ animationDelay: `${idx * 0.1}s` }}>
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-2 text-yellow-300 group-hover:text-yellow-200 transition-colors">{project.name}</h3>
                    <p className="text-gray-300 mb-4 text-sm">{project.description}</p>
                    <a
                      href={project.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-yellow-400 hover:text-yellow-300 transition-all group/link"
                    >
                      {t.portfolio.preview}
                      <ChevronRight size={16} className={`${isArabic ? 'mr-2' : 'ml-2'} group-hover/link:translate-x-1 transition-transform`} />
                    </a>
                  </div>
                </Card>
              ))
            ) : (
              <p className="text-center text-gray-400 col-span-full">{isArabic ? 'جاري تحميل المشاريع...' : 'Loading projects...'}</p>
            )}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section id="why_us" className="section-padding">
        <div className="container">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 bg-gradient-to-r from-yellow-300 to-purple-300 bg-clip-text text-transparent">
            {t.whyChooseUs.title}
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {t.whyChooseUs.items.map((item, idx) => (
              <div key={idx} className="flex items-center gap-4 p-4 bg-white/5 border border-yellow-500/20 rounded-lg hover:border-yellow-500/50 transition-all backdrop-blur">
                <CheckCircle className="w-6 h-6 text-yellow-400 flex-shrink-0" />
                <span className="text-lg text-gray-100">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="section-padding bg-gradient-to-b from-black to-purple-900/20">
        <div className="container">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 bg-gradient-to-r from-yellow-300 to-purple-300 bg-clip-text text-transparent">
            {t.testimonials.title}
          </h2>
          
          {ratings.length > 0 && (
            <div className="mb-12">
              <Card className="p-8 bg-gradient-to-br from-white/5 to-white/10 border border-yellow-500/20 backdrop-blur">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(ratings[currentRatingIndex].stars)].map((_, i) => (
                    <Star key={i} size={20} className="fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-lg mb-6 italic text-gray-100">"{ratings[currentRatingIndex].comment}"</p>
                <p className="font-semibold text-yellow-300">{ratings[currentRatingIndex].name}</p>
              </Card>
              
              <div className="flex justify-center gap-2 mt-6">
                {ratings.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentRatingIndex(idx)}
                    className={`w-3 h-3 rounded-full transition-colors ${
                      idx === currentRatingIndex ? 'bg-yellow-400' : 'bg-gray-600'
                    }`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="section-padding">
        <div className="container">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 bg-gradient-to-r from-yellow-300 to-purple-300 bg-clip-text text-transparent">
            {t.contact.title}
          </h2>
          <Card className="p-8 bg-gradient-to-br from-white/5 to-white/10 border border-yellow-500/20 backdrop-blur max-w-2xl mx-auto">
            <form onSubmit={handleSubmitForm} className="space-y-6">
              <input
                type="text"
                name="honeypot"
                value={formData.honeypot}
                onChange={(e) => setFormData({ ...formData, honeypot: e.target.value })}
                style={{ display: 'none' }}
              />
              
              <Input
                type="text"
                placeholder={t.contact.name}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="bg-white/10 border-yellow-500/30 text-white placeholder-gray-400"
              />
              <Input
                type="email"
                placeholder={t.contact.phone}
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="bg-white/10 border-yellow-500/30 text-white placeholder-gray-400"
              />
              <Textarea
                placeholder={t.contact.message}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                required
                className="bg-white/10 border-yellow-500/30 text-white placeholder-gray-400"
              />
              
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-bold hover:shadow-lg hover:shadow-yellow-500/50 transition-all"
              >
                {loading ? t.contact.sending : t.contact.send}
              </Button>
              
              {formMessage && (
                <p className={`text-center ${
                  formMessage.includes('Error') ? 'text-red-400' : 'text-green-400'
                }`}>
                  {formMessage}
                </p>
              )}
            </form>
          </Card>
        </div>
      </section>

      {/* 3D Floating WhatsApp Button */}
      <button
        onClick={() => handleWhatsAppClick('مرحبا، أريد التواصل مع LuxCod')}
        className="fixed bottom-8 left-8 w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 text-white rounded-full flex items-center justify-center shadow-2xl hover:shadow-green-500/50 transition-all z-40 group hover:scale-110 animate-pulse"
        title="WhatsApp"
        style={{
          boxShadow: '0 0 30px rgba(34, 197, 94, 0.6), inset 0 0 20px rgba(255, 255, 255, 0.3)',
        }}
      >
        <MessageCircle size={28} className="group-hover:scale-110 transition-transform" />
      </button>

      {/* Footer */}
      <footer className="bg-black/80 border-t border-yellow-500/20 py-12 backdrop-blur">
        <div className="container">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="text-xl font-bold text-yellow-400 mb-4">LuxCod</h3>
              <p className="text-gray-400">وكالة رقمية متخصصة في بناء تجارب رقمية احترافية</p>
            </div>
            <div>
              <h4 className="font-bold text-yellow-400 mb-4">{isArabic ? 'الروابط' : 'Links'}</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#home" className="hover:text-yellow-400 transition-colors">{t.nav.home}</a></li>
                <li><a href="#services" className="hover:text-yellow-400 transition-colors">{t.nav.services}</a></li>
                <li><a href="#portfolio" className="hover:text-yellow-400 transition-colors">{t.nav.portfolio}</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-yellow-400 mb-4">{isArabic ? 'قانوني' : 'Legal'}</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-yellow-400 transition-colors">{t.footer.privacy}</a></li>
                <li><a href="#" className="hover:text-yellow-400 transition-colors">{t.footer.terms}</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-yellow-500/20 pt-8 text-center text-gray-400">
            <p className="mb-2">{t.footer.text}</p>
            <p className="text-sm">
              {t.footer.made} <span className="text-red-500">❤️</span> | v{VERSION} | {BUILD_DATE}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
