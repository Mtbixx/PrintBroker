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

interface SpecificationData {
  quantity: string;
  width: string;
  height: string;
  material: string;
  adhesiveType: string;
  transparency: string;
  durability: string;
  colorOption: string;
  finishType: string;
  specialEffects: string[];
  applicationType: string;
  cuttingType: string;
  cornerType: string;
  packaging: string;
}

export default function QuoteFormUVDTF() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [currentTab, setCurrentTab] = useState("details");

  // UV DTF Specifications State
  const [specs, setSpecs] = useState<SpecificationData>({
    quantity: "",
    width: "",
    height: "",
    material: "",
    adhesiveType: "",
    transparency: "",
    durability: "",
    colorOption: "",
    finishType: "",
    specialEffects: [],
    applicationType: "",
    cuttingType: "",
    cornerType: "",
    packaging: ""
  });

  const form = useForm<UVDTFFormData>({
    resolver: zodResolver(uvdtfSchema),
    mode: "onChange",
    defaultValues: {
      title: "",
      type: "uv_dtf_label",
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
          ...specs,
          uploadedFiles,
          size: specs.width && specs.height ? `${specs.width}x${specs.height}mm` : "",
          quantity: parseInt(specs.quantity) || 0,
        },
      };

      if (quoteData.deadline && quoteData.deadline !== '') {
        quoteData.deadline = new Date(quoteData.deadline).toISOString();
      } else {
        delete quoteData.deadline;
      }

      console.log("Submitting UV DTF quote data:", quoteData);

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
      setSpecs({
        quantity: "",
        width: "",
        height: "",
        material: "",
        adhesiveType: "",
        transparency: "",
        durability: "",
        colorOption: "",
        finishType: "",
        specialEffects: [],
        applicationType: "",
        cuttingType: "",
        cornerType: "",
        packaging: ""
      });
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

  const updateSpec = (key: keyof SpecificationData, value: any) => {
    setSpecs(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const toggleSpecialEffect = (effect: string) => {
    setSpecs(prev => ({
      ...prev,
      specialEffects: prev.specialEffects.includes(effect)
        ? prev.specialEffects.filter(e => e !== effect)
        : [...prev.specialEffects, effect]
    }));
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
                  {/* Boyut ve Miktar */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4 text-gray-900 flex items-center">
                      <Target className="h-5 w-5 text-purple-600 mr-2" />
                      Etiket Boyutu ve Miktar
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <Label className="text-sm font-medium text-gray-700">Etiket Boyutu (mm)</Label>
                          <div className="grid grid-cols-2 gap-3 mt-2">
                            <div>
                              <Label className="text-xs text-gray-500">Genişlik</Label>
                              <Input 
                                placeholder="50" 
                                value={specs.width}
                                onChange={(e) => updateSpec('width', e.target.value)}
                                className="h-10"
                              />
                            </div>
                            <div>
                              <Label className="text-xs text-gray-500">Yükseklik</Label>
                              <Input 
                                placeholder="30" 
                                value={specs.height}
                                onChange={(e) => updateSpec('height', e.target.value)}
                                className="h-10"
                              />
                            </div>
                          </div>
                        </div>

                        <div>
                          <Label className="text-sm font-medium text-gray-700">Hazır Boyutlar</Label>
                          <div className="grid grid-cols-3 gap-2 mt-2">
                            {[
                              { label: '20x20', w: '20', h: '20' },
                              { label: '30x30', w: '30', h: '30' },
                              { label: '40x40', w: '40', h: '40' },
                              { label: '50x50', w: '50', h: '50' },
                              { label: '60x60', w: '60', h: '60' },
                              { label: '70x70', w: '70', h: '70' },
                            ].map((size) => (
                              <Button
                                key={size.label}
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  updateSpec('width', size.w);
                                  updateSpec('height', size.h);
                                }}
                                className="text-xs"
                              >
                                {size.label}mm
                              </Button>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <Label className="text-sm font-medium text-gray-700">Miktar (Adet)</Label>
                          <Input
                            type="number"
                            min="100"
                            placeholder="100"
                            value={specs.quantity}
                            onChange={(e) => updateSpec('quantity', e.target.value)}
                            className="h-10 mt-2"
                          />
                          {specs.quantity && parseInt(specs.quantity) < 100 && parseInt(specs.quantity) > 0 && (
                            <p className="text-sm text-red-500 mt-1">Minimum sipariş miktarı 100 adettir.</p>
                          )}
                        </div>

                        <div>
                          <Label className="text-sm font-medium text-gray-700">Hızlı Seçim</Label>
                          <div className="grid grid-cols-3 gap-2 mt-2">
                            {['100', '250', '500', '1000', '2500', '5000'].map((qty) => (
                              <Button
                                key={qty}
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => updateSpec('quantity', qty)}
                                className="text-xs"
                              >
                                {qty}
                              </Button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Malzeme Özellikleri */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4 text-gray-900 flex items-center">
                      <Layers className="h-5 w-5 text-purple-600 mr-2" />
                      Malzeme ve Film Özellikleri
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <Label className="text-sm font-medium text-gray-700 mb-2 block">Film Türü</Label>
                          <div className="space-y-2">
                            {[
                              { value: 'premium-uv-dtf', label: 'Premium UV DTF Film', desc: '0.7mm kalınlık, yüksek dayanıklılık' },
                              { value: 'standard-uv-dtf', label: 'Standart UV DTF Film', desc: '0.5mm kalınlık, ekonomik seçenek' },
                              { value: 'ultra-thin-uv-dtf', label: 'Ultra İnce UV DTF Film', desc: '0.3mm kalınlık, hassas uygulamalar' },
                            ].map((material) => (
                              <div
                                key={material.value}
                                className={`border rounded-lg p-3 cursor-pointer transition-all ${
                                  specs.material === material.value 
                                    ? 'border-purple-500 bg-purple-50' 
                                    : 'border-gray-200 hover:border-purple-300'
                                }`}
                                onClick={() => updateSpec('material', material.value)}
                              >
                                <div className="font-medium text-sm">{material.label}</div>
                                <div className="text-xs text-gray-500 mt-1">{material.desc}</div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <Label className="text-sm font-medium text-gray-700">Yapışkanlık Türü</Label>
                          <Select onValueChange={(value) => updateSpec('adhesiveType', value)} value={specs.adhesiveType}>
                            <SelectTrigger className="mt-2">
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
                        <div>
                          <Label className="text-sm font-medium text-gray-700 mb-2 block">Şeffaflık Derecesi</Label>
                          <div className="space-y-2">
                            {[
                              { value: 'opaque', label: 'Opak (Tamamen Kapalı)', desc: 'Arka plan tamamen gizlenir' },
                              { value: 'semi-transparent', label: 'Yarı Şeffaf', desc: 'Hafif geçirgenlik' },
                              { value: 'transparent', label: 'Şeffaf', desc: 'Arka plan görünür' },
                            ].map((transparency) => (
                              <div
                                key={transparency.value}
                                className={`border rounded-lg p-2 cursor-pointer transition-all ${
                                  specs.transparency === transparency.value 
                                    ? 'border-purple-500 bg-purple-50' 
                                    : 'border-gray-200 hover:border-purple-300'
                                }`}
                                onClick={() => updateSpec('transparency', transparency.value)}
                              >
                                <div className="font-medium text-sm">{transparency.label}</div>
                                <div className="text-xs text-gray-500">{transparency.desc}</div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <Label className="text-sm font-medium text-gray-700">Dayanıklılık</Label>
                          <Select onValueChange={(value) => updateSpec('durability', value)} value={specs.durability}>
                            <SelectTrigger className="mt-2">
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

                  {/* Baskı Özellikleri */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4 text-gray-900 flex items-center">
                      <Palette className="h-5 w-5 text-purple-600 mr-2" />
                      Baskı ve Renk Özellikleri
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <Label className="text-sm font-medium text-gray-700 mb-2 block">Renk Modeli</Label>
                          <div className="space-y-2">
                            {[
                              { value: 'cmyk', label: 'CMYK (4 Renk)', desc: 'Standart renkli baskı' },
                              { value: 'cmyk-white', label: 'CMYK + Beyaz', desc: 'Şeffaf yüzeylerde kullanım' },
                              { value: 'cmyk-spot', label: 'CMYK + Spot Renk', desc: 'Özel renk ekleme' },
                              { value: 'spot-colors', label: 'Sadece Spot Renkler', desc: '1-4 özel renk' },
                            ].map((color) => (
                              <div
                                key={color.value}
                                className={`border rounded-lg p-3 cursor-pointer transition-all ${
                                  specs.colorOption === color.value 
                                    ? 'border-purple-500 bg-purple-50' 
                                    : 'border-gray-200 hover:border-purple-300'
                                }`}
                                onClick={() => updateSpec('colorOption', color.value)}
                              >
                                <div className="font-medium text-sm">{color.label}</div>
                                <div className="text-xs text-gray-500 mt-1">{color.desc}</div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <Label className="text-sm font-medium text-gray-700 mb-2 block">Özel Efektler</Label>
                          <div className="space-y-2">
                            {[
                              { value: 'uv-varnish', label: 'UV Vernik' },
                              { value: 'metallic', label: 'Metalik Efekt' },
                              { value: 'holographic', label: 'Holografik' },
                              { value: 'glitter', label: 'Simli Efekt' },
                            ].map((effect) => (
                              <div key={effect.value} className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  id={effect.value}
                                  checked={specs.specialEffects.includes(effect.value)}
                                  onChange={() => toggleSpecialEffect(effect.value)}
                                  className="rounded border-gray-300"
                                />
                                <Label htmlFor={effect.value} className="text-sm cursor-pointer">{effect.label}</Label>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <Label className="text-sm font-medium text-gray-700 mb-2 block">Yüzey Finish</Label>
                          <div className="space-y-2">
                            {[
                              { value: 'gloss', label: 'Parlak (Gloss)', desc: 'Yüksek parlaklık, canlı renkler' },
                              { value: 'semi-gloss', label: 'Yarı Parlak', desc: 'Orta parlaklık, dengeli görünüm' },
                              { value: 'satin', label: 'Saten', desc: 'Yumuşak parlaklık, premium görünüm' },
                              { value: 'matte', label: 'Mat', desc: 'Parlaksız, şık görünüm' },
                            ].map((finish) => (
                              <div
                                key={finish.value}
                                className={`border rounded-lg p-2 cursor-pointer transition-all ${
                                  specs.finishType === finish.value 
                                    ? 'border-purple-500 bg-purple-50' 
                                    : 'border-gray-200 hover:border-purple-300'
                                }`}
                                onClick={() => updateSpec('finishType', finish.value)}
                              >
                                <div className="font-medium text-sm">{finish.label}</div>
                                <div className="text-xs text-gray-500">{finish.desc}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Uygulama Özellikleri */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4 text-gray-900 flex items-center">
                      <Zap className="h-5 w-5 text-purple-600 mr-2" />
                      Uygulama ve Transfer Özellikleri
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <Label className="text-sm font-medium text-gray-700">Transfer Yöntemi</Label>
                          <Select onValueChange={(value) => updateSpec('applicationType', value)} value={specs.applicationType}>
                            <SelectTrigger className="mt-2">
                              <SelectValue placeholder="Transfer yöntemi seçin" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="dry-transfer">Kuru Transfer (Oda sıcaklığı)</SelectItem>
                              <SelectItem value="wet-transfer">Islak Transfer (Sabunlu su)</SelectItem>
                              <SelectItem value="heat-transfer">Sıcak Transfer (60-80°C)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label className="text-sm font-medium text-gray-700">Kesim Özellikleri</Label>
                          <Select onValueChange={(value) => updateSpec('cuttingType', value)} value={specs.cuttingType}>
                            <SelectTrigger className="mt-2">
                              <SelectValue placeholder="Kesim türü seçin" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="kiss-cut">Kiss Cut (Sadece etiket kesilir)</SelectItem>
                              <SelectItem value="through-cut">Through Cut (Tamamen kesilir)</SelectItem>
                              <SelectItem value="perforated">Perforeli (Kolay ayırma)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <Label className="text-sm font-medium text-gray-700">Köşe Şekli</Label>
                          <Select onValueChange={(value) => updateSpec('cornerType', value)} value={specs.cornerType}>
                            <SelectTrigger className="mt-2">
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

                        <div>
                          <Label className="text-sm font-medium text-gray-700">Ambalajlama</Label>
                          <Select onValueChange={(value) => updateSpec('packaging', value)} value={specs.packaging}>
                            <SelectTrigger className="mt-2">
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
                        <span className="font-medium">{specs.quantity || "Belirtilmedi"} adet</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Boyut:</span>
                        <span className="font-medium">
                          {specs.width && specs.height ? `${specs.width}x${specs.height}mm` : "Belirtilmedi"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Malzeme:</span>
                        <span className="font-medium">{specs.material || "Belirtilmedi"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Yapışkanlık:</span>
                        <span className="font-medium">{specs.adhesiveType || "Belirtilmedi"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Renk Modeli:</span>
                        <span className="font-medium">{specs.colorOption || "Belirtilmedi"}</span>
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