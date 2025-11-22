import { useState } from 'react';
import QRCode from 'react-qr-code';
import { Search, CreditCard, UserPlus, Activity, Calendar } from 'lucide-react';
import { apiService } from '../../services/api';

const UserDashboard = () => {
  const [cardId, setCardId] = useState('');
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [view, setView] = useState('login'); // login, register, dashboard

  // Registration Form State
  const [formData, setFormData] = useState({
    nik: '',
    fullName: '',
    dateOfBirth: '',
    address: '',
    phoneNumber: '',
    email: ''
  });

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = await apiService.getCard(cardId);
      setUserData(data);
      setView('dashboard');
    } catch (err) {
      setError('Card not found. Please check your ID.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      // Note: In a real app, this would likely go to a pending state or require payment
      // For this demo, we'll issue the card directly
      const result = await apiService.issueCard(formData);
      setUserData(result); // Assuming result contains the card data
      setCardId(result.cardID);
      setView('dashboard');
    } catch (err) {
      setError('Registration failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (view === 'login') {
    return (
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl p-8 mt-10">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-800">Welcome to HealthLink</h2>
          <p className="text-gray-600">Access your digital BPJS card and health records</p>
        </div>

        <div className="space-y-6">
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Existing Member?</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="focus:ring-bpjs-primary focus:border-bpjs-primary block w-full pl-10 sm:text-sm border-gray-300 rounded-md p-3 border"
                  placeholder="Enter your Card ID"
                  value={cardId}
                  onChange={(e) => setCardId(e.target.value)}
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-bpjs-primary hover:bg-bpjs-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-bpjs-primary disabled:opacity-50"
            >
              {loading ? 'Checking...' : 'Access My Card'}
            </button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or</span>
            </div>
          </div>

          <button
            onClick={() => setView('register')}
            className="w-full flex justify-center py-2 px-4 border border-bpjs-primary rounded-md shadow-sm text-sm font-medium text-bpjs-primary bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-bpjs-primary"
          >
            <UserPlus className="mr-2 h-5 w-5" />
            Register New Card
          </button>
          
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        </div>
      </div>
    );
  }

  if (view === 'register') {
    return (
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-md overflow-hidden p-8 mt-10">
        <div className="mb-6">
          <button onClick={() => setView('login')} className="text-gray-500 hover:text-gray-700 mb-4">
            &larr; Back to Login
          </button>
          <h2 className="text-2xl font-bold text-gray-800">Register for BPJS</h2>
          <p className="text-gray-600">Fill in your details to create a digital card</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">NIK</label>
              <input
                required
                type="text"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-bpjs-primary focus:border-bpjs-primary"
                value={formData.nik}
                onChange={e => setFormData({...formData, nik: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Full Name</label>
              <input
                required
                type="text"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-bpjs-primary focus:border-bpjs-primary"
                value={formData.fullName}
                onChange={e => setFormData({...formData, fullName: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
              <input
                required
                type="date"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-bpjs-primary focus:border-bpjs-primary"
                value={formData.dateOfBirth}
                onChange={e => setFormData({...formData, dateOfBirth: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Phone Number</label>
              <input
                required
                type="tel"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-bpjs-primary focus:border-bpjs-primary"
                value={formData.phoneNumber}
                onChange={e => setFormData({...formData, phoneNumber: e.target.value})}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Address</label>
              <textarea
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-bpjs-primary focus:border-bpjs-primary"
                rows="3"
                value={formData.address}
                onChange={e => setFormData({...formData, address: e.target.value})}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-bpjs-primary hover:bg-bpjs-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-bpjs-primary disabled:opacity-50 mt-6"
          >
            {loading ? 'Processing...' : 'Submit Registration'}
          </button>
          {error && <p className="text-red-500 text-sm text-center mt-2">{error}</p>}
        </form>
      </div>
    );
  }

  // Dashboard View
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">My Health Dashboard</h2>
        <button 
          onClick={() => { setView('login'); setUserData(null); setCardId(''); }}
          className="text-sm text-red-600 hover:text-red-800"
        >
          Logout
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Digital Card */}
        <div className="md:col-span-1">
          <div className="bg-gradient-to-br from-bpjs-primary to-bpjs-dark rounded-xl shadow-xl p-6 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white opacity-10 rounded-full"></div>
            
            <div className="flex justify-between items-start mb-8">
              <div>
                <h3 className="font-bold text-lg">HealthLink Card</h3>
                <p className="text-xs opacity-80">National Health Insurance</p>
              </div>
              <Activity className="h-8 w-8 opacity-80" />
            </div>

            <div className="mb-6">
              <p className="text-xs opacity-70 uppercase tracking-wider">Card Number</p>
              <p className="font-mono text-xl tracking-widest">{userData?.cardID}</p>
            </div>

            <div className="mb-6">
              <p className="text-xs opacity-70 uppercase tracking-wider">Name</p>
              <p className="font-medium text-lg">{userData?.fullName}</p>
            </div>

            <div className="flex justify-between items-end">
              <div>
                <p className="text-xs opacity-70 uppercase tracking-wider">Status</p>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${userData?.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {userData?.status}
                </span>
              </div>
              <div className="bg-white p-2 rounded-lg">
                <QRCode value={userData?.cardID || ''} size={64} />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats / Actions */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-bpjs-primary" />
              Recent Activity
            </h3>
            <div className="text-center py-8 text-gray-500">
              <p>No recent medical visits recorded.</p>
              <button className="mt-4 text-bpjs-primary hover:text-bpjs-dark text-sm font-medium">
                View Full History &rarr;
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;