import { useState, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Wand2, 
  Download, 
  Copy, 
  Eye, 
  Sparkles,
  Image as ImageIcon,
  Palette,
  Zap,
  Clock,
  Star,
  Grid3X3,
  Settings,
  History,
  Layout,
  Loader2,
  Printer,
  Disc,
  Link
} from "lucide-react";
import { cn } from "@/lib/utils";
import IdeogramAnalyzer from './IdeogramAnalyzer';



interface GeneratedImage {
  url: string;
  is_image_safe: boolean;
  prompt: string;
  resolution: string;
  seed: number;
}

interface DesignOptions {
  aspectRatio?: 'ASPECT_1_1' | 'ASPECT_10_16' | 'ASPECT_16_10' | 'ASPECT_9_16' | 'ASPECT_16_9' | 'ASPECT_3_2' | 'ASPECT_2_3' | 'ASPECT_4_3' | 'ASPECT_3_4';
  model?: 'V_3' | 'V_3_TURBO';
  styleType?: 'AUTO' | 'GENERAL' | 'REALISTIC' | 'DESIGN' | 'RENDER_3D' | 'ANIME';
  magicPrompt?: 'AUTO' | 'ON' | 'OFF';
  negativePrompt?: string;
  seed?: number;
  resolution?: 'RESOLUTION_512_1536' | 'RESOLUTION_576_1408' | 'RESOLUTION_640_1024' | 'RESOLUTION_768_1024' | 'RESOLUTION_1024_1024' | 'RESOLUTION_1152_896' | 'RESOLUTION_1216_832' | 'RESOLUTION_1344_768' | 'RESOLUTION_1536_640' | 'default';
  colorPalette?: { members: { color: string; weight: number }[] };
}

export default function DesignEngine() {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [prompt, setPrompt] = useState("");
  const [designOptions, setDesignOptions] = useState<DesignOptions>({
    aspectRatio: "ASPECT_1_1",
    model: "V_3_TURBO",
    styleType: "DESIGN",
    magicPrompt: "ON",
    resolution: "default",
    negativePrompt: "",
    colorPalette: { members: [] }
  });

  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [batchMode, setBatchMode] = useState(false);
  const [batchPrompts, setBatchPrompts] = useState<string[]>(['']);

  // Fetch design history
  const { data: history } = useQuery({
    queryKey: ['/api/design/history'],
    queryFn: () => apiRequest('GET', '/api/design/history?page=1&limit=10'),
  });

  // Generate single design mutation
  const generateMutation = useMutation({
    mutationFn: async (data: { prompt: string; options: DesignOptions }) => {
      console.log('🎨 Starting design generation with data:', data);

      try {
        // Refresh user balance before generation to ensure we have latest data
        await queryClient.refetchQueries({ queryKey: ['/api/auth/user'] });

        return await apiRequest('POST', '/api/design/generate', data);
      } catch (error) {
        console.error('Generate mutation error:', error);
        throw error;
      }
    },
    onSuccess: async (response) => {
      if (response.data && response.data.length > 0) {
        const newImages = response.data.map((item: any) => ({
          id: response.designId || Date.now() + Math.random(),
          url: item.url,
          prompt: prompt,
          seed: item.seed,
          creditDeducted: response.creditDeducted,
          remainingBalance: response.remainingBalance,
          autoSaved: response.autoSaved
        }));
        setGeneratedImages(prev => [...newImages, ...prev]);

        // Show success message with auto-save info
        toast({
          title: "Tasarım Oluşturuldu ✅",
          description: response.autoSaved 
            ? `Tasarım otomatik kaydedildi. ${response.creditDeducted}₺ kredi kullanıldı. Kalan bakiye: ${response.remainingBalance}₺`
            : `${response.creditDeducted}₺ kredi kullanıldı. Kalan bakiye: ${response.remainingBalance}₺`,
        });

        // Immediately refresh user balance and design history for real-time updates
        await queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
        await queryClient.invalidateQueries({ queryKey: ['/api/designs/history'] });

        // Force re-fetch user data to update balance display
        await queryClient.refetchQueries({ queryKey: ['/api/auth/user'] });
      }
    },
    onError: async (error: any) => {
      console.error('Design generation error:', error);
      const errorMessage = error.message || 'Tasarım oluşturulurken bir hata oluştu.';

      if (errorMessage.includes('Insufficient credit')) {
        // Refresh user balance to show current amount
        await queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });

        toast({
          title: "Yetersiz Kredi 💳",
          description: "Tasarım oluşturmak için yeterli krediniz yok. Lütfen kredi yükleyin (35₺ gerekli).",
          variant: "destructive",
        });
      } else if (errorMessage.includes('API key') || errorMessage.includes('401') || errorMessage.includes('403')) {
        toast({
          title: "API Hatası",
          description: "Tasarım servisi yapılandırıldı ve çalışıyor. Tekrar deneyin.",
          variant: "destructive",
        });
      } else if (errorMessage.includes('Rate limit') || errorMessage.includes('429')) {
        toast({
          title: "Çok Fazla İstek",
          description: "Lütfen birkaç saniye bekleyip tekrar deneyin.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Hata",
          description: errorMessage,
          variant: "destructive",
        });
      }
    }
  });

  // Generate batch designs
  const generateBatchMutation = useMutation({
    mutationFn: async (requests: Array<{ prompt: string; options: DesignOptions }>) => {
      const response = await apiRequest('POST', '/api/design/generate-batch', {
        requests
      });
      return response;
    },
    onSuccess: (results) => {
      const allImages = results.flatMap((result: any) => result.data);
      setGeneratedImages(allImages);
      toast({
        title: "Başarılı",
        description: `${results.length} tasarım başarıyla oluşturuldu!`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/design/history'] });
    },
    onError: (error) => {
      toast({
        title: "Hata",
        description: "Toplu tasarım oluşturulurken bir hata oluştu.",
        variant: "destructive",
      });
    },
  });

  const handleGenerate = () => {
    if (!prompt.trim()) {
      toast({
        title: "Hata",
        description: "Lütfen bir tasarım açıklaması girin.",
        variant: "destructive",
      });
      return;
    }

    if (batchMode) {
      const validPrompts = batchPrompts.filter(p => p.trim());
      if (validPrompts.length === 0) {
        toast({
          title: "Hata",
          description: "En az bir geçerli açıklama girin.",
          variant: "destructive",
        });
        return;
      }

      const requests = validPrompts.map(prompt => ({ prompt, options: designOptions }));
      generateBatchMutation.mutate(requests);
    } else {
      const requestOptions: DesignOptions = {
        aspectRatio: designOptions.aspectRatio,
        model: designOptions.model,
        styleType: designOptions.styleType,
        magicPrompt: designOptions.magicPrompt,
        negativePrompt: designOptions.negativePrompt,
        resolution: designOptions.resolution === 'default' ? undefined : designOptions.resolution,
        ...(selectedColors.length > 0 && {
          colorPalette: {
            members: selectedColors.map(color => ({ color, weight: 1 }))
          }
        })
      };
      generateMutation.mutate({ prompt, options: requestOptions });
    }
  };



  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Kopyalandı",
      description: "Metin panoya kopyalandı.",
    });
  };

  const downloadImage = async (url: string, filename: string) => {
    if (!url) {
      toast({
        title: "Hata",
        description: "Geçersiz görsel URL'si.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Simple and reliable download method
      const link = document.createElement('a');
      link.href = url;
      link.download = filename || `tasarim-${Date.now()}.png`;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';

      // Add to DOM, click, and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "İndirme Başlatıldı",
        description: "Tasarım indiriliyor. İndirme klasörünüzü kontrol edin.",
      });
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "İndirme Hatası",
        description: "Tasarım indirilemedi. Tarayıcınızın popup engelleyicisi aktif olabilir.",
        variant: "destructive",
      });
    }
  };

  const addBatchPrompt = () => {
    setBatchPrompts([...batchPrompts, '']);
  };

  const updateBatchPrompt = (index: number, value: string) => {
    const newPrompts = [...batchPrompts];
    newPrompts[index] = value;
    setBatchPrompts(newPrompts);
  };

  const removeBatchPrompt = (index: number) => {
    if (batchPrompts.length > 1) {
      setBatchPrompts(batchPrompts.filter((_, i) => i !== index));
    }
  };
  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
            <Wand2 className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Tasarım Motoru
          </h1>
        </div>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Yapay zeka destekli profesyonel tasarım oluşturma platformu. Logo, etiket, kartvizit ve daha fazlası için.
        </p>
      </div>

      <Tabs defaultValue="create" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="create" className="flex items-center gap-2">
            <Wand2 className="h-4 w-4" />
            Tasarım Oluştur
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            Geçmiş
          </TabsTrigger>
        </TabsList>

        {/* Create Design Tab */}
        <TabsContent value="create" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Design Input */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="h-5 w-5" />
                    Tasarım Açıklaması
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Mode Toggle */}
                  <div className="flex items-center gap-4">
                    <Label>Mod:</Label>
                    <div className="flex gap-2">
                      <Button
                        variant={!batchMode ? "default" : "outline"}
                        size="sm"
                        onClick={() => setBatchMode(false)}
                      >
                        Tekli Tasarım
                      </Button>
                      <Button
                        variant={batchMode ? "default" : "outline"}
                        size="sm"
                        onClick={() => setBatchMode(true)}
                      >
                        Toplu Tasarım
                      </Button>
                    </div>
                  </div>

                  {!batchMode ? (
                    <div>
                      <Label htmlFor="prompt">Tasarım Açıklaması</Label>
                      <Textarea
                        id="prompt"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Örn: Modern ve minimal logo tasarımı, teknoloji şirketi için mavi ve gri renklerde..."
                        rows={4}
                        className="mt-2"
                      />
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <Label>Tasarım Açıklamaları (Toplu)</Label>
                      {batchPrompts.map((prompt, index) => (
                        <div key={index} className="flex gap-2">
                          <Textarea
                            value={prompt}
                            onChange={(e) => updateBatchPrompt(index, e.target.value)}
                            placeholder={`Tasarım ${index + 1} açıklaması...`}
                            rows={2}
                            className="flex-1"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeBatchPrompt(index)}
                            disabled={batchPrompts.length === 1}
                          >
                            ✕
                          </Button>
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={addBatchPrompt}
                        disabled={batchPrompts.length >= 5}
                      >
                        + Yeni Açıklama Ekle
                      </Button>
                    </div>
                  )}


                </CardContent>
              </Card>

              {/* Generated Images */}
              {generatedImages.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ImageIcon className="h-5 w-5" />
                      Oluşturulan Tasarımlar
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {generatedImages.filter(image => image && image.url).map((image, index) => (
                        <div key={`${image.url}-${index}`} className="relative group">
                          <img
                            src={image.url}
                            alt={`Generated design ${index + 1}`}
                            className="w-full h-64 object-cover rounded-lg border"
                            onError={(e) => {
                              console.error('Image failed to load:', image.url);
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => downloadImage(image.url, `tasarim-${Date.now()}-${index + 1}.png`)}
                                title="Tasarımı İndir"
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button size="sm" variant="secondary">
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-4xl">
                                  <DialogHeader>
                                    <DialogTitle>Tasarım Önizleme</DialogTitle>
                                    <DialogDescription>
                                      Tasarımınızın detaylı görünümü ve bilgileri
                                    </DialogDescription>
                                  </DialogHeader>
                                  <img
                                    src={image.url}
                                    alt={`Design preview ${index + 1}`}
                                    className="w-full h-auto rounded-lg"
                                  />
                                  <div className="space-y-2">
                                    <p className="text-sm text-gray-600"><strong>Açıklama:</strong> {image.prompt}</p>
                                    <p className="text-sm text-gray-600"><strong>Çözünürlük:</strong> {image.resolution || 'Varsayılan'}</p>
                                    <p className="text-sm text-gray-600"><strong>Seed:</strong> {image.seed}</p>
                                  </div>
                                </DialogContent>
                              </Dialog>
                            </div>

                            {/* Print Quote Button */}
                            <div className="mt-3 w-full">
                              <Button
                                size="sm"
                                className="w-full bg-green-600 hover:bg-green-700 text-white"
                                onClick={() => {
                                  // Store design data in localStorage for the quote form
                                  const designData = {
                                    imageUrl: image.url,
                                    prompt: image.prompt,
                                    timestamp: Date.now()
                                  };
                                  localStorage.setItem('selectedDesign', JSON.stringify(designData));
                                  window.location.href = '/design-quote';
                                }}
                              >
                                <Printer className="h-4 w-4 mr-2" />
                                Hızlı Teklif Al
                              </Button>
                            </div>
                          </div>
                          <div className="absolute top-2 right-2">
                            <Badge variant={image.is_image_safe !== false ? "default" : "destructive"}>
                              {image.is_image_safe !== false ? "Güvenli" : "Dikkat"}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Settings Panel */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Tasarım Ayarları
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>En-Boy Oranı</Label>
                    <Select
                      value={designOptions.aspectRatio}
                      onValueChange={(value) => setDesignOptions({...designOptions, aspectRatio: value as DesignOptions['aspectRatio']})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ASPECT_1_1">Kare (1:1)</SelectItem>
                        <SelectItem value="ASPECT_16_9">Geniş (16:9)</SelectItem>
                        <SelectItem value="ASPECT_9_16">Dikey (9:16)</SelectItem>
                        <SelectItem value="ASPECT_16_10">Bilgisayar (16:10)</SelectItem>
                        <SelectItem value="ASPECT_10_16">Telefon (10:16)</SelectItem>
                        <SelectItem value="ASPECT_3_2">Fotoğraf (3:2)</SelectItem>
                        <SelectItem value="ASPECT_2_3">Dikey Fotoğraf (2:3)</SelectItem>
                        <SelectItem value="ASPECT_4_3">Klasik (4:3)</SelectItem>
                        <SelectItem value="ASPECT_3_4">Dikey Klasik (3:4)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Stil Türü</Label>
                    <Select
                      value={designOptions.styleType}
                      onValueChange={(value) => setDesignOptions({...designOptions, styleType: value as DesignOptions['styleType']})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="AUTO">Otomatik</SelectItem>
                        <SelectItem value="GENERAL">Genel</SelectItem>
                        <SelectItem value="REALISTIC">Gerçekçi</SelectItem>
                        <SelectItem value="DESIGN">Tasarım</SelectItem>
                        <SelectItem value="RENDER_3D">3D Render</SelectItem>
                        <SelectItem value="ANIME">Anime</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                <div>
                  <Label htmlFor="model">Model</Label>
                  <Select 
                    value={designOptions.model} 
                    onValueChange={(value) => setDesignOptions(prev => ({ ...prev, model: value as DesignOptions['model'] }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="V_3">V3 (En Gelişmiş Model)</SelectItem>
                      <SelectItem value="V_3_TURBO">V3 Turbo (En Hızlı)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Renk Paleti (Opsiyonel)</Label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7", "#DDA0DD", "#98D8C8", "#F7DC6F"].map((color) => (
                      <button
                        key={color}
                        type="button"
                        className={`w-8 h-8 rounded-full border-2 ${
                          selectedColors.includes(color) ? 'border-gray-800' : 'border-gray-300'
                        }`}
                        style={{ backgroundColor: color }}
                        onClick={() => {
                          if (selectedColors.includes(color)) {
                            setSelectedColors(selectedColors.filter(c => c !== color));
                          } else if (selectedColors.length < 5) {
                            setSelectedColors([...selectedColors, color]);
                          }
                        }}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">En fazla 5 renk seçebilirsiniz</p></div>

                  <div>
                    <Label>Negatif Açıklama (İstenmeyen)</Label>
                    <Input
                      value={designOptions.negativePrompt || ''}
                      onChange={(e) => setDesignOptions({...designOptions, negativePrompt: e.target.value})}
                      placeholder="Örn: bulanık, düşük kalite, metin"
                    />
                  </div>

                  <div>
                    <Label htmlFor="magic-prompt">Magic Prompt</Label>
              <Select value={designOptions.magicPrompt} onValueChange={(value) => setDesignOptions({...designOptions, magicPrompt: value as DesignOptions['magicPrompt']})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ON">Açık (Kısa prompt'ları geliştirir)</SelectItem>
                  <SelectItem value="AUTO">Otomatik</SelectItem>
                  <SelectItem value="OFF">Kapalı</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                Magic Prompt kısa açıklamaları daha detaylı ve etkili prompt'lara dönüştürür
              </p>
                  </div>

                  <Button
                    onClick={handleGenerate}
                    disabled={generateMutation.isPending || generateBatchMutation.isPending}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                    size="lg"
                  >
                    {(generateMutation.isPending || generateBatchMutation.isPending) ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        Oluşturuluyor...
                      </>
                    ) : (
                      <>
                        <Zap className="h-5 w-5 mr-2" />
                        Tasarım Oluştur
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>



        {/* History Tab */}
        <TabsContent value="history">
          {history && typeof history === 'object' && 'designs' in history && Array.isArray(history.designs) && history.designs.length > 0 ? (
            <div className="space-y-4">
              {history.designs.map((design: any, index: number) => (
                <Card key={design.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="flex-1">
                        <p className="font-medium">{design.prompt}</p>
                        <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                          <Clock className="h-4 w-4" />
                          {new Date(design.createdAt).toLocaleDateString('tr-TR')}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {design.result && Array.isArray(design.result) && design.result.map((image: any, imgIndex: number) => (
                          <img
                            key={imgIndex}
                            src={image.url}
                            alt={`History ${index}-${imgIndex}`}
                            className="w-16 h-16 object-cover rounded border"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-600 mb-2">
                  Henüz tasarım geçmişiniz yok
                </h3>
                <p className="text-gray-500">
                  İlk tasarımınızı oluşturun ve burada görün
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}