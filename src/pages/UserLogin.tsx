import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function UserLogin() {
  const navigate = useNavigate();
  const { login } = useUser();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.message || 'Login failed');
        return;
      }

      login(data.data.token, data.data.user);
      navigate('/user/dashboard');
    } catch (err) {
      setError('Network error. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-tea-cream flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-tea-brown mb-2">Welcome Back</h1>
        <p className="text-tea-brown/70 mb-6">Login to your account</p>

        {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            name="email"
            placeholder="Email Address"
            required
            className="w-full px-4 py-2 border border-tea-brown/20 rounded focus:outline-none focus:ring-2 focus:ring-tea-gold"
            value={formData.email}
            onChange={handleChange}
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            required
            className="w-full px-4 py-2 border border-tea-brown/20 rounded focus:outline-none focus:ring-2 focus:ring-tea-gold"
            value={formData.password}
            onChange={handleChange}
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-tea-brown text-tea-cream py-2 rounded font-semibold hover:bg-tea-brown/90 disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="text-center mt-4 text-tea-brown/70">
          Don&apos;t have an account?{' '}
          <Link to="/user/register" className="text-tea-gold font-semibold hover:underline">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}
