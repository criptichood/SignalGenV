import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Label } from '../components/ui/Label';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { ChartIcon } from '../components/icons/ChartIcon';
import { Loader2Icon } from '../components/icons/Loader2Icon';

interface AuthPageProps {
  onAuthSuccess: () => void;
}

const AuthPage = ({ onAuthSuccess }: AuthPageProps) => {
  const [isLoginView, setIsLoginView] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
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
    if (!isLoginView && password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      onAuthSuccess();
    }, 1000);
  };

  const toggleView = () => {
    setIsLoginView(!isLoginView);
    setError('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4" style={{ backgroundImage: 'radial-gradient(ellipse at top, hsl(215, 28%, 12%) 0%, #000 70%)', backgroundAttachment: 'fixed' }}>
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-3 mb-6">
          <ChartIcon className="w-10 h-10 text-cyan-400" />
          <h1 className="text-3xl font-bold text-white tracking-wider">
            Signal <span className="text-cyan-400">Gen</span>
          </h1>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>{isLoginView ? 'Welcome Back' : 'Create an Account'}</CardTitle>
            <CardDescription>
              {isLoginView ? 'Sign in to access your dashboard.' : 'Join the community of AI-powered traders.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  disabled={isLoading}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  disabled={isLoading}
                  required
                />
              </div>
              {!isLoginView && (
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    disabled={isLoading}
                    required
                  />
                </div>
              )}
              {error && <p className="text-sm text-red-400 text-center">{error}</p>}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                    {isLoginView ? 'Signing In...' : 'Creating Account...'}
                  </>
                ) : (
                  isLoginView ? 'Sign In' : 'Sign Up'
                )}
              </Button>
            </form>
            <div className="mt-4 text-center text-sm">
              <button onClick={toggleView} className="text-cyan-400 hover:underline">
                {isLoginView ? "Don't have an account? Sign Up" : 'Already have an account? Sign In'}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AuthPage;