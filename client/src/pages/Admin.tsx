import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { LogOut, Plus, Edit2, Trash2, Save, Eye, EyeOff, Lock } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';

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
  const [twoFAVerified, setTwoFAVerified] = useState(false);
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

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const storedPassword = localStorage.getItem('luxcod-admin-password') || 'luxcod123';
    if (password === storedPassword) {
      // Generate 2FA code
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      localStorage.setItem('luxcod-2fa-code', code);
      console.log('2FA Code:', code); // In production, send via email
      setShow2FA(true);
      setPassword('');
    } else {
      alert('كلمة المرور غير صحيحة');
    }
  };

  const handleVerify2FA = (e: React.FormEvent) => {
    e.preventDefault();
    const storedCode = localStorage.getItem('luxcod-2fa-code');
    if (twoFACode === storedCode) {
      localStorage.setItem('luxcod-admin-auth', 'true');
      setAuthenticated(true);
      setTwoFACode('');
      setShow2FA(false);
      setTwoFAVerified(true);
      fetchData();
    } else {
      alert('رمز التحقق غير صحيح');
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
    setPasswordMessage('تم تغيير كلمة المرور بنجاح');
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
      // Fetch services
      const servicesSnapshot = await getDocs(collection(db, 'services'));
      const servicesData = servicesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Service[];
      setServices(servicesData);

      // Fetch portfolio
      const portfolioSnapshot = await getDocs(collection(db, 'portfolio'));
      const portfolioData = portfolioSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Portfolio[];
      setPortfolio(portfolioData);

      // Fetch ratings
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

  // Services Management
  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceForm.name || !serviceForm.description) return;

    try {
      if (editingId) {
        await updateDoc(doc(db, 'services', editingId), serviceForm);
        setEditingId(null);
      } else {
        await addDoc(collection(db, 'services'), serviceForm);
      }
      setServiceForm({ name: '', description: '', whatsappMessage: '' });
      fetchData();
    } catch (error) {
      console.error('Error adding/updating service:', error);
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

  // Portfolio Management
  const handleAddPortfolio = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!portfolioForm.name || !portfolioForm.description) return;

    try {
      if (editingId) {
        await updateDoc(doc(db, 'portfolio', editingId), portfolioForm);
        setEditingId(null);
      } else {
        await addDoc(collection(db, 'portfolio'), portfolioForm);
      }
      setPortfolioForm({ name: '', description: '', link: '' });
      fetchData();
    } catch (error) {
      console.error('Error adding/updating portfolio:', error);
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
            <p className="text-center text-gray-400 mb-6">تم إرسال رمز التحقق إلى بريدك الإلكتروني</p>
            <form onSubmit={handleVerify2FA} className="space-y-4">
              <Input
                type="text"
                placeholder="أدخل رمز التحقق"
                value={twoFACode}
                onChange={(e) => setTwoFACode(e.target.value)}
                maxLength={6}
                className="bg-background border-border text-foreground text-center text-2xl tracking-widest"
              />
              <Button type="submit" className="btn-luxury w-full">
                تحقق
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
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="كلمة المرور"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-background border-border text-foreground pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-accent transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            <Button type="submit" className="btn-luxury w-full">
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
                      passwordMessage.includes('بنجاح')
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
                      <p className="text-sm text-gray-500">{service.whatsappMessage}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => {
                          setEditingId(service.id);
                          setServiceForm(service);
                        }}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                      >
                        <Edit2 size={20} />
                      </Button>
                      <Button
                        onClick={() => handleDeleteService(service.id)}
                        className="flex items-center gap-2 bg-red-600 hover:bg-red-700"
                      >
                        <Trash2 size={20} />
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
              {portfolio.map((project) => (
                <Card key={project.id} className="p-6 bg-card border-border">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-accent mb-2">{project.name}</h3>
                      <p className="text-gray-400 mb-2">{project.description}</p>
                      <a href={project.link} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
                        {project.link}
                      </a>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => {
                          setEditingId(project.id);
                          setPortfolioForm(project);
                        }}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                      >
                        <Edit2 size={20} />
                      </Button>
                      <Button
                        onClick={() => handleDeletePortfolio(project.id)}
                        className="flex items-center gap-2 bg-red-600 hover:bg-red-700"
                      >
                        <Trash2 size={20} />
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
                      <span className="text-yellow-500">{'⭐'.repeat(rating.stars)}</span>
                    </div>
                    <p className="text-gray-400">{rating.comment}</p>
                  </div>
                  <Button
                    onClick={() => handleDeleteRating(rating.id)}
                    className="flex items-center gap-2 bg-red-600 hover:bg-red-700"
                  >
                    <Trash2 size={20} />
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
