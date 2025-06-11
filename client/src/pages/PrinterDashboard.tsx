
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { InkDropletsLoader, StackedPapersLoader } from "@/components/PrintingLoaders";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import Navigation from "@/components/Navigation";
import StatsCard from "@/components/StatsCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Plus,
  FileText,
  Users,
  DollarSign,
  Clock,
  CheckCircle,
  Settings,
  BarChart3,
  Printer,
  Star,
  Bell,
  Upload,
  Download,
  Edit,
  Trash2,
  Package,
  MessageSquare,
  TrendingUp,
  Target,
  Award,
  Building,
  FileImage,
  Receipt,
  Zap,
  Eye,
  AlertCircle
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function PrinterDashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const queryClient = useQueryClient();

  // Firma profili state'leri
  const [companyProfile, setCompanyProfile] = useState({
    companyName: "",
    logo: "",
    description: "",
    address: "",
    phone: "",
    email: "",
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

  // Fetch notifications
  const { data: notificationsData } = useQuery({
    queryKey: ["/api/notifications"],
    enabled: !!user?.id,
    refetchInterval: 30000,
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

  const { data: quotes, isLoading: quotesLoading } = useQuery({
    queryKey: ["/api/quotes"],
    enabled: isAuthenticated,
  });

  const { data: orders, isLoading: ordersLoading } = useQuery({
    queryKey: ["/api/orders"],
    enabled: isAuthenticated && user?.role === 'printer',
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
  const receivedQuotes = allQuotes.filter((quote: any) => quote.printerId === user.id);
  const pendingQuotes = receivedQuotes.filter((quote: any) => quote.status === 'pending');
  const approvedQuotes = receivedQuotes.filter((quote: any) => quote.status === 'approved');
  
  // Filter orders
  const activeOrders = allOrders.filter((order: any) => 
    order.status === 'in_progress' && order.printerId === user.id
  );
  const completedOrders = allOrders.filter((order: any) => 
    order.status === 'completed' && order.printerId === user.id
  );

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
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Matbaa Paneli</h1>
            <p className="text-gray-600">Hoş geldiniz, {user.firstName} {user.lastName}</p>
          </div>
          
          <div className="flex items-center gap-4">
            <DropdownMenu open={isNotificationOpen} onOpenChange={setIsNotificationOpen}>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="relative">
                  <Bell className="h-4 w-4" />
                  {unreadCount > 0 && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                    >
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel>Bildirimler</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    Henüz bildirim yok
                  </div>
                ) : (
                  notifications.slice(0, 5).map((notification: any) => (
                    <DropdownMenuItem 
                      key={notification.id}
                      className={`p-3 cursor-pointer ${!notification.isRead ? 'bg-blue-50' : ''}`}
                      onClick={() => markAsRead(notification.id)}
                    >
                      <div className="flex flex-col gap-1">
                        <p className="text-sm font-medium">{notification.title}</p>
                        <p className="text-xs text-gray-600">{notification.message}</p>
                        <p className="text-xs text-gray-400">
                          {new Date(notification.createdAt).toLocaleString('tr-TR')}
                        </p>
                      </div>
                    </DropdownMenuItem>
                  ))
                )}
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Button variant="outline" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Ayarlar
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-8">
            <TabsTrigger value="overview">Genel Bakış</TabsTrigger>
            <TabsTrigger value="verification">Doğrulama</TabsTrigger>
            <TabsTrigger value="profile">Firma Profili</TabsTrigger>
            <TabsTrigger value="products">Ürünler</TabsTrigger>
            <TabsTrigger value="quotes">Teklifler</TabsTrigger>
            <TabsTrigger value="orders">Siparişler</TabsTrigger>
            <TabsTrigger value="campaigns">Kampanyalar</TabsTrigger>
            <TabsTrigger value="analytics">İstatistikler</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <StatsCard
                title="Bekleyen Teklifler"
                value={pendingQuotes.length}
                icon={<Clock className="h-5 w-5 text-yellow-600" />}
                color="bg-yellow-50"
              />
              <StatsCard
                title="Onaylanmış İşler"
                value={approvedQuotes.length}
                icon={<CheckCircle className="h-5 w-5 text-green-600" />}
                color="bg-green-50"
              />
              <StatsCard
                title="Aktif Siparişler"
                value={activeOrders.length}
                icon={<Printer className="h-5 w-5 text-blue-600" />}
                color="bg-blue-50"
              />
              <StatsCard
                title="Tamamlanan İşler"
                value={completedOrders.length}
                icon={<Star className="h-5 w-5 text-purple-600" />}
                color="bg-purple-50"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Son Teklifler
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {quotesLoading ? (
                    <div className="flex justify-center py-8">
                      <StackedPapersLoader size={60} color="#8B5CF6" />
                    </div>
                  ) : pendingQuotes.length > 0 ? (
                    <div className="space-y-4">
                      {pendingQuotes.slice(0, 3).map((quote: any) => (
                        <div key={quote.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <h4 className="font-medium">{quote.title || quote.type}</h4>
                            <p className="text-sm text-gray-600">{quote.quantity} adet</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-green-600">₺{quote.estimatedBudget}</p>
                            <Badge variant="secondary" className="text-xs">
                              {quote.status === 'pending' ? 'Bekliyor' : 'Değerlendiriliyor'}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">Henüz teklif yok</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Printer className="h-5 w-5" />
                    Aktif Siparişler
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {ordersLoading ? (
                    <div className="flex justify-center py-8">
                      <StackedPapersLoader size={60} color="#8B5CF6" />
                    </div>
                  ) : activeOrders.length > 0 ? (
                    <div className="space-y-4">
                      {activeOrders.slice(0, 3).map((order: any) => (
                        <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <h4 className="font-medium">{order.title}</h4>
                            <p className="text-sm text-gray-600">
                              {new Date(order.createdAt).toLocaleDateString('tr-TR')}
                            </p>
                          </div>
                          <div className="text-right">
                            <Badge 
                              variant={order.status === 'in_progress' ? 'default' : 'secondary'}
                              className="text-xs"
                            >
                              {order.status === 'in_progress' ? 'Üretimde' : 'Bekliyor'}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Printer className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">Aktif sipariş yok</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="verification" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Firma Doğrulama
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Firma hesabınızın doğrulanması için aşağıdaki belgeleri yüklemeniz gerekmektedir.
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-4">Gerekli Belgeler</h3>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        Vergi Levhası
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        Ticaret Sicil Gazetesi
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        İmza Sirküleri
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        Faaliyet Belgesi
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-4">Doğrulama Durumu</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Durum:</span>
                        <Badge variant={verificationStatus.status === 'pending' ? 'secondary' : 
                                      verificationStatus.status === 'approved' ? 'default' : 'destructive'}>
                          {verificationStatus.status === 'pending' ? 'Beklemede' :
                           verificationStatus.status === 'approved' ? 'Onaylandı' : 'Reddedildi'}
                        </Badge>
                      </div>
                      {verificationStatus.submitDate && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Başvuru Tarihi:</span>
                          <span className="text-sm font-medium">
                            {new Date(verificationStatus.submitDate).toLocaleDateString('tr-TR')}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <Dialog open={isVerificationDialogOpen} onOpenChange={setIsVerificationDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="w-full">
                        <Upload className="h-4 w-4 mr-2" />
                        Belge Yükle
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Doğrulama Belgeleri</DialogTitle>
                        <DialogDescription>
                          Firma doğrulama belgelerinizi yükleyin
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="documents">Belgeler</Label>
                          <Input
                            id="documents"
                            type="file"
                            multiple
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={handleDocumentUpload}
                            className="mt-1"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            PDF, JPG, JPEG, PNG formatlarında yükleyebilirsiniz
                          </p>
                        </div>
                        <Button 
                          onClick={() => setIsVerificationDialogOpen(false)}
                          variant="outline" 
                          className="w-full"
                        >
                          İptal
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Firma Profili
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-4">Firma Bilgileri</h3>
                    <div className="space-y-3">
                      <div>
                        <Label>Firma Adı</Label>
                        <p className="text-sm text-gray-600">{companyProfile.companyName || "Belirtilmemiş"}</p>
                      </div>
                      <div>
                        <Label>Telefon</Label>
                        <p className="text-sm text-gray-600">{companyProfile.phone || "Belirtilmemiş"}</p>
                      </div>
                      <div>
                        <Label>E-posta</Label>
                        <p className="text-sm text-gray-600">{companyProfile.email || "Belirtilmemiş"}</p>
                      </div>
                      <div>
                        <Label>Web Sitesi</Label>
                        <p className="text-sm text-gray-600">{companyProfile.website || "Belirtilmemiş"}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-4">Hakkımızda</h3>
                    <p className="text-sm text-gray-600">
                      {companyProfile.description || "Firma açıklaması henüz eklenmemiş."}
                    </p>
                  </div>
                </div>

                <div className="mt-6">
                  <Dialog open={isProfileDialogOpen} onOpenChange={setIsProfileDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Edit className="h-4 w-4 mr-2" />
                        Profili Düzenle
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Firma Profili Düzenle</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 max-h-96 overflow-y-auto">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="companyName">Firma Adı</Label>
                            <Input
                              id="companyName"
                              value={companyProfile.companyName}
                              onChange={(e) => setCompanyProfile(prev => ({
                                ...prev,
                                companyName: e.target.value
                              }))}
                            />
                          </div>
                          <div>
                            <Label htmlFor="phone">Telefon</Label>
                            <Input
                              id="phone"
                              value={companyProfile.phone}
                              onChange={(e) => setCompanyProfile(prev => ({
                                ...prev,
                                phone: e.target.value
                              }))}
                            />
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="email">E-posta</Label>
                            <Input
                              id="email"
                              type="email"
                              value={companyProfile.email}
                              onChange={(e) => setCompanyProfile(prev => ({
                                ...prev,
                                email: e.target.value
                              }))}
                            />
                          </div>
                          <div>
                            <Label htmlFor="website">Web Sitesi</Label>
                            <Input
                              id="website"
                              value={companyProfile.website}
                              onChange={(e) => setCompanyProfile(prev => ({
                                ...prev,
                                website: e.target.value
                              }))}
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="address">Adres</Label>
                          <Textarea
                            id="address"
                            value={companyProfile.address}
                            onChange={(e) => setCompanyProfile(prev => ({
                              ...prev,
                              address: e.target.value
                            }))}
                          />
                        </div>

                        <div>
                          <Label htmlFor="description">Hakkımızda</Label>
                          <Textarea
                            id="description"
                            value={companyProfile.description}
                            onChange={(e) => setCompanyProfile(prev => ({
                              ...prev,
                              description: e.target.value
                            }))}
                            rows={4}
                          />
                        </div>

                        <div className="flex gap-2">
                          <Button 
                            onClick={() => updateProfileMutation.mutate(companyProfile)}
                            disabled={updateProfileMutation.isPending}
                          >
                            {updateProfileMutation.isPending ? "Kaydediliyor..." : "Kaydet"}
                          </Button>
                          <Button 
                            variant="outline" 
                            onClick={() => setIsProfileDialogOpen(false)}
                          >
                            İptal
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="products" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Ürün Yönetimi
                  </div>
                  <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Ürün Ekle
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Yeni Ürün Ekle</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 max-h-96 overflow-y-auto">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="productName">Ürün Adı</Label>
                            <Input
                              id="productName"
                              value={newProduct.name}
                              onChange={(e) => setNewProduct(prev => ({
                                ...prev,
                                name: e.target.value
                              }))}
                            />
                          </div>
                          <div>
                            <Label htmlFor="category">Kategori</Label>
                            <Select 
                              value={newProduct.category}
                              onValueChange={(value) => setNewProduct(prev => ({
                                ...prev,
                                category: value
                              }))}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Kategori seçin" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="sheet_label">Tabaka Etiket</SelectItem>
                                <SelectItem value="roll_label">Rulo Etiket</SelectItem>
                                <SelectItem value="business_card">Kartvizit</SelectItem>
                                <SelectItem value="brochure">Broşür</SelectItem>
                                <SelectItem value="catalog">Katalog</SelectItem>
                                <SelectItem value="other">Diğer</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <Label htmlFor="price">Fiyat (₺)</Label>
                            <Input
                              id="price"
                              type="number"
                              value={newProduct.price}
                              onChange={(e) => setNewProduct(prev => ({
                                ...prev,
                                price: e.target.value
                              }))}
                            />
                          </div>
                          <div>
                            <Label htmlFor="stock">Stok</Label>
                            <Input
                              id="stock"
                              type="number"
                              value={newProduct.stock}
                              onChange={(e) => setNewProduct(prev => ({
                                ...prev,
                                stock: e.target.value
                              }))}
                            />
                          </div>
                          <div>
                            <Label htmlFor="minOrder">Min. Sipariş</Label>
                            <Input
                              id="minOrder"
                              type="number"
                              value={newProduct.minOrder}
                              onChange={(e) => setNewProduct(prev => ({
                                ...prev,
                                minOrder: e.target.value
                              }))}
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="description">Açıklama</Label>
                          <Textarea
                            id="description"
                            value={newProduct.description}
                            onChange={(e) => setNewProduct(prev => ({
                              ...prev,
                              description: e.target.value
                            }))}
                            rows={3}
                          />
                        </div>

                        <div className="flex gap-2">
                          <Button 
                            onClick={() => addProductMutation.mutate(newProduct)}
                            disabled={addProductMutation.isPending}
                          >
                            {addProductMutation.isPending ? "Ekleniyor..." : "Ürün Ekle"}
                          </Button>
                          <Button 
                            variant="outline" 
                            onClick={() => setIsProductDialogOpen(false)}
                          >
                            İptal
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {products.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Henüz ürün eklenmemiş</p>
                    <p className="text-sm text-gray-400 mt-2">İlk ürününüzü eklemek için yukarıdaki butonu kullanın</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {products.map((product: any) => (
                      <Card key={product.id} className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium">{product.name}</h4>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">•••</Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem>
                                <Edit className="h-4 w-4 mr-2" />
                                Düzenle
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Sil
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{product.description}</p>
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-green-600">₺{product.price}</span>
                          <Badge variant="outline">Stok: {product.stock}</Badge>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="quotes">
            <Card>
              <CardHeader>
                <CardTitle>Teklif Yönetimi</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Teklif yönetim sistemi yakında aktif olacak</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>Sipariş Yönetimi</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Printer className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Sipariş yönetim sistemi yakında aktif olacak</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="campaigns" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    Kampanya Yönetimi
                  </div>
                  <Button onClick={() => setIsCampaignDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Kampanya Oluştur
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {campaigns.length === 0 ? (
                  <div className="text-center py-12">
                    <Zap className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Henüz kampanya oluşturulmamış</p>
                    <p className="text-sm text-gray-400 mt-2">İlk kampanyanızı oluşturmak için yukarıdaki butonu kullanın</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {campaigns.map((campaign: any) => (
                      <Card key={campaign.id} className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium">{campaign.title}</h4>
                            <p className="text-sm text-gray-600 mt-1">{campaign.description}</p>
                            <div className="flex items-center gap-4 mt-2 text-sm">
                              <span>İndirim: {campaign.discountValue}%</span>
                              <span>Başlangıç: {new Date(campaign.startDate).toLocaleDateString('tr-TR')}</span>
                              <span>Bitiş: {new Date(campaign.endDate).toLocaleDateString('tr-TR')}</span>
                            </div>
                          </div>
                          <Badge variant="default">Aktif</Badge>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>İstatistikler</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">İstatistik paneli yakında aktif olacak</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
