#!/bin/bash
# Remove stale git lock and push AI Coach code
cd "$(dirname "$0")"

echo "🧹 Git lock verwijderen..."
rm -f .git/index.lock

echo "📦 AI Coach code committen..."
git add app/api/ app/coach/ components/coach-chat.tsx lib/api/coach.ts lib/types/coach.ts package.json package-lock.json next.config.js
git add -u app/ components/ lib/ tsconfig.json

git commit -m "feat: AI Coach met automatische trainingsaanpassing

- AI Coach chat interface met Anthropic Claude integratie
- Tool use: coach kan training daadwerkelijk aanpassen in Supabase
- AdaptationCard UI component voor visuele feedback
- Quick actions: training aanpassen, plan uitleg, hersteltips, etc.
- Context pipeline: HRV, slaap, body battery, trainingsplan, races
- Mock mode wanneer geen API key geconfigureerd is
- Next.js API routes (geen separate Python backend nodig)"

echo "🚀 Pushen naar GitHub..."
git push origin main 2>/dev/null || git push origin master 2>/dev/null

echo ""
echo "✅ Klaar! Code staat op GitHub."
echo ""
echo "Druk op een toets..."
read -n 1
