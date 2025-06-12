
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Upload, CheckCircle, AlertCircle, Clock, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function FirmVerificationPanel() {
  const { toast } = useToast();
  const [verificationStatus, setVerificationStatus] = useState("pending");
  const [documents, setDocuments] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setDocuments(prev => [...prev, ...newFiles]);
    }
  };

  const removeDocument = (index: number) => {
    setDocuments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (documents.length === 0) {
      toast({
        title: "Belge Gerekli",
        description: "Lütfen doğrulama için gerekli belgeleri yükleyin",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    
    // Simulate document upload
    setTimeout(() => {
      setVerificationStatus("reviewing");
      setIsUploading(false);
      toast({
        title: "Belgeler Gönderildi",
        description: "Doğrulama belgeleri admin onayına gönderildi",
      });
    }, 2000);
  };

  const getStatusBadge = () => {
    switch (verificationStatus) {
      case "verified":
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            Doğrulandı
          </Badge>
        );
      case "reviewing":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
            <Clock className="h-3 w-3 mr-1" />
            İnceleniyor
          </Badge>
        );
      case "rejected":
        return (
          <Badge className="bg-red-100 text-red-800 border-red-200">
            <AlertCircle className="h-3 w-3 mr-1" />
            Reddedildi
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-100 text-gray-800 border-gray-200">
            <AlertCircle className="h-3 w-3 mr-1" />
            Beklemede
          </Badge>
        );
    }
  };

  const getStatusDescription = () => {
    switch (verificationStatus) {
      case "verified":
        return "Firmanız başarıyla doğrulandı. Tüm özellikleri kullanabilirsiniz.";
      case "reviewing":
        return "Belgeleriniz inceleniyor. 1-2 iş günü içinde sonuçlandırılacak.";
      case "rejected":
        return "Belgeleriniz eksik veya hatalı. Lütfen tekrar yükleyin.";
      default:
        return "Firma doğrulama işlemini tamamlamak için belgelerinizi yükleyin.";
    }
  };

  return (
    <div className="space-y-6">
      {/* Status Display */}
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
        <div>
          <h4 className="font-medium text-gray-900 mb-1">Doğrulama Durumu</h4>
          <p className="text-sm text-gray-600">{getStatusDescription()}</p>
        </div>
        {getStatusBadge()}
      </div>

      {/* Required Documents List */}
      <div className="space-y-3">
        <h4 className="font-medium text-gray-900">Gerekli Belgeler</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg">
            <FileText className="h-4 w-4 text-blue-600" />
            <span>Vergi Levhası</span>
          </div>
          <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg">
            <FileText className="h-4 w-4 text-blue-600" />
            <span>Ticaret Sicil Gazetesi</span>
          </div>
          <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg">
            <FileText className="h-4 w-4 text-blue-600" />
            <span>İmza Sirküleri</span>
          </div>
          <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg">
            <FileText className="h-4 w-4 text-blue-600" />
            <span>Faaliyet Belgesi</span>
          </div>
        </div>
      </div>

      {/* File Upload Section */}
      {verificationStatus !== "verified" && (
        <div className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <Upload className="h-10 w-10 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">
              Belgeleri Yükleyin
            </h4>
            <p className="text-sm text-gray-600 mb-4">
              PDF, JPG, PNG formatlarında belgelerinizi yükleyebilirsiniz
            </p>
            <input
              type="file"
              multiple
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileUpload}
              className="hidden"
              id="document-upload"
            />
            <label
              htmlFor="document-upload"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors"
            >
              <Upload className="h-4 w-4 mr-2" />
              Belge Seç
            </label>
          </div>

          {/* Uploaded Documents List */}
          {documents.length > 0 && (
            <div className="space-y-2">
              <h5 className="font-medium text-gray-900">Yüklenen Belgeler:</h5>
              {documents.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                  <div className="flex items-center space-x-2">
                    <FileText className="h-4 w-4 text-gray-600" />
                    <span className="text-sm">{file.name}</span>
                    <span className="text-xs text-gray-500">
                      ({Math.round(file.size / 1024)} KB)
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeDocument(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    Kaldır
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Submit Button */}
          <Button
            onClick={handleSubmit}
            disabled={documents.length === 0 || isUploading}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {isUploading ? (
              <>
                <Clock className="h-4 w-4 mr-2 animate-spin" />
                Yükleniyor...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Belgeleri Gönder
              </>
            )}
          </Button>
        </div>
      )}

      {/* Verification Complete Message */}
      {verificationStatus === "verified" && (
        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <h4 className="font-medium text-green-900">Doğrulama Tamamlandı</h4>
          </div>
          <p className="text-sm text-green-700 mt-1">
            Firmanız başarıyla doğrulandı. Artık tüm özellikleri kullanabilirsiniz.
          </p>
        </div>
      )}
    </div>
  );
}
