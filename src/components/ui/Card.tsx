import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '', title, subtitle }) => {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6 transition-colors ${className}`}>
      {title && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
          {subtitle && (
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{subtitle}</p>
          )}
        </div>
      )}
      {children}
    </div>
  );
};

export default Card;
