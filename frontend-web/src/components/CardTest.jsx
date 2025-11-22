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
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Card ID</label>
          <input
            type="text"
            name="cardID"
            value={formData.cardID}
            onChange={handleInputChange}
            placeholder="CARD123"
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
            placeholder="P001"
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
            placeholder="John Doe"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-bpjs-primary focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">NIK (National ID)</label>
          <input
            type="text"
            name="nik"
            value={formData.nik}
            onChange={handleInputChange}
            placeholder="1234567890123456"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-bpjs-primary focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
          <input
            type="date"
            name="dateOfBirth"
            value={formData.dateOfBirth}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-bpjs-primary focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
          <select 
            name="gender" 
            value={formData.gender} 
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-bpjs-primary focus:border-transparent"
          >
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
          <textarea
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            placeholder="Patient address"
            rows="3"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-bpjs-primary focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Card Type</label>
          <select 
            name="cardType" 
            value={formData.cardType} 
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-bpjs-primary focus:border-transparent"
          >
            <option value="PBI">PBI (Penerima Bantuan Iuran)</option>
            <option value="Non-PBI">Non-PBI</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Issue Date</label>
          <input
            type="date"
            name="issueDate"
            value={formData.issueDate}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-bpjs-primary focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
          <input
            type="date"
            name="expiryDate"
            value={formData.expiryDate}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-bpjs-primary focus:border-transparent"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <button 
          onClick={issueCard}
          disabled={loading}
          className="px-4 py-2 bg-bpjs-primary text-white rounded-md hover:bg-bpjs-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
        >
          {loading ? <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span> : <span>✅</span>}
          <span>Issue Card</span>
        </button>
        
        <button 
          onClick={verifyCard}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
        >
          {loading ? <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span> : <span>🔍</span>}
          <span>Verify Card</span>
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

export default CardTest
