import { useState, useEffect } from 'react'
import { RefreshCw, Database, CreditCard, Activity, FileText, BookOpen, Loader2 } from 'lucide-react'
import { apiService } from '../services/api'

function BlockchainDashboard({ addLog }) {
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState(null)
  const [cards, setCards] = useState([])
  const [visits, setVisits] = useState([])
  const [claims, setClaims] = useState([])
  const [auditLogs, setAuditLogs] = useState([])
  const [activeTab, setActiveTab] = useState('stats')
  const [searchPatientID, setSearchPatientID] = useState('')
  const [patientData, setPatientData] = useState(null)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    setLoading(true)
    addLog('info', '📊 Fetching blockchain statistics...')
    
    try {
      const response = await apiService.getStats()
      setStats(response.stats)
      addLog('success', '✅ Statistics loaded from blockchain', response.stats)
    } catch (error) {
      addLog('error', '❌ Failed to load statistics: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const loadAllCards = async () => {
    setLoading(true)
    addLog('info', '💳 Fetching all cards from blockchain...')
    
    try {
      const response = await apiService.getAllCards()
      setCards(response.cards || [])
      addLog('success', `✅ Loaded ${response.count} cards from blockchain`)
    } catch (error) {
      addLog('error', '❌ Failed to load cards: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const loadAllVisits = async () => {
    setLoading(true)
    addLog('info', '🏥 Fetching all visits from blockchain...')
    
    try {
      const response = await apiService.getAllVisits()
      setVisits(response.visits || [])
      addLog('success', `✅ Loaded ${response.count} visits from blockchain`)
    } catch (error) {
      addLog('error', '❌ Failed to load visits: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const loadAllClaims = async () => {
    setLoading(true)
    addLog('info', '💰 Fetching all claims from blockchain...')
    
    try {
      const response = await apiService.getAllClaims()
      setClaims(response.claims || [])
      addLog('success', `✅ Loaded ${response.count} claims from blockchain`)
    } catch (error) {
      addLog('error', '❌ Failed to load claims: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const loadAuditLogs = async () => {
    setLoading(true)
    addLog('info', '📜 Fetching audit logs from blockchain...')
    
    try {
      const response = await apiService.getAuditLogs()
      setAuditLogs(response.logs || [])
      addLog('success', `✅ Loaded ${response.count} audit logs from blockchain`)
    } catch (error) {
      addLog('error', '❌ Failed to load audit logs: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const searchPatient = async () => {
    if (!searchPatientID.trim()) {
      addLog('warning', '⚠️ Please enter a patient ID')
      return
    }

    setLoading(true)
    addLog('info', `🔍 Searching blockchain for patient: ${searchPatientID}`)
    
    try {
      const response = await apiService.getPatientData(searchPatientID)
      setPatientData(response)
      addLog('success', `✅ Found patient data - ${response.totalVisits} visits, ${response.totalClaims} claims`)
    } catch (error) {
      addLog('error', '❌ Failed to search patient: ' + error.message)
      setPatientData(null)
    } finally {
      setLoading(false)
    }
  }

  const refreshAll = async () => {
    await loadStats()
    if (activeTab === 'cards') await loadAllCards()
    if (activeTab === 'visits') await loadAllVisits()
    if (activeTab === 'claims') await loadAllClaims()
    if (activeTab === 'audit') await loadAuditLogs()
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <Database className="h-6 w-6 text-bpjs-primary" />
          <h2 className="text-2xl font-bold text-gray-800">Blockchain Data Dashboard</h2>
        </div>
        <button 
          onClick={refreshAll}
          disabled={loading}
          className="px-4 py-2 bg-bpjs-primary text-white rounded-md hover:bg-bpjs-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Statistics Overview */}
      {stats && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 rounded-md p-3 bg-green-500">
                  <CreditCard className="h-6 w-6 text-white" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Cards</dt>
                    <dd className="text-3xl font-bold text-gray-900">{stats.totalCards}</dd>
                    <dd className="text-xs text-gray-500">{stats.activeCards} active</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 rounded-md p-3 bg-blue-500">
                  <Activity className="h-6 w-6 text-white" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Visits</dt>
                    <dd className="text-3xl font-bold text-gray-900">{stats.totalVisits}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 rounded-md p-3 bg-orange-500">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Claims</dt>
                    <dd className="text-3xl font-bold text-gray-900">{stats.totalClaims}</dd>
                    <dd className="text-xs text-gray-500">{stats.pendingClaims} pending, {stats.approvedClaims} approved</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Patient Search */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">🔍 Search Patient Data</h3>
        <div className="flex gap-3 mb-4">
          <input
            type="text"
            placeholder="Enter Patient ID (e.g., P1763807190972)"
            value={searchPatientID}
            onChange={(e) => setSearchPatientID(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-bpjs-primary focus:border-transparent"
            onKeyPress={(e) => e.key === 'Enter' && searchPatient()}
          />
          <button 
            onClick={searchPatient}
            disabled={loading}
            className="px-4 py-2 bg-bpjs-primary text-white rounded-md hover:bg-bpjs-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : '🔍'} Search
          </button>
        </div>

        {patientData && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-2">Patient: {patientData.patientID}</h4>
            <p className="text-sm text-gray-700"><strong>Total Visits:</strong> {patientData.totalVisits}</p>
            <p className="text-sm text-gray-700"><strong>Total Claims:</strong> {patientData.totalClaims}</p>
            
            {patientData.visits.length > 0 && (
              <div className="mt-3">
                <strong className="text-sm text-gray-900">Recent Visits:</strong>
                <div className="mt-2 space-y-1">
                  {patientData.visits.slice(0, 3).map((visit, idx) => (
                    <div key={idx} className="text-sm text-gray-600 ml-4">
                      • {visit.visitDate} - {visit.faskesName} ({visit.diagnosis})
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Data Tabs */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="border-b border-gray-200">
          <div className="flex overflow-x-auto">
            <button 
              className={`px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap ${
                activeTab === 'stats' 
                  ? 'border-bpjs-primary text-bpjs-primary bg-bpjs-light' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('stats')}
            >
              📊 Stats
            </button>
            <button 
              className={`px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap ${
                activeTab === 'cards' 
                  ? 'border-bpjs-primary text-bpjs-primary bg-bpjs-light' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => { setActiveTab('cards'); loadAllCards(); }}
            >
              💳 Cards ({stats?.totalCards || 0})
            </button>
            <button 
              className={`px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap ${
                activeTab === 'visits' 
                  ? 'border-bpjs-primary text-bpjs-primary bg-bpjs-light' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => { setActiveTab('visits'); loadAllVisits(); }}
            >
              🏥 Visits ({stats?.totalVisits || 0})
            </button>
            <button 
              className={`px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap ${
                activeTab === 'claims' 
                  ? 'border-bpjs-primary text-bpjs-primary bg-bpjs-light' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => { setActiveTab('claims'); loadAllClaims(); }}
            >
              💰 Claims ({stats?.totalClaims || 0})
            </button>
            <button 
              className={`px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap ${
                activeTab === 'audit' 
                  ? 'border-bpjs-primary text-bpjs-primary bg-bpjs-light' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => { setActiveTab('audit'); loadAuditLogs(); }}
            >
              📜 Audit Logs
            </button>
          </div>
        </div>

        {/* Cards Data */}
        {activeTab === 'cards' && (
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">All BPJS Cards ({cards.length})</h3>
            {loading ? (
              <div className="text-center py-8">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-bpjs-primary" />
                <p className="text-gray-500 mt-2">Loading cards...</p>
              </div>
            ) : cards.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No cards found</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Card ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NIK</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Issue Date</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {cards.map((card, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{card.cardID}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{card.patientName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{card.nik}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{card.cardType}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            card.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {card.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{card.issueDate}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Visits Data */}
        {activeTab === 'visits' && (
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">All Patient Visits ({visits.length})</h3>
            {loading ? (
              <div className="text-center py-8">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-bpjs-primary" />
                <p className="text-gray-500 mt-2">Loading visits...</p>
              </div>
            ) : visits.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No visits found</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Visit ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Facility</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Diagnosis</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {visits.map((visit, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{visit.visitID}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{visit.patientName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{visit.faskesName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{visit.visitDate}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{visit.diagnosis}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{visit.doctorName}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
        {/* Claims Data */}
        {activeTab === 'claims' && (
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">All Insurance Claims ({claims.length})</h3>
            {loading ? (
              <div className="text-center py-8">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-bpjs-primary" />
                <p className="text-gray-500 mt-2">Loading claims...</p>
              </div>
            ) : claims.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No claims found</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Claim ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Facility</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {claims.map((claim, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{claim.claimID}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{claim.patientName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{claim.faskesName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                          Rp {parseInt(claim.claimAmount || 0).toLocaleString('id-ID')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            claim.status === 'approved' ? 'bg-green-100 text-green-800' : 
                            claim.status === 'rejected' ? 'bg-red-100 text-red-800' : 
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {claim.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{claim.serviceDate}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}</div>
        {/* Audit Logs */}
        {activeTab === 'audit' && (
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Blockchain Audit Trail ({auditLogs.length})</h3>
            {loading ? (
              <div className="text-center py-8">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-bpjs-primary" />
                <p className="text-gray-500 mt-2">Loading audit logs...</p>
              </div>
            ) : auditLogs.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No audit logs found</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actor</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Entity Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Entity ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {auditLogs.map((log, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(log.timestamp).toLocaleString('id-ID')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{log.action}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{log.actor}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{log.entityType}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">{log.entityID}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">{log.details}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default BlockchainDashboard

export default BlockchainDashboard
