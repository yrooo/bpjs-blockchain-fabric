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
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Visit ID</label>
          <input
            type="text"
            name="visitID"
            value={formData.visitID}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-bpjs-primary focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Card ID</label>
          <input
            type="text"
            name="cardID"
            value={formData.cardID}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-bpjs-primary focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Patient ID</label>
          <input
            type="text"
            name="patientID"
            value={formData.patientID}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-bpjs-primary focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Patient Name</label>
          <input
            type="text"
            name="patientName"
            value={formData.patientName}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-bpjs-primary focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Facility Code</label>
          <input
            type="text"
            name="faskesCode"
            value={formData.faskesCode}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-bpjs-primary focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Facility Name</label>
          <input
            type="text"
            name="faskesName"
            value={formData.faskesName}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-bpjs-primary focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Facility Type</label>
          <select 
            name="faskesType" 
            value={formData.faskesType} 
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-bpjs-primary focus:border-transparent"
          >
            <option value="puskesmas">Puskesmas (Clinic)</option>
            <option value="rumahsakit">Rumah Sakit (Hospital)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Visit Date</label>
          <input
            type="date"
            name="visitDate"
            value={formData.visitDate}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-bpjs-primary focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Visit Type</label>
          <select 
            name="visitType" 
            value={formData.visitType} 
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-bpjs-primary focus:border-transparent"
          >
            <option value="outpatient">Outpatient (Rawat Jalan)</option>
            <option value="inpatient">Inpatient (Rawat Inap)</option>
            <option value="emergency">Emergency (IGD)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Diagnosis</label>
          <input
            type="text"
            name="diagnosis"
            value={formData.diagnosis}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-bpjs-primary focus:border-transparent"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Treatment</label>
          <textarea
            name="treatment"
            value={formData.treatment}
            onChange={handleInputChange}
            rows="3"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-bpjs-primary focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Doctor Name</label>
          <input
            type="text"
            name="doctorName"
            value={formData.doctorName}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-bpjs-primary focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Doctor ID</label>
          <input
            type="text"
            name="doctorID"
            value={formData.doctorID}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-bpjs-primary focus:border-transparent"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleInputChange}
            rows="3"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-bpjs-primary focus:border-transparent"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <button 
          onClick={recordVisit}
          disabled={loading}
          className="px-4 py-2 bg-bpjs-primary text-white rounded-md hover:bg-bpjs-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
        >
          {loading ? <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span> : <span>📝</span>}
          <span>Record Visit</span>
        </button>
        
        <button 
          onClick={getPatientHistory}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
        >
          {loading ? <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span> : <span>📋</span>}
          <span>Get Patient History</span>
        </button>

        <button 
          onClick={generateSampleData}
          className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-colors flex items-center space-x-2"
        >
          <span>🎲</span>
          <span>Generate Sample Data</span>
        </button>
      </div>

      {result && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Result</h3>
          <div className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto">
            <pre className="text-sm">{JSON.stringify(result, null, 2)}</pre>
          </div>
        </div>
      )}
    </div>
  )
}

export default VisitTest
