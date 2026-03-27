'use client';

import { useEffect, useRef, useState } from 'react';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { Mail, Phone, MessageCircle, Zap, Code, Palette, Smartphone, Rocket } from 'lucide-react';

export default function Home() {
  const [language, setLanguage] = useState<'ar' | 'en'>('ar');
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Animated background with particles
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      opacity: number;
    }> = [];

    // Create particles
    for (let i = 0; i < 50; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        size: Math.random() * 3 + 1,
        opacity: Math.random() * 0.5 + 0.3,
      });
    }

    const animate = () => {
      // Clear with gradient background
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, '#0a0e27');
      gradient.addColorStop(0.5, '#1a0a3e');
      gradient.addColorStop(1, '#0a0e27');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw particles
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        // Bounce off edges
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        // Draw particle with glow
        ctx.fillStyle = `rgba(100, 200, 255, ${p.opacity})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        // Draw glow
        ctx.strokeStyle = `rgba(150, 220, 255, ${p.opacity * 0.5})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 2, 0, Math.PI * 2);
        ctx.stroke();
      });

      requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const playSound = () => {
    // Create a simple beep sound using Web Audio API
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 800;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
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
        title: '🚀 نبني تجارب رقمية تنمي عملك',
        subtitle: '💎 وكالة رقمية متخصصة في تصميم المواقع والتطبيقات والخدمات الرقمية المتقدمة',
        cta1: '⚡ ابدأ الآن',
        cta2: '💬 تواصل معنا',
      },
      why_website: {
        title: '❓ لماذا موقع الويب مهم؟',
        items: [
          { icon: '🛡️', title: 'المصداقية', desc: 'موقع احترافي يزيد ثقة العملاء بعملك' },
          { icon: '👥', title: 'العملاء', desc: 'وصول أسهل للعملاء المحتملين 24/7' },
          { icon: '🔍', title: 'تحسين البحث', desc: 'ظهور أفضل في محركات البحث' },
          { icon: '💰', title: 'المبيعات', desc: 'مبيعات مستمرة حتى أثناء نومك' },
        ],
      },
      services: {
        title: '⚙️ خدماتنا',
        items: [
          { icon: '🎨', title: 'تصميم المواقع', desc: 'تصميم مواقع ويب احترافية وعصرية تجذب العملاء وتزيد المبيعات' },
          { icon: '✨', title: 'تحسين واجهة المستخدم', desc: 'تحسين تجربة المستخدم وواجهة التطبيقات الخاصة بك' },
          { icon: '🔗', title: 'التكاملات الرقمية', desc: 'تكامل WhatsApp وخرائط Google ووسائل التواصل الاجتماعي' },
          { icon: '🎯', title: 'صفحات الهبوط', desc: 'إنشاء صفحات هبوط عالية التحويل لحملاتك التسويقية' },
          { icon: '🤖', title: 'روبوتات الرد التلقائي', desc: 'إنشاء روبوتات WhatsApp ذكية للرد التلقائي على العملاء' },
          { icon: '📱', title: 'تطبيقات الجوال', desc: 'تطوير تطبيقات جوال احترافية لـ iOS و Android' },
        ],
      },
      portfolio: {
        title: '🎬 أعمالنا',
        items: [
          { title: '💄 Vivid Beauty', desc: 'موقع متخصص في منتجات العناية بالجمال والعناية الشخصية' },
          { title: '🧖 Yashim Spa', desc: 'موقع منتجع صحي فاخر يقدم خدمات استرخاء واسترجاع النشاط' },
          { title: '🎭 Red Carpet', desc: 'منصة حجز الفعاليات والحفلات الراقية' },
        ],
      },
      why_us: {
        title: '⭐ لماذا تختار LuxCod؟',
        items: [
          '👨‍💼 فريق محترف ومتخصص',
          '🎨 تصاميم عصرية وفاخرة',
          '📞 دعم فني متواصل',
          '💵 أسعار تنافسية',
          '⏰ التسليم في الوقت المحدد',
          '✅ ضمان الجودة',
        ],
      },
      testimonials: {
        title: '💬 آراء عملائنا',
        items: [
          { text: '"الخدمة ممتازة، فقط تأخر بسيط في الرد، لكن النتيجة تستاهل."', author: '👨‍💼 فهد المطيري' },
          { text: '"موقع رائع وسهل الاستخدام، فريق LuxCod محترف جداً."', author: '👩‍💼 نورا الأحمد' },
          { text: '"أفضل وكالة رقمية تعاملت معها، أنصح بها بشدة!"', author: '👨‍🔧 محمد علي' },
          { text: '"تصميم فاخر وخدمة عملاء ممتازة، شكراً LuxCod!"', author: '👩‍🏫 سارة الدوسري' },
          { text: '"النتائج تفوقت توقعاتي، شكراً على الجهد الرائع!"', author: '👨‍💻 عبدالله الشمري' },
        ],
      },
      contact: {
        title: '📧 تواصل معنا',
        name: 'الاسم',
        email: 'البريد الإلكتروني',
        message: 'الرسالة',
        send: '✉️ إرسال',
        sending: '⏳ جاري الإرسال...',
      },
      footer: {
        text: '© 2024 LuxCod. جميع الحقوق محفوظة.',
        made: '✨ صنع بـ ♥ من أجلكم',
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
        title: '🚀 Building Digital Experiences That Grow Your Business',
        subtitle: '💎 A specialized digital agency in website design, applications, and advanced digital services',
        cta1: '⚡ Start Now',
        cta2: '💬 Contact Us',
      },
      why_website: {
        title: '❓ Why Website Matters?',
        items: [
          { icon: '🛡️', title: 'Credibility', desc: 'A professional website increases customer trust in your business' },
          { icon: '👥', title: 'Customers', desc: 'Easier access for potential customers 24/7' },
          { icon: '🔍', title: 'SEO', desc: 'Better visibility in search engines' },
          { icon: '💰', title: 'Sales', desc: 'Continuous sales even while you sleep' },
        ],
      },
      services: {
        title: '⚙️ Our Services',
        items: [
          { icon: '🎨', title: 'Web Design', desc: 'Professional and modern website design that attracts customers and increases sales' },
          { icon: '✨', title: 'UI Improvement', desc: 'Improve user experience and application interfaces' },
          { icon: '🔗', title: 'Digital Integrations', desc: 'WhatsApp, Google Maps, and social media integration' },
          { icon: '🎯', title: 'Landing Pages', desc: 'Create high-converting landing pages for your campaigns' },
          { icon: '🤖', title: 'Auto-Reply Bots', desc: 'Create smart WhatsApp bots for automatic customer responses' },
          { icon: '📱', title: 'Mobile Apps', desc: 'Professional mobile app development for iOS and Android' },
        ],
      },
      portfolio: {
        title: '🎬 Our Works',
        items: [
          { title: '💄 Vivid Beauty', desc: 'A website specialized in beauty and personal care products' },
          { title: '🧖 Yashim Spa', desc: 'A luxury spa website offering relaxation and wellness services' },
          { title: '🎭 Red Carpet', desc: 'An events and party booking platform' },
        ],
      },
      why_us: {
        title: '⭐ Why Choose LuxCod?',
        items: [
          '👨‍💼 Professional and specialized team',
          '🎨 Modern and luxury designs',
          '📞 Continuous technical support',
          '💵 Competitive prices',
          '⏰ On-time delivery',
          '✅ Quality guarantee',
        ],
      },
      testimonials: {
        title: '💬 Client Reviews',
        items: [
          { text: '"Excellent service, just a slight delay in response, but the result is worth it."', author: '👨‍💼 Fahad Al-Mutairi' },
          { text: '"Amazing website and easy to use, LuxCod team is very professional."', author: '👩‍💼 Nora Al-Ahmed' },
          { text: '"Best digital agency I\'ve worked with, highly recommend!"', author: '👨‍🔧 Muhammad Ali' },
          { text: '"Luxury design and excellent customer service, thank you LuxCod!"', author: '👩‍🏫 Sarah Al-Dosari' },
          { text: '"Results exceeded my expectations, thank you for the great effort!"', author: '👨‍💻 Abdullah Al-Shammari' },
        ],
      },
      contact: {
        title: '📧 Contact Us',
        name: 'Name',
        email: 'Email',
        message: 'Message',
        send: '✉️ Send',
        sending: '⏳ Sending...',
      },
      footer: {
        text: '© 2024 LuxCod. All rights reserved.',
        made: '✨ Made with ♥ for you',
      },
    },
  };

  const t = content[language];

  const handleScroll = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleContactSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    playSound();

    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      // Simulate sending
      await new Promise((resolve) => setTimeout(resolve, 1000));
      playSound();
      alert(language === 'ar' ? '✅ تم إرسال الرسالة بنجاح!' : '✅ Message sent successfully!');
      form.reset();
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const RevealSection = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => {
    const ref = useRef<HTMLDivElement>(null);
    const isVisible = useScrollReveal(ref);

    return (
      <div
        ref={ref}
        className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'} ${className}`}
      >
        {children}
      </div>
    );
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-950 via-purple-900 to-slate-950 text-white overflow-hidden">
      {/* Animated background canvas */}
      <canvas ref={canvasRef} className="fixed top-0 left-0 w-full h-full pointer-events-none opacity-30" />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-slate-950/80 to-transparent backdrop-blur-md border-b border-cyan-500/20">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
            ✨ LuxCod
          </div>
          <div className="flex gap-6 items-center">
            <button
              onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
              className="px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/40 rounded-lg transition-all duration-300 border border-cyan-500/50 hover:border-cyan-400"
            >
              {language === 'ar' ? 'EN' : 'AR'}
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 px-4">
        <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/10 via-transparent to-purple-500/10" />
        <RevealSection className="text-center max-w-4xl mx-auto relative z-10">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent animate-pulse">
            {t.hero.title}
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8">{t.hero.subtitle}</p>
          <div className="flex gap-4 justify-center flex-wrap">
            <button
              onClick={() => {
                playSound();
                handleScroll('contact');
              }}
              className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 rounded-lg font-bold transition-all duration-300 transform hover:scale-105 shadow-lg shadow-cyan-500/50"
            >
              {t.hero.cta1}
            </button>
            <button
              onClick={() => {
                playSound();
                window.open('https://wa.me/966500000000', '_blank');
              }}
              className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500 rounded-lg font-bold transition-all duration-300 transform hover:scale-105 shadow-lg shadow-purple-500/50"
            >
              {t.hero.cta2}
            </button>
          </div>
        </RevealSection>
      </section>

      {/* Why Website Section */}
      <section id="why" className="relative py-20 px-4">
        <RevealSection>
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
            {t.why_website.title}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {t.why_website.items.map((item, i) => (
              <RevealSection key={i} className="group">
                <div className="p-6 bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border border-cyan-500/30 rounded-lg hover:border-cyan-400/60 transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/30">
                  <div className="text-4xl mb-4">{item.icon}</div>
                  <h3 className="text-xl font-bold mb-2 text-cyan-300">{item.title}</h3>
                  <p className="text-gray-400">{item.desc}</p>
                </div>
              </RevealSection>
            ))}
          </div>
        </RevealSection>
      </section>

      {/* Services Section */}
      <section id="services" className="relative py-20 px-4">
        <RevealSection>
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            {t.services.title}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {t.services.items.map((service, i) => (
              <RevealSection key={i} className="group">
                <div className="p-6 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-lg hover:border-purple-400/60 transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-purple-500/30">
                  <div className="text-4xl mb-4">{service.icon}</div>
                  <h3 className="text-xl font-bold mb-2 text-purple-300">{service.title}</h3>
                  <p className="text-gray-400 mb-4">{service.desc}</p>
                  <button
                    onClick={() => {
                      playSound();
                      handleScroll('contact');
                    }}
                    className="w-full px-4 py-2 bg-purple-600/50 hover:bg-purple-500 rounded transition-all duration-300 text-sm font-bold"
                  >
                    🎯 {language === 'ar' ? 'اطلب الآن' : 'Request Now'}
                  </button>
                </div>
              </RevealSection>
            ))}
          </div>
        </RevealSection>
      </section>

      {/* Portfolio Section */}
      <section id="portfolio" className="relative py-20 px-4">
        <RevealSection>
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
            {t.portfolio.title}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {t.portfolio.items.map((project, i) => (
              <RevealSection key={i} className="group">
                <div className="p-6 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/30 rounded-lg hover:border-blue-400/60 transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-blue-500/30">
                  <h3 className="text-xl font-bold mb-2 text-blue-300">{project.title}</h3>
                  <p className="text-gray-400 mb-4">{project.desc}</p>
                  <button
                    onClick={() => {
                      playSound();
                      alert(language === 'ar' ? '🔗 سيتم فتح المشروع قريباً' : '🔗 Project will open soon');
                    }}
                    className="w-full px-4 py-2 bg-blue-600/50 hover:bg-blue-500 rounded transition-all duration-300 text-sm font-bold"
                  >
                    🔗 {language === 'ar' ? 'عرض المشروع' : 'View Project'}
                  </button>
                </div>
              </RevealSection>
            ))}
          </div>
        </RevealSection>
      </section>

      {/* Why Us Section */}
      <section id="why-us" className="relative py-20 px-4">
        <RevealSection>
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
            {t.why_us.title}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {t.why_us.items.map((item, i) => (
              <RevealSection key={i} className="group">
                <div className="p-6 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-lg hover:border-yellow-400/60 transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-yellow-500/30">
                  <p className="text-lg font-bold text-yellow-300">{item}</p>
                </div>
              </RevealSection>
            ))}
          </div>
        </RevealSection>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="relative py-20 px-4">
        <RevealSection>
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 bg-gradient-to-r from-pink-400 to-red-400 bg-clip-text text-transparent">
            {t.testimonials.title}
          </h2>
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {t.testimonials.items.map((testimonial, i) => (
                <RevealSection key={i} className="group">
                  <div className="p-6 bg-gradient-to-br from-pink-500/10 to-red-500/10 border border-pink-500/30 rounded-lg hover:border-pink-400/60 transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-pink-500/30">
                    <p className="text-gray-300 mb-4 italic">{testimonial.text}</p>
                    <p className="text-pink-300 font-bold">{testimonial.author}</p>
                  </div>
                </RevealSection>
              ))}
            </div>
          </div>
        </RevealSection>
      </section>

      {/* Contact Section */}
      <section id="contact" className="relative py-20 px-4">
        <RevealSection>
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
            {t.contact.title}
          </h2>
          <div className="max-w-2xl mx-auto">
            <form onSubmit={handleContactSubmit} className="space-y-6 p-8 bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-lg">
              <div>
                <input
                  type="text"
                  name="name"
                  placeholder={t.contact.name}
                  required
                  className="w-full px-4 py-3 bg-slate-900/50 border border-green-500/30 rounded-lg focus:border-green-400 focus:outline-none transition-all duration-300 text-white placeholder-gray-500"
                />
              </div>
              <div>
                <input
                  type="email"
                  name="email"
                  placeholder={t.contact.email}
                  required
                  className="w-full px-4 py-3 bg-slate-900/50 border border-green-500/30 rounded-lg focus:border-green-400 focus:outline-none transition-all duration-300 text-white placeholder-gray-500"
                />
              </div>
              <div>
                <textarea
                  name="message"
                  placeholder={t.contact.message}
                  rows={5}
                  required
                  className="w-full px-4 py-3 bg-slate-900/50 border border-green-500/30 rounded-lg focus:border-green-400 focus:outline-none transition-all duration-300 text-white placeholder-gray-500"
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 rounded-lg font-bold transition-all duration-300 transform hover:scale-105 shadow-lg shadow-green-500/50 disabled:opacity-50"
              >
                {isLoading ? t.contact.sending : t.contact.send}
              </button>
            </form>
          </div>
        </RevealSection>
      </section>

      {/* Footer */}
      <footer className="relative bg-gradient-to-t from-slate-950 to-transparent border-t border-cyan-500/20 py-8 mt-20">
        <div className="container mx-auto px-4 text-center text-gray-400">
          <p className="mb-2">{t.footer.text}</p>
          <p className="text-sm">{t.footer.made}</p>
        </div>
      </footer>

      {/* Floating WhatsApp Button */}
      <button
        onClick={() => {
          playSound();
          window.open('https://wa.me/966500000000', '_blank');
        }}
        className="fixed left-6 bottom-6 w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center shadow-lg shadow-green-500/50 hover:shadow-green-400/70 transition-all duration-300 transform hover:scale-110 animate-bounce z-40"
        title="WhatsApp"
      >
        <MessageCircle size={28} className="text-white" />
      </button>

      {/* Hidden audio element for sound effects */}
      <audio ref={audioRef} />
    </div>
  );
}
