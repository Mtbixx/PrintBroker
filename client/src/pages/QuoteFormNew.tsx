import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useParams } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import Navigation from "@/components/Navigation";
import FileUpload from "@/components/FileUpload";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  LayoutGrid, 
  Disc, 
  Printer,
  AlertCircle,
  ArrowLeft,
  Send,
  Upload,
  Calculator,
  Palette,
  CheckCircle,
  Target,
  Zap
} from "lucide-react";
import { Link } from "wouter";

const quoteSchema = z.object({
  title: z.string().min(1, "Başlık gerekli"),
  type: z.enum(["sheet_label", "roll_label", "general_printing"]),
  specifications: z.object({
    quantity: z.number().min(1, "Miktar en az 1 olmalı"),
    material: z.string().min(1, "Malzeme seçimi gerekli"),
    size: z.string().min(1, "Boyut bilgisi gerekli"),
    description: z.string().min(10, "En az 10 karakter açıklama gerekli")
  }),
  contactInfo: z.object({
    companyName: z.string().min(1, "Firma adı gerekli"),
    contactName: z.string().min(1, "Yetkili kişi adı gerekli"),
    email: z.string().email("Geçerli e-posta adresi gerekli"),
    phone: z.string().optional()
  }),
  description: z.string().optional(),
  deadline: z.string().optional(),
  budget: z.string().optional(),
});

type QuoteFormData = z.infer<typeof quoteSchema>;

export default function QuoteForm() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const { type } = useParams();
  const queryClient = useQueryClient();
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [currentTab, setCurrentTab] = useState("details");
  const [designPrompt, setDesignPrompt] = useState("");
  const [generatedDesigns, setGeneratedDesigns] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(true);

  const form = useForm<QuoteFormData>({
    resolver: zodResolver(quoteSchema),
    defaultValues: {
      title: "",
      type: (type as any) || "sheet_label",
      specifications: {},
      description: "",
      deadline: "",
      budget: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: QuoteFormData) => {
      const quoteData = {
        ...data,
        specifications: {
          ...data.specifications,
          uploadedFiles,
        },
      };
      const response = await fetch("/api/quotes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(quoteData),
      });
      if (!response.ok) {
        throw new Error(`${response.status}: ${response.statusText}`);
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Başarılı",
        description: "Teklif talebiniz başarıyla gönderildi!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/quotes"] });
      form.reset();
      setUploadedFiles([]);
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Hata",
        description: "Teklif gönderilirken bir hata oluştu.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: QuoteFormData) => {
    mutation.mutate(data);
  };

  // AI Design Functions
  const handleGenerateDesign = async () => {
    if (!designPrompt.trim()) return;
    
    setIsGenerating(true);
    try {
      const response = await apiRequest(`/api/design/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          prompt: designPrompt,
          options: {
            aspectRatio: "ASPECT_1_1",
            model: "V_2",
            styleType: "AUTO"
          }
        }),
      });
      
      if (response.data) {
        setGeneratedDesigns(prev => [...prev, ...response.data]);
        toast({
          title: "Tasarım Oluşturuldu",
          description: "AI tasarımınız başarıyla oluşturuldu!",
        });
      }
    } catch (error: any) => {
      if (error.message.includes("401") || error.message.includes("403")) {
        setHasApiKey(false);
        toast({
          title: "API Anahtarı Gerekli",
          description: "AI tasarım özelliği için API anahtarı yapılandırılmalıdır.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Hata",
          description: "Tasarım oluşturulurken bir hata oluştu.",
          variant: "destructive",
        });
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUseDesign = (design: any) => {
    // Add design to uploaded files as a design file
    const designFile = `design_${Date.now()}.png`;
    setUploadedFiles(prev => [...prev, designFile]);
    
    toast({
      title: "Tasarım Eklendi",
      description: "Tasarım dosyalara eklendi ve teklif ile birlikte gönderilecek.",
    });
  };

  const handleFileUpload = (fileId: string) => {
    setUploadedFiles(prev => [...prev, fileId]);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
              <h2 className="text-xl font-semibold mb-2">Üyelik Gerekli</h2>
              <p className="text-gray-600 mb-4">
                Teklif almak için önce üye olmanız gerekiyor. Müşteri kaydı sadece 35₺/tasarım ile başlayın!
              </p>
              <div className="space-y-3">
                <Button 
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  onClick={() => window.location.href = "/customer-register"}
                >
                  Müşteri Kaydı (35₺/tasarım)
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => window.location.href = "/printer-register"}
                >
                  Üretici Kaydı (2999₺/ay)
                </Button>
                <div className="text-center text-sm text-gray-500">
                  Zaten üye misiniz?{" "}
                  <button 
                    className="text-blue-600 hover:underline"
                    onClick={() => window.location.href = "/customer-dashboard"}
                  >
                    Giriş yapın
                  </button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getTypeConfig = () => {
    switch (type) {
      case 'sheet_label':
        return {
          title: 'Tabaka Etiket Teklifi',
          description: 'A3/A4 tabaka halinde profesyonel etiket baskısı',
          icon: <LayoutGrid className="h-8 w-8 text-white" />,
          color: 'blue',
          bgGradient: 'from-blue-500 to-indigo-600'
        };
      case 'roll_label':
        return {
          title: 'Rulo Etiket Teklifi',
          description: 'Termal ve yapışkanlı rulo etiket çözümleri',
          icon: <Disc className="h-8 w-8 text-white" />,
          color: 'orange',
          bgGradient: 'from-orange-500 to-red-600'
        };
      case 'general_printing':
        return {
          title: 'Genel Baskı Teklifi',
          description: 'Katalog, broşür ve özel baskı projeleri',
          icon: <Printer className="h-8 w-8 text-white" />,
          color: 'green',
          bgGradient: 'from-green-500 to-emerald-600'
        };
      default:
        return {
          title: 'Teklif Talebi',
          description: 'Matbaa hizmetleri için teklif talebi',
          icon: <Printer className="h-8 w-8 text-white" />,
          color: 'blue',
          bgGradient: 'from-blue-500 to-indigo-600'
        };
    }
  };

  const typeConfig = getTypeConfig();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <Navigation />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <Link href="/dashboard">
            <Button variant="outline" size="sm" className="mb-6 shadow-md hover:shadow-lg transition-all duration-300">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Dashboard'a Dön
            </Button>
          </Link>
          
          {/* Header Card */}
          <Card className="mb-8 border-0 shadow-xl bg-gradient-to-r from-white to-blue-50">
            <CardContent className="p-8">
              <div className="flex items-center space-x-4 mb-4">
                <div className={`w-16 h-16 bg-gradient-to-r ${typeConfig.bgGradient} rounded-full flex items-center justify-center shadow-lg`}>
                  {typeConfig.icon}
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-gray-900 mb-2">
                    {typeConfig.title}
                  </h1>
                  <p className="text-xl text-gray-600">
                    {typeConfig.description}
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                  <div className="text-sm text-gray-500 mb-1">Hızlı Teklif</div>
                  <div className="text-2xl font-bold text-blue-600">5 Dakika</div>
                </div>
                <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                  <div className="text-sm text-gray-500 mb-1">Matbaa Sayısı</div>
                  <div className="text-2xl font-bold text-green-600">50+</div>
                </div>
                <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                  <div className="text-sm text-gray-500 mb-1">Ortalama Tasarruf</div>
                  <div className="text-2xl font-bold text-orange-600">%25</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Form Card */}
        <Card className="border-0 shadow-xl">
          <CardContent className="p-8">
            <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
              <TabsList className="grid w-full grid-cols-5 mb-8">
                <TabsTrigger value="details" className="flex items-center space-x-2">
                  <Target className="h-4 w-4" />
                  <span>Detaylar</span>
                </TabsTrigger>
                <TabsTrigger value="specifications" className="flex items-center space-x-2">
                  <Calculator className="h-4 w-4" />
                  <span>Özellikler</span>
                </TabsTrigger>
                <TabsTrigger value="design" className="flex items-center space-x-2">
                  <Palette className="h-4 w-4" />
                  <span>AI Tasarım</span>
                </TabsTrigger>
                <TabsTrigger value="files" className="flex items-center space-x-2">
                  <Upload className="h-4 w-4" />
                  <span>Dosyalar</span>
                </TabsTrigger>
                <TabsTrigger value="submit" className="flex items-center space-x-2">
                  <Send className="h-4 w-4" />
                  <span>Gönder</span>
                </TabsTrigger>
              </TabsList>

              <form onSubmit={form.handleSubmit(onSubmit)}>
                <TabsContent value="details" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="title">Proje Başlığı *</Label>
                      <Input
                        id="title"
                        placeholder="Örn: Ürün Etiketleri"
                        {...form.register("title")}
                        className="border-gray-300 focus:border-blue-500"
                      />
                      {form.formState.errors.title && (
                        <p className="text-sm text-red-500">{form.formState.errors.title.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="budget">Bütçe (TL)</Label>
                      <Input
                        id="budget"
                        placeholder="Örn: 1000-5000"
                        {...form.register("budget")}
                        className="border-gray-300 focus:border-blue-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="deadline">Teslim Tarihi</Label>
                      <Input
                        id="deadline"
                        type="date"
                        {...form.register("deadline")}
                        className="border-gray-300 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Proje Açıklaması</Label>
                    <Textarea
                      id="description"
                      placeholder="Projeniz hakkında detaylı bilgi verin..."
                      rows={4}
                      {...form.register("description")}
                      className="border-gray-300 focus:border-blue-500"
                    />
                  </div>

                  <div className="flex justify-end">
                    <Button
                      type="button"
                      onClick={() => setCurrentTab("specifications")}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Devam Et
                      <ArrowLeft className="h-4 w-4 ml-2 rotate-180" />
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="specifications" className="space-y-6">
                  {type === 'sheet_label' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label>Kağıt Tipi</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Kağıt tipini seçin" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="transparent">Şeffaf Etiket</SelectItem>
                            <SelectItem value="opaque">Opak Etiket</SelectItem>
                            <SelectItem value="kraft">Kraft Etiket</SelectItem>
                            <SelectItem value="metalize">Metalize Etiket</SelectItem>
                            <SelectItem value="textured">Dokulu Etiket</SelectItem>
                            <SelectItem value="sticker">Sticker Kağıt</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Boyut</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Boyut seçin" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="a3">A3 (297 x 420 mm)</SelectItem>
                            <SelectItem value="a4">A4 (210 x 297 mm)</SelectItem>
                            <SelectItem value="custom">Özel Boyut</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Adet</Label>
                        <Input placeholder="Örn: 1000" />
                      </div>

                      <div className="space-y-2">
                        <Label>Renk</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Renk seçin" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="4-0">4+0 (Tek Yüz Renkli)</SelectItem>
                            <SelectItem value="4-4">4+4 (Çift Yüz Renkli)</SelectItem>
                            <SelectItem value="1-0">1+0 (Tek Yüz Siyah)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}

                  {type === 'roll_label' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label>Etiket Tipi</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Tip seçin" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="thermal">Termal</SelectItem>
                            <SelectItem value="adhesive">Yapışkanlı</SelectItem>
                            <SelectItem value="removable">Çıkarılabilir</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Rulo Çapı (mm)</Label>
                        <Input placeholder="Örn: 76" />
                      </div>

                      <div className="space-y-2">
                        <Label>Etiket Boyutu (mm)</Label>
                        <Input placeholder="Örn: 50 x 30" />
                      </div>

                      <div className="space-y-2">
                        <Label>Toplam Adet</Label>
                        <Input placeholder="Örn: 10000" />
                      </div>
                    </div>
                  )}

                  {type === 'general_printing' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label>Baskı Tipi</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Tip seçin" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="catalog">Katalog</SelectItem>
                            <SelectItem value="brochure">Broşür</SelectItem>
                            <SelectItem value="business-card">Kartvizit</SelectItem>
                            <SelectItem value="flyer">Flyer</SelectItem>
                            <SelectItem value="other">Diğer</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Sayfa Sayısı</Label>
                        <Input placeholder="Örn: 24" />
                      </div>

                      <div className="space-y-2">
                        <Label>Boyut</Label>
                        <Input placeholder="Örn: 21x29.7 cm" />
                      </div>

                      <div className="space-y-2">
                        <Label>Adet</Label>
                        <Input placeholder="Örn: 500" />
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setCurrentTab("details")}
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Geri
                    </Button>
                    <Button
                      type="button"
                      onClick={() => setCurrentTab("files")}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Devam Et
                      <ArrowLeft className="h-4 w-4 ml-2 rotate-180" />
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="files" className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Dosya Yükleme</h3>
                    <FileUpload
                      onFileUpload={handleFileUpload}
                      maxFiles={10}
                      maxSizeInMB={100}
                      acceptedTypes={['application/pdf', 'image/jpeg', 'image/png', 'image/gif', 'image/svg+xml', 'application/postscript', 'image/vnd.adobe.photoshop']}
                      className="mb-4"
                    />
                    
                    {uploadedFiles.length > 0 && (
                      <div className="mt-4">
                        <h4 className="font-medium mb-2">Yüklenen Dosyalar:</h4>
                        <div className="space-y-2">
                          {uploadedFiles.map((fileId, index) => (
                            <div key={index} className="flex items-center space-x-2 p-2 bg-green-50 rounded">
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              <span className="text-sm">Dosya {index + 1} başarıyla yüklendi</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setCurrentTab("specifications")}
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Geri
                    </Button>
                    <Button
                      type="button"
                      onClick={() => setCurrentTab("design")}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Devam Et
                      <ArrowLeft className="h-4 w-4 ml-2 rotate-180" />
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="design" className="space-y-6">
                  <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                      <Palette className="h-5 w-5 text-purple-600 mr-2" />
                      AI Tasarım Motoru
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Yapay zeka ile profesyonel tasarımlar oluşturun ve projelerinize ekleyin.
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Design Templates */}
                      <div className="bg-white rounded-lg p-4 border border-gray-200">
                        <h4 className="font-semibold mb-3 flex items-center">
                          <Zap className="h-4 w-4 text-yellow-500 mr-2" />
                          Hızlı Şablonlar
                        </h4>
                        <div className="space-y-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="w-full justify-start"
                            onClick={() => setDesignPrompt("Modern kartvizit tasarımı")}
                          >
                            Modern Kartvizit
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="w-full justify-start"
                            onClick={() => setDesignPrompt("Ürün etiketi tasarımı")}
                          >
                            Ürün Etiketi
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="w-full justify-start"
                            onClick={() => setDesignPrompt("Broşür kapak tasarımı")}
                          >
                            Broşür Kapağı
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="w-full justify-start"
                            onClick={() => setDesignPrompt("Banner tasarımı")}
                          >
                            Banner
                          </Button>
                        </div>
                      </div>

                      {/* Custom Design */}
                      <div className="bg-white rounded-lg p-4 border border-gray-200">
                        <h4 className="font-semibold mb-3 flex items-center">
                          <Palette className="h-4 w-4 text-blue-500 mr-2" />
                          Özel Tasarım
                        </h4>
                        <div className="space-y-3">
                          <div>
                            <Label htmlFor="design-prompt">Tasarım Açıklaması</Label>
                            <Textarea
                              id="design-prompt"
                              value={designPrompt}
                              onChange={(e) => setDesignPrompt(e.target.value)}
                              placeholder="Örn: Mavi renklerde minimalist logo tasarımı..."
                              className="h-20"
                            />
                          </div>
                          <Button
                            type="button"
                            onClick={handleGenerateDesign}
                            disabled={!designPrompt || isGenerating}
                            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                          >
                            {isGenerating ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Tasarım Oluşturuluyor...
                              </>
                            ) : (
                              <>
                                <Zap className="h-4 w-4 mr-2" />
                                Tasarım Oluştur
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Generated Designs */}
                    {generatedDesigns.length > 0 && (
                      <div className="mt-6">
                        <h4 className="font-semibold mb-3">Oluşturulan Tasarımlar</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {generatedDesigns.map((design, index) => (
                            <div key={index} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                              <div className="aspect-square bg-gray-100 flex items-center justify-center">
                                <img 
                                  src={design.url} 
                                  alt={`Tasarım ${index + 1}`}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="p-3">
                                <div className="flex justify-between items-center">
                                  <span className="text-sm text-gray-600">Tasarım {index + 1}</span>
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleUseDesign(design)}
                                  >
                                    Kullan
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* API Key Warning */}
                    {!hasApiKey && (
                      <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-center">
                          <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
                          <span className="text-sm text-yellow-700">
                            AI tasarım özelliği için API anahtarı gereklidir. Lütfen yönetici ile iletişime geçin.
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setCurrentTab("design")}
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Geri
                    </Button>
                    <Button
                      type="button"
                      onClick={() => setCurrentTab("submit")}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Devam Et
                      <ArrowLeft className="h-4 w-4 ml-2 rotate-180" />
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="files" className="space-y-6">
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                      <Upload className="h-5 w-5 text-gray-600 mr-2" />
                      Dosya Yükle
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Matbaa işiniz için gerekli dosyaları yükleyin. AI tasarım motoru ile oluşturulan tasarımlar otomatik olarak eklenir.
                    </p>
                    
                    <FileUpload
                      onFileUpload={handleFileUpload}
                      maxFiles={10}
                      maxSizeInMB={100}
                      acceptedTypes={['application/pdf', 'image/jpeg', 'image/png', 'image/gif', 'image/svg+xml', 'application/postscript', 'image/vnd.adobe.photoshop']}
                      className="mb-4"
                    />
                    
                    {uploadedFiles.length > 0 && (
                      <div className="mt-4">
                        <h4 className="font-medium mb-2">Yüklenen Dosyalar:</h4>
                        <div className="space-y-2">
                          {uploadedFiles.map((file, index) => (
                            <div key={index} className="flex items-center justify-between bg-white p-3 rounded border">
                              <span className="text-sm">{file}</span>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setUploadedFiles(prev => prev.filter((_, i) => i !== index))}
                              >
                                Kaldır
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setCurrentTab("design")}
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Geri
                    </Button>
                    <Button
                      type="button"
                      onClick={() => setCurrentTab("submit")}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Devam Et
                      <ArrowLeft className="h-4 w-4 ml-2 rotate-180" />
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="submit" className="space-y-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                      <CheckCircle className="h-5 w-5 text-blue-600 mr-2" />
                      Teklif Özeti
                    </h3>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Proje Tipi:</span>
                        <span className="font-medium">{typeConfig.title}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Başlık:</span>
                        <span className="font-medium">{form.getValues("title") || "Belirtilmedi"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Bütçe:</span>
                        <span className="font-medium">{form.getValues("budget") || "Belirtilmedi"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Yüklenen Dosya:</span>
                        <span className="font-medium">{uploadedFiles.length} dosya</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setCurrentTab("files")}
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Geri
                    </Button>
                    <Button
                      type="submit"
                      disabled={mutation.isPending}
                      className="bg-green-600 hover:bg-green-700 text-white font-semibold px-8"
                    >
                      {mutation.isPending ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Gönderiliyor...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Teklif Talebini Gönder
                        </>
                      )}
                    </Button>
                  </div>
                </TabsContent>
              </form>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}