import React, { createContext, useContext, useState, useEffect } from 'react';

const API_BASE_URL = 'http://127.0.0.1:8000/api/v1';

interface AuthContextType {
  token: string | null;
  user: any | null;
  profile: any | null;
  recommendations: any[];
  recommendationsLoading: boolean;
  loading: boolean;
  authModalOpen: boolean;
  setAuthModalOpen: (open: boolean) => void;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, role: string, department?: string, year?: number) => Promise<void>;
  verifyOtp: (email: string, otp: string) => Promise<void>;
  resendOtp: (email: string) => Promise<void>;
  logout: () => void;
  submitRsvp: (matchId: string) => Promise<void>;
  fetchData: () => Promise<void>;
  updateProfile: (interests: string[], skills: string[], department?: string, year?: number, careerGoals?: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [recommendationsLoading, setRecommendationsLoading] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);

  // Restore user session on startup
  useEffect(() => {
    const restoreSession = async () => {
      if (!token) return;
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE_URL}/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        if (res.ok) {
          const userData = await res.json();
          setUser(userData);
          if (userData.role === 'student') {
            const profileRes = await fetch(`${API_BASE_URL}/profile/me`, {
              headers: {
                Authorization: `Bearer ${token}`
              }
            });
            if (profileRes.ok) {
              const profileData = await profileRes.json();
              setProfile(profileData);
            }
          }
        } else {
          // Token expired or invalid
          logout();
        }
      } catch (err) {
        console.error('Failed to restore session:', err);
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, [token]);

  // Fetch live recommendations when user is set
  useEffect(() => {
    if (user && token) {
      fetchData();
    } else {
      setRecommendations([]);
    }
  }, [user, token]);

  const fetchData = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE_URL}/recommendations`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (res.ok) {
        const matches = await res.json();
        setRecommendations(matches);
      }
    } catch (err) {
      console.error('Failed to fetch recommendations:', err);
    }
  };

  const register = async (email: string, password: string, role: string, department?: string, year?: number) => {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, role, department, year })
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.detail || 'Registration failed');
    }
  };

  const verifyOtp = async (email: string, otp: string) => {
    const res = await fetch(`${API_BASE_URL}/auth/verify-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp })
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.detail || 'OTP verification failed');
    }
  };

  const resendOtp = async (email: string) => {
    const res = await fetch(`${API_BASE_URL}/auth/resend-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.detail || 'Failed to resend OTP');
    }
  };

  const login = async (email: string, password: string) => {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.detail || 'Login failed');
    }
    const data = await res.json();
    localStorage.setItem('token', data.access_token);
    setToken(data.access_token);
    
    // Fetch profile info immediately
    const meRes = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${data.access_token}` }
    });
    if (meRes.ok) {
      const userData = await meRes.json();
      setUser(userData);
      
      if (userData.role === 'student') {
        const profileRes = await fetch(`${API_BASE_URL}/profile/me`, {
          headers: { Authorization: `Bearer ${data.access_token}` }
        });
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          setProfile(profileData);
        }
      }
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setProfile(null);
    setRecommendations([]);
  };

  const submitRsvp = async (matchId: string) => {
    if (!token) return;
    const res = await fetch(`${API_BASE_URL}/recommendations/${matchId}/feedback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ status: 'registered' })
    });
    if (res.ok) {
      // Refresh matching recommendations feed
      await fetchData();
    } else {
      const data = await res.json();
      throw new Error(data.detail || 'RSVP failed');
    }
  };

  const updateProfile = async (
    interests: string[],
    skills: string[],
    department?: string,
    year?: number,
    careerGoals?: string
  ) => {
    if (!token) return;
    const res = await fetch(`${API_BASE_URL}/profile/me`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        interests,
        skills,
        department,
        year,
        career_goals: careerGoals
      })
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.detail || 'Failed to update profile');
    }
    const updatedProfile = await res.json();
    setProfile(updatedProfile);

    // Sync the local user state department/year
    if (user) {
      setUser({
        ...user,
        department: updatedProfile.department,
        year: updatedProfile.year
      });
    }

    // Show loading state — background matching is now running on the server
    setRecommendationsLoading(true);

    // Immediate fetch (may return 0 matches — matching is still running)
    await fetchData();

    // Poll up to 5 more times with increasing backoff to catch background worker completion
    (async () => {
      const delays = [1000, 1500, 2000, 3000, 4000];
      for (const delay of delays) {
        await new Promise((resolve) => setTimeout(resolve, delay));
        await fetchData();
      }
      // Always clear loading after all polls complete
      setRecommendationsLoading(false);
    })();
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        profile,
        recommendations,
        recommendationsLoading,
        loading,
        authModalOpen,
        setAuthModalOpen,
        login,
        register,
        verifyOtp,
        resendOtp,
        logout,
        submitRsvp,
        fetchData,
        updateProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
