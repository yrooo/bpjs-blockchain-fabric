# BPJS Blockchain - Mobile App

React Native mobile application for patients and healthcare providers.

## Features

### For Patients
- 📱 **Digital BPJS Card** - Show QR code at healthcare facilities
- 🏥 **Visit History** - View all medical visits and treatments
- 💊 **Prescription Tracking** - Track medications and prescriptions
- 📋 **Claim Status** - Monitor insurance claim processing
- 🔔 **Notifications** - Get updates on card status, claims, appointments
- 📍 **Find Facilities** - Locate nearby hospitals and clinics

### For Healthcare Providers
- 📷 **QR Scanner** - Quickly verify BPJS cards
- 📝 **Record Visits** - Input patient visit data on-the-go
- 📤 **Submit Claims** - File insurance claims directly from mobile
- 🔄 **Create Referrals** - Refer patients to specialists
- 📊 **View Statistics** - Access facility analytics

## Quick Start

### Prerequisites
- Node.js 18+
- React Native CLI
- Android Studio (for Android)
- Xcode (for iOS, Mac only)

### Installation

```bash
# Install dependencies
npm install

# iOS - Install pods
cd ios && pod install && cd ..

# Run on Android
npm run android

# Run on iOS
npm run ios

# Start Metro bundler
npm start
```

## Technology Stack

- **React Native** - Cross-platform mobile framework
- **TypeScript** - Type safety
- **React Navigation** - Navigation
- **React Native Paper** - Material Design components
- **Axios** - HTTP client
- **React Query** - Data fetching & caching
- **AsyncStorage** - Local storage
- **React Native QR Code Scanner** - QR scanning
- **React Native QR Code SVG** - QR generation
- **React Native Push Notifications** - Notifications
- **React Native Permissions** - Permission management

## Project Structure

```
frontend-mobile/
├── android/             # Android native code
├── ios/                 # iOS native code
├── src/
│   ├── screens/        # Screen components
│   │   ├── Auth/
│   │   ├── Dashboard/
│   │   ├── Card/
│   │   ├── Scanner/
│   │   ├── Visits/
│   │   └── ...
│   ├── components/     # Reusable components
│   ├── navigation/     # Navigation setup
│   ├── services/       # API services
│   ├── hooks/          # Custom hooks
│   ├── utils/          # Utilities
│   ├── types/          # TypeScript types
│   ├── theme/          # App theme
│   └── App.tsx
├── package.json
└── tsconfig.json
```

## Available Scripts

- `npm start` - Start Metro bundler
- `npm run android` - Run on Android emulator/device
- `npm run ios` - Run on iOS simulator/device
- `npm test` - Run tests
- `npm run lint` - Lint code

## Environment Configuration

Create `.env` file:

```env
API_URL=http://localhost:3000
ENVIRONMENT=development
```

## Screens

### Patient App
- **Login/Register** - Authentication
- **Home Dashboard** - Overview & quick actions
- **My Card** - Display digital BPJS card with QR
- **Visit History** - List of medical visits
- **Claims** - Track claim status
- **Profile** - User profile & settings
- **Notifications** - System notifications
- **Find Facility** - Map of nearby healthcare facilities

### Provider App
- **Login** - Staff authentication
- **Dashboard** - Daily statistics
- **Scan Card** - QR code scanner
- **Record Visit** - Form to input visit details
- **Submit Claim** - Claim submission form
- **Patient Search** - Search patient records
- **Referral** - Create referral form
- **Statistics** - Facility analytics

## Permissions Required

### Android
- Camera (for QR scanning)
- Location (for facility finder)
- Storage (for saving documents)
- Notifications

### iOS
- Camera
- Location When In Use
- Notifications

## Build for Production

### Android

```bash
cd android
./gradlew bundleRelease
# Output: android/app/build/outputs/bundle/release/app-release.aab
```

### iOS

```bash
# Open Xcode
open ios/BPJSBlockchain.xcworkspace

# Select Product > Archive
# Follow App Store submission process
```

## License

Apache-2.0
