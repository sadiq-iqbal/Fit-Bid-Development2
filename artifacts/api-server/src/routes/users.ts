import { Router, type IRouter, type Request, type Response } from "express";
import { db, usersTable, clientProfilesTable, professionalProfilesTable } from "@workspace/db";
import { eq, sql, desc, asc, ilike, and } from "drizzle-orm";
import { z } from "zod/v4";

const router: IRouter = Router();

// GET /api/users/me
router.get("/users/me", async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, req.user!.id));
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  res.json(user);
});

// PATCH /api/users/me
router.patch("/users/me", async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const schema = z.object({
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    profileImageUrl: z.string().optional(),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid body" });
    return;
  }
  const [updated] = await db
    .update(usersTable)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(usersTable.id, req.user!.id))
    .returning();
  res.json(updated);
});

// GET /api/users/:userId
router.get("/users/:userId", async (req: Request, res: Response) => {
  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, req.params.userId));
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  res.json(user);
});

// POST /api/users/me/onboarding
router.post("/users/me/onboarding", async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const schema = z.object({
    role: z.enum(["client", "trainer", "nutritionist"]),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid body" });
    return;
  }
  const [user] = await db
    .update(usersTable)
    .set({ role: parsed.data.role, onboardingCompleted: true, updatedAt: new Date(), ...( parsed.data.firstName ? { firstName: parsed.data.firstName } : {}), ...(parsed.data.lastName ? { lastName: parsed.data.lastName } : {}) })
    .where(eq(usersTable.id, req.user!.id))
    .returning();
  res.json(user);
});

// GET /api/profiles/me/client
router.get("/profiles/me/client", async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const [profile] = await db
    .select()
    .from(clientProfilesTable)
    .where(eq(clientProfilesTable.userId, req.user!.id));
  res.json(profile ?? null);
});

// PUT /api/profiles/me/client
router.put("/profiles/me/client", async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const schema = z.object({
    age: z.number().int().optional(),
    gender: z.string().optional(),
    heightCm: z.number().optional(),
    weightKg: z.number().optional(),
    healthConditions: z.array(z.string()).optional(),
    fitnessGoals: z.array(z.string()).optional(),
    activityLevel: z.string().optional(),
    budgetMin: z.number().optional(),
    budgetMax: z.number().optional(),
    preferredDurationWeeks: z.number().int().optional(),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid body" });
    return;
  }
  const [profile] = await db
    .insert(clientProfilesTable)
    .values({ userId: req.user!.id, ...parsed.data })
    .onConflictDoUpdate({
      target: clientProfilesTable.userId,
      set: { ...parsed.data, updatedAt: new Date() },
    })
    .returning();
  res.json(profile);
});

// GET /api/profiles/me/professional
router.get("/profiles/me/professional", async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const [profile] = await db
    .select()
    .from(professionalProfilesTable)
    .where(eq(professionalProfilesTable.userId, req.user!.id));
  res.json(profile ?? null);
});

// PUT /api/profiles/me/professional
router.put("/profiles/me/professional", async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const schema = z.object({
    specialty: z.string().optional(),
    bio: z.string().optional(),
    yearsExperience: z.number().int().optional(),
    certifications: z.array(z.string()).optional(),
    hourlyRate: z.number().optional(),
    availabilityStatus: z.enum(["open", "booked"]).optional(),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid body" });
    return;
  }
  const [profile] = await db
    .insert(professionalProfilesTable)
    .values({ userId: req.user!.id, ...parsed.data })
    .onConflictDoUpdate({
      target: professionalProfilesTable.userId,
      set: { ...parsed.data, updatedAt: new Date() },
    })
    .returning();
  res.json(profile);
});

// GET /api/professionals
router.get("/professionals", async (req: Request, res: Response) => {
  const { role, specialty, minRating, maxRate, limit = "20", offset = "0" } = req.query as Record<string, string>;

  const conditions = [eq(usersTable.role, "trainer")];
  // Filter by role if specified (trainer or nutritionist)
  const roleFilter = role === "nutritionist" ? eq(usersTable.role, "nutritionist") : role === "trainer" ? eq(usersTable.role, "trainer") : undefined;

  const rows = await db
    .select({
      user: usersTable,
      profile: professionalProfilesTable,
    })
    .from(usersTable)
    .leftJoin(professionalProfilesTable, eq(usersTable.id, professionalProfilesTable.userId))
    .where(
      roleFilter
        ? and(
            roleFilter,
            eq(professionalProfilesTable.verificationStatus, "approved")
          )
        : and(
            sql`${usersTable.role} IN ('trainer', 'nutritionist')`,
            eq(professionalProfilesTable.verificationStatus, "approved")
          )
    )
    .orderBy(desc(professionalProfilesTable.avgRating))
    .limit(parseInt(limit))
    .offset(parseInt(offset));

  res.json(rows.map(r => ({ ...r.user, profile: r.profile })));
});

// GET /api/professionals/featured
router.get("/professionals/featured", async (req: Request, res: Response) => {
  const rows = await db
    .select({
      user: usersTable,
      profile: professionalProfilesTable,
    })
    .from(usersTable)
    .leftJoin(professionalProfilesTable, eq(usersTable.id, professionalProfilesTable.userId))
    .where(
      and(
        sql`${usersTable.role} IN ('trainer', 'nutritionist')`,
        eq(professionalProfilesTable.verificationStatus, "approved")
      )
    )
    .orderBy(desc(professionalProfilesTable.avgRating))
    .limit(6);

  res.json(rows.map(r => ({ ...r.user, profile: r.profile })));
});

// GET /api/professionals/:userId/profile
router.get("/professionals/:userId/profile", async (req: Request, res: Response) => {
  const [row] = await db
    .select({ user: usersTable, profile: professionalProfilesTable })
    .from(usersTable)
    .leftJoin(professionalProfilesTable, eq(usersTable.id, professionalProfilesTable.userId))
    .where(eq(usersTable.id, req.params.userId));
  if (!row) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json({ ...row.user, profile: row.profile });
});

export default router;
