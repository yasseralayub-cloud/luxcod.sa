import { useState, useEffect } from 'react';
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
  const [reviewFormData, setReviewFormData] = useState({ name: '', comment: '', stars: 0 });
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewMessage, setReviewMessage] = useState('');
  const [hoveredStars, setHoveredStars] = useState(0);
  const [particles, setParticles] = useState<Array<{ id: number; left: number; top: number; delay: number }>>([]);
  const [visibleElements, setVisibleElements] = useState<Set<string>>(new Set());

  const isArabic = language === 'ar';

  useScrollReveal();

  // Generate particles on mount
  useEffect(() => {
    const newParticles = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      delay: Math.random() * 5,
    }));
    setParticles(newParticles);
  }, []);

  // Intersection Observer for scroll reveal
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleElements((prev) => {
              const next = new Set(prev);
              next.add(entry.target.id);
              return next;
            });
          } else {
            setVisibleElements((prev) => {
              const next = new Set(prev);
              next.delete(entry.target.id);
              return next;
            });
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll('[data-scroll-reveal]').forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  // Load data
  useEffect(() => {
    const loadData = async () => {
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
        console.error('Error loading data:', error);
      }
    };

    loadData();
  }, []);

  // Auto-rotate ratings
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

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!reviewFormData.name || !reviewFormData.comment || reviewFormData.stars === 0) {
      setReviewMessage(isArabic ? 'يرجى ملء جميع الحقول واختيار النجوم' : 'Please fill all fields and select stars');
      return;
    }

    setReviewLoading(true);

    try {
      await addDoc(collection(db, 'ratings'), {
        name: reviewFormData.name,
        comment: reviewFormData.comment,
        stars: reviewFormData.stars,
        date: serverTimestamp(),
      });

      setReviewMessage(isArabic ? 'شكراً على تقييمك! سيظهر قريباً.' : 'Thank you for your review! It will appear soon.');
      setReviewFormData({ name: '', comment: '', stars: 0 });
      setHoveredStars(0);

      const ratingsQuery = query(collection(db, 'ratings'), orderBy('date', 'desc'));
      const ratingsSnapshot = await getDocs(ratingsQuery);
      const ratingsData = ratingsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Rating[];
      setRatings(ratingsData);
    } catch (error) {
      console.error('Error submitting review:', error);
      setReviewMessage(isArabic ? 'حدث خطأ. حاول مرة أخرى.' : 'Error occurred. Please try again.');
    } finally {
      setReviewLoading(false);
    }
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
      why: {
        title: 'لماذا موقع الويب مهم؟',
        description: 'في عالم رقمي متسارع، وجودك الإلكتروني ليس خياراً بل ضرورة حتمية',
      },
      services: {
        title: 'خدماتنا',
        description: 'نقدم حلولاً رقمية شاملة تناسب احتياجات عملك',
      },
      portfolio: {
        title: 'أعمالنا',
        description: 'مشاريع ناجحة أنجزناها لعملائنا الكرام',
      },
      why_us: {
        title: 'لماذا تختار LuxCod؟',
        description: 'نحن نقدم أفضل الخدمات بأسعار تنافسية',
      },
      testimonials: {
        title: 'آراء عملائنا',
        description: 'ماذا يقول عملاؤنا عن خدماتنا',
        add_review: 'أضف تقييمك',
      },
      contact: {
        title: 'اتصل بنا',
        description: 'نحن هنا للإجابة على جميع أسئلتك',
        name: 'الاسم',
        email: 'البريد الإلكتروني',
        message: 'الرسالة',
        send: 'إرسال',
      },
      footer: 'صنع بـ ♥ من أجلكم',
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
        subheadline: 'A specialized digital agency in designing websites, applications, and advanced digital services',
        cta1: 'Get Started',
        cta2: 'Contact Us',
      },
      why: {
        title: 'Why is a Website Important?',
        description: 'In an accelerated digital world, your online presence is not an option but a necessity',
      },
      services: {
        title: 'Our Services',
        description: 'We provide comprehensive digital solutions tailored to your business needs',
      },
      portfolio: {
        title: 'Our Work',
        description: 'Successful projects we have completed for our clients',
      },
      why_us: {
        title: 'Why Choose LuxCod?',
        description: 'We provide the best services at competitive prices',
      },
      testimonials: {
        title: 'Client Reviews',
        description: 'What our clients say about our services',
        add_review: 'Add Your Review',
      },
      contact: {
        title: 'Contact Us',
        description: 'We are here to answer all your questions',
        name: 'Name',
        email: 'Email',
        message: 'Message',
        send: 'Send',
      },
      footer: 'Made with ♥ for you',
    }
  };

  const currentContent = content[language];

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
      {/* Dynamic Background */}
      <div className="dynamic-bg" />

      {/* Particles */}
      <div className="particles">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="particle"
            style={{
              left: `${particle.left}%`,
              top: `${particle.top}%`,
              animationDelay: `${particle.delay}s`,
            }}
          />
        ))}
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-gold">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="text-2xl font-bold gradient-text cursor-pointer hover:scale-105 transition-transform"
          >
            LuxCod <span className="text-sm text-gold ml-2">v{VERSION}</span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex gap-8 items-center">
            {Object.entries(currentContent.nav).map(([key, value]) => (
              <a
                key={key}
                href={`#${key}`}
                className="link-premium text-sm font-medium"
              >
                {value}
              </a>
            ))}
            <button
              onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
              className="px-4 py-2 rounded-lg bg-gold/20 text-gold hover:bg-gold/30 transition-all"
            >
              {language === 'ar' ? 'EN' : 'AR'}
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-background/95 backdrop-blur-md border-t border-gold p-4 space-y-4">
            {Object.entries(currentContent.nav).map(([key, value]) => (
              <a
                key={key}
                href={`#${key}`}
                className="block link-premium text-sm font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                {value}
              </a>
            ))}
            <button
              onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
              className="w-full px-4 py-2 rounded-lg bg-gold/20 text-gold hover:bg-gold/30 transition-all"
            >
              {language === 'ar' ? 'EN' : 'AR'}
            </button>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section id="home" className="pt-32 pb-20 px-4 relative">
        <div className="max-w-4xl mx-auto text-center">
          <h1 
            className="text-4xl md:text-6xl font-bold mb-6 gradient-text animate-fade-in-up"
            data-scroll-reveal
          >
            {currentContent.hero.headline}
          </h1>
          <p 
            className="text-lg md:text-xl text-gray-300 mb-8 animate-fade-in-up stagger-1"
            data-scroll-reveal
          >
            {currentContent.hero.subheadline}
          </p>
          <div className="flex gap-4 justify-center flex-wrap animate-fade-in-up stagger-2" data-scroll-reveal>
            <Button className="btn-premium px-8 py-3">
              {currentContent.hero.cta1}
            </Button>
            <Button 
              variant="outline" 
              className="px-8 py-3 border-gold text-gold hover:bg-gold/10"
              onClick={() => handleWhatsAppClick('مرحباً، أود التواصل معكم')}
            >
              {currentContent.hero.cta2}
            </Button>
          </div>
        </div>
      </section>

      {/* Why Website Section */}
      <section id="why" className="section-premium py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 
            className="text-3xl md:text-4xl font-bold mb-4 gradient-text text-center animate-fade-in-up"
            data-scroll-reveal
          >
            {currentContent.why.title}
          </h2>
          <p 
            className="text-center text-gray-300 mb-12 animate-fade-in-up stagger-1"
            data-scroll-reveal
          >
            {currentContent.why.description}
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: '📱', title: isArabic ? 'متاح 24/7' : 'Available 24/7', desc: isArabic ? 'عملك متاح دائماً للعملاء' : 'Your business is always available' },
              { icon: '🎯', title: isArabic ? 'استهداف دقيق' : 'Precise Targeting', desc: isArabic ? 'وصول للعملاء المناسبين' : 'Reach the right customers' },
              { icon: '📈', title: isArabic ? 'نمو مستمر' : 'Continuous Growth', desc: isArabic ? 'زيادة المبيعات والأرباح' : 'Increase sales and profits' },
            ].map((item, i) => (
              <Card
                key={i}
                className={`card-premium p-6 text-center hover-lift animate-fade-in-up stagger-${i + 1}`}
                data-scroll-reveal
                id={`why-card-${i}`}
              >
                <div className="text-4xl mb-4">{item.icon}</div>
                <h3 className="text-xl font-bold mb-2 text-gold">{item.title}</h3>
                <p className="text-gray-400">{item.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 
            className="text-3xl md:text-4xl font-bold mb-4 gradient-text text-center animate-fade-in-up"
            data-scroll-reveal
          >
            {currentContent.services.title}
          </h2>
          <p 
            className="text-center text-gray-300 mb-12 animate-fade-in-up stagger-1"
            data-scroll-reveal
          >
            {currentContent.services.description}
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, i) => (
              <Card
                key={service.id}
                className={`card-premium p-6 hover-lift animate-fade-in-up stagger-${(i % 3) + 1}`}
                data-scroll-reveal
                id={`service-${service.id}`}
              >
                <h3 className="text-xl font-bold mb-3 text-gold">{service.name}</h3>
                <p className="text-gray-300 mb-4">{service.description}</p>
                <Button
                  className="w-full btn-premium"
                  onClick={() => handleWhatsAppClick(service.whatsappMessage)}
                >
                  <MessageCircle size={16} className="mr-2" />
                  {isArabic ? 'تواصل' : 'Contact'}
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Portfolio Section */}
      <section id="portfolio" className="section-premium py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 
            className="text-3xl md:text-4xl font-bold mb-4 gradient-text text-center animate-fade-in-up"
            data-scroll-reveal
          >
            {currentContent.portfolio.title}
          </h2>
          <p 
            className="text-center text-gray-300 mb-12 animate-fade-in-up stagger-1"
            data-scroll-reveal
          >
            {currentContent.portfolio.description}
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {portfolio.map((project, i) => (
              <a
                key={project.id}
                href={project.link}
                target="_blank"
                rel="noopener noreferrer"
                className={`card-premium p-6 hover-lift animate-fade-in-up stagger-${(i % 3) + 1} block`}
                data-scroll-reveal
                id={`portfolio-${project.id}`}
              >
                <h3 className="text-xl font-bold mb-2 text-gold">{project.name}</h3>
                <p className="text-gray-300 mb-4">{project.description}</p>
                <div className="flex items-center text-gold hover:text-gold/80 transition-colors">
                  {isArabic ? 'عرض المشروع' : 'View Project'}
                  <ChevronRight size={16} className="ml-2" />
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Why Us Section */}
      <section id="why_us" className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 
            className="text-3xl md:text-4xl font-bold mb-4 gradient-text text-center animate-fade-in-up"
            data-scroll-reveal
          >
            {currentContent.why_us.title}
          </h2>
          <p 
            className="text-center text-gray-300 mb-12 animate-fade-in-up stagger-1"
            data-scroll-reveal
          >
            {currentContent.why_us.description}
          </p>
          <div className="space-y-4">
            {[
              isArabic ? '✨ فريق متخصص وذو خبرة عالية' : '✨ Specialized and experienced team',
              isArabic ? '💎 تصاميم فاخرة وحديثة' : '💎 Luxury and modern designs',
              isArabic ? '🚀 تطبيقات سريعة وآمنة' : '🚀 Fast and secure applications',
              isArabic ? '📊 دعم فني 24/7' : '📊 24/7 Technical support',
            ].map((item, i) => (
              <div
                key={i}
                className={`flex items-center gap-4 p-4 card-premium hover-lift animate-fade-in-up stagger-${i + 1}`}
                data-scroll-reveal
                id={`why-us-item-${i}`}
              >
                <CheckCircle size={24} className="text-gold flex-shrink-0" />
                <span className="text-lg">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="section-premium py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 
            className="text-3xl md:text-4xl font-bold mb-4 gradient-text text-center animate-fade-in-up"
            data-scroll-reveal
          >
            {currentContent.testimonials.title}
          </h2>
          <p 
            className="text-center text-gray-300 mb-12 animate-fade-in-up stagger-1"
            data-scroll-reveal
          >
            {currentContent.testimonials.description}
          </p>

          {/* Current Rating Display */}
          {ratings.length > 0 && (
            <Card 
              className="card-premium p-8 mb-12 animate-fade-in-up stagger-2 hover-lift"
              data-scroll-reveal
              id="current-rating"
            >
              <div className="flex gap-2 mb-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={24}
                    className={i < ratings[currentRatingIndex].stars ? 'fill-gold text-gold' : 'text-gray-600'}
                  />
                ))}
              </div>
              <p className="text-lg mb-4 text-gray-300">{ratings[currentRatingIndex].comment}</p>
              <p className="text-gold font-semibold">{ratings[currentRatingIndex].name}</p>
            </Card>
          )}

          {/* Add Review Form */}
          <Card 
            className="card-premium p-8 animate-fade-in-up stagger-3"
            data-scroll-reveal
            id="review-form"
          >
            <h3 className="text-2xl font-bold mb-6 text-gold">{currentContent.testimonials.add_review}</h3>
            <form onSubmit={handleSubmitReview} className="space-y-4">
              <Input
                placeholder={currentContent.contact.name}
                value={reviewFormData.name}
                onChange={(e) => setReviewFormData({ ...reviewFormData, name: e.target.value })}
                className="input-premium"
              />
              <Textarea
                placeholder={isArabic ? 'أضف تقييمك' : 'Add your review'}
                value={reviewFormData.comment}
                onChange={(e) => setReviewFormData({ ...reviewFormData, comment: e.target.value })}
                className="input-premium"
              />
              <div className="flex gap-2 mb-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setReviewFormData({ ...reviewFormData, stars: i + 1 })}
                    onMouseEnter={() => setHoveredStars(i + 1)}
                    onMouseLeave={() => setHoveredStars(0)}
                    className="icon-hover"
                  >
                    <Star
                      size={32}
                      className={
                        i < (hoveredStars || reviewFormData.stars)
                          ? 'fill-gold text-gold'
                          : 'text-gray-600'
                      }
                    />
                  </button>
                ))}
              </div>
              {reviewMessage && (
                <p className={`text-sm ${reviewMessage.includes('شكراً') || reviewMessage.includes('Thank') ? 'text-green-500' : 'text-red-500'}`}>
                  {reviewMessage}
                </p>
              )}
              <Button
                type="submit"
                className="w-full btn-premium"
                disabled={reviewLoading}
              >
                {reviewLoading ? (isArabic ? 'جاري الإرسال...' : 'Sending...') : (isArabic ? 'إرسال التقييم' : 'Submit Review')}
              </Button>
            </form>
          </Card>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 px-4">
        <div className="max-w-2xl mx-auto">
          <h2 
            className="text-3xl md:text-4xl font-bold mb-4 gradient-text text-center animate-fade-in-up"
            data-scroll-reveal
          >
            {currentContent.contact.title}
          </h2>
          <p 
            className="text-center text-gray-300 mb-12 animate-fade-in-up stagger-1"
            data-scroll-reveal
          >
            {currentContent.contact.description}
          </p>

          <Card 
            className="card-premium p-8 animate-fade-in-up stagger-2"
            data-scroll-reveal
            id="contact-form"
          >
            <form onSubmit={handleSubmitForm} className="space-y-4">
              <Input
                placeholder={currentContent.contact.name}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input-premium"
              />
              <Input
                type="email"
                placeholder={currentContent.contact.email}
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="input-premium"
              />
              <input
                type="text"
                style={{ display: 'none' }}
                value={formData.honeypot}
                onChange={(e) => setFormData({ ...formData, honeypot: e.target.value })}
                tabIndex={-1}
                autoComplete="off"
              />
              <Textarea
                placeholder={currentContent.contact.message}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="input-premium"
              />
              {formMessage && (
                <p className={`text-sm ${formMessage.includes('بنجاح') || formMessage.includes('successfully') ? 'text-green-500' : 'text-red-500'}`}>
                  {formMessage}
                </p>
              )}
              <Button
                type="submit"
                className="w-full btn-premium"
                disabled={loading}
              >
                {loading ? (isArabic ? 'جاري الإرسال...' : 'Sending...') : currentContent.contact.send}
              </Button>
            </form>
          </Card>
        </div>
      </section>

      {/* WhatsApp Button */}
      <button
        onClick={() => handleWhatsAppClick('مرحباً، أود التواصل معكم')}
        className="fixed left-6 bottom-6 w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-white shadow-gold-lg hover:scale-110 transition-transform animate-pulse z-40"
        title="WhatsApp"
      >
        <MessageCircle size={28} />
      </button>

      {/* Footer */}
      <footer className="border-t border-gold py-8 px-4 text-center text-gray-400">
        <p className="text-sm">
          {currentContent.footer}
        </p>
      </footer>
    </div>
  );
}
