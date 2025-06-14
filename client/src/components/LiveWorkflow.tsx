import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';

interface Quote {
  id: string;
  title: string;
  status: string;
  amount: number;
  location: string;
  time: string;
}

export const LiveWorkflow: React.FC = () => {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLiveQuotes = async () => {
      try {
        const response = await fetch('/api/quotes/live-feed');
        const data = await response.json();

        if (!data.success) {
          throw new Error(data.message);
        }

        setQuotes(data.data);
      } catch (err: any) {
        setError(err.message || 'Veriler yüklenirken bir hata oluştu');
      } finally {
        setLoading(false);
      }
    };

    fetchLiveQuotes();
    const interval = setInterval(fetchLiveQuotes, 30000); // Her 30 saniyede bir güncelle

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500';
      case 'in_progress':
        return 'bg-blue-500';
      case 'quality_check':
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Beklemede';
      case 'in_progress':
        return 'İşlemde';
      case 'quality_check':
        return 'Kalite Kontrol';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Canlı İş Akışı</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">Yükleniyor...</div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Canlı İş Akışı</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-red-500 py-4">{error}</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Canlı İş Akışı</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {quotes.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              Şu anda aktif iş akışı bulunmuyor
            </div>
          ) : (
            quotes.map((quote) => (
              <div
                key={quote.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex-1">
                  <h3 className="font-medium">{quote.title}</h3>
                  <p className="text-sm text-gray-500">
                    {quote.location} • {formatDistanceToNow(new Date(quote.time), { addSuffix: true, locale: tr })}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-lg font-semibold">
                    {quote.amount.toLocaleString('tr-TR')} ₺
                  </span>
                  <Badge className={getStatusColor(quote.status)}>
                    {getStatusText(quote.status)}
                  </Badge>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}; 