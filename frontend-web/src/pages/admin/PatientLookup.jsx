import { useState } from 'react';
import { Search, Loader2, CheckCircle, XCircle, QrCode, User, Calendar, MapPin, CreditCard, AlertCircle } from 'lucide-react';
import QRCode from 'react-qr-code';
import { apiService } from '../../services/api';

const PatientLookup = () => {
  const [searchId, setSearchId] = useState('');
  const [loading, setLoading] = useState(false);
  const [patientData, setPatientData] = useState(null);
  const [error, setError] = useState('');
  const [verificationStatus, setVerificationStatus] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchId.trim()) {
      setError('Please enter a Card ID');
      return;
    }

    setLoading(true);
    setError('');
    setPatientData(null);
    setVerificationStatus(null);

    try {
      const cardData = await apiService.getCard(searchId);
      const verifyData = await apiService.verifyCard(searchId);
      
      setPatientData(cardData);
      setVerificationStatus(verifyData);
    } catch (err) {
      setError('Card not found or blockchain verification failed. Please check the Card ID.');
    } finally {
      setLoading(false);
    }
  };

  const handleScanSimulation = () => {
    // Simulate QR code scan by using the displayed card ID
    if (patientData?.cardID) {
      setSearchId(patientData.cardID);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <QrCode className="h-5 w-5 mr-2 text-bpjs-primary" />
          Patient Verification System
        </h3>
        
        {/* Search Form */}
        <form onSubmit={handleSearch} className="mb-6">
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter Card ID or Scan QR Code
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-bpjs-primary focus:border-bpjs-primary sm:text-sm"
                  placeholder="CARD12345678..."
                  value={searchId}
                  onChange={(e) => setSearchId(e.target.value)}
                />
              </div>
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-bpjs-primary text-white rounded-md hover:bg-bpjs-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-5 w-5" />
                    <span>Verify Patient</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <XCircle className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Verification Status */}
        {verificationStatus && (
          <div className={`mb-6 border-l-4 p-4 ${
            verificationStatus.valid 
              ? 'bg-green-50 border-green-400' 
              : 'bg-red-50 border-red-400'
          }`}>
            <div className="flex">
              <div className="flex-shrink-0">
                {verificationStatus.valid ? (
                  <CheckCircle className="h-5 w-5 text-green-400" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-400" />
                )}
              </div>
              <div className="ml-3">
                <h3 className={`text-sm font-medium ${
                  verificationStatus.valid ? 'text-green-800' : 'text-red-800'
                }`}>
                  {verificationStatus.valid 
                    ? '✓ Card Verified on Blockchain' 
                    : '✗ Card Verification Failed'}
                </h3>
                <div className={`mt-2 text-sm ${
                  verificationStatus.valid ? 'text-green-700' : 'text-red-700'
                }`}>
                  <p>{verificationStatus.message || 'Blockchain verification completed'}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Patient Card Display */}
      {patientData && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Digital Card with QR Code */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-bpjs-primary to-bpjs-dark rounded-xl shadow-xl p-6 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-white opacity-10 rounded-full"></div>
              <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-24 h-24 bg-white opacity-10 rounded-full"></div>
              
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="font-bold text-xl">HealthLink</h3>
                    <p className="text-xs opacity-80">BPJS Digital Card</p>
                  </div>
                  <CreditCard className="h-8 w-8 opacity-80" />
                </div>

                <div className="mb-4">
                  <p className="text-xs opacity-70 uppercase tracking-wider mb-1">Card Number</p>
                  <p className="font-mono text-lg tracking-wide">{patientData.cardID}</p>
                </div>

                <div className="mb-4">
                  <p className="text-xs opacity-70 uppercase tracking-wider mb-1">Name</p>
                  <p className="font-semibold text-xl">{patientData.patientName || patientData.fullName}</p>
                </div>

                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-xs opacity-70 uppercase tracking-wider mb-1">Status</p>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      patientData.status === 'ACTIVE' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {patientData.status}
                    </span>
                  </div>
                  <div className="bg-white p-2 rounded-lg">
                    <QRCode value={patientData.cardID} size={80} />
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-white border-opacity-20">
                  <p className="text-xs opacity-70">Card Type: {patientData.cardType}</p>
                </div>
              </div>
            </div>

            <div className="mt-4 bg-white rounded-lg shadow p-4">
              <button
                onClick={handleScanSimulation}
                className="w-full flex items-center justify-center space-x-2 text-bpjs-primary hover:text-bpjs-dark transition-colors"
              >
                <QrCode className="h-5 w-5" />
                <span className="text-sm font-medium">Simulate QR Scan</span>
              </button>
            </div>
          </div>

          {/* Patient Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h4 className="text-lg font-medium text-gray-900 flex items-center">
                  <User className="h-5 w-5 mr-2 text-bpjs-primary" />
                  Personal Information
                </h4>
              </div>
              <div className="px-6 py-4">
                <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Patient ID</dt>
                    <dd className="mt-1 text-sm text-gray-900 font-mono">{patientData.patientID}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">NIK</dt>
                    <dd className="mt-1 text-sm text-gray-900 font-mono">{patientData.nik}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Date of Birth</dt>
                    <dd className="mt-1 text-sm text-gray-900 flex items-center">
                      <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                      {patientData.dateOfBirth}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Gender</dt>
                    <dd className="mt-1 text-sm text-gray-900">{patientData.gender}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Phone Number</dt>
                    <dd className="mt-1 text-sm text-gray-900">{patientData.phoneNumber || '-'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Email</dt>
                    <dd className="mt-1 text-sm text-gray-900">{patientData.email || '-'}</dd>
                  </div>
                  <div className="md:col-span-2">
                    <dt className="text-sm font-medium text-gray-500">Address</dt>
                    <dd className="mt-1 text-sm text-gray-900 flex items-start">
                      <MapPin className="h-4 w-4 mr-1 text-gray-400 mt-0.5" />
                      {patientData.address}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>

            {/* Card Details */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h4 className="text-lg font-medium text-gray-900 flex items-center">
                  <CreditCard className="h-5 w-5 mr-2 text-bpjs-primary" />
                  Card Details
                </h4>
              </div>
              <div className="px-6 py-4">
                <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Issue Date</dt>
                    <dd className="mt-1 text-sm text-gray-900">{patientData.issueDate}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Expiry Date</dt>
                    <dd className="mt-1 text-sm text-gray-900">{patientData.expiryDate}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Card Status</dt>
                    <dd className="mt-1">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        patientData.status === 'ACTIVE' 
                          ? 'bg-green-100 text-green-800' 
                          : patientData.status === 'SUSPENDED'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {patientData.status}
                      </span>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Card Type</dt>
                    <dd className="mt-1 text-sm text-gray-900 font-medium">{patientData.cardType}</dd>
                  </div>
                </dl>
              </div>
            </div>

            {/* Blockchain Info */}
            {verificationStatus?.valid && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex">
                  <AlertCircle className="h-5 w-5 text-blue-400 mt-0.5" />
                  <div className="ml-3">
                    <h4 className="text-sm font-medium text-blue-800">Blockchain Verified</h4>
                    <p className="mt-1 text-xs text-blue-700">
                      This patient record has been verified on the blockchain and is authentic. 
                      All data is immutable and timestamped.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientLookup;