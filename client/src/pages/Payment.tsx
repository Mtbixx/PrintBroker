import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  CreditCard, 
  Lock, 
  Check, 
  AlertCircle,
  Building2,
  Users,
  ArrowLeft,
  Gift,
  Star
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { PrintSpinner } from "@/components/PrintingLoaders";

interface PaymentFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  companyName?: string;
  taxNumber?: string;
}

export default function Payment() {
  const [location] = useLocation();
  const searchParams = new URLSearchParams(location.split("?")[1] || "");
  const planType = searchParams.get("plan") || "customer";
  const { toast } = useToast();
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  
  const [formData, setFormData] = useState<PaymentFormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    companyName: "",
    taxNumber: ""
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("credit_card");
  const [selectedAmount, setSelectedAmount] = useState(500);
  const [cardData, setCardData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardName: ''
  });

  const creditAmounts = [
    { amount: 500, bonus: 0, label: "500₺" },
    { amount: 1000, bonus: 50, label: "1000₺", bonusLabel: "+50₺ Bonus" },
    { amount: 2000, bonus: 150, label: "2000₺", bonusLabel: "+150₺ Bonus" },
    { amount: 5000, bonus: 500, label: "5000₺", bonusLabel: "+500₺ Bonus" }
  ];

  const plans = {
    customer: {
      name: "Kredi Yükleme",
      description: "Hesabınıza kredi yükleyin",
      icon: <CreditCard className="h-6 w-6" />,
      isCredit: true
    },
    firm: {
      name: "Firma Paketi",
      price: 2999,
      description: "Aylık abonelik sistemi",
      icon: <Building2 className="h-6 w-6" />,
      features: ["Yoğun müşteri portföyü yönetimi", "Gelişmiş analitik dashboard", "Otomatik sipariş ve teklif yönetimi", "Müşteri CRM entegrasyonu", "Premium öncelikli destek"]
    }
  };

  const currentPlan = plans[planType as keyof typeof plans] || plans.customer;

  const handleInputChange = (field: keyof PaymentFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    const required = ["firstName", "lastName", "email", "phone", "address", "city", "postalCode"];
    
    if (planType === "firm") {
      required.push("companyName", "taxNumber");
    }

    for (const field of required) {
      if (!formData[field as keyof PaymentFormData]) {
        toast({
          title: "Eksik Bilgi",
          description: "Lütfen tüm gerekli alanları doldurun.",
          variant: "destructive",
        });
        return false;
      }
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast({
        title: "Geçersiz E-posta",
        description: "Lütfen geçerli bir e-posta adresi girin.",
        variant: "destructive",
      });
      return false;
    }

    // Phone validation
    const phoneRegex = /^[0-9]{10,11}$/;
    if (!phoneRegex.test(formData.phone.replace(/\s/g, ""))) {
      toast({
        title: "Geçersiz Telefon",
        description: "Lütfen geçerli bir telefon numarası girin.",
        variant: "destructive",
      });
      return false;
    }

    // Card validation for credit card payment
    if (paymentMethod === "credit_card") {
      if (!cardData.cardNumber || cardData.cardNumber.length < 16) {
        toast({
          title: "Geçersiz Kart Numarası",
          description: "Lütfen geçerli bir kart numarası girin.",
          variant: "destructive",
        });
        return false;
      }
      if (!cardData.expiryDate || !cardData.cvv || !cardData.cardName) {
        toast({
          title: "Eksik Kart Bilgisi",
          description: "Lütfen tüm kart bilgilerini doldurun.",
          variant: "destructive",
        });
        return false;
      }
    }

    return true;
  };

  // Load user data automatically
  useEffect(() => {
    if (isAuthenticated && user) {
      setFormData(prev => ({
        ...prev,
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: user.phone || "",
        address: "",
        city: "",
        postalCode: "",
        companyName: user.companyName || "",
        taxNumber: ""
      }));
    }
  }, [isAuthenticated, user]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Giriş Gerekli</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-center text-gray-600">
              Ödeme işlemi için giriş yapmanız gerekiyor.
            </p>
            <div className="space-y-2">
              <Link href="/">
                <Button variant="outline" className="w-full">
                  Ana Sayfaya Dön
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Ana Sayfaya Dön
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">{currentPlan.name}</h1>
          <p className="mt-2 text-gray-600">{currentPlan.description}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Ödeme Bilgileri</CardTitle>
              </CardHeader>
              <CardContent>
                <form className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">Ad</Label>
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) => handleInputChange("firstName", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Soyad</Label>
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) => handleInputChange("lastName", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">E-posta</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefon</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                    />
                  </div>

                  {planType === "firm" && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="companyName">Firma Adı</Label>
                        <Input
                          id="companyName"
                          value={formData.companyName}
                          onChange={(e) => handleInputChange("companyName", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="taxNumber">Vergi Numarası</Label>
                        <Input
                          id="taxNumber"
                          value={formData.taxNumber}
                          onChange={(e) => handleInputChange("taxNumber", e.target.value)}
                        />
                      </div>
                    </>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="address">Adres</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => handleInputChange("address", e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">Şehir</Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) => handleInputChange("city", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="postalCode">Posta Kodu</Label>
                      <Input
                        id="postalCode"
                        value={formData.postalCode}
                        onChange={(e) => handleInputChange("postalCode", e.target.value)}
                      />
                    </div>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Ödeme Yöntemi</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Ödeme Yöntemi Seçin</Label>
                    <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                      <SelectTrigger>
                        <SelectValue placeholder="Ödeme yöntemi seçin" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="credit_card">
                          <div className="flex items-center">
                            <CreditCard className="mr-2 h-4 w-4" />
                            Kredi Kartı
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {paymentMethod === "credit_card" && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="cardName">Kart Üzerindeki İsim</Label>
                        <Input
                          id="cardName"
                          value={cardData.cardName}
                          onChange={(e) => setCardData(prev => ({ ...prev, cardName: e.target.value }))}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="cardNumber">Kart Numarası</Label>
                        <Input
                          id="cardNumber"
                          value={cardData.cardNumber}
                          onChange={(e) => setCardData(prev => ({ ...prev, cardNumber: e.target.value }))}
                          maxLength={16}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="expiryDate">Son Kullanma Tarihi</Label>
                          <Input
                            id="expiryDate"
                            placeholder="AA/YY"
                            value={cardData.expiryDate}
                            onChange={(e) => setCardData(prev => ({ ...prev, expiryDate: e.target.value }))}
                            maxLength={5}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="cvv">CVV</Label>
                          <Input
                            id="cvv"
                            type="password"
                            value={cardData.cvv}
                            onChange={(e) => setCardData(prev => ({ ...prev, cvv: e.target.value }))}
                            maxLength={3}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {currentPlan.isCredit && (
                    <div className="space-y-4">
                      <Label>Kredi Miktarı</Label>
                      <div className="grid grid-cols-2 gap-4">
                        {creditAmounts.map((item) => (
                          <Button
                            key={item.amount}
                            variant={selectedAmount === item.amount ? "default" : "outline"}
                            className="h-auto py-4"
                            onClick={() => setSelectedAmount(item.amount)}
                          >
                            <div className="flex flex-col items-center">
                              <span className="font-semibold">{item.label}</span>
                              {item.bonusLabel && (
                                <span className="text-xs text-green-600 mt-1">{item.bonusLabel}</span>
                              )}
                            </div>
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}

                  <Separator />

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Toplam Tutar:</span>
                      <span className="font-semibold">
                        {currentPlan.isCredit ? `${selectedAmount}₺` : `${currentPlan.price}₺`}
                      </span>
                    </div>
                    {currentPlan.isCredit && selectedAmount >= 1000 && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Bonus:</span>
                        <span>
                          +{creditAmounts.find(item => item.amount === selectedAmount)?.bonus}₺
                        </span>
                      </div>
                    )}
                  </div>

                  <Button
                    className="w-full"
                    disabled={isLoading}
                    onClick={() => {
                      if (validateForm()) {
                        // Handle payment
                      }
                    }}
                  >
                    {isLoading ? (
                      <PrintSpinner className="mr-2 h-4 w-4" />
                    ) : (
                      <Lock className="mr-2 h-4 w-4" />
                    )}
                    {isLoading ? "İşleniyor..." : "Ödemeyi Tamamla"}
                  </Button>

                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Ödeme bilgileriniz güvenli bir şekilde işlenmektedir.
                    </AlertDescription>
                  </Alert>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
} 