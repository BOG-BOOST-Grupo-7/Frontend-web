import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { me } from "../api/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [perfil, setPerfil] = useState(null);
  const [rol, setRol] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    
    const userStorage = localStorage.getItem("user");
    const perfilStorage = localStorage.getItem("perfil");
    const rolStorage = localStorage.getItem("rol");

    if (userStorage && perfilStorage) {
      setUser(JSON.parse(userStorage));
      setPerfil(JSON.parse(perfilStorage));
      setRol(rolStorage);
    }

    
    const restaurarSesion = async () => {
      try {
        const res = await me();
        setUser(res.data.user);
        setPerfil(res.data.perfil);
        setRol(res.data.perfil?.rol?.nombre_rol);

        
        localStorage.setItem("user", JSON.stringify(res.data.user));
        localStorage.setItem("perfil", JSON.stringify(res.data.perfil));
        localStorage.setItem("rol", res.data.perfil?.rol?.nombre_rol);
      } catch (error) {
        // Si hay error de autenticación, limpiamos todo
        setUser(null);
        setPerfil(null);
        setRol(null);
        localStorage.removeItem("user");
        localStorage.removeItem("perfil");
        localStorage.removeItem("rol");
      } finally {
        setLoading(false);
      }
    };

    restaurarSesion();
  }, []);

  const login = (userData, perfilData) => {
    const rolNombre = perfilData?.rol?.nombre_rol ?? null;
    
   
    setUser(userData);
    setPerfil(perfilData);
    setRol(rolNombre);

    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("perfil", JSON.stringify(perfilData));
    localStorage.setItem("rol", rolNombre);

    
    setTimeout(async () => {
      try {
        const res = await me();
        if (res.data.perfil) {
          setPerfil(res.data.perfil);
          localStorage.setItem("perfil", JSON.stringify(res.data.perfil));
          
          
          if (res.data.perfil?.rol?.nombre_rol) {
            setRol(res.data.perfil.rol.nombre_rol);
            localStorage.setItem("rol", res.data.perfil.rol.nombre_rol);
          }
        }
      } catch (error) {
        console.error("Error actualizando el perfil tras el login:", error);
      }
    }, 500); 
  };

  const logout = () => {
    setUser(null);
    setPerfil(null);
    setRol(null);

    localStorage.removeItem("user");
    localStorage.removeItem("perfil");
    localStorage.removeItem("rol");
  };

  const actualizarPerfilContexto = (nuevosDatos) => {
    setPerfil((prev) => {
      const perfilActualizado = { ...prev, ...nuevosDatos };
      localStorage.setItem("perfil", JSON.stringify(perfilActualizado));
      return perfilActualizado;
    });
  };

  const value = useMemo(
    () => ({
      user,
      perfil,
      rol,
      loading,
      isAuthenticated: !!user,
      login,
      logout,
      actualizarPerfilContexto,
    }),
    [user, perfil, rol, loading]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de AuthProvider");
  }
  return context;
}