import React from 'react';

interface CardProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({ children, title, className = '', onClick }) => {
  return (
    <div 
      className={`bg-white rounded-lg shadow-sm border border-nihal-silver ${className}`}
      onClick={onClick}
    >
      {title && (
        <div className="px-6 py-4 border-b border-nihal-silver">
          <h3 className="text-lg font-semibold text-nihal-blue">{title}</h3>
        </div>
      )}
      <div className="p-6">
        {children}
      </div>
    </div>
  );
};

export default Card;