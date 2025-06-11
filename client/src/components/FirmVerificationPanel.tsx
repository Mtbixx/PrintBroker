
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Upload, CheckCircle, AlertCircle, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function FirmVerificationPanel() {
  const { toast } = useToast();
  const [verificationStatus, setVerificationStatus] = useState("pending");
  const [documents, setDocuments] = useState<File[]>([]);
  const [companyInfo, setCompanyInfo] = useState({
    companyName: "",
    taxNumber: "",
    address: "",
    phone: "",
    email: "",
    website: "",
    description: ""
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setDocuments(Array.from(e.target.files));
    }
  };

  const handleSubmit = () => {
    if (documents.length === 0) {
      toast({
        title: "Belge Gerekli",
        description: "Lütfen doğrulama için gerekli belgeleri yükleyin",
        variant: "destructive",
      });
      return;
    }

    // Simulate document submission
    setVerificationStatus("reviewing");
    toast({
      title: "Belgeler Gönderildi",
      description: "Doğrulama belgeleri admin onayına gönderildi",
    });
  };

  const getStatusBadge = () => {
    switch (verificationStatus) {
      case "approved":
        return <Badge className="bg-green-500"><CheckCircle className="w-4 h-4 mr-1" />Onaylandı</Badge>;
      case "rejected":
        return <Badge variant="destructive"><AlertCircle className="w-4 h-4 mr-1" />Reddedildi</Badge>;
      case "reviewing":
        return <Badge variant="secondary"><Clock className="w-4 h-4 mr-1" />İnceleniyor</Badge>;
      default:
        return <Badge variant="outline"><Clock className="w-4 h-4 mr-1" />Beklemede</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Firma Doğrulama Durumu
            {getStatusBadge()}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="companyName">Firma Adı</Label>
                <Input
                  id="companyName"
                  value={companyInfo.companyName}
                  onChange={(e) => setCompanyInfo(prev => ({ ...prev, companyName: e.target.value }))}
                  placeholder="Firma adınızı girin"
                />
              </div>
              <div>
                <Label htmlFor="taxNumber">Vergi Numarası</Label>
                <Input
                  id="taxNumber"
                  value={companyInfo.taxNumber}
                  onChange={(e) => setCompanyInfo(prev => ({ ...prev, taxNumber: e.target.value }))}
                  placeholder="Vergi numaranızı girin"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="address">Adres</Label>
              <Textarea
                id="address"
                value={companyInfo.address}
                onChange={(e) => setCompanyInfo(prev => ({ ...prev, address: e.target.value }))}
                placeholder="Firma adresinizi girin"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">Telefon</Label>
                <Input
                  id="phone"
                  value={companyInfo.phone}
                  onChange={(e) => setCompanyInfo(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="Telefon numaranızı girin"
                />
              </div>
              <div>
                <Label htmlFor="email">E-posta</Label>
                <Input
                  id="email"
                  type="email"
                  value={companyInfo.email}
                  onChange={(e) => setCompanyInfo(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="E-posta adresinizi girin"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="website">Website (Opsiyonel)</Label>
              <Input
                id="website"
                value={companyInfo.website}
                onChange={(e) => setCompanyInfo(prev => ({ ...prev, website: e.target.value }))}
                placeholder="Website adresinizi girin"
              />
            </div>

            <div>
              <Label htmlFor="description">Firma Hakkında</Label>
              <Textarea
                id="description"
                value={companyInfo.description}
                onChange={(e) => setCompanyInfo(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Firmanız hakkında kısa bilgi verin"
                rows={4}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Doğrulama Belgeleri</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="documents">Gerekli Belgeler</Label>
              <div className="mt-2 text-sm text-gray-600">
                • Vergi levhası<br/>
                • İmza sirküleri<br/>
                • Ticaret sicil gazetesi<br/>
                • Faaliyet belgesi
              </div>
            </div>
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <div className="text-lg font-medium mb-2">Belgeleri Yükleyin</div>
              <div className="text-sm text-gray-500 mb-4">
                PDF, JPG, PNG dosyaları kabul edilir (Maks. 10MB)
              </div>
              <Input
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById('file-upload')?.click()}
              >
                Dosya Seç
              </Button>
            </div>

            {documents.length > 0 && (
              <div className="space-y-2">
                <Label>Seçilen Dosyalar:</Label>
                {documents.map((file, index) => (
                  <div key={index} className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                    <span className="text-sm">{file.name}</span>
                    <span className="text-xs text-gray-500">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                  </div>
                ))}
              </div>
            )}

            <Button 
              onClick={handleSubmit} 
              className="w-full"
              disabled={verificationStatus === "reviewing" || verificationStatus === "approved"}
            >
              {verificationStatus === "reviewing" ? "İnceleniyor..." : "Belgeleri Gönder"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
