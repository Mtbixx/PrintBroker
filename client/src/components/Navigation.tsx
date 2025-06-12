import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Link, useLocation } from "wouter";
import {
  Home,
  FileText,
  Plus,
  Building2,
  Users,
  Settings,
  LogOut,
  Menu,
  CreditCard,
  Star,
  BarChart3,
  Bell
} from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export default function Navigation() {
  const { user, logout } = useAuth();
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const queryClient = useQueryClient();

  // Fetch notifications
  const { data: notificationsData } = useQuery({
    queryKey: ["/api/notifications"],
    enabled: !!user?.id,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const notifications = notificationsData?.notifications || [];
  const unreadCount = notifications.filter((n: any) => !n.isRead).length;

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  if (!user) return null;

  const handleLogout = async () => {
    try {
      //await logout.mutateAsync(); // Assuming logout is a mutation function from useMutation hook
      window.location.href = "/api/logout"; // temporary solution without mutation func
    } catch (error) {
      console.error('Logout failed:', error);
      // Force logout even if request fails
      window.location.href = '/';
    }
  };

  const getNavigationItems = () => {
    // Determine the correct home URL based on user role
    const getHomeUrl = () => {
      switch (user.role) {
        case 'customer':
          return "/customer-dashboard";
        case 'printer':
          return "/printer-dashboard";
        case 'admin':
          return "/admin-dashboard";
        default:
          return "/";
      }
    };

    const homeUrl = getHomeUrl();
    const baseItems = [
      {
        href: homeUrl,
        label: "Ana Sayfa",
        icon: <Home className="h-4 w-4" />,
        active: location === homeUrl || (location === "/" && user.role)
      },
    ];

    switch (user.role) {
      case 'customer':
        return [
          ...baseItems,
          {
            href: "/customer-dashboard",
            label: "Dashboard",
            icon: <BarChart3 className="h-4 w-4" />,
            active: location === "/customer-dashboard"
          },
        ];

      case 'printer':
        return [
          ...baseItems,
          {
            href: "/printer-dashboard",
            label: "Dashboard",
            icon: <Building2 className="h-4 w-4" />,
            active: location === "/printer-dashboard"
          },
        ];

      case 'admin':
        return [
          ...baseItems,
          {
            href: "/admin-dashboard",
            label: "Admin Panel",
            icon: <Users className="h-4 w-4" />,
            active: location === "/admin-dashboard"
          },
        ];

      default:
        return baseItems;
    }
  };

  const navigationItems = getNavigationItems();

  const getUserDisplayName = () => {
    if (user.companyName && user.role === 'printer') {
      return user.companyName;
    }
    return `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email;
  };

  const getUserInitials = () => {
    if (user.companyName && user.role === 'printer') {
      return user.companyName.charAt(0).toUpperCase();
    }
    const firstName = user.firstName || '';
    const lastName = user.lastName || '';
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || 'U';
  };

  const getRoleBadgeColor = () => {
    switch (user.role) {
      case 'customer':
        return 'bg-blue-100 text-blue-800';
      case 'printer':
        return 'bg-orange-100 text-orange-800';
      case 'admin':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleLabel = () => {
    switch (user.role) {
      case 'customer':
        return 'Müşteri';
      case 'printer':
        return 'Matbaa';
      case 'admin':
        return 'Admin';
      default:
        return 'Kullanıcı';
    }
  };

  const DesktopNavigation = () => (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/">
            <div className="flex items-center cursor-pointer">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg flex items-center justify-center mr-3 shadow-lg">
                <span className="text-white font-bold text-xl">M</span>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">Matbixx</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-1">
            {navigationItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={item.active ? "default" : "ghost"}
                  className={`flex items-center px-3 py-2 text-sm font-medium transition-colors ${
                    item.active
                      ? "bg-primary text-white"
                      : "text-gray-700 hover:text-primary hover:bg-gray-100"
                  }`}
                >
                  {item.icon}
                  <span className="ml-2">{item.label}</span>
                </Button>
              </Link>
            ))}
          </nav>

          {/* Quick Actions & User Menu */}
          <div className="flex items-center space-x-4">
            {user && (
              <>
                {/* Notifications Dropdown */}
                <DropdownMenu open={isNotificationOpen} onOpenChange={setIsNotificationOpen}>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
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
                  <DropdownMenuContent className="w-80" align="end">
                    <DropdownMenuLabel className="font-semibold">
                      Bildirimler
                      {unreadCount > 0 && (
                        <Badge variant="secondary" className="ml-2">
                          {unreadCount} yeni
                        </Badge>
                      )}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />

                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-gray-500">
                        <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Henüz bildiriminiz yok</p>
                      </div>
                    ) : (
                      <div className="max-h-96 overflow-y-auto">
                        {notifications.slice(0, 10).map((notification: any) => (
                          <DropdownMenuItem
                            key={notification.id}
                            className={`p-3 cursor-pointer border-b last:border-b-0 ${
                              !notification.isRead ? 'bg-blue-50 hover:bg-blue-100' : 'hover:bg-gray-50'
                            }`}
                            onClick={() => markAsRead(notification.id)}
                          >
                            <div className="flex flex-col w-full">
                              <div className="flex items-start justify-between">
                                <h4 className={`text-sm font-medium ${
                                  !notification.isRead ? 'text-blue-900' : 'text-gray-900'
                                }`}>
                                  {notification.title}
                                </h4>
                                {!notification.isRead && (
                                  <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1" />
                                )}
                              </div>
                              <p className="text-xs text-gray-600 mt-1">
                                {notification.message}
                              </p>
                              <span className="text-xs text-gray-400 mt-1">
                                {new Date(notification.createdAt).toLocaleString('tr-TR')}
                              </span>
                            </div>
                          </DropdownMenuItem>
                        ))}
                      </div>
                    )}

                    {notifications.length > 10 && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="p-2 text-center text-blue-600 hover:text-blue-800">
                          Tüm bildirimleri gör
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* User Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.profileImageUrl || undefined} />
                        <AvatarFallback className="text-xs">
                          {getUserInitials()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end">
                    <DropdownMenuLabel>
                      <div>
                        <p className="font-medium">{getUserDisplayName()}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />

                    {user.role === 'customer' && (
                      <>
                        <DropdownMenuItem>
                          <CreditCard className="h-4 w-4 mr-2" />
                          Kredi: ₺{parseFloat(user.creditBalance || '0').toFixed(2)}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                      </>
                    )}

                    {user.role === 'printer' && (
                      <>
                        <DropdownMenuItem>
                          <Star className="h-4 w-4 mr-2" />
                          Puan: {user.rating || '0.0'}
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Building2 className="h-4 w-4 mr-2" />
                          {user.subscriptionStatus === 'active' ? 'Premium Üye' : 'Temel Üye'}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                      </>
                    )}

                    <DropdownMenuItem>
                      <Settings className="h-4 w-4 mr-2" />
                      Ayarlar
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                      <LogOut className="h-4 w-4 mr-2" />
                      Çıkış Yap
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );

  const MobileNavigation = () => (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40 md:hidden">
      <div className="px-4 sm:px-6">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/">
            <div className="flex items-center cursor-pointer">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg flex items-center justify-center mr-2 shadow-lg">
                <span className="text-white font-bold text-lg">M</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">Matbixx</span>
            </div>
          </Link>

          {/* Mobile Menu */}
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <SheetHeader>
                <SheetTitle className="text-left">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.profileImageUrl || undefined} />
                      <AvatarFallback>{getUserInitials()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{getUserDisplayName()}</p>
                      <Badge className={`text-xs ${getRoleBadgeColor()}`}>
                        {getRoleLabel()}
                      </Badge>
                    </div>
                  </div>
                </SheetTitle>
              </SheetHeader>

              <div className="mt-6 space-y-1">
                {navigationItems.map((item) => (
                  <Link key={item.href} href={item.href}>
                    <Button
                      variant={item.active ? "default" : "ghost"}
                      className={`w-full justify-start ${
                        item.active
                          ? "bg-primary text-white"
                          : "text-gray-700 hover:text-primary hover:bg-gray-100"
                      }`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {item.icon}
                      <span className="ml-2">{item.label}</span>
                    </Button>
                  </Link>
                ))}

                <div className="pt-4 space-y-1">
                  {user.role === 'customer' && (
                    <div className="flex items-center px-3 py-2 text-sm text-gray-600">
                      <CreditCard className="h-4 w-4 mr-2" />
                      Kredi: ₺{parseFloat(user.creditBalance || '0').toFixed(2)}
                    </div>
                  )}

                  {user.role === 'printer' && (
                    <>
                      <div className="flex items-center px-3 py-2 text-sm text-gray-600">
                        <Star className="h-4 w-4 mr-2" />
                        Puan: {user.rating || '0.0'}
                      </div>
                      <div className="flex items-center px-3 py-2 text-sm text-gray-600">
                        <Building2 className="h-4 w-4 mr-2" />
                        {user.subscriptionStatus === 'active' ? 'Premium Üye' : 'Temel Üye'}
                      </div>
                    </>
                  )}

                  <Button
                    variant="ghost"
                    className="w-full justify-start text-gray-700"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Ayarlar
                  </Button>

                  <Button
                    variant="ghost"
                    className="w-full justify-start text-red-600"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Çıkış Yap
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );

  return (
    <>
      <DesktopNavigation />
      <MobileNavigation />
    </>
  );
}