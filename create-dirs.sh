#!/bin/bash

# Create directories
mkdir -p src/components
mkdir -p src/pages/product
mkdir -p src/utils
mkdir -p src/styles
mkdir -p public

# Create empty files
touch src/components/ProductCard.jsx
touch src/components/ProductList.jsx
touch src/components/Header.jsx
touch src/components/Footer.jsx

touch src/pages/index.jsx
touch src/pages/product/[id].jsx

touch src/utils/sheetsService.js
touch src/utils/driveService.js

touch src/styles/globals.css

touch .env.local
touch next.config.js

echo "✅ Structure created successfully."

