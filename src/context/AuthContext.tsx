import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { auth } from '../firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import { getUserProfile, getUserPermissions } from '../services/authService';
import { UserProfile, UserRole } from '../types/auth';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  hasPermission: (permission: string) => boolean;
  userPermissions: string[];
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  loading: true,
  hasPermission: () => false,
  userPermissions: [],
  isAdmin: false,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [userPermissions, setUserPermissions] = useState<string[]>([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      
      if (user) {
        try {
          const profile = await getUserProfile(user.uid);
          setUserProfile(profile);
          
          if (profile) {
            const permissions = getUserPermissions(profile.role);
            setUserPermissions(permissions);
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
        }
      } else {
        setUserProfile(null);
        setUserPermissions([]);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const hasPermission = (permission: string): boolean => {
    return userPermissions.includes(permission);
  };

  const isAdmin = userProfile?.role === 'admin';

  const value = {
    user,
    userProfile,
    loading,
    hasPermission,
    userPermissions,
    isAdmin,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Higher-order component for protecting routes based on permissions
export const withPermission = (
  WrappedComponent: React.ComponentType<any>,
  requiredPermission: string
) => {
  return (props: any) => {
    const { hasPermission, loading } = useAuth();

    if (loading) {
      return <div>Loading...</div>;
    }

    if (!hasPermission(requiredPermission)) {
      return <div>Access Denied</div>;
    }

    return <WrappedComponent {...props} />;
  };
}; 