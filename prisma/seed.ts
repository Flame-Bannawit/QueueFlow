import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding tables...");

  const tables = [
    { tableNumber: "T-01", displayName: "โต๊ะ 1", seats: 2, zone: "Window" },
    { tableNumber: "T-02", displayName: "โต๊ะ 2", seats: 2, zone: "Window" },
    { tableNumber: "T-03", displayName: "โต๊ะ 3", seats: 4, zone: "Garden" },
    { tableNumber: "T-04", displayName: "โต๊ะ 4", seats: 4, zone: "Garden" },
    { tableNumber: "T-05", displayName: "โต๊ะ 5", seats: 4, zone: "Main" },
    { tableNumber: "T-06", displayName: "โต๊ะ 6", seats: 6, zone: "Main" },
    { tableNumber: "T-07", displayName: "โต๊ะ 7", seats: 6, zone: "Main" },
    { tableNumber: "T-08", displayName: "โต๊ะ 8", seats: 8, zone: "Private" },
    { tableNumber: "T-09", displayName: "โต๊ะ 9", seats: 8, zone: "Private" },
    { tableNumber: "T-10", displayName: "โต๊ะ 10", seats: 10, zone: "Banquet" },
  ];

  for (const table of tables) {
    await prisma.restaurantTable.upsert({
      where: { tableNumber: table.tableNumber },
      update: {},
      create: table,
    });
  }

  console.log("✅ Seeded 10 tables successfully!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());