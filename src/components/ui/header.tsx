
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Home, BarChart2, FileText, Settings } from 'lucide-react';

export const Header: React.FC = () => {
  const location = useLocation();
  
  const navItems = [
    { path: '/', label: 'Dashboard', icon: <Home className="h-4 w-4 mr-2" /> },
    { path: '/applications', label: 'Applications', icon: <BarChart2 className="h-4 w-4 mr-2" /> },
    { path: '/resume', label: 'Resume', icon: <FileText className="h-4 w-4 mr-2" /> },
    { path: '/settings', label: 'Settings', icon: <Settings className="h-4 w-4 mr-2" /> },
  ];

  return (
    <header className="w-full py-4 px-6 bg-background/80 backdrop-blur-lg border-b border-border sticky top-0 z-10 animate-fade-in">
      <div className="container max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1">
            <Link 
              to="/" 
              className="text-lg font-medium flex items-center transition-colors hover:text-primary"
            >
              <span className="sr-only">Application Automator</span>
              <div className="w-8 h-8 rounded-md bg-primary/10 text-primary flex items-center justify-center mr-2">
                <span className="font-bold">A</span>
              </div>
              <span className="font-semibold tracking-tight">Application Automator</span>
            </Link>
          </div>
          
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link 
                key={item.path} 
                to={item.path}
                className={cn(
                  "px-3 py-2 rounded-md text-sm font-medium flex items-center",
                  location.pathname === item.path 
                    ? "bg-secondary text-primary" 
                    : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                )}
              >
                {item.icon}
                {item.label}
              </Link>
            ))}
          </nav>
          
          <div className="flex items-center">
            <div className="h-7 w-7 rounded-full glass-panel flex items-center justify-center shadow-subtle overflow-hidden">
              <div className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-medium">
                U
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
