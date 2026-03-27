'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { LogOut, Plus, Edit2, Trash2, Save, Eye, EyeOff, Lock, Loader, Mail, CheckCircle, AlertCircle } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { createOTP, verifyOTP, getOTPStatus, clearOTP, sendOTPEmail } from '@/lib/otp-emailjs';

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
  
  // OTP States
  const [show2FA, setShow2FA] = useState(false);
  const [twoFACode, setTwoFACode] = useState('');
  const [otpMessage, setOtpMessage] = useState('');
  const [otpStatus, setOtpStatus] = useState(getOTPStatus());
  const [loading, setLoading] = useState(false);
  const [sendingOTP, setSendingOTP] = useState(false);
  const [otpError, setOtpError] = useState(false);
  
  // Password Settings
  const [showPasswordSettings, setShowPasswordSettings] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  
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
          setOtpError(true);
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
    setOtpError(false);
    
    try {
      if (!email) {
        setOtpMessage('يرجى إدخال البريد الإلكتروني');
        setOtpError(true);
        setLoading(false);
        return;
      }
      
      const storedPassword = localStorage.getItem('luxcod-admin-password') || 'luxcod123';
      if (password !== storedPassword) {
        setOtpMessage('كلمة المرور غير صحيحة');
        setOtpError(true);
        setLoading(false);
        return;
      }

      // Generate OTP
      const otpData = createOTP(email);
      
      // Send OTP via EmailJS
      setSendingOTP(true);
      const result = await sendOTPEmail(email, otpData.code);
      setSendingOTP(false);

      if (result.success) {
        setShow2FA(true);
        setOtpMessage(result.message);
        setOtpError(false);
      } else {
        setOtpMessage(result.message);
        setOtpError(true);
        clearOTP();
      }
    } catch (error) {
      console.error('Login error:', error);
      setOtpMessage('حدث خطأ أثناء محاولة الدخول');
      setOtpError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!twoFACode) {
      setOtpMessage('يرجى إدخال رمز التحقق');
      setOtpError(true);
      return;
    }

    const result = verifyOTP(twoFACode);
    
    if (result.valid) {
      setAuthenticated(true);
      localStorage.setItem('luxcod-admin-auth', 'true');
      setShow2FA(false);
      setTwoFACode('');
      setOtpMessage('');
      setOtpError(false);
      fetchData();
    } else {
      setOtpMessage(result.message);
      setOtpError(true);
      setTwoFACode('');
    }
  };

  const handleRequestNewOTP = async () => {
    setSendingOTP(true);
    setOtpMessage('');
    setOtpError(false);

    try {
      const otpData = createOTP(email);
      const result = await sendOTPEmail(email, otpData.code);

      if (result.success) {
        setOtpMessage(result.message);
        setOtpError(false);
        setTwoFACode('');
      } else {
        setOtpMessage(result.message);
        setOtpError(true);
      }
    } catch (error) {
      console.error('Error requesting new OTP:', error);
      setOtpMessage('خطأ في طلب رمز جديد');
      setOtpError(true);
    } finally {
      setSendingOTP(false);
    }
  };

  const fetchData = async () => {
    try {
      const servicesSnapshot = await getDocs(collection(db, 'services'));
      setServices(servicesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Service)));

      const portfolioSnapshot = await getDocs(collection(db, 'portfolio'));
      setPortfolio(portfolioSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Portfolio)));

      const ratingsSnapshot = await getDocs(collection(db, 'ratings'));
      setRatings(ratingsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Rating)));
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleLogout = () => {
    setAuthenticated(false);
    localStorage.removeItem('luxcod-admin-auth');
    setEmail('');
    setPassword('');
    setShow2FA(false);
    setTwoFACode('');
    clearOTP();
  };

  const handleAddService = async () => {
    if (!serviceForm.name || !serviceForm.description) {
      alert('يرجى ملء جميع الحقول');
      return;
    }
    try {
      await addDoc(collection(db, 'services'), serviceForm);
      setServiceForm({ name: '', description: '', whatsappMessage: '' });
      fetchData();
    } catch (error) {
      console.error('Error adding service:', error);
    }
  };

  const handleAddPortfolio = async () => {
    if (!portfolioForm.name || !portfolioForm.description) {
      alert('يرجى ملء جميع الحقول');
      return;
    }
    try {
      await addDoc(collection(db, 'portfolio'), portfolioForm);
      setPortfolioForm({ name: '', description: '', link: '' });
      fetchData();
    } catch (error) {
      console.error('Error adding portfolio:', error);
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

  const handleChangePassword = () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      setPasswordMessage('يرجى ملء جميع الحقول');
      return;
    }

    const storedPassword = localStorage.getItem('luxcod-admin-password') || 'luxcod123';
    if (oldPassword !== storedPassword) {
      setPasswordMessage('كلمة المرور القديمة غير صحيحة');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordMessage('كلمات المرور الجديدة غير متطابقة');
      return;
    }

    localStorage.setItem('luxcod-admin-password', newPassword);
    setPasswordMessage('تم تغيير كلمة المرور بنجاح');
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  // Login Form
  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0B0F14] via-[#111827] to-[#0B0F14] flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-[#1F2937] border-[#8B5CF6]/30">
          <div className="p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-[#C9A96E] mb-2">LuxCod</h1>
              <p className="text-[#9CA3AF]">لوحة التحكم الإدارية</p>
            </div>

            {!show2FA ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#D1D5DB] mb-2">البريد الإلكتروني</label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="أدخل بريدك الإلكتروني"
                    className="bg-[#111827] border-[#374151] text-[#F9FAFB]"
                    disabled={loading || sendingOTP}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#D1D5DB] mb-2">كلمة المرور</label>
                  <div className="relative">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="أدخل كلمة المرور"
                      className="bg-[#111827] border-[#374151] text-[#F9FAFB] pr-10"
                      disabled={loading || sendingOTP}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#C9A96E] transition"
                      disabled={loading || sendingOTP}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {otpMessage && (
                  <div className={`p-3 rounded-lg flex items-center gap-2 ${otpError ? 'bg-red-900/30 text-red-400' : 'bg-green-900/30 text-green-400'}`}>
                    {otpError ? <AlertCircle size={18} /> : <CheckCircle size={18} />}
                    <span className="text-sm">{otpMessage}</span>
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full bg-[#8B5CF6] hover:bg-[#A78BFA] text-[#F9FAFB] font-bold"
                  disabled={loading || sendingOTP}
                >
                  {loading || sendingOTP ? (
                    <>
                      <Loader className="mr-2 h-4 w-4 animate-spin" />
                      جاري الإرسال...
                    </>
                  ) : (
                    <>
                      <Lock className="mr-2 h-4 w-4" />
                      دخول
                    </>
                  )}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOTP} className="space-y-4">
                <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4 text-center">
                  <Mail className="mx-auto mb-2 text-blue-400" size={24} />
                  <p className="text-sm text-[#D1D5DB] mb-1">تم إرسال رمز التحقق إلى:</p>
                  <p className="text-[#C9A96E] font-semibold">{email}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#D1D5DB] mb-2">رمز التحقق (6 أرقام)</label>
                  <Input
                    type="text"
                    value={twoFACode}
                    onChange={(e) => setTwoFACode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    maxLength={6}
                    className="bg-[#111827] border-[#374151] text-white text-center text-2xl tracking-widest font-bold"
                    disabled={sendingOTP}
                  />
                </div>

                {otpStatus.exists && !otpStatus.expired && (
                  <div className="text-center text-sm text-[#9CA3AF]">
                    الوقت المتبقي: <span className="text-[#C9A96E] font-bold">{otpStatus.formattedTime}</span>
                  </div>
                )}

                {otpMessage && (
                  <div className={`p-3 rounded-lg flex items-center gap-2 ${otpError ? 'bg-red-900/30 text-red-400' : 'bg-green-900/30 text-green-400'}`}>
                    {otpError ? <AlertCircle size={18} /> : <CheckCircle size={18} />}
                    <span className="text-sm">{otpMessage}</span>
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full bg-[#8B5CF6] hover:bg-[#A78BFA] text-[#F9FAFB] font-bold"
                  disabled={sendingOTP || twoFACode.length !== 6}
                >
                  تحقق
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full border-[#8B5CF6]/30 text-[#C9A96E] hover:bg-[#8B5CF6]/10"
                  onClick={handleRequestNewOTP}
                  disabled={sendingOTP}
                >
                  {sendingOTP ? (
                    <>
                      <Loader className="mr-2 h-4 w-4 animate-spin" />
                      جاري الإرسال...
                    </>
                  ) : (
                    'طلب رمز جديد'
                  )}
                </Button>
              </form>
            )}
          </div>
        </Card>
      </div>
    );
  }

  // Admin Dashboard
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-[#C9A96E] mb-2">لوحة التحكم</h1>
            <p className="text-[#9CA3AF]">إدارة المحتوى والخدمات</p>
          </div>
          <div className="flex gap-4">
            <Button
              onClick={() => setShowPasswordSettings(!showPasswordSettings)}
              variant="outline"
              className="border-[#8B5CF6]/30 text-[#C9A96E] hover:bg-[#8B5CF6]/10"
            >
              <Lock className="mr-2 h-4 w-4" />
              إعدادات الأمان
            </Button>
            <Button
              onClick={handleLogout}
              variant="destructive"
              className="bg-red-600 hover:bg-red-700"
            >
              <LogOut className="mr-2 h-4 w-4" />
              تسجيل الخروج
            </Button>
          </div>
        </div>

        {/* Password Settings */}
        {showPasswordSettings && (
          <Card className="mb-8 bg-[#1F2937] border-[#8B5CF6]/30 p-6">
            <h2 className="text-xl font-bold text-[#C9A96E] mb-4">تغيير كلمة المرور</h2>
            <div className="space-y-4">
              <Input
                type="password"
                placeholder="كلمة المرور القديمة"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="bg-[#111827] border-[#374151] text-white"
              />
              <Input
                type="password"
                placeholder="كلمة المرور الجديدة"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="bg-[#111827] border-[#374151] text-white"
              />
              <Input
                type="password"
                placeholder="تأكيد كلمة المرور الجديدة"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="bg-[#111827] border-[#374151] text-white"
              />
              <Button
                onClick={handleChangePassword}
                className="bg-[#8B5CF6] hover:bg-[#A78BFA] text-[#F9FAFB] font-bold w-full"
              >
                <Save className="mr-2 h-4 w-4" />
                حفظ كلمة المرور الجديدة
              </Button>
              {passwordMessage && (
                <div className="p-3 rounded-lg bg-blue-900/30 text-blue-300 text-sm">
                  {passwordMessage}
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-[#8B5CF6]/20">
          {['services', 'portfolio', 'ratings'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 font-semibold transition ${
                activeTab === tab
                  ? 'text-[#C9A96E] border-b-2 border-[#8B5CF6]'
                  : 'text-[#9CA3AF] hover:text-[#C9A96E]'
              }`}
            >
              {tab === 'services' && 'الخدمات'}
              {tab === 'portfolio' && 'المشاريع'}
              {tab === 'ratings' && 'التقييمات'}
            </button>
          ))}
        </div>

        {/* Services Tab */}
        {activeTab === 'services' && (
          <div className="space-y-6">
            <Card className="bg-[#1F2937] border-[#8B5CF6]/30 p-6">
              <h2 className="text-xl font-bold text-[#C9A96E] mb-4">إضافة خدمة جديدة</h2>
              <div className="space-y-4">
                <Input
                  placeholder="اسم الخدمة"
                  value={serviceForm.name}
                  onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value })}
                  className="bg-[#111827] border-[#374151] text-white"
                />
                <Textarea
                  placeholder="وصف الخدمة"
                  value={serviceForm.description}
                  onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
                  className="bg-[#111827] border-[#374151] text-white"
                />
                <Input
                  placeholder="رسالة WhatsApp"
                  value={serviceForm.whatsappMessage}
                  onChange={(e) => setServiceForm({ ...serviceForm, whatsappMessage: e.target.value })}
                  className="bg-[#111827] border-[#374151] text-white"
                />
                <Button
                  onClick={handleAddService}
                  className="bg-[#8B5CF6] hover:bg-[#A78BFA] text-[#F9FAFB] font-bold w-full"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  إضافة الخدمة
                </Button>
              </div>
            </Card>

            {services.map(service => (
              <Card key={service.id} className="bg-[#1F2937] border-[#8B5CF6]/30 p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-bold text-[#C9A96E]">{service.name}</h3>
                  <Button
                    onClick={() => handleDeleteService(service.id)}
                    variant="destructive"
                    size="sm"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-[#D1D5DB] mb-2">{service.description}</p>
                <p className="text-sm text-[#9CA3AF]">WhatsApp: {service.whatsappMessage}</p>
              </Card>
            ))}
          </div>
        )}

        {/* Portfolio Tab */}
        {activeTab === 'portfolio' && (
          <div className="space-y-6">
            <Card className="bg-[#1F2937] border-[#8B5CF6]/30 p-6">
              <h2 className="text-xl font-bold text-[#C9A96E] mb-4">إضافة مشروع جديد</h2>
              <div className="space-y-4">
                <Input
                  placeholder="اسم المشروع"
                  value={portfolioForm.name}
                  onChange={(e) => setPortfolioForm({ ...portfolioForm, name: e.target.value })}
                  className="bg-[#111827] border-[#374151] text-white"
                />
                <Textarea
                  placeholder="وصف المشروع"
                  value={portfolioForm.description}
                  onChange={(e) => setPortfolioForm({ ...portfolioForm, description: e.target.value })}
                  className="bg-[#111827] border-[#374151] text-white"
                />
                <Input
                  placeholder="رابط المشروع"
                  value={portfolioForm.link}
                  onChange={(e) => setPortfolioForm({ ...portfolioForm, link: e.target.value })}
                  className="bg-[#111827] border-[#374151] text-white"
                />
                <Button
                  onClick={handleAddPortfolio}
                  className="bg-[#8B5CF6] hover:bg-[#A78BFA] text-[#F9FAFB] font-bold w-full"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  إضافة المشروع
                </Button>
              </div>
            </Card>

            {portfolio.map(project => (
              <Card key={project.id} className="bg-[#1F2937] border-[#8B5CF6]/30 p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-bold text-[#C9A96E]">{project.name}</h3>
                  <Button
                    onClick={() => handleDeletePortfolio(project.id)}
                    variant="destructive"
                    size="sm"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-[#D1D5DB] mb-2">{project.description}</p>
                <a href={project.link} target="_blank" rel="noopener noreferrer" className="text-[#C9A96E] hover:underline text-sm">
                  {project.link}
                </a>
              </Card>
            ))}
          </div>
        )}

        {/* Ratings Tab */}
        {activeTab === 'ratings' && (
          <div className="space-y-6">
            {ratings.map(rating => (
              <Card key={rating.id} className="bg-[#1F2937] border-[#8B5CF6]/30 p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-[#C9A96E]">{rating.name}</h3>
                    <div className="flex gap-1 mt-2">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className={i < rating.stars ? 'text-[#C9A96E]' : 'text-gray-600'}>
                          ★
                        </span>
                      ))}
                    </div>
                  </div>
                  <Button
                    onClick={() => handleDeleteRating(rating.id)}
                    variant="destructive"
                    size="sm"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-[#D1D5DB]">{rating.comment}</p>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
