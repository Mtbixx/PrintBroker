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
  const [formData, setFormData] = useState({
    // Basic form fields
    title: '',
    description: '',
    quantity: '',
    deadline: '',
    budget: '',

    // Sheet label fields
    labelSize: '',
    material: '',
    printColor: '',
    finish: '',
    lamination: '',
    cutting: '',

    // Roll label fields
    rollWidth: '',
    rollLength: '',
    labelSpacing: '',
    windingDirection: '',
    coreSize: '',

    // General printing fields
    printType: '',
    printSize: '',
    printPaper: '',
    printFinish: '',
    printBinding: '',
    printPages: '',
    printCover: '',

    // UV DTF specific fields
    adhesiveType: '',
    transferType: '',
    cuttingType: '',
    backing: ''
  });
  const [surfaceProcessingTab, setSurfaceProcessingTab] = useState("cellophane");
  const printingTypes = {
    'sheet_label': {
      requiredFields: ['size', 'material', 'quantity'],
      optionalFields: ['finish', 'lamination', 'cutting'],
      sizeOptions: ['custom'],
      paperOptions: ['transparent', 'opaque', 'kraft', 'metallic', 'textured']
    },
    'roll_label': {
      requiredFields: ['rollWidth', 'rollLength', 'quantity', 'material', 'adhesive'],
      optionalFields: ['windingDirection', 'coreSize', 'perforationGap'],
      sizeOptions: ['custom'],
      materialOptions: ['pp-white', 'pp-transparent', 'pe-white', 'paper-white', 'polyester'],
      adhesiveOptions: ['permanent', 'removable', 'ultra-removable', 'freezer', 'high-temp']
    },
    'general_printing': {
      requiredFields: ['type', 'size', 'material', 'quantity', 'color'],
      optionalFields: ['finish', 'handle'],
      sizeOptions: ['custom'],
      paperOptions: ['kraft', 'bristol-250', 'corrugated']
    },
    'uv_dtf_label': {
        requiredFields: ['size', 'material', 'quantity', 'adhesiveType', 'transferType'],
        optionalFields: ['cuttingType', 'backing'],
        sizeOptions: ['50x30', '60x40', '70x50', '100x70', '150x100', 'custom'],
        materialOptions: ['transparent_film', 'white_film', 'clear_film', 'holographic_film'],
        adhesiveOptions: ['permanent', 'removable', 'repositionable', 'high_tack'],
        transferOptions: ['cold_peel', 'hot_peel', 'warm_peel'],
        cuttingOptions: ['kiss_cut', 'through_cut', 'perforation_cut'],
        backingOptions: ['paper_backing', 'pet_backing', 'no_backing']
      }
  };

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
        case 'uv_dtf_label':
        return {
          title: 'UV DTF Etiket Teklifi',
          description: 'Yüksek kaliteli UV DTF etiket baskısı',
          icon: <Sparkles className="h-8 w-8 text-white" />,
          color: 'purple',
          bgGradient: 'from-purple-500 to-pink-600',
          adhesiveOptions: ['permanent', 'removable', 'repositionable', 'high_tack'],
          transferOptions: ['cold_peel', 'hot_peel', 'warm_peel'],
          cuttingOptions: ['kiss_cut', 'through_cut', 'perforation_cut'],
          backingOptions: ['paper_backing', 'pet_backing', 'no_backing']
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

  const getFieldOptions = (field: string) => {
    const typeConfig = printingTypes[type];
    switch (field) {
      case 'size':
        return typeConfig?.sizeOptions || [];
      case 'paper':
        return typeConfig?.paperOptions || [];
      case 'material':
        if (type === 'uv_dtf_label') {
          return typeConfig?.materialOptions || [];
        }
        return typeConfig?.paperOptions || [];
      case 'adhesive':
        return typeConfig?.adhesiveOptions || [];
      case 'transfer':
        return typeConfig?.transferOptions || [];
      case 'cutting':
        return typeConfig?.cuttingOptions || [];
      case 'backing':
        return typeConfig?.backingOptions || [];
      default:
        return [];
    }
  };

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
                <SelectItem value="out">Dışarı Sarım</SelectItem>```text
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

  const renderGeneralPrintingForm = () => (
    <div className="space-y-8">
      {/* Ürün Seçimi */}
      <div>
        <h3 className="text-lg font-semibold mb-4 text-gray-900">Ürün Seçimi</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { value: 'business-card', label: 'Kartvizit', desc: 'Profesyonel kartvizitler' },
            { value: 'brochure', label: 'Broşür', desc: 'Tanıtım broşürleri' },
            { value: 'catalog', label: 'Katalog', desc: 'Ürün katalogları' },
            { value: 'flyer', label: 'Flyer', desc: 'Reklam flyerleri' },
            { value: 'poster', label: 'Poster', desc: 'Büyük boy posterler' },
            { value: 'book', label: 'Kitap', desc: 'Kitap ve yayın' },
            { value: 'magazine', label: 'Dergi', desc: 'Dergi baskısı' },
            { value: 'packaging', label: 'Ambalaj', desc: 'Özel ambalajlar' },
            { value: 'sticker', label: 'Çıkartma', desc: 'Promosyon etiketleri' },
            { value: 'banner', label: 'Banner', desc: 'Geniş format baskılar' }
          ].map((product) => (
            <Button
              key={product.value}
              variant={formData.printType === product.value ? 'default' : 'outline'}
              onClick={() => updateFormData('printType', product.value)}
              className="h-auto p-4 justify-start"
            >
              <div className="text-left">
                <div className="font-medium">{product.label}</div>
                <div className="text-sm text-gray-500">{product.desc}</div>
              </div>
            </Button>
          ))}
        </div>
      </div>

      {/* Seçilen Ürün Özellikleri */}
      {formData.printType && (
        <>
          <Separator />
          
          {/* Kartvizit Özellikleri */}
          {formData.printType === 'business-card' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Kartvizit Özellikleri</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Boyut</Label>
                  <Select onValueChange={(value) => updateFormData('cardSize', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Boyut seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="85x55">85x55 mm (Standart)</SelectItem>
                      <SelectItem value="90x50">90x50 mm (Büyük)</SelectItem>
                      <SelectItem value="85x54">85x54 mm (Kredi Kartı)</SelectItem>
                      <SelectItem value="custom">Özel Boyut</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Kağıt Türü</Label>
                  <Select onValueChange={(value) => updateFormData('cardPaper', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Kağıt türü seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="coated-300">Kuşe 300gr</SelectItem>
                      <SelectItem value="coated-350">Kuşe 350gr</SelectItem>
                      <SelectItem value="bristol-300">Bristol 300gr</SelectItem>
                      <SelectItem value="textured">Dokulu Kağıt</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Miktar</Label>
                  <Select onValueChange={(value) => updateFormData('cardQuantity', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Miktar seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="100">100 Adet</SelectItem>
                      <SelectItem value="250">250 Adet</SelectItem>
                      <SelectItem value="500">500 Adet</SelectItem>
                      <SelectItem value="1000">1.000 Adet</SelectItem>
                      <SelectItem value="custom">Özel Miktar</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Baskı Rengi</Label>
                  <Select onValueChange={(value) => updateFormData('cardColor', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Renk seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="4-0">4+0 (Tek Yüz Renkli)</SelectItem>
                      <SelectItem value="4-4">4+4 (Çift Yüz Renkli)</SelectItem>
                      <SelectItem value="1-0">1+0 (Tek Yüz Siyah)</SelectItem>
                      <SelectItem value="1-1">1+1 (Çift Yüz Siyah)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Yüzey İşlemleri */}
              {renderSurfaceProcessingOptions()}
            </div>
          )}

          {/* Broşür Özellikleri */}
          {formData.printType === 'brochure' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Broşür Özellikleri</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Boyut</Label>
                  <Select onValueChange={(value) => updateFormData('brochureSize', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Boyut seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="a4">A4 (21x29.7 cm)</SelectItem>
                      <SelectItem value="a5">A5 (14.8x21 cm)</SelectItem>
                      <SelectItem value="a6">A6 (10.5x14.8 cm)</SelectItem>
                      <SelectItem value="custom">Özel Boyut</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Kağıt Türü</Label>
                  <Select onValueChange={(value) => updateFormData('brochurePaper', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Kağıt türü seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="coated-120">Kuşe 120gr</SelectItem>
                      <SelectItem value="coated-150">Kuşe 150gr</SelectItem>
                      <SelectItem value="coated-200">Kuşe 200gr</SelectItem>
                      <SelectItem value="offset-90">Offset 90gr</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Katlama</Label>
                  <Select onValueChange={(value) => updateFormData('brochureFolding', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Katlama seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Katlama Yok</SelectItem>
                      <SelectItem value="half">Yarı Katlama</SelectItem>
                      <SelectItem value="tri-fold">Üç Katlama</SelectItem>
                      <SelectItem value="z-fold">Z Katlama</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Miktar</Label>
                  <Select onValueChange={(value) => updateFormData('brochureQuantity', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Miktar seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="100">100 Adet</SelectItem>
                      <SelectItem value="250">250 Adet</SelectItem>
                      <SelectItem value="500">500 Adet</SelectItem>
                      <SelectItem value="1000">1.000 Adet</SelectItem>
                      <SelectItem value="custom">Özel Miktar</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {/* Katalog Özellikleri */}
          {formData.printType === 'catalog' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Katalog Özellikleri</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Boyut</Label>
                  <Select onValueChange={(value) => updateFormData('catalogSize', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Boyut seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="a4">A4 (21x29.7 cm)</SelectItem>
                      <SelectItem value="a5">A5 (14.8x21 cm)</SelectItem>
                      <SelectItem value="21x21">21x21 cm (Kare)</SelectItem>
                      <SelectItem value="custom">Özel Boyut</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Sayfa Sayısı</Label>
                  <Input 
                    placeholder="Örn: 32" 
                    onChange={(e) => updateFormData('catalogPages', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Ciltleme</Label>
                  <Select onValueChange={(value) => updateFormData('catalogBinding', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Ciltleme seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="saddle-stitch">Tel Dikiş</SelectItem>
                      <SelectItem value="perfect-binding">Termal Cilt</SelectItem>
                      <SelectItem value="spiral">Spiral Cilt</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Miktar</Label>
                  <Select onValueChange={(value) => updateFormData('catalogQuantity', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Miktar seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="50">50 Adet</SelectItem>
                      <SelectItem value="100">100 Adet</SelectItem>
                      <SelectItem value="250">250 Adet</SelectItem>
                      <SelectItem value="500">500 Adet</SelectItem>
                      <SelectItem value="custom">Özel Miktar</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {/* Flyer Özellikleri */}
          {formData.printType === 'flyer' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Flyer Özellikleri</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Boyut</Label>
                  <Select onValueChange={(value) => updateFormData('flyerSize', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Boyut seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="a4">A4 (21x29.7 cm)</SelectItem>
                      <SelectItem value="a5">A5 (14.8x21 cm)</SelectItem>
                      <SelectItem value="a6">A6 (10.5x14.8 cm)</SelectItem>
                      <SelectItem value="21x21">21x21 cm (Kare)</SelectItem>
                      <SelectItem value="custom">Özel Boyut</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Kağıt Türü</Label>
                  <Select onValueChange={(value) => updateFormData('flyerPaper', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Kağıt türü seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="coated-120">Kuşe 120gr</SelectItem>
                      <SelectItem value="coated-150">Kuşe 150gr</SelectItem>
                      <SelectItem value="coated-200">Kuşe 200gr</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Baskı Rengi</Label>
                  <Select onValueChange={(value) => updateFormData('flyerColor', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Renk seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="4-0">4+0 (Tek Yüz Renkli)</SelectItem>
                      <SelectItem value="4-4">4+4 (Çift Yüz Renkli)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Miktar</Label>
                  <Select onValueChange={(value) => updateFormData('flyerQuantity', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Miktar seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="100">100 Adet</SelectItem>
                      <SelectItem value="250">250 Adet</SelectItem>
                      <SelectItem value="500">500 Adet</SelectItem>
                      <SelectItem value="1000">1.000 Adet</SelectItem>
                      <SelectItem value="custom">Özel Miktar</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {/* Poster Özellikleri */}
          {formData.printType === 'poster' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Poster Özellikleri</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Boyut</Label>
                  <Select onValueChange={(value) => updateFormData('posterSize', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Boyut seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="a3">A3 (29.7x42 cm)</SelectItem>
                      <SelectItem value="a2">A2 (42x59.4 cm)</SelectItem>
                      <SelectItem value="a1">A1 (59.4x84.1 cm)</SelectItem>
                      <SelectItem value="50x70">50x70 cm</SelectItem>
                      <SelectItem value="70x100">70x100 cm</SelectItem>
                      <SelectItem value="custom">Özel Boyut</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Kağıt Türü</Label>
                  <Select onValueChange={(value) => updateFormData('posterPaper', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Kağıt türü seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="coated-150">Kuşe 150gr</SelectItem>
                      <SelectItem value="coated-200">Kuşe 200gr</SelectItem>
                      <SelectItem value="poster-paper">Poster Kağıdı</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Baskı Rengi</Label>
                  <Select onValueChange={(value) => updateFormData('posterColor', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Renk seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="4-0">4+0 (Tek Yüz Renkli)</SelectItem>
                      <SelectItem value="4-4">4+4 (Çift Yüz Renkli)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Miktar</Label>
                  <Select onValueChange={(value) => updateFormData('posterQuantity', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Miktar seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10 Adet</SelectItem>
                      <SelectItem value="25">25 Adet</SelectItem>
                      <SelectItem value="50">50 Adet</SelectItem>
                      <SelectItem value="100">100 Adet</SelectItem>
                      <SelectItem value="custom">Özel Miktar</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {/* Diğer ürün tipleri için de benzer özellik formları eklenebilir */}
          {formData.printType && !['business-card', 'brochure', 'catalog', 'flyer', 'poster'].includes(formData.printType) && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">{formData.printType === 'book' ? 'Kitap' : formData.printType === 'magazine' ? 'Dergi' : formData.printType === 'packaging' ? 'Ambalaj' : formData.printType === 'sticker' ? 'Çıkartma' : 'Banner'} Özellikleri</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Boyut</Label>
                  <Input 
                    placeholder="Örn: A4, 21x29.7 cm" 
                    onChange={(e) => updateFormData('customSize', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Miktar</Label>
                  <Input 
                    placeholder="Örn: 100" 
                    onChange={(e) => updateFormData('customQuantity', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Kağıt/Malzeme</Label>
                  <Input 
                    placeholder="Örn: Kuşe 150gr" 
                    onChange={(e) => updateFormData('customMaterial', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Özel İstekler</Label>
                  <Textarea 
                    placeholder="Özel isteklerinizi yazın..." 
                    onChange={(e) => updateFormData('customRequests', e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );

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
          <Card className="mb-8 bg-gradient-to-r from-blue-600 to-indigo-700 border-0 shadow-2xl">
            <CardContent className="p-8">
              <div className="flex items-start justify-between text-white">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                    {typeConfig.icon}
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold mb-2">
                      Baskı Teklif Formu
                    </h1>
                    <p className="text-blue-100 text-lg">
                      Kartvizit, broşür, katalog, UV DTF etiket ve daha fazlası için profesyonel baskı hizmeti
                    </p>
                  </div>
                </div>

                <div className="hidden lg:flex space-x-8">
                  <div className="text-center">
                    <div className="text-2xl font-bold">
                      Hızlı Teklif
                    </div>
                    <div className="text-blue-200">5 Dakika</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">
                      Matbaa Sayısı
                    </div>
                    <div className="text-blue-200">50+</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">
                      Ortalama Tasarruf
                    </div>
                    <div className="text-blue-200">%25</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

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
    </div>
  );
}