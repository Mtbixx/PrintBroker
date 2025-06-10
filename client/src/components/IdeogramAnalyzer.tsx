
import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { AlertCircle, ExternalLink, Copy, Download, Sparkles } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';
import { useToast } from './ui/use-toast';

interface IdeogramData {
  imageUrl: string;
  prompt: string;
  title?: string;
  aspectRatio?: string;
  qualityScore: 'high' | 'low';
  canUseAsReference: boolean;
  suggestedPrompt: string;
  extractedAt: string;
}

interface IdeogramAnalyzerProps {
  onUseAsReference?: (data: IdeogramData, customPrompt?: string) => void;
  className?: string;
}

export default function IdeogramAnalyzer({ onUseAsReference, className = '' }: IdeogramAnalyzerProps) {
  const [url, setUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [analyzedData, setAnalyzedData] = useState<IdeogramData | null>(null);
  const [customPrompt, setCustomPrompt] = useState('');
  const [error, setError] = useState('');
  const { toast } = useToast();

  const analyzeIdeogramLink = async () => {
    if (!url.trim()) {
      setError('Lütfen geçerli bir Ideogram linki girin');
      return;
    }

    if (!url.includes('ideogram.ai/g/')) {
      setError('Geçersiz link formatı. Ideogram.ai/g/ formatında bir link gerekli');
      return;
    }

    setIsAnalyzing(true);
    setError('');
    setAnalyzedData(null);

    try {
      const response = await fetch('/api/design/analyze-ideogram', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ url: url.trim() })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Analiz işlemi başarısız');
      }

      setAnalyzedData(result.data);
      setCustomPrompt(result.data.suggestedPrompt);
      
      toast({
        title: "Analiz Tamamlandı",
        description: "Ideogram tasarımı başarıyla analiz edildi",
      });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Analiz sırasında bir hata oluştu';
      setError(errorMessage);
      toast({
        title: "Analiz Hatası",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const createDesignFromReference = async () => {
    if (!analyzedData) return;

    setIsCreating(true);

    try {
      const response = await fetch('/api/design/create-from-ideogram', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          url,
          customPrompt: customPrompt.trim(),
          options: {
            aspectRatio: analyzedData.aspectRatio,
            styleType: 'DESIGN',
            model: 'V_2'
          }
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Tasarım oluşturma başarısız');
      }

      if (onUseAsReference) {
        onUseAsReference(analyzedData, customPrompt.trim());
      }

      toast({
        title: "Tasarım Oluşturuldu",
        description: "Ideogram referansından yeni tasarım başarıyla oluşturuldu",
      });

      // Reset form
      setUrl('');
      setAnalyzedData(null);
      setCustomPrompt('');

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Tasarım oluşturma sırasında bir hata oluştu';
      toast({
        title: "Tasarım Hatası",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const copyPrompt = () => {
    navigator.clipboard.writeText(customPrompt);
    toast({
      title: "Kopyalandı",
      description: "Prompt panoya kopyalandı",
    });
  };

  const openOriginalLink = () => {
    window.open(url, '_blank');
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            Ideogram Tasarım Analizi
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Ideogram.ai linki yapıştırın (örn: https://ideogram.ai/g/...)"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="flex-1"
            />
            <Button 
              onClick={analyzeIdeogramLink}
              disabled={isAnalyzing || !url.trim()}
              className="shrink-0"
            >
              {isAnalyzing ? 'Analiz Ediliyor...' : 'Analiz Et'}
            </Button>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {analyzedData && (
            <div className="space-y-4">
              <Separator />
              
              <div className="grid md:grid-cols-2 gap-4">
                {/* Görsel Önizleme */}
                <div className="space-y-2">
                  <h4 className="font-medium">Orijinal Tasarım</h4>
                  {analyzedData.imageUrl ? (
                    <div className="relative">
                      <img 
                        src={analyzedData.imageUrl} 
                        alt="Ideogram tasarım"
                        className="w-full rounded-lg border max-h-64 object-contain bg-gray-50"
                      />
                      <div className="absolute top-2 right-2 flex gap-1">
                        <Badge variant={analyzedData.qualityScore === 'high' ? 'default' : 'secondary'}>
                          {analyzedData.qualityScore === 'high' ? 'Yüksek Kalite' : 'Düşük Kalite'}
                        </Badge>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-32 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-500">
                      Görsel bulunamadı
                    </div>
                  )}
                  
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={openOriginalLink}>
                      <ExternalLink className="h-3 w-3 mr-1" />
                      Orijinali Aç
                    </Button>
                  </div>
                </div>

                {/* Prompt Bilgileri */}
                <div className="space-y-3">
                  <h4 className="font-medium">Çıkarılan Prompt</h4>
                  <div className="space-y-2">
                    <div className="text-sm text-gray-600 p-3 bg-gray-50 rounded border">
                      {analyzedData.prompt}
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Özelleştirilmiş Prompt:</label>
                      <textarea
                        value={customPrompt}
                        onChange={(e) => setCustomPrompt(e.target.value)}
                        className="w-full p-2 border rounded-md text-sm min-h-[100px] resize-none"
                        placeholder="Prompt'u düzenleyebilir veya olduğu gibi kullanabilirsiniz..."
                      />
                      <Button variant="outline" size="sm" onClick={copyPrompt}>
                        <Copy className="h-3 w-3 mr-1" />
                        Kopyala
                      </Button>
                    </div>
                  </div>

                  {/* Ek Bilgiler */}
                  <div className="space-y-2 text-sm">
                    {analyzedData.title && (
                      <div>
                        <span className="font-medium">Başlık:</span> {analyzedData.title}
                      </div>
                    )}
                    {analyzedData.aspectRatio && (
                      <div>
                        <span className="font-medium">En Boy Oranı:</span> {analyzedData.aspectRatio}
                      </div>
                    )}
                    <div>
                      <span className="font-medium">Referans Uygunluğu:</span>
                      <Badge variant={analyzedData.canUseAsReference ? 'default' : 'secondary'} className="ml-1">
                        {analyzedData.canUseAsReference ? 'Uygun' : 'Kısıtlı'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="flex gap-2 justify-end">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setAnalyzedData(null);
                    setUrl('');
                    setCustomPrompt('');
                  }}
                >
                  Temizle
                </Button>
                <Button 
                  onClick={createDesignFromReference}
                  disabled={isCreating || !analyzedData.canUseAsReference}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  {isCreating ? 'Oluşturuluyor...' : 'Bu Referanstan Tasarım Oluştur'}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
