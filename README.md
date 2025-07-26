# Inventory Management System

A comprehensive inventory management system built with React, TypeScript, and Firebase. This application helps businesses manage their inventory, track sales and purchases, monitor stock levels, generate reports, and more.

## Features

- **Dashboard**: Overview of key metrics and recent activities
- **Products Management**: Add, edit, and delete products with details like code, name, category, unit, stock levels, and pricing
- **Suppliers Management**: Manage supplier information and track balances
- **Customers Management**: Maintain customer records and track balances
- **Purchases Management**: Record purchases with invoice details, supplier information, and product items
  - Track purchase discounts and calculate net amounts
  - Automatic stock updates when purchases are completed
- **Sales Management**: Record sales with invoice details, customer information, and product items
  - Track sales discounts and calculate net amounts
  - Print invoices for customers
- **Stock Management**: Monitor stock levels and view stock movement history
- **Reports**: Generate various reports including:
  - Purchase reports
  - Stock reports
  - Profit reports
  - Export reports to CSV
- **Settings**: Configure application settings including:
  - Company information
  - Printing preferences
  - Database backup and restore

## Technology Stack

- **Frontend**: React, TypeScript, TailwindCSS
- **State Management**: React Context API
- **Database**: Firebase Realtime Database
- **Authentication**: Firebase Authentication
- **Routing**: React Router
- **UI Components**: Custom components with TailwindCSS
- **Icons**: Lucide React
- **Desktop Packaging**: Electron

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm or yarn
- Firebase account

### Installation

1. Clone the repository
   ```bash
   git clone <repository-url>
   cd inventory-management-system
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Start the development server
   ```bash
   npm run dev
   ```

4. In a separate terminal, start Electron (for desktop development)
   ```bash
   npm start
   ```

   Or run both concurrently
   ```bash
   npm run electron:dev
   ```

## Building for Production

### Building the React App

```bash
npm run build
```

This will create a production build of the React app in the `dist` directory.

### Packaging the Electron App

```bash
npm run package
```

This will package the app for Windows and create an installer in the `release` directory.

### Creating a Release Build

```bash
npm run release
```

This will create a production build and package it for distribution without publishing.

### Building the Installer in One Step

```bash
npm run build-installer
```

This will build the React app and create a Windows installer in one step.

## Development
   git clone https://github.com/yourusername/inventory-management-system.git
   ```

2. Navigate to the project directory
   ```
   cd inventory-management-system
   ```

3. Install dependencies
   ```
   npm install
   ```
   or
   ```
   yarn install
   ```

4. Configure Firebase
   - Create a Firebase project in the Firebase console
   - Enable Authentication and Realtime Database
   - Add your Firebase configuration to `src/services/firebase.ts`

5. Start the development server
   ```
   npm run dev
   ```
   or
   ```
   yarn dev
   ```

## Desktop Application (Electron)

This project can be packaged as a desktop application using Electron.

### Running in Development Mode

To run the application as a desktop app in development mode:

```bash
npm run electron:dev
```

This will start both the Vite development server and Electron application.

### Building for Production

To build the desktop application for production:

```bash
npm run electron:build
```

### Creating an Executable (.exe) File

To create a Windows executable (.exe) file:

```bash
npm run electron:package
```

The packaged application will be available in the `release` directory.

## Project Structure

```
src/
├── components/         # Reusable UI components
│   ├── Auth/           # Authentication related components
│   ├── Common/         # Common UI components (Button, Card, Modal, etc.)
│   ├── Layout/         # Layout components (Sidebar, Header, etc.)
│   └── Sales/          # Sales specific components (InvoicePrint, etc.)
├── contexts/           # React Context providers
├── pages/              # Application pages
│   ├── Customers/      # Customer management pages
│   ├── Dashboard/      # Dashboard page
│   ├── Products/       # Product management pages
│   ├── Purchases/      # Purchase management pages
│   ├── Reports/        # Reports pages
│   ├── Sales/          # Sales management pages
│   ├── Settings/       # Settings pages
│   ├── Stock/          # Stock management pages
│   └── Suppliers/      # Supplier management pages
├── services/           # Service layer (Firebase, etc.)
├── types/              # TypeScript type definitions
└── App.tsx            # Main application component
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.