/**
 * reset.ts — حذف كل الداتا مع الاحتفاظ بحساب الأدمن
 * Run: npx tsx src/database/reset.ts
 */
import mongoose from "mongoose"
import { env }  from "../config/env"
import { User } from "../models/User"
import { Role } from "../types/index"

async function main() {
  console.log("🔌 Connecting to MongoDB...")
  await mongoose.connect(env.MONGODB_URI)
  console.log("✅ Connected\n")

  // ── Save admin user before wiping ──────────────────────────────────────────
  const admin = await User.findOne({ role: Role.ADMIN }).lean()
  if (!admin) {
    console.error("❌ No admin account found — aborting.")
    await mongoose.disconnect()
    process.exit(1)
  }
  console.log(`👤 Admin found: ${admin.email} — will be preserved.`)

  // ── Drop every collection except the admin user ────────────────────────────
  const db = mongoose.connection.db!

  // List all collections
  const collections = await db.listCollections().toArray()
  const names = collections.map(c => c.name)
  console.log(`\n🗑️  Found ${names.length} collections: ${names.join(", ")}`)

  // Delete all documents from every collection
  await Promise.all(names.map(name => db.collection(name).deleteMany({})))
  console.log("✅ All collections cleared.")

  // ── Re-insert the admin user ───────────────────────────────────────────────
  const { _id, ...adminData } = admin as { _id: unknown; [key: string]: unknown }
  await db.collection("users").insertOne({ _id, ...adminData })
  console.log(`\n✅ Admin re-inserted: ${admin.email}`)

  // ── Done ───────────────────────────────────────────────────────────────────
  console.log("\n─────────────────────────────────────────────────")
  console.log("✅  Reset complete — only admin account remains.")
  console.log(`    Email   : ${admin.email}`)
  console.log("─────────────────────────────────────────────────")

  await mongoose.disconnect()
  process.exit(0)
}

main().catch(err => {
  console.error("❌ Reset failed:", err)
  mongoose.disconnect()
  process.exit(1)
})
