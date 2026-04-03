#!/bin/bash

BACKUP_DIR="$HOME/Applications/nicheclub-backups/$(date +%Y-%m-%d_%H-%M-%S)"
FRONTEND_DIR="$HOME/Applications/nicheclub-frontend/src"
BACKEND_DIR="$HOME/Applications/nicheclub/src"
DOWNLOADS_DIR="$HOME/Downloads"

echo "📦 Criando backup em $BACKUP_DIR..."
mkdir -p "$BACKUP_DIR"

# Backup dos arquivos modificados do frontend
find "$FRONTEND_DIR" -name "*.jsx" -o -name "*.js" -o -name "*.css" | while read f; do
  filename=$(basename "$f")
  cp "$f" "$BACKUP_DIR/$filename"
done

# Backup dos arquivos modificados do backend
find "$BACKEND_DIR" -name "*.js" | while read f; do
  filename=$(basename "$f")
  # Evita sobrescrever arquivo com mesmo nome
  if [ -f "$BACKUP_DIR/$filename" ]; then
    cp "$f" "$BACKUP_DIR/backend_$filename"
  else
    cp "$f" "$BACKUP_DIR/$filename"
  fi
done

echo "✅ Backup criado com $(ls $BACKUP_DIR | wc -l | tr -d ' ') arquivos"

# Copia arquivos de Downloads para os projetos
echo ""
echo "🔍 Verificando Downloads..."

ARQUIVOS_COPIADOS=0

for file in "$DOWNLOADS_DIR"/*.jsx "$DOWNLOADS_DIR"/*.js "$DOWNLOADS_DIR"/*.css "$DOWNLOADS_DIR"/*.py; do
  [ -f "$file" ] || continue
  filename=$(basename "$file")

  # Tenta encontrar no frontend
  destino=$(find "$HOME/Applications/nicheclub-frontend/src" -name "$filename" 2>/dev/null | head -1)

  # Se nao achou no frontend, tenta no backend
  if [ -z "$destino" ]; then
    destino=$(find "$HOME/Applications/nicheclub/src" -name "$filename" 2>/dev/null | head -1)
  fi

  # Se nao achou em nenhum, copia para raiz do nicheclub (scripts)
  if [ -z "$destino" ]; then
    if [[ "$filename" == *.py ]]; then
      destino="$HOME/Applications/nicheclub/$filename"
    fi
  fi

  if [ -n "$destino" ]; then
    cp "$file" "$destino"
    echo "   ✅ $filename → $destino"
    ARQUIVOS_COPIADOS=$((ARQUIVOS_COPIADOS + 1))
  else
    echo "   ⚠️  $filename — destino nao encontrado, ignorado"
  fi
done

if [ $ARQUIVOS_COPIADOS -eq 0 ]; then
  echo "   Nenhum arquivo encontrado na pasta Downloads."
fi

echo ""

# Deploy frontend
if [ $ARQUIVOS_COPIADOS -gt 0 ] || [ "$1" == "--force" ]; then
  echo "🚀 Fazendo deploy do frontend..."
  cd "$HOME/Applications/nicheclub-frontend"
  git add -A
  git commit -m "atualizar: $(date +%Y-%m-%d_%H-%M-%S)" 2>/dev/null || echo "   Nada a commitar no frontend"
  git push && npx vercel --prod
  echo ""

  echo "🚀 Fazendo deploy do backend..."
  cd "$HOME/Applications/nicheclub"
  git add -A
  git commit -m "atualizar: $(date +%Y-%m-%d_%H-%M-%S)" 2>/dev/null || echo "   Nada a commitar no backend"
  git push
else
  echo "Nada a fazer. Use --force para forcar o deploy mesmo sem arquivos novos."
fi

echo ""
echo "🎉 Concluido!"
