require("dotenv").config({ path: "./.env" });
const mongoose = require("mongoose");

async function migrate() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;

  // 1. Delete the 8 documents inserted by the failed migration script (which have old createdAt)
  const deleteRes = await db.collection("studentscores").deleteMany({
    createdAt: { $lt: new Date("2026-09-28T20:00:00.000Z") }
  });
  console.log(`Deleted ${deleteRes.deletedCount} partially migrated docs.`);

  // 2. Fetch all monthly scores
  const monthlyScores = await db.collection("monthlyscores").find({}).toArray();
  
  if (monthlyScores.length === 0) {
    console.log("No old scores found in monthlyscores.");
    process.exit(0);
  }

  // Aggregate by student and group
  const totals = {};
  
  for (const s of monthlyScores) {
    const key = `${s.student}_${s.group}`;
    if (!totals[key]) {
      totals[key] = {
        student: s.student,
        group: s.group,
        score: 0,
        presentCount: 0,
        lateCount: 0,
        absentCount: 0,
        bonusPoints: 0,
      };
    }
    totals[key].score += (s.score || 0);
    totals[key].presentCount += (s.presentCount || 0);
    totals[key].lateCount += (s.lateCount || 0);
    totals[key].absentCount += (s.absentCount || 0);
    totals[key].bonusPoints += (s.bonusPoints || 0);
  }

  const newDocs = Object.values(totals);
  
  if (newDocs.length > 0) {
    // 3. Upsert them into studentscores (so it adds to whatever the user just took attendance for)
    const ops = newDocs.map(d => ({
      updateOne: {
        filter: { student: d.student, group: d.group },
        update: {
          $inc: {
            score: d.score,
            presentCount: d.presentCount,
            lateCount: d.lateCount,
            absentCount: d.absentCount,
            bonusPoints: d.bonusPoints
          },
          $setOnInsert: {
            createdAt: new Date(),
            updatedAt: new Date()
          }
        },
        upsert: true
      }
    }));
    await db.collection("studentscores").bulkWrite(ops);
    console.log(`Migrated and merged ${newDocs.length} aggregated scores to studentscores.`);
  }

  process.exit(0);
}

migrate().catch(console.error);
