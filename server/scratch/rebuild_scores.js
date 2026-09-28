require("dotenv").config({ path: "./.env" });
const mongoose = require("mongoose");

const ATTENDANCE_SCORE = {
  PRESENT: 2,
  LATE:    1,
  ABSENT:  0,
};

async function rebuild() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;

  const totals = {};

  // 1. Get bonus points from monthlyscores
  const monthlyScores = await db.collection("monthlyscores").find({}).toArray();
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
    // Only aggregate bonus points! We will calculate attendance points from raw attendance docs.
    totals[key].bonusPoints += (s.bonusPoints || 0);
    totals[key].score += (s.bonusPoints || 0);
  }

  // 2. Get ALL attendance sessions
  const attendances = await db.collection("attendances").find({}).toArray();
  for (const session of attendances) {
    if (!session.records) continue;
    
    for (const r of session.records) {
      const key = `${r.student}_${session.group}`;
      if (!totals[key]) {
        totals[key] = {
          student: r.student,
          group: session.group,
          score: 0,
          presentCount: 0,
          lateCount: 0,
          absentCount: 0,
          bonusPoints: 0,
        };
      }
      
      const status = r.status;
      const score = ATTENDANCE_SCORE[status] || 0;
      
      totals[key].score += score;
      if (status === "PRESENT") totals[key].presentCount++;
      if (status === "LATE") totals[key].lateCount++;
      if (status === "ABSENT") totals[key].absentCount++;
    }
  }

  const newDocs = Object.values(totals);
  
  if (newDocs.length > 0) {
    // 3. Drop studentscores and insert calculated totals
    await db.collection("studentscores").deleteMany({});
    
    // Add timestamps
    for(const doc of newDocs) {
        doc.createdAt = new Date();
        doc.updatedAt = new Date();
    }
    
    await db.collection("studentscores").insertMany(newDocs);
    console.log(`Successfully rebuilt ${newDocs.length} student scores from raw attendance data and bonus points.`);
  }

  process.exit(0);
}

rebuild().catch(console.error);
