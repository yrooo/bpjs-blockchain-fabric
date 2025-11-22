// API Service for connecting to blockchain backend
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

class ApiService {
  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Card Operations
  async issueCard(cardData) {
    return this.request('/cards/issue', {
      method: 'POST',
      body: JSON.stringify(cardData),
    });
  }

  async verifyCard(cardID) {
    return this.request(`/cards/verify/${cardID}`);
  }

  async getCard(cardID) {
    return this.request(`/cards/${cardID}`);
  }

  async updateCardStatus(cardID, status, reason) {
    return this.request(`/cards/${cardID}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, reason }),
    });
  }

  // Visit Operations
  async recordVisit(visitData) {
    return this.request('/visits', {
      method: 'POST',
      body: JSON.stringify(visitData),
    });
  }

  async getPatientVisits(patientID) {
    return this.request(`/visits/patient/${patientID}`);
  }

  // Claim Operations
  async submitClaim(claimData) {
    return this.request('/claims', {
      method: 'POST',
      body: JSON.stringify(claimData),
    });
  }

  async processClaim(claimID, status, notes) {
    return this.request(`/claims/${claimID}/process`, {
      method: 'PUT',
      body: JSON.stringify({ status, notes }),
    });
  }

  async getPatientClaims(patientID) {
    return this.request(`/claims/patient/${patientID}`);
  }

  // Referral Operations
  async createReferral(referralData) {
    return this.request('/referrals', {
      method: 'POST',
      body: JSON.stringify(referralData),
    });
  }

  async updateReferralStatus(referralID, status, acceptedBy, notes) {
    return this.request(`/referrals/${referralID}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, acceptedBy, notes }),
    });
  }

  // Network Status
  async getNetworkStatus() {
    try {
      // Try to connect to API
      const response = await fetch(`${this.baseUrl.replace('/api', '')}/health`);
      return {
        apiConnected: response.ok,
        blockchainRunning: response.ok,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        apiConnected: false,
        blockchainRunning: false,
        error: error.message
      };
    }
  }

  // Dashboard Operations
  async getAllCards() {
    return this.request('/dashboard/cards');
  }

  async getAllVisits() {
    return this.request('/dashboard/visits');
  }

  async getAllClaims() {
    return this.request('/dashboard/claims');
  }

  async getAuditLogs() {
    return this.request('/dashboard/audit-logs');
  }

  async getStats() {
    return this.request('/dashboard/stats');
  }

  async getPatientData(patientID) {
    return this.request(`/dashboard/patient/${patientID}`);
  }
}

export const apiService = new ApiService();
