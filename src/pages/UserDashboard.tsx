import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function UserDashboard() {
  const navigate = useNavigate();
  const { user, token, logout, isLoading } = useUser();
  const [orderCount, setOrderCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoading) return;

    if (!user || !token) {
      navigate('/user/login');
      return;
    }

    fetchOrderCount();
  }, [user, token, isLoading, navigate]);

  const fetchOrderCount = async () => {
    try {
      const response = await fetch(`${API_URL}/api/orders/my-orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setOrderCount(data.data.length);
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (isLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-tea-cream p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold text-tea-brown mb-2">Welcome, {user?.name}!</h1>
              <p className="text-tea-brown/70">{user?.email}</p>
              {user?.phone && <p className="text-tea-brown/70">{user.phone}</p>}
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-6 py-2 rounded font-semibold hover:bg-red-600"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-tea-brown/70 mb-2">Total Orders</p>
            <p className="text-4xl font-bold text-tea-brown">{orderCount}</p>
          </div>
          <Link
            to="/user/orders"
            className="bg-tea-brown text-tea-cream rounded-lg shadow p-6 hover:bg-tea-brown/90 transition"
          >
            <p className="text-tea-cream/80 mb-2">View Orders</p>
            <p className="text-2xl font-bold">→</p>
          </Link>
          <Link
            to="/shop"
            className="bg-tea-gold text-tea-brown rounded-lg shadow p-6 hover:bg-tea-gold/90 transition"
          >
            <p className="text-tea-brown/80 mb-2">Continue Shopping</p>
            <p className="text-2xl font-bold">→</p>
          </Link>
        </div>

        {/* Profile Info */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-tea-brown mb-6">Profile Information</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-tea-brown/70 mb-1">Name</p>
                <p className="text-tea-brown font-semibold">{user?.name}</p>
              </div>
              <div>
                <p className="text-tea-brown/70 mb-1">Email</p>
                <p className="text-tea-brown font-semibold">{user?.email}</p>
              </div>
              <div>
                <p className="text-tea-brown/70 mb-1">Phone</p>
                <p className="text-tea-brown font-semibold">{user?.phone || 'Not provided'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
