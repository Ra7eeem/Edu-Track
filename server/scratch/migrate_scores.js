require("dotenv").config({ path: "./.env" });
const mongoose = require("mongoose");

async function migrate() {
  await mongoose.connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/edu-track");
  const db = mongoose.connection.db;

  const monthlyScores = await db.collection("monthlyscores").find({}).toArray();
  
  if (monthlyScores.length === 0) {
    console.log("No old scores found.");
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
        createdAt: s.createdAt,
        updatedAt: s.updatedAt,
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
          }
        },
        upsert: true
      }
    }));
    await db.collection("studentscores").bulkWrite(ops);
    console.log(`Migrated ${newDocs.length} aggregated scores to studentscores.`);
  }

  process.exit(0);
}

migrate().catch(console.error);
