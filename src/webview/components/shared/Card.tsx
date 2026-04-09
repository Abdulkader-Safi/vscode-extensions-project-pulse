import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({ children, className = "", onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`bg-slate-900 border border-slate-800 rounded-xl p-5 ${
        onClick ? "cursor-pointer hover:border-slate-700 transition-colors" : ""
      } ${className}`}
    >
      {children}
    </div>
  );
};

export default Card;
