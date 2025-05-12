README.md
ToolUp Store
A modern e-commerce store that fetches inventory data from Google Sheets and displays product images from Google Drive.

Features
Display products from Google Sheets
Show product images stored in Google Drive
Show stock status (in stock, low stock, out of stock)
Filter products by category
Sort products by price, name, and availability
Search functionality
Responsive design for all devices
Setup Instructions
Prerequisites
Node.js 14.x or higher
Google Cloud account with API access
Google Service Account with access to your Google Sheets and Drive
Installation
Clone the repository
bash
git clone <https://github.com/yourusername/toolup-store.git>
cd toolup-store
Install dependencies
bash
npm install
Create .env.local file from the example
bash
cp .env.local.example .env.local
Fill in your Google API credentials in .env.local You can either:
Use base64-encoded JSON credentials for the entire service account key
GOOGLE_CREDENTIALS_B64=<your-base64-encoded-service-account-credentials>
OR use individual environment variables
GOOGLE_SERVICE_ACCOUNT_EMAIL=<your-service-account-email>
GOOGLE_CLIENT_EMAIL=<your-client-email>
GOOGLE_PRIVATE_KEY=<your-private-key>
Configure your Google Sheets and Drive IDs
GOOGLE_SHEETS_ID=<your-spreadsheet-id>
GOOGLE_SHEETS_RANGE=Products!A2:Z
GOOGLE_SHEETS_HEADER_RANGE=Products!A1:Z1
GOOGLE_DRIVE_FOLDER_ID=<your-drive-folder-id>
Running the application
For development:

bash
npm run dev
For production build:

bash
npm run build
npm run start
Google Sheets Format
Your Google Sheets should have a structure like this (first row is headers):

id name description price stock imageId category specs
1 Product Name Description 19.99 10 abc123 Category Specs
id: Unique identifier for the product
name: Product name
description: Product description
price: Product price (numeric)
stock: Available quantity (numeric)
imageId: Google Drive file ID for the product image
category: Product category (optional)
specs: Product specifications (optional)
Deployment
This application can be easily deployed to Vercel or any other Next.js-compatible hosting provider.

For Vercel deployment, make sure to configure the environment variables in the Vercel dashboard.

License
MIT
