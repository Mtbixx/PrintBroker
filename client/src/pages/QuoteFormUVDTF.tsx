
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
  Palette,
  AlertCircle,
  ArrowLeft,
  Send,
  Upload,
  Calculator,
  CheckCircle,
  Target,
  FileText,
  Star,
  Sparkles,
  Layers,
  Zap
} from "lucide-react";
import { Link } from "wouter";

const uvdtfSchema = z.object({
  title: z.string().min(1, "Başlık gerekli"),
  type: z.literal("uv_dtf_label"),
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

type UVDTFFormData = z.infer<typeof uvdtfSchema>;

export default function QuoteFormUVDTF() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [currentTab, setCurrentTab] = useState("details");
  const [formData, setFormData] = useState<any>({});

  const form = useForm<UVDTFFormData>({
    resolver: zodResolver(uvdtfSchema),
    defaultValues: {
      title: "",
      type: "uv_dtf_label",
      specifications: {},
      description: "",
      deadline: "",
      budget: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: UVDTFFormData) => {
      const quoteData = {
        ...data,
        specifications: {
          ...data.specifications,
          ...formData,
          uploadedFiles,
        },
      };

      if (quoteData.deadline && quoteData.deadline !== '') {
        quoteData.deadline = new Date(quoteData.deadline).toISOString();
      } else {
        delete quoteData.deadline;
      }

      console.log("Submitting UV DTF quote data:", {
        title: quoteData.title,
        type: quoteData.type,
        hasDeadline: !!quoteData.deadline,
        specificationsCount: Object.keys(quoteData.specifications).length
      });

      const response = await fetch("/api/quotes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(quoteData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("UV DTF quote submission failed:", errorData);
        throw new Error(errorData.message || `${response.status}: ${response.statusText}`);
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Başarılı",
        description: "UV DTF etiket teklif talebiniz başarıyla gönderildi!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/quotes"] });
      form.reset();
      setUploadedFiles([]);
      setFormData({});
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
        description: "UV DTF teklif gönderilirken bir hata oluştu.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: UVDTFFormData) => {
    mutation.mutate(data);
  };

  const handleFileUpload = (fileId: string) => {
    setUploadedFiles(prev => {
      if (!prev.includes(fileId)) {
        return [...prev, fileId];
      }
      return prev;
    });
    toast({
      title: "Dosya Yüklendi",
      description: "Dosyanız başarıyla yüklendi ve analiz edildi.",
    });
  };

  const updateFormData = (key: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [key]: value }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'customer') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
              <h2 className="text-xl font-semibold mb-2">Erişim Reddedildi</h2>
              <p className="text-gray-600 mb-4">
                Bu sayfaya sadece müşteriler erişebilir.
              </p>
              <Button onClick={() => window.location.href = "/dashboard"}>
                Dashboard'a Dön
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50">
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
          <Card className="mb-8 border-0 shadow-xl bg-gradient-to-r from-white to-purple-50">
            <CardContent className="p-8">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center shadow-lg">
                  <Palette className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-gray-900 mb-2">
                    UV DTF Etiket Teklifi
                  </h1>
                  <p className="text-xl text-gray-600">
                    Yüksek kaliteli UV DTF transfer etiket baskısı
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                  <div className="text-sm text-gray-500 mb-1">Teknoloji</div>
                  <div className="text-2xl font-bold text-purple-600">UV DTF</div>
                </div>
                <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                  <div className="text-sm text-gray-500 mb-1">Min. Miktar</div>
                  <div className="text-2xl font-bold text-green-600">100 Adet</div>
                </div>
                <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                  <div className="text-sm text-gray-500 mb-1">Dayanıklılık</div>
                  <div className="text-2xl font-bold text-orange-600">5+ Yıl</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Form Card */}
        <Card className="border-0 shadow-xl">
          <CardContent className="p-8">
            <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4 mb-8">
                <TabsTrigger value="details" className="flex items-center space-x-2">
                  <Target className="h-4 w-4" />
                  <span>Detaylar</span>
                </TabsTrigger>
                <TabsTrigger value="specifications" className="flex items-center space-x-2">
                  <Calculator className="h-4 w-4" />
                  <span>Özellikler</span>
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
                        placeholder="Örn: UV DTF Logo Etiketleri"
                        {...form.register("title")}
                        className="border-gray-300 focus:border-purple-500"
                      />
                      {form.formState.errors.title && (
                        <p className="text-sm text-red-500">{form.formState.errors.title.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="budget">Bütçe (TL)</Label>
                      <Input
                        id="budget"
                        placeholder="Örn: 2000-5000"
                        {...form.register("budget")}
                        className="border-gray-300 focus:border-purple-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="deadline">Teslim Tarihi</Label>
                      <Input
                        id="deadline"
                        type="date"
                        {...form.register("deadline")}
                        className="border-gray-300 focus:border-purple-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Proje Açıklaması</Label>
                    <Textarea
                      id="description"
                      placeholder="UV DTF etiket projeniz hakkında detaylı bilgi verin..."
                      rows={4}
                      {...form.register("description")}
                      className="border-gray-300 focus:border-purple-500"
                    />
                  </div>

                  <div className="flex justify-end">
                    <Button
                      type="button"
                      onClick={() => setCurrentTab("specifications")}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      Devam Et
                      <ArrowLeft className="h-4 w-4 ml-2 rotate-180" />
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="specifications" className="space-y-8">
                  {/* UV DTF Özellikler */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4 text-gray-900">UV DTF Etiket Özellikleri</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">Etiket Boyutu *</Label>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="text-xs text-gray-500">Genişlik (mm)</Label>
                            <Input 
                              placeholder="Örn: 50" 
                              onChange={(e) => updateFormData('width', e.target.value)}
                              className="h-12"
                            />
                          </div>
                          <div>
                            <Label className="text-xs text-gray-500">Yükseklik (mm)</Label>
                            <Input 
                              placeholder="Örn: 30" 
                              onChange={(e) => updateFormData('height', e.target.value)}
                              className="h-12"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">Miktar (Adet) *</Label>
                        <div className="h-[20px]"></div>
                        <Input
                          type="number"
                          min="100"
                          placeholder="Minimum 100 adet"
                          onChange={(e) => {
                            const value = parseInt(e.target.value) || 0;
                            updateFormData('quantity', e.target.value);
                            
                            if (value > 0 && value < 100) {
                              toast({
                                title: "Uyarı",
                                description: "Minimum sipariş miktarı 100 adettir.",
                                variant: "destructive",
                              });
                            }
                          }}
                          className="h-12"
                        />
                        {formData.quantity && parseInt(formData.quantity) < 100 && parseInt(formData.quantity) > 0 && (
                          <p className="text-sm text-red-500">Minimum sipariş miktarı 100 adettir.</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Malzeme Özellikleri */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4 text-gray-900">Malzeme Özellikleri</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        { value: 'premium-uv-dtf', label: 'Premium UV DTF', desc: 'Yüksek kalite, uzun ömür' },
                        { value: 'standard-uv-dtf', label: 'Standart UV DTF', desc: 'Ekonomik, kaliteli' },
                        { value: 'waterproof-uv-dtf', label: 'Su Geçirmez UV DTF', desc: 'Dış mekan kullanımı' },
                        { value: 'transparent-uv-dtf', label: 'Şeffaf UV DTF', desc: 'Görünmez arka plan' },
                      ].map((material) => (
                        <Button
                          key={material.value}
                          variant={formData.material === material.value ? 'default' : 'outline'}
                          onClick={() => updateFormData('material', material.value)}
                          className="h-auto p-4 justify-start"
                        >
                          <div className="text-left">
                            <div className="font-medium">{material.label}</div>
                            <div className="text-sm text-gray-500">{material.desc}</div>
                          </div>
                        </Button>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Renk ve Finish */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4 text-gray-900">Renk ve Finish</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">Renk Seçeneği</Label>
                        <Select onValueChange={(value) => updateFormData('colorOption', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Renk seçin" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="full-color">Full Color (CMYK)</SelectItem>
                            <SelectItem value="spot-color">Spot Renk</SelectItem>
                            <SelectItem value="white-ink">Beyaz Mürekkep</SelectItem>
                            <SelectItem value="metallic">Metalik Renk</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">Finish Türü</Label>
                        <Select onValueChange={(value) => updateFormData('finishType', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Finish seçin" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="gloss">Parlak</SelectItem>
                            <SelectItem value="matte">Mat</SelectItem>
                            <SelectItem value="satin">Saten</SelectItem>
                            <SelectItem value="textured">Dokulu</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Uygulama Türü */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4 text-gray-900">Uygulama Türü</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        { value: 'transfer-tape', label: 'Transfer Tape ile', desc: 'Kolay uygulama' },
                        { value: 'direct-apply', label: 'Direkt Uygulama', desc: 'Hızlı yapıştırma' },
                        { value: 'wet-apply', label: 'Islak Uygulama', desc: 'Profesyonel sonuç' },
                        { value: 'heat-apply', label: 'Sıcak Uygulama', desc: 'Güçlü yapışma' },
                      ].map((application) => (
                        <Button
                          key={application.value}
                          variant={formData.applicationType === application.value ? 'default' : 'outline'}
                          onClick={() => updateFormData('applicationType', application.value)}
                          className="h-auto p-4 justify-start"
                        >
                          <div className="text-left">
                            <div className="font-medium">{application.label}</div>
                            <div className="text-sm text-gray-500">{application.desc}</div>
                          </div>
                        </Button>
                      ))}
                    </div>
                  </div>

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
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      Devam Et
                      <ArrowLeft className="h-4 w-4 ml-2 rotate-180" />
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="files" className="space-y-6">
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                      <Upload className="h-5 w-5 text-purple-600 mr-2" />
                      Tasarım Dosyaları
                    </h3>
                    <p className="text-gray-600 mb-4">
                      UV DTF etiket tasarımlarınızı yükleyin. Yüksek çözünürlüklü dosyalar en iyi sonuçları verir.
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
                      onClick={() => setCurrentTab("submit")}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      Devam Et
                      <ArrowLeft className="h-4 w-4 ml-2 rotate-180" />
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="submit" className="space-y-6">
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                      <CheckCircle className="h-5 w-5 text-purple-600 mr-2" />
                      UV DTF Teklif Özeti
                    </h3>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Proje Tipi:</span>
                        <span className="font-medium">UV DTF Etiket</span>
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
                          UV DTF Teklif Talebini Gönder
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
