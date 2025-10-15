import { Button } from '@/components/ui/button';
import { Home, Calendar, Users, User, LogOut } from 'lucide-react';
import { User as UserType } from '@/types';

interface NavigationProps {
  currentUser?: UserType;
  currentPage: 'dashboard' | 'matching' | 'profile';
  onLogout: () => void;
  onNavigate: (page: 'dashboard' | 'matching' | 'profile') => void;
}

export default function Navigation({ currentUser, currentPage, onLogout, onNavigate }: NavigationProps) {
  const navItems = [
    { key: 'dashboard' as const, icon: Home, label: '홈' },
    { key: 'matching' as const, icon: Users, label: '매칭' },
    { key: 'profile' as const, icon: User, label: '프로필' }
  ];

  return (
    <nav className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-1">
          <Calendar className="w-8 h-8 text-red-500" />
          <h1 className="text-xl font-bold text-gray-900">에브리라이스</h1>
        </div>

        <div className="flex items-center space-x-1">
          {navItems.map((item) => (
            <Button
              key={item.key}
              variant={currentPage === item.key ? "default" : "ghost"}
              size="sm"
              onClick={() => onNavigate(item.key)}
              className="flex items-center space-x-2"
            >
              <item.icon className="w-4 h-4" />
              <span>{item.label}</span>
            </Button>
          ))}
        </div>

        <div className="flex items-center space-x-3">
          {currentUser && (
            <span className="text-sm text-gray-600">
              {currentUser.name}님
            </span>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={onLogout}
            className="flex items-center space-x-2"
          >
            <LogOut className="w-4 h-4" />
            <span>로그아웃</span>
          </Button>
        </div>
      </div>
    </nav>
  );
}