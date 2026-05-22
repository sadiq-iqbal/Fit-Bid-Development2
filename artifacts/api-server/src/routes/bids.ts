import { Router, type IRouter, type Request, type Response } from "express";
import { db, bidsTable, postsTable, engagementsTable, usersTable } from "@workspace/db";
import { eq, and, desc } from "drizzle-orm";
import { z } from "zod";

const router: IRouter = Router();

// GET /api/posts/:postId/bids
router.get("/posts/:postId/bids", async (req: Request, res: Response) => {
  const postId = parseInt(req.params.postId);
  if (isNaN(postId)) {
    res.status(400).json({ error: "Invalid postId" });
    return;
  }
  const bids = await db
    .select()
    .from(bidsTable)
    .where(eq(bidsTable.postId, postId))
    .orderBy(desc(bidsTable.createdAt));
  res.json(bids);
});

// POST /api/posts/:postId/bids
router.post("/posts/:postId/bids", async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const postId = parseInt(req.params.postId);
  if (isNaN(postId)) {
    res.status(400).json({ error: "Invalid postId" });
    return;
  }
  const schema = z.object({
    proposalText: z.string().optional(),
    price: z.number().optional(),
    estimatedWeeks: z.number().int().optional(),
    introOffer: z.string().optional(),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid body" });
    return;
  }
  const [bid] = await db
    .insert(bidsTable)
    .values({ postId, professionalId: req.user!.id, ...parsed.data })
    .returning();
  res.status(201).json(bid);
});

// GET /api/bids/mine
router.get("/bids/mine", async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const bids = await db
    .select()
    .from(bidsTable)
    .where(eq(bidsTable.professionalId, req.user!.id))
    .orderBy(desc(bidsTable.createdAt));
  res.json(bids);
});

// GET /api/bids/:bidId
router.get("/bids/:bidId", async (req: Request, res: Response) => {
  const bidId = parseInt(req.params.bidId);
  if (isNaN(bidId)) {
    res.status(400).json({ error: "Invalid bidId" });
    return;
  }
  const [bid] = await db.select().from(bidsTable).where(eq(bidsTable.id, bidId));
  if (!bid) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json(bid);
});

// PATCH /api/bids/:bidId/status
router.patch("/bids/:bidId/status", async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const bidId = parseInt(req.params.bidId);
  if (isNaN(bidId)) {
    res.status(400).json({ error: "Invalid bidId" });
    return;
  }
  const schema = z.object({
    status: z.enum(["accepted", "rejected"]),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid body" });
    return;
  }

  const [bid] = await db.select().from(bidsTable).where(eq(bidsTable.id, bidId));
  if (!bid) {
    res.status(404).json({ error: "Not found" });
    return;
  }

  const [post] = await db.select().from(postsTable).where(eq(postsTable.id, bid.postId));
  if (!post || post.clientId !== req.user!.id) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  const [updatedBid] = await db
    .update(bidsTable)
    .set({ status: parsed.data.status, updatedAt: new Date() })
    .where(eq(bidsTable.id, bidId))
    .returning();

  if (parsed.data.status === "accepted") {
    const [prof] = await db.select().from(usersTable).where(eq(usersTable.id, bid.professionalId));
    const role = prof?.role;

    const existingEngagements = await db
      .select()
      .from(engagementsTable)
      .where(eq(engagementsTable.postId, post.id));

    let engagement = existingEngagements[0];
    if (!engagement) {
      const [created] = await db
        .insert(engagementsTable)
        .values({
          postId: post.id,
          clientId: post.clientId,
          trainerId: role === "trainer" ? bid.professionalId : null,
          nutritionistId: role === "nutritionist" ? bid.professionalId : null,
          totalAmount: bid.price,
        })
        .returning();
      engagement = created;
    } else {
      const updateData: Partial<typeof engagement> = {};
      if (role === "trainer" && !engagement.trainerId) {
        (updateData as Record<string, unknown>).trainerId = bid.professionalId;
      }
      if (role === "nutritionist" && !engagement.nutritionistId) {
        (updateData as Record<string, unknown>).nutritionistId = bid.professionalId;
      }
      if (Object.keys(updateData).length) {
        const [updated] = await db
          .update(engagementsTable)
          .set(updateData)
          .where(eq(engagementsTable.id, engagement.id))
          .returning();
        engagement = updated;
      }
    }

    res.json({ bid: updatedBid, engagement });
    return;
  }

  res.json(updatedBid);
});

export default router;
