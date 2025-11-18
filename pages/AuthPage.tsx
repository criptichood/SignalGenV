import React, { useState } from 'react';
import { Button } from '../components/ui/Button';
import { ChartIcon } from '../components/icons/ChartIcon';
import { Loader2Icon } from '../components/icons/Loader2Icon';
import { EyeIcon, EyeOffIcon, Mail, Lock, User, ArrowRight } from 'lucide-react';
import supabaseService from '@/services/supabaseService';

interface AuthPageProps {
  onAuthSuccess: () => void;
}

const AuthPage = ({ onAuthSuccess }: AuthPageProps) => {
  const [isLoginView, setIsLoginView] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Password strength validation
  const hasMinLength = password.length >= 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const isPasswordValid = hasMinLength && hasUpperCase && hasLowerCase && hasSymbol;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Basic validation
    if (!email || !password) {
      setError('Email and password are required.');
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    if (!isLoginView) {
      if (!fullName.trim()) {
        setError('Full name is required.');
        return;
      }
      if (!isPasswordValid) {
        setError('Password must have at least 8 characters, 1 uppercase letter, 1 lowercase letter, and 1 symbol.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
    }

    setIsLoading(true);

    try {
      let result;
      if (isLoginView) {
        result = await supabaseService.signIn(email, password);
      } else {
        result = await supabaseService.signUp(email, password);
      }

      if (result.error) {
        setError(result.error.message);
      } else {
        onAuthSuccess();
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during authentication.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignInWithGoogle = async () => {
    try {
      setIsLoading(true);
      const result = await supabaseService.signInWithGoogle();
      if (result.error) {
        setError(result.error.message);
      }
      // Google sign in redirects, so no onAuthSuccess call here
    } catch (err: any) {
      setError(err.message || 'An error occurred during Google authentication.');
      setIsLoading(false);
    }
  };

  const toggleView = () => {
    setIsLoginView(!isLoginView);
    setError('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setFullName('');
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-900 p-4">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 shadow-lg shadow-cyan-500/20">
              <ChartIcon className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
            Signal<span className="font-extrabold">Gen</span>
          </h1>
          <p className="mt-2 text-gray-400">
            {isLoginView
              ? 'Sign in to access your trading dashboard'
              : 'Join the AI-powered trading community'}
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-800 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden">
          <div className="p-1 bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-cyan-500/20">
            <div className="bg-gray-900 rounded-xl p-8">
              {/* Social Login Buttons */}
              <div className="space-y-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleSignInWithGoogle}
                  disabled={isLoading}
                  className="w-full bg-gray-800/50 hover:bg-gray-800 border-gray-700 text-gray-200 transition-all duration-300 flex items-center justify-center gap-3 group"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.92A10 10 0 0 0 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  <span className="font-medium">Continue with Google</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-700"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-gray-900 text-gray-400">Or continue with email</span>
                  </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                  {!isLoginView && (
                    <div className="relative">
                      <label htmlFor="fullName" className="block text-sm font-medium text-gray-300 mb-2">
                        Full Name
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
                        <input
                          id="fullName"
                          type="text"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="John Doe"
                          disabled={isLoading}
                          className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all"
                        />
                      </div>
                    </div>
                  )}

                  <div className="relative">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
                      <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        disabled={isLoading}
                        className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all"
                      />
                    </div>
                  </div>

                  <div className="relative">
                    <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
                      <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        disabled={isLoading}
                        className="w-full pl-10 pr-12 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-300"
                        onClick={togglePasswordVisibility}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  {!isLoginView && (
                    <div className="relative">
                      <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                        Confirm Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
                        <input
                          id="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="••••••••"
                          disabled={isLoading}
                          className="w-full pl-10 pr-12 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all"
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-300"
                          onClick={toggleConfirmPasswordVisibility}
                          aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                        >
                          {showConfirmPassword ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                        </button>
                      </div>
                    </div>
                  )}

                  {!isLoginView && (
                    <div className="space-y-2">
                      <p className="text-xs text-gray-400 font-medium">Password must include:</p>
                      <div className="grid grid-cols-2 gap-2">
                        <div className={`flex items-center gap-2 text-xs ${hasMinLength ? 'text-green-400' : 'text-gray-500'}`}>
                          <div className={`w-2 h-2 rounded-full ${hasMinLength ? 'bg-green-400' : 'bg-gray-600'}`}></div>
                          <span>8+ characters</span>
                        </div>
                        <div className={`flex items-center gap-2 text-xs ${hasUpperCase ? 'text-green-400' : 'text-gray-500'}`}>
                          <div className={`w-2 h-2 rounded-full ${hasUpperCase ? 'bg-green-400' : 'bg-gray-600'}`}></div>
                          <span>Uppercase</span>
                        </div>
                        <div className={`flex items-center gap-2 text-xs ${hasLowerCase ? 'text-green-400' : 'text-gray-500'}`}>
                          <div className={`w-2 h-2 rounded-full ${hasLowerCase ? 'bg-green-400' : 'bg-gray-600'}`}></div>
                          <span>Lowercase</span>
                        </div>
                        <div className={`flex items-center gap-2 text-xs ${hasSymbol ? 'text-green-400' : 'text-gray-500'}`}>
                          <div className={`w-2 h-2 rounded-full ${hasSymbol ? 'bg-green-400' : 'bg-gray-600'}`}></div>
                          <span>Symbol</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {error && (
                    <div className="p-3 bg-red-900/30 border border-red-800 rounded-lg">
                      <p className="text-sm text-red-400 text-center">{error}</p>
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/30"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center gap-2">
                        <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                        {isLoginView ? 'Signing In...' : 'Creating Account...'}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2">
                        {isLoginView ? 'Sign In' : 'Create Account'}
                        <ArrowRight className="h-4 w-4" />
                      </div>
                    )}
                  </Button>
                </form>
              </div>

              {/* Toggle View */}
              <div className="mt-6 text-center">
                <button
                  onClick={toggleView}
                  className="text-cyan-400 hover:text-cyan-300 text-sm font-medium transition-colors duration-300"
                >
                  {isLoginView
                    ? "Don't have an account? Sign up"
                    : "Already have an account? Sign in"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
          <p className="mt-4 text-xs text-cyan-400/80 font-medium">
            Built with ❤️ by CripticHood
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;