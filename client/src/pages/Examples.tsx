import { useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Download, Eye, Printer } from "lucide-react";

export default function Examples() {
  const { category } = useParams<{ category: string }>();

  const getCategoryTitle = (cat: string) => {
    switch(cat) {
      case 'corporate': return 'Kurumsal Ürünler';
      case 'industrial': return 'Endüstriyel Çözümler';
      case 'packaging': return 'Ambalaj Ürünleri';
      case 'outdoor': return 'Dış Mekan Ürünleri';
      case 'textile': return 'Tekstil Etiketleri';
      case 'label': return 'Etiket Çözümleri';
      case 'automotive': return 'Otomotiv Ürünleri';
      case 'digital': return 'Dijital Baskı';
      case 'promotional': return 'Promosyon Ürünleri';
      default: return 'Ürün Örnekleri';
    }
  };

  const sampleImages = [
    { id: 1, title: "Premium Etiket Tasarımı", image: "https://via.placeholder.com/300x200/0066cc/ffffff?text=Örnek+1" },
    { id: 2, title: "Kurumsal Logo Etiketi", image: "https://via.placeholder.com/300x200/0066cc/ffffff?text=Örnek+2" },
    { id: 3, title: "Ürün Bilgi Etiketi", image: "https://via.placeholder.com/300x200/0066cc/ffffff?text=Örnek+3" },
    { id: 4, title: "Barcode Etiketi", image: "https://via.placeholder.com/300x200/0066cc/ffffff?text=Örnek+4" },
    { id: 5, title: "Kalite Sertifika Etiketi", image: "https://via.placeholder.com/300x200/0066cc/ffffff?text=Örnek+5" },
    { id: 6, title: "Özel Tasarım Etiketi", image: "https://via.placeholder.com/300x200/0066cc/ffffff?text=Örnek+6" }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                variant="outline" 
                onClick={() => window.history.back()}
                className="flex items-center"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Geri Dön
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{getCategoryTitle(category || '')}</h1>
                <p className="text-gray-600">Örnekler ve Referans Çalışmalar</p>
              </div>
            </div>
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              {sampleImages.length} Örnek
            </Badge>
          </div>
        </div>
      </div>

      {/* Examples Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sampleImages.map((example) => (
            <Card key={example.id} className="group hover:shadow-lg transition-all duration-300">
              <CardHeader className="p-0">
                <div className="relative overflow-hidden rounded-t-lg">
                  <img 
                    src={example.image} 
                    alt={example.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="flex space-x-2">
                      <Button size="sm" variant="secondary" className="backdrop-blur-sm">
                        <Eye className="w-4 h-4 mr-1" />
                        Görüntüle
                      </Button>
                      <Button size="sm" variant="secondary" className="backdrop-blur-sm">
                        <Download className="w-4 h-4 mr-1" />
                        İndir
                      </Button>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <CardTitle className="text-lg mb-2">{example.title}</CardTitle>
                <p className="text-gray-600 text-sm mb-4">
                  Profesyonel kalitede tasarım örneği. Bu tasarımdan ilham alarak kendi projenizi oluşturabilirsiniz.
                </p>
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-xs">
                    {getCategoryTitle(category || '')}
                  </Badge>
                  <Button size="sm" variant="outline">
                    <Printer className="w-4 h-4 mr-1" />
                    Benzerini Yaptır
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Call to Action */}
        <div className="mt-12 text-center">
          <Card className="inline-block p-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardContent className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-900">
                Benzer Bir Tasarım İstiyorum
              </h3>
              <p className="text-gray-600 max-w-md mx-auto">
                Bu örneklerden beğendiğiniz bir tasarım var mı? Hemen teklif alın, 
                500+ matbaadan en uygun fiyatları karşılaştırın.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button 
                  onClick={() => window.location.href = '/quote-form'}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Printer className="w-4 h-4 mr-2" />
                  Teklif Al
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => window.location.href = '/products'}
                >
                  Diğer Kategoriler
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}