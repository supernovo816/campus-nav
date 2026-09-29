import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);         // Supabase auth user
  const [profile, setProfile] = useState(null);   // profiles table row
  const [loading, setLoading] = useState(true);

  // ── Fetch profile from the `profiles` table ──
  const fetchProfile = async (userId) => {
    if (!userId) { setProfile(null); return; }
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    setProfile(data || null);
  };

  // ── Listen to Supabase auth state changes ──
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const u = session?.user ?? null;
      setUser(u);
      fetchProfile(u?.id).finally(() => setLoading(false));
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user ?? null;
      setUser(u);
      fetchProfile(u?.id);
    });

    return () => subscription.unsubscribe();
  }, []);

  // ── Register with registration number ──
  const register = async ({ registrationNo, name, email, password }) => {
    // Validate registration number format: UV26G248052 (2 letters + 2 digits + 1 letter + 6 digits)
    const regNoPattern = /^UV\d{2}[A-Z]\d{6}$/i;
    if (!regNoPattern.test(registrationNo.trim())) {
      return { error: { message: 'Invalid registration number format. Example: UV26G248052' } };
    }

    // Check uniqueness of registration number
    const { data: existing } = await supabase
      .from('profiles')
      .select('id')
      .eq('registration_no', registrationNo.trim().toUpperCase())
      .single();

    if (existing) {
      return { error: { message: 'This registration number is already registered.' } };
    }

    // Sign up via Supabase Auth
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          name: name.trim(),
          registration_no: registrationNo.trim().toUpperCase(),
        },
      },
    });

    if (signUpError) return { error: signUpError };

    // Insert profile row (the trigger can also handle this, but we do it here for immediate access)
    if (data.user) {
      const { error: profileError } = await supabase.from('profiles').insert({
        id: data.user.id,
        registration_no: registrationNo.trim().toUpperCase(),
        name: name.trim(),
        email: email.trim(),
      });
      if (profileError && profileError.code !== '23505') {
        // 23505 = unique violation (trigger already inserted it)
        console.warn('Profile insert warning:', profileError.message);
      }
    }

    return { data, error: null };
  };

  // ── Login ──
  const login = async ({ email, password }) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    return { data, error };
  };

  // ── Logout ──
  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
