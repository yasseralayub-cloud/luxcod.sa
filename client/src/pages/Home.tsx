import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ChevronRight, Mail, MessageCircle, Star, CheckCircle, Menu, X } from 'lucide-react';
import emailjs from '@emailjs/browser';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy, addDoc, serverTimestamp } from 'firebase/firestore';
import { useScrollReveal } from '@/hooks/useScrollReveal';

emailjs.init('njvn9St5gAnWLOI61');

const VERSION = '4.0.0';
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

  // Scroll Reveal Hooks
  const whyWebsiteRef = useScrollReveal();
  const servicesRef = useScrollReveal();
  const portfolioRef = useScrollReveal();
  const whyChooseRef = useScrollReveal();
  const testimonialsRef = useScrollReveal();
  const contactRef = useScrollReveal();

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
        services: 'الخدمات',
        portfolio: 'أعمالنا',
        why_us: 'لماذا نحن؟',
        testimonials: 'التقييمات',
        contact: 'اتصل بنا',
      },
      hero: {
        headline: 'نبني تجارب رقمية تنمي عملك',
        subheadline: 'وكالة رقمية متخصصة في تصميم المواقع والتطبيقات والخدمات الرقمية المتقدمة',
        cta1: 'ابدأ الآن',
        cta2: 'تواصل معنا',
      },
      whyWebsite: {
        title: 'لماذا موقع الويب مهم؟',
        items: [
          { title: 'المصداقية', desc: 'موقع احترافي يزيد ثقة العملاء بعملك' },
          { title: 'العملاء', desc: 'وصول أسهل للعملاء المحتملين 24/7' },
          { title: 'تحسين البحث', desc: 'ظهور أفضل في محركات البحث' },
          { title: 'المبيعات', desc: 'مبيعات مستمرة حتى أثناء نومك' },
        ],
      },
      services: {
        title: 'خدماتنا',
        orderBtn: 'اطلب الآن',
      },
      portfolio: {
        title: 'أعمالنا',
        preview: 'عرض المشروع',
      },
      whyChooseUs: {
        title: 'لماذا تختار LuxCod؟',
        items: [
          'فريق محترف ومتخصص',
          'تصاميم عصرية وفاخرة',
          'دعم فني متواصل',
          'أسعار تنافسية',
          'التسليم في الوقت المحدد',
          'ضمان الجودة',
        ],
      },
      testimonials: {
        title: 'آراء عملائنا',
      },
      contact: {
        title: 'تواصل معنا',
        name: 'الاسم',
        email: 'البريد الإلكتروني',
        message: 'الرسالة',
        send: 'إرسال',
        sending: 'جاري الإرسال...',
      },
      footer: {
        text: '© 2024 LuxCod. جميع الحقوق محفوظة.',
        made: 'صنع بـ ♥ من أجلكم',
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
        subheadline: 'A digital agency specialized in website design, applications, and advanced digital services',
        cta1: 'Get Started',
        cta2: 'Contact Us',
      },
      whyWebsite: {
        title: 'Why Website Matters?',
        items: [
          { title: 'Credibility', desc: 'A professional website builds customer trust' },
          { title: 'Customers', desc: 'Easier access to potential customers 24/7' },
          { title: 'SEO', desc: 'Better visibility in search engines' },
          { title: '24/7 Sales', desc: 'Continuous sales even while you sleep' },
        ],
      },
      services: {
        title: 'Our Services',
        orderBtn: 'Order Now',
      },
      portfolio: {
        title: 'Our Work',
        preview: 'View Project',
      },
      whyChooseUs: {
        title: 'Why Choose LuxCod?',
        items: [
          'Professional and specialized team',
          'Modern and luxury designs',
          'Continuous technical support',
          'Competitive prices',
          'On-time delivery',
          'Quality guarantee',
        ],
      },
      testimonials: {
        title: 'Client Reviews',
      },
      contact: {
        title: 'Contact Us',
        name: 'Name',
        email: 'Email',
        message: 'Message',
        send: 'Send',
        sending: 'Sending...',
      },
      footer: {
        text: '© 2024 LuxCod. All rights reserved.',
        made: 'Made with ♥ for you',
      },
    },
  };

  const t = content[language];

  return (
    <div dir={dir} className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="container flex items-center justify-between py-4">
          <a href="#home" onClick={() => document.getElementById('home')?.scrollIntoView({ behavior: 'smooth' })} className="text-2xl font-bold cursor-pointer hover:opacity-80 transition-opacity" style={{ color: '#d4af37' }}>LuxCod</a>
          <div className="text-xs text-gray-500 ml-2">v{VERSION}</div>
          
          <div className="hidden md:flex items-center gap-8">
            {Object.entries(t.nav).map(([key, label]) => (
              <a key={key} href={`#${key}`} className="text-sm font-medium hover:text-accent transition-colors">
                {label}
              </a>
            ))}
          </div>
          
          <div className="flex items-center gap-4">
            <button
              onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
              className="px-3 py-1 text-sm border border-accent text-accent rounded hover:bg-accent hover:text-accent-foreground transition-colors"
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
          <div className="md:hidden bg-card border-t border-border">
            <div className="container py-4 flex flex-col gap-4">
              {Object.entries(t.nav).map(([key, label]) => (
                <a
                  key={key}
                  href={`#${key}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-sm font-medium hover:text-accent transition-colors"
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
          backgroundImage: `url('https://d2xsxph8kpxj0f.cloudfront.net/310519663463093499/WZrBg3gahPGwwsPaaHVidr/hero-background-GteUJJoV5NvqfgQJxCrUu9.webp')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="container relative z-10">
          <div className="max-w-3xl mx-auto text-center animate-fade-in">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-gradient">
              {t.hero.headline}
            </h1>
            <p className="text-lg md:text-xl mb-8 text-gray-300">
              {t.hero.subheadline}
            </p>
            <div className="flex flex-col md:flex-row gap-4 justify-center">
              <Button className="btn-luxury" onClick={() => handleWhatsAppClick('مرحبا، أريد إنشاء موقع ويب')}>
                {t.hero.cta1}
              </Button>
              <Button className="btn-luxury-outline" onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}>
                {t.hero.cta2}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Why Website Matters */}
      <section id="why" className="section-padding bg-card" ref={whyWebsiteRef.ref}>
        <div className={`container transition-all duration-700 ${whyWebsiteRef.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 animate-slide-up">{t.whyWebsite.title}</h2>
          <div className="grid md:grid-cols-4 gap-8">
            {t.whyWebsite.items.map((item, idx) => (
              <Card 
                key={idx} 
                className="p-6 bg-background border-border hover:border-accent transition-all hover:shadow-lg hover:shadow-accent/20 hover-lift"
                style={{
                  animation: whyWebsiteRef.isVisible ? `slideUp 0.6s ease-out ${idx * 0.1}s both` : 'none',
                }}
              >
                <CheckCircle className="w-8 h-8 text-accent mb-4" />
                <h3 className="text-lg font-bold mb-2">{item.title}</h3>
                <p className="text-gray-400">{item.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="section-padding" ref={servicesRef.ref}>
        <div className={`container transition-all duration-700 ${servicesRef.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 animate-slide-up">{t.services.title}</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.length > 0 ? (
              services.map((service, idx) => (
                <Card 
                  key={service.id} 
                  className="p-6 bg-card border-border hover:border-accent transition-all hover:shadow-lg hover:shadow-accent/20 hover-lift"
                  style={{
                    animation: servicesRef.isVisible ? `slideUp 0.6s ease-out ${idx * 0.1}s both` : 'none',
                  }}
                >
                  <h3 className="text-xl font-bold mb-3 text-accent">{service.name}</h3>
                  <p className="text-gray-400 mb-6">{service.description}</p>
                  <Button
                    className="btn-luxury w-full"
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
      <section id="portfolio" className="section-padding bg-card" ref={portfolioRef.ref}>
        <div className={`container transition-all duration-700 ${portfolioRef.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 animate-slide-up">{t.portfolio.title}</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {portfolio.length > 0 ? (
              portfolio.map((project, idx) => (
                <Card 
                  key={project.id} 
                  className="overflow-hidden bg-background border-border hover:border-accent transition-all group cursor-pointer hover-lift"
                  style={{
                    animation: portfolioRef.isVisible ? `slideUp 0.6s ease-out ${idx * 0.1}s both` : 'none',
                  }}
                >
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-2 group-hover:text-accent transition-colors">{project.name}</h3>
                    <p className="text-gray-400 mb-4">{project.description}</p>
                    <a
                      href={project.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-accent hover:gap-2 transition-all"
                    >
                      {t.portfolio.preview}
                      <ChevronRight size={16} className={isArabic ? 'mr-2' : 'ml-2'} />
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
      <section id="why_us" className="section-padding" ref={whyChooseRef.ref}>
        <div className={`container transition-all duration-700 ${whyChooseRef.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 animate-slide-up">{t.whyChooseUs.title}</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {t.whyChooseUs.items.map((item, idx) => (
              <div 
                key={idx} 
                className="flex items-center gap-4"
                style={{
                  animation: whyChooseRef.isVisible ? `slideUp 0.6s ease-out ${idx * 0.1}s both` : 'none',
                }}
              >
                <CheckCircle className="w-6 h-6 text-accent flex-shrink-0" />
                <span className="text-lg">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="section-padding bg-card" ref={testimonialsRef.ref}>
        <div className={`container transition-all duration-700 ${testimonialsRef.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 animate-slide-up">{t.testimonials.title}</h2>
          
          {ratings.length > 0 && (
            <div className="mb-12">
              <Card className="p-8 bg-background border-border">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(ratings[currentRatingIndex].stars)].map((_, i) => (
                    <Star key={i} size={20} className="fill-accent text-accent" />
                  ))}
                </div>
                <p className="text-lg mb-6 italic">"{ratings[currentRatingIndex].comment}"</p>
                <p className="font-semibold text-accent">{ratings[currentRatingIndex].name}</p>
              </Card>
              
              <div className="flex justify-center gap-2 mt-6">
                {ratings.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentRatingIndex(idx)}
                    className={`w-3 h-3 rounded-full transition-colors ${
                      idx === currentRatingIndex ? 'bg-accent' : 'bg-gray-600'
                    }`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="section-padding" ref={contactRef.ref}>
        <div className={`container transition-all duration-700 ${contactRef.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 animate-slide-up">{t.contact.title}</h2>
          <Card className="p-8 bg-card border-border max-w-2xl mx-auto">
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
                className="bg-background border-border text-foreground"
              />
              <Input
                type="email"
                placeholder={t.contact.email}
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="bg-background border-border text-foreground"
              />
              <Textarea
                placeholder={t.contact.message}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                required
                className="bg-background border-border text-foreground"
              />
              
              <Button
                type="submit"
                disabled={loading}
                className="btn-luxury w-full"
              >
                {loading ? t.contact.sending : t.contact.send}
              </Button>
              
              {formMessage && (
                <p className={`text-center ${
                  formMessage.includes('Error') ? 'text-red-500' : 'text-green-500'
                }`}>
                  {formMessage}
                </p>
              )}
            </form>
          </Card>
        </div>
      </section>

      {/* Floating WhatsApp Button */}
      <button
        onClick={() => handleWhatsAppClick('مرحبا، أريد التواصل مع LuxCod')}
        className="fixed bottom-8 left-8 w-16 h-16 text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-125 transition-all z-40 animate-bounce"
        title="WhatsApp"
        style={{
          background: 'linear-gradient(135deg, #25d366 0%, #20ba58 100%)',
          boxShadow: '0 0 40px rgba(37, 211, 102, 0.8), 0 0 80px rgba(37, 211, 102, 0.4)',
        }}
      >
        <MessageCircle size={28} />
      </button>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-8">
        <div className="container text-center text-gray-400">
          <p className="mb-2">{t.footer.text}</p>
          <p className="text-sm">
            {t.footer.made}
          </p>
        </div>
      </footer>
    </div>
  );
}
