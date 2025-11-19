import { useState, useEffect, useRef } from 'react'

function DebugConsole({ logs, clearLogs }) {
  const [filter, setFilter] = useState('all')
  const [expandedLogs, setExpandedLogs] = useState(new Set())
  const [autoScroll, setAutoScroll] = useState(true)
  const logContainerRef = useRef(null)

  // Auto scroll to bottom when new logs arrive
  useEffect(() => {
    if (autoScroll && logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight
    }
  }, [logs, autoScroll])

  const filteredLogs = logs.filter(log => {
    if (filter === 'all') return true
    return log.type === filter
  })

  const toggleExpand = (index) => {
    const newExpanded = new Set(expandedLogs)
    if (newExpanded.has(index)) {
      newExpanded.delete(index)
    } else {
      newExpanded.add(index)
    }
    setExpandedLogs(newExpanded)
  }

  const getLogIcon = (type) => {
    switch(type) {
      case 'success': return '✅'
      case 'error': return '❌'
      case 'warning': return '⚠️'
      case 'info': return 'ℹ️'
      default: return '📝'
    }
  }

  const getLogColor = (type) => {
    switch(type) {
      case 'success': return '#00ff88'
      case 'error': return '#ff4444'
      case 'warning': return '#ffaa00'
      case 'info': return '#00d4ff'
      default: return '#aaaaaa'
    }
  }

  const downloadLogs = () => {
    const logData = JSON.stringify(logs, null, 2)
    const blob = new Blob([logData], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `bpjs-blockchain-logs-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const copyLog = (log) => {
    const logText = JSON.stringify(log, null, 2)
    navigator.clipboard.writeText(logText)
    alert('Log copied to clipboard!')
  }

  return (
    <div className="component-container">
      <h2 className="component-title">🐛 Debug Console</h2>
      
      <div className="section">
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div className="form-group" style={{ flex: '1', minWidth: '200px', marginBottom: 0 }}>
            <label>Filter by Type</label>
            <select 
              value={filter} 
              onChange={(e) => setFilter(e.target.value)}
              style={{fontSize: '0.95rem'}}
            >
              <option value="all">All ({logs.length})</option>
              <option value="success">Success ({logs.filter(l => l.type === 'success').length})</option>
              <option value="error">Error ({logs.filter(l => l.type === 'error').length})</option>
              <option value="warning">Warning ({logs.filter(l => l.type === 'warning').length})</option>
              <option value="info">Info ({logs.filter(l => l.type === 'info').length})</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={autoScroll}
                onChange={(e) => setAutoScroll(e.target.checked)}
                style={{ cursor: 'pointer' }}
              />
              <span style={{ color: '#fff', fontSize: '0.9rem' }}>Auto Scroll</span>
            </label>
          </div>

          <button 
            className="btn btn-warning"
            onClick={downloadLogs}
            style={{ padding: '0.7rem 1.5rem' }}
          >
            💾 Download Logs
          </button>
          
          <button 
            className="btn btn-danger"
            onClick={clearLogs}
            style={{ padding: '0.7rem 1.5rem' }}
          >
            🗑️ Clear Logs
          </button>
        </div>
      </div>

      <div className="section">
        <div className="log-stats" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '1rem',
          marginBottom: '1rem'
        }}>
          <div className="stat-card" style={{
            background: 'linear-gradient(135deg, #00ff8840, #00ff8820)',
            border: '1px solid #00ff88',
            padding: '1rem',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '2rem', color: '#00ff88' }}>
              {logs.filter(l => l.type === 'success').length}
            </div>
            <div style={{ fontSize: '0.85rem', color: '#fff', marginTop: '0.3rem' }}>
              Success
            </div>
          </div>
          
          <div className="stat-card" style={{
            background: 'linear-gradient(135deg, #ff444440, #ff444420)',
            border: '1px solid #ff4444',
            padding: '1rem',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '2rem', color: '#ff4444' }}>
              {logs.filter(l => l.type === 'error').length}
            </div>
            <div style={{ fontSize: '0.85rem', color: '#fff', marginTop: '0.3rem' }}>
              Errors
            </div>
          </div>
          
          <div className="stat-card" style={{
            background: 'linear-gradient(135deg, #ffaa0040, #ffaa0020)',
            border: '1px solid #ffaa00',
            padding: '1rem',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '2rem', color: '#ffaa00' }}>
              {logs.filter(l => l.type === 'warning').length}
            </div>
            <div style={{ fontSize: '0.85rem', color: '#fff', marginTop: '0.3rem' }}>
              Warnings
            </div>
          </div>
          
          <div className="stat-card" style={{
            background: 'linear-gradient(135deg, #00d4ff40, #00d4ff20)',
            border: '1px solid #00d4ff',
            padding: '1rem',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '2rem', color: '#00d4ff' }}>
              {logs.filter(l => l.type === 'info').length}
            </div>
            <div style={{ fontSize: '0.85rem', color: '#fff', marginTop: '0.3rem' }}>
              Info
            </div>
          </div>
        </div>

        <div 
          ref={logContainerRef}
          className="log-container"
          style={{
            maxHeight: '500px',
            overflowY: 'auto',
            background: '#0a0a0a',
            border: '1px solid #333',
            borderRadius: '8px',
            padding: '1rem'
          }}
        >
          {filteredLogs.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '3rem',
              color: '#666',
              fontSize: '1rem'
            }}>
              📝 No logs to display. Start testing to see logs here!
            </div>
          ) : (
            filteredLogs.map((log, index) => {
              const isExpanded = expandedLogs.has(index)
              const hasData = log.data && typeof log.data === 'object'
              
              return (
                <div 
                  key={index}
                  className="log-entry"
                  style={{
                    background: '#16213e',
                    border: `1px solid ${getLogColor(log.type)}40`,
                    borderLeft: `4px solid ${getLogColor(log.type)}`,
                    borderRadius: '6px',
                    padding: '1rem',
                    marginBottom: '0.8rem',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <span style={{ fontSize: '1.2rem' }}>{getLogIcon(log.type)}</span>
                        <span 
                          className="status-badge"
                          style={{ 
                            background: getLogColor(log.type) + '40',
                            color: getLogColor(log.type),
                            border: `1px solid ${getLogColor(log.type)}`,
                            fontSize: '0.75rem',
                            padding: '0.2rem 0.6rem'
                          }}
                        >
                          {log.type.toUpperCase()}
                        </span>
                        <span style={{ color: '#666', fontSize: '0.8rem' }}>
                          {new Date(log.timestamp).toLocaleString()}
                        </span>
                      </div>
                      
                      <div style={{ color: '#fff', fontSize: '0.95rem', marginBottom: '0.5rem' }}>
                        {log.message}
                      </div>
                      
                      {hasData && (
                        <div>
                          <button
                            onClick={() => toggleExpand(index)}
                            style={{
                              background: '#1a1a2e',
                              color: '#00d4ff',
                              border: '1px solid #00d4ff40',
                              padding: '0.3rem 0.8rem',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '0.8rem',
                              marginTop: '0.5rem'
                            }}
                          >
                            {isExpanded ? '▼ Hide Data' : '▶ Show Data'}
                          </button>
                          
                          {isExpanded && (
                            <div style={{
                              background: '#0a0a0a',
                              border: '1px solid #333',
                              borderRadius: '4px',
                              padding: '0.8rem',
                              marginTop: '0.8rem',
                              maxHeight: '300px',
                              overflowY: 'auto'
                            }}>
                              <pre style={{
                                margin: 0,
                                fontSize: '0.85rem',
                                color: '#00ff88',
                                fontFamily: 'monospace',
                                whiteSpace: 'pre-wrap',
                                wordBreak: 'break-word'
                              }}>
                                {JSON.stringify(log.data, null, 2)}
                              </pre>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <button
                      onClick={() => copyLog(log)}
                      style={{
                        background: 'transparent',
                        border: '1px solid #666',
                        color: '#aaa',
                        padding: '0.4rem 0.8rem',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '0.8rem',
                        marginLeft: '1rem',
                        flexShrink: 0
                      }}
                      title="Copy log to clipboard"
                    >
                      📋 Copy
                    </button>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      <div className="section">
        <div className="info-card">
          <div className="info-card-title">Debug Console Info</div>
          <ul style={{ color: '#aaa', fontSize: '0.9rem', marginTop: '0.8rem', lineHeight: '1.8' }}>
            <li>All operations from other tabs are logged here</li>
            <li>Use filters to view specific log types</li>
            <li>Click "Show Data" to expand log details</li>
            <li>Auto-scroll keeps the latest logs visible</li>
            <li>Download logs for offline analysis</li>
            <li>Logs are stored in browser memory (cleared on refresh)</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default DebugConsole
