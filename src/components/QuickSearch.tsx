import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Command } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { cn } from '@/lib/utils';

interface QuickSearchProps {
  className?: string;
  placeholder?: string;
  showKeyboardShortcut?: boolean;
  onClick?: () => void;
  readOnly?: boolean;
}

export const QuickSearch = ({ 
  className, 
  placeholder = "Search everything...",
  showKeyboardShortcut = true,
  onClick,
  readOnly = false
}: QuickSearchProps) => {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');

  // Keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleClick = () => {
    if (onClick) {
      onClick();
      return;
    }
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={cn("relative", className)}>
      <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
      <Input
        ref={inputRef}
        placeholder={placeholder}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onClick={handleClick}
        readOnly={readOnly}
        className="h-12 rounded-2xl border-none bg-background/40 pl-12 pr-16 text-sm focus-visible:ring-primary sm:h-14 sm:text-base cursor-pointer"
      />
      {showKeyboardShortcut && (
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1 text-xs text-muted-foreground">
          <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">⌘</kbd>
          <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">K</kbd>
        </div>
      )}
    </form>
  );
};