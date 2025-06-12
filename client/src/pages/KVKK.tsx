
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { ArrowLeft, Shield, FileText, Users, Database, AlertCircle, CheckCircle, Mail, Phone } from "lucide-react";

export default function KVKK() {
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
            <Shield className="h-8 w-8 text-red-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">KVKK Aydınlatma Metni</h1>
              <p className="text-gray-600">6698 Sayılı Kişisel Verilerin Korunması Kanunu</p>
              <Badge variant="outline" className="mt-2">Son güncelleme: {new Date().toLocaleDateString('tr-TR')}</Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Introduction */}
          <Card className="border-l-4 border-l-red-600">
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2 text-red-600" />
                Veri Sorumlusu
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-red-50 p-4 rounded-lg">
                <h3 className="font-semibold text-lg text-red-900 mb-2">MatBixx Teknoloji A.Ş.</h3>
                <p className="text-red-800">
                  6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") kapsamında veri sorumlusu 
                  sıfatıyla, kişisel verilerinizin işlenmesine ilişkin aşağıdaki bilgileri sizinle paylaşıyoruz.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Processing Purposes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Database className="h-5 w-5 mr-2 text-blue-600" />
                Kişisel Verilerin İşlenme Amaçları
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold">Hizmet Sunumu</h4>
                      <p className="text-sm text-gray-600">Platform hizmetlerinin sunulması</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold">Müşteri İlişkileri</h4>
                      <p className="text-sm text-gray-600">Müşteri destek ve iletişim hizmetleri</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold">Sipariş İşleme</h4>
                      <p className="text-sm text-gray-600">Sipariş alma, işleme ve teslimat</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold">Faturalama</h4>
                      <p className="text-sm text-gray-600">Mali işlemler ve muhasebe</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold">Yasal Yükümlülükler</h4>
                      <p className="text-sm text-gray-600">Yasal zorunlulukların yerine getirilmesi</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold">Güvenlik</h4>
                      <p className="text-sm text-gray-600">Platform ve veri güvenliği</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold">Pazarlama</h4>
                      <p className="text-sm text-gray-600">Onay dahilinde pazarlama faaliyetleri</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold">İyileştirme</h4>
                      <p className="text-sm text-gray-600">Hizmet kalitesi geliştirme</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Legal Basis */}
          <Card>
            <CardHeader>
              <CardTitle>Kişisel Verilerin İşlenme Hukuki Sebepleri</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">KVKK Madde 5/2 Kapsamında:</h4>
                  <ul className="list-disc pl-6 space-y-1 text-blue-800">
                    <li>Açık rızanız</li>
                    <li>Sözleşmenin kurulması ve ifası</li>
                    <li>Yasal yükümlülüğün yerine getirilmesi</li>
                    <li>Meşru menfaatlerimiz</li>
                    <li>Temel hak ve özgürlüklerinizle dengelenmiş olmak kaydıyla</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Data Categories */}
          <Card>
            <CardHeader>
              <CardTitle>İşlenen Kişisel Veri Kategorileri</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-purple-900 mb-3">Kimlik Verileri</h4>
                  <ul className="text-sm text-purple-800 space-y-1">
                    <li>• Ad, soyad</li>
                    <li>• TC kimlik numarası</li>
                    <li>• Doğum tarihi</li>
                    <li>• Uyruk bilgisi</li>
                  </ul>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-900 mb-3">İletişim Verileri</h4>
                  <ul className="text-sm text-green-800 space-y-1">
                    <li>• E-posta adresi</li>
                    <li>• Telefon numarası</li>
                    <li>• Adres bilgileri</li>
                    <li>• Web sitesi</li>
                  </ul>
                </div>
                
                <div className="bg-orange-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-orange-900 mb-3">Finansal Veriler</h4>
                  <ul className="text-sm text-orange-800 space-y-1">
                    <li>• Banka bilgileri</li>
                    <li>• Fatura bilgileri</li>
                    <li>• Ödeme geçmişi</li>
                    <li>• Vergi numarası</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Your Rights */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2 text-purple-600" />
                KVKK Kapsamındaki Haklarınız (Madde 11)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-xs font-bold text-purple-600">1</span>
                    </div>
                    <div>
                      <h4 className="font-semibold">Bilgi Alma Hakkı</h4>
                      <p className="text-sm text-gray-600">Kişisel veri işlenip işlenmediğini öğrenme</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-xs font-bold text-purple-600">2</span>
                    </div>
                    <div>
                      <h4 className="font-semibold">Amaç Öğrenme</h4>
                      <p className="text-sm text-gray-600">İşlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-xs font-bold text-purple-600">3</span>
                    </div>
                    <div>
                      <h4 className="font-semibold">Üçüncü Kişileri Öğrenme</h4>
                      <p className="text-sm text-gray-600">Yurt içinde/dışında aktarılan üçüncü kişileri bilme</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-xs font-bold text-purple-600">4</span>
                    </div>
                    <div>
                      <h4 className="font-semibold">Düzeltme Hakkı</h4>
                      <p className="text-sm text-gray-600">Eksik veya yanlış işlenen verilerin düzeltilmesini isteme</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-xs font-bold text-purple-600">5</span>
                    </div>
                    <div>
                      <h4 className="font-semibold">Silme/Yok Etme</h4>
                      <p className="text-sm text-gray-600">KVKK'da öngörülen şartların oluşması halinde verilerin silinmesini isteme</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-xs font-bold text-purple-600">6</span>
                    </div>
                    <div>
                      <h4 className="font-semibold">Bildirim Hakkı</h4>
                      <p className="text-sm text-gray-600">Düzeltme/silme işlemlerinin üçüncü kişilere bildirilmesini isteme</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-xs font-bold text-purple-600">7</span>
                    </div>
                    <div>
                      <h4 className="font-semibold">İtiraz Hakkı</h4>
                      <p className="text-sm text-gray-600">Otomatik sistemle analiz sonucu aleyhine çıkan sonuca itiraz</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-xs font-bold text-purple-600">8</span>
                    </div>
                    <div>
                      <h4 className="font-semibold">Tazminat Hakkı</h4>
                      <p className="text-sm text-gray-600">Kanuna aykırı işleme nedeniyle uğranılan zararın tazminini talep etme</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Data Transfer */}
          <Card>
            <CardHeader>
              <CardTitle>Kişisel Verilerin Aktarılması</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-lg mb-2">Yurt İçi Aktarım</h4>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>İş ortakları (üretici firmalar)</li>
                    <li>Hizmet sağlayıcılar (ödeme, kargo, IT)</li>
                    <li>Yasal yükümlülükler çerçevesinde kamu kurum/kuruluşları</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold text-lg mb-2">Yurt Dışı Aktarım</h4>
                  <div className="bg-amber-50 p-4 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-amber-800">
                          Kişisel verileriniz, KVKK'ya uygun güvenlik önlemleri alınarak ve gerekli yasal 
                          prosedürler tamamlanarak yurt dışına aktarılabilir.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Data Retention */}
          <Card>
            <CardHeader>
              <CardTitle>Veri Saklama Süreleri</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="text-left p-3 font-semibold">Veri Türü</th>
                      <th className="text-left p-3 font-semibold">Saklama Süresi</th>
                      <th className="text-left p-3 font-semibold">Yasal Dayanak</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    <tr>
                      <td className="p-3">Müşteri kayıtları</td>
                      <td className="p-3">Hesap kapatıldıktan sonra 10 yıl</td>
                      <td className="p-3">Ticaret Kanunu</td>
                    </tr>
                    <tr>
                      <td className="p-3">Fatura ve mali kayıtlar</td>
                      <td className="p-3">10 yıl</td>
                      <td className="p-3">Vergi Usul Kanunu</td>
                    </tr>
                    <tr>
                      <td className="p-3">İletişim kayıtları</td>
                      <td className="p-3">5 yıl</td>
                      <td className="p-3">Meşru menfaat</td>
                    </tr>
                    <tr>
                      <td className="p-3">Log kayıtları</td>
                      <td className="p-3">2 yıl</td>
                      <td className="p-3">Güvenlik gereklilikleri</td>
                    </tr>
                    <tr>
                      <td className="p-3">Pazarlama verileri</td>
                      <td className="p-3">Rıza geri alınana kadar</td>
                      <td className="p-3">Açık rıza</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Exercise Rights */}
          <Card className="border-l-4 border-l-green-600">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Mail className="h-5 w-5 mr-2 text-green-600" />
                Haklarınızı Nasıl Kullanabilirsiniz?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-900 mb-3">Başvuru Yöntemleri</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Mail className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="font-semibold">E-posta</p>
                        <p className="text-sm">kvkk@matbixx.com</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Phone className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="font-semibold">Telefon</p>
                        <p className="text-sm">0850 XXX XX XX</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-lg mb-2">Başvuru Süreci</h4>
                  <div className="space-y-2">
                    <div className="flex items-start space-x-2">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-xs font-bold text-blue-600">1</span>
                      </div>
                      <p className="text-sm">Kimlik doğrulama (TC kimlik kartı fotokopisi)</p>
                    </div>
                    <div className="flex items-start space-x-2">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-xs font-bold text-blue-600">2</span>
                      </div>
                      <p className="text-sm">Talep türünü açık şekilde belirtme</p>
                    </div>
                    <div className="flex items-start space-x-2">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-xs font-bold text-blue-600">3</span>
                      </div>
                      <p className="text-sm">30 gün içinde değerlendirme ve yanıt</p>
                    </div>
                  </div>
                </div>

                <div className="bg-amber-50 p-4 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-amber-900">Önemli Not</h4>
                      <p className="text-amber-800 text-sm">
                        Başvurunuzun reddedilmesi halinde, 30 gün içinde Kişisel Verileri Koruma Kurulu'na 
                        şikayette bulunma hakkınız saklıdır.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card className="border-l-4 border-l-blue-600">
            <CardHeader>
              <CardTitle>İletişim Bilgileri</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-blue-50 p-6 rounded-lg">
                <h3 className="font-semibold text-blue-900 text-lg mb-4">MatBixx Teknoloji A.Ş.</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="font-semibold text-blue-900">KVKK Sorumlusu</p>
                    <p className="text-blue-800">kvkk@matbixx.com</p>
                  </div>
                  <div>
                    <p className="font-semibold text-blue-900">Genel Müdürlük</p>
                    <p className="text-blue-800">info@matbixx.com</p>
                  </div>
                  <div>
                    <p className="font-semibold text-blue-900">Telefon</p>
                    <p className="text-blue-800">0850 XXX XX XX</p>
                  </div>
                  <div>
                    <p className="font-semibold text-blue-900">Adres</p>
                    <p className="text-blue-800">İstanbul, Türkiye</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
