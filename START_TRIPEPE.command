#!/bin/bash
# TriPepe AI Coach - Dubbelklik om te starten!

clear
echo "🏊‍♂️🚴🏃‍♂️ TriPepe AI Coach wordt opgestart..."
echo ""

# Ga naar de frontend folder (zelfde folder als dit script)
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

echo "📂 Folder: $SCRIPT_DIR"
echo ""

if [ ! -d "node_modules" ]; then
    echo "📦 Eerste keer? Dependencies worden geinstalleerd..."
    echo "   Dit duurt ongeveer 30-60 seconden..."
    echo ""
    npm install
    echo ""
fi

echo "✅ Klaar! App wordt gestart..."
echo ""
echo "🌐 Open deze link in je browser:"
echo "   http://localhost:3000/coach"
echo ""
echo "   Druk Ctrl+C om te stoppen."
echo ""

npm run dev
