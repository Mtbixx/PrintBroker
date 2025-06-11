import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import {
  Users,
  FileText,
  DollarSign,
  CheckCircle,
  Settings,
  BarChart3,
  Printer,
  Star,
  Bell,
  Activity,
  TrendingUp,
  Target,
  Award,
  User,
  Edit,
  Upload,
  Clock,
  Package,
  Building2,
  MessageCircle,
  ShoppingCart,
  Percent,
  AlertCircle,
  Eye,
  Download,
  Trash2,
  Send,
  Filter
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Chat from "@/components/Chat";
import StatsCard from "@/components/StatsCard";
import Navigation from "@/components/Navigation";
import FirmVerificationPanel from "@/components/FirmVerificationPanel";
import { InkDropletsLoader } from "@/components/Loaders";

// QuoteFilesViewer Component
function QuoteFilesViewer({ quoteId }: { quoteId: string }) {
  const [files, setFiles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await apiRequest('GET', `/api/quotes/${quoteId}/files`);

        if (response.success) {
          setFiles(response.files || []);
        } else {
          setFiles([]);
        }
      } catch (err) {
        console.error('Error fetching quote files:', err);
        setError('Dosyalar yüklenirken hata oluştu');
        setFiles([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (quoteId) {
      fetchFiles();
    }
  }, [quoteId]);

  const getFileIcon = (fileName: string, mimeType?: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();

    if (mimeType?.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(extension || '')) {
      return '🖼️';
    } else if (extension === 'pdf' || mimeType === 'application/pdf') {
      return '📄';
    } else if (['ai', 'eps', 'svg'].includes(extension || '')) {
      return '🎨';
    } else {
      return '📁';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleDownload = async (file: any) => {
    try {
      const response = await fetch(`/api/files/${file.filename}`, {
        method: 'GET',
        credentials: 'include'
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = file.originalName || file.filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        throw new Error('Dosya indirilemedi');
      }
    } catch (error) {
      console.error('Download error:', error);
      alert('Dosya indirirken hata oluştu');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Dosyalar yükleniyor...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
          <span className="text-red-800">{error}</span>
        </div>
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-2" />
        <p className="text-gray-600">Bu teklif için henüz dosya yüklenmemiş</p>
        <p className="text-sm text-gray-500 mt-1">Müşteri dosya yüklediğinde burada görünecektir</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Package className="h-5 w-5 text-blue-600 mr-2" />
            <span className="font-medium text-blue-800">
              {files.length} dosya bulundu
            </span>
          </div>
          <Badge variant="secondary">
            Toplam: {files.reduce((acc, file) => acc + (file.size || 0), 0) > 0 ? 
              formatFileSize(files.reduce((acc, file) => acc + (file.size || 0), 0)) : 'Bilinmiyor'}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {files.map((file, index) => (
          <div key={file.id || index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3 flex-1">
                <span className="text-2xl">{getFileIcon(file.originalName || file.filename, file.mimeType)}</span>
                <div className="flex-1 min-w-0">
                  <h5 className="font-medium text-gray-900 truncate">
                    {file.originalName || file.filename}
                  </h5>
                  <div className="mt-1 space-y-1">
                    {file.size && (
                      <p className="text-sm text-gray-500">
                        Boyut: {formatFileSize(file.size)}
                      </p>
                    )}
                    {file.mimeType && (
                      <p className="text-xs text-gray-400">
                        Tür: {file.mimeType}
                      </p>
                    )}
                    {file.createdAt && (
                      <p className="text-xs text-gray-400">
                        Yükleme: {new Date(file.createdAt).toLocaleDateString('tr-TR')}
                      </p>
                    )}
                  </div>

                  {/* File status */}
                  <div className="mt-2">
                    <Badge 
                      variant={file.status === 'ready' ? 'default' : 
                              file.status === 'processing' ? 'secondary' : 'destructive'}
                      className="text-xs"
                    >
                      {file.status === 'ready' ? 'Hazır' :
                       file.status === 'processing' ? 'İşleniyor' :
                       file.status === 'error' ? 'Hata' : 'Bilinmiyor'}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2 ml-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDownload(file)}
                  className="flex items-center gap-1"
                >
                  <Download className="h-3 w-3" />
                  İndir
                </Button>

                {file.mimeType?.startsWith('image/') && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => window.open(`/api/files/${file.filename}`, '_blank')}
                    className="flex items-center gap-1"
                  >
                    <Eye className="h-3 w-3" />
                    Görüntüle
                  </Button>
                )}
              </div>
            </div>

            {/* Processing notes */}
            {file.processingNotes && (
              <div className="mt-3 p-2 bg-gray-50 rounded text-xs text-gray-600">
                <strong>Analiz:</strong> {file.processingNotes}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function PrinterDashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const queryClient = useQueryClient();

  // Teklif verme state'leri
  const [selectedQuote, setSelectedQuote] = useState<any>(null);
  const [quoteResponse, setQuoteResponse] = useState({
    price: "",
    estimatedDays: "",
    notes: ""
  });
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);

  // Firma profili state'leri
  const [companyProfile, setCompanyProfile] = useState({
    companyName: user?.companyName || "",
    logo: "",
    description: "",
    address: "",
    phone: user?.phone || "",
    email: user?.email || "",
    website: "",
    foundedYear: "",
    employeeCount: "",
    specialties: []
  });

  // Doğrulama durumu state'leri
  const [verificationStatus, setVerificationStatus] = useState({
    status: "pending", // pending, approved, rejected
    documents: [],
    submitDate: null,
    notes: ""
  });

  // Ürün yönetimi state'leri
  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({
    name: "",
    category: "",
    description: "",
    price: "",
    stock: "",
    minOrder: "",
    images: []
  });

  // Kampanya state'leri
  const [campaigns, setCampaigns] = useState([]);
  const [newCampaign, setNewCampaign] = useState({
    title: "",
    description: "",
    discountType: "percentage", // percentage, fixed
    discountValue: "",
    startDate: "",
    endDate: "",
    products: []
  });

  // Fatura state'leri
  const [invoices, setInvoices] = useState([]);

  // Dialog state'leri
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [isCampaignDialogOpen, setIsCampaignDialogOpen] = useState(false);
  const [isInvoiceDialogOpen, setIsInvoiceDialogOpen] = useState(false);
  const [isVerificationDialogOpen, setIsVerificationDialogOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Fetch notifications
  const { data: notificationsData } = useQuery({
    queryKey: ["/api/notifications"],
    enabled: !!user?.id,
    refetchInterval: 30000,
  });

  // Fetch quotes for printer
  const { data: quotes, isLoading: quotesLoading, refetch: refetchQuotes } = useQuery({
    queryKey: ["/api/quotes"],
    enabled: isAuthenticated && user?.role === 'printer',
    refetchInterval: 30000,
  });

  // Fetch orders for printer
  const { data: orders, isLoading: ordersLoading } = useQuery({
    queryKey: ["/api/orders"],
    enabled: isAuthenticated && user?.role === 'printer',
  });

  // Fetch printer statistics
  const { data: printerStats } = useQuery({
    queryKey: ["/api/printer/stats"],
    enabled: isAuthenticated && user?.role === 'printer',
    refetchInterval: 60000,
  });

  const notifications = notificationsData?.notifications || [];
  const unreadCount = notifications.filter((n: any) => !n.isRead).length;

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    try {
      await apiRequest('POST', `/api/notifications/${notificationId}/read`);
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Enhanced authentication handling
  useEffect(() => {
    console.log('Auth effect:', { isLoading, isAuthenticated, user });

    if (!isLoading && !isAuthenticated) {
      console.log('Not authenticated, redirecting...');
      toast({
        title: "Oturum Sonlandı",
        description: "Lütfen tekrar giriş yapın",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/?login=required";
      }, 1500);
      return;
    }

    // Additional role check
    if (!isLoading && isAuthenticated && user && user.role !== 'printer') {
      console.log('Wrong role:', user.role);
      toast({
        title: "Erişim Hatası", 
        description: "Bu sayfaya erişim yetkiniz bulunmuyor",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/";
      }, 1500);
      return;
    }
  }, [isAuthenticated, isLoading, user, toast]);

  // Teklif verme mutation'ı
  const submitQuoteMutation = useMutation({
    mutationFn: async (quoteData: any) => {
      return await apiRequest('POST', `/api/quotes/${selectedQuote.id}/printer-quotes`, quoteData);
    },
    onSuccess: () => {
      setIsQuoteModalOpen(false);
      setQuoteResponse({ price: "", estimatedDays: "", notes: "" });
      setSelectedQuote(null);
      toast({
        title: "Teklif Gönderildi",
        description: "Teklifiniz başarıyla müşteriye gönderildi.",
      });
      refetchQuotes();
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
    },
    onError: (error: any) => {
      toast({
        title: "Teklif Hatası",
        description: error.message || "Teklif gönderilirken hata oluştu",
        variant: "destructive",
      });
    },
  });

  // Belge yükleme mutation'ı
  const uploadDocumentsMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      return await apiRequest('POST', '/api/printer/upload-documents', formData);
    },
    onSuccess: () => {
      setIsVerificationDialogOpen(false);
      toast({
        title: "Belgeler Yüklendi",
        description: "Doğrulama belgeleri başarıyla yüklendi. Admin onayı bekleniyor.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/printer/verification-status'] });
    },
    onError: (error: any) => {
      toast({
        title: "Yükleme Hatası",
        description: error.message || "Belgeler yüklenirken hata oluştu",
        variant: "destructive",
      });
    },
  });

  // Profil güncelleme mutation'ı
  const updateProfileMutation = useMutation({
    mutationFn: async (profileData: any) => {
      return await apiRequest('PUT', '/api/printer/profile', profileData);
    },
    onSuccess: () => {
      setIsProfileDialogOpen(false);
      toast({
        title: "Profil Güncellendi",
        description: "Firma profili başarıyla güncellendi.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Güncelleme Hatası",
        description: error.message || "Profil güncellenirken hata oluştu",
        variant: "destructive",
      });
    },
  });

  // Ürün ekleme mutation'ı
  const addProductMutation = useMutation({
    mutationFn: async (productData: any) => {
      return await apiRequest('POST', '/api/printer/products', productData);
    },
    onSuccess: () => {
      setIsProductDialogOpen(false);
      setNewProduct({
        name: "",
        category: "",
        description: "",
        price: "",
        stock: "",
        minOrder: "",
        images: []
      });
      toast({
        title: "Ürün Eklendi",
        description: "Yeni ürün başarıyla eklendi.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/printer/products'] });
    },
    onError: (error: any) => {
      toast({
        title: "Ekleme Hatası",
        description: error.message || "Ürün eklenirken hata oluştu",
        variant: "destructive",
      });
    },
  });

  // Show loading while checking auth
  if (isLoading) {
    console.log('Showing loading state');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Show login required if not authenticated
  if (!isAuthenticated) {
    console.log('Not authenticated, showing login required');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6">
            <div className="flex mb-4 gap-2">
              <AlertCircle className="h-8 w-8 text-yellow-500" />
              <h1 className="text-2xl font-bold text-gray-900">Giriş Gerekli</h1>
            </div>
            <p className="mt-4 text-sm text-gray-600">
              Bu sayfaya erişim için giriş yapmanız gerekiyor.
            </p>
            <Button 
              className="mt-4 w-full"
              onClick={() => window.location.href = "/?login=true"}
            >
              Giriş Yap
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show access denied if wrong role
  if (user?.role !== 'printer') {
    console.log('Wrong role, showing access denied');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6">
            <div className="flex mb-4 gap-2">
              <AlertCircle className="h-8 w-8 text-red-500" />
              <h1 className="text-2xl font-bold text-gray-900">Erişim Reddedildi</h1>
            </div>
            <p className="mt-4 text-sm text-gray-600">
              Bu sayfa sadece matbaa firmaları için erişilebilir.
            </p>
            <Button 
              className="mt-4 w-full"
              onClick={() => window.location.href = "/"}
            >
              Ana Sayfa
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  console.log('Rendering main dashboard content');

  const allQuotes = quotes || [];
  const allOrders = orders || [];

  // Filter quotes by status
  const pendingQuotes = allQuotes.filter((quote: any) => quote.status === 'pending');
  const receivedQuotes = allQuotes.filter((quote: any) => quote.status === 'received_quotes');
  const approvedQuotes = allQuotes.filter((quote: any) => quote.status === 'approved');

  // Filter orders
  const activeOrders = allOrders.filter((order: any) => 
    order.status === 'in_progress' && order.printerId === user.id
  );
  const completedOrders = allOrders.filter((order: any) => 
    order.status === 'completed' && order.printerId === user.id
  );

  // Calculate statistics
  const stats = {
    totalQuotes: allQuotes.length,
    pendingQuotes: pendingQuotes.length,
    approvedQuotes: approvedQuotes.length,
    activeOrders: activeOrders.length,
    completedOrders: completedOrders.length,
    totalRevenue: completedOrders.reduce((sum, order) => sum + (parseFloat(order.totalAmount) || 0), 0),
    averageRating: printerStats?.averageRating || 0,
    totalRatings: printerStats?.totalRatings || 0
  };

  const handleQuoteResponse = (quote: any) => {
    setSelectedQuote(quote);
    setQuoteResponse({
      price: "",
      estimatedDays: "",
      notes: ""
    });
    setIsQuoteModalOpen(true);
  };

  const handleSubmitQuote = () => {
    if (!quoteResponse.price || !quoteResponse.estimatedDays) {
      toast({
        title: "Eksik Bilgi",
        description: "Lütfen fiyat ve tahmini süre bilgilerini doldurun",
        variant: "destructive",
      });
      return;
    }

    submitQuoteMutation.mutate({
      price: parseFloat(quoteResponse.price),
      estimatedDays: parseInt(quoteResponse.estimatedDays),
      notes: quoteResponse.notes
    });
  };

  const handleDocumentUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const formData = new FormData();
      Array.from(files).forEach(file => {
        formData.append('documents', file);
      });
      uploadDocumentsMutation.mutate(formData);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 text-white p-4 md:p-6 rounded-2xl mb-8 shadow-lg">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 bg-white bg-opacity-20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg">
                <Building2 className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-xl md:text-2xl font-bold">{user.companyName || 'Firma Adı'}</h3>
                <p className="text-blue-100 text-sm md:text-base">Matbaa Hesabı</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary" className="bg-white bg-opacity-20 text-white border-0 text-xs">
                    {user.role === 'printer' ? 'Matbaa' : 'Tedarikçi'}
                  </Badge>
                  <Badge variant="secondary" className="bg-green-500 bg-opacity-80 text-white border-0 text-xs">
                    Aktif
                  </Badge>
                </div>
              </div>
            </div>
            <div className="text-left sm:text-right">
              <p className="text-blue-100 text-sm">Toplam Gelir</p>
              <p className="text-2xl md:text-3xl font-bold">₺{stats?.totalRevenue?.toLocaleString() || 0}</p>
              <p className="text-xs text-blue-200 mt-1">Bu ay: ₺{stats?.monthlyRevenue?.toLocaleString() || 0}</p>
            </div>
          </div>
        </div>

        {/* Tabs for Dashboard Sections */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 gap-1 bg-gray-100 p-1 rounded-lg">
            <TabsTrigger value="overview" className="text-xs md:text-sm">Genel Bakış</TabsTrigger>
            <TabsTrigger value="quotes" className="text-xs md:text-sm">Teklifler</TabsTrigger>
            <TabsTrigger value="orders" className="text-xs md:text-sm">Siparişler</TabsTrigger>
            <TabsTrigger value="profile" className="text-xs md:text-sm">Profil</TabsTrigger>
            <TabsTrigger value="analytics" className="text-xs md:text-sm">Analizler</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 md:space-y-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
              <Card className="p-4 md:p-6 hover:shadow-lg transition-shadow border-0 bg-gradient-to-br from-blue-50 to-blue-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs md:text-sm font-medium text-blue-600 mb-1">Toplam Teklif</p>
                    <p className="text-xl md:text-2xl font-bold text-blue-800">{stats?.totalQuotes || 0}</p>
                  </div>
                  <div className="p-2 md:p-3 bg-blue-500 rounded-xl">
                    <FileText className="h-4 w-4 md:h-5 md:w-5 text-white" />
                  </div>
                </div>
              </Card>

              <Card className="p-4 md:p-6 hover:shadow-lg transition-shadow border-0 bg-gradient-to-br from-green-50 to-green-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs md:text-sm font-medium text-green-600 mb-1">Aktif Siparişler</p>
                    <p className="text-xl md:text-2xl font-bold text-green-800">{stats?.activeOrders || 0}</p>
                  </div>
                  <div className="p-2 md:p-3 bg-green-500 rounded-xl">
                    <Package className="h-4 w-4 md:h-5 md:w-5 text-white" />
                  </div>
                </div>
              </Card>

              <Card className="p-4 md:p-6 hover:shadow-lg transition-shadow border-0 bg-gradient-to-br from-yellow-50 to-yellow-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs md:text-sm font-medium text-yellow-600 mb-1">Bu Ay Gelir</p>
                    <p className="text-lg md:text-xl font-bold text-yellow-800">₺{(stats?.monthlyRevenue || 0).toLocaleString()}</p>
                  </div>
                  <div className="p-2 md:p-3 bg-yellow-500 rounded-xl">
                    <DollarSign className="h-4 w-4 md:h-5 md:w-5 text-white" />
                  </div>
                </div>
              </Card>

              <Card className="p-4 md:p-6 hover:shadow-lg transition-shadow border-0 bg-gradient-to-br from-purple-50 to-purple-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs md:text-sm font-medium text-purple-600 mb-1">Müşteri Puanı</p>
                    <p className="text-xl md:text-2xl font-bold text-purple-800">{stats?.customerRating || 4.5}</p>
                  </div>
                  <div className="p-2 md:p-3 bg-purple-500 rounded-xl">
                    <Star className="h-4 w-4 md:h-5 md:w-5 text-white" />
                  </div>
                </div>
              </Card>
            </div>

            {/* Chat Button */}
            <Button
              onClick={() => setIsChatOpen(true)}
              className="fixed bottom-4 right-4 md:bottom-6 md:right-6 h-12 w-12 md:h-14 md:w-14 rounded-full shadow-lg z-40 bg-blue-600 hover:bg-blue-700"
              size="sm"
            >
              <div className="relative">
                <MessageCircle className="h-5 w-5 md:h-6 md:w-6" />
                {unreadCount && unreadCount > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-2 -right-2 h-4 w-4 md:h-5 md:w-5 rounded-full p-0 flex items-center justify-center text-xs"
                  >
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </Badge>
                )}
              </div>
            </Button>
          </TabsContent>

          <TabsContent value="quotes" className="space-y-6">
            {/* Advanced Filters */}
            <Card className="border-0 bg-gradient-to-r from-blue-50 to-purple-50">
              <CardContent className="p-4">
                <div className="flex flex-wrap gap-3 items-center">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-gray-600" />
                    <span className="text-sm font-medium">Filtreler:</span>
                  </div>
                  <Button variant="outline" size="sm" className="h-8">
                    Tüm Teklifler ({quotes?.length || 0})
                  </Button>
                  <Button variant="outline" size="sm" className="h-8">
                    Bekleyen ({pendingQuotes.length})
                  </Button>
                  <Button variant="outline" size="sm" className="h-8">
                    Yanıtlanan ({receivedQuotes.length})
                  </Button>
                  <Button variant="outline" size="sm" className="h-8">
                    Onaylanan ({approvedQuotes.length})
                  </Button>
                  <div className="ml-auto flex gap-2">
                    <Button variant="outline" size="sm" className="h-8">
                      <Clock className="h-3 w-3 mr-1" />
                      Son 24 Saat
                    </Button>
                    <Button variant="outline" size="sm" className="h-8">
                      Yüksek Değer
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg border-0">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                      <FileText className="h-5 w-5 text-blue-600" />
                      Gelen Teklif Talepleri
                    </CardTitle>
                    <CardDescription className="text-sm md:text-base">
                      Müşterilerden gelen teklif taleplerini inceleyin ve yanıtlayın
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600">{quotes?.length || 0}</div>
                    <div className="text-xs text-gray-500">Toplam Teklif</div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4 md:p-6">
                {quotesLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : quotes && quotes.length > 0 ? (
                  <div className="space-y-3 md:space-y-4">
                    {quotes.map((quote: any) => (
                      <div key={quote.id} className="border border-gray-200 rounded-xl p-4 md:p-6 hover:shadow-lg transition-all duration-200 bg-gradient-to-r from-white to-gray-50">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-4 mb-3">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 text-sm md:text-base">{quote.title}</h4>
                            <p className="text-xs md:text-sm text-gray-600 mt-1 line-clamp-2">{quote.description}</p>
                          </div>
                          <Badge 
                            variant={quote.status === 'pending' ? 'secondary' : 'default'}
                            className="self-start md:self-center text-xs"
                          >
                            {quote.status === 'pending' ? 'Bekliyor' : 
                             quote.status === 'received_quotes' ? 'Teklifler Alındı' : 
                             quote.status === 'approved' ? 'Onaylandı' : quote.status}
                          </Badge>
                        </div>
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                          <div className="text-xs md:text-sm text-gray-600 space-y-1 md:space-y-0 md:space-x-4 md:flex">
                            <span className="block md:inline">Bütçe: ₺{quote.budget?.toLocaleString()}</span>
                            <span className="block md:inline">Tarih: {new Date(quote.createdAt).toLocaleDateString('tr-TR')}</span>
                          </div>
                          {quote.status === 'pending' && (
                            <Button 
                              size="sm" 
                              onClick={() => handleQuoteResponse(quote)}
                              className="bg-blue-600 hover:bg-blue-700 text-white self-start md:self-center"
                            >
                              Teklif Ver
                            </Button>
                          )}
                          {quote.status === 'received_quotes' && (
                            <Badge variant="secondary" className="self-start md:self-center text-xs">
                              Teklif Verildi
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FileText className="h-12 w-12 md:h-16 md:w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-base md:text-lg font-medium text-gray-900 mb-2">Henüz teklif talebi yok</h3>
                    <p className="text-sm md:text-base text-gray-600">Müşterilerden gelen teklif talepleri burada görünecek</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders" className="space-y-6">
            <Card className="shadow-lg border-0">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                  <ShoppingCart className="h-5 w-5 text-blue-600" />
                  Sipariş Yönetimi
                </CardTitle>
                <CardDescription className="text-sm md:text-base">
                  Onaylanmış siparişleri takip edin ve yönetin
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 md:p-6">
                {ordersLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : orders && orders.length > 0 ? (
                  <div className="space-y-3 md:space-y-4">
                    {orders.map((order: any) => (
                      <div key={order.id} className="border border-gray-200 rounded-xl p-4 md:p-6 hover:shadow-lg transition-all duration-200 bg-gradient-to-r from-white to-gray-50">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-4 mb-3">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 text-sm md:text-base">Sipariş #{order.id.slice(-8)}</h4>
                            <p className="text-xs md:text-sm text-gray-600 mt-1">Tutar: ₺{order.totalAmount?.toLocaleString()}</p>
                          </div>
                          <Badge 
                            variant={order.status === 'completed' ? 'default' : 'secondary'}
                            className="self-start md:self-center text-xs"
                          >
                            {order.status === 'completed' ? 'Tamamlandı' : 
                             order.status === 'in_progress' ? 'Üretimde' : 
                             order.status === 'pending' ? 'Bekliyor' : order.status}
                          </Badge>
                        </div>
                        <div className="text-xs md:text-sm text-gray-600">
                          Tarih: {new Date(order.createdAt).toLocaleDateString('tr-TR')}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <ShoppingCart className="h-12 w-12 md:h-16 md:w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-base md:text-lg font-medium text-gray-900 mb-2">Henüz sipariş yok</h3>
                    <p className="text-sm md:text-base text-gray-600">Onaylanmış siparişler burada görünecek</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            <Card className="shadow-lg border-0">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                  <Building2 className="h-5 w-5 text-blue-600" />
                  Firma Bilgileri
                </CardTitle>
                <CardDescription className="text-sm md:text-base">
                  Kayıtlı firma bilgileriniz ve doğrulama durumu
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 md:p-6 space-y-6">
                {/* Existing Company Information Display */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Firma Adı</Label>
                      <div className="p-3 bg-gray-50 rounded-lg border">
                        {user?.companyName || 'Belirtilmemiş'}
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">E-posta</Label>
                      <div className="p-3 bg-gray-50 rounded-lg border">
                        {user?.email || 'Belirtilmemiş'}
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Telefon</Label>
                      <div className="p-3 bg-gray-50 rounded-lg border">
                        {user?.phone || 'Belirtilmemiş'}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Vergi Numarası</Label>
                      <div className="p-3 bg-gray-50 rounded-lg border">
                        {user?.taxNumber || 'Belirtilmemiş'}
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Adres</Label>
                      <div className="p-3 bg-gray-50 rounded-lg border">
                        {user?.companyAddress || 'Belirtilmemiş'}
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Web Sitesi</Label>
                      <div className="p-3 bg-gray-50 rounded-lg border">
                        {user?.website || 'Belirtilmemiş'}
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Verification Section */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Firma Doğrulama</h3>
                  <FirmVerificationPanel />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            {/* Enterprise Analytics Dashboard */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Key Performance Indicators */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    Performans Göstergeleri
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                      <div className="text-2xl font-bold text-blue-800">{stats.totalQuotes}</div>
                      <div className="text-xs text-blue-600">Toplam Teklif</div>
                      <div className="text-xs text-green-600 mt-1">+12% bu ay</div>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
                      <div className="text-2xl font-bold text-green-800">{Math.round((stats.approvedQuotes / stats.totalQuotes) * 100)}%</div>
                      <div className="text-xs text-green-600">Kazanma Oranı</div>
                      <div className="text-xs text-green-600 mt-1">+5% bu ay</div>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
                      <div className="text-2xl font-bold text-purple-800">₺{Math.round(stats.totalRevenue / stats.completedOrders || 0).toLocaleString()}</div>
                      <div className="text-xs text-purple-600">Ort. Sipariş</div>
                      <div className="text-xs text-green-600 mt-1">+8% bu ay</div>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg">
                      <div className="text-2xl font-bold text-orange-800">{stats.averageRating.toFixed(1)}</div>
                      <div className="text-xs text-orange-600">Müşteri Puanı</div>
                      <div className="text-xs text-green-600 mt-1">Mükemmel</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Customer Insights */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-blue-600" />
                    Müşteri Analizi
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Aktif Müşteriler</span>
                      <Badge variant="secondary">{Math.floor(stats.totalQuotes * 0.6)}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Yeni Müşteriler</span>
                      <Badge variant="outline">{Math.floor(stats.totalQuotes * 0.2)}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">VIP Müşteriler</span>
                      <Badge className="bg-gold text-white">{Math.floor(stats.totalQuotes * 0.15)}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Müşteri Tutma</span>
                      <span className="text-sm font-semibold text-green-600">85%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Detailed Analytics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Teklif Performansı</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Toplam Teklif:</span>
                    <span className="font-semibold">{stats.totalQuotes}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Bekleyen:</span>
                    <span className="font-semibold text-orange-600">{stats.pendingQuotes}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Onaylanan:</span>
                    <span className="font-semibold text-green-600">{stats.approvedQuotes}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Kazanma Oranı:</span>
                    <span className="font-semibold text-blue-600">{Math.round((stats.approvedQuotes / stats.totalQuotes) * 100)}%</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Finansal Durum</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Bu Ay Gelir:</span>
                    <span className="font-semibold text-green-600">₺{(stats.totalRevenue * 0.3).toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Toplam Gelir:</span>
                    <span className="font-semibold">₺{stats.totalRevenue.toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Ort. Sipariş:</span>
                    <span className="font-semibold">₺{Math.round(stats.totalRevenue / stats.completedOrders || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Büyüme:</span>
                    <span className="font-semibold text-green-600">+15.2%</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Operasyonel Metrikler</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Aktif Sipariş:</span>
                    <span className="font-semibold text-blue-600">{stats.activeOrders}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Tamamlanan:</span>
                    <span className="font-semibold text-green-600">{stats.completedOrders}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Müşteri Puanı:</span>
                    <span className="font-semibold text-purple-600">{stats.averageRating.toFixed(1)}/5</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Değerlendirme:</span>
                    <span className="font-semibold">{stats.totalRatings}</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Premium Features */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-gold" />
                  Değerli Müşteriler & Özel Analizler
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3 text-gray-800">Top 5 Değerli Müşteriler</h4>
                    <div className="space-y-2">
                      {[
                        { name: "ABC Matbaa Ltd.", orders: 8, total: "₺15,000", status: "VIP" },
                        { name: "XYZ Reklam A.Ş.", orders: 6, total: "₺12,000", status: "Premium" },
                        { name: "Özkan Tasarım", orders: 5, total: "₺9,500", status: "Gold" },
                        { name: "Metro Baskı", orders: 4, total: "₺7,200", status: "Silver" },
                        { name: "Pro Design Co.", orders: 3, total: "₺5,800", status: "Standard" }
                      ].map((customer, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-xs font-semibold text-blue-600">{index + 1}</span>
                            </div>
                            <div>
                              <div className="font-medium text-sm">{customer.name}</div>
                              <div className="text-xs text-gray-500">{customer.orders} sipariş</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-sm">{customer.total}</div>
                            <Badge variant="outline" className="text-xs">{customer.status}</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3 text-gray-800">Kategori Bazlı Analiz</h4>
                    <div className="space-y-3">
                      {[
                        { category: "Etiket Baskı", share: 45, revenue: "₺35,000", growth: "+12%" },
                        { category: "Kartvizit", share: 28, revenue: "₺18,000", growth: "+8%" },
                        { category: "Broşür", share: 18, revenue: "₺22,000", growth: "-2%" },
                        { category: "Poster", share: 9, revenue: "₺8,500", growth: "+15%" }
                      ].map((cat, index) => (
                        <div key={index} className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="font-medium">{cat.category}</span>
                            <span className="text-gray-600">{cat.share}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${cat.share}%` }}
                            ></div>
                          </div>
                          <div className="flex justify-between text-xs text-gray-600">
                            <span>{cat.revenue}</span>
                            <span className={cat.growth.startsWith('+') ? 'text-green-600' : 'text-red-600'}>
                              {cat.growth}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Teklif Verme Modal */}
        <Dialog open={isQuoteModalOpen} onOpenChange={setIsQuoteModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Teklif Ver</DialogTitle>
              <DialogDescription>
                "{selectedQuote?.title}" için teklif verin
              </DialogDescription>
            </DialogHeader>

            {selectedQuote && (
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">Teklif Detayları</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Proje:</span>
                      <p className="font-medium">{selectedQuote.title}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Adet:</span>
                      <p className="font-medium">{selectedQuote.quantity}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Bütçe:</span>
                      <p className="font-medium">₺{selectedQuote.estimatedBudget || selectedQuote.budget || 'Belirtilmemiş'}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Tarih:</span>
                      <p className="font-medium">{new Date(selectedQuote.createdAt).toLocaleDateString('tr-TR')}</p>
                    </div>
                  </div>
                  {selectedQuote.description && (
                    <div className="mt-3">
                      <span className="text-gray-600">Açıklama:</span>
                      <p className="text-sm mt-1">{selectedQuote.description}</p>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="price">Fiyat (₺) *</Label>
                    <Input
                      id="price"
                      type="number"
                      placeholder="Teklif fiyatınız"
                      value={quoteResponse.price}
                      onChange={(e) => setQuoteResponse(prev => ({
                        ...prev,
                        price: e.target.value
                      }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="estimatedDays">Tahmini Süre (Gün) *</Label>
                    <Input
                      id="estimatedDays"
                      type="number"
                      placeholder="Teslim süresi"
                      value={quoteResponse.estimatedDays}
                      onChange={(e) => setQuoteResponse(prev => ({
                        ...prev,
                        estimatedDays: e.target.value
                      }))}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="notes">Notlar</Label>
                  <Textarea
                    id="notes"
                    placeholder="Teklif detayları, özel şartlar vb."
                    value={quoteResponse.notes}
                    onChange={(e) => setQuoteResponse(prev => ({
                      ...prev,
                      notes: e.target.value
                    }))}
                    rows={3}
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setIsQuoteModalOpen(false)}
                  >
                    İptal
                  </Button>
                  <Button 
                    onClick={handleSubmitQuote}
                    disabled={submitQuoteMutation.isPending}
                  >
                    {submitQuoteMutation.isPending ? (
                      <>
                        <InkDropletsLoader size={16} color="white" />
                        Gönderiliyor...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Teklif Gönder
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Chat Modal */}
        <Dialog open={isChatOpen} onOpenChange={setIsChatOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Müşteri İletişim</DialogTitle>
              <DialogDescription>
                Müşterileriniz ile buradan iletişime geçebilirsiniz.
              </DialogDescription>
            </DialogHeader>
            <Chat />
          </DialogContent>
        </Dialog>
              {/* Quote Details Modal */}
              {selectedQuote && (
                <Dialog open={!!selectedQuote} onOpenChange={() => setSelectedQuote(null)}>
                  <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Teklif Detayları
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-semibold mb-3 flex items-center gap-2">
                            <Package className="h-4 w-4" />
                            Genel Bilgiler
                          </h4>
                          <div className="space-y-3 text-sm bg-gray-50 p-4 rounded-lg">
                            <p><span className="font-medium text-gray-700">Başlık:</span> <span className="text-gray-900">{selectedQuote.title}</span></p>
                            <p><span className="font-medium text-gray-700">Açıklama:</span> <span className="text-gray-900">{selectedQuote.description || 'Belirtilmemiş'}</span></p>
                            <p><span className="font-medium text-gray-700">Kategori:</span> <span className="text-gray-900">{selectedQuote.category || selectedQuote.type}</span></p>
                            <p><span className="font-medium text-gray-700">Durum:</span> 
                              <Badge className="ml-2" variant={selectedQuote.status === 'pending' ? 'secondary' : 'default'}>
                                {selectedQuote.status === 'pending' ? 'Bekliyor' : 
                                 selectedQuote.status === 'received_quotes' ? 'Teklifler Alındı' : 
                                 selectedQuote.status === 'approved' ? 'Onaylandı' : selectedQuote.status}
                              </Badge>
                            </p>
                            <p><span className="font-medium text-gray-700">Tarih:</span> <span className="text-gray-900">{new Date(selectedQuote.createdAt).toLocaleDateString('tr-TR')}</span></p>
                            {selectedQuote.deadline && (
                              <p><span className="font-medium text-gray-700">Termin:</span> <span className="text-gray-900">{new Date(selectedQuote.deadline).toLocaleDateString('tr-TR')}</span></p>
                            )}
                            {selectedQuote.budget && (
                              <p><span className="font-medium text-gray-700">Bütçe:</span> <span className="text-green-600 font-semibold">₺{selectedQuote.budget}</span></p>
                            )}
                          </div>
                        </div>

                        <div>
                          <h4 className="font-semibold mb-3 flex items-center gap-2">
                            <Settings className="h-4 w-4" />
                            Teknik Özellikler
                          </h4>
                          <div className="space-y-3 text-sm bg-blue-50 p-4 rounded-lg">
                            {selectedQuote.specifications && Object.keys(selectedQuote.specifications).length > 0 ? (
                              Object.entries(selectedQuote.specifications).map(([key, value]) => {
                                if (value && key !== 'uploadedFiles') {
                                  return (
                                    <p key={key}>
                                      <span className="font-medium text-blue-700 capitalize">
                                        {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:
                                      </span> 
                                      <span className="text-blue-900 ml-2">{String(value)}</span>
                                    </p>
                                  );
                                }
                                return null;
                              })
                            ) : (
                              <p className="text-gray-500 italic">Teknik özellik belirtilmemiş</p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Customer Contact Info */}
                      {selectedQuote.contactInfo && (
                        <div>
                          <h4 className="font-semibold mb-3 flex items-center gap-2">
                            <User className="h-4 w-4" />
                            Müşteri İletişim Bilgileri
                          </h4>
                          <div className="bg-green-50 p-4 rounded-lg grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            {selectedQuote.contactInfo.companyName && (
                              <p><span className="font-medium text-green-700">Firma:</span> <span className="text-green-900">{selectedQuote.contactInfo.companyName}</span></p>
                            )}
                            {selectedQuote.contactInfo.contactName && (
                              <p><span className="font-medium text-green-700">Yetkili:</span> <span className="text-green-900">{selectedQuote.contactInfo.contactName}</span></p>
                            )}
                            {selectedQuote.contactInfo.email && (
                              <p><span className="font-medium text-green-700">E-posta:</span> <span className="text-green-900">{selectedQuote.contactInfo.email}</span></p>
                            )}
                            {selectedQuote.contactInfo.phone && (
                              <p><span className="font-medium text-green-700">Telefon:</span> <span className="text-green-900">{selectedQuote.contactInfo.phone}</span></p>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Customer Files Section */}
                      <div>
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          Müşteri Dosyaları
                        </h4>
                        <QuoteFilesViewer quoteId={selectedQuote.id} />
                      </div>

                      {/* Quote Response Form */}
                      {selectedQuote.status === 'pending' && (
                        <div className="border-t pt-6">
                          <h4 className="font-semibold mb-4 flex items-center gap-2">
                            <Send className="h-4 w-4" />
                            Teklif Ver
                          </h4>
                          <form onSubmit={handleQuoteResponse} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="price">Fiyat (₺) *</Label>
                                <Input
                                  id="price"
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  value={quoteResponse.price}
                                  onChange={(e) => setQuoteResponse(prev => ({
                                    ...prev,
                                    price: e.target.value
                                  }))}
                                  placeholder="Örn: 1250.00"
                                  required
                                />
                              </div>
                              <div>
                                <Label htmlFor="estimatedDays">Tahmini Süre (Gün) *</Label>
                                <Input
                                  id="estimatedDays"
                                  type="number"
                                  min="1"
                                  value={quoteResponse.estimatedDays}
                                  onChange={(e) => setQuoteResponse(prev => ({
                                    ...prev,
                                    estimatedDays: e.target.value
                                  }))}
                                  placeholder="Örn: 5"
                                  required
                                />
                              </div>
                            </div>
                            <div>
                              <Label htmlFor="notes">Teklifiniz ve Notlar</Label>
                              <Textarea
                                id="notes"
                                value={quoteResponse.notes}
                                onChange={(e) => setQuoteResponse(prev => ({
                                  ...prev,
                                  notes: e.target.value
                                }))}
                                placeholder="Teklifinizle ilgili detayları, özel koşulları ve notları buraya yazabilirsiniz..."
                                rows={4}
                              />
                            </div>
                            <div className="flex gap-2 pt-4">
                              <Button type="submit" onClick={handleSubmitQuote} disabled={submitQuoteMutation.isPending} className="bg-green-600 hover:bg-green-700">
                                {submitQuoteMutation.isPending ? (
                                  <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Gönderiliyor...
                                  </>
                                ) : (
                                  <>
                                    <Send className="h-4 w-4 mr-2" />
                                    Teklif Gönder
                                  </>
                                )}
                              </Button>
                              <Button type="button" variant="outline" onClick={() => setSelectedQuote(null)}>
                                İptal
                              </Button>
                            </div>
                          </form>
                        </div>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
              )}
      </main>
    </div>
  );
}