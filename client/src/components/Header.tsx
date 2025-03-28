import React from 'react';

type HeaderProps = {
  title?: string;
  subtitle?: string;
};

const Header: React.FC<HeaderProps> = ({ 
  title = 'Code Analyzer', 
  subtitle = 'AI-powered code analysis and fixing' 
}) => {
  return (
    <header className="header">
      <h1>{title}</h1>
      <p className="subtitle">{subtitle}</p>
    </header>
  );
};

export default Header; 