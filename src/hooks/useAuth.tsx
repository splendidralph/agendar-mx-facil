
import { useState, useEffect, createContext, useContext } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName?: string, role?: 'provider' | 'client') => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session check:', session?.user?.email);
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName?: string, role: 'provider' | 'client' = 'client') => {
    try {
      setLoading(true);
      const redirectUrl = `${window.location.origin}/`;
      
      console.log('Attempting signup with:', { 
        email, 
        fullName: fullName || 'Not provided', 
        role, 
        redirectUrl 
      });

      // Prepare metadata with proper field names
      const metadata = {
        full_name: fullName || '',
        role: role
      };

      console.log('Sending signup request with metadata:', metadata);

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: metadata
        }
      });

      console.log('Signup response:', { 
        user: data.user?.email, 
        session: !!data.session,
        error: error?.message 
      });

      if (error) {
        console.error('Signup error:', error);
        toast({
          title: "Error al crear cuenta",
          description: error.message,
          variant: "destructive"
        });
        return { error };
      }

      if (data.user && !data.user.email_confirmed_at) {
        toast({
          title: "¡Cuenta creada!",
          description: "Revisa tu email para confirmar tu cuenta antes de iniciar sesión",
        });
      } else if (data.user) {
        toast({
          title: "¡Cuenta creada exitosamente!",
          description: "Ya puedes usar tu cuenta",
        });
      }

      return { error: null };
    } catch (err) {
      console.error('Unexpected signup error:', err);
      const error = err as Error;
      toast({
        title: "Error inesperado",
        description: error.message || "Ocurrió un error inesperado",
        variant: "destructive"
      });
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      console.log('Attempting signin for:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      console.log('Signin response:', { 
        user: data.user?.email, 
        session: !!data.session,
        error: error?.message 
      });

      if (error) {
        console.error('Signin error:', error);
        toast({
          title: "Error al iniciar sesión",
          description: error.message,
          variant: "destructive"
        });
        return { error };
      }

      toast({
        title: "¡Bienvenido!",
        description: "Has iniciado sesión exitosamente",
      });

      return { error: null };
    } catch (err) {
      console.error('Unexpected signin error:', err);
      const error = err as Error;
      toast({
        title: "Error inesperado",
        description: error.message || "Ocurrió un error inesperado",
        variant: "destructive"
      });
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      console.log('Signing out user');
      await supabase.auth.signOut();
      toast({
        title: "Sesión cerrada",
        description: "Has cerrado sesión exitosamente",
      });
    } catch (err) {
      console.error('Signout error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      signUp,
      signIn,
      signOut
    }}>
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
