import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function main() {
  // Users
  const users = await Promise.all([
    db.user.upsert({
      where: { username: "user1" },
      create: { username: "user1", displayName: "Ana", cashBalance: 10000, level: 1, xp: 0 },
      update: {},
    }),
    db.user.upsert({
      where: { username: "user2" },
      create: { username: "user2", displayName: "Bruno", cashBalance: 10000, level: 1, xp: 0 },
      update: {},
    }),
    db.user.upsert({
      where: { username: "user3" },
      create: { username: "user3", displayName: "Carla", cashBalance: 10000, level: 1, xp: 0 },
      update: {},
    }),
  ]);

  // Assets
  const assetDefs = [
    { ticker: "TECHA", name: "TechAlpha Corp", type: "stock", basePrice: 150, volatility: 0.03 },
    { ticker: "ENERB", name: "EnerBeta SA", type: "stock", basePrice: 85, volatility: 0.04 },
    { ticker: "BANKC", name: "BankCorp", type: "stock", basePrice: 220, volatility: 0.02 },
    { ticker: "HLTHD", name: "HealthDelta", type: "stock", basePrice: 310, volatility: 0.025 },
    { ticker: "GLOBE", name: "Global ETF", type: "etf", basePrice: 120, volatility: 0.015 },
    { ticker: "EMERG", name: "Emerging Markets ETF", type: "etf", basePrice: 95, volatility: 0.02 },
    { ticker: "BONDI", name: "Bond Index ETF", type: "etf", basePrice: 100, volatility: 0.01 },
    { ticker: "GOV10Y", name: "Bono Gobierno 10Y", type: "bond", basePrice: 1000, volatility: 0.005 },
    { ticker: "CORPAA", name: "Corp Bond AA", type: "bond", basePrice: 980, volatility: 0.008 },
    { ticker: "BITQ", name: "BitQ Crypto", type: "crypto", basePrice: 45000, volatility: 0.07 },
    { ticker: "ETHQ", name: "EthQ Crypto", type: "crypto", basePrice: 2800, volatility: 0.06 },
    { ticker: "STBLQ", name: "StableQ", type: "crypto", basePrice: 1, volatility: 0.002 },
  ];

  const assets = await Promise.all(
    assetDefs.map((a) =>
      db.asset.upsert({ where: { ticker: a.ticker }, create: a, update: {} })
    )
  );

  // Price ticks — 100 ticks per asset, random walk backwards
  for (const asset of assets) {
    const existingCount = await db.priceTick.count({ where: { assetId: asset.id } });
    if (existingCount >= 100) continue;

    const ticks: { assetId: string; price: number; timestamp: Date }[] = [];
    let price = asset.basePrice;
    const now = Date.now();

    for (let i = 100; i >= 1; i--) {
      const change = (Math.random() * 2 - 1) * asset.volatility * price;
      price = Math.max(asset.basePrice * 0.1, Math.min(asset.basePrice * 10, price + change));
      ticks.push({
        assetId: asset.id,
        price,
        timestamp: new Date(now - i * 5 * 60 * 1000),
      });
    }

    await db.priceTick.createMany({ data: ticks });
  }

  // Missions
  const missionDefs = [
    {
      code: "first_trade",
      title: "Primera Operación",
      description: "Realizá tu primera compra en el simulador.",
      difficulty: "rookie",
      xpReward: 50,
      goalType: "first_trade",
      goalParams: JSON.stringify({}),
    },
    {
      code: "read_first_lesson",
      title: "Empezá a Aprender",
      description: "Completá tu primera lección educativa.",
      difficulty: "rookie",
      xpReward: 30,
      goalType: "read_first_lesson",
      goalParams: JSON.stringify({}),
    },
    {
      code: "save_10pct",
      title: "Ahorrador Inteligente",
      description: "Mantené al menos el 10% de tu capital inicial sin invertir.",
      difficulty: "smart_saver",
      xpReward: 75,
      goalType: "save_10pct",
      goalParams: JSON.stringify({ pct: 10 }),
    },
    {
      code: "hold_3_days",
      title: "Hold de 3 Días",
      description: "Mantené una posición durante al menos 3 días.",
      difficulty: "smart_saver",
      xpReward: 80,
      goalType: "hold_3_days",
      goalParams: JSON.stringify({ days: 3 }),
    },
    {
      code: "diversify_3_types",
      title: "Diversificá Tu Cartera",
      description: "Invertí en al menos 3 tipos de activos distintos.",
      difficulty: "explorer",
      xpReward: 120,
      goalType: "diversify",
      goalParams: JSON.stringify({ assetTypeCount: 3 }),
    },
    {
      code: "complete_risk_profile",
      title: "Conocé Tu Perfil",
      description: "Completá el test de perfil de riesgo.",
      difficulty: "explorer",
      xpReward: 60,
      goalType: "complete_risk_profile",
      goalParams: JSON.stringify({}),
    },
    {
      code: "beat_5pct_return",
      title: "Rendimiento del 5%",
      description: "Lograá un rendimiento del 5% en tu cartera.",
      difficulty: "builder",
      xpReward: 200,
      goalType: "portfolio_return",
      goalParams: JSON.stringify({ pct: 5 }),
    },
    {
      code: "hold_etf_week",
      title: "ETF por una Semana",
      description: "Mantené un ETF en cartera durante 7 días.",
      difficulty: "builder",
      xpReward: 150,
      goalType: "hold_etf_week",
      goalParams: JSON.stringify({ days: 7 }),
    },
    {
      code: "rebalance_after_drop",
      title: "Rebalanceo Inteligente",
      description: "Rebalanceá tu cartera después de una caída del 5%.",
      difficulty: "master",
      xpReward: 300,
      goalType: "rebalance_after_drop",
      goalParams: JSON.stringify({ dropPct: 5 }),
    },
    {
      code: "portfolio_10pct_return",
      title: "Master del Mercado",
      description: "Alcanzá un rendimiento total del 10% en tu cartera.",
      difficulty: "master",
      xpReward: 500,
      goalType: "portfolio_10pct_return",
      goalParams: JSON.stringify({ pct: 10 }),
    },
  ];

  await Promise.all(
    missionDefs.map((m) =>
      db.mission.upsert({ where: { code: m.code }, create: m, update: {} })
    )
  );

  // Badges
  const badgeDefs = [
    { code: "first_trade", name: "Primera Operación", description: "Realizaste tu primera operación.", icon: "🏆" },
    { code: "diversified", name: "Diversificado", description: "Invertiste en 3 tipos de activos.", icon: "🌍" },
    { code: "bull_rider", name: "Bull Rider", description: "Tu cartera subió más de 10%.", icon: "🐂" },
    { code: "bear_survivor", name: "Bear Survivor", description: "Sobreviviste una caída del mercado.", icon: "🐻" },
    { code: "streak_3", name: "Racha de 3", description: "Operaste 3 días seguidos.", icon: "🔥" },
    { code: "streak_7", name: "Racha de 7", description: "Operaste 7 días seguidos.", icon: "⚡" },
    { code: "top_3", name: "Top 3", description: "Llegaste al top 3 del ranking.", icon: "🥉" },
    { code: "master", name: "Maestro Inversor", description: "Alcanzaste el nivel Maestro.", icon: "👑" },
  ];

  await Promise.all(
    badgeDefs.map((b) =>
      db.badge.upsert({ where: { code: b.code }, create: b, update: {} })
    )
  );

  console.log("✅ Seed completado");
  console.log(`  ${users.length} usuarios`);
  console.log(`  ${assets.length} activos`);
  console.log(`  ${missionDefs.length} misiones`);
  console.log(`  ${badgeDefs.length} badges`);
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect());
