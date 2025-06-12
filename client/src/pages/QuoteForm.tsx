import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useParams } from "wouter";
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
  LayoutGrid, 
  Disc, 
  Printer,
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
  Palette,
  Layers
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
  const [formData, setFormData] = useState<any>({});
  const [surfaceProcessingTab, setSurfaceProcessingTab] = useState("cellophane");

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
          ...formData,
          uploadedFiles,
        },
      };

      // Convert deadline to proper format if it exists
      if (quoteData.deadline && quoteData.deadline !== '') {
        quoteData.deadline = new Date(quoteData.deadline).toISOString();
      } else {
        delete quoteData.deadline;
      }

      console.log("Submitting quote data:", {
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
        console.error("Quote submission failed:", errorData);
        throw new Error(errorData.message || `${response.status}: ${response.statusText}`);
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
        description: "Teklif gönderilirken bir hata oluştu.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: QuoteFormData) => {
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

  const getTypeConfig = () => {
    switch (type) {
      case 'sheet_label':
        return {
          title: 'Tabaka Etiket Teklifi',
          description: 'Profesyonel tabaka etiket baskısı için detaylı teklif',
          icon: <LayoutGrid className="h-8 w-8 text-white" />,
          color: 'blue',
          bgGradient: 'from-blue-500 to-indigo-600'
        };
      case 'roll_label':
        return {
          title: 'Rulo Etiket Teklifi',
          description: 'Endüstriyel rulo etiket çözümleri',
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

  const renderSurfaceProcessingOptions = () => (
    <div className="space-y-4">
      <Label className="text-base font-semibold">Yüzey İşlemleri</Label>

      <Tabs value={surfaceProcessingTab} onValueChange={setSurfaceProcessingTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="cellophane" className="flex items-center space-x-1">
            <Layers className="h-4 w-4" />
            <span>Selefon</span>
          </TabsTrigger>
          <TabsTrigger value="foil" className="flex items-center space-x-1">
            <Star className="h-4 w-4" />
            <span>Yaldız</span>
          </TabsTrigger>
          <TabsTrigger value="varnish" className="flex items-center space-x-1">
            <Sparkles className="h-4 w-4" />
            <span>Vernik</span>
          </TabsTrigger>
          <TabsTrigger value="emboss" className="flex items-center space-x-1">
            <Target className="h-4 w-4" />
            <span>Kabartma</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="cellophane" className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Button
              variant={formData.cellophaneType === 'mat' ? 'default' : 'outline'}
              onClick={() => updateFormData('cellophaneType', 'mat')}
              className="h-auto p-4 justify-start"
            >
              <div className="text-left">
                <div className="font-medium">Mat Selefon</div>
                <div className="text-sm text-gray-500">Pürüzsüz, yansımasız görünüm</div>
              </div>
            </Button>
            <Button
              variant={formData.cellophaneType === 'gloss' ? 'default' : 'outline'}
              onClick={() => updateFormData('cellophaneType', 'gloss')}
              className="h-auto p-4 justify-start"
            >
              <div className="text-left">
                <div className="font-medium">Parlak Selefon</div>
                <div className="text-sm text-gray-500">Yüksek parlaklık, canlı renkler</div>
              </div>
            </Button>
            <Button
              variant={formData.cellophaneType === 'soft-touch' ? 'default' : 'outline'}
              onClick={() => updateFormData('cellophaneType', 'soft-touch')}
              className="h-auto p-4 justify-start"
            >
              <div className="text-left">
                <div className="font-medium">Soft Touch Selefon</div>
                <div className="text-sm text-gray-500">Kadife hissi, premium görünüm</div>
              </div>
            </Button>
            <Button
              variant={formData.cellophaneType === 'anti-scratch' ? 'default' : 'outline'}
              onClick={() => updateFormData('cellophaneType', 'anti-scratch')}
              className="h-auto p-4 justify-start"
            >
              <div className="text-left">
                <div className="font-medium">Çizilmez Selefon</div>
                <div className="text-sm text-gray-500">Dayanıklı, uzun ömürlü</div>
              </div>
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="foil" className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Button
              variant={formData.foilType === 'gold' ? 'default' : 'outline'}
              onClick={() => updateFormData('foilType', 'gold')}
              className="h-auto p-4 justify-start"
            >
              <div className="text-left">
                <div className="font-medium">Altın Yaldız</div>
                <div className="text-sm text-gray-500">Klasik, prestijli görünüm</div>
              </div>
            </Button>
            <Button
              variant={formData.foilType === 'silver' ? 'default' : 'outline'}
              onClick={() => updateFormData('foilType', 'silver')}
              className="h-auto p-4 justify-start"
            >
              <div className="text-left">
                <div className="font-medium">Gümüş Yaldız</div>
                <div className="text-sm text-gray-500">Modern, şık görünüm</div>
              </div>
            </Button>
            <Button
              variant={formData.foilType === 'hologram' ? 'default' : 'outline'}
              onClick={() => updateFormData('foilType', 'hologram')}
              className="h-auto p-4 justify-start"
            >
              <div className="text-left">
                <div className="font-medium">Hologram Yaldız</div>
                <div className="text-sm text-gray-500">Gökkuşağı efekti, güvenlik</div>
              </div>
            </Button>
            <Button
              variant={formData.foilType === 'copper' ? 'default' : 'outline'}
              onClick={() => updateFormData('foilType', 'copper')}
              className="h-auto p-4 justify-start"
            >
              <div className="text-left">
                <div className="font-medium">Bakır Yaldız</div>
                <div className="text-sm text-gray-500">Sıcak, vintage görünüm</div>
              </div>
            </Button>
            <Button
              variant={formData.foilType === 'red' ? 'default' : 'outline'}
              onClick={() => updateFormData('foilType', 'red')}
              className="h-auto p-4 justify-start"
            >
              <div className="text-left">
                <div className="font-medium">Kırmızı Yaldız</div>
                <div className="text-sm text-gray-500">Dikkat çekici, enerjik</div>
              </div>
            </Button>
            <Button
              variant={formData.foilType === 'blue' ? 'default' : 'outline'}
              onClick={() => updateFormData('foilType', 'blue')}
              className="h-auto p-4 justify-start"
            >
              <div className="text-left">
                <div className="font-medium">Mavi Yaldız</div>
                <div className="text-sm text-gray-500">Güven verici, profesyonel</div>
              </div>
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="varnish" className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Button
              variant={formData.varnishType === 'uv-total' ? 'default' : 'outline'}
              onClick={() => updateFormData('varnishType', 'uv-total')}
              className="h-auto p-4 justify-start"
            >
              <div className="text-left">
                <div className="font-medium">Tam UV Vernik</div>
                <div className="text-sm text-gray-500">Tüm yüzey parlak</div>
              </div>
            </Button>
            <Button
              variant={formData.varnishType === 'uv-spot' ? 'default' : 'outline'}
              onClick={() => updateFormData('varnishType', 'uv-spot')}
              className="h-auto p-4 justify-start"
            >
              <div className="text-left">
                <div className="font-medium">Nokta UV Vernik</div>
                <div className="text-sm text-gray-500">Seçili alanlar parlak</div>
              </div>
            </Button>
            <Button
              variant={formData.varnishType === 'water-based' ? 'default' : 'outline'}
              onClick={() => updateFormData('varnishType', 'water-based')}
              className="h-auto p-4 justify-start"
            >
              <div className="text-left">
                <div className="font-medium">Su Bazlı Vernik</div>
                <div className="text-sm text-gray-500">Çevre dostu, doğal</div>
              </div>
            </Button>
            <Button
              variant={formData.varnishType === 'oil-based' ? 'default' : 'outline'}
              onClick={() => updateFormData('varnishType', 'oil-based')}
              className="h-auto p-4 justify-start"
            >
              <div className="text-left">
                <div className="font-medium">Yağ Bazlı Vernik</div>
                <div className="text-sm text-gray-500">Dayanıklı, uzun ömürlü</div>
              </div>
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="emboss" className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Button
              variant={formData.embossType === 'raised' ? 'default' : 'outline'}
              onClick={() => updateFormData('embossType', 'raised')}
              className="h-auto p-4 justify-start"
            >
              <div className="text-left">
                <div className="font-medium">Kabartma (Emboss)</div>
                <div className="text-sm text-gray-500">Yükseltilmiş baskı</div>
              </div>
            </Button>
            <Button
              variant={formData.embossType === 'deboss' ? 'default' : 'outline'}
              onClick={() => updateFormData('embossType', 'deboss')}
              className="h-auto p-4 justify-start"
            >
              <div className="text-left">
                <div className="font-medium">Gömme (Deboss)</div>
                <div className="text-sm text-gray-500">Çukur baskı</div>
              </div>
            </Button>
            <Button
              variant={formData.embossType === 'blind' ? 'default' : 'outline'}
              onClick={() => updateFormData('embossType', 'blind')}
              className="h-auto p-4 justify-start"
            >
              <div className="text-left">
                <div className="font-medium">Kör Kabartma</div>
                <div className="text-sm text-gray-500">Renksiz, sadece doku</div>
              </div>
            </Button>
            <Button
              variant={formData.embossType === 'combination' ? 'default' : 'outline'}
              onClick={() => updateFormData('embossType', 'combination')}
              className="h-auto p-4 justify-start"
            >
              <div className="text-left">
                <div className="font-medium">Kombinasyon</div>
                <div className="text-sm text-gray-500">Kabartma + yaldız</div>
              </div>
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );

  const renderSheetLabelForm = () => (
    <div className="space-y-8">
      {/* Temel Özellikler */}
      <div>
        <h3 className="text-lg font-semibold mb-4 text-gray-900">Temel Özellikler</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label className="text-xs text-gray-500">Genişlik (mm)</Label>
            <Input 
              placeholder="Örn: 45" 
              onChange={(e) => updateFormData('customWidth', e.target.value)}
              className="h-12"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-gray-500">Yükseklik (mm)</Label>
            <Input 
              placeholder="Örn: 65" 
              onChange={(e) => updateFormData('customHeight', e.target.value)}
              className="h-12"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Miktar (Adet) *</Label>
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

      {/* Malzeme Seçimi */}
      <div>
        <h3 className="text-lg font-semibold mb-4 text-gray-900">Malzeme Seçimi</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { value: 'sticker-transparent', label: 'Şeffaf Etiket', desc: 'Görünmez kenar, transparan' },
            { value: 'sticker-opaque', label: 'Opak Etiket', desc: 'Mat beyaz, kapatıcı' },
            { value: 'kraft', label: 'Kraft Etiket', desc: 'Doğal, çevre dostu' },
            { value: 'metalize', label: 'Metalize Etiket', desc: 'Metalik görünüm, premium' },
            { value: 'textured', label: 'Dokulu Etiket', desc: 'Özel doku, hissedilebilir' },
          ].map((paper) => (
            <Button
              key={paper.value}
              variant={formData.paperType === paper.value ? 'default' : 'outline'}
              onClick={() => updateFormData('paperType', paper.value)}
              className="h-auto p-4 justify-start"
            >
              <div className="text-left">
                <div className="font-medium">{paper.label}</div>
                <div className="text-sm text-gray-500">{paper.desc}</div>
              </div>
            </Button>
          ))}
        </div>
      </div>

      <Separator />

      {/* Yüzey İşlemleri */}
      {renderSurfaceProcessingOptions()}

      <Separator />

      {/* Kesim ve Son İşlemler */}
      <div>
        <h3 className="text-lg font-semibold mb-4 text-gray-900">Kesim ve Son İşlemler</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Kesim Türü</Label>
            <Select onValueChange={(value) => updateFormData('cutting', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Kesim türü seçin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="straight">Düz Kesim</SelectItem>
                <SelectItem value="die-cut">Özel Kesim (Kalıp)</SelectItem>
                <SelectItem value="round-corner">Köşe Yuvarlama</SelectItem>
                <SelectItem value="perforated">Perforeli</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Paketleme</Label>
            <Select onValueChange={(value) => updateFormData('packaging', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Paketleme seçin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bulk">Toplu Paket</SelectItem>
                <SelectItem value="individual">Tekli Paket</SelectItem>
                <SelectItem value="custom">Özel Paketleme</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      

      
    </div>
  );

  const renderRollLabelForm = () => (
    <div className="space-y-8">
      {/* Temel Özellikler */}
      <div>
        <h3 className="text-lg font-semibold mb-4 text-gray-900">Etiket Özellikleri</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Etiket Boyutu *</Label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-gray-500">Genişlik (mm)</Label>
                <Input 
                  placeholder="Örn: 50" 
                  onChange={(e) => updateFormData('rollWidth', e.target.value)}
                  className="h-12"
                />
              </div>
              <div>
                <Label className="text-xs text-gray-500">Yükseklik (mm)</Label>
                <Input 
                  placeholder="Örn: 30" 
                  onChange={(e) => updateFormData('rollHeight', e.target.value)}
                  className="h-12"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Toplam Miktar *</Label>
            <div className="h-[20px]"></div>
            <Input
              type="text"
              placeholder="Minimum 5.000 adet"
              onChange={(e) => {
                // Sadece sayı girişine izin ver
                const numericValue = e.target.value.replace(/[^0-9]/g, '');
                e.target.value = numericValue;
                
                const value = parseInt(numericValue) || 0;
                updateFormData('totalQuantity', numericValue);
                
                if (value > 0 && value < 5000) {
                  toast({
                    title: "Uyarı",
                    description: "Minimum sipariş miktarı 5.000 adettir.",
                    variant: "destructive",
                  });
                }
              }}
              className="h-12 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
            />
            {formData.totalQuantity && parseInt(formData.totalQuantity) < 5000 && parseInt(formData.totalQuantity) > 0 && (
              <p className="text-sm text-red-500">Minimum sipariş miktarı 5.000 adettir.</p>
            )}
          </div>
        </div>
      </div>

      <Separator />

      {/* Rulo Özellikleri */}
      <div>
        <h3 className="text-lg font-semibold mb-4 text-gray-900">Rulo Özellikleri</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Rulo Çapı *</Label>
            <Select onValueChange={(value) => updateFormData('coreDiameter', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Çap seçin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="25">25 mm (1")</SelectItem>
                <SelectItem value="40">40 mm (1.5")</SelectItem>
                <SelectItem value="76">76 mm (3")</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Sarım Yönü</Label>
            <Select onValueChange={(value) => updateFormData('windingDirection', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Yön seçin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="out">Dışarı Sarım</SelectItem>
                <SelectItem value="in">İçeri Sarım</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Perfore Aralığı</Label>
            <Select onValueChange={(value) => updateFormData('perforationGap', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Aralık seçin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Perfore Yok</SelectItem>
                <SelectItem value="2">2 mm Aralık</SelectItem>
                <SelectItem value="3">3 mm Aralık</SelectItem>
                <SelectItem value="custom">Özel Aralık</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <Separator />

      {/* Malzeme Seçimi */}
      <div>
        <h3 className="text-lg font-semibold mb-4 text-gray-900">Malzeme ve Yapıştırıcı</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <Label className="text-base font-medium">Malzeme Türü</Label>
            <div className="grid grid-cols-1 gap-3">
              {[
                { value: 'pp-white', label: 'Beyaz PP', desc: 'Dayanıklı, su geçirmez' },
                { value: 'pp-transparent', label: 'Şeffaf PP', desc: 'Görünmez, modern' },
                { value: 'pe-white', label: 'Beyaz PE', desc: 'Esnek, yumuşak' },
                { value: 'paper-white', label: 'Beyaz Kağıt', desc: 'Ekonomik, çevre dostu' },
                { value: 'polyester', label: 'Polyester', desc: 'Ekstra dayanıklı' },
              ].map((material) => (
                <Button
                  key={material.value}
                  variant={formData.material === material.value ? 'default' : 'outline'}
                  onClick={() => updateFormData('material', material.value)}
                  className="h-auto p-3 justify-start"
                >
                  <div className="text-left">
                    <div className="font-medium">{material.label}</div>
                    <div className="text-sm text-gray-500">{material.desc}</div>
                  </div>
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <Label className="text-base font-medium">Yapıştırıcı Türü</Label>
            <div className="grid grid-cols-1 gap-3">
              {[
                { value: 'permanent', label: 'Kalıcı', desc: 'Çıkarılamaz, güçlü' },
                { value: 'removable', label: 'Çıkarılabilir', desc: 'Temiz çıkarma' },
                { value: 'ultra-removable', label: 'Ultra Çıkarılabilir', desc: 'İz bırakmaz' },
                { value: 'freezer', label: 'Dondurulmuş Ürün', desc: '-18°C dayanıklı' },
                { value: 'high-temp', label: 'Yüksek Sıcaklık', desc: '+150°C dayanıklı' },
              ].map((adhesive) => (
                <Button
                  key={adhesive.value}
                  variant={formData.adhesive === adhesive.value ? 'default' : 'outline'}
                  onClick={() => updateFormData('adhesive', adhesive.value)}
                  className="h-auto p-3 justify-start"
                >
                  <div className="text-left">
                    <div className="font-medium">{adhesive.label}</div>
                    <div className="text-sm text-gray-500">{adhesive.desc}</div>
                  </div>
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {formData.rollSize === 'custom' && (
        <div className="p-6 bg-orange-50 rounded-lg border border-orange-200">
          <h4 className="font-semibold mb-4">Özel Boyut Bilgileri</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Genişlik (mm)</Label>
              <Input 
                placeholder="Örn: 45" 
                onChange={(e) => updateFormData('customRollWidth', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Yükseklik (mm)</Label>
              <Input 
                placeholder="Örn: 65" 
                onChange={(e) => updateFormData('customRollHeight', e.target.value)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderGeneralPrintingForm = () => {
    const printTypes = {
      'business-card': {
        requiredFields: ['size', 'paper', 'quantity', 'color'],
        optionalFields: ['finish', 'cutting'],
        sizeOptions: ['85x55', '90x50', '85x54', 'custom'],
        paperOptions: ['coated-300', 'coated-350', 'bristol-300', 'textured'],
        finishOptions: ['mat-cellophane', 'gloss-cellophane', 'uv-spot', 'gold-foil', 'silver-foil'],
        colorOptions: ['4-0', '4-4', '1-0', '1-1', 'pantone'],
        cuttingOptions: ['straight', 'round-corner', 'die-cut'],
        quantityOptions: ['100', '250', '500', '1000', '2500', '5000']
      },
      'brochure': {
        requiredFields: ['size', 'paper', 'quantity', 'color', 'pages', 'folding'],
        optionalFields: ['finish', 'binding'],
        sizeOptions: ['a4', 'a5', 'a6', 'custom'],
        paperOptions: ['coated-115', 'coated-135', 'coated-150', 'coated-200'],
        finishOptions: ['mat-cellophane', 'gloss-cellophane', 'uv-total'],
        colorOptions: ['4-0', '4-4', '1-0'],
        foldingOptions: ['none', 'half', 'tri-fold', 'z-fold', 'gate-fold', 'roll-fold'],
        bindingOptions: ['saddle-stitch', 'perfect-binding'],
        quantityOptions: ['100', '250', '500', '1000', '2500', '5000'],
        pageOptions: ['4', '6', '8', '12', '16', '20', '24', '32']
      },
      'catalog': {
        requiredFields: ['size', 'paper', 'quantity', 'color', 'pages', 'binding'],
        optionalFields: ['finish', 'cover'],
        sizeOptions: ['a4', 'a5', '21x21', 'custom'],
        paperOptions: ['coated-115', 'coated-135', 'coated-150', 'coated-200'],
        finishOptions: ['mat-cellophane', 'gloss-cellophane', 'uv-total'],
        colorOptions: ['4-4', '4-0'],
        bindingOptions: ['saddle-stitch', 'perfect-binding', 'spiral', 'wire-o'],
        coverOptions: ['same-paper', 'coated-250', 'coated-300', 'bristol-300'],
        quantityOptions: ['50', '100', '250', '500', '1000', '2500'],
        pageOptions: ['16', '20', '24', '32', '48', '64', '80', '96', '128']
      },
      'magazine': {
        requiredFields: ['size', 'paper', 'quantity', 'color', 'pages', 'binding'],
        optionalFields: ['finish', 'cover'],
        sizeOptions: ['a4', '21x28', '19x27', 'custom'],
        paperOptions: ['coated-90', 'coated-115', 'coated-135', 'offset-80'],
        finishOptions: ['mat-cellophane', 'gloss-cellophane'],
        colorOptions: ['4-4', '4-0', '1-1'],
        bindingOptions: ['saddle-stitch', 'perfect-binding'],
        coverOptions: ['coated-200', 'coated-250', 'coated-300'],
        quantityOptions: ['100', '250', '500', '1000', '2500', '5000'],
        pageOptions: ['16', '20', '24', '32', '48', '64', '80', '96']
      },
      'flyer': {
        requiredFields: ['size', 'paper', 'quantity', 'color'],
        optionalFields: ['finish'],
        sizeOptions: ['a4', 'a5', 'a6', '21x21', '10x21', 'custom'],
        paperOptions: ['coated-115', 'coated-135', 'coated-150', 'coated-200'],
        finishOptions: ['none', 'mat-cellophane', 'gloss-cellophane', 'uv-total'],
        colorOptions: ['4-0', '4-4', '1-0'],
        quantityOptions: ['100', '250', '500', '1000', '2500', '5000', '10000']
      },
      'poster': {
        requiredFields: ['size', 'paper', 'quantity', 'color'],
        optionalFields: ['finish'],
        sizeOptions: ['a3', 'a2', 'a1', 'a0', '50x70', '70x100', '100x140', 'custom'],
        paperOptions: ['coated-135', 'coated-150', 'coated-200', 'poster-paper', 'blueback'],
        finishOptions: ['none', 'mat-cellophane', 'gloss-cellophane'],
        colorOptions: ['4-0', '4-4'],
        quantityOptions: ['1', '5', '10', '25', '50', '100', '250', '500']
      },
      'book': {
        requiredFields: ['size', 'paper', 'quantity', 'color', 'pages', 'binding', 'cover'],
        optionalFields: ['finish'],
        sizeOptions: ['a4', 'a5', '13.5x21', '16x24', '14x20', 'custom'],
        paperOptions: ['offset-70', 'offset-80', 'offset-90', 'book-paper'],
        finishOptions: ['none', 'mat-cellophane', 'gloss-cellophane'],
        colorOptions: ['1-1', '4-4', '4-0'],
        bindingOptions: ['perfect-binding', 'saddle-stitch', 'hardcover', 'spiral'],
        coverOptions: ['coated-250', 'coated-300', 'bristol-300', 'kraft'],
        quantityOptions: ['25', '50', '100', '250', '500', '1000'],
        pageOptions: ['32', '48', '64', '80', '96', '128', '160', '192', '224', '256']
      },
      'packaging': {
        requiredFields: ['type', 'size', 'material', 'quantity', 'color'],
        optionalFields: ['finish', 'handle'],
        sizeOptions: ['custom'],
        materialOptions: ['kraft-200', 'kraft-250', 'bristol-250', 'bristol-300', 'corrugated-3mm', 'corrugated-5mm'],
        finishOptions: ['none', 'mat-cellophane', 'gloss-cellophane', 'uv-spot'],
        colorOptions: ['4-0', '4-4', '1-0', '2-0'],
        typeOptions: ['bag', 'box', 'envelope', 'sleeve'],
        handleOptions: ['none', 'rope', 'ribbon', 'die-cut'],
        quantityOptions: ['50', '100', '250', '500', '1000', '2500']
      },
      'uv-dtf': {
        requiredFields: ['size', 'quantity', 'material'],
        optionalFields: ['cutting'],
        sizeOptions: ['custom'],
        materialOptions: ['transparent-pet', 'white-pet', 'clear-vinyl'],
        cuttingOptions: ['straight', 'die-cut', 'kiss-cut'],
        quantityOptions: ['50', '100', '250', '500', '1000', '2500'],
        features: ['UV dayanıklı', 'Su geçirmez', 'Çıkarılabilir', 'Şeffaf taşıyıcı film']
      }
    };

    const selectedType = formData.printType ? printTypes[formData.printType as keyof typeof printTypes] : null;

    return (
      <div className="space-y-8">
        {/* Baskı Türü Seçimi */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-gray-900">Baskı Türü Seçimi</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries({
              'business-card': { label: 'Kartvizit', desc: 'Profesyonel kartvizitler' },
              'brochure': { label: 'Broşür', desc: 'Tanıtım broşürleri' },
              'catalog': { label: 'Katalog', desc: 'Ürün katalogları' },
              'magazine': { label: 'Dergi', desc: 'Dergi ve gazete' },
              'flyer': { label: 'Flyer', desc: 'Reklam flyerleri' },
              'poster': { label: 'Poster', desc: 'Büyük boy posterler' },
              'book': { label: 'Kitap', desc: 'Kitap ve yayın' },
              'packaging': { label: 'Ambalaj', desc: 'Özel ambalajlar' },
              'uv-dtf': { label: 'UV DTF Etiket', desc: 'Soğuk transfer etiketler' }
            }).map(([value, config]) => (
              <Button
                key={value}
                variant={formData.printType === value ? 'default' : 'outline'}
                onClick={() => updateFormData('printType', value)}
                className="h-auto p-4 justify-start"
              >
                <div className="text-left">
                  <div className="font-medium">{config.label}</div>
                  <div className="text-sm text-gray-500">{config.desc}</div>
                </div>
              </Button>
            ))}
          </div>
        </div>

        {selectedType && (
          <>
            <Separator />

            {/* Temel Özellikler */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-900">Temel Özellikler</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Boyut */}
                {selectedType.requiredFields.includes('size') && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700 flex items-center">
                      Boyut <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <Select onValueChange={(value) => updateFormData('printSize', value)}>
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Boyut seçin" />
                      </SelectTrigger>
                      <SelectContent>
                        {selectedType.sizeOptions.map(size => {
                          const sizeLabels: Record<string, string> = {
                            '85x55': '85 x 55 mm (Standart Kartvizit)',
                            '90x50': '90 x 50 mm (Avrupa Kartvizit)',
                            '85x54': '85 x 54 mm (Kredi Kartı)',
                            'a6': 'A6 (105 x 148 mm)',
                            'a5': 'A5 (148 x 210 mm)',
                            'a4': 'A4 (210 x 297 mm)',
                            'a3': 'A3 (297 x 420 mm)',
                            'a2': 'A2 (420 x 594 mm)',
                            'a1': 'A1 (594 x 841 mm)',
                            'a0': 'A0 (841 x 1189 mm)',
                            '21x21': '21 x 21 cm (Kare)',
                            '21x28': '21 x 28 cm (Dergi)',
                            '19x27': '19 x 27 cm (Küçük Dergi)',
                            '13.5x21': '13.5 x 21 cm (Kitap)',
                            '16x24': '16 x 24 cm (Büyük Kitap)',
                            '14x20': '14 x 20 cm (Roman)',
                            '10x21': '10 x 21 cm (Flyer)',
                            '50x70': '50 x 70 cm (Poster)',
                            '70x100': '70 x 100 cm (Poster)',
                            '100x140': '100 x 140 cm (Büyük Poster)',
                            'custom': 'Özel Boyut'
                          };
                          return (
                            <SelectItem key={size} value={size}>
                              {sizeLabels[size] || size}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Miktar */}
                {selectedType.requiredFields.includes('quantity') && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700 flex items-center">
                      Miktar <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <Select onValueChange={(value) => updateFormData('printQuantity', value)}>
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Miktar seçin" />
                      </SelectTrigger>
                      <SelectContent>
                        {selectedType.quantityOptions?.map(qty => (
                          <SelectItem key={qty} value={qty}>
                            {qty} Adet
                          </SelectItem>
                        ))}
                        <SelectItem value="custom">Özel Miktar</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Renk */}
                {selectedType.requiredFields.includes('color') && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700 flex items-center">
                      Renk <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <Select onValueChange={(value) => updateFormData('printColor', value)}>
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Renk seçin" />
                      </SelectTrigger>
                      <SelectContent>
                        {selectedType.colorOptions?.map(color => {
                          const colorLabels: Record<string, string> = {
                            '4-0': '4+0 (Tek Yüz Renkli)',
                            '4-4': '4+4 (Çift Yüz Renkli)',
                            '1-0': '1+0 (Tek Yüz Siyah)',
                            '1-1': '1+1 (Çift Yüz Siyah)',
                            '2-0': '2+0 (İki Renk)',
                            'pantone': 'Pantone Renk'
                          };
                          return (
                            <SelectItem key={color} value={color}>
                              {colorLabels[color] || color}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Malzeme (UV DTF için) */}
                {selectedType.requiredFields.includes('material') && formData.printType === 'uv-dtf' && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700 flex items-center">
                      Malzeme <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <Select onValueChange={(value) => updateFormData('uvdtfMaterial', value)}>
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Malzeme seçin" />
                      </SelectTrigger>
                      <SelectContent>
                        {selectedType.materialOptions?.map(material => {
                          const materialLabels: Record<string, string> = {
                            'transparent-pet': 'Şeffaf PET Film',
                            'white-pet': 'Beyaz PET Film',
                            'clear-vinyl': 'Şeffaf Vinil'
                          };
                          return (
                            <SelectItem key={material} value={material}>
                              {materialLabels[material] || material}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Ambalaj Tipi (packaging için) */}
                {selectedType.requiredFields.includes('type') && formData.printType === 'packaging' && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700 flex items-center">
                      Ambalaj Tipi <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <Select onValueChange={(value) => updateFormData('packagingType', value)}>
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Tip seçin" />
                      </SelectTrigger>
                      <SelectContent>
                        {selectedType.typeOptions?.map(type => {
                          const typeLabels: Record<string, string> = {
                            'bag': 'Çanta/Torba',
                            'box': 'Kutu',
                            'envelope': 'Zarf',
                            'sleeve': 'Kılıf'
                          };
                          return (
                            <SelectItem key={type} value={type}>
                              {typeLabels[type] || type}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </div>

            {/* Sayfa ve Ciltleme (Gerekirse) */}
            {(selectedType.requiredFields.includes('pages') || selectedType.requiredFields.includes('binding')) && (
              <>
                <Separator />
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-gray-900">Sayfa ve Ciltleme</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {selectedType.requiredFields.includes('pages') && (
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700 flex items-center">
                          Sayfa Sayısı <span className="text-red-500 ml-1">*</span>
                        </Label>
                        <Select onValueChange={(value) => updateFormData('pageCount', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Sayfa sayısı seçin" />
                          </SelectTrigger>
                          <SelectContent>
                            {selectedType.pageOptions?.map(page => (
                              <SelectItem key={page} value={page}>
                                {page} Sayfa
                              </SelectItem>
                            ))}
                            <SelectItem value="custom">Özel Sayfa Sayısı</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {selectedType.requiredFields.includes('binding') && (
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700 flex items-center">
                          Ciltleme <span className="text-red-500 ml-1">*</span>
                        </Label>
                        <Select onValueChange={(value) => updateFormData('binding', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Ciltleme seçin" />
                          </SelectTrigger>
                          <SelectContent>
                            {selectedType.bindingOptions?.map(binding => {
                              const bindingLabels: Record<string, string> = {
                                'saddle-stitch': 'Tel Dikiş (16-64 sayfa)',
                                'perfect-binding': 'Termal Cilt (32+ sayfa)',
                                'spiral': 'Spiral Cilt',
                                'wire-o': 'Wire-O Cilt',
                                'hardcover': 'Sert Kapak Cilt'
                              };
                              return (
                                <SelectItem key={binding} value={binding}>
                                  {bindingLabels[binding] || binding}
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {selectedType.requiredFields.includes('folding') && (
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700 flex items-center">
                          Katlama <span className="text-red-500 ml-1">*</span>
                        </Label>
                        <Select onValueChange={(value) => updateFormData('folding', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Katlama seçin" />
                          </SelectTrigger>
                          <SelectContent>
                            {selectedType.foldingOptions?.map(folding => {
                              const foldingLabels: Record<string, string> = {
                                'none': 'Katlama Yok',
                                'half': 'Yarı Katlama (1 kat)',
                                'tri-fold': 'Üç Katlama (2 kat)',
                                'z-fold': 'Z Katlama (Zigzag)',
                                'gate-fold': 'Kapı Katlama',
                                'roll-fold': 'Rulo Katlama'
                              };
                              return (
                                <SelectItem key={folding} value={folding}>
                                  {foldingLabels[folding] || folding}
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {/* Kapak Seçimi */}
                    {selectedType.requiredFields.includes('cover') && (
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700 flex items-center">
                          Kapak <span className="text-red-500 ml-1">*</span>
                        </Label>
                        <Select onValueChange={(value) => updateFormData('cover', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Kapak seçin" />
                          </SelectTrigger>
                          <SelectContent>
                            {selectedType.coverOptions?.map(cover => {
                              const coverLabels: Record<string, string> = {
                                'same-paper': 'Aynı Kağıt',
                                'coated-200': 'Kuşe 200gr',
                                'coated-250': 'Kuşe 250gr',
                                'coated-300': 'Kuşe 300gr',
                                'bristol-300': 'Bristol 300gr',
                                'kraft': 'Kraft Kağıt'
                              };
                              return (
                                <SelectItem key={cover} value={cover}>
                                  {coverLabels[cover] || cover}
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* UV DTF Özel Özellikler */}
            {formData.printType === 'uv-dtf' && (
              <>
                <Separator />
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-gray-900">UV DTF Özellikleri</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">Kesim Türü</Label>
                        <Select onValueChange={(value) => updateFormData('uvdtfCutting', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Kesim türü seçin" />
                          </SelectTrigger>
                          <SelectContent>
                            {selectedType.cuttingOptions?.map(cutting => {
                              const cuttingLabels: Record<string, string> = {
                                'straight': 'Düz Kesim',
                                'die-cut': 'Şekilli Kesim (Kalıp)',
                                'kiss-cut': 'Kiss Cut (Yarı Kesim)'
                              };
                              return (
                                <SelectItem key={cutting} value={cutting}>
                                  {cuttingLabels[cutting] || cutting}
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">Özel Boyut</Label>
                        <div className="grid grid-cols-2 gap-4">
                          <Input 
                            placeholder="Genişlik (mm)" 
                            onChange={(e) => updateFormData('uvdtfWidth', e.target.value)}
                          />
                          <Input 
                            placeholder="Yükseklik (mm)" 
                            onChange={(e) => updateFormData('uvdtfHeight', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>

                    {/* UV DTF Avantajları */}
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-medium text-blue-900 mb-2">UV DTF Etiket Avantajları:</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-blue-800">
                        {selectedType.features?.map((feature, index) => (
                          <div key={index} className="flex items-center">
                            <CheckCircle className="h-4 w-4 text-blue-600 mr-2" />
                            {feature}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Ambalaj Özel Seçenekleri */}
            {formData.printType === 'packaging' && (
              <>
                <Separator />
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-gray-900">Ambalaj Özellikleri</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700 flex items-center">
                        Malzeme <span className="text-red-500 ml-1">*</span>
                      </Label>
                      <Select onValueChange={(value) => updateFormData('packagingMaterial', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Malzeme seçin" />
                        </SelectTrigger>
                        <SelectContent>
                          {selectedType.materialOptions?.map(material => {
                            const materialLabels: Record<string, string> = {
                              'kraft-200': 'Kraft 200gr',
                              'kraft-250': 'Kraft 250gr',
                              'bristol-250': 'Bristol 250gr',
                              'bristol-300': 'Bristol 300gr',
                              'corrugated-3mm': 'Oluklu Karton 3mm',
                              'corrugated-5mm': 'Oluklu Karton 5mm'
                            };
                            return (
                              <SelectItem key={material} value={material}>
                                {materialLabels[material] || material}
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </div>

                    {selectedType.optionalFields?.includes('handle') && (
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">Sap/Tutacak</Label>
                        <Select onValueChange={(value) => updateFormData('packagingHandle', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Sap türü seçin" />
                          </SelectTrigger>
                          <SelectContent>
                            {selectedType.handleOptions?.map(handle => {
                              const handleLabels: Record<string, string> = {
                                'none': 'Sap Yok',
                                'rope': 'İp Sap',
                                'ribbon': 'Kurdele Sap',
                                'die-cut': 'Kesme Sap'
                              };
                              return (
                                <SelectItem key={handle} value={handle}>
                                  {handleLabels[handle] || handle}
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">Özel Boyutlar</Label>
                      <div className="grid grid-cols-3 gap-2">
                        <Input 
                          placeholder="En (cm)" 
                          onChange={(e) => updateFormData('packagingWidth', e.target.value)}
                        />
                        <Input 
                          placeholder="Boy (cm)" 
                          onChange={(e) => updateFormData('packagingHeight', e.target.value)}
                        />
                        <Input 
                          placeholder="Derinlik (cm)" 
                          onChange={(e) => updateFormData('packagingDepth', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            <Separator />

            {/* Malzeme Seçimi */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-900">Malzeme Seçimi</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedType.paperOptions?.map((paper) => {
                  const paperLabels: Record<string, { label: string, desc: string }> = {
                    'coated-90': { label: 'Kuşe 90gr', desc: 'Dergi iç sayfası, ekonomik' },
                    'coated-115': { label: 'Kuşe 115gr', desc: 'Broşür, flyer için ideal' },
                    'coated-135': { label: 'Kuşe 135gr', desc: 'Yüksek kalite broşür' },
                    'coated-150': { label: 'Kuşe 150gr', desc: 'Premium broşür, katalog' },
                    'coated-200': { label: 'Kuşe 200gr', desc: 'Kapak, poster için' },
                    'coated-250': { label: 'Kuşe 250gr', desc: 'Kalın kapak malzemesi' },
                    'coated-300': { label: 'Kuşe 300gr', desc: 'Kartvizit, premium kalite' },
                    'coated-350': { label: 'Kuşe 350gr', desc: 'Ultra kalite kartvizit' },
                    'bristol-250': { label: 'Bristol 250gr', desc: 'Ambalaj için dayanıklı' },
                    'bristol-300': { label: 'Bristol 300gr', desc: 'Kartvizit, sert kapak' },
                    'offset-70': { label: 'Offset 70gr', desc: 'Kitap iç sayfası, hafif' },
                    'offset-80': { label: 'Offset 80gr', desc: 'Kitap iç sayfası, standart' },
                    'offset-90': { label: 'Offset 90gr', desc: 'Kitap iç sayfası, kaliteli' },
                    'textured': { label: 'Dokulu Kağıt', desc: 'Premium doku, özel hissiyat' },
                    'kraft-200': { label: 'Kraft 200gr', desc: 'Doğal, çevre dostu ambalaj' },
                    'kraft-250': { label: 'Kraft 250gr', desc: 'Kalın kraft ambalaj' },
                    'poster-paper': { label: 'Poster Kağıdı', desc: 'Büyük boy baskılar için' },
                    'blueback': { label: 'Blueback', desc: 'Dış mekan posteri' },
                    'book-paper': { label: 'Kitap Kağıdı', desc: 'Okuma dostu, göz yormaz' },
                    'corrugated-3mm': { label: 'Oluklu 3mm', desc: 'Hafif ambalaj kutusu' },
                    'corrugated-5mm': { label: 'Oluklu 5mm', desc: 'Dayanıklı ambalaj kutusu' }
                  };

                  const paperInfo = paperLabels[paper] || { label: paper, desc: '' };

                  return (
                    <Button
                      key={paper}
                      variant={formData.printPaper === paper ? 'default' : 'outline'}
                      onClick={() => updateFormData('printPaper', paper)}
                      className="h-auto p-4 justify-start"
                    >
                      <div className="text-left">
                        <div className="font-medium">{paperInfo.label}</div>
                        <div className="text-sm text-gray-500">{paperInfo.desc}</div>
                      </div>
                    </Button>
                  );
                })}
              </div>
            </div>

            <Separator />

            {/* Yüzey İşlemleri - Sadece geleneksel baskı kategorileri için */}
            {selectedType.optionalFields?.includes('finish') && formData.printType !== 'uv-dtf' && (
              <div>
                <h3 className="text-lg font-semibold mb-4 text-gray-900">Yüzey İşlemleri</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedType.finishOptions?.map((finish) => {
                    const finishLabels: Record<string, { label: string, desc: string }> = {
                      'none': { label: 'Yüzey İşlem Yok', desc: 'Standart baskı' },
                      'mat-cellophane': { label: 'Mat Selefon', desc: 'Pürüzsüz, yansımasız' },
                      'gloss-cellophane': { label: 'Parlak Selefon', desc: 'Parlak, canlı renkler' },
                      'uv-total': { label: 'Tam UV Vernik', desc: 'Tüm yüzey parlak' },
                      'uv-spot': { label: 'Nokta UV Vernik', desc: 'Seçili alanlar parlak' },
                      'gold-foil': { label: 'Altın Yaldız', desc: 'Prestijli altın görünüm' },
                      'silver-foil': { label: 'Gümüş Yaldız', desc: 'Modern gümüş görünüm' }
                    };

                    const finishInfo = finishLabels[finish] || { label: finish, desc: '' };

                    return (
                      <Button
                        key={finish}
                        variant={formData.printFinish === finish ? 'default' : 'outline'}
                        onClick={() => updateFormData('printFinish', finish)}
                        className="h-auto p-4 justify-start"
                      >
                        <div className="text-left">
                          <div className="font-medium">{finishInfo.label}</div>
                          <div className="text-sm text-gray-500">{finishInfo.desc}</div>
                        </div>
                      </Button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Kesim Seçenekleri - Kartvizit için */}
            {selectedType.optionalFields?.includes('cutting') && formData.printType === 'business-card' && (
              <>
                <Separator />
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-gray-900">Kesim Seçenekleri</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {selectedType.cuttingOptions?.map((cutting) => {
                      const cuttingLabels: Record<string, { label: string, desc: string }> = {
                        'straight': { label: 'Düz Kesim', desc: 'Standart köşeli kesim' },
                        'round-corner': { label: 'Köşe Yuvarlama', desc: 'Yuvarlatılmış köşeler' },
                        'die-cut': { label: 'Özel Kesim', desc: 'Kalıp ile özel şekil' }
                      };

                      const cuttingInfo = cuttingLabels[cutting] || { label: cutting, desc: '' };

                      return (
                        <Button
                          key={cutting}
                          variant={formData.printCutting === cutting ? 'default' : 'outline'}
                          onClick={() => updateFormData('printCutting', cutting)}
                          className="h-auto p-4 justify-start"
                        >
                          <div className="text-left">
                            <div className="font-medium">{cuttingInfo.label}</div>
                            <div className="text-sm text-gray-500">{cuttingInfo.desc}</div>
                          </div>
                        </Button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <Navigation />

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <Link href="/dashboard">
            <Button variant="outline" size="sm" className="mb-6 shadow-md hover:shadow-lg transition-all duration-300">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Müşteri Dashboard
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
                        placeholder="Örn: Ürün Etiketleri"
                        {...form.register("title")}
                        className="border-gray-300 focus:border-blue-500"
                      />
                      {form.formState.errors.title && (
                        <p className="text-sm text-red-500">{form.formState.errors.title.message}</p>
                      )}
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
                  {type === 'sheet_label' && renderSheetLabelForm()}
                  {type === 'roll_label' && renderRollLabelForm()}
                  {type === 'general_printing' && renderGeneralPrintingForm()}

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
                    <p className="text-gray-600 mb-4">
                      Tasarım dosyalarınızı, referans görselleri veya özel talimatlarınızı yükleyin.
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
                      <div className="flex justify-between">
                        <span className="text-gray-600">Özellikler:</span>
                        <span className="font-medium">{Object.keys(formData).length} adet</span>
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