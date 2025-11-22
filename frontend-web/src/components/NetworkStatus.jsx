import { useState, useEffect } from 'react'
import { apiService } from '../services/api'

function NetworkStatus({ addLog }) {
  const [status, setStatus] = useState({
    apiConnected: false,
    blockchainRunning: false,
    peers: 0,
    orderers: 0,
    channels: 0
  })
  const [loading, setLoading] = useState(false)

  const checkNetworkStatus = async () => {
    setLoading(true)
    addLog('info', '🔍 Checking blockchain network status...')
    
    try {
      const response = await apiService.getNetworkStatus()
      
      const newStatus = {
        apiConnected: response.apiConnected,
        blockchainRunning: response.blockchainRunning,
        peers: response.apiConnected ? 2 : 0, // We have 2 peers running
        orderers: response.apiConnected ? 1 : 0, // 1 orderer running
        channels: response.apiConnected ? 1 : 0
      }
      setStatus(newStatus)
      addLog('success', '✅ Network status retrieved successfully', newStatus)
      setLoading(false)
    } catch (error) {
      const newStatus = {
        apiConnected: false,
        blockchainRunning: false,
        peers: 0,
        orderers: 0,
        channels: 0
      }
      setStatus(newStatus)
      addLog('error', '❌ Failed to check network status: ' + error.message, { error: error.message })
      setLoading(false)
    }
  }

  useEffect(() => {
    checkNetworkStatus()
  }, [])

  return (
    <div className="component-container">
      <h2 className="component-title">🌐 Network Status</h2>
      
      <div className="section">
        <h3 className="section-title">Connection Status</h3>
        <div className="info-grid">
          <div className="info-card">
            <div className="info-card-title">API Server</div>
            <div className="info-card-value">
              <span className={`status-badge ${status.apiConnected ? 'online' : 'offline'}`}>
                {status.apiConnected ? '✅ Connected' : '❌ Offline'}
              </span>
            </div>
          </div>
          <div className="info-card">
            <div className="info-card-title">Blockchain Network</div>
            <div className="info-card-value">
              <span className={`status-badge ${status.blockchainRunning ? 'online' : 'offline'}`}>
                {status.blockchainRunning ? '✅ Running' : '❌ Stopped'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="section">
        <h3 className="section-title">Network Components</h3>
        <div className="info-grid">
          <div className="info-card">
            <div className="info-card-title">Active Peers</div>
            <div className="info-card-value">{status.peers} / 6</div>
          </div>
          <div className="info-card">
            <div className="info-card-title">Ordering Nodes</div>
            <div className="info-card-value">{status.orderers} / 5</div>
          </div>
          <div className="info-card">
            <div className="info-card-title">Channels</div>
            <div className="info-card-value">{status.channels}</div>
          </div>
        </div>
      </div>

      <div className="section">
        <h3 className="section-title">Organizations</h3>
        <div className="info-grid">
          <div className="info-card">
            <div className="info-card-title">🏛️ BPJS</div>
            <div className="info-card-value">
              <span className="status-badge online">Active</span>
            </div>
            <p style={{color: '#aaa', fontSize: '0.85rem', marginTop: '0.5rem'}}>
              2 Peers | MSP: BPJSMSP
            </p>
          </div>
          <div className="info-card">
            <div className="info-card-title">🏥 Rumah Sakit</div>
            <div className="info-card-value">
              <span className="status-badge online">Active</span>
            </div>
            <p style={{color: '#aaa', fontSize: '0.85rem', marginTop: '0.5rem'}}>
              2 Peers | MSP: RumahSakitMSP
            </p>
          </div>
          <div className="info-card">
            <div className="info-card-title">🏪 Puskesmas</div>
            <div className="info-card-value">
              <span className="status-badge online">Active</span>
            </div>
            <p style={{color: '#aaa', fontSize: '0.85rem', marginTop: '0.5rem'}}>
              2 Peers | MSP: PuskesmasMSP
            </p>
          </div>
        </div>
      </div>

      <div className="section">
        <button 
          className="btn btn-primary" 
          onClick={checkNetworkStatus}
          disabled={loading}
        >
          {loading ? <span className="loading"></span> : '🔄'}
          Refresh Status
        </button>
      </div>

      <div className="section">
        <h3 className="section-title">System Information</h3>
        <div className="result-box">
          <pre>{JSON.stringify({
            environment: 'Development',
            platform: 'Windows',
            ram: '8GB',
            consensus: 'Raft',
            throughput: '550 TPS',
            latency: '<100ms',
            channel: 'bpjs-main',
            chaincode: 'bpjs v1.0'
          }, null, 2)}</pre>
        </div>
      </div>
    </div>
  )
}

export default NetworkStatus
