import { Router, type IRouter, type Request, type Response } from "express";
import { db, postsTable, usersTable, bidsTable } from "@workspace/db";
import { eq, and, sql, count, desc } from "drizzle-orm";
import { z } from "zod";

const router: IRouter = Router();

// GET /api/posts
router.get("/posts", async (req: Request, res: Response) => {
  const { needsTrainer, needsNutritionist, status, limit = "20", offset = "0" } =
    req.query as Record<string, string>;

  const conditions: ReturnType<typeof eq>[] = [eq(postsTable.status, status || "open")];
  if (needsTrainer === "true") conditions.push(eq(postsTable.needsTrainer, true));
  if (needsNutritionist === "true") conditions.push(eq(postsTable.needsNutritionist, true));

  const rows = await db
    .select({
      post: postsTable,
      bidCount: count(bidsTable.id),
    })
    .from(postsTable)
    .leftJoin(bidsTable, eq(bidsTable.postId, postsTable.id))
    .where(and(...conditions))
    .groupBy(postsTable.id)
    .orderBy(desc(postsTable.createdAt))
    .limit(parseInt(limit))
    .offset(parseInt(offset));

  res.json(rows.map(r => ({ ...r.post, bidCount: r.bidCount })));
});

// POST /api/posts
router.post("/posts", async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const schema = z.object({
    title: z.string(),
    description: z.string().optional(),
    tags: z.array(z.string()).optional(),
    needsTrainer: z.boolean().optional(),
    needsNutritionist: z.boolean().optional(),
    budgetMin: z.number().optional(),
    budgetMax: z.number().optional(),
    durationWeeks: z.number().int().optional(),
    visibility: z.enum(["public", "invite_only"]).optional(),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid body" });
    return;
  }
  const [post] = await db
    .insert(postsTable)
    .values({ clientId: req.user!.id, ...parsed.data })
    .returning();
  res.status(201).json(post);
});

// GET /api/posts/mine
router.get("/posts/mine", async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const posts = await db
    .select()
    .from(postsTable)
    .where(eq(postsTable.clientId, req.user!.id))
    .orderBy(desc(postsTable.createdAt));
  res.json(posts);
});

// GET /api/posts/:postId
router.get("/posts/:postId", async (req: Request, res: Response) => {
  const id = parseInt(String(req.params.postId));
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const [post] = await db.select().from(postsTable).where(eq(postsTable.id, id));
  if (!post) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json(post);
});

// PATCH /api/posts/:postId
router.patch("/posts/:postId", async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const id = parseInt(String(req.params.postId));
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const schema = z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    tags: z.array(z.string()).optional(),
    needsTrainer: z.boolean().optional(),
    needsNutritionist: z.boolean().optional(),
    budgetMin: z.number().optional(),
    budgetMax: z.number().optional(),
    durationWeeks: z.number().int().optional(),
    status: z.enum(["open", "in_progress", "completed", "closed"]).optional(),
    visibility: z.enum(["public", "invite_only"]).optional(),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid body" });
    return;
  }
  const [updated] = await db
    .update(postsTable)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(and(eq(postsTable.id, id), eq(postsTable.clientId, req.user!.id)))
    .returning();
  if (!updated) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json(updated);
});

// DELETE /api/posts/:postId
router.delete("/posts/:postId", async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const id = parseInt(String(req.params.postId));
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  await db
    .delete(postsTable)
    .where(and(eq(postsTable.id, id), eq(postsTable.clientId, req.user!.id)));
  res.status(204).end();
});

export default router;
