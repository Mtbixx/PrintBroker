
interface ErrorEvent {
  timestamp: Date;
  level: 'error' | 'warning' | 'info';
  endpoint: string;
  message: string;
  userId?: string;
  stack?: string;
}

class EnhancedMonitoring {
  private errors: ErrorEvent[] = [];
  private maxErrors = 1000;

  logError(error: ErrorEvent) {
    this.errors.unshift(error);
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(0, this.maxErrors);
    }
    
    // Console logging
    console.error(`[${error.level.toUpperCase()}] ${error.endpoint}: ${error.message}`);
  }

  getErrorStats() {
    const last24h = this.errors.filter(e => 
      Date.now() - e.timestamp.getTime() < 24 * 60 * 60 * 1000
    );
    
    return {
      totalErrors: this.errors.length,
      last24h: last24h.length,
      errorRate: (last24h.length / 1440) * 100, // errors per minute
      topEndpoints: this.getTopErrorEndpoints(last24h)
    };
  }

  private getTopErrorEndpoints(errors: ErrorEvent[]) {
    const counts = errors.reduce((acc, error) => {
      acc[error.endpoint] = (acc[error.endpoint] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(counts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);
  }
}

export const monitoring = new EnhancedMonitoring();
