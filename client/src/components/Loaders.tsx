
import React from 'react';

interface LoaderProps {
  size?: number;
  color?: string;
}

export const InkDropletsLoader: React.FC<LoaderProps> = ({ 
  size = 24, 
  color = "#3B82F6" 
}) => {
  return (
    <div className="flex items-center justify-center">
      <div 
        className="animate-spin rounded-full border-4 border-gray-200 border-t-current"
        style={{ 
          width: size, 
          height: size, 
          borderTopColor: color 
        }}
      />
    </div>
  );
};

export const RollingPaperLoader: React.FC<LoaderProps> = ({ 
  size = 24, 
  color = "#3B82F6" 
}) => {
  return (
    <div className="flex items-center justify-center">
      <div 
        className="animate-pulse rounded-full bg-current"
        style={{ 
          width: size, 
          height: size, 
          backgroundColor: color 
        }}
      />
    </div>
  );
};

export const PrinterLoader: React.FC<LoaderProps> = ({ 
  size = 24, 
  color = "#3B82F6" 
}) => {
  return (
    <div className="flex items-center justify-center">
      <div 
        className="animate-bounce rounded-sm bg-current"
        style={{ 
          width: size, 
          height: size * 0.6, 
          backgroundColor: color 
        }}
      />
    </div>
  );
};
