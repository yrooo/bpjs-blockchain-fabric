import { useState } from 'react'

function ChaincodeTest({ addLog }) {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [selectedFunction, setSelectedFunction] = useState('IssueCard')
  const [argsInput, setArgsInput] = useState('')

  const chaincodeFunctions = {
    'IssueCard': {
      description: 'Issue a new BPJS card',
      args: ['cardID', 'patientID', 'patientName', 'nik', 'dateOfBirth', 'gender', 'address', 'cardType', 'issueDate', 'expiryDate'],
      example: '["CARD001", "P001", "John Doe", "1234567890123456", "1990-01-01", "Male", "Jakarta", "PBI", "2024-01-01", "2025-01-01"]'
    },
    'VerifyCard': {
      description: 'Verify a BPJS card',
      args: ['cardID'],
      example: '["CARD001"]'
    },
    'UpdateCardStatus': {
      description: 'Update card status',
      args: ['cardID', 'newStatus', 'reason'],
      example: '["CARD001", "suspended", "Payment overdue"]'
    },
    'RecordVisit': {
      description: 'Record a patient visit',
      args: ['visitID', 'cardID', 'patientID', 'patientName', 'faskesCode', 'faskesName', 'faskesType', 'visitDate', 'visitType', 'diagnosis', 'treatment', 'doctorName', 'doctorID', 'notes'],
      example: '["VISIT001", "CARD001", "P001", "John Doe", "RS001", "RS Siloam", "rumahsakit", "2024-01-01", "outpatient", "Flu", "Medicine", "Dr. Smith", "DOC001", "Notes"]'
    },
    'GetPatientVisits': {
      description: 'Get all visits for a patient',
      args: ['patientID'],
      example: '["P001"]'
    },
    'CreateReferral': {
      description: 'Create a referral',
      args: ['referralID', 'patientID', 'patientName', 'cardID', 'fromFaskesCode', 'fromFaskesName', 'toFaskesCode', 'toFaskesName', 'referralReason', 'diagnosis', 'referringDoctor', 'referralDate', 'validUntil', 'notes'],
      example: '["REF001", "P001", "John Doe", "CARD001", "PKM001", "Puskesmas", "RS001", "RS Siloam", "Specialist needed", "Complex case", "Dr. Lee", "2024-01-01", "2024-01-31", "Urgent"]'
    },
    'UpdateReferralStatus': {
      description: 'Update referral status',
      args: ['referralID', 'newStatus', 'acceptedBy', 'notes'],
      example: '["REF001", "accepted", "Dr. Wong", "Patient scheduled"]'
    },
    'SubmitClaim': {
      description: 'Submit an insurance claim',
      args: ['claimID', 'patientID', 'patientName', 'cardID', 'visitID', 'faskesCode', 'faskesName', 'claimType', 'serviceDate', 'diagnosis', 'treatment', 'totalAmount', 'claimAmount'],
      example: '["CLAIM001", "P001", "John Doe", "CARD001", "VISIT001", "RS001", "RS Siloam", "rawat-jalan", "2024-01-01", "Flu", "Consultation", "500000", "450000"]'
    },
    'ProcessClaim': {
      description: 'Process a claim (approve/reject)',
      args: ['claimID', 'newStatus', 'reviewNotes'],
      example: '["CLAIM001", "approved", "All documentation complete"]'
    },
    'GetPatientClaims': {
      description: 'Get all claims for a patient',
      args: ['patientID'],
      example: '["P001"]'
    },
    'QueryAuditLogs': {
      description: 'Query audit logs',
      args: ['startKey', 'endKey'],
      example: '["AUDIT_0", "AUDIT_999999999999999"]'
    }
  }

  const invokeChaincode = async () => {
    setLoading(true)
    const funcInfo = chaincodeFunctions[selectedFunction]
    
    addLog('info', `Invoking chaincode function: ${selectedFunction}`, {
      function: selectedFunction,
      args: argsInput
    })
    
    try {
      // Parse args
      const args = argsInput ? JSON.parse(argsInput) : []
      
      // Simulate chaincode invocation
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const response = {
        success: true,
        function: selectedFunction,
        args: args,
        result: {
          message: `${selectedFunction} executed successfully`,
          transactionID: 'TX' + Date.now(),
          blockNumber: Math.floor(Math.random() * 1000) + 100,
          timestamp: new Date().toISOString(),
          data: `Simulated result for ${selectedFunction}`
        }
      }
      
      setResult(response)
      addLog('success', `Chaincode invocation successful!`, response)
    } catch (error) {
      addLog('error', 'Chaincode invocation failed', error.message)
    } finally {
      setLoading(false)
    }
  }

  const queryChaincode = async () => {
    setLoading(true)
    
    addLog('info', `Querying chaincode function: ${selectedFunction}`, {
      function: selectedFunction,
      args: argsInput
    })
    
    try {
      const args = argsInput ? JSON.parse(argsInput) : []
      
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      const response = {
        success: true,
        function: selectedFunction,
        args: args,
        result: {
          message: `Query ${selectedFunction} successful`,
          data: {
            sampleData: 'This would contain the actual query result',
            timestamp: new Date().toISOString()
          }
        }
      }
      
      setResult(response)
      addLog('success', `Chaincode query successful!`, response)
    } catch (error) {
      addLog('error', 'Chaincode query failed', error.message)
    } finally {
      setLoading(false)
    }
  }

  const loadExample = () => {
    const funcInfo = chaincodeFunctions[selectedFunction]
    setArgsInput(funcInfo.example)
    addLog('info', `Loaded example args for ${selectedFunction}`)
  }

  return (
    <div className="component-container">
      <h2 className="component-title">📜 Chaincode Direct Test</h2>
      
      <div className="section">
        <h3 className="section-title">Function Selection</h3>
        
        <div className="form-group">
          <label>Select Chaincode Function</label>
          <select 
            value={selectedFunction} 
            onChange={(e) => setSelectedFunction(e.target.value)}
            style={{fontSize: '1rem', padding: '1rem'}}
          >
            {Object.keys(chaincodeFunctions).map(func => (
              <option key={func} value={func}>{func}</option>
            ))}
          </select>
        </div>

        <div className="info-card" style={{marginTop: '1rem'}}>
          <div className="info-card-title">Function Info</div>
          <p style={{color: '#fff', marginTop: '0.5rem'}}>
            {chaincodeFunctions[selectedFunction].description}
          </p>
          <p style={{color: '#aaa', fontSize: '0.85rem', marginTop: '0.5rem'}}>
            <strong>Required Arguments:</strong>
          </p>
          <ul style={{color: '#00d4ff', fontSize: '0.85rem', marginLeft: '1.5rem'}}>
            {chaincodeFunctions[selectedFunction].args.map(arg => (
              <li key={arg}>{arg}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="section">
        <h3 className="section-title">Function Arguments (JSON Array)</h3>
        
        <div className="form-group">
          <label>Arguments (JSON format)</label>
          <textarea
            value={argsInput}
            onChange={(e) => setArgsInput(e.target.value)}
            placeholder='["arg1", "arg2", "arg3"]'
            style={{minHeight: '150px', fontFamily: 'monospace'}}
          />
        </div>

        <button 
          className="btn btn-warning" 
          onClick={loadExample}
          style={{marginBottom: '1rem'}}
        >
          📝 Load Example Args
        </button>
      </div>

      <div className="section">
        <button 
          className="btn btn-primary" 
          onClick={invokeChaincode}
          disabled={loading}
          style={{marginRight: '1rem'}}
        >
          {loading ? <span className="loading"></span> : '⚡'}
          Invoke (Write to Blockchain)
        </button>
        
        <button 
          className="btn btn-success" 
          onClick={queryChaincode}
          disabled={loading}
        >
          {loading ? <span className="loading"></span> : '🔍'}
          Query (Read from Blockchain)
        </button>
      </div>

      {result && (
        <div className="section">
          <h3 className="section-title">Chaincode Response</h3>
          <div className="result-box">
            <pre>{JSON.stringify(result, null, 2)}</pre>
          </div>
        </div>
      )}

      <div className="section">
        <h3 className="section-title">Available Functions Reference</h3>
        <div style={{maxHeight: '300px', overflowY: 'auto'}}>
          {Object.entries(chaincodeFunctions).map(([name, info]) => (
            <div key={name} className="info-card" style={{marginBottom: '1rem'}}>
              <strong style={{color: '#e94560'}}>{name}</strong>
              <p style={{color: '#aaa', fontSize: '0.85rem', margin: '0.5rem 0'}}>
                {info.description}
              </p>
              <p style={{color: '#00d4ff', fontSize: '0.8rem'}}>
                Args: {info.args.join(', ')}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default ChaincodeTest
