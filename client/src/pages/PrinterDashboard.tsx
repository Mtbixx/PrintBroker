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
  Bell
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

    // Additional role check
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
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Genel Bakış</TabsTrigger>
            <TabsTrigger value="quotes">Teklifler</TabsTrigger>
            <TabsTrigger value="orders">Siparişler</TabsTrigger>
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