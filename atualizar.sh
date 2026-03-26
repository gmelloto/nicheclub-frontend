#!/bin/bash

FRONTEND="$HOME/Applications/nicheclub-frontend"
BACKEND="$HOME/Applications/nicheclub"
DOWNLOADS="$HOME/Downloads"
BACKUP="$HOME/Applications/nicheclub-backups"
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
BACKUP_DIR="$BACKUP/$TIMESTAMP"

mover() {
  ARQUIVO="$1"
  DESTINO="$2"
  ORIGEM="$DOWNLOADS/$ARQUIVO"

  if [ ! -f "$ORIGEM" ]; then
    return
  fi

  mkdir -p "$BACKUP_DIR"

  if [ -f "$DESTINO" ]; then
    cp "$DESTINO" "$BACKUP_DIR/$ARQUIVO"
    echo "  backup:     $ARQUIVO"
  fi

  cp "$ORIGEM" "$DESTINO"
  rm "$ORIGEM"
  echo "  atualizado: $ARQUIVO"
  ATUALIZOU=true
}

ATUALIZOU=false
FRONTEND_MUDOU=false

echo "Verificando arquivos..."
echo ""

# Frontend
for f in index.css Navbar.jsx Catalogo.jsx Perfume.jsx Carrinho.jsx Admin.jsx Login.jsx App.jsx api.js; do
  if [ -f "$DOWNLOADS/$f" ]; then
    case "$f" in
      index.css) mover "$f" "$FRONTEND/src/index.css" ;;
      Navbar.jsx) mover "$f" "$FRONTEND/src/components/layout/Navbar.jsx" ;;
      Catalogo.jsx) mover "$f" "$FRONTEND/src/pages/Catalogo.jsx" ;;
      Perfume.jsx) mover "$f" "$FRONTEND/src/pages/Perfume.jsx" ;;
      Carrinho.jsx) mover "$f" "$FRONTEND/src/pages/Carrinho.jsx" ;;
      Admin.jsx) mover "$f" "$FRONTEND/src/pages/Admin.jsx" ;;
      Login.jsx) mover "$f" "$FRONTEND/src/pages/Login.jsx" ;;
      App.jsx) mover "$f" "$FRONTEND/src/App.jsx" ;;
      api.js) mover "$f" "$FRONTEND/src/services/api.js" ;;
    esac
    FRONTEND_MUDOU=true
  fi
done

# Backend
for f in estoque.js index.js migrate_fragrantica.js import_fragrantica.js; do
  if [ -f "$DOWNLOADS/$f" ]; then
    case "$f" in
      estoque.js) mover "$f" "$BACKEND/src/services/estoque.js" ;;
      index.js) mover "$f" "$BACKEND/src/routes/index.js" ;;
      migrate_fragrantica.js) mover "$f" "$BACKEND/src/db/migrate_fragrantica.js" ;;
      import_fragrantica.js) mover "$f" "$BACKEND/src/db/import_fragrantica.js" ;;
    esac
  fi
done

if [ "$ATUALIZOU" = false ]; then
  echo "Nenhum arquivo encontrado na pasta Downloads. Nada a fazer."
  exit 0
fi

echo ""
echo "---"

if [ "$FRONTEND_MUDOU" = true ]; then
  echo "Fazendo build e deploy do frontend..."
  echo ""
  cd "$FRONTEND"
  npm run build && \
  git add . && \
  git commit -m "update: $TIMESTAMP" && \
  git push && \
  vercel --prod
else
  echo "Apenas backend atualizado. Rode 'railway redeploy' se necessário."
fi
