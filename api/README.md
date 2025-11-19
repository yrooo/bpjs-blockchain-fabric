# BPJS Blockchain API Server

Node.js/Express REST API server that integrates with Hyperledger Fabric blockchain network.

## Features

- Fabric SDK integration
- JWT authentication
- RESTful endpoints for cards, visits, referrals, claims
- Swagger API documentation
- Rate limiting & security
- Logging & monitoring

## Quick Start

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env

# Start development server
npm run start:dev

# Start production server
npm run build
npm start
```

## API Endpoints

### Authentication
- POST `/auth/login` - User login
- POST `/auth/register` - Register user
- GET `/auth/me` - Get current user

### Cards
- POST `/api/cards/issue` - Issue new BPJS card
- GET `/api/cards/:cardID` - Get card details
- PUT `/api/cards/:cardID/status` - Update card status
- GET `/api/cards/verify/:cardID` - Verify card

### Visits
- POST `/api/visits` - Record patient visit
- GET `/api/visits/patient/:id` - Get patient visits
- GET `/api/visits/:visitID` - Get visit details

### Referrals
- POST `/api/referrals` - Create referral
- GET `/api/referrals/:id` - Get referral
- PUT `/api/referrals/:id/status` - Update status

### Claims
- POST `/api/claims` - Submit claim
- GET `/api/claims/:claimID` - Get claim
- PUT `/api/claims/:claimID/process` - Process claim
- GET `/api/claims/patient/:id` - Get patient claims

### Audit
- GET `/api/audit/logs` - Query audit logs

## Environment Variables

```env
PORT=3000
NODE_ENV=development
JWT_SECRET=your-secret-key
FABRIC_NETWORK_PATH=../network
CHANNEL_NAME=bpjs-main
CHAINCODE_NAME=bpjs
```

## Directory Structure

```
api/
├── src/
│   ├── config/          # Configuration files
│   ├── controllers/     # Route controllers
│   ├── middleware/      # Express middleware
│   ├── services/        # Business logic
│   │   └── fabric/     # Fabric SDK integration
│   ├── routes/          # API routes
│   ├── models/          # Data models
│   └── utils/           # Utility functions
├── dist/                # Compiled JS (build output)
├── package.json
└── tsconfig.json
```

## Development

```bash
# Run in development mode
npm run start:dev

# Build for production
npm run build

# Run tests
npm test

# Lint code
npm run lint
```

## Documentation

API documentation available at: http://localhost:3000/api-docs

## License

Apache-2.0
