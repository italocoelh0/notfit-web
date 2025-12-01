

// components/SearchPage.tsx
import React, { useState, useMemo } from 'react';
import { UserData } from '../types';

interface SearchPageProps {
  allUsers: UserData[];
  currentUser: UserData;
  onViewProfile: (userId: string) => void;
}

const SearchPage: React.FC<SearchPageProps> = ({ allUsers, currentUser, onViewProfile }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredUsers = useMemo(() => {
    if (!searchTerm.trim()) {
      return [];
    }
    const lowercasedTerm = searchTerm.toLowerCase();
    return allUsers.filter(user =>
      user.id !== currentUser.id &&
      (user.name.toLowerCase().includes(lowercasedTerm) ||
       user.username?.toLowerCase().includes(lowercasedTerm))
    );
  }, [searchTerm, allUsers, currentUser.id]);

  return (
    <div>
      <div className="mb-6">
        <div className="relative">
          <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-secondary"></i>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar usuários..."
            className="w-full bg-surface-100 border border-surface-200 rounded-lg py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {searchTerm && (
        <div>
          {filteredUsers.length > 0 ? (
            <div className="space-y-3">
              {filteredUsers.map(user => (
                <button
                  key={user.id}
                  onClick={() => onViewProfile(user.id)}
                  className="w-full flex items-center gap-4 p-3 bg-surface-100 rounded-lg hover:bg-surface-200 transition-colors text-left"
                >
                  <div className="w-12 h-12 bg-surface-200 rounded-full flex-shrink-0 overflow-hidden">
                    {user.userAvatar.startsWith('data:image') ? (
                      <img src={user.userAvatar} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl">{user.userAvatar}</div>
                    )}
                  </div>
                  <div>
                    <p className="font-semibold">{user.name}</p>
                    <p className="text-sm text-on-surface-secondary">{user.username}</p>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <i className="fa-solid fa-user-slash text-5xl text-on-surface-secondary mb-4"></i>
              <h3 className="font-bold text-xl">Nenhum usuário encontrado</h3>
              <p className="text-on-surface-secondary">Tente buscar por outro nome.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchPage;
