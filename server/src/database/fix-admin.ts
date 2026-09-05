/**
 * fix-admin.ts — recreate admin with correct password hash
 * Run: npx tsx src/database/fix-admin.ts
 */
import mongoose from "mongoose"
import { env }  from "../config/env"
import { User } from "../models/User"
import { Role } from "../types/index"
import argon2   from "argon2"

const ADMIN = {
  name:     "مدير النظام",
  email:    "admin@edusync.com",
  password: "Admin@123456",
}

async function main() {
  console.log("🔌 Connecting...")
  await mongoose.connect(env.MONGODB_URI)
  console.log("✅ Connected\n")

  // Hash the password properly
  const passwordHash = await argon2.hash(ADMIN.password)

  // Upsert admin — update if exists, create if not
  const result = await User.findOneAndUpdate(
    { email: ADMIN.email },
    {
      $set: {
        name:         ADMIN.name,
        email:        ADMIN.email,
        passwordHash,
        role:         Role.ADMIN,
        isActive:     true,
      },
    },
    { upsert: true, new: true }
  )

  console.log(`✅ Admin ready: ${result.email}`)
  console.log(`   Password : ${ADMIN.password}`)
  console.log(`   Hash set : ${passwordHash.substring(0, 30)}...`)

  await mongoose.disconnect()
  process.exit(0)
}

main().catch(err => {
  console.error("❌ Failed:", err)
  mongoose.disconnect()
  process.exit(1)
})
