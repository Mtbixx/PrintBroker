
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { ArrowLeft, Shield, Database, Users, FileText, Eye, Lock, Trash2 } from "lucide-react";

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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Introduction */}
        <Card>
          <CardHeader>
            <CardTitle>Giriş</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 leading-relaxed">
              MatBixx olarak, kullanıcılarımızın kişisel verilerinin gizliliğini korumaya büyük önem veriyoruz. 
              Bu Gizlilik Politikası, platformumuz üzerinden topladığımız kişisel verilerin nasıl işlendiği, 
              korunduğu ve kullanıldığı hakkında detaylı bilgi vermektedir. Bu politika, 6698 sayılı Kişisel 
              Verilerin Korunması Kanunu (KVKK) ve Avrupa Birliği Genel Veri Koruma Tüzüğü (GDPR) 
              kapsamında hazırlanmıştır.
            </p>
          </CardContent>
        </Card>

        {/* Data We Collect */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Database className="h-5 w-5 mr-2 text-blue-600" />
              Topladığımız Veriler
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg mb-2">Kimlik Verileri</h3>
              <ul className="list-disc pl-6 space-y-1 text-gray-700">
                <li>Ad, soyad, e-posta adresi</li>
                <li>Telefon numarası</li>
                <li>Şirket bilgileri (şirket adı, vergi numarası)</li>
                <li>Adres bilgileri</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">Teknik Veriler</h3>
              <ul className="list-disc pl-6 space-y-1 text-gray-700">
                <li>IP adresi ve konum bilgileri</li>
                <li>Tarayıcı türü ve versiyonu</li>
                <li>Cihaz bilgileri (işletim sistemi, ekran çözünürlüğü)</li>
                <li>Platform kullanım verileri</li>
                <li>Çerez verileri</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">İçerik Verileri</h3>
              <ul className="list-disc pl-6 space-y-1 text-gray-700">
                <li>Yüklediğiniz tasarım dosyaları</li>
                <li>Mesajlaşma içerikleri</li>
                <li>Teklif ve sipariş bilgileri</li>
                <li>Ödeme bilgileri (kredi kartı bilgileri güvenli ödeme sistemlerinde saklanır)</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* How We Use Data */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Eye className="h-5 w-5 mr-2 text-green-600" />
              Verilerin Kullanım Amaçları
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg mb-2">Hizmet Sunumu</h3>
              <ul className="list-disc pl-6 space-y-1 text-gray-700">
                <li>Platform hesabınızın oluşturulması ve yönetimi</li>
                <li>Tasarım hizmetlerinin sağlanması</li>
                <li>Müşteri-matbaa eşleştirmesi</li>
                <li>Ödeme işlemlerinin gerçekleştirilmesi</li>
                <li>Müşteri destek hizmetleri</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">İletişim ve Pazarlama</h3>
              <ul className="list-disc pl-6 space-y-1 text-gray-700">
                <li>Hizmet güncellemeleri ve duyurular</li>
                <li>Pazarlama e-postaları (onayınız dahilinde)</li>
                <li>Müşteri memnuniyeti anketleri</li>
                <li>Teknik destek iletişimi</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">Hukuki Yükümlülükler</h3>
              <ul className="list-disc pl-6 space-y-1 text-gray-700">
                <li>Yasal raporlama gereklilikleri</li>
                <li>Vergi ve muhasebe kayıtları</li>
                <li>Uyuşmazlık durumlarında delil sunumu</li>
                <li>Güvenlik ve dolandırıcılık önleme</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Data Protection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Lock className="h-5 w-5 mr-2 text-red-600" />
              Veri Güvenliği
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg mb-2">Teknik Güvenlik Önlemleri</h3>
              <ul className="list-disc pl-6 space-y-1 text-gray-700">
                <li>SSL/TLS şifreleme (256-bit)</li>
                <li>Veritabanı şifreleme</li>
                <li>Düzenli güvenlik güncellemeleri</li>
                <li>Güvenlik duvarı koruması</li>
                <li>Çok faktörlü kimlik doğrulama seçeneği</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">Organizasyonel Güvenlik</h3>
              <ul className="list-disc pl-6 space-y-1 text-gray-700">
                <li>Personel eğitimleri ve gizlilik anlaşmaları</li>
                <li>Erişim kontrolü ve yetkilendirme</li>
                <li>Düzenli güvenlik denetimleri</li>
                <li>Veri ihlali müdahale planları</li>
                <li>ISO 27001 uyumlu güvenlik prosedürleri</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Data Sharing */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2 text-purple-600" />
              Veri Paylaşımı
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg mb-2">Platform İçi Paylaşım</h3>
              <ul className="list-disc pl-6 space-y-1 text-gray-700">
                <li>Müşteri-matbaa arasında proje bilgileri</li>
                <li>Teklif ve sipariş süreçlerinde gerekli bilgiler</li>
                <li>İletişim bilgileri (sadece platform üzerinden)</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">Üçüncü Taraf Hizmetler</h3>
              <ul className="list-disc pl-6 space-y-1 text-gray-700">
                <li>Ödeme işlemcileri (PayTR, İyzico)</li>
                <li>E-posta hizmet sağlayıcıları</li>
                <li>Bulut depolama hizmetleri (şifrelenmiş)</li>
                <li>Analitik hizmetler (anonimleştirilmiş)</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">Yasal Paylaşım</h3>
              <ul className="list-disc pl-6 space-y-1 text-gray-700">
                <li>Mahkeme kararları</li>
                <li>Kamu otoritelerinin talepleri</li>
                <li>Yasal yükümlülükler</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* User Rights */}
        <Card>
          <CardHeader>
            <CardTitle>KVKK ve GDPR Kapsamında Haklarınız</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg mb-2">Temel Haklarınız</h3>
              <ul className="list-disc pl-6 space-y-1 text-gray-700">
                <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
                <li>İşlenen verileriniz hakkında bilgi talep etme</li>
                <li>Verilerin düzeltilmesini veya silinmesini talep etme</li>
                <li>Verilerin üçüncü kişilerle paylaşılma durumunu öğrenme</li>
                <li>Otomatik sistemlerle verilen kararlara itiraz etme</li>
                <li>Veri taşınabilirliği hakkı (GDPR kapsamında)</li>
                <li>Pazarlama faaliyetlerinden çıkma hakkı</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">Hak Kullanım Yolları</h3>
              <ul className="list-disc pl-6 space-y-1 text-gray-700">
                <li>Platform içi ayarlar menüsü</li>
                <li>E-posta: privacy@matbixx.com</li>
                <li>Kimlik doğrulama sonrası yazılı başvuru</li>
                <li>30 gün içinde ücretsiz yanıt</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Data Retention */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Trash2 className="h-5 w-5 mr-2 text-orange-600" />
              Veri Saklama Süreleri
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg mb-2">Saklama Politikası</h3>
              <ul className="list-disc pl-6 space-y-1 text-gray-700">
                <li>Hesap verileri: Hesap aktif olduğu sürece + 7 yıl (yasal gereklilik)</li>
                <li>Tasarım dosyaları: 1 yıl (otomatik silinir)</li>
                <li>İletişim kayıtları: 2 yıl</li>
                <li>Ödeme kayıtları: 10 yıl (yasal gereklilik)</li>
                <li>Analitik veriler: 3 yıl (anonimleştirilmiş)</li>
                <li>Log kayıtları: 1 yıl (güvenlik amaçlı)</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">Otomatik Temizleme</h3>
              <ul className="list-disc pl-6 space-y-1 text-gray-700">
                <li>Günlük otomatik veri temizleme</li>
                <li>Süre dolan verilerin güvenli imhası</li>
                <li>Anonimleştirme prosedürleri</li>
                <li>Kullanıcı talep ettiğinde hızlı silme</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Cookies */}
        <Card>
          <CardHeader>
            <CardTitle>Çerez Politikası</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-700">Sitemizde aşağıdaki çerez türlerini kullanmaktayız:</p>
            
            <div>
              <h4 className="font-semibold">Zorunlu Çerezler</h4>
              <p className="text-sm text-gray-600">Site işlevselliği için gerekli çerezler (oturum, güvenlik)</p>
            </div>
            
            <div>
              <h4 className="font-semibold">Performans Çerezleri</h4>
              <p className="text-sm text-gray-600">Site performansını ölçmek için kullanılır (Google Analytics)</p>
            </div>
            
            <div>
              <h4 className="font-semibold">İşlevsel Çerezler</h4>
              <p className="text-sm text-gray-600">Kullanıcı tercihlerini hatırlamak için kullanılır</p>
            </div>

            <div>
              <h4 className="font-semibold">Pazarlama Çerezleri</h4>
              <p className="text-sm text-gray-600">Kişiselleştirilmiş reklamlar ve retargeting (onayınızla)</p>
            </div>

            <p className="text-sm text-gray-600">
              Çerez ayarlarınızı tarayıcınızdan değiştirebilir veya platformdaki çerez ayarları panelinden yönetebilirsiniz.
            </p>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>İletişim</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-4">
              Gizlilik politikamız hakkında sorularınız veya haklarınızı kullanmak için:
            </p>
            <ul className="space-y-2 text-gray-700">
              <li><strong>E-posta:</strong> privacy@matbixx.com</li>
              <li><strong>Veri Koruma Sorumlusu:</strong> dpo@matbixx.com</li>
              <li><strong>Posta Adresi:</strong> MatBixx Teknoloji A.Ş. - Veri Koruma Birimi</li>
              <li><strong>KVKK Başvuru Formu:</strong> Platform üzerinden erişilebilir</li>
            </ul>
          </CardContent>
        </Card>

        {/* Updates */}
        <Card>
          <CardHeader>
            <CardTitle>Politika Güncellemeleri</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700">
              Bu gizlilik politikası, yasal değişiklikler veya hizmet güncellemeleri nedeniyle değişebilir. 
              Önemli değişiklikler öncesinde size e-posta ile bildirim gönderilecektir. 
              Politikanın güncel versiyonunu her zaman web sitemizden kontrol edebilirsiniz.
            </p>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
