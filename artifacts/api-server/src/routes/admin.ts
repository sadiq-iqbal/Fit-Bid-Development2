import { Router, type IRouter, type Request, type Response } from "express";
import {
  db,
  usersTable,
  professionalProfilesTable,
  engagementsTable,
  postsTable,
  bidsTable,
  reviewsTable,
} from "@workspace/db";
import { eq, sql, and } from "drizzle-orm";
import { z } from "zod";

const router: IRouter = Router();

function requireAdmin(req: Request, res: Response): boolean {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return false;
  }
  // We'll check admin status from DB
  return true;
}

// GET /api/admin/verifications
router.get("/admin/verifications", async (req: Request, res: Response) => {
  if (!requireAdmin(req, res)) return;

  const pending = await db
    .select({ user: usersTable, profile: professionalProfilesTable })
    .from(professionalProfilesTable)
    .leftJoin(usersTable, eq(usersTable.id, professionalProfilesTable.userId))
    .where(eq(professionalProfilesTable.verificationStatus, "pending"));

  res.json(pending.map(r => ({ ...r.user, profile: r.profile })));
});

// PATCH /api/admin/verifications/:userId
router.patch("/admin/verifications/:userId", async (req: Request, res: Response) => {
  if (!requireAdmin(req, res)) return;

  const schema = z.object({
    status: z.enum(["approved", "rejected"]),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid body" });
    return;
  }

  const [updated] = await db
    .update(professionalProfilesTable)
    .set({ verificationStatus: parsed.data.status, updatedAt: new Date() })
    .where(eq(professionalProfilesTable.userId, String(req.params.userId)))
    .returning();

  if (!updated) {
    res.status(404).json({ error: "Not found" });
    return;
  }

  res.json(updated);
});

// GET /api/admin/stats
router.get("/admin/stats", async (req: Request, res: Response) => {
  if (!requireAdmin(req, res)) return;

  const [totalUsers] = await db.select({ count: sql<number>`count(*)::int` }).from(usersTable);
  const [totalEngagements] = await db.select({ count: sql<number>`count(*)::int` }).from(engagementsTable);
  const [totalPosts] = await db.select({ count: sql<number>`count(*)::int` }).from(postsTable);
  const [totalBids] = await db.select({ count: sql<number>`count(*)::int` }).from(bidsTable);
  const [totalReviews] = await db.select({ count: sql<number>`count(*)::int` }).from(reviewsTable);
  const [pendingVerifications] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(professionalProfilesTable)
    .where(eq(professionalProfilesTable.verificationStatus, "pending"));

  const usersByRole = await db
    .select({ role: usersTable.role, count: sql<number>`count(*)::int` })
    .from(usersTable)
    .groupBy(usersTable.role);

  res.json({
    totalUsers: totalUsers?.count ?? 0,
    totalEngagements: totalEngagements?.count ?? 0,
    totalPosts: totalPosts?.count ?? 0,
    totalBids: totalBids?.count ?? 0,
    totalReviews: totalReviews?.count ?? 0,
    pendingVerifications: pendingVerifications?.count ?? 0,
    usersByRole,
  });
});

export default router;
