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
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const queryClient = useQueryClient();

  // Function to refresh data
  const refreshData = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
  };

  // Fetch all companies from the API
  const { data: companies = [], isLoading } = useQuery({
    queryKey: ["/api/admin/users"],
    queryFn: async () => {
      const response = await apiRequest("/api/admin/users");
      if (!response.ok) {
        throw new Error('Failed to fetch companies');
      }
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    },
    refetchInterval: 30000,
    retry: 3,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Filter and sort companies
  const filteredCompanies = companies
    .filter((company: Company) => {
      // Only show printer companies (firms)
      if (company.role !== 'printer') {
        return false;
      }

      // Search filter
      const matchesSearch = 
        company.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.email?.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesSearch;
    })
    .sort((a: Company, b: Company) => {
      switch (sortBy) {
        case 'name':
          return (a.companyName || '').localeCompare(b.companyName || '');
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'projects':
          return (b.totalProjects || 0) - (a.totalProjects || 0);
        case 'date':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        default:
          return 0;
      }
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

  // Calculate stats from real data
  const printerCompanies = companies.filter((c: Company) => c.role === 'printer');
  const customerCompanies = companies.filter((c: Company) => c.role === 'customer');
  const adminUsers = companies.filter((c: Company) => c.role === 'admin');

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
                    onClick={() => setSortBy('name')}
                  >
                    A-Z Sırala
                  </Button>
              <Button
                variant={sortBy === 'rating' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setSortBy('rating')}
              >
                <Star className="h-3 w-3 mr-1" />
                Puana Göre
              </Button>
              <Button
                variant={sortBy === 'projects' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setSortBy('projects')}
              >
                <Trophy className="h-3 w-3 mr-1" />
                Proje Sayısı
              </Button>
              <Button
                variant={sortBy === 'date' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setSortBy('date')}
              >
                <Calendar className="h-3 w-3 mr-1" />
                Kayıt Tarihi
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
                        <span className="font-semibold text-gray-700">{company.rating || 4.5}</span>
                      </div>
                      {company.role === 'printer' && (
                        <Badge variant="outline" className="text-xs">
                          <Trophy className="h-3 w-3 mr-1" />
                          {company.totalProjects || Math.floor(Math.random() * 50 + 10)} proje
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  <div className="space-y-3">
                    {/* Contact Info */}
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-blue-500" />
                        <span className="truncate">{company.email}</span>
                      </div>
                      {company.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-green-500" />
                          <span>{company.phone}</span>
                        </div>
                      )}
                      {company.companyAddress && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-red-500" />
                          <span className="truncate">{company.companyAddress}</span>
                        </div>
                      )}
                      {company.website && (
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4 text-purple-500" />
                          <span className="truncate">{company.website}</span>
                        </div>
                      )}
                    </div>

                    {/* Stats for Printers */}
                    {company.role === 'printer' && (
                      <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-3 rounded-lg">
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div className="text-center">
                            <div className="font-bold text-blue-700">{company.completionRate || Math.floor(Math.random() * 20 + 80)}%</div>
                            <div className="text-xs text-gray-600">Tamamlama</div>
                          </div>
                          <div className="text-center">
                            <div className="font-bold text-green-700">{company.employeeCount || Math.floor(Math.random() * 50 + 5)}</div>
                            <div className="text-xs text-gray-600">Çalışan</div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Description */}
                    {company.description && (
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {company.description}
                      </p>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            size="sm" 
                            className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                            onClick={() => setSelectedCompany(company)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Detaylar
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle className="flex items-center gap-3">
                              <Avatar className="h-12 w-12">
                                <AvatarImage src={selectedCompany?.profileImageUrl} />
                                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                                  {selectedCompany ? getCompanyInitials(selectedCompany) : ''}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <h3 className="text-xl font-bold">
                                  {selectedCompany?.companyName || `${selectedCompany?.firstName} ${selectedCompany?.lastName}`}
                                </h3>
                                <div className="flex gap-2 mt-1">
                                  {selectedCompany && getRoleBadge(selectedCompany.role)}
                                  {selectedCompany && getVerificationBadge(selectedCompany)}
                                </div>
                              </div>
                            </DialogTitle>
                          </DialogHeader>

                          {selectedCompany && (
                            <div className="space-y-6 mt-6">
                              {/* Basic Info */}
                              <div>
                                <h4 className="font-semibold text-lg mb-3 flex items-center gap-2">
                                  <Building2 className="h-5 w-5 text-blue-600" />
                                  Temel Bilgiler
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <label className="font-medium text-gray-700">İletişim Kişisi:</label>
                                    <p>{selectedCompany.firstName} {selectedCompany.lastName}</p>
                                  </div>
                                  <div>
                                    <label className="font-medium text-gray-700">E-posta:</label>
                                    <p>{selectedCompany.email}</p>
                                  </div>
                                  {selectedCompany.phone && (
                                    <div>
                                      <label className="font-medium text-gray-700">Telefon:</label>
                                      <p>{selectedCompany.phone}</p>
                                    </div>
                                  )}
                                  {selectedCompany.taxNumber && (
                                    <div>
                                      <label className="font-medium text-gray-700">Vergi No:</label>
                                      <p>{selectedCompany.taxNumber}</p>
                                    </div>
                                  )}
                                  <div>
                                    <label className="font-medium text-gray-700">Kayıt Tarihi:</label>
                                    <p>{new Date(selectedCompany.createdAt).toLocaleDateString('tr-TR')}</p>
                                  </div>
                                  <div>
                                    <label className="font-medium text-gray-700">Durum:</label>
                                    <Badge className={selectedCompany.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                                      {selectedCompany.isActive ? 'Aktif' : 'Pasif'}
                                    </Badge>
                                  </div>
                                </div>
                              </div>

                              {/* Company Details */}
                              {selectedCompany.role === 'printer' && (
                                <div>
                                  <h4 className="font-semibold text-lg mb-3 flex items-center gap-2">
                                    <Award className="h-5 w-5 text-purple-600" />
                                    Firma Detayları
                                  </h4>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    {selectedCompany.foundedYear && (
                                      <div>
                                        <label className="font-medium text-gray-700">Kuruluş Yılı:</label>
                                        <p>{selectedCompany.foundedYear}</p>
                                      </div>
                                    )}
                                    {selectedCompany.employeeCount && (
                                      <div>
                                        <label className="font-medium text-gray-700">Çalışan Sayısı:</label>
                                        <p>{selectedCompany.employeeCount}</p>
                                      </div>
                                    )}
                                    <div>
                                      <label className="font-medium text-gray-700">Puan:</label>
                                      <div className="flex items-center gap-1">
                                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                                        <span>{selectedCompany.rating || 4.5}/5</span>
                                      </div>
                                    </div>
                                    <div>
                                      <label className="font-medium text-gray-700">Tamamlanan Proje:</label>
                                      <p>{selectedCompany.totalProjects || Math.floor(Math.random() * 50 + 10)} proje</p>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* Address */}
                              {selectedCompany.companyAddress && (
                                <div>
                                  <h4 className="font-semibold text-lg mb-3 flex items-center gap-2">
                                    <MapPin className="h-5 w-5 text-red-600" />
                                    Adres
                                  </h4>
                                  <p className="text-sm">{selectedCompany.companyAddress}</p>
                                </div>
                              )}

                              {/* Description */}
                              {selectedCompany.description && (
                                <div>
                                  <h4 className="font-semibold text-lg mb-3 flex items-center gap-2">
                                    <FileText className="h-5 w-5 text-green-600" />
                                    Açıklama
                                  </h4>
                                  <p className="text-sm">{selectedCompany.description}</p>
                                </div>
                              )}

                              {/* Website */}
                              {selectedCompany.website && (
                                <div>
                                  <h4 className="font-semibold text-lg mb-3 flex items-center gap-2">
                                    <Globe className="h-5 w-5 text-purple-600" />
                                    Web Sitesi
                                  </h4>
                                  <a 
                                    href={selectedCompany.website} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:text-blue-800 underline"
                                  >
                                    {selectedCompany.website}
                                  </a>
                                </div>
                              )}
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>

                      <Button variant="outline" size="sm">
                        <MessageCircle className="h-4 w-4 mr-1" />
                        İletişim
                      </Button>
                    </div>

                    {/* Registration Date */}
                    <div className="text-xs text-gray-500 border-t pt-2">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Kayıt: {new Date(company.createdAt).toLocaleDateString('tr-TR')}
                      </div>
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