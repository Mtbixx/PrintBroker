import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "wouter";
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
  Trash2,
  AlertCircle,
  Package
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Chat from "@/components/Chat";
import SystemMonitoring from "@/components/SystemMonitoring";
import StatsCard from "@/components/StatsCard";
import Navigation from "@/components/Navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import ReportsAndAnalytics from "@/components/ReportsAndAnalytics";
import { 
  Building2, 
  ShoppingCart,
  UserPlus,
  Sparkles
} from "lucide-react";

export default function AdminDashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [ideogramUrl, setIdeogramUrl] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

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

    // Additional role check
    if (!isLoading && user && user.role !== 'admin') {
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

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/admin/stats"],
    enabled: isAuthenticated && user?.role === 'admin',
  });

  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ["/api/admin/users"],
    enabled: isAuthenticated && user?.role === 'admin',
  });

  const { data: activity, isLoading: activityLoading } = useQuery({
    queryKey: ["/api/admin/activity"],
    enabled: isAuthenticated && user?.role === 'admin',
  });

  const { data: quotes, isLoading: quotesLoading } = useQuery({
    queryKey: ["/api/admin/quotes"],
    enabled: isAuthenticated && user?.role === 'admin',
  });

  const { data: orders, isLoading: ordersLoading } = useQuery({
    queryKey: ["/api/admin/orders"],
    enabled: isAuthenticated && user?.role === 'admin',
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleIdeogramAnalysis = async () => {
    if (!ideogramUrl.trim()) {
      toast({
        title: "Hata",
        description: "Lütfen geçerli bir Ideogram linki girin",
        variant: "destructive",
      });
      return;
    }

    if (!ideogramUrl.includes('ideogram.ai/g/')) {
      toast({
        title: "Hata", 
        description: "Geçerli bir Ideogram linki değil",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);

    try {
      const response = await apiRequest('POST', '/api/admin/analyze-ideogram-sample', {
        url: ideogramUrl
      });

      if (response.success) {
        toast({
          title: "Başarılı",
          description: "Ideogram örneği analiz edildi ve template olarak kaydedildi",
        });
        setIdeogramUrl("");
      } else {
        throw new Error(response.message || 'Analiz başarısız');
      }
    } catch (error) {
      toast({
        title: "Hata",
        description: error instanceof Error ? error.message : "Analiz sırasında hata oluştu",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6">
            <div className="flex mb-4 gap-2">
              <AlertCircle className="h-8 w-8 text-red-500" />
              <h1 className="text-2xl font-bold text-gray-900">Access Denied</h1>
            </div>
            <p className="mt-4 text-sm text-gray-600">
              Bu sayfaya erişim yetkiniz bulunmamaktadır.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getRoleBadge = (role: string) => {
    const roleMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      customer: { label: "Müşteri", variant: "default" },
      printer: { label: "Matbaa", variant: "secondary" },
      admin: { label: "Admin", variant: "destructive" }
    };

    const config = roleMap[role] || { label: role, variant: "outline" as const };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-white p-6 rounded-2xl mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-4">
                <Settings className="text-xl" />
              </div>
              <div>
                <h3 className="text-xl font-semibold">Admin Paneli</h3>
                <p className="text-gray-300">Sistem Yönetimi</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-gray-300">Toplam Kullanıcı</p>
              <p className="text-2xl font-bold">{users?.length || 0}</p>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <StatsCard
            title="Toplam Kullanıcı"
            value={stats?.totalUsers || 0}
            icon={<Users className="h-5 w-5 text-blue-600" />}
            color="bg-blue-50"
          />
          <StatsCard
            title="Bekleyen Teklifler"
            value={stats?.pendingQuotes || 0}
            icon={<FileText className="h-5 w-5 text-yellow-600" />}
            color="bg-yellow-50"
          />
          <StatsCard
            title="Aylık Gelir"
            value={`₺${(stats?.monthlyRevenue || 0).toLocaleString()}`}
            icon={<DollarSign className="h-5 w-5 text-green-600" />}
            color="bg-green-50"
          />
          <StatsCard
            title="Tamamlanan İşler"
            value={stats?.completedOrders || 0}
            icon={<CheckCircle className="h-5 w-5 text-purple-600" />}
            color="bg-purple-50"
          />
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Genel Bakış</TabsTrigger>
            <TabsTrigger value="users">Kullanıcılar</TabsTrigger>
            <TabsTrigger value="quotes">Teklifler</TabsTrigger>
            <TabsTrigger value="orders">Siparişler</TabsTrigger>
            <TabsTrigger value="analytics">Analizler</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Kullanıcı Yönetimi</CardTitle>
                <CardDescription>
                  Sistemdeki tüm kullanıcıları görüntüleyin ve yönetin
                </CardDescription>
              </CardHeader>
              <CardContent>
                {usersLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {users?.map((user: any) => (
                      <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                            <User className="h-5 w-5 text-gray-600" />
                          </div>
                          <div>
                            <h4 className="font-medium">{user.firstName} {user.lastName}</h4>
                            <p className="text-sm text-gray-600">{user.email}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant={user.role === 'admin' ? 'destructive' : user.role === 'printer' ? 'default' : 'secondary'}>
                                {user.role === 'admin' ? 'Admin' : user.role === 'printer' ? 'Matbaa' : 'Müşteri'}
                              </Badge>
                              <Badge variant={user.isActive ? 'default' : 'secondary'}>
                                {user.isActive ? 'Aktif' : 'Pasif'}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" className="text-red-600">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="quotes" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Teklif Yönetimi</CardTitle>
                <CardDescription>
                  Gelen teklif taleplerini görüntüleyin ve yanıtlayın
                </CardDescription>
              </CardHeader>
              <CardContent>
                {quotesLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {quotes?.map((quote: any) => (
                      <div key={quote.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h4 className="font-medium">{quote.title}</h4>
                            <p className="text-sm text-gray-600">{quote.description}</p>
                          </div>
                          <Badge variant={quote.status === 'pending' ? 'secondary' : 'default'}>
                            {quote.status === 'pending' ? 'Bekliyor' : 
                             quote.status === 'received_quotes' ? 'Teklifler Alındı' : 
                             quote.status === 'approved' ? 'Onaylandı' : quote.status}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-gray-600">
                            <span>Bütçe: ₺{quote.budget}</span>
                            <span className="ml-4">Tarih: {new Date(quote.createdAt).toLocaleDateString('tr-TR')}</span>
                          </div>
                          {quote.status === 'pending' && (
                            <Button size="sm">
                              Teklif Ver
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Sipariş Yönetimi</CardTitle>
                <CardDescription>
                  Tüm siparişleri görüntüleyin ve takip edin
                </CardDescription>
              </CardHeader>
              <CardContent>
                {ordersLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders?.map((order: any) => (
                      <div key={order.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h4 className="font-medium">Sipariş #{order.id}</h4>
                            <p className="text-sm text-gray-600">Tutar: ₺{order.totalAmount}</p>
                          </div>
                          <Badge variant={order.status === 'completed' ? 'default' : 'secondary'}>
                            {order.status === 'completed' ? 'Tamamlandı' : 
                             order.status === 'in_progress' ? 'Üretimde' : 
                             order.status === 'pending' ? 'Bekliyor' : order.status}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-600">
                          Tarih: {new Date(order.createdAt).toLocaleDateString('tr-TR')}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Son Aktiviteler</CardTitle>
                </CardHeader>
                <CardContent>
                  {activityLoading ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {activity?.map((item: any, index: number) => (
                        <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            {item.type === 'quote' ? (
                              <FileText className="h-4 w-4 text-blue-600" />
                            ) : (
                              <Package className="h-4 w-4 text-green-600" />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">{item.description}</p>
                            <p className="text-xs text-gray-500">
                              {new Date(item.createdAt).toLocaleString('tr-TR')}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Sistem İstatistikleri</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Müşteri Sayısı</span>
                      <span className="text-sm">{stats?.totalCustomers || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Matbaa Sayısı</span>
                      <span className="text-sm">{stats?.totalPrinters || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Toplam Gelir</span>
                      <span className="text-sm">₺{(stats?.totalRevenue || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Bu Ay Gelir</span>
                      <span className="text-sm">₺{(stats?.monthlyRevenue || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Toplam Teklif</span>
                      <span className="text-sm">{stats?.totalQuotes || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Bekleyen Teklifler</span>
                      <span className="text-sm">{stats?.pendingQuotes || 0}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

        {/* Monitoring Tab */}
        <TabsContent value="monitoring">
          <SystemMonitoring />
        </TabsContent>

        {/* Ideogram Management Tab */}
        <TabsContent value="ideogram">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Link className="h-5 w-5 text-purple-500" />
                  Ideogram Örnek Analizi
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600">
                  Ideogram'dan örnek tasarımları analiz ederek prompt şablonları oluşturun.
                  Bu şablonlar tasarım motorunda kullanıcılara sunulacaktır.
                </p>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="ideogram-url">Ideogram Link</Label>
                    <Input
                      id="ideogram-url"
                      value={ideogramUrl}
                      onChange={(e) => setIdeogramUrl(e.target.value)}
                      placeholder="https://ideogram.ai/g/..."
                      className="mt-1"
                    />
                  </div>

                  <Button 
                    onClick={handleIdeogramAnalysis}
                    disabled={isAnalyzing || !ideogramUrl.trim()}
                    className="w-full bg-purple-600 hover:bg-purple-700"
                  >
                    {isAnalyzing ? (
                      <>
                        <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                        Analiz Ediliyor...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Örneği Analiz Et ve Kaydet
                      </>
                    )}
                  </Button>
                </div>

                <Separator />

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Nasıl Kullanılır?</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Ideogram.ai'den kaliteli bir tasarım örneği bulun</li>
                    <li>• Tasarımın linkini yukarıdaki alana yapıştırın</li>
                    <li>• "Analiz Et" butonuna tıklayın</li>
                    <li>• Sistem prompt'u çıkarıp template olarak kaydedecek</li>
                    <li>• Kullanıcılar bu template'i tasarım motorunda görebilecek</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports">
          <ReportsAndAnalytics />
        </TabsContent>
      </Tabs>
      </main>
    </div>
  );
}