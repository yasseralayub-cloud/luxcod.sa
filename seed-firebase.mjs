import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyD46R7Mei7ANhzqSyihJVtxO6YQsiZls8s",
  authDomain: "luxcod-ratings.firebaseapp.com",
  projectId: "luxcod-ratings",
  storageBucket: "luxcod-ratings.firebasestorage.app",
  messagingSenderId: "195575730935",
  appId: "1:195575730935:web:7598414c4134e71f04b9f2",
  measurementId: "G-HB3PTKE582"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function seedData() {
  try {
    console.log('🌱 جاري إضافة البيانات الأولية...');

    // Add Services
    const services = [
      {
        name: 'تصميم المواقع',
        description: 'تصميم مواقع ويب احترافية وعصرية تجذب العملاء وتزيد المبيعات',
        whatsappMessage: 'مرحبا، أريد تصميم موقع ويب احترافي'
      },
      {
        name: 'صفحات الهبوط',
        description: 'إنشاء صفحات هبوط عالية التحويل لحملاتك التسويقية',
        whatsappMessage: 'مرحبا، أريد إنشاء صفحة هبوط'
      },
      {
        name: 'تحسين واجهة المستخدم',
        description: 'تحسين تجربة المستخدم وواجهة التطبيقات الخاصة بك',
        whatsappMessage: 'مرحبا، أريد تحسين واجهة تطبيقي'
      },
      {
        name: 'التكاملات الرقمية',
        description: 'تكامل WhatsApp وخرائط Google ووسائل التواصل الاجتماعي',
        whatsappMessage: 'مرحبا، أريد تكامل خدمات رقمية'
      },
      {
        name: 'روبوتات الرد التلقائي',
        description: 'إنشاء روبوتات WhatsApp ذكية للرد التلقائي على العملاء',
        whatsappMessage: 'مرحبا، أريد إنشاء روبوت WhatsApp'
      }
    ];

    for (const service of services) {
      await addDoc(collection(db, 'services'), service);
      console.log(`✅ تمت إضافة الخدمة: ${service.name}`);
    }

    // Add Portfolio
    const portfolioItems = [
      {
        name: 'Vivid Beauty',
        description: 'موقع متخصص في منتجات العناية بالجمال والعناية الشخصية',
        link: 'https://vividbeauty.github.io/-VIVID-BEAUTY/'
      },
      {
        name: 'Yashim Spa',
        description: 'موقع منتجع صحي فاخر يقدم خدمات استرخاء واسترجاع النشاط',
        link: '#'
      },
      {
        name: 'Red Carpet',
        description: 'منصة حجز الفعاليات والحفلات الراقية',
        link: '#'
      }
    ];

    for (const project of portfolioItems) {
      await addDoc(collection(db, 'portfolio'), project);
      console.log(`✅ تمت إضافة المشروع: ${project.name}`);
    }

    // Add Ratings
    const ratings = [
      {
        name: 'أحمد محمد',
        comment: 'خدمة ممتازة وفريق احترافي جداً. الموقع الذي أنشأوه لي زاد المبيعات بشكل كبير!',
        stars: 5,
        date: serverTimestamp()
      },
      {
        name: 'فاطمة علي',
        comment: 'تصميم رائع وسريع جداً. التواصل معهم كان سهل جداً والدعم ممتاز',
        stars: 5,
        date: serverTimestamp()
      },
      {
        name: 'محمود حسن',
        comment: 'أفضل وكالة رقمية تعاملت معها. الجودة عالية والأسعار معقولة',
        stars: 5,
        date: serverTimestamp()
      },
      {
        name: 'نور الدين',
        comment: 'موقعي الآن يبدو احترافي جداً. شكراً على الجهود الرائعة',
        stars: 4,
        date: serverTimestamp()
      },
      {
        name: 'ليلى محمود',
        comment: 'تجربة رائعة من البداية إلى النهاية. فريق LuxCod الأفضل!',
        stars: 5,
        date: serverTimestamp()
      }
    ];

    for (const rating of ratings) {
      await addDoc(collection(db, 'ratings'), rating);
      console.log(`✅ تمت إضافة التقييم من: ${rating.name}`);
    }

    console.log('\n✨ تمت إضافة جميع البيانات بنجاح!');
    process.exit(0);
  } catch (error) {
    console.error('❌ خطأ في إضافة البيانات:', error);
    process.exit(1);
  }
}

seedData();
