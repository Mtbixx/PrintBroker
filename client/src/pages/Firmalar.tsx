import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Building2,
  Search,
  Filter,
  MapPin,
  Phone,
  Mail,
  Globe,
  Calendar,
  Users,
  Star,
  Verified,
  Trophy,
  Award,
  TrendingUp,
  Eye,
  MessageCircle,
  FileText,
  CheckCircle,
  Clock,
  AlertTriangle,
  Crown
} from "lucide-react";
import Navigation from "@/components/Navigation";

interface Company {
  id: string;
  companyName: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: 'printer' | 'customer' | 'admin';
  isActive: boolean;
  createdAt: string;
  companyAddress?: string;
  taxNumber?: string;
  website?: string;
  description?: string;
  profileImageUrl?: string;
  subscriptionStatus: string;
  creditBalance: string;
  verificationStatus?: 'verified' | 'pending' | 'rejected';
  specialties?: string[];
  employeeCount?: string;
  foundedYear?: string;
  rating?: number;
  totalProjects?: number;
  completionRate?: number;
}

export default function Firmalar() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState<'all' | 'printer' | 'customer'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'rating' | 'projects' | 'date'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const queryClient = useQueryClient();

  // Function to refresh data
  const refreshData = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
  };

  const { data: companies = [], isLoading, error, refetch } = useQuery({
    queryKey: ["/api/admin/users"],
    queryFn: async () => {
      const response = await fetch("/api/admin/users");
      if (!response.ok) {
        throw new Error('Failed to fetch companies');
      }
      const data = await response.json();
      console.log('🔍 API Response Data:', data);
      console.log('🔍 Is Array?', Array.isArray(data));
      console.log('🔍 Data Length:', data?.length);

      // Ensure we always return an array
      const validData = Array.isArray(data) ? data : [];
      console.log('🔍 Valid Data:', validData);

      return validData;
    },
    refetchInterval: 30000,
  });

  const printerCompanies = companies.filter((c: Company) => c && c.role === 'printer');
  const customerCompanies = companies.filter((c: Company) => c && c.role === 'customer');
  const adminUsers = companies.filter((c: Company) => c && c.role === 'admin');

  // Filter companies to show only "Ala Etiket" and filter based on search
  const filteredCompanies = printerCompanies.filter(company => {
    // Only show "Ala Etiket" company
    if (company.companyName !== "Ala Etiket") {
      return false;
    }

    const matchesSearch = company.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         company.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         company.lastName?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = filterRole === 'all' || company.role === filterRole;

    return matchesSearch && matchesRole;
  });


  console.log('📊 Company Stats:', {
    totalCompanies: companies.length,
    printerCompanies: printerCompanies.length,
    customerCompanies: customerCompanies.length,
    adminUsers: adminUsers.length,
    filteredCompanies: filteredCompanies.length,
    searchTerm,
    rawCompanies: companies
  });

  const getCompanyInitials = (company: Company) => {
    if (company.companyName) {
      return company.companyName.split(' ').map(word => word[0]).join('').substring(0, 2).toUpperCase();
    }
    return `${company.firstName?.[0] || ''}${company.lastName?.[0] || ''}`.toUpperCase();
  };

  const getVerificationBadge = (company: Company) => {
    const status = company.verificationStatus || 'pending';
    switch (status) {
      case 'verified':
        return <Badge className="bg-green-100 text-green-800 border-green-200"><Verified className="h-3 w-3 mr-1" />Doğrulandı</Badge>;
      case 'pending':
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Beklemede</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><AlertTriangle className="h-3 w-3 mr-1" />Reddedildi</Badge>;
      default:
        return <Badge variant="outline">Belirsiz</Badge>;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'printer':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200"><Building2 className="h-3 w-3 mr-1" />Matbaa</Badge>;
      case 'customer':
        return <Badge className="bg-purple-100 text-purple-800 border-purple-200"><Users className="h-3 w-3 mr-1" />Müşteri</Badge>;
      case 'admin':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200"><Crown className="h-3 w-3 mr-1" />Admin</Badge>;
      default:
        return <Badge variant="outline">Bilinmiyor</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 bg-gray-300 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    console.error('🚨 Error loading companies:', error);
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Veri Yükleme Hatası</h2>
            <p className="text-gray-600 mb-2">Firmalar yüklenirken bir hata oluştu.</p>
            <p className="text-sm text-red-500 mb-6">{error?.message || 'Bilinmeyen hata'}</p>
            <Button onClick={() => refetch()} variant="outline">
              Tekrar Dene
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Debug: Show data state
  console.log('🔧 Current component state:', {
    companiesLength: companies.length,
    isLoading,
    hasError: !!error,
    filteredCount: filteredCompanies.length
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      <Navigation />

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Premium Header */}
        <div className="relative bg-gradient-to-r from-blue-900 via-purple-900 to-indigo-900 text-white rounded-3xl p-8 mb-8 overflow-hidden">
          <div className="absolute inset-0 bg-black bg-opacity-20"></div>
          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
              <div className="text-center lg:text-left">
                <h1 className="text-4xl lg:text-5xl font-bold mb-4">
                  <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                    Firmalar
                  </span>
                </h1>
                <p className="text-xl lg:text-2xl text-blue-100 mb-2">
                  Kayıtlı {printerCompanies.length} matbaa firması
                </p>
                <p className="text-blue-200">
                  Premium üye ağımızdaki tüm aktif firmalar
                </p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{printerCompanies.length}</div>
                <div className="text-sm text-gray-600">Kayıtlı Matbaa Firması</div>
              </div>
              <div className="text-center">
                <div className="grid grid-cols-1 gap-4">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-blue-400">{printerCompanies.length}</div>
                    <div className="text-lg text-blue-200">Aktif Matbaa Firması</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Advanced Filters */}
        <Card className="mb-8 shadow-xl border-0 bg-white/70 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4 items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  placeholder="Firma adı, kişi adı veya e-posta ile ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-12 text-lg border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

            </div>

            <div className="flex items-center justify-between mt-4">
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={sortBy === 'name' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => {
                      if (sortBy === 'name') {
                        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                      } else {
                        setSortBy('name');
                        setSortOrder('asc');
                      }
                    }}
                    className="flex items-center gap-1"
                  >
                    A-Z Sırala
                    {sortBy === 'name' && (
                      <span className="text-xs">
                        {sortOrder === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </Button>
              <Button
                variant={sortBy === 'rating' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => {
                  if (sortBy === 'rating') {
                    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                  } else {
                    setSortBy('rating');
                    setSortOrder('desc'); // Yüksek puan önce
                  }
                }}
                className="flex items-center gap-1"
              >
                <Star className="h-3 w-3 mr-1" />
                Puana Göre
                {sortBy === 'rating' && (
                  <span className="text-xs">
                    {sortOrder === 'desc' ? '↓' : '↑'}
                  </span>
                )}
              </Button>
              <Button
                variant={sortBy === 'projects' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => {
                  if (sortBy === 'projects') {
                    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                  } else {
                    setSortBy('projects');
                    setSortOrder('desc'); // Fazla proje önce
                  }
                }}
                className="flex items-center gap-1"
              >
                <Trophy className="h-3 w-3 mr-1" />
                Proje Sayısı
                {sortBy === 'projects' && (
                  <span className="text-xs">
                    {sortOrder === 'desc' ? '↓' : '↑'}
                  </span>
                )}
              </Button>
              <Button
                variant={sortBy === 'date' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => {
                  if (sortBy === 'date') {
                    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                  } else {
                    setSortBy('date');
                    setSortOrder('desc'); // Yeni kayıtlar önce
                  }
                }}
                className="flex items-center gap-1"
              >
                <Calendar className="h-3 w-3 mr-1" />
                Kayıt Tarihi
                {sortBy === 'date' && (
                  <span className="text-xs">
                    {sortOrder === 'desc' ? '↓' : '↑'}
                  </span>
                )}
                  </Button>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={refreshData}
                  disabled={isLoading}
                  className="flex items-center gap-2"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Yenile
                </Button>
              </div>
          </CardContent>
        </Card>

        {/* Companies Grid */}
        {isLoading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
            <p className="ml-4 text-lg text-gray-600">Firmalar yükleniyor...</p>
          </div>
        ) : companies.length === 0 ? (
          <div className="text-center py-16">
            <Building2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Henüz kayıtlı firma bulunmuyor</h3>
            <p className="text-gray-500">Sistem kullanıma alındığında kayıtlı firmalar burada görünecektir.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCompanies.map((company: Company) => (
              <Card key={company.id} className="group hover:shadow-2xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm hover:bg-white/95 cursor-pointer transform hover:-translate-y-1">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-14 w-14 ring-4 ring-blue-100 group-hover:ring-blue-200 transition-all">
                        <AvatarImage src={company.profileImageUrl} />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold text-lg">
                          {getCompanyInitials(company)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-lg text-gray-900 truncate group-hover:text-blue-700 transition-colors">
                          {company.companyName || `${company.firstName} ${company.lastName}`}
                        </h3>
                        <p className="text-sm text-gray-600 truncate">
                          {company.firstName} {company.lastName}
                        </p>
                        <div className="flex gap-1 mt-1">
                          {getRoleBadge(company.role)}
                          {getVerificationBadge(company)}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 mb-1">
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        <span className="font-semibold text-gray-700">
                          {company.rating || 
                            // Consistent mock rating based on company ID for stable sorting
                            (4.0 + ((company.id?.charCodeAt(company.id.length - 1) || 0) % 10) / 10).toFixed(1)
                          }
                        </span>
                      </div>
                      {company.role === 'printer' && (
                        <Badge variant="outline" className="text-xs">
                          <Trophy className="h-3 w-3 mr-1" />
                          {company.totalProjects || 
                            // Consistent mock data based on company ID for stable sorting
                            Math.floor((company.id?.charCodeAt(company.id.length - 1) || 0) % 50) + 10
                          } proje
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>

                
<CardContent className="p-4">
                  <div className="space-y-4">
                    {/* Company Header */}
                    <div className="text-center">
                      <h3 className="font-bold text-xl text-gray-900 leading-tight mb-3">
                        {company.companyName || `${company.firstName} ${company.lastName}`}
                      </h3>

                      {/* Rating */}
                      <div className="flex items-center justify-center gap-2 mb-4">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-5 w-5 ${
                                i < Math.floor(company.rating || 
                                  // Consistent rating based on company ID
                                  (4.0 + ((company.id?.charCodeAt(company.id.length - 1) || 0) % 10) * 0.1)
                                )
                                  ? 'text-yellow-400 fill-current'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-lg font-semibold text-gray-700">
                          {(company.rating || 
                            // Consistent rating based on company ID
                            (4.0 + ((company.id?.charCodeAt(company.id.length - 1) || 0) % 10) * 0.1)
                          ).toFixed(1)}
                        </span>
                      </div>
                    </div>

                    {/* Completed Projects Count */}
                    <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg text-center">
                      <div className="text-3xl font-bold text-green-700 mb-1">
                        {company.totalProjects || 
                          // Consistent project count based on company ID
                          (10 + ((company.id?.charCodeAt(company.id.length - 4) || 0) % 40))
                        }
                      </div>
                      <div className="text-sm text-gray-600">Tamamlanan Proje</div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        className="flex-1"
                        onClick={() => setSelectedCompany(company)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Detayları Gör
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {filteredCompanies.length === 0 && !isLoading && (
          <div className="text-center py-16">
            <Building2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Firma bulunamadı</h3>
            <p className="text-gray-500">Arama kriterlerinize uygun firma bulunamadı</p>
          </div>
        )}
      </main>
    </div>
  );
}