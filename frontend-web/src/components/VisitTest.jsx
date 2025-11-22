import { useState } from 'react'
import { apiService } from '../services/api'

function VisitTest({ addLog }) {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [formData, setFormData] = useState({
    visitID: 'VISIT' + Date.now(),
    cardID: 'CARD123',
    patientID: 'P001',
    patientName: 'John Doe',
    faskesCode: 'RS001',
    faskesName: 'RS Siloam',
    faskesType: 'rumahsakit',
    visitDate: new Date().toISOString().split('T')[0],
    visitType: 'outpatient',
    diagnosis: 'Common Cold',
    treatment: 'Paracetamol, Rest',
    doctorName: 'Dr. Smith',
    doctorID: 'DOC001',
    notes: 'Patient recovering well'
  })

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const recordVisit = async () => {
    setLoading(true)
    addLog('info', '🚀 Recording patient visit to blockchain...', formData)
    
    try {
      const response = await apiService.recordVisit(formData)
      
      setResult(response)
      addLog('success', '✅ Visit recorded on blockchain!', response)
    } catch (error) {
      addLog('error', '❌ Failed to record visit: ' + error.message, { error: error.message })
      setResult({ success: false, error: error.message })
    } finally {
      setLoading(false)
    }
  }

  const getPatientHistory = async () => {
    setLoading(true)
    addLog('info', `🔍 Fetching visit history from blockchain for patient: ${formData.patientID}`)
    
    try {
      const response = await apiService.getPatientVisits(formData.patientID)
      
      setResult(response)
      addLog('success', '✅ Patient history retrieved from blockchain!', response)
    } catch (error) {
      addLog('error', '❌ Failed to get patient history: ' + error.message, { error: error.message })
      setResult({ success: false, error: error.message })
    } finally {
      setLoading(false)
    }
  }

  const generateSampleData = () => {
    const timestamp = Date.now()
    const diagnoses = ['Common Cold', 'Flu', 'Fever', 'Headache', 'Checkup', 'Diabetes Control']
    const faskes = [
      { code: 'RS001', name: 'RS Siloam', type: 'rumahsakit' },
      { code: 'RS002', name: 'RS Cipto', type: 'rumahsakit' },
      { code: 'PKM001', name: 'Puskesmas Menteng', type: 'puskesmas' }
    ]
    const selectedFaskes = faskes[Math.floor(Math.random() * faskes.length)]
    
    setFormData({
      visitID: 'VISIT' + timestamp,
      cardID: 'CARD' + Math.floor(Math.random() * 1000),
      patientID: 'P' + Math.floor(Math.random() * 1000),
      patientName: 'Patient ' + Math.floor(Math.random() * 1000),
      faskesCode: selectedFaskes.code,
      faskesName: selectedFaskes.name,
      faskesType: selectedFaskes.type,
      visitDate: new Date().toISOString().split('T')[0],
      visitType: ['outpatient', 'inpatient', 'emergency'][Math.floor(Math.random() * 3)],
      diagnosis: diagnoses[Math.floor(Math.random() * diagnoses.length)],
      treatment: 'Medication and rest prescribed',
      doctorName: 'Dr. ' + ['Smith', 'Johnson', 'Lee', 'Wong', 'Kumar'][Math.floor(Math.random() * 5)],
      doctorID: 'DOC' + Math.floor(Math.random() * 100),
      notes: 'Patient condition stable'
    })
    addLog('info', 'Generated sample visit data')
  }

  return (
    <div className="component-container">
      <h2 className="component-title">🏥 Patient Visit Test</h2>
      
      <div className="section">
        <h3 className="section-title">Visit Information</h3>
        
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
          <label>Card ID</label>
          <input
            type="text"
            name="cardID"
            value={formData.cardID}
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
          <label>Facility Type</label>
          <select name="faskesType" value={formData.faskesType} onChange={handleInputChange}>
            <option value="puskesmas">Puskesmas (Clinic)</option>
            <option value="rumahsakit">Rumah Sakit (Hospital)</option>
          </select>
        </div>

        <div className="form-group">
          <label>Visit Date</label>
          <input
            type="date"
            name="visitDate"
            value={formData.visitDate}
            onChange={handleInputChange}
          />
        </div>

        <div className="form-group">
          <label>Visit Type</label>
          <select name="visitType" value={formData.visitType} onChange={handleInputChange}>
            <option value="outpatient">Outpatient (Rawat Jalan)</option>
            <option value="inpatient">Inpatient (Rawat Inap)</option>
            <option value="emergency">Emergency (IGD)</option>
          </select>
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
          <label>Doctor Name</label>
          <input
            type="text"
            name="doctorName"
            value={formData.doctorName}
            onChange={handleInputChange}
          />
        </div>

        <div className="form-group">
          <label>Doctor ID</label>
          <input
            type="text"
            name="doctorID"
            value={formData.doctorID}
            onChange={handleInputChange}
          />
        </div>

        <div className="form-group">
          <label>Notes</label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleInputChange}
          />
        </div>
      </div>

      <div className="section">
        <button 
          className="btn btn-primary" 
          onClick={recordVisit}
          disabled={loading}
          style={{marginRight: '1rem'}}
        >
          {loading ? <span className="loading"></span> : '📝'}
          Record Visit
        </button>
        
        <button 
          className="btn btn-success" 
          onClick={getPatientHistory}
          disabled={loading}
          style={{marginRight: '1rem'}}
        >
          {loading ? <span className="loading"></span> : '📋'}
          Get Patient History
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

export default VisitTest
