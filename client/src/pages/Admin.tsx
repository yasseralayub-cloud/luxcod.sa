import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { LogOut, Plus, Edit2, Trash2, Save, Eye, EyeOff, Lock, Loader } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { createOTP, verifyOTP, getOTPStatus, clearOTP } from '@/lib/otp';
import emailjs from '@emailjs/browser';

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

interface Rating {
  id: string;
  name: string;
  comment: string;
  stars: number;
  date: any;
}

export default function Admin() {
  const [authenticated, setAuthenticated] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [services, setServices] = useState<Service[]>([]);
  const [portfolio, setPortfolio] = useState<Portfolio[]>([]);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [activeTab, setActiveTab] = useState('services');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showPasswordSettings, setShowPasswordSettings] = useState(false);
  const [show2FA, setShow2FA] = useState(false);
  const [twoFACode, setTwoFACode] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpMessage, setOtpMessage] = useState('');
  const [otpStatus, setOtpStatus] = useState(getOTPStatus());
  const [otpAttempts, setOtpAttempts] = useState(0);
  
  // Form states
  const [serviceForm, setServiceForm] = useState({ name: '', description: '', whatsappMessage: '' });
  const [portfolioForm, setPortfolioForm] = useState({ name: '', description: '', link: '' });

  // Check authentication
  useEffect(() => {
    const auth = localStorage.getItem('luxcod-admin-auth');
    if (auth === 'true') {
      setAuthenticated(true);
      fetchData();
    }
  }, []);

  // Update OTP status every second
  useEffect(() => {
    if (show2FA) {
      const interval = setInterval(() => {
        const status = getOTPStatus();
        setOtpStatus(status);
        
        if (status.expired && status.exists) {
          setOtpMessage('انتهت صلاحية الرمز. يرجى طلب رمز جديد');
        }
      }, 1000);
      
      return () => clearInterval(interval);
    }
  }, [show2FA]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setOtpMessage('');
    
    try {
      if (!email) {
        setOtpMessage('يرجى إدخال البريد الإلكتروني');
        setLoading(false);
        return;
      }
      
      const storedPassword = localStorage.getItem('luxcod-admin-password') || 'luxcod123';
      if (password !== storedPassword) {
        setOtpMessage('كلمة المرور غير صحيحة');
        setLoading(false);
        return;
      }
      
      // Generate OTP
      const otpData = createOTP(email);
      const expirationTime = new Date(otpData.expiresAt).toLocaleTimeString('ar-SA');
      
      // Send OTP via EmailJS
      try {
        await emailjs.send(
          'service_tllf68q',
          'template_j8bjlhw',
          {
            to_email: email,
            passcode: otpData.code,
            time: expirationTime
          }
        );
        
        setShow2FA(true);
        setPassword('');
        setOtpMessage('✅ تم إرسال رمز التحقق إلى بريدك الإلكتروني');
        setOtpAttempts(0);
      } catch (emailError) {
        console.error('EmailJS Error:', emailError);
        clearOTP();
        setOtpMessage('❌ حدث خطأ في إرسال البريد. يرجى المحاولة لاحقاً');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerify2FA = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!twoFACode) {
      setOtpMessage('يرجى إدخال رمز التحقق');
      return;
    }
    
    const result = verifyOTP(twoFACode);
    
    if (result.valid) {
      localStorage.setItem('luxcod-admin-auth', 'true');
      setAuthenticated(true);
      setTwoFACode('');
      setShow2FA(false);
      setOtpMessage('');
      fetchData();
    } else {
      setOtpAttempts(otpAttempts + 1);
      setOtpMessage(result.message);
      
      // Check if max attempts reached
      const status = getOTPStatus();
      if (status.remainingAttempts <= 0) {
        setShow2FA(false);
        setTwoFACode('');
        setOtpMessage('تم تجاوز عدد المحاولات. يرجى محاولة الدخول مرة أخرى');
      }
    }
  };

  const handleResendOTP = async () => {
    setLoading(true);
    setOtpMessage('');
    
    try {
      clearOTP();
      const otpData = createOTP(email);
      const expirationTime = new Date(otpData.expiresAt).toLocaleTimeString('ar-SA');
      
      await emailjs.send(
        'service_tllf68q',
        'template_j8bjlhw',
        {
          to_email: email,
          passcode: otpData.code,
          time: expirationTime
        }
      );
      
      setTwoFACode('');
      setOtpAttempts(0);
      setOtpMessage('✅ تم إرسال رمز جديد إلى بريدك الإلكتروني');
    } catch (error) {
      console.error('Error resending OTP:', error);
      setOtpMessage('❌ حدث خطأ في إرسال الرمز الجديد');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    const storedPassword = localStorage.getItem('luxcod-admin-password') || 'luxcod123';
    
    if (oldPassword !== storedPassword) {
      setPasswordMessage('كلمة المرور القديمة غير صحيحة');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setPasswordMessage('كلمة المرور الجديدة غير متطابقة');
      return;
    }
    
    if (newPassword.length < 6) {
      setPasswordMessage('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      return;
    }
    
    localStorage.setItem('luxcod-admin-password', newPassword);
    setPasswordMessage('✅ تم تغيير كلمة المرور بنجاح');
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => {
      setShowPasswordSettings(false);
      setPasswordMessage('');
    }, 2000);
  };

  const handleLogout = () => {
    localStorage.removeItem('luxcod-admin-auth');
    setAuthenticated(false);
  };

  const fetchData = async () => {
    try {
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

      const ratingsSnapshot = await getDocs(collection(db, 'ratings'));
      const ratingsData = ratingsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Rating[];
      setRatings(ratingsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'services'), serviceForm);
      setServiceForm({ name: '', description: '', whatsappMessage: '' });
      setEditingId(null);
      fetchData();
    } catch (error) {
      console.error('Error adding service:', error);
    }
  };

  const handleUpdateService = async (id: string) => {
    try {
      await updateDoc(doc(db, 'services', id), serviceForm);
      setServiceForm({ name: '', description: '', whatsappMessage: '' });
      setEditingId(null);
      fetchData();
    } catch (error) {
      console.error('Error updating service:', error);
    }
  };

  const handleDeleteService = async (id: string) => {
    if (confirm('هل تريد حذف هذه الخدمة؟')) {
      try {
        await deleteDoc(doc(db, 'services', id));
        fetchData();
      } catch (error) {
        console.error('Error deleting service:', error);
      }
    }
  };

  const handleAddPortfolio = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'portfolio'), portfolioForm);
      setPortfolioForm({ name: '', description: '', link: '' });
      setEditingId(null);
      fetchData();
    } catch (error) {
      console.error('Error adding portfolio:', error);
    }
  };

  const handleUpdatePortfolio = async (id: string) => {
    try {
      await updateDoc(doc(db, 'portfolio', id), portfolioForm);
      setPortfolioForm({ name: '', description: '', link: '' });
      setEditingId(null);
      fetchData();
    } catch (error) {
      console.error('Error updating portfolio:', error);
    }
  };

  const handleDeletePortfolio = async (id: string) => {
    if (confirm('هل تريد حذف هذا المشروع؟')) {
      try {
        await deleteDoc(doc(db, 'portfolio', id));
        fetchData();
      } catch (error) {
        console.error('Error deleting portfolio:', error);
      }
    }
  };

  const handleDeleteRating = async (id: string) => {
    if (confirm('هل تريد حذف هذا التقييم؟')) {
      try {
        await deleteDoc(doc(db, 'ratings', id));
        fetchData();
      } catch (error) {
        console.error('Error deleting rating:', error);
      }
    }
  };

  if (!authenticated) {
    if (show2FA) {
      return (
        <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
          <Card className="w-full max-w-md p-8 bg-card border-border">
            <h1 className="text-3xl font-bold text-accent mb-2 text-center">التحقق الثنائي</h1>
            <p className="text-center text-gray-400 mb-6">تم إرسال رمز التحقق إلى: {email}</p>
            
            <form onSubmit={handleVerify2FA} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">رمز التحقق (6 أرقام)</label>
                <Input
                  type="text"
                  placeholder="أدخل الرمز"
                  value={twoFACode}
                  onChange={(e) => setTwoFACode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  maxLength={6}
                  className="bg-background border-border text-foreground text-center text-2xl tracking-widest"
                  required
                />
              </div>
              
              {otpMessage && (
                <div className={`p-3 rounded text-sm text-center ${
                  otpMessage.includes('✅')
                    ? 'bg-green-900/20 text-green-400'
                    : otpMessage.includes('❌')
                    ? 'bg-red-900/20 text-red-400'
                    : 'bg-yellow-900/20 text-yellow-400'
                }`}>
                  {otpMessage}
                </div>
              )}
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">الوقت المتبقي:</span>
                <span className={`font-mono font-bold ${
                  otpStatus.remainingTime < 60000 ? 'text-red-400' : 'text-accent'
                }`}>
                  {otpStatus.formattedTime}
                </span>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">المحاولات المتبقية:</span>
                <span className={`font-bold ${
                  otpStatus.remainingAttempts <= 1 ? 'text-red-400' : 'text-accent'
                }`}>
                  {otpStatus.remainingAttempts}
                </span>
              </div>
              
              <Button type="submit" className="btn-luxury w-full" disabled={loading || otpStatus.expired}>
                {loading ? <Loader className="animate-spin mr-2" size={20} /> : ''}
                تحقق
              </Button>
              
              <Button
                type="button"
                onClick={handleResendOTP}
                className="btn-luxury-outline w-full"
                disabled={loading}
              >
                {loading ? <Loader className="animate-spin mr-2" size={20} /> : ''}
                إرسال رمز جديد
              </Button>
            </form>
          </Card>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 bg-card border-border">
          <h1 className="text-3xl font-bold text-accent mb-6 text-center">LuxCod Admin</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              type="email"
              placeholder="البريد الإلكتروني"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-background border-border text-foreground"
              required
            />
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="كلمة المرور"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-background border-border text-foreground pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-accent transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            
            {otpMessage && (
              <div className={`p-3 rounded text-sm text-center ${
                otpMessage.includes('❌')
                  ? 'bg-red-900/20 text-red-400'
                  : 'bg-yellow-900/20 text-yellow-400'
              }`}>
                {otpMessage}
              </div>
            )}
            
            <Button type="submit" className="btn-luxury w-full" disabled={loading}>
              {loading ? <Loader className="animate-spin mr-2" size={20} /> : ''}
              دخول
            </Button>
          </form>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-accent">لوحة التحكم</h1>
          <div className="flex gap-2">
            <Button
              onClick={() => setShowPasswordSettings(!showPasswordSettings)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
            >
              <Lock size={20} />
              إعدادات الأمان
            </Button>
            <Button onClick={handleLogout} className="flex items-center gap-2 bg-red-600 hover:bg-red-700">
              <LogOut size={20} />
              تسجيل الخروج
            </Button>
          </div>
        </div>

        {/* Password Settings */}
        {showPasswordSettings && (
          <Card className="p-6 bg-card border-border mb-8">
            <h2 className="text-2xl font-bold text-accent mb-4">إعدادات الأمان</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {/* Change Password */}
              <div>
                <h3 className="text-lg font-semibold mb-4">تغيير كلمة المرور</h3>
                <form onSubmit={handleChangePassword} className="space-y-3">
                  <Input
                    type="password"
                    placeholder="كلمة المرور القديمة"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    className="bg-background border-border text-foreground"
                    required
                  />
                  <Input
                    type="password"
                    placeholder="كلمة المرور الجديدة"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="bg-background border-border text-foreground"
                    required
                  />
                  <Input
                    type="password"
                    placeholder="تأكيد كلمة المرور"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="bg-background border-border text-foreground"
                    required
                  />
                  {passwordMessage && (
                    <div className={`p-3 rounded text-sm ${
                      passwordMessage.includes('✅')
                        ? 'bg-green-900/20 text-green-400'
                        : 'bg-red-900/20 text-red-400'
                    }`}>
                      {passwordMessage}
                    </div>
                  )}
                  <Button type="submit" className="btn-luxury w-full">
                    تحديث كلمة المرور
                  </Button>
                </form>
              </div>

              {/* 2FA Settings */}
              <div>
                <h3 className="text-lg font-semibold mb-4">المصادقة الثنائية</h3>
                <div className="space-y-3">
                  <p className="text-gray-400 text-sm">
                    المصادقة الثنائية مفعلة. ستتلقى رمز تحقق عند كل محاولة دخول.
                  </p>
                  <div className="bg-green-900/20 border border-green-600 rounded p-3">
                    <p className="text-green-400 text-sm">✓ المصادقة الثنائية نشطة</p>
                  </div>
                  <p className="text-gray-400 text-xs">
                    البريد المسجل: {localStorage.getItem('luxcod-admin-email') || 'لم يتم تسجيل بريد'}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-border mt-8">
          {['services', 'portfolio', 'ratings'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 px-4 font-semibold transition-colors ${
                activeTab === tab
                  ? 'text-accent border-b-2 border-accent'
                  : 'text-gray-400 hover:text-foreground'
              }`}
            >
              {tab === 'services' ? 'الخدمات' : tab === 'portfolio' ? 'المشاريع' : 'التقييمات'}
            </button>
          ))}
        </div>

        {/* Services Tab */}
        {activeTab === 'services' && (
          <div className="space-y-6">
            <Card className="p-6 bg-card border-border">
              <h2 className="text-2xl font-bold mb-4">
                {editingId ? 'تعديل الخدمة' : 'إضافة خدمة جديدة'}
              </h2>
              <form onSubmit={handleAddService} className="space-y-4">
                <Input
                  type="text"
                  placeholder="اسم الخدمة"
                  value={serviceForm.name}
                  onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value })}
                  className="bg-background border-border text-foreground"
                  required
                />
                <Textarea
                  placeholder="وصف الخدمة"
                  value={serviceForm.description}
                  onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
                  className="bg-background border-border text-foreground"
                  required
                />
                <Textarea
                  placeholder="رسالة WhatsApp"
                  value={serviceForm.whatsappMessage}
                  onChange={(e) => setServiceForm({ ...serviceForm, whatsappMessage: e.target.value })}
                  className="bg-background border-border text-foreground"
                />
                <div className="flex gap-4">
                  <Button type="submit" className="btn-luxury flex items-center gap-2">
                    <Save size={20} />
                    {editingId ? 'تحديث' : 'إضافة'}
                  </Button>
                  {editingId && (
                    <Button
                      type="button"
                      onClick={() => {
                        setEditingId(null);
                        setServiceForm({ name: '', description: '', whatsappMessage: '' });
                      }}
                      className="btn-luxury-outline"
                    >
                      إلغاء
                    </Button>
                  )}
                </div>
              </form>
            </Card>

            {/* Services List */}
            <div className="space-y-4">
              {services.map((service) => (
                <Card key={service.id} className="p-6 bg-card border-border">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-accent mb-2">{service.name}</h3>
                      <p className="text-gray-400 mb-2">{service.description}</p>
                      {service.whatsappMessage && (
                        <p className="text-sm text-gray-500">رسالة: {service.whatsappMessage}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => {
                          setEditingId(service.id);
                          setServiceForm({
                            name: service.name,
                            description: service.description,
                            whatsappMessage: service.whatsappMessage
                          });
                        }}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                      >
                        <Edit2 size={16} />
                      </Button>
                      <Button
                        onClick={() => handleDeleteService(service.id)}
                        className="flex items-center gap-2 bg-red-600 hover:bg-red-700"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Portfolio Tab */}
        {activeTab === 'portfolio' && (
          <div className="space-y-6">
            <Card className="p-6 bg-card border-border">
              <h2 className="text-2xl font-bold mb-4">
                {editingId ? 'تعديل المشروع' : 'إضافة مشروع جديد'}
              </h2>
              <form onSubmit={handleAddPortfolio} className="space-y-4">
                <Input
                  type="text"
                  placeholder="اسم المشروع"
                  value={portfolioForm.name}
                  onChange={(e) => setPortfolioForm({ ...portfolioForm, name: e.target.value })}
                  className="bg-background border-border text-foreground"
                  required
                />
                <Textarea
                  placeholder="وصف المشروع"
                  value={portfolioForm.description}
                  onChange={(e) => setPortfolioForm({ ...portfolioForm, description: e.target.value })}
                  className="bg-background border-border text-foreground"
                  required
                />
                <Input
                  type="url"
                  placeholder="رابط المشروع"
                  value={portfolioForm.link}
                  onChange={(e) => setPortfolioForm({ ...portfolioForm, link: e.target.value })}
                  className="bg-background border-border text-foreground"
                  required
                />
                <div className="flex gap-4">
                  <Button type="submit" className="btn-luxury flex items-center gap-2">
                    <Save size={20} />
                    {editingId ? 'تحديث' : 'إضافة'}
                  </Button>
                  {editingId && (
                    <Button
                      type="button"
                      onClick={() => {
                        setEditingId(null);
                        setPortfolioForm({ name: '', description: '', link: '' });
                      }}
                      className="btn-luxury-outline"
                    >
                      إلغاء
                    </Button>
                  )}
                </div>
              </form>
            </Card>

            {/* Portfolio List */}
            <div className="space-y-4">
              {portfolio.map((item) => (
                <Card key={item.id} className="p-6 bg-card border-border">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-accent mb-2">{item.name}</h3>
                      <p className="text-gray-400 mb-2">{item.description}</p>
                      <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
                        {item.link}
                      </a>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => {
                          setEditingId(item.id);
                          setPortfolioForm({
                            name: item.name,
                            description: item.description,
                            link: item.link
                          });
                        }}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                      >
                        <Edit2 size={16} />
                      </Button>
                      <Button
                        onClick={() => handleDeletePortfolio(item.id)}
                        className="flex items-center gap-2 bg-red-600 hover:bg-red-700"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Ratings Tab */}
        {activeTab === 'ratings' && (
          <div className="space-y-4">
            {ratings.map((rating) => (
              <Card key={rating.id} className="p-6 bg-card border-border">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-xl font-bold text-accent">{rating.name}</h3>
                      <span className="text-accent">{'⭐'.repeat(rating.stars)}</span>
                    </div>
                    <p className="text-gray-400">{rating.comment}</p>
                  </div>
                  <Button
                    onClick={() => handleDeleteRating(rating.id)}
                    className="flex items-center gap-2 bg-red-600 hover:bg-red-700"
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
