import { Router, type IRouter, type Request, type Response } from "express";
import {
  db,
  reviewsTable,
  notificationsTable,
  usersTable,
  professionalProfilesTable,
  engagementsTable,
  postsTable,
  bidsTable,
} from "@workspace/db";
import { eq, desc, and, sql, avg } from "drizzle-orm";
import { z } from "zod/v4";

const router: IRouter = Router();

// ─── Reviews ──────────────────────────────────────────────────────────────────

router.get("/users/:userId/reviews", async (req: Request, res: Response) => {
  const reviews = await db
    .select()
    .from(reviewsTable)
    .where(eq(reviewsTable.revieweeId, req.params.userId))
    .orderBy(desc(reviewsTable.createdAt));
  res.json(reviews);
});

router.post("/reviews", async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const schema = z.object({
    engagementId: z.number().int(),
    revieweeId: z.string(),
    rating: z.number().int().min(1).max(5),
    comment: z.string().optional(),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid body" });
    return;
  }
  const [review] = await db
    .insert(reviewsTable)
    .values({ reviewerId: req.user!.id, ...parsed.data })
    .returning();

  // Update avg rating
  const [result] = await db
    .select({ avg: avg(reviewsTable.rating) })
    .from(reviewsTable)
    .where(eq(reviewsTable.revieweeId, parsed.data.revieweeId));
  if (result?.avg) {
    await db
      .update(professionalProfilesTable)
      .set({ avgRating: parseFloat(result.avg as string), updatedAt: new Date() })
      .where(eq(professionalProfilesTable.userId, parsed.data.revieweeId));
  }

  res.status(201).json(review);
});

router.patch("/reviews/:reviewId/reply", async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const reviewId = parseInt(req.params.reviewId);
  if (isNaN(reviewId)) {
    res.status(400).json({ error: "Invalid reviewId" });
    return;
  }
  const schema = z.object({ professionalReply: z.string() });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid body" });
    return;
  }
  const [updated] = await db
    .update(reviewsTable)
    .set({ professionalReply: parsed.data.professionalReply })
    .where(and(eq(reviewsTable.id, reviewId), eq(reviewsTable.revieweeId, req.user!.id)))
    .returning();
  if (!updated) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json(updated);
});

// ─── Notifications ─────────────────────────────────────────────────────────────

router.get("/notifications", async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const { unreadOnly, limit = "30" } = req.query as Record<string, string>;
  const conditions = [eq(notificationsTable.userId, req.user!.id)];
  if (unreadOnly === "true") conditions.push(eq(notificationsTable.read, false));
  const notifications = await db
    .select()
    .from(notificationsTable)
    .where(and(...conditions))
    .orderBy(desc(notificationsTable.createdAt))
    .limit(parseInt(limit));
  res.json(notifications);
});

router.patch("/notifications/read-all", async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  await db
    .update(notificationsTable)
    .set({ read: true })
    .where(eq(notificationsTable.userId, req.user!.id));
  res.json({ success: true });
});

router.patch("/notifications/:notificationId/read", async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const id = parseInt(req.params.notificationId);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const [updated] = await db
    .update(notificationsTable)
    .set({ read: true })
    .where(and(eq(notificationsTable.id, id), eq(notificationsTable.userId, req.user!.id)))
    .returning();
  res.json(updated);
});

// ─── Dashboard ─────────────────────────────────────────────────────────────────

router.get("/dashboard", async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const uid = req.user!.id;
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, uid));

  const [engCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(engagementsTable)
    .where(
      sql`(${engagementsTable.clientId} = ${uid} OR ${engagementsTable.trainerId} = ${uid} OR ${engagementsTable.nutritionistId} = ${uid})`
    );

  const [postCount] = user?.role === "client"
    ? await db.select({ count: sql<number>`count(*)::int` }).from(postsTable).where(eq(postsTable.clientId, uid))
    : [{ count: 0 }];

  const [bidCount] = user?.role !== "client"
    ? await db.select({ count: sql<number>`count(*)::int` }).from(bidsTable).where(eq(bidsTable.professionalId, uid))
    : [{ count: 0 }];

  const recentEngagements = await db
    .select()
    .from(engagementsTable)
    .where(
      sql`(${engagementsTable.clientId} = ${uid} OR ${engagementsTable.trainerId} = ${uid} OR ${engagementsTable.nutritionistId} = ${uid})`
    )
    .orderBy(desc(engagementsTable.startDate))
    .limit(5);

  const unreadNotifications = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(notificationsTable)
    .where(and(eq(notificationsTable.userId, uid), eq(notificationsTable.read, false)));

  res.json({
    user,
    stats: {
      totalEngagements: engCount?.count ?? 0,
      totalPosts: postCount?.count ?? 0,
      totalBids: bidCount?.count ?? 0,
      unreadNotifications: unreadNotifications[0]?.count ?? 0,
    },
    recentEngagements,
  });
});

export default router;
