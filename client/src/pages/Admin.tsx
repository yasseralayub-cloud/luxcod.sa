import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { LogOut, Plus, Edit2, Trash2, Save } from 'lucide-react';
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
  const [services, setServices] = useState<Service[]>([]);
  const [portfolio, setPortfolio] = useState<Portfolio[]>([]);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [activeTab, setActiveTab] = useState('services');
  const [editingId, setEditingId] = useState<string | null>(null);
  
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
    if (password === 'luxcod123') {
      localStorage.setItem('luxcod-admin-auth', 'true');
      setAuthenticated(true);
      setPassword('');
      fetchData();
    } else {
      alert('كلمة المرور غير صحيحة');
    }
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
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 bg-card border-border">
          <h1 className="text-3xl font-bold text-accent mb-6 text-center">LuxCod Admin</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              type="password"
              placeholder="كلمة المرور"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-background border-border text-foreground"
            />
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
          <Button onClick={handleLogout} className="flex items-center gap-2 bg-red-600 hover:bg-red-700">
            <LogOut size={20} />
            تسجيل الخروج
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-border">
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
