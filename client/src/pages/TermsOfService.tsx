
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { ArrowLeft, FileText, Scale, AlertTriangle, CreditCard } from "lucide-react";

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
                Bu Kullanım Koşulları, MatBixx platformunu kullanan tüm kullanıcılar için geçerlidir. 
                Platformu kullanarak bu koşulları kabul etmiş sayılırsınız.
              </p>
            </CardContent>
          </Card>

          {/* Service Definition */}
          <Card>
            <CardHeader>
              <CardTitle>Hizmet Tanımı</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                MatBixx, B2B baskı hizmetleri için dijital bir platform sunmaktadır. Hizmetlerimiz:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>AI destekli otomatik tasarım sistemi</li>
                <li>500+ üretici firmadan teklif alma</li>
                <li>Profesyonel baskı hizmetleri</li>
                <li>Dosya yükleme ve analiz hizmetleri</li>
                <li>Sipariş takip sistemi</li>
                <li>Müşteri destek hizmetleri</li>
              </ul>
            </CardContent>
          </Card>

          {/* User Responsibilities */}
          <Card>
            <CardHeader>
              <CardTitle>Kullanıcı Sorumlulukları</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <h3 className="font-semibold text-lg">Hesap Güvenliği</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>Hesap bilgilerinizi güvenli tutmak</li>
                <li>Şifrenizi kimseyle paylaşmamak</li>
                <li>Hesabınızda gerçekleşen tüm aktivitelerden sorumlu olmak</li>
              </ul>

              <h3 className="font-semibold text-lg">İçerik Sorumlulukları</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>Yüklediğiniz dosyaların yasal olması</li>
                <li>Telif hakkı ihlali yapmaması</li>
                <li>Zararlı yazılım içermemesi</li>
                <li>Kişisel veri ihlali riski taşımaması</li>
              </ul>

              <h3 className="font-semibold text-lg">Kullanım Sınırları</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>Platformu amacına uygun kullanmak</li>
                <li>Sistemi bozmaya çalışmamak</li>
                <li>Diğer kullanıcıları rahatsız etmemek</li>
                <li>Yasadışı faaliyetlerde kullanmamak</li>
              </ul>
            </CardContent>
          </Card>

          {/* Pricing and Payments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="h-5 w-5 mr-2 text-green-600" />
                Fiyatlandırma ve Ödemeler
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg mb-2">Müşteri Fiyatlandırması</h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Kredili tasarım sistemi: 35₺/tasarım</li>
                  <li>Aylık abonelik: 2999₺/ay (sınırsız tasarım)</li>
                  <li>Baskı fiyatları üretici firmalar tarafından belirlenir</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2">Üretici Fiyatlandırması</h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Aylık abonelik: 2999₺/ay</li>
                  <li>İlk 30 gün ücretsiz deneme</li>
                  <li>Komisyon oranları ayrıca belirlenir</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2">Ödeme Koşulları</h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Tüm ödemeler Türk Lirası üzerinden yapılır</li>
                  <li>KDV dahil fiyatlar geçerlidir</li>
                  <li>Ödeme yapıldıktan sonra iade sadece yasal zorunluluk halinde</li>
                  <li>Faturalar elektronik ortamda düzenlenir</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Intellectual Property */}
          <Card>
            <CardHeader>
              <CardTitle>Fikri Mülkiyet Hakları</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg mb-2">MatBixx'in Hakları</h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Platform tasarımı ve yazılımı MatBixx'e aittir</li>
                  <li>Marka, logo ve içerikler koruma altındadır</li>
                  <li>AI tasarım algoritmaları ticari sırdır</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2">Kullanıcı İçerikleri</h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Yüklediğiniz dosyaların sahipliği size aittir</li>
                  <li>MatBixx sadece hizmet sunumu için kullanır</li>
                  <li>İçeriklerinizi 3. taraflarla paylaşmayız</li>
                  <li>Silme talebiniz durumunda veriler temizlenir</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Service Limitations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2 text-amber-600" />
                Hizmet Sınırlamaları
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg mb-2">Sistem Sınırları</h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Maksimum dosya boyutu: 100MB</li>
                  <li>Desteklenen formatlar: PDF, PNG, JPG, AI, EPS</li>
                  <li>Günlük kullanım limitleri geçerlidir</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2">Hizmet Kesintileri</h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Planlı bakım çalışmaları önceden duyurulur</li>
                  <li>Acil durumlar için 7/24 teknik destek</li>
                  <li>%99.9 uptime garantisi</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Termination */}
          <Card>
            <CardHeader>
              <CardTitle>Hesap Sonlandırma</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg mb-2">Kullanıcı Tarafından</h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li>İstediğiniz zaman hesabınızı kapatabilirsiniz</li>
                  <li>Aktif siparişleriniz tamamlanana kadar beklenmelidir</li>
                  <li>Kalan kredi tutarınız iade edilir</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2">MatBixx Tarafından</h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Kullanım koşullarını ihlal durumunda</li>
                  <li>Yasal zorunluluklar nedeniyle</li>
                  <li>30 gün önceden bildirim yapılır</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Liability */}
          <Card>
            <CardHeader>
              <CardTitle>Sorumluluk Sınırları</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-6 space-y-2">
                <li>MatBixx, üretici firmaların kalitesinden sorumlu değildir</li>
                <li>Teslimat gecikmeleri üretici sorumluluğundadır</li>
                <li>Kullanıcı içeriklerinden doğan zararlar kullanıcı sorumluluğundadır</li>
                <li>Force majeure durumlar sorumluluk dışındadır</li>
                <li>Toplam sorumluluk ödenen bedel ile sınırlıdır</li>
              </ul>
            </CardContent>
          </Card>

          {/* Dispute Resolution */}
          <Card>
            <CardHeader>
              <CardTitle>Uyuşmazlık Çözümü</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg mb-2">Öncelikli Çözüm</h3>
                <p>Uyuşmazlıklar öncelikle müşteri hizmetleri aracılığıyla çözülmeye çalışılır.</p>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2">Yasal Süreç</h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li>İstanbul Mahkemeleri yetkilidir</li>
                  <li>Türk Hukuku uygulanır</li>
                  <li>Tüketici hakları saklıdır</li>
                </ul>
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
                Kullanım koşulları hakkında sorularınız için:
              </p>
              <div className="space-y-2">
                <p><strong>E-posta:</strong> info@matbixx.com</p>
                <p><strong>Telefon:</strong> 0850 XXX XX XX</p>
                <p><strong>Adres:</strong> MatBixx Teknoloji A.Ş.</p>
              </div>
            </CardContent>
          </Card>

          {/* Updates */}
          <Card>
            <CardHeader>
              <CardTitle>Koşul Güncellemeleri</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                Bu Kullanım Koşulları gerektiğinde güncellenebilir. Önemli değişiklikler 
                30 gün önceden duyurulur ve onayınız alınır.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
