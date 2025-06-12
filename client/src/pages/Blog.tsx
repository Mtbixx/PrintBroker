
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Navigation from "@/components/Navigation";
import { 
  Search, 
  Calendar, 
  User, 
  ArrowRight, 
  Printer, 
  Package, 
  Factory,
  Building2,
  Lightbulb,
  TrendingUp
} from "lucide-react";

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  tags: string[];
  author: string;
  publishDate: string;
  readTime: string;
  featured: boolean;
  seoKeywords: string[];
}

export default function Blog() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>([]);

  const blogPosts: BlogPost[] = [
    {
      id: "1",
      title: "Profesyonel Kartvizit Baskı: 2024 Trendleri ve Kalite Standartları",
      excerpt: "Modern iş dünyasında kartvizit hala en önemli tanıtım araçlarından biri. Premium kartvizit baskı seçenekleri ve kalite kriterleri hakkında bilmeniz gerekenler.",
      content: `
        <h2>Kartvizit Baskı Neden Önemli?</h2>
        <p>Dijital çağda bile kartvizit, profesyonel kimliğinizin en önemli parçalarından biridir. Kaliteli kartvizit baskı, firmanızın güvenilirliğini ve profesyonelliğini yansıtır.</p>
        
        <h3>2024 Kartvizit Baskı Trendleri</h3>
        <ul>
          <li><strong>Premium Laminasyon:</strong> Mat ve parlak laminasyon seçenekleri</li>
          <li><strong>Spot UV Lakk:</strong> Seçilen alanları öne çıkaran teknoloji</li>
          <li><strong>Emboss/Deboss:</strong> Kabartma ve çukur baskı efektleri</li>
          <li><strong>Özel Kesim:</strong> Yuvarlak köşe ve özel şekil seçenekleri</li>
        </ul>

        <h3>Kartvizit Kağıt Seçenekleri</h3>
        <p>300gr kuşe kağıt, 350gr bristol ve kraft kağıt gibi premium malzemeler arasından seçim yapabilirsiniz. Her bir malzeme farklı bir görünüm ve his sağlar.</p>

        <h3>Baskı Kalitesi ve ISO Standartları</h3>
        <p>MatBixx olarak ISO 9001:2015 kalite yönetim sistemi ile çalışan matbaacılarımız, 300 DPI çözünürlük ve CMYK + Pantone renk sistemleri kullanarak mükemmel sonuçlar elde eder.</p>
      `,
      category: "Kurumsal Baskı",
      tags: ["kartvizit baskı", "profesyonel kartvizit", "kurumsal kimlik", "premium baskı"],
      author: "MatBixx Uzmanları",
      publishDate: "2024-01-15",
      readTime: "5 dakika",
      featured: true,
      seoKeywords: ["kartvizit baskı", "profesyonel kartvizit", "kurumsal kartvizit", "premium kartvizit baskı", "istanbul kartvizit"]
    },
    {
      id: "2",
      title: "Etiket ve Sticker Baskı: Endüstriyel Kalite Çözümler",
      excerpt: "Gıda, ilaç ve kozmetik sektörü için FDA onaylı, su geçirmez ve UV dayanıklı etiket baskı seçenekleri. Hologram güvenlik etiketlerinden barkod uyumlu çözümlere kadar.",
      content: `
        <h2>Endüstriyel Etiket Baskı Neden Kritik?</h2>
        <p>Ürün etiketleri sadece bilgi verme aracı değil, aynı zamanda marka kimliğinizin ve ürün güvenliğinizin göstergesidir.</p>

        <h3>Etiket Baskı Malzeme Seçenekleri</h3>
        <ul>
          <li><strong>Premium Vinyl:</strong> Uzun ömürlü, dayanıklı</li>
          <li><strong>Polyester Film:</strong> Su geçirmez, kimyasal dayanıklı</li>
          <li><strong>Kraft Kağıt:</strong> Doğal görünüm, eco-friendly</li>
          <li><strong>Hologram Folyo:</strong> Güvenlik etiketleri için</li>
          <li><strong>Şeffaf PET:</strong> Şeffaf görünüm istenen ürünler için</li>
        </ul>

        <h3>Özel Özellikler</h3>
        <p>Su geçirmez, UV dayanıklı, çıkarılabilir/kalıcı yapışkan seçenekleri ve FDA onaylı malzemeler ile gıda güvenliği standartlarına uygun üretim.</p>

        <h3>Sektörel Uygulamalar</h3>
        <ul>
          <li>Gıda ambalajı etiketleri</li>
          <li>İlaç sektörü güvenlik etiketleri</li>
          <li>Kozmetik ürün etiketleri</li>
          <li>Endüstriyel ürün tanımlama etiketleri</li>
        </ul>
      `,
      category: "Endüstriyel Baskı",
      tags: ["etiket baskı", "sticker baskı", "güvenlik etiket", "su geçirmez etiket", "hologram etiket"],
      author: "Endüstri Uzmanları",
      publishDate: "2024-01-12",
      readTime: "6 dakika",
      featured: true,
      seoKeywords: ["etiket baskı", "sticker baskı", "güvenlik etiket", "su geçirmez etiket", "endüstriyel etiket"]
    },
    {
      id: "3",
      title: "Katalog ve Broşür Baskı: Etkili Tanıtım Materyalleri",
      excerpt: "Kurumsal katalog baskı, ürün broşürleri ve tanıtım materyalleri için premium kağıt seçenekleri, spot UV lakk ve ciltleme hizmetleri.",
      content: `
        <h2>Katalog Baskı ile Marka İmajınızı Güçlendirin</h2>
        <p>Kaliteli katalog ve broşür baskı, müşterilerinize profesyonel bir izlenim bırakmanın en etkili yollarından biridir.</p>

        <h3>Katalog Baskı Seçenekleri</h3>
        <ul>
          <li><strong>170gr Kuşe Kağıt:</strong> Standart kalite, uygun fiyat</li>
          <li><strong>250gr Karton:</strong> Premium his, dayanıklı</li>
          <li><strong>Premium Mat Kağıt:</strong> Lüks görünüm</li>
          <li><strong>Özel Dokulu Kağıtlar:</strong> Farklı doku seçenekleri</li>
        </ul>

        <h3>Finishing Seçenekleri</h3>
        <p>Spot UV lakk ile belirli alanları parlak hale getirme, tel dikiş ciltleme ile profesyonel görünüm, spiral ciltleme ile kolay kullanım sağlıyoruz.</p>

        <h3>Kullanım Alanları</h3>
        <ul>
          <li>Kurumsal tanıtım katalogları</li>
          <li>Ürün katalogları</li>
          <li>Hizmet broşürleri</li>
          <li>Fuar materyalleri</li>
          <li>Satış destek materyalleri</li>
        </ul>
      `,
      category: "Kurumsal Baskı",
      tags: ["katalog baskı", "broşür baskı", "tanıtım materyali", "kurumsal baskı"],
      author: "Tasarım Ekibi",
      publishDate: "2024-01-10",
      readTime: "4 dakika",
      featured: false,
      seoKeywords: ["katalog baskı", "broşür baskı", "tanıtım materyali", "kurumsal katalog", "ürün kataloğu"]
    },
    {
      id: "4",
      title: "Dijital Baskı Teknolojileri: Kalite ve Hız Bir Arada",
      excerpt: "Modern dijital baskı teknolojileri ile 24-48 saat içinde yüksek kaliteli sonuçlar. Offset baskı ile dijital baskı karşılaştırması ve doğru seçim rehberi.",
      content: `
        <h2>Dijital Baskı vs Offset Baskı</h2>
        <p>Hangi durumlarda dijital baskı, hangi durumlarda offset baskı tercih edilmeli? İşte detaylı karşılaştırma.</p>

        <h3>Dijital Baskı Avantajları</h3>
        <ul>
          <li>Hızlı üretim (24-48 saat)</li>
          <li>Düşük adet için ekonomik</li>
          <li>Kişiselleştirme imkanı</li>
          <li>Renk tutarlılığı</li>
          <li>Çevre dostu üretim</li>
        </ul>

        <h3>Teknoloji Özellikleri</h3>
        <p>1200 DPI çözünürlük, CMYK + Spot renk desteği, çeşitli kağıt türlerinde baskı imkanı ve ISO 9001 kalite standardları.</p>

        <h3>Uygulama Alanları</h3>
        <ul>
          <li>Küçük adetli kartvizit baskı</li>
          <li>Prototip ürünler</li>
          <li>Acil baskı işleri</li>
          <li>Kişiselleştirilmiş ürünler</li>
        </ul>
      `,
      category: "Teknoloji",
      tags: ["dijital baskı", "offset baskı", "baskı teknolojisi", "hızlı baskı"],
      author: "Teknoloji Uzmanları",
      publishDate: "2024-01-08",
      readTime: "7 dakika",
      featured: false,
      seoKeywords: ["dijital baskı", "offset baskı", "baskı teknolojisi", "hızlı baskı", "kaliteli baskı"]
    },
    {
      id: "5",
      title: "B2B Baskı Sektöründe Dijital Dönüşüm",
      excerpt: "B2B baskı sektöründe dijital platformların önemi artıyor. Online teklif alma, dosya yükleme ve otomatik fiyatlandırma sistemleri ile zaman ve maliyet tasarrufu.",
      content: `
        <h2>B2B Baskı Sektöründe Dijital Devrim</h2>
        <p>Geleneksel baskı sektörü dijital dönüşümle birlikte daha hızlı, verimli ve müşteri odaklı hale geliyor.</p>

        <h3>Dijital Platform Avantajları</h3>
        <ul>
          <li>7/24 teklif alma imkanı</li>
          <li>Anında fiyat hesaplama</li>
          <li>Dosya yükleme ve onay sistemi</li>
          <li>Sipariş takibi</li>
          <li>Kalite garantisi</li>
        </ul>

        <h3>MatBixx Farkı</h3>
        <p>500+ sertifikalı matbaacı ağımız ile Türkiye'nin her yerinden hızlı ve kaliteli hizmet. AI destekli fiyatlandırma ve otomatik sipariş yönetimi.</p>

        <h3>Gelecek Trendleri</h3>
        <ul>
          <li>Yapay zeka destekli tasarım</li>
          <li>Otomatik kalite kontrol</li>
          <li>Sürdürülebilir baskı çözümleri</li>
          <li>Blockchain tabanlı güvenlik</li>
        </ul>
      `,
      category: "Sektör Analizi",
      tags: ["b2b baskı", "dijital dönüşüm", "online baskı", "baskı platformu"],
      author: "Sektör Analistleri",
      publishDate: "2024-01-05",
      readTime: "8 dakika",
      featured: true,
      seoKeywords: ["b2b baskı", "dijital dönüşüm", "online baskı platformu", "baskı sektörü", "matbaacı ağı"]
    }
  ];

  const categories = [
    { id: "all", name: "Tüm Kategoriler", icon: Package },
    { id: "Kurumsal Baskı", name: "Kurumsal Baskı", icon: Building2 },
    { id: "Endüstriyel Baskı", name: "Endüstriyel Baskı", icon: Factory },
    { id: "Teknoloji", name: "Teknoloji", icon: Lightbulb },
    { id: "Sektör Analizi", name: "Sektör Analizi", icon: TrendingUp }
  ];

  useEffect(() => {
    let filtered = blogPosts;

    if (selectedCategory !== "all") {
      filtered = filtered.filter(post => post.category === selectedCategory);
    }

    if (searchTerm) {
      filtered = filtered.filter(post => 
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    setFilteredPosts(filtered);
  }, [searchTerm, selectedCategory]);

  const featuredPosts = blogPosts.filter(post => post.featured);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      {/* SEO Optimized Header */}
      <section className="bg-gradient-to-r from-blue-900 via-indigo-900 to-purple-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Baskı Sektörü Blog
            </h1>
            <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Profesyonel baskı hizmetleri, teknoloji trendleri ve sektör analizleri ile güncel kalın
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <span className="bg-blue-800/50 px-3 py-1 rounded-full">500+ Matbaacı Ağı</span>
              <span className="bg-blue-800/50 px-3 py-1 rounded-full">ISO 9001 Kalite</span>
              <span className="bg-blue-800/50 px-3 py-1 rounded-full">B2B Uzmanları</span>
            </div>
          </div>
        </div>
      </section>

      {/* Search and Filter */}
      <section className="py-8 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Blog yazılarında ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => {
                const IconComponent = category.icon;
                return (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category.id)}
                    className="flex items-center gap-2"
                  >
                    <IconComponent className="h-4 w-4" />
                    {category.name}
                  </Button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Posts */}
      {selectedCategory === "all" && (
        <section className="py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Öne Çıkan Yazılar</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredPosts.map((post) => (
                <Card key={post.id} className="group hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="secondary">{post.category}</Badge>
                      <span className="text-sm text-gray-500">{post.readTime}</span>
                    </div>
                    <CardTitle className="group-hover:text-blue-600 transition-colors">
                      {post.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">{post.excerpt}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <User className="h-4 w-4" />
                        {post.author}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Calendar className="h-4 w-4" />
                        {new Date(post.publishDate).toLocaleDateString('tr-TR')}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-3">
                      {post.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* All Posts */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900">
              {selectedCategory === "all" ? "Tüm Blog Yazıları" : `${selectedCategory} Yazıları`}
            </h2>
            <div className="text-sm text-gray-500">
              {filteredPosts.length} yazı bulundu
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPosts.map((post) => (
              <Card key={post.id} className="group hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="secondary">{post.category}</Badge>
                    <span className="text-sm text-gray-500">{post.readTime}</span>
                  </div>
                  <CardTitle className="group-hover:text-blue-600 transition-colors">
                    {post.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">{post.excerpt}</p>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <User className="h-4 w-4" />
                      {post.author}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Calendar className="h-4 w-4" />
                      {new Date(post.publishDate).toLocaleDateString('tr-TR')}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {post.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <Button variant="outline" size="sm" className="w-full group-hover:bg-blue-50">
                    Yazıyı Oku
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredPosts.length === 0 && (
            <div className="text-center py-12">
              <Printer className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">Aradığınız içerik bulunamadı</h3>
              <p className="text-gray-500">Farklı bir kategori seçin veya arama teriminizi değiştirin.</p>
            </div>
          )}
        </div>
      </section>

      {/* SEO Footer Info */}
      <section className="bg-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Baskı Hizmetlerimiz</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>Profesyonel Kartvizit Baskı</li>
                <li>Endüstriyel Etiket Üretimi</li>
                <li>Katalog ve Broşür Baskı</li>
                <li>Kurumsal Tanıtım Materyalleri</li>
                <li>Dijital ve Offset Baskı</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Kalite Standartları</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>ISO 9001:2015 Sertifikası</li>
                <li>300 DPI Baskı Kalitesi</li>
                <li>CMYK + Pantone Renk Sistemi</li>
                <li>Premium Malzeme Seçenekleri</li>
                <li>Çevre Dostu Üretim</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">MatBixx Avantajları</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>500+ Sertifikalı Matbaacı</li>
                <li>24-48 Saat Hızlı Teslimat</li>
                <li>Türkiye Geneli Hizmet</li>
                <li>Online Teklif Sistemi</li>
                <li>Profesyonel Müşteri Desteği</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
