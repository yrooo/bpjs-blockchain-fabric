import { useState, useEffect } from 'react';
import { Users, FileText, Activity, AlertCircle, LayoutDashboard, Database, CreditCard, Stethoscope, PlusCircle, Search } from 'lucide-react';
import { apiService } from '../../services/api';
import BlockchainDashboard from '../../components/BlockchainDashboard';
import CardTest from '../../components/CardTest';
import VisitTest from '../../components/VisitTest';
import ClaimTest from '../../components/ClaimTest';
import PatientLookup from './PatientLookup';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    totalCards: 0,
    totalVisits: 0,
    totalClaims: 0,
    pendingClaims: 0
  });
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState([]);

  const addLog = (type, message, data = null) => {
    const log = {
      id: Date.now(),
      type,
      message,
      data,
      timestamp: new Date().toLocaleTimeString()
    };
    console.log(`[${type}] ${message}`, data);
    setLogs(prev => [log, ...prev].slice(0, 50));
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const data = await apiService.getStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch stats', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-5">
        <div className="flex items-center">
          <div className={`flex-shrink-0 rounded-md p-3 ${color}`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
              <dd className="text-lg font-medium text-gray-900">{value}</dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );

  const TabButton = ({ id, label, icon: Icon }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
        activeTab === id 
          ? 'bg-bpjs-primary text-white' 
          : 'text-gray-600 hover:bg-gray-50'
      }`}
    >
      <div className="flex items-center space-x-2">
        <Icon className="h-4 w-4" />
        <span>{label}</span>
      </div>
    </button>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4 md:flex-row md:justify-between md:items-center md:space-y-0">
        <h2 className="text-2xl font-bold text-gray-800">Provider Dashboard</h2>
        <div className="flex space-x-2 bg-white p-1 rounded-lg shadow-sm border border-gray-200 overflow-x-auto">
          <TabButton id="overview" label="Overview" icon={LayoutDashboard} />
          <TabButton id="patient-lookup" label="Patient Lookup" icon={Search} />
          <TabButton id="blockchain" label="Blockchain Data" icon={Database} />
          <TabButton id="issue-card" label="Issue Card" icon={CreditCard} />
          <TabButton id="record-visit" label="Record Visit" icon={Stethoscope} />
          <TabButton id="submit-claim" label="Submit Claim" icon={PlusCircle} />
        </div>
      </div>
      
      {activeTab === 'overview' && (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard 
              title="Total Patients" 
              value={stats.totalCards} 
              icon={Users} 
              color="bg-blue-500" 
            />
            <StatCard 
              title="Total Visits" 
              value={stats.totalVisits} 
              icon={Activity} 
              color="bg-green-500" 
            />
            <StatCard 
              title="Total Claims" 
              value={stats.totalClaims} 
              icon={FileText} 
              color="bg-purple-500" 
            />
            <StatCard 
              title="Pending Claims" 
              value={stats.pendingClaims} 
              icon={AlertCircle} 
              color="bg-yellow-500" 
            />
          </div>

          {/* System Status */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">System Status</h3>
            <div className="flex items-center space-x-2 text-green-600">
              <div className="h-2.5 w-2.5 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-sm font-medium">Blockchain Network Active</span>
            </div>
          </div>
        </>
      )}

      {activeTab === 'patient-lookup' && <PatientLookup />}

      {activeTab === 'blockchain' && <BlockchainDashboard addLog={addLog} />}
      
      {activeTab === 'issue-card' && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Issue New Card</h3>
          <CardTest addLog={addLog} />
        </div>
      )}

      {activeTab === 'record-visit' && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Record Patient Visit</h3>
          <VisitTest addLog={addLog} />
        </div>
      )}

      {activeTab === 'submit-claim' && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Submit New Claim</h3>
          <ClaimTest addLog={addLog} />
        </div>
      )}

      {/* Logs Section for Test Components */}
      {(activeTab === 'issue-card' || activeTab === 'record-visit' || activeTab === 'submit-claim') && logs.length > 0 && (
        <div className="bg-gray-900 text-green-400 p-4 rounded-lg shadow-lg mt-6 font-mono text-sm max-h-60 overflow-y-auto">
          <h4 className="text-white font-bold mb-2 border-b border-gray-700 pb-1">Operation Logs</h4>
          {logs.map((log) => (
            <div key={log.id} className="mb-1">
              <span className="text-gray-500">[{log.timestamp}]</span>{' '}
              <span className={log.type === 'error' ? 'text-red-400' : 'text-green-400'}>
                {log.message}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;