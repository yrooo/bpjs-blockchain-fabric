import { useState } from 'react'
import { apiService } from '../services/api'

function ClaimTest({ addLog }) {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [formData, setFormData] = useState({
    claimID: 'CLAIM' + Date.now(),
    patientID: 'P001',
    patientName: 'John Doe',
    cardID: 'CARD123',
    visitID: 'VISIT123',
    faskesCode: 'RS001',
    faskesName: 'RS Siloam',
    claimType: 'rawat-jalan',
    serviceDate: new Date().toISOString().split('T')[0],
    diagnosis: 'Common Cold',
    treatment: 'Consultation + Medicine',
    totalAmount: 500000,
    claimAmount: 450000
  })

  const handleInputChange = (e) => {
    const value = e.target.type === 'number' ? parseFloat(e.target.value) : e.target.value
    setFormData({
      ...formData,
      [e.target.name]: value
    })
  }

  const submitClaim = async () => {
    setLoading(true)
    addLog('info', '🚀 Submitting insurance claim to blockchain...', formData)
    
    try {
      const response = await apiService.submitClaim(formData)
      
      setResult(response)
      addLog('success', '✅ Claim submitted to blockchain!', response)
    } catch (error) {
      addLog('error', '❌ Failed to submit claim: ' + error.message, { error: error.message })
      setResult({ success: false, error: error.message })
    } finally {
      setLoading(false)
    }
  }

  const processClaim = async () => {
    setLoading(true)
    addLog('info', `📝 Processing claim on blockchain: ${formData.claimID}`)
    
    try {
      // Approve the claim (you can add UI for approval/rejection)
      const response = await apiService.processClaim(formData.claimID, 'approved', 'Claim approved by BPJS')
      
      setResult(response)
      addLog('success', '✅ Claim processed on blockchain!', response)
    } catch (error) {
      addLog('error', '❌ Failed to process claim: ' + error.message, { error: error.message })
      setResult({ success: false, error: error.message })
    } finally {
      setLoading(false)
    }
  }

  const getPatientClaims = async () => {
    setLoading(true)
    addLog('info', `🔍 Fetching claims from blockchain for patient: ${formData.patientID}`)
    
    try {
      const response = await apiService.getPatientClaims(formData.patientID)
      
      setResult(response)
      addLog('success', '✅ Patient claims retrieved from blockchain!', response)
    } catch (error) {
      addLog('error', '❌ Failed to get patient claims: ' + error.message, { error: error.message })
      setResult({ success: false, error: error.message })
    } finally {
      setLoading(false)
    }
  }

  const getPatientClaimsOld = async () => {
    setLoading(true)
    addLog('info', `Fetching claims for patient: ${formData.patientID}`)
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      const response = {
        success: true,
        patientID: formData.patientID,
        claims: [
          {
            claimID: 'CLAIM' + (Date.now() - 86400000),
            date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
            faskes: 'RS Siloam',
            amount: 500000,
            status: 'approved'
          },
          {
            claimID: 'CLAIM' + (Date.now() - 172800000),
            date: new Date(Date.now() - 172800000).toISOString().split('T')[0],
            faskes: 'Puskesmas Menteng',
            amount: 150000,
            status: 'paid'
          },
          {
            claimID: 'CLAIM' + (Date.now() - 259200000),
            date: new Date(Date.now() - 259200000).toISOString().split('T')[0],
            faskes: 'RS Cipto',
            amount: 300000,
            status: 'submitted'
          }
        ],
        totalClaims: 3,
        totalAmount: 950000
      }
      
      setResult(response)
      addLog('success', 'Patient claims retrieved!', response)
    } catch (error) {
      addLog('error', 'Failed to get patient claims', error.message)
    } finally {
      setLoading(false)
    }
  }

  const generateSampleData = () => {
    const timestamp = Date.now()
    const claimTypes = ['rawat-jalan', 'rawat-inap', 'emergency']
    const amounts = [150000, 300000, 500000, 750000, 1000000, 2000000]
    const selectedAmount = amounts[Math.floor(Math.random() * amounts.length)]
    
    setFormData({
      claimID: 'CLAIM' + timestamp,
      patientID: 'P' + Math.floor(Math.random() * 1000),
      patientName: 'Patient ' + Math.floor(Math.random() * 1000),
      cardID: 'CARD' + Math.floor(Math.random() * 1000),
      visitID: 'VISIT' + timestamp,
      faskesCode: 'RS' + String(Math.floor(Math.random() * 100)).padStart(3, '0'),
      faskesName: ['RS Siloam', 'RS Cipto', 'RS Harapan Kita', 'Puskesmas Menteng'][Math.floor(Math.random() * 4)],
      claimType: claimTypes[Math.floor(Math.random() * claimTypes.length)],
      serviceDate: new Date().toISOString().split('T')[0],
      diagnosis: ['Flu', 'Diabetes', 'Hypertension', 'Checkup'][Math.floor(Math.random() * 4)],
      treatment: 'Medical consultation and prescribed medication',
      totalAmount: selectedAmount,
      claimAmount: Math.floor(selectedAmount * 0.9) // 90% coverage
    })
    addLog('info', 'Generated sample claim data')
  }

  return (
    <div className="component-container">
      <h2 className="component-title">💰 Insurance Claim Test</h2>
      
      <div className="section">
        <h3 className="section-title">Claim Information</h3>
        
        <div className="form-group">
          <label>Claim ID</label>
          <input
            type="text"
            name="claimID"
            value={formData.claimID}
            onChange={handleInputChange}
          />
        </div>

        <div className="form-group">
          <label>Patient ID</label>
          <input
            type="text"
            name="patientID"
            value={formData.patientID}
            onChange={handleInputChange}
          />
        </div>

        <div className="form-group">
          <label>Patient Name</label>
          <input
            type="text"
            name="patientName"
            value={formData.patientName}
            onChange={handleInputChange}
          />
        </div>

        <div className="form-group">
          <label>Card ID</label>
          <input
            type="text"
            name="cardID"
            value={formData.cardID}
            onChange={handleInputChange}
          />
        </div>

        <div className="form-group">
          <label>Visit ID</label>
          <input
            type="text"
            name="visitID"
            value={formData.visitID}
            onChange={handleInputChange}
          />
        </div>

        <div className="form-group">
          <label>Facility Code</label>
          <input
            type="text"
            name="faskesCode"
            value={formData.faskesCode}
            onChange={handleInputChange}
          />
        </div>

        <div className="form-group">
          <label>Facility Name</label>
          <input
            type="text"
            name="faskesName"
            value={formData.faskesName}
            onChange={handleInputChange}
          />
        </div>

        <div className="form-group">
          <label>Claim Type</label>
          <select name="claimType" value={formData.claimType} onChange={handleInputChange}>
            <option value="rawat-jalan">Rawat Jalan (Outpatient)</option>
            <option value="rawat-inap">Rawat Inap (Inpatient)</option>
            <option value="emergency">Emergency (IGD)</option>
          </select>
        </div>

        <div className="form-group">
          <label>Service Date</label>
          <input
            type="date"
            name="serviceDate"
            value={formData.serviceDate}
            onChange={handleInputChange}
          />
        </div>

        <div className="form-group">
          <label>Diagnosis</label>
          <input
            type="text"
            name="diagnosis"
            value={formData.diagnosis}
            onChange={handleInputChange}
          />
        </div>

        <div className="form-group">
          <label>Treatment</label>
          <textarea
            name="treatment"
            value={formData.treatment}
            onChange={handleInputChange}
          />
        </div>

        <div className="form-group">
          <label>Total Amount (IDR)</label>
          <input
            type="number"
            name="totalAmount"
            value={formData.totalAmount}
            onChange={handleInputChange}
          />
        </div>

        <div className="form-group">
          <label>Claim Amount (IDR)</label>
          <input
            type="number"
            name="claimAmount"
            value={formData.claimAmount}
            onChange={handleInputChange}
          />
        </div>
      </div>

      <div className="section">
        <button 
          className="btn btn-primary" 
          onClick={submitClaim}
          disabled={loading}
          style={{marginRight: '1rem'}}
        >
          {loading ? <span className="loading"></span> : '📤'}
          Submit Claim
        </button>
        
        <button 
          className="btn btn-success" 
          onClick={processClaim}
          disabled={loading}
          style={{marginRight: '1rem'}}
        >
          {loading ? <span className="loading"></span> : '✅'}
          Process Claim (BPJS)
        </button>

        <button 
          className="btn btn-success" 
          onClick={getPatientClaims}
          disabled={loading}
          style={{marginRight: '1rem'}}
        >
          {loading ? <span className="loading"></span> : '📋'}
          Get Patient Claims
        </button>

        <button 
          className="btn btn-warning" 
          onClick={generateSampleData}
        >
          🎲 Generate Sample Data
        </button>
      </div>

      {result && (
        <div className="section">
          <h3 className="section-title">Result</h3>
          <div className="result-box">
            <pre>{JSON.stringify(result, null, 2)}</pre>
          </div>
        </div>
      )}
    </div>
  )
}

export default ClaimTest
