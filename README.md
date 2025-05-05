# Guest List Management System

A modern, responsive web application for managing wedding guest lists, built with React, TypeScript, and Firebase.

## Features

- 🔐 **Secure Authentication**
  - Email/password login
  - Protected routes
  - Session management

- 👥 **Guest Management**
  - Add, edit, and remove guests
  - Track RSVP status (Accepted, Pending, Declined)
  - Manage guest details (name, email, phone, etc.)
  - Track spouse and children information

- 📊 **Dashboard & Analytics**
  - Real-time guest statistics
  - RSVP status distribution
  - Country-wise guest distribution
  - Priority level tracking
  - Response rate monitoring

- 🎨 **Modern UI/UX**
  - Material-UI components
  - Responsive design
  - Dark/Light theme support
  - Interactive data visualizations

- 🔄 **Real-time Updates**
  - Firebase integration
  - Instant data synchronization
  - Offline support

## Tech Stack

- **Frontend**
  - React 18
  - TypeScript
  - Material-UI
  - React Query
  - React Router
  - Chart.js

- **Backend**
  - Firebase Authentication
  - Firebase Firestore
  - Firebase Hosting

- **Development Tools**
  - Vite
  - ESLint
  - TypeScript
  - GitHub Actions

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm (v9 or higher)
- Firebase account

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/guestlist-app.git
   cd guestlist-app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file in the root directory with your Firebase configuration:
   ```
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## Deployment

This project is configured for automatic deployment to GitHub Pages using GitHub Actions. The deployment process:

1. Builds the application
2. Uses environment variables from GitHub Secrets
3. Deploys to GitHub Pages

### Setting up GitHub Secrets

Add the following secrets to your repository:
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Material-UI for the component library
- Firebase for the backend services
- React Query for data fetching and caching
- Chart.js for data visualization
