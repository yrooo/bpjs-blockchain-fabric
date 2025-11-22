import { useState, useEffect } from 'react'
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
    <div className="component-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2 className="component-title">📊 Blockchain Data Dashboard</h2>
        <button 
          className="btn btn-primary" 
          onClick={refreshAll}
          disabled={loading}
        >
          {loading ? <span className="loading"></span> : '🔄'} Refresh
        </button>
      </div>

      {/* Statistics Overview */}
      {stats && (
        <div className="section">
          <h3 className="section-title">Network Statistics</h3>
          <div className="info-grid">
            <div className="info-card">
              <div className="info-card-title">Total Cards</div>
              <div className="info-card-value" style={{ fontSize: '2rem', color: '#4CAF50' }}>
                {stats.totalCards}
              </div>
              <small>{stats.activeCards} active</small>
            </div>
            <div className="info-card">
              <div className="info-card-title">Total Visits</div>
              <div className="info-card-value" style={{ fontSize: '2rem', color: '#2196F3' }}>
                {stats.totalVisits}
              </div>
            </div>
            <div className="info-card">
              <div className="info-card-title">Total Claims</div>
              <div className="info-card-value" style={{ fontSize: '2rem', color: '#FF9800' }}>
                {stats.totalClaims}
              </div>
              <small>{stats.pendingClaims} pending, {stats.approvedClaims} approved</small>
            </div>
          </div>
        </div>
      )}

      {/* Patient Search */}
      <div className="section">
        <h3 className="section-title">🔍 Search Patient Data</h3>
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
          <input
            type="text"
            placeholder="Enter Patient ID (e.g., P1763807190972)"
            value={searchPatientID}
            onChange={(e) => setSearchPatientID(e.target.value)}
            style={{ flex: 1 }}
            onKeyPress={(e) => e.key === 'Enter' && searchPatient()}
          />
          <button 
            className="btn btn-success" 
            onClick={searchPatient}
            disabled={loading}
          >
            {loading ? <span className="loading"></span> : '🔍'} Search
          </button>
        </div>

        {patientData && (
          <div className="result-box" style={{ marginTop: '1rem' }}>
            <h4>Patient: {patientData.patientID}</h4>
            <p><strong>Total Visits:</strong> {patientData.totalVisits}</p>
            <p><strong>Total Claims:</strong> {patientData.totalClaims}</p>
            
            {patientData.visits.length > 0 && (
              <div style={{ marginTop: '1rem' }}>
                <strong>Recent Visits:</strong>
                {patientData.visits.slice(0, 3).map((visit, idx) => (
                  <div key={idx} style={{ marginLeft: '1rem', marginTop: '0.5rem' }}>
                    • {visit.visitDate} - {visit.faskesName} ({visit.diagnosis})
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Data Tabs */}
      <div className="section">
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
          <button 
            className={`btn ${activeTab === 'stats' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('stats')}
          >
            📊 Stats
          </button>
          <button 
            className={`btn ${activeTab === 'cards' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => { setActiveTab('cards'); loadAllCards(); }}
          >
            💳 Cards ({stats?.totalCards || 0})
          </button>
          <button 
            className={`btn ${activeTab === 'visits' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => { setActiveTab('visits'); loadAllVisits(); }}
          >
            🏥 Visits ({stats?.totalVisits || 0})
          </button>
          <button 
            className={`btn ${activeTab === 'claims' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => { setActiveTab('claims'); loadAllClaims(); }}
          >
            💰 Claims ({stats?.totalClaims || 0})
          </button>
          <button 
            className={`btn ${activeTab === 'audit' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => { setActiveTab('audit'); loadAuditLogs(); }}
          >
            📜 Audit Logs
          </button>
        </div>

        {/* Cards Data */}
        {activeTab === 'cards' && (
          <div>
            <h3 className="section-title">All BPJS Cards ({cards.length})</h3>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <span className="loading"></span> Loading cards...
              </div>
            ) : cards.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#888' }}>No cards found</p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#1e1e1e', borderBottom: '2px solid #333' }}>
                      <th style={{ padding: '0.75rem', textAlign: 'left' }}>Card ID</th>
                      <th style={{ padding: '0.75rem', textAlign: 'left' }}>Patient Name</th>
                      <th style={{ padding: '0.75rem', textAlign: 'left' }}>NIK</th>
                      <th style={{ padding: '0.75rem', textAlign: 'left' }}>Type</th>
                      <th style={{ padding: '0.75rem', textAlign: 'left' }}>Status</th>
                      <th style={{ padding: '0.75rem', textAlign: 'left' }}>Issue Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cards.map((card, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #333' }}>
                        <td style={{ padding: '0.75rem' }}>{card.cardID}</td>
                        <td style={{ padding: '0.75rem' }}>{card.patientName}</td>
                        <td style={{ padding: '0.75rem' }}>{card.nik}</td>
                        <td style={{ padding: '0.75rem' }}>{card.cardType}</td>
                        <td style={{ padding: '0.75rem' }}>
                          <span className={`status-badge ${card.status === 'active' ? 'online' : 'offline'}`}>
                            {card.status}
                          </span>
                        </td>
                        <td style={{ padding: '0.75rem' }}>{card.issueDate}</td>
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
          <div>
            <h3 className="section-title">All Patient Visits ({visits.length})</h3>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <span className="loading"></span> Loading visits...
              </div>
            ) : visits.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#888' }}>No visits found</p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#1e1e1e', borderBottom: '2px solid #333' }}>
                      <th style={{ padding: '0.75rem', textAlign: 'left' }}>Visit ID</th>
                      <th style={{ padding: '0.75rem', textAlign: 'left' }}>Patient</th>
                      <th style={{ padding: '0.75rem', textAlign: 'left' }}>Facility</th>
                      <th style={{ padding: '0.75rem', textAlign: 'left' }}>Date</th>
                      <th style={{ padding: '0.75rem', textAlign: 'left' }}>Diagnosis</th>
                      <th style={{ padding: '0.75rem', textAlign: 'left' }}>Doctor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visits.map((visit, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #333' }}>
                        <td style={{ padding: '0.75rem' }}>{visit.visitID}</td>
                        <td style={{ padding: '0.75rem' }}>{visit.patientName}</td>
                        <td style={{ padding: '0.75rem' }}>{visit.faskesName}</td>
                        <td style={{ padding: '0.75rem' }}>{visit.visitDate}</td>
                        <td style={{ padding: '0.75rem' }}>{visit.diagnosis}</td>
                        <td style={{ padding: '0.75rem' }}>{visit.doctorName}</td>
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
          <div>
            <h3 className="section-title">All Insurance Claims ({claims.length})</h3>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <span className="loading"></span> Loading claims...
              </div>
            ) : claims.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#888' }}>No claims found</p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#1e1e1e', borderBottom: '2px solid #333' }}>
                      <th style={{ padding: '0.75rem', textAlign: 'left' }}>Claim ID</th>
                      <th style={{ padding: '0.75rem', textAlign: 'left' }}>Patient</th>
                      <th style={{ padding: '0.75rem', textAlign: 'left' }}>Facility</th>
                      <th style={{ padding: '0.75rem', textAlign: 'left' }}>Amount</th>
                      <th style={{ padding: '0.75rem', textAlign: 'left' }}>Status</th>
                      <th style={{ padding: '0.75rem', textAlign: 'left' }}>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {claims.map((claim, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #333' }}>
                        <td style={{ padding: '0.75rem' }}>{claim.claimID}</td>
                        <td style={{ padding: '0.75rem' }}>{claim.patientName}</td>
                        <td style={{ padding: '0.75rem' }}>{claim.faskesName}</td>
                        <td style={{ padding: '0.75rem' }}>
                          Rp {parseInt(claim.claimAmount || 0).toLocaleString('id-ID')}
                        </td>
                        <td style={{ padding: '0.75rem' }}>
                          <span className={`status-badge ${
                            claim.status === 'approved' ? 'online' : 
                            claim.status === 'rejected' ? 'offline' : 'warning'
                          }`}>
                            {claim.status}
                          </span>
                        </td>
                        <td style={{ padding: '0.75rem' }}>{claim.serviceDate}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Audit Logs */}
        {activeTab === 'audit' && (
          <div>
            <h3 className="section-title">Blockchain Audit Trail ({auditLogs.length})</h3>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <span className="loading"></span> Loading audit logs...
              </div>
            ) : auditLogs.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#888' }}>No audit logs found</p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#1e1e1e', borderBottom: '2px solid #333' }}>
                      <th style={{ padding: '0.75rem', textAlign: 'left' }}>Timestamp</th>
                      <th style={{ padding: '0.75rem', textAlign: 'left' }}>Action</th>
                      <th style={{ padding: '0.75rem', textAlign: 'left' }}>Actor</th>
                      <th style={{ padding: '0.75rem', textAlign: 'left' }}>Entity Type</th>
                      <th style={{ padding: '0.75rem', textAlign: 'left' }}>Entity ID</th>
                      <th style={{ padding: '0.75rem', textAlign: 'left' }}>Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditLogs.map((log, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #333' }}>
                        <td style={{ padding: '0.75rem' }}>
                          {new Date(log.timestamp).toLocaleString('id-ID')}
                        </td>
                        <td style={{ padding: '0.75rem' }}>{log.action}</td>
                        <td style={{ padding: '0.75rem' }}>{log.actor}</td>
                        <td style={{ padding: '0.75rem' }}>{log.entityType}</td>
                        <td style={{ padding: '0.75rem' }}>{log.entityID}</td>
                        <td style={{ padding: '0.75rem' }}>{log.details}</td>
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
