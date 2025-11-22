import { useState } from 'react'
import './App.css'
import NetworkStatus from './components/NetworkStatus'
import BlockchainDashboard from './components/BlockchainDashboard'
import ChaincodeTest from './components/ChaincodeTest'
import CardTest from './components/CardTest'
import VisitTest from './components/VisitTest'
import ClaimTest from './components/ClaimTest'
import DebugConsole from './components/DebugConsole'

function App() {
  const [activeTab, setActiveTab] = useState('network')
  const [logs, setLogs] = useState([])

  const addLog = (type, message, data = null) => {
    const log = {
      id: Date.now(),
      type,
      message,
      data,
      timestamp: new Date().toLocaleTimeString()
    }
    setLogs(prev => [log, ...prev].slice(0, 100)) // Keep last 100 logs
  }

  const tabs = [
    { id: 'network', label: '🌐 Network Status', icon: '🔗' },
    { id: 'dashboard', label: '📊 Data Dashboard', icon: '📊' },
    { id: 'card', label: '💳 Card Test', icon: '💳' },
    { id: 'visit', label: '🏥 Visit Test', icon: '🏥' },
    { id: 'claim', label: '💰 Claim Test', icon: '💰' },
    { id: 'chaincode', label: '📜 Chaincode', icon: '⚙️' },
    { id: 'debug', label: '🐛 Debug Console', icon: '🔍' }
  ]

  return (
    <div className="app">
      <header className="app-header">
        <h1>🏥 BPJS Blockchain - Test & Debug Dashboard</h1>
        <p>Hyperledger Fabric Test Environment (8GB RAM Optimized)</p>
      </header>

      <nav className="tab-nav">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="tab-icon">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </nav>

      <main className="app-content">
        {activeTab === 'network' && <NetworkStatus addLog={addLog} />}
        {activeTab === 'dashboard' && <BlockchainDashboard addLog={addLog} />}
        {activeTab === 'card' && <CardTest addLog={addLog} />}
        {activeTab === 'visit' && <VisitTest addLog={addLog} />}
        {activeTab === 'claim' && <ClaimTest addLog={addLog} />}
        {activeTab === 'chaincode' && <ChaincodeTest addLog={addLog} />}
        {activeTab === 'debug' && <DebugConsole logs={logs} />}
      </main>

      <footer className="app-footer">
        <p>💻 Running on Windows (8GB RAM) | ⚡ Powered by Hyperledger Fabric + Vite + React</p>
      </footer>
    </div>
  )
}

export default App
