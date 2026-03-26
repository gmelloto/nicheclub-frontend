#!/bin/bash

FRONTEND="$HOME/Applications/nicheclub-frontend"
DOWNLOADS="$HOME/Downloads"

echo "Atualizando Niche Club Frontend..."

# index.css
if [ -f "$DOWNLOADS/index.css" ]; then
  rm -f "$FRONTEND/src/index.css"
  cp "$DOWNLOADS/index.css" "$FRONTEND/src/index.css"
  echo "index.css atualizado"
fi

# Navbar.jsx
if [ -f "$DOWNLOADS/Navbar.jsx" ]; then
  rm -f "$FRONTEND/src/components/layout/Navbar.jsx"
  cp "$DOWNLOADS/Navbar.jsx" "$FRONTEND/src/components/layout/Navbar.jsx"
  echo "Navbar.jsx atualizado"
fi

# Catalogo.jsx
if [ -f "$DOWNLOADS/Catalogo.jsx" ]; then
  rm -f "$FRONTEND/src/pages/Catalogo.jsx"
  cp "$DOWNLOADS/Catalogo.jsx" "$FRONTEND/src/pages/Catalogo.jsx"
  echo "Catalogo.jsx atualizado"
fi

# Perfume.jsx
if [ -f "$DOWNLOADS/Perfume.jsx" ]; then
  rm -f "$FRONTEND/src/pages/Perfume.jsx"
  cp "$DOWNLOADS/Perfume.jsx" "$FRONTEND/src/pages/Perfume.jsx"
  echo "Perfume.jsx atualizado"
fi

# Carrinho.jsx
if [ -f "$DOWNLOADS/Carrinho.jsx" ]; then
  rm -f "$FRONTEND/src/pages/Carrinho.jsx"
  cp "$DOWNLOADS/Carrinho.jsx" "$FRONTEND/src/pages/Carrinho.jsx"
  echo "Carrinho.jsx atualizado"
fi

# Admin.jsx
if [ -f "$DOWNLOADS/Admin.jsx" ]; then
  rm -f "$FRONTEND/src/pages/Admin.jsx"
  cp "$DOWNLOADS/Admin.jsx" "$FRONTEND/src/pages/Admin.jsx"
  echo "Admin.jsx atualizado"
fi

# Login.jsx
if [ -f "$DOWNLOADS/Login.jsx" ]; then
  rm -f "$FRONTEND/src/pages/Login.jsx"
  cp "$DOWNLOADS/Login.jsx" "$FRONTEND/src/pages/Login.jsx"
  echo "Login.jsx atualizado"
fi

# App.jsx
if [ -f "$DOWNLOADS/App.jsx" ]; then
  rm -f "$FRONTEND/src/App.jsx"
  cp "$DOWNLOADS/App.jsx" "$FRONTEND/src/App.jsx"
  echo "App.jsx atualizado"
fi

# Arquivos do backend
BACKEND="$HOME/Applications/nicheclub"

if [ -f "$DOWNLOADS/migrate_fragrantica.js" ]; then
  rm -f "$BACKEND/src/db/migrate_fragrantica.js"
  cp "$DOWNLOADS/migrate_fragrantica.js" "$BACKEND/src/db/migrate_fragrantica.js"
  echo "migrate_fragrantica.js atualizado"
fi

if [ -f "$DOWNLOADS/import_fragrantica.js" ]; then
  rm -f "$BACKEND/src/db/import_fragrantica.js"
  cp "$DOWNLOADS/import_fragrantica.js" "$BACKEND/src/db/import_fragrantica.js"
  echo "import_fragrantica.js atualizado"
fi

echo ""
echo "Pronto! Fazendo build e deploy..."
cd "$FRONTEND"
npm run build && git add . && git commit -m "update: arquivos atualizados" && git push && vercel --prod
