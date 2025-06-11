
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
    quantity: z.coerce.number().min(1, "Miktar en az 1 olmalı").optional(),
    material: z.string().optional(),
    size: z.string().optional(),
    description: z.string().optional(),
    width: z.string().optional(),
    height: z.string().optional(),
    adhesiveType: z.string().optional(),
    transparency: z.string().optional(),
    durability: z.string().optional(),
    colorOption: z.string().optional(),
    finishType: z.string().optional(),
    specialEffects: z.array(z.string()).optional(),
    applicationType: z.string().optional(),
    cuttingType: z.string().optional(),
    cornerType: z.string().optional(),
    packaging: z.string().optional()
  }).optional(),
  contactInfo: z.object({
    companyName: z.string().min(1, "Firma adı gerekli"),
    contactName: z.string().min(1, "Yetkili kişi adı gerekli"),
    email: z.string().email("Geçerli e-posta adresi gerekli"),
    phone: z.string().optional()
  }).optional(),
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
    mode: "onChange",
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
      // Combine form specifications with formData
      const combinedSpecs = {
        ...data.specifications,
        ...formData,
        uploadedFiles,
        // Ensure size is properly formatted
        size: formData.width && formData.height ? `${formData.width}x${formData.height}mm` : "",
        // Ensure quantity is a number
        quantity: parseInt(formData.quantity) || 0,
      };

      const quoteData = {
        ...data,
        specifications: combinedSpecs,
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

  // Initialize form data and sync with form watch
  useEffect(() => {
    const subscription = form.watch((value, { name, type }) => {
      // Watch for any changes and update formData accordingly
      if (name && name.startsWith('specifications.')) {
        const key = name.replace('specifications.', '');
        if (value.specifications && value.specifications[key] !== undefined) {
          setFormData((prev: any) => ({ ...prev, [key]: value.specifications[key] }));
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

  const updateFormData = (key: string, value: any) => {
    // Update both local state and form
    setFormData((prev: any) => {
      const updated = { ...prev, [key]: value };
      return updated;
    });
    
    // Update form registry
    form.setValue(`specifications.${key}` as any, value, { 
      shouldValidate: true, 
      shouldDirty: true 
    });
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
                  {/* UV DTF Etiket Boyutu */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4 text-gray-900 flex items-center">
                      <Target className="h-5 w-5 text-purple-600 mr-2" />
                      UV DTF Etiket Boyutu
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">Etiket Boyutu *</Label>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="text-xs text-gray-500">Genişlik (mm)</Label>
                            <Input 
                              placeholder="Örn: 50" 
                              value={formData.width || ''}
                              onChange={(e) => updateFormData('width', e.target.value)}
                              className="h-12"
                            />
                          </div>
                          <div>
                            <Label className="text-xs text-gray-500">Yükseklik (mm)</Label>
                            <Input 
                              placeholder="Örn: 30" 
                              value={formData.height || ''}
                              onChange={(e) => updateFormData('height', e.target.value)}
                              className="h-12"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">Hazır Boyutlar</Label>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { label: '20x20mm', width: '20', height: '20' },
                            { label: '30x30mm', width: '30', height: '30' },
                            { label: '40x40mm', width: '40', height: '40' },
                            { label: '50x50mm', width: '50', height: '50' },
                            { label: '60x60mm', width: '60', height: '60' },
                            { label: '70x70mm', width: '70', height: '70' },
                          ].map((size) => (
                            <Button
                              key={size.label}
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                updateFormData('width', size.width);
                                updateFormData('height', size.height);
                              }}
                              className="text-xs"
                            >
                              {size.label}
                            </Button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">Miktar (Adet) *</Label>
                        <Input
                          type="number"
                          min="100"
                          placeholder="Minimum 100 adet"
                          value={formData.quantity || ''}
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

                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">Hızlı Miktar Seçimi</Label>
                        <div className="grid grid-cols-3 gap-2">
                          {['100', '250', '500', '1000', '2500', '5000'].map((qty) => (
                            <Button
                              key={qty}
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => updateFormData('quantity', qty)}
                              className="text-xs"
                            >
                              {qty} adet
                            </Button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* UV DTF Malzeme ve Film Özellikleri */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4 text-gray-900 flex items-center">
                      <Layers className="h-5 w-5 text-purple-600 mr-2" />
                      UV DTF Malzeme ve Film Özellikleri
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-gray-700">Film Türü</Label>
                          <div className="grid grid-cols-1 gap-3">
                            {[
                              { value: 'premium-uv-dtf', label: 'Premium UV DTF Film', desc: '0.7mm kalınlık, yüksek dayanıklılık', price: '+%30' },
                              { value: 'standard-uv-dtf', label: 'Standart UV DTF Film', desc: '0.5mm kalınlık, ekonomik seçenek', price: 'Standart' },
                              { value: 'ultra-thin-uv-dtf', label: 'Ultra İnce UV DTF Film', desc: '0.3mm kalınlık, hassas uygulamalar', price: '+%15' },
                            ].map((material) => (
                              <Button
                                key={material.value}
                                type="button"
                                variant={formData.material === material.value ? 'default' : 'outline'}
                                onClick={() => updateFormData('material', material.value)}
                                className="h-auto p-4 justify-start"
                              >
                                <div className="text-left w-full">
                                  <div className="flex justify-between items-start">
                                    <div className="font-medium">{material.label}</div>
                                    <Badge variant="secondary" className="text-xs">{material.price}</Badge>
                                  </div>
                                  <div className="text-sm text-gray-500 mt-1">{material.desc}</div>
                                </div>
                              </Button>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-gray-700">Yapışkanlık Türü</Label>
                          <Select onValueChange={(value) => updateFormData('adhesiveType', value)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Yapışkanlık seçin" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="permanent">Permanent (Kalıcı)</SelectItem>
                              <SelectItem value="removable">Removable (Çıkarılabilir)</SelectItem>
                              <SelectItem value="repositionable">Repositionable (Yeniden Konumlandırılabilir)</SelectItem>
                              <SelectItem value="ultra-removable">Ultra Removable (Hasar Bırakmaz)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-gray-700">Şeffaflık Derecesi</Label>
                          <div className="grid grid-cols-1 gap-2">
                            {[
                              { value: 'opaque', label: 'Opak (Tamamen Kapalı)', desc: 'Arka plan tamamen gizlenir' },
                              { value: 'semi-transparent', label: 'Yarı Şeffaf', desc: 'Hafif geçirgenlik' },
                              { value: 'transparent', label: 'Şeffaf', desc: 'Arka plan görünür' },
                            ].map((transparency) => (
                              <Button
                                key={transparency.value}
                                type="button"
                                variant={formData.transparency === transparency.value ? 'default' : 'outline'}
                                onClick={() => updateFormData('transparency', transparency.value)}
                                className="h-auto p-3 justify-start"
                              >
                                <div className="text-left">
                                  <div className="font-medium text-sm">{transparency.label}</div>
                                  <div className="text-xs text-gray-500">{transparency.desc}</div>
                                </div>
                              </Button>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-gray-700">Dayanıklılık</Label>
                          <Select onValueChange={(value) => updateFormData('durability', value)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Dayanıklılık seçin" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="indoor-1-year">İç Mekan - 1 Yıl</SelectItem>
                              <SelectItem value="indoor-3-years">İç Mekan - 3 Yıl</SelectItem>
                              <SelectItem value="outdoor-2-years">Dış Mekan - 2 Yıl</SelectItem>
                              <SelectItem value="outdoor-5-years">Dış Mekan - 5 Yıl</SelectItem>
                              <SelectItem value="marine-grade">Denizcilik Kalitesi - 7 Yıl</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Baskı ve Renk Özellikleri */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4 text-gray-900 flex items-center">
                      <Palette className="h-5 w-5 text-purple-600 mr-2" />
                      Baskı ve Renk Özellikleri
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-gray-700">Renk Modeli</Label>
                          <div className="grid grid-cols-1 gap-2">
                            {[
                              { value: 'cmyk', label: 'CMYK (4 Renk)', desc: 'Standart renkli baskı', price: 'Standart' },
                              { value: 'cmyk-white', label: 'CMYK + Beyaz', desc: 'Şeffaf yüzeylerde kullanım', price: '+%20' },
                              { value: 'cmyk-spot', label: 'CMYK + Spot Renk', desc: 'Özel renk ekleme', price: '+%35' },
                              { value: 'spot-colors', label: 'Sadece Spot Renkler', desc: '1-4 özel renk', price: '+%25' },
                            ].map((color) => (
                              <Button
                                key={color.value}
                                type="button"
                                variant={formData.colorOption === color.value ? 'default' : 'outline'}
                                onClick={() => updateFormData('colorOption', color.value)}
                                className="h-auto p-3 justify-start"
                              >
                                <div className="text-left w-full">
                                  <div className="flex justify-between items-start">
                                    <div className="font-medium text-sm">{color.label}</div>
                                    <Badge variant="secondary" className="text-xs">{color.price}</Badge>
                                  </div>
                                  <div className="text-xs text-gray-500 mt-1">{color.desc}</div>
                                </div>
                              </Button>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-gray-700">Yüzey Finish</Label>
                          <div className="grid grid-cols-1 gap-2">
                            {[
                              { value: 'gloss', label: 'Parlak (Gloss)', desc: 'Yüksek parlaklık, canlı renkler' },
                              { value: 'semi-gloss', label: 'Yarı Parlak', desc: 'Orta parlaklık, dengeli görünüm' },
                              { value: 'satin', label: 'Saten', desc: 'Yumuşak parlaklık, premium görünüm' },
                              { value: 'matte', label: 'Mat', desc: 'Parlaksız, şık görünüm' },
                            ].map((finish) => (
                              <Button
                                key={finish.value}
                                type="button"
                                variant={formData.finishType === finish.value ? 'default' : 'outline'}
                                onClick={() => updateFormData('finishType', finish.value)}
                                className="h-auto p-3 justify-start"
                              >
                                <div className="text-left">
                                  <div className="font-medium text-sm">{finish.label}</div>
                                  <div className="text-xs text-gray-500">{finish.desc}</div>
                                </div>
                              </Button>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-gray-700">Özel Efektler</Label>
                          <div className="grid grid-cols-1 gap-2">
                            {[
                              { value: 'none', label: 'Efekt Yok', checked: !formData.specialEffects },
                              { value: 'uv-varnish', label: 'UV Vernik', checked: formData.specialEffects?.includes('uv-varnish') },
                              { value: 'metallic', label: 'Metalik Efekt', checked: formData.specialEffects?.includes('metallic') },
                              { value: 'holographic', label: 'Holografik', checked: formData.specialEffects?.includes('holographic') },
                            ].map((effect) => (
                              <div key={effect.value} className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  id={effect.value}
                                  checked={effect.checked || false}
                                  onChange={(e) => {
                                    if (effect.value === 'none') {
                                      updateFormData('specialEffects', []);
                                    } else {
                                      const current = formData.specialEffects || [];
                                      if (e.target.checked) {
                                        updateFormData('specialEffects', [...current, effect.value]);
                                      } else {
                                        updateFormData('specialEffects', current.filter(item => item !== effect.value));
                                      }
                                    }
                                  }}
                                  className="rounded border-gray-300"
                                />
                                <Label htmlFor={effect.value} className="text-sm cursor-pointer">{effect.label}</Label>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Uygulama ve Transfer Özellikleri */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4 text-gray-900 flex items-center">
                      <Zap className="h-5 w-5 text-purple-600 mr-2" />
                      Uygulama ve Transfer Özellikleri
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-gray-700">Transfer Yöntemi</Label>
                          <div className="grid grid-cols-1 gap-3">
                            {[
                              { value: 'dry-transfer', label: 'Kuru Transfer', desc: 'Transfer tape ile kolay uygulama', temp: 'Oda sıcaklığı' },
                              { value: 'wet-transfer', label: 'Islak Transfer', desc: 'Sabunlu su ile hassas uygulama', temp: 'Oda sıcaklığı' },
                              { value: 'heat-transfer', label: 'Sıcak Transfer', desc: 'Isı ile güçlü yapışma', temp: '60-80°C' },
                            ].map((transfer) => (
                              <Button
                                key={transfer.value}
                                type="button"
                                variant={formData.applicationType === transfer.value ? 'default' : 'outline'}
                                onClick={() => updateFormData('applicationType', transfer.value)}
                                className="h-auto p-4 justify-start"
                              >
                                <div className="text-left w-full">
                                  <div className="flex justify-between items-start">
                                    <div className="font-medium">{transfer.label}</div>
                                    <Badge variant="outline" className="text-xs">{transfer.temp}</Badge>
                                  </div>
                                  <div className="text-sm text-gray-500 mt-1">{transfer.desc}</div>
                                </div>
                              </Button>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-gray-700">Kesim Özellikleri</Label>
                          <div className="grid grid-cols-1 gap-2">
                            {[
                              { value: 'kiss-cut', label: 'Kiss Cut', desc: 'Sadece etiket kesilir, arka kağıt kesilmez' },
                              { value: 'through-cut', label: 'Through Cut', desc: 'Etiket ve arka kağıt tamamen kesilir' },
                              { value: 'perforated', label: 'Perforeli', desc: 'Kolay ayırma için perforasyon' },
                            ].map((cutting) => (
                              <Button
                                key={cutting.value}
                                type="button"
                                variant={formData.cuttingType === cutting.value ? 'default' : 'outline'}
                                onClick={() => updateFormData('cuttingType', cutting.value)}
                                className="h-auto p-3 justify-start"
                              >
                                <div className="text-left">
                                  <div className="font-medium text-sm">{cutting.label}</div>
                                  <div className="text-xs text-gray-500">{cutting.desc}</div>
                                </div>
                              </Button>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-gray-700">Köşe Şekli</Label>
                          <Select onValueChange={(value) => updateFormData('cornerType', value)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Köşe şekli seçin" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="square">Kare Köşe</SelectItem>
                              <SelectItem value="rounded-2mm">Yuvarlak Köşe (2mm)</SelectItem>
                              <SelectItem value="rounded-5mm">Yuvarlak Köşe (5mm)</SelectItem>
                              <SelectItem value="rounded-10mm">Yuvarlak Köşe (10mm)</SelectItem>
                              <SelectItem value="custom-shape">Özel Şekil</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-gray-700">Ambalajlama</Label>
                          <Select onValueChange={(value) => updateFormData('packaging', value)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Ambalaj seçin" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="individual-sheets">Tekli Yapraklar</SelectItem>
                              <SelectItem value="roll-format">Rulo Format</SelectItem>
                              <SelectItem value="pre-spaced">Önceden Aralıklı</SelectItem>
                              <SelectItem value="transfer-tape-applied">Transfer Tape Uygulanmış</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
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
                    
                    {/* Debug bilgisi - geliştirme sırasında */}
                    {Object.keys(formData).length > 0 && (
                      <div className="mb-4 p-3 bg-blue-50 rounded text-xs">
                        <strong>Form Data:</strong> {JSON.stringify(formData, null, 2)}
                      </div>
                    )}
                    
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Proje Tipi:</span>
                        <span className="font-medium">UV DTF Etiket</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Başlık:</span>
                        <span className="font-medium">{form.watch("title") || "Belirtilmedi"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Bütçe:</span>
                        <span className="font-medium">{form.watch("budget") || "Belirtilmedi"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Miktar:</span>
                        <span className="font-medium">{formData.quantity || form.watch("specifications.quantity") || "Belirtilmedi"} adet</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Boyut:</span>
                        <span className="font-medium">
                          {(formData.width && formData.height) || (form.watch("specifications.width") && form.watch("specifications.height")) 
                            ? `${formData.width || form.watch("specifications.width")}x${formData.height || form.watch("specifications.height")}mm` 
                            : "Belirtilmedi"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Malzeme:</span>
                        <span className="font-medium">{formData.material || form.watch("specifications.material") || "Belirtilmedi"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Yapışkanlık:</span>
                        <span className="font-medium">{formData.adhesiveType || form.watch("specifications.adhesiveType") || "Belirtilmedi"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Renk Modeli:</span>
                        <span className="font-medium">{formData.colorOption || form.watch("specifications.colorOption") || "Belirtilmedi"}</span>
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
