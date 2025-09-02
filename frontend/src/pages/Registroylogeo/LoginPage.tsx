import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Building2, ArrowRight, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  const navigate = useNavigate();
  const { login, isLoading: authLoading } = useAuth();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(formData.email, formData.password);
      setIsSubmitted(true);
      // La redirección se maneja en el AuthContext
    } catch (error) {
      console.error('Login error:', error);
      setIsLoading(false);
    }
  };

  const features = [
    'Sistema de Gestión de Calidad ISO 9001',
    'Gestión integral de Recursos Humanos',
    'Documentación digital y control de versiones',
    'Auditorías y mejora continua',
    'Procesos y productos automatizados',
    'Administración multi-organización'
  ];

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-emerald-900 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl p-8 text-center max-w-md w-full shadow-2xl"
        >
          <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            ¡Bienvenido a 9001app!
          </h2>
          <p className="text-slate-600 mb-6">
            Redirigiendo al sistema...
          </p>
          <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-emerald-900 relative overflow-hidden">
      {/* Elementos decorativos */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-emerald-500 opacity-10 rounded-full mix-blend-screen filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/4 w-72 h-72 bg-slate-700 opacity-10 rounded-full mix-blend-screen filter blur-3xl animate-pulse animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-emerald-600 opacity-10 rounded-full mix-blend-screen filter blur-3xl animate-pulse animation-delay-4000"></div>
      </div>

      {/* Contenedor principal con margen de 2cm */}
      <div className="relative z-10 flex min-h-screen p-sgc-sep-2">
        {/* Lado izquierdo - Información */}
        <div className="hidden lg:flex lg:w-1/2 flex-col justify-center px-12 text-white">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center space-x-3 mb-8">
              <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                <Building2 className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">9001app</h1>
                <p className="text-emerald-300">Sistema de Gestión de Calidad</p>
              </div>
            </div>

            <h2 className="text-4xl font-bold mb-6">
              Transforma tu organización con 9001app
            </h2>
            <p className="text-xl text-slate-300 mb-8">
              La plataforma integral de gestión de calidad que simplifica el cumplimiento de ISO 9001
            </p>

            <div className="space-y-4">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="flex items-center space-x-3"
                >
                  <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-slate-200">{feature}</span>
                </motion.div>
              ))}
            </div>

            <div className="mt-12 p-6 bg-white/10 rounded-xl backdrop-blur-sm border border-white/20">
              <h3 className="text-lg font-semibold mb-2">¿Nuevo en 9001app?</h3>
              <p className="text-slate-300 mb-4">
                Regístrate gratis y obtén 7 días de prueba completa
              </p>
              <Link
                to="/app/register"
                className="inline-flex items-center space-x-2 bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <span>Crear cuenta gratuita</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Lado derecho - Formulario */}
        <div className="w-full lg:w-1/2 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="w-full max-w-md"
          >
            {/* Logo móvil */}
            <div className="lg:hidden text-center mb-8">
              <div className="flex items-center justify-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Building2 className="w-7 h-7 text-white" />
                </div>
                <div className="text-white">
                  <h1 className="text-2xl font-bold">9001app</h1>
                  <p className="text-emerald-300 text-sm">Sistema de Gestión de Calidad</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-2xl">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-slate-900 mb-2">
                  Bienvenido de vuelta
                </h2>
                <p className="text-slate-600">
                  Inicia sesión en tu cuenta de 9001app
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Correo electrónico
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300"
                    placeholder="tu@email.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Contraseña
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 pr-12 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-emerald-500 border-slate-300 rounded focus:ring-emerald-500"
                    />
                    <span className="ml-2 text-sm text-slate-600">Recordarme</span>
                  </label>
                  <a href="#" className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">
                    ¿Olvidaste tu contraseña?
                  </a>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || authLoading}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-400 text-white py-3 px-6 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Iniciando sesión...
                    </>
                  ) : (
                    <>
                      <span>Iniciar sesión</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-8 text-center">
                <p className="text-slate-600">
                  ¿No tienes una cuenta?{' '}
                  <Link
                    to="/app/register"
                    className="text-emerald-600 hover:text-emerald-700 font-medium"
                  >
                    Regístrate gratis
                  </Link>
                </p>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-200">
                <p className="text-xs text-slate-500 text-center">
                  Al continuar, aceptas nuestros{' '}
                  <a href="#" className="text-emerald-600 hover:text-emerald-700">Términos de Servicio</a>
                  {' '}y{' '}
                  <a href="#" className="text-emerald-600 hover:text-emerald-700">Política de Privacidad</a>
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
