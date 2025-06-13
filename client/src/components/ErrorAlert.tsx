import React from 'react';

type ErrorAlertProps = {
  message: string;
};

const ErrorAlert: React.FC<ErrorAlertProps> = ({ message }) => (
  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative my-2" role="alert">
    <strong className="font-bold">Hata: </strong>
    <span className="block sm:inline">{message}</span>
  </div>
);

export default ErrorAlert; 