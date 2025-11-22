import { useState } from 'react'
import { apiService } from '../services/api'

function CardTest({ addLog }) {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [formData, setFormData] = useState({
    cardID: 'CARD' + Date.now(),
    patientID: 'P' + Date.now(),
    patientName: 'John Doe',
    nik: '1234567890123456',
    dateOfBirth: '1990-01-01',
    gender: 'Male',
    address: 'Jakarta, Indonesia',
    cardType: 'PBI',
    issueDate: new Date().toISOString().split('T')[0],
    expiryDate: new Date(Date.now() + 365*24*60*60*1000).toISOString().split('T')[0]
  })

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const issueCard = async () => {
    setLoading(true)
    addLog('info', '🚀 Issuing BPJS card to blockchain...', formData)
    
    try {
      const response = await apiService.issueCard(formData)
      
      setResult(response)
      addLog('success', '✅ Card issued successfully on blockchain!', response)
    } catch (error) {
      addLog('error', '❌ Failed to issue card: ' + error.message, { error: error.message })
      setResult({ success: false, error: error.message })
    } finally {
      setLoading(false)
    }
  }

  const verifyCard = async () => {
    setLoading(true)
    addLog('info', `🔍 Verifying card from blockchain: ${formData.cardID}`)
    
    try {
      const response = await apiService.verifyCard(formData.cardID)
      
      // Add QR code to response
      if (response.success && response.card) {
        response.card.qrCode = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${formData.cardID}`
      }
      
      setResult(response)
      addLog('success', '✅ Card verified from blockchain!', response)
    } catch (error) {
      addLog('error', '❌ Failed to verify card: ' + error.message, { error: error.message })
      setResult({ success: false, error: error.message })
    } finally {
      setLoading(false)
    }
  }

  const generateSampleData = () => {
    const timestamp = Date.now()
    setFormData({
      cardID: 'CARD' + timestamp,
      patientID: 'P' + timestamp,
      patientName: 'Sample Patient ' + Math.floor(Math.random() * 1000),
      nik: '32' + String(Math.floor(Math.random() * 1000000000000000)).padStart(14, '0'),
      dateOfBirth: '1990-01-01',
      gender: Math.random() > 0.5 ? 'Male' : 'Female',
      address: ['Jakarta', 'Surabaya', 'Bandung', 'Medan'][Math.floor(Math.random() * 4)] + ', Indonesia',
      cardType: Math.random() > 0.5 ? 'PBI' : 'Non-PBI',
      issueDate: new Date().toISOString().split('T')[0],
      expiryDate: new Date(Date.now() + 365*24*60*60*1000).toISOString().split('T')[0]
    })
    addLog('info', 'Generated sample card data')
  }

  return (
    <div className="component-container">
      <h2 className="component-title">💳 BPJS Card Test</h2>
      
      <div className="section">
        <h3 className="section-title">Card Information</h3>
        
        <div className="form-group">
          <label>Card ID</label>
          <input
            type="text"
            name="cardID"
            value={formData.cardID}
            onChange={handleInputChange}
            placeholder="CARD123"
          />
        </div>

        <div className="form-group">
          <label>Patient ID</label>
          <input
            type="text"
            name="patientID"
            value={formData.patientID}
            onChange={handleInputChange}
            placeholder="P001"
          />
        </div>

        <div className="form-group">
          <label>Patient Name</label>
          <input
            type="text"
            name="patientName"
            value={formData.patientName}
            onChange={handleInputChange}
            placeholder="John Doe"
          />
        </div>

        <div className="form-group">
          <label>NIK (National ID)</label>
          <input
            type="text"
            name="nik"
            value={formData.nik}
            onChange={handleInputChange}
            placeholder="1234567890123456"
          />
        </div>

        <div className="form-group">
          <label>Date of Birth</label>
          <input
            type="date"
            name="dateOfBirth"
            value={formData.dateOfBirth}
            onChange={handleInputChange}
          />
        </div>

        <div className="form-group">
          <label>Gender</label>
          <select name="gender" value={formData.gender} onChange={handleInputChange}>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
        </div>

        <div className="form-group">
          <label>Address</label>
          <textarea
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            placeholder="Patient address"
          />
        </div>

        <div className="form-group">
          <label>Card Type</label>
          <select name="cardType" value={formData.cardType} onChange={handleInputChange}>
            <option value="PBI">PBI (Penerima Bantuan Iuran)</option>
            <option value="Non-PBI">Non-PBI</option>
          </select>
        </div>

        <div className="form-group">
          <label>Issue Date</label>
          <input
            type="date"
            name="issueDate"
            value={formData.issueDate}
            onChange={handleInputChange}
          />
        </div>

        <div className="form-group">
          <label>Expiry Date</label>
          <input
            type="date"
            name="expiryDate"
            value={formData.expiryDate}
            onChange={handleInputChange}
          />
        </div>
      </div>

      <div className="section">
        <button 
          className="btn btn-primary" 
          onClick={issueCard}
          disabled={loading}
          style={{marginRight: '1rem'}}
        >
          {loading ? <span className="loading"></span> : '✅'}
          Issue Card
        </button>
        
        <button 
          className="btn btn-success" 
          onClick={verifyCard}
          disabled={loading}
          style={{marginRight: '1rem'}}
        >
          {loading ? <span className="loading"></span> : '🔍'}
          Verify Card
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

export default CardTest
