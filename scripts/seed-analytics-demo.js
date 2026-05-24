const mongoose = require("mongoose");
const { loadEnvConfig } = require("@next/env");

loadEnvConfig(process.cwd());

const shouldWrite = process.argv.includes("--write");
const shouldShowHelp = process.argv.includes("--help") || process.argv.includes("-h");

const demoPosts = [
  ["Міла", "Коти", "Британська", "До 1 року", "Малий", "Чернівці", "available"],
  ["Рекс", "Собаки", "Лабрадор", "1-3 роки", "Великий", "Львів", "adopted"],
  ["Соня", "Коти", "Сіамська", "Більше 3 років", "Малий", "Київ", "reserved"],
  ["Бім", "Собаки", "Метис", "До 1 року", "Середній", "Івано-Франківськ", "available"],
  ["Лакі", "Собаки", "Хаскі", "1-3 роки", "Великий", "Тернопіль", "available"],
  ["Луна", "Коти", "Мейн-кун", "1-3 роки", "Середній", "Одеса", "adopted"],
  ["Арчі", "Собаки", "Вівчарка", "Більше 3 років", "Великий", "Чернівці", "reserved"],
  ["Кекс", "Коти", "Дворовий", "До 1 року", "Малий", "Львів", "available"],
  ["Ніка", "Собаки", "Такса", "1-3 роки", "Малий", "Ужгород", "adopted"],
  ["Пушок", "Коти", "Перська", "Більше 3 років", "Середній", "Чернівці", "available"],
  ["Тайсон", "Собаки", "Боксер", "1-3 роки", "Великий", "Київ", "available"],
  ["Ася", "Коти", "Шотландська", "До 1 року", "Малий", "Тернопіль", "reserved"],
  ["Марс", "Собаки", "Метис", "Більше 3 років", "Середній", "Одеса", "adopted"],
  ["Буся", "Коти", "Дворовий", "1-3 роки", "Малий", "Івано-Франківськ", "available"],
  ["Річі", "Собаки", "Коргі", "До 1 року", "Середній", "Чернівці", "available"],
  ["Сніжок", "Коти", "Ангорська", "Більше 3 років", "Малий", "Львів", "adopted"],
].map(([title, type, breed, ageGroups, sizes, city, status], index) => ({
  title,
  desc: `Демо-запис для аналітики: ${title}.`,
  img: "/cat.jpg",
  userId: "demo-admin-analytics",
  slug: `demo-analytics-${index + 1}-${title.toLowerCase()}`,
  listingType: "adoption",
  moderationStatus: "approved",
  type,
  ageGroups,
  sizes,
  breed,
  status,
  city,
  sex: index % 2 === 0 ? "female" : "male",
  createdAt: new Date(),
  updatedAt: new Date(),
}));

const demoLostFound = [
  ["Загубився Барсик", "lost", "Коти", "Дворовий", "1-3 роки", "Малий", "Чернівці"],
  ["Знайдена собака біля парку", "found", "Собаки", "Метис", "До 1 року", "Середній", "Львів"],
  ["Загубилась Нора", "lost", "Собаки", "Хаскі", "1-3 роки", "Великий", "Київ"],
  ["Знайдено кошеня", "found", "Коти", "Дворовий", "До 1 року", "Малий", "Одеса"],
].map(([title, listingType, type, breed, ageGroups, sizes, city], index) => ({
  title,
  desc: `Демо-запис для lost/found аналітики: ${title}.`,
  img: "/cat.jpg",
  userId: "demo-admin-analytics",
  slug: `demo-lost-found-${index + 1}`,
  listingType,
  moderationStatus: index === 0 ? "pending" : "approved",
  type,
  ageGroups,
  sizes,
  breed,
  status: "available",
  city,
  sex: "",
  createdAt: new Date(),
  updatedAt: new Date(),
}));

const printHelp = () => {
  console.log(`
Seed demo data for the admin analytics dashboard.

Usage:
  npm run seed:analytics
  npm run seed:analytics -- --write

Options:
  --write  Insert demo posts and animal records. Without it this is a dry run.
  --help   Show this message.
`);
};

const closeConnection = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
};

const seedAnalyticsDemo = async () => {
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is not configured.");
  }

  await mongoose.connect(process.env.MONGODB_URI);

  const posts = mongoose.connection.collection("posts");
  const animals = mongoose.connection.collection("animals");
  const seedPosts = [...demoPosts, ...demoLostFound];
  const slugs = seedPosts.map((post) => post.slug);
  const existingSlugs = await posts.distinct("slug", { slug: { $in: slugs } });
  const existingSlugSet = new Set(existingSlugs);
  const postsToCreate = seedPosts.filter((post) => !existingSlugSet.has(post.slug));

  console.log(`Demo records prepared: ${seedPosts.length}`);
  console.log(`Already present: ${existingSlugs.length}`);
  console.log(`Records to create: ${postsToCreate.length}`);

  if (postsToCreate.length === 0) {
    console.log("Analytics demo data is already present.");
    return;
  }

  if (!shouldWrite) {
    console.log("Dry run only. Run with --write to insert demo records.");
    return;
  }

  const inserted = await posts.insertMany(postsToCreate, { ordered: false });
  const animalRecords = Object.values(inserted.insertedIds).map((postId) => ({
    postId,
    foundLocation: "",
    foundByName: "Демо-дані",
    foundByContact: "",
    diseases: [],
    documents: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  }));

  if (animalRecords.length > 0) {
    await animals.insertMany(animalRecords, { ordered: false });
  }

  console.log(`Demo posts inserted: ${postsToCreate.length}`);
  console.log(`Animal records inserted: ${animalRecords.length}`);
};

const main = async () => {
  if (shouldShowHelp) {
    printHelp();
    return;
  }

  try {
    await seedAnalyticsDemo();
  } finally {
    await closeConnection();
  }
};

main().catch((error) => {
  console.error("Analytics demo seed failed:", error.message);
  process.exitCode = 1;
});
