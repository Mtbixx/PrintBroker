
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { ArrowLeft, Shield, Database, Users, FileText } from "lucide-react";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link href="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Anasayfaya Dön
            </Button>
          </Link>
          <div className="flex items-center space-x-3">
            <Shield className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Gizlilik Politikası</h1>
              <p className="text-gray-600">Son güncelleme: {new Date().toLocaleDateString('tr-TR')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Introduction */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2 text-blue-600" />
                Giriş
              </CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <p>
                MatBixx olarak, kişisel verilerinizin korunması konusunda azami hassasiyet göstermekteyiz. 
                Bu Gizlilik Politikası, 6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) ve ilgili 
                mevzuat çerçevesinde hazırlanmıştır.
              </p>
            </CardContent>
          </Card>

          {/* Data Collection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Database className="h-5 w-5 mr-2 text-blue-600" />
                Toplanan Veriler
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg mb-2">Kişisel Bilgiler</h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Ad, soyad</li>
                  <li>E-posta adresi</li>
                  <li>Telefon numarası</li>
                  <li>Şirket/Firma bilgileri</li>
                  <li>Adres bilgileri</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-lg mb-2">Teknik Veriler</h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li>IP adresi</li>
                  <li>Tarayıcı bilgileri</li>
                  <li>Cihaz bilgileri</li>
                  <li>Çerezler (Cookies)</li>
                  <li>Site kullanım istatistikleri</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2">İş Verileri</h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Tasarım dosyaları</li>
                  <li>Sipariş bilgileri</li>
                  <li>Ödeme bilgileri</li>
                  <li>İletişim geçmişi</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Data Usage */}
          <Card>
            <CardHeader>
              <CardTitle>Verilerin Kullanım Amaçları</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-6 space-y-2">
                <li>Hizmet sunumu ve müşteri deneyimi iyileştirme</li>
                <li>Sipariş işleme ve teslimat</li>
                <li>Müşteri destek hizmetleri</li>
                <li>Faturalama ve muhasebe işlemleri</li>
                <li>Yasal yükümlülüklerin yerine getirilmesi</li>
                <li>Pazarlama faaliyetleri (onay dahilinde)</li>
                <li>Güvenlik ve dolandırıcılık önleme</li>
                <li>İstatistiksel analiz ve raporlama</li>
              </ul>
            </CardContent>
          </Card>

          {/* Data Sharing */}
          <Card>
            <CardHeader>
              <CardTitle>Veri Paylaşımı</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Kişisel verileriniz aşağıdaki durumlar haricinde üçüncü taraflarla paylaşılmaz:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Yasal zorunluluklar</li>
                <li>Mahkeme kararları</li>
                <li>Hizmet sağlayıcıları (güvenli transfer ile)</li>
                <li>İş ortakları (sınırlı ve gerekli kapsamda)</li>
                <li>Açık rızanızın bulunduğu durumlar</li>
              </ul>
            </CardContent>
          </Card>

          {/* Data Security */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2 text-green-600" />
                Veri Güvenliği
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-6 space-y-2">
                <li>SSL şifreleme teknolojisi</li>
                <li>Güvenli sunucu altyapısı</li>
                <li>Düzenli güvenlik denetimleri</li>
                <li>Erişim kontrolü ve yetkilendirme</li>
                <li>Veri yedekleme sistemleri</li>
                <li>Çalışan eğitim programları</li>
              </ul>
            </CardContent>
          </Card>

          {/* User Rights */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2 text-purple-600" />
                KVKK Kapsamında Haklarınız
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                6698 sayılı KVKK'nın 11. maddesi uyarınca aşağıdaki haklara sahipsiniz:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Kişisel veri işlenip işlenmediğini öğrenme</li>
                <li>İşlenme amacını öğrenme</li>
                <li>Yurt içi/yurt dışı aktarılan üçüncü kişileri öğrenme</li>
                <li>Eksik/yanlış işlenmiş verilerin düzeltilmesini isteme</li>
                <li>Verilerin silinmesini veya yok edilmesini isteme</li>
                <li>Düzeltme/silme işlemlerinin üçüncü kişilere bildirilmesini isteme</li>
                <li>Otomatik sistemle analiz sonucu aleyhine sonuç doğmasına itiraz etme</li>
                <li>Kanuna aykırı işleme nedeniyle zarar talep etme</li>
              </ul>
            </CardContent>
          </Card>

          {/* Cookies */}
          <Card>
            <CardHeader>
              <CardTitle>Çerez Politikası</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>Sitemizde aşağıdaki çerez türlerini kullanmaktayız:</p>
              
              <div>
                <h4 className="font-semibold">Zorunlu Çerezler</h4>
                <p className="text-sm text-gray-600">Site işlevselliği için gerekli çerezler</p>
              </div>
              
              <div>
                <h4 className="font-semibold">Performans Çerezleri</h4>
                <p className="text-sm text-gray-600">Site performansını ölçmek için kullanılır</p>
              </div>
              
              <div>
                <h4 className="font-semibold">Pazarlama Çerezleri</h4>
                <p className="text-sm text-gray-600">Kişiselleştirilmiş reklamlar için kullanılır</p>
              </div>
            </CardContent>
          </Card>

          {/* Contact */}
          <Card>
            <CardHeader>
              <CardTitle>İletişim</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                KVKK kapsamındaki haklarınızı kullanmak için aşağıdaki kanallardan bize ulaşabilirsiniz:
              </p>
              <div className="space-y-2">
                <p><strong>E-posta:</strong> kvkk@matbixx.com</p>
                <p><strong>Telefon:</strong> 0850 XXX XX XX</p>
                <p><strong>Adres:</strong> MatBixx Teknoloji A.Ş.</p>
              </div>
            </CardContent>
          </Card>

          {/* Updates */}
          <Card>
            <CardHeader>
              <CardTitle>Politika Güncellemeleri</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                Bu Gizlilik Politikası gerektiğinde güncellenebilir. Önemli değişiklikler 
                web sitemizde duyurulacak ve kayıtlı kullanıcılarımıza e-posta ile bildirilecektir.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
