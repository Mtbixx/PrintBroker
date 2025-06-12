
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { ArrowLeft, FileText, Scale, AlertTriangle, CreditCard, Users, Shield, Zap } from "lucide-react";

export default function TermsOfService() {
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
            <Scale className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Kullanım Koşulları</h1>
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
            <CardTitle>Genel Hükümler</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 leading-relaxed mb-4">
              Bu Kullanım Koşulları, MatBixx B2B baskı platformunun kullanımına ilişkin şartları belirler. 
              Platformumuzu kullanarak, aşağıdaki şart ve koşulları kabul etmiş sayılırsınız.
            </p>
            <p className="text-gray-700 leading-relaxed">
              MatBixx, müşteriler ile matbaa firmalarını buluşturan B2B bir platformdur. 
              Platform üzerinden tasarım hizmetleri, teklif alma ve baskı hizmetleri sunulmaktadır.
            </p>
          </CardContent>
        </Card>

        {/* Platform Usage */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2 text-blue-600" />
              Platform Kullanımı
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg mb-2">Hesap Oluşturma</h3>
              <ul className="list-disc pl-6 space-y-1 text-gray-700">
                <li>18 yaşından büyük olmak veya yasal temsilci onayı almak zorunludur</li>
                <li>Doğru ve güncel bilgiler sağlamak kullanıcının sorumluluğundadır</li>
                <li>Hesap güvenliğinden kullanıcı sorumludur</li>
                <li>Bir kişi/firma sadece bir hesap açabilir</li>
                <li>Sahte hesap açılması durumunda hesap derhal kapatılır</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">Kullanıcı Türleri</h3>
              <ul className="list-disc pl-6 space-y-1 text-gray-700">
                <li><strong>Müşteri:</strong> Tasarım ve baskı hizmeti alan taraf</li>
                <li><strong>Matbaa Firması:</strong> Baskı hizmeti sağlayan profesyonel firmalar</li>
                <li><strong>Admin:</strong> Platform yönetim ekibi</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">Yasaklı Kullanımlar</h3>
              <ul className="list-disc pl-6 space-y-1 text-gray-700">
                <li>Telif hakkı ihlali içeren tasarımlar yüklemek</li>
                <li>Pornografik, şiddet içeren veya yasadışı içerik paylaşmak</li>
                <li>Platform sistemlerine zarar vermeye çalışmak</li>
                <li>Sahte kimlik veya şirket bilgileri kullanmak</li>
                <li>Rekabet yasalarını ihlal eden fiyat anlaşmaları yapmak</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Commission and Financial Terms */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CreditCard className="h-5 w-5 mr-2 text-green-600" />
              Finansal Koşullar ve Komisyon Yapısı
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg mb-2">Müşteri Ücretlendirmesi</h3>
              <ul className="list-disc pl-6 space-y-1 text-gray-700">
                <li>AI tasarım sistemi: 35₺ per tasarım (kredili sistem)</li>
                <li>Aylık sınırsız tasarım aboneliği: 2.999₺/ay</li>
                <li>Baskı ücretleri doğrudan matbaa firması ile anlaşılır</li>
                <li>Kredi yüklemeleri iade edilmez, sadece platform içinde kullanılır</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">Matbaa Firması Ücretlendirmesi</h3>
              <ul className="list-disc pl-6 space-y-1 text-gray-700">
                <li>Aylık platform üyelik ücreti: 2.999₺/ay</li>
                <li>İlk 30 gün ücretsiz deneme süresi</li>
                <li><strong>Önemli:</strong> Her tamamlanan işten %5 komisyon tutarı MatBixx'e ödenir</li>
                <li>Komisyon, müşteriden alınan ödemenin %5'i kadardır</li>
              </ul>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h3 className="font-semibold text-lg mb-2 text-red-800">Kritik Firma Yükümlülükleri</h3>
              <ul className="list-disc pl-6 space-y-1 text-red-700">
                <li><strong>Verilen terminde teslim edilmeyen işler:</strong> Alınan tutarın tamamı MatBixx'e iade edilir</li>
                <li><strong>Hatalı üretim:</strong> Üretim aşamasının hangi kısmında olursa olsun, tam iade zorunludur</li>
                <li><strong>Kalite standartlarını karşılamayan işler:</strong> Tam iade + yeniden üretim</li>
                <li><strong>Bu koşullara uymayan firmalar:</strong> İstisnasız olarak abonelik ücretleri iade edilmeden platform kayıtları silinir</li>
                <li><strong>Dolandırıcılık:</strong> Hukuki işlem başlatılır ve kara liste paylaşılır</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Service Terms */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Zap className="h-5 w-5 mr-2 text-yellow-600" />
              Hizmet Şartları
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg mb-2">AI Tasarım Sistemi</h3>
              <ul className="list-disc pl-6 space-y-1 text-gray-700">
                <li>Tasarım başına 35₺ ücret peşin alınır</li>
                <li>Her tasarım için 1024x1024 piksel çözünürlükte görsel üretilir</li>
                <li>Üretilen tasarımlar kullanıcının ticari kullanımına açıktır</li>
                <li>Tasarımlar 1 yıl boyunca platform üzerinde saklanır</li>
                <li>Telif hakkı riski kullanıcıya aittir</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">Baskı Hizmetleri</h3>
              <ul className="list-disc pl-6 space-y-1 text-gray-700">
                <li>Matbaa firmaları kendi kalite standartlarından sorumludur</li>
                <li>Teslimat süreleri matbaa firması tarafından belirlenir</li>
                <li>Kargo/teslimat masrafları ayrıca hesaplanır</li>
                <li>Baskı kalitesi endüstri standartlarına uygun olmalıdır</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">Müşteri Sorumlulukları</h3>
              <ul className="list-disc pl-6 space-y-1 text-gray-700">
                <li>Dosya formatlarının baskıya uygun olmasını sağlamak</li>
                <li>Telif hakkı izinlerini almak</li>
                <li>Teknik spesifikasyonları doğru belirtmek</li>
                <li>Ödeme yükümlülüklerini zamanında yerine getirmek</li>
                <li>İletişim bilgilerini güncel tutmak</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Intellectual Property */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="h-5 w-5 mr-2 text-purple-600" />
              Fikri Mülkiyet Hakları
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg mb-2">Platform Hakları</h3>
              <ul className="list-disc pl-6 space-y-1 text-gray-700">
                <li>MatBixx markası ve logosu ticari marka olarak korunmaktadır</li>
                <li>Platform yazılımı ve algoritmaları ticari sırdır</li>
                <li>AI tasarım algoritmaları MatBixx mülkiyetindedir</li>
                <li>Platform tasarımı ve kullanıcı arayüzü telif hakkı koruması altındadır</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">Kullanıcı İçerikleri</h3>
              <ul className="list-disc pl-6 space-y-1 text-gray-700">
                <li>Yüklediğiniz dosyaların sahipliği size aittir</li>
                <li>MatBixx sadece hizmet sunumu için kullanım hakkına sahiptir</li>
                <li>İçeriklerinizi üçüncü taraflarla ticari amaçla paylaşmayız</li>
                <li>Silme talebiniz durumunda veriler 30 gün içinde temizlenir</li>
                <li>Platform üzerinden paylaştığınız içeriklerin yasal sorumluluğu size aittir</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">Telif Hakkı İhlalleri</h3>
              <ul className="list-disc pl-6 space-y-1 text-gray-700">
                <li>Telif hakkı ihlali bildirimleri: legal@matbixx.com</li>
                <li>İhlalin tespit edilmesi durumunda içerik derhal kaldırılır</li>
                <li>Tekrarlayan ihlallerde hesap kapatılır</li>
                <li>Yasal süreçlerde kullanıcı bilgileri paylaşılabilir</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Service Limitations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-amber-600" />
              Hizmet Sınırlamaları ve Sorumluluk Reddi
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg mb-2">Sistem Sınırları</h3>
              <ul className="list-disc pl-6 space-y-1 text-gray-700">
                <li>Maksimum dosya boyutu: 100MB</li>
                <li>AI tasarım üretimi günlük 50 tasarım ile sınırlıdır</li>
                <li>Platform bakım süreleri önceden duyurulur</li>
                <li>Yoğun dönemlerde sistem yavaşlaması yaşanabilir</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">MatBixx Sorumluluk Reddi</h3>
              <ul className="list-disc pl-6 space-y-1 text-gray-700">
                <li>MatBixx, müşteri ve matbaa arasındaki uyuşmazlıklardan sorumlu değildir</li>
                <li>Üçüncü taraf hizmetlerden kaynaklanan sorunlardan sorumlu değildir</li>
                <li>İş kaybı, gelir kaybı gibi dolaylı zararlardan sorumlu değildir</li>
                <li>Force majeure durumlarında hizmet kesintilerinden sorumlu değildir</li>
                <li>Kullanıcıların birbirlerine karşı davranışlarından sorumlu değildir</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">Müşteri Koruma</h3>
              <ul className="list-disc pl-6 space-y-1 text-gray-700">
                <li>Ödeme güvenliği 256-bit SSL ile korunur</li>
                <li>Dolandırıcılık durumunda tam destek sağlanır</li>
                <li>Kalitesiz hizmet durumunda komisyon iadesi yapılır</li>
                <li>Müşteri şikayetleri 24 saat içinde yanıtlanır</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Termination */}
        <Card>
          <CardHeader>
            <CardTitle>Hesap Kapatma ve Sözleşme Feshi</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg mb-2">Kullanıcı Tarafından Kapatma</h3>
              <ul className="list-disc pl-6 space-y-1 text-gray-700">
                <li>İstediğiniz zaman hesabınızı kapatabilirsiniz</li>
                <li>Kullanılmamış krediler 30 gün içinde iade edilir</li>
                <li>Devam eden işler tamamlanana kadar hesap aktif kalır</li>
                <li>Kişisel veriler 30 gün içinde silinir</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">Platform Tarafından Kapatma</h3>
              <ul className="list-disc pl-6 space-y-1 text-gray-700">
                <li>Kullanım koşullarını ihlal eden hesaplar kapatılır</li>
                <li>Sahte bilgi kullanımı durumunda derhal kapatılır</li>
                <li>Mükerrer şikayetler sonucu hesap askıya alınabilir</li>
                <li>Yasal süreçlerde hesap dondurulabilir</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Legal Terms */}
        <Card>
          <CardHeader>
            <CardTitle>Yasal Hükümler</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg mb-2">Uygulanacak Hukuk</h3>
              <ul className="list-disc pl-6 space-y-1 text-gray-700">
                <li>Bu sözleşme Türkiye Cumhuriyeti yasalarına tabidir</li>
                <li>Uyuşmazlıklar İstanbul Mahkemeleri'nde çözülür</li>
                <li>KVKK ve GDPR hükümleri saklıdır</li>
                <li>Tüketici hakları saklıdır</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">Değişiklikler</h3>
              <ul className="list-disc pl-6 space-y-1 text-gray-700">
                <li>Kullanım koşulları önceden bildirimle değiştirilebilir</li>
                <li>Değişiklikler 30 gün önceden e-posta ile duyurulur</li>
                <li>Devam eden kullanım değişiklikleri kabul anlamına gelir</li>
                <li>Önemli değişikliklerde yeniden onay istenebilir</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>İletişim Bilgileri</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-4">
              Kullanım koşulları hakkında sorularınız için:
            </p>
            <ul className="space-y-2 text-gray-700">
              <li><strong>E-posta:</strong> legal@matbixx.com</li>
              <li><strong>Müşteri Hizmetleri:</strong> support@matbixx.com</li>
              <li><strong>Şikayet Hattı:</strong> complaint@matbixx.com</li>
              <li><strong>Acil Durum:</strong> +90 (212) 123-4567</li>
            </ul>
          </CardContent>
        </Card>

        {/* Acceptance */}
        <Card>
          <CardHeader>
            <CardTitle>Kabul ve Onay</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700">
              Bu kullanım koşullarını okuduğunuzu, anladığınızı ve kabul ettiğinizi onaylarsınız. 
              Platform kullanımı bu şartların kabulü anlamına gelir. Bu sözleşme elektronik ortamda 
              imzalanmış sayılır ve basılı nüsha ile aynı hukuki değere sahiptir.
            </p>
            <p className="text-sm text-gray-600 mt-4">
              Sözleşme tarihi: {new Date().toLocaleDateString('tr-TR')}<br/>
              MatBixx Teknoloji A.Ş. - Yasal İşlemler Departmanı
            </p>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
