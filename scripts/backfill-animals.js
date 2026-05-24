const mongoose = require("mongoose");
const { loadEnvConfig } = require("@next/env");

loadEnvConfig(process.cwd());

const shouldWrite = process.argv.includes("--write");
const shouldShowHelp = process.argv.includes("--help") || process.argv.includes("-h");

const printHelp = () => {
  console.log(`
Backfill Animal records for existing posts.

Usage:
  npm run backfill:animals
  npm run backfill:animals -- --write

Options:
  --write  Create missing Animal records. Without this flag the script is a dry run.
  --help   Show this message.
`);
};

const buildAnimalUpsert = (postId, now) => ({
  updateOne: {
    filter: { postId },
    update: {
      $setOnInsert: {
        postId,
        foundLocation: "",
        foundByName: "",
        foundByContact: "",
        diseases: [],
        documents: [],
        createdAt: now,
        updatedAt: now,
      },
    },
    upsert: true,
  },
});

const closeConnection = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
};

const backfillAnimals = async () => {
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is not configured.");
  }

  await mongoose.connect(process.env.MONGODB_URI);

  const posts = mongoose.connection.collection("posts");
  const animals = mongoose.connection.collection("animals");

  const postIds = await posts
    .find({}, { projection: { _id: 1 } })
    .map((post) => post._id)
    .toArray();

  if (postIds.length === 0) {
    console.log("No posts found. Nothing to backfill.");
    return;
  }

  const animalPostIds = await animals.distinct("postId", {
    postId: { $in: postIds },
  });
  const animalPostIdSet = new Set(animalPostIds.map((postId) => postId.toString()));
  const missingPostIds = postIds.filter(
    (postId) => !animalPostIdSet.has(postId.toString())
  );

  console.log(`Posts found: ${postIds.length}`);
  console.log(`Posts already linked to animals: ${animalPostIds.length}`);
  console.log(`Animal records to create: ${missingPostIds.length}`);

  if (missingPostIds.length === 0) {
    console.log("Animal records are already synchronized.");
    return;
  }

  if (!shouldWrite) {
    console.log("Dry run only. Run with --write to create the missing records.");
    return;
  }

  const now = new Date();
  const result = await animals.bulkWrite(
    missingPostIds.map((postId) => buildAnimalUpsert(postId, now)),
    { ordered: false }
  );

  console.log(`Animal records created: ${result.upsertedCount}`);
};

const main = async () => {
  if (shouldShowHelp) {
    printHelp();
    return;
  }

  try {
    await backfillAnimals();
  } finally {
    await closeConnection();
  }
};

main().catch((error) => {
  console.error("Animal backfill failed:", error.message);
  process.exitCode = 1;
});
