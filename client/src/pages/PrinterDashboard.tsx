import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
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
  Send
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Chat from "@/components/Chat";
import StatsCard from "@/components/StatsCard";
import Navigation from "@/components/Navigation";
import FirmVerificationPanel from "@/components/FirmVerificationPanel";
import { InkDropletsLoader } from "@/components/Loaders";

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
    if (!isLoading && !isAuthenticated) {
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

    if (!isLoading && user && user.role !== 'printer') {
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <InkDropletsLoader size={80} color="#8B5CF6" />
          <p className="mt-4 text-gray-600">Matbaa paneli yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

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
            <Card className="shadow-lg border-0">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                  <FileText className="h-5 w-5 text-blue-600" />
                  Gelen Teklif Talepleri
                </CardTitle>
                <CardDescription className="text-sm md:text-base">
                  Müşterilerden gelen teklif taleplerini inceleyin ve yanıtlayın
                </CardDescription>
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
                            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white self-start md:self-center">
                              Teklif Ver
                            </Button>
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
                  Firma Profili
                </CardTitle>
                <CardDescription className="text-sm md:text-base">
                  Firma bilgilerinizi güncelleyin ve doğrulama sürecini tamamlayın
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 md:p-6">
                <FirmVerificationPanel />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Detaylı İstatistikler
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-blue-800">Teklif İstatistikleri</h3>
                    <div className="mt-2 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-blue-600">Toplam Teklif:</span>
                        <span className="font-semibold">{stats.totalQuotes}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-blue-600">Bekleyen:</span>
                        <span className="font-semibold">{stats.pendingQuotes}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-blue-600">Onaylanan:</span>
                        <span className="font-semibold">{stats.approvedQuotes}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-green-800">Sipariş İstatistikleri</h3>
                    <div className="mt-2 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-green-600">Aktif Sipariş:</span>
                        <span className="font-semibold">{stats.activeOrders}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-green-600">Tamamlanan:</span>
                        <span className="font-semibold">{stats.completedOrders}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-green-600">Toplam Gelir:</span>
                        <span className="font-semibold">₺{stats.totalRevenue.toFixed(0)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-purple-800">Müşteri Memnuniyeti</h3>
                    <div className="mt-2 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-purple-600">Ortalama Puan:</span>
                        <span className="font-semibold">{stats.averageRating.toFixed(1)}/5</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-purple-600">Toplam Değerlendirme:</span>
                        <span className="font-semibold">{stats.totalRatings}</span>
                      </div>
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
      </main>
    </div>
  );
}