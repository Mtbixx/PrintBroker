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
  aspectRatio?: string;
  model?: string;
  styleType?: string;
  magicPrompt?: string;
  negativePrompt?: string;
  seed?: number;
}

export default function DesignEngine() {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [prompt, setPrompt] = useState("");
  const [designOptions, setDesignOptions] = useState<DesignOptions>({
    aspectRatio: 'ASPECT_1_1',
    model: 'V_2',
    styleType: 'AUTO',
    magicPrompt: 'AUTO'
  });
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
      return await apiRequest('POST', '/api/design/generate', data);
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
      generateMutation.mutate({ prompt, options: designOptions });
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
    try {
      // Doğrudan görseli fetch et
      const response = await fetch(url, {
        method: 'GET',
        mode: 'cors'
      });

      if (!response.ok) {
        // CORS sorunu varsa proxy kullan
        const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(url)}`;
        const proxyResponse = await fetch(proxyUrl);

        if (!proxyResponse.ok) {
          throw new Error('İndirme başarısız');
        }

        const blob = await proxyResponse.blob();
        const link = document.createElement('a');
        const objectUrl = URL.createObjectURL(blob);
        link.href = objectUrl;
        link.download = filename || `tasarim-${Date.now()}.png`;
        link.style.display = 'none';

        document.body.appendChild(link);
        link.click();

        // Cleanup
        setTimeout(() => {
          document.body.removeChild(link);
          URL.revokeObjectURL(objectUrl);
        }, 100);
      } else {
        // Direkt indirme
        const blob = await response.blob();
        const link = document.createElement('a');
        const objectUrl = URL.createObjectURL(blob);
        link.href = objectUrl;
        link.download = filename || `tasarim-${Date.now()}.png`;
        link.style.display = 'none';

        document.body.appendChild(link);
        link.click();

        // Cleanup
        setTimeout(() => {
          document.body.removeChild(link);
          URL.revokeObjectURL(objectUrl);
        }, 100);
      }

      toast({
        title: "Başarılı",
        description: "Tasarım başarıyla indirildi.",
      });
    } catch (error) {
      console.error('Download error:', error);

      // Fallback: yeni pencerede aç
      try {
        window.open(url, '_blank');
        toast({
          title: "Bilgi",
          description: "Tasarım yeni sekmede açıldı. Sağ tıklayıp 'Resmi Farklı Kaydet' seçebilirsiniz.",
        });
      } catch (fallbackError) {
        toast({
          title: "Hata",
          description: "Görsel indirilemedi. Lütfen tekrar deneyin.",
          variant: "destructive",
        });
      }
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
                      {generatedImages.map((image, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={image.url}
                            alt={`Generated design ${index + 1}`}
                            className="w-full h-64 object-cover rounded-lg border"
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
                                  </DialogHeader>
                                  <img
                                    src={image.url}
                                    alt={`Design preview ${index + 1}`}
                                    className="w-full h-auto rounded-lg"
                                  />
                                  <div className="space-y-2">
                                    <p className="text-sm text-gray-600"><strong>Açıklama:</strong> {image.prompt}</p>
                                    <p className="text-sm text-gray-600"><strong>Çözünürlük:</strong> {image.resolution}</p>
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
                            <Badge variant={image.is_image_safe ? "default" : "destructive"}>
                              {image.is_image_safe ? "Güvenli" : "Dikkat"}
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
                      onValueChange={(value) => setDesignOptions({...designOptions, aspectRatio: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ASPECT_1_1">Kare (1:1)</SelectItem>
                        <SelectItem value="ASPECT_16_9">Geniş (16:9)</SelectItem>
                        <SelectItem value="ASPECT_9_16">Dikey (9:16)</SelectItem>
                        <SelectItem value="ASPECT_3_2">Yatay (3:2)</SelectItem>
                        <SelectItem value="ASPECT_2_3">Dikey (2:3)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Model</Label>
                    <Select
                      value={designOptions.model}
                      onValueChange={(value) => setDesignOptions({...designOptions, model: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="V_2">V2 (En İyi Kalite)</SelectItem>
                        <SelectItem value="V_2_TURBO">V2 Turbo (Hızlı)</SelectItem>
                        <SelectItem value="V_1">V1 (Klasik)</SelectItem>
                        <SelectItem value="V_1_TURBO">V1 Turbo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Stil Türü</Label>
                    <Select
                      value={designOptions.styleType}
                      onValueChange={(value) => setDesignOptions({...designOptions, styleType: value})}
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
                    <Label>Negatif Açıklama (İstenmeyen)</Label>
                    <Input
                      value={designOptions.negativePrompt || ''}
                      onChange={(e) => setDesignOptions({...designOptions, negativePrompt: e.target.value})}
                      placeholder="Örn: bulanık, düşük kalite, metin"
                    />
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
                        {design.result?.map((image: any, imgIndex: number) => (
                          <img
                            key={imgIndex}
                            src={image.url}
                            alt={`History ${index}-${imgIndex}`}
                            className="w-16 h-16 object-cover rounded border"
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