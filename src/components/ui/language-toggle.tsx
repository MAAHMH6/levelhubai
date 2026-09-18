import { Button } from '@/components/ui/button';
import { Languages } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export const LanguageToggle = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9">
          <Languages className="h-4 w-4" />
          <span className="sr-only">Toggle language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem 
          onClick={() => setLanguage('en')}
          className={language === 'en' ? 'bg-primary/10' : ''}
        >
          🇬🇧 English
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setLanguage('ur')}
          className={language === 'ur' ? 'bg-primary/10' : ''}
        >
          🇵🇰 اردو
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
