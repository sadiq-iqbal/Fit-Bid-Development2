import { Router, type IRouter, type Request, type Response } from "express";
import {
  db,
  engagementsTable,
  workoutPlansTable,
  workoutDaysTable,
  exercisesTable,
  workoutLogsTable,
  mealPlansTable,
  mealsTable,
  mealLogsTable,
  progressEntriesTable,
  checkInsTable,
  messagesTable,
  usersTable,
} from "@workspace/db";
import { eq, and, or, desc, asc } from "drizzle-orm";
import { z } from "zod/v4";

const router: IRouter = Router();

function requireAuth(req: Request, res: Response): boolean {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return false;
  }
  return true;
}

async function getEngagementOrFail(id: number, userId: string, res: Response) {
  const [eng] = await db
    .select()
    .from(engagementsTable)
    .where(eq(engagementsTable.id, id));
  if (!eng) {
    res.status(404).json({ error: "Not found" });
    return null;
  }
  const members = [eng.clientId, eng.trainerId, eng.nutritionistId].filter(Boolean);
  if (!members.includes(userId)) {
    res.status(403).json({ error: "Forbidden" });
    return null;
  }
  return eng;
}

// GET /api/engagements
router.get("/engagements", async (req: Request, res: Response) => {
  if (!requireAuth(req, res)) return;
  const uid = req.user!.id;
  const engagements = await db
    .select()
    .from(engagementsTable)
    .where(
      or(
        eq(engagementsTable.clientId, uid),
        eq(engagementsTable.trainerId, uid),
        eq(engagementsTable.nutritionistId, uid)
      )
    )
    .orderBy(desc(engagementsTable.startDate));
  res.json(engagements);
});

// GET /api/engagements/:engagementId
router.get("/engagements/:engagementId", async (req: Request, res: Response) => {
  if (!requireAuth(req, res)) return;
  const id = parseInt(req.params.engagementId);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const eng = await getEngagementOrFail(id, req.user!.id, res);
  if (!eng) return;
  res.json(eng);
});

// PATCH /api/engagements/:engagementId
router.patch("/engagements/:engagementId", async (req: Request, res: Response) => {
  if (!requireAuth(req, res)) return;
  const id = parseInt(req.params.engagementId);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const eng = await getEngagementOrFail(id, req.user!.id, res);
  if (!eng) return;
  const schema = z.object({
    status: z.enum(["active", "paused", "completed", "disputed"]).optional(),
    endDate: z.string().optional(),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid body" }); return; }
  const [updated] = await db
    .update(engagementsTable)
    .set({ ...parsed.data, ...(parsed.data.endDate ? { endDate: new Date(parsed.data.endDate) } : {}) })
    .where(eq(engagementsTable.id, id))
    .returning();
  res.json(updated);
});

// GET /api/engagements/:engagementId/overview
router.get("/engagements/:engagementId/overview", async (req: Request, res: Response) => {
  if (!requireAuth(req, res)) return;
  const id = parseInt(req.params.engagementId);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const eng = await getEngagementOrFail(id, req.user!.id, res);
  if (!eng) return;

  const [workoutCount, mealCount, progressCount, checkInCount, messageCount] = await Promise.all([
    db.select().from(workoutLogsTable).where(eq(workoutLogsTable.engagementId, id)),
    db.select().from(mealLogsTable).where(eq(mealLogsTable.engagementId, id)),
    db.select().from(progressEntriesTable).where(eq(progressEntriesTable.engagementId, id)),
    db.select().from(checkInsTable).where(eq(checkInsTable.engagementId, id)),
    db.select().from(messagesTable).where(eq(messagesTable.engagementId, id)),
  ]);

  const latestProgress = progressCount.sort((a, b) =>
    new Date(b.loggedAt).getTime() - new Date(a.loggedAt).getTime()
  )[0];

  res.json({
    engagement: eng,
    stats: {
      workoutsCompleted: workoutCount.length,
      mealsLogged: mealCount.length,
      progressEntries: progressCount.length,
      checkIns: checkInCount.length,
      messages: messageCount.length,
    },
    latestProgress: latestProgress ?? null,
  });
});

// ─── Workout Plans ─────────────────────────────────────────────────────────────

router.get("/engagements/:engagementId/workout-plans", async (req: Request, res: Response) => {
  if (!requireAuth(req, res)) return;
  const id = parseInt(req.params.engagementId);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const eng = await getEngagementOrFail(id, req.user!.id, res);
  if (!eng) return;
  const plans = await db.select().from(workoutPlansTable).where(eq(workoutPlansTable.engagementId, id)).orderBy(asc(workoutPlansTable.weekNumber));
  res.json(plans);
});

router.post("/engagements/:engagementId/workout-plans", async (req: Request, res: Response) => {
  if (!requireAuth(req, res)) return;
  const id = parseInt(req.params.engagementId);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const eng = await getEngagementOrFail(id, req.user!.id, res);
  if (!eng) return;
  const schema = z.object({ weekNumber: z.number().int(), notes: z.string().optional() });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid body" }); return; }
  const [plan] = await db.insert(workoutPlansTable).values({ engagementId: id, trainerId: req.user!.id, ...parsed.data }).returning();
  res.status(201).json(plan);
});

router.get("/workout-plans/:planId", async (req: Request, res: Response) => {
  if (!requireAuth(req, res)) return;
  const planId = parseInt(req.params.planId);
  if (isNaN(planId)) { res.status(400).json({ error: "Invalid planId" }); return; }
  const [plan] = await db.select().from(workoutPlansTable).where(eq(workoutPlansTable.id, planId));
  if (!plan) { res.status(404).json({ error: "Not found" }); return; }
  const days = await db.select().from(workoutDaysTable).where(eq(workoutDaysTable.planId, planId));
  const daysWithExercises = await Promise.all(
    days.map(async (day) => {
      const exercises = await db.select().from(exercisesTable).where(eq(exercisesTable.dayId, day.id)).orderBy(asc(exercisesTable.orderIndex));
      return { ...day, exercises };
    })
  );
  res.json({ ...plan, days: daysWithExercises });
});

router.patch("/workout-plans/:planId", async (req: Request, res: Response) => {
  if (!requireAuth(req, res)) return;
  const planId = parseInt(req.params.planId);
  if (isNaN(planId)) { res.status(400).json({ error: "Invalid planId" }); return; }
  const schema = z.object({ weekNumber: z.number().int().optional(), notes: z.string().optional() });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid body" }); return; }
  const [updated] = await db.update(workoutPlansTable).set(parsed.data).where(eq(workoutPlansTable.id, planId)).returning();
  res.json(updated);
});

// Workout days
router.post("/workout-plans/:planId/days", async (req: Request, res: Response) => {
  if (!requireAuth(req, res)) return;
  const planId = parseInt(req.params.planId);
  if (isNaN(planId)) { res.status(400).json({ error: "Invalid planId" }); return; }
  const schema = z.object({
    dayOfWeek: z.string(),
    focusArea: z.string().optional(),
    durationMinutes: z.number().int().optional(),
    notes: z.string().optional(),
    isRestDay: z.boolean().optional(),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid body" }); return; }
  const [day] = await db.insert(workoutDaysTable).values({ planId, ...parsed.data }).returning();
  res.status(201).json(day);
});

router.patch("/workout-days/:dayId", async (req: Request, res: Response) => {
  if (!requireAuth(req, res)) return;
  const dayId = parseInt(req.params.dayId);
  if (isNaN(dayId)) { res.status(400).json({ error: "Invalid dayId" }); return; }
  const schema = z.object({
    dayOfWeek: z.string().optional(),
    focusArea: z.string().optional(),
    durationMinutes: z.number().int().optional(),
    notes: z.string().optional(),
    isRestDay: z.boolean().optional(),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid body" }); return; }
  const [updated] = await db.update(workoutDaysTable).set(parsed.data).where(eq(workoutDaysTable.id, dayId)).returning();
  res.json(updated);
});

router.delete("/workout-days/:dayId", async (req: Request, res: Response) => {
  if (!requireAuth(req, res)) return;
  const dayId = parseInt(req.params.dayId);
  if (isNaN(dayId)) { res.status(400).json({ error: "Invalid dayId" }); return; }
  await db.delete(workoutDaysTable).where(eq(workoutDaysTable.id, dayId));
  res.status(204).end();
});

// Exercises
router.post("/workout-days/:dayId/exercises", async (req: Request, res: Response) => {
  if (!requireAuth(req, res)) return;
  const dayId = parseInt(req.params.dayId);
  if (isNaN(dayId)) { res.status(400).json({ error: "Invalid dayId" }); return; }
  const schema = z.object({
    name: z.string(),
    sets: z.number().int().optional(),
    reps: z.number().int().optional(),
    restSeconds: z.number().int().optional(),
    videoUrl: z.string().optional(),
    notes: z.string().optional(),
    orderIndex: z.number().int().optional(),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid body" }); return; }
  const [exercise] = await db.insert(exercisesTable).values({ dayId, ...parsed.data }).returning();
  res.status(201).json(exercise);
});

router.patch("/exercises/:exerciseId", async (req: Request, res: Response) => {
  if (!requireAuth(req, res)) return;
  const exerciseId = parseInt(req.params.exerciseId);
  if (isNaN(exerciseId)) { res.status(400).json({ error: "Invalid exerciseId" }); return; }
  const schema = z.object({
    name: z.string().optional(),
    sets: z.number().int().optional(),
    reps: z.number().int().optional(),
    restSeconds: z.number().int().optional(),
    videoUrl: z.string().optional(),
    notes: z.string().optional(),
    orderIndex: z.number().int().optional(),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid body" }); return; }
  const [updated] = await db.update(exercisesTable).set(parsed.data).where(eq(exercisesTable.id, exerciseId)).returning();
  res.json(updated);
});

router.delete("/exercises/:exerciseId", async (req: Request, res: Response) => {
  if (!requireAuth(req, res)) return;
  const exerciseId = parseInt(req.params.exerciseId);
  if (isNaN(exerciseId)) { res.status(400).json({ error: "Invalid exerciseId" }); return; }
  await db.delete(exercisesTable).where(eq(exercisesTable.id, exerciseId));
  res.status(204).end();
});

// Workout Logs
router.get("/engagements/:engagementId/workout-logs", async (req: Request, res: Response) => {
  if (!requireAuth(req, res)) return;
  const id = parseInt(req.params.engagementId);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const eng = await getEngagementOrFail(id, req.user!.id, res);
  if (!eng) return;
  const logs = await db.select().from(workoutLogsTable).where(eq(workoutLogsTable.engagementId, id)).orderBy(desc(workoutLogsTable.completedAt));
  res.json(logs);
});

router.post("/engagements/:engagementId/workout-logs", async (req: Request, res: Response) => {
  if (!requireAuth(req, res)) return;
  const id = parseInt(req.params.engagementId);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const eng = await getEngagementOrFail(id, req.user!.id, res);
  if (!eng) return;
  const schema = z.object({ dayId: z.number().int(), notes: z.string().optional(), rating: z.number().int().optional() });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid body" }); return; }
  const [log] = await db.insert(workoutLogsTable).values({ engagementId: id, clientId: req.user!.id, ...parsed.data }).returning();
  res.status(201).json(log);
});

// ─── Meal Plans ────────────────────────────────────────────────────────────────

router.get("/engagements/:engagementId/meal-plans", async (req: Request, res: Response) => {
  if (!requireAuth(req, res)) return;
  const id = parseInt(req.params.engagementId);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const eng = await getEngagementOrFail(id, req.user!.id, res);
  if (!eng) return;
  const plans = await db.select().from(mealPlansTable).where(eq(mealPlansTable.engagementId, id)).orderBy(asc(mealPlansTable.weekNumber));
  res.json(plans);
});

router.post("/engagements/:engagementId/meal-plans", async (req: Request, res: Response) => {
  if (!requireAuth(req, res)) return;
  const id = parseInt(req.params.engagementId);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const eng = await getEngagementOrFail(id, req.user!.id, res);
  if (!eng) return;
  const schema = z.object({
    weekNumber: z.number().int(),
    dailyCalories: z.number().int().optional(),
    proteinG: z.number().int().optional(),
    carbsG: z.number().int().optional(),
    fatsG: z.number().int().optional(),
    notes: z.string().optional(),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid body" }); return; }
  const [plan] = await db.insert(mealPlansTable).values({ engagementId: id, nutritionistId: req.user!.id, ...parsed.data }).returning();
  res.status(201).json(plan);
});

router.get("/meal-plans/:planId", async (req: Request, res: Response) => {
  if (!requireAuth(req, res)) return;
  const planId = parseInt(req.params.planId);
  if (isNaN(planId)) { res.status(400).json({ error: "Invalid planId" }); return; }
  const [plan] = await db.select().from(mealPlansTable).where(eq(mealPlansTable.id, planId));
  if (!plan) { res.status(404).json({ error: "Not found" }); return; }
  const meals = await db.select().from(mealsTable).where(eq(mealsTable.planId, planId));
  res.json({ ...plan, meals });
});

router.patch("/meal-plans/:planId", async (req: Request, res: Response) => {
  if (!requireAuth(req, res)) return;
  const planId = parseInt(req.params.planId);
  if (isNaN(planId)) { res.status(400).json({ error: "Invalid planId" }); return; }
  const schema = z.object({
    weekNumber: z.number().int().optional(),
    dailyCalories: z.number().int().optional(),
    proteinG: z.number().int().optional(),
    carbsG: z.number().int().optional(),
    fatsG: z.number().int().optional(),
    notes: z.string().optional(),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid body" }); return; }
  const [updated] = await db.update(mealPlansTable).set(parsed.data).where(eq(mealPlansTable.id, planId)).returning();
  res.json(updated);
});

// Meals
router.post("/meal-plans/:planId/meals", async (req: Request, res: Response) => {
  if (!requireAuth(req, res)) return;
  const planId = parseInt(req.params.planId);
  if (isNaN(planId)) { res.status(400).json({ error: "Invalid planId" }); return; }
  const schema = z.object({
    dayOfWeek: z.string(),
    mealType: z.string(),
    items: z.array(z.string()).optional(),
    totalCalories: z.number().int().optional(),
    notes: z.string().optional(),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid body" }); return; }
  const [meal] = await db.insert(mealsTable).values({ planId, ...parsed.data }).returning();
  res.status(201).json(meal);
});

router.patch("/meals/:mealId", async (req: Request, res: Response) => {
  if (!requireAuth(req, res)) return;
  const mealId = parseInt(req.params.mealId);
  if (isNaN(mealId)) { res.status(400).json({ error: "Invalid mealId" }); return; }
  const schema = z.object({
    dayOfWeek: z.string().optional(),
    mealType: z.string().optional(),
    items: z.array(z.string()).optional(),
    totalCalories: z.number().int().optional(),
    notes: z.string().optional(),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid body" }); return; }
  const [updated] = await db.update(mealsTable).set(parsed.data).where(eq(mealsTable.id, mealId)).returning();
  res.json(updated);
});

router.delete("/meals/:mealId", async (req: Request, res: Response) => {
  if (!requireAuth(req, res)) return;
  const mealId = parseInt(req.params.mealId);
  if (isNaN(mealId)) { res.status(400).json({ error: "Invalid mealId" }); return; }
  await db.delete(mealsTable).where(eq(mealsTable.id, mealId));
  res.status(204).end();
});

// Meal Logs
router.get("/engagements/:engagementId/meal-logs", async (req: Request, res: Response) => {
  if (!requireAuth(req, res)) return;
  const id = parseInt(req.params.engagementId);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const eng = await getEngagementOrFail(id, req.user!.id, res);
  if (!eng) return;
  const logs = await db.select().from(mealLogsTable).where(eq(mealLogsTable.engagementId, id)).orderBy(desc(mealLogsTable.loggedAt));
  res.json(logs);
});

router.post("/engagements/:engagementId/meal-logs", async (req: Request, res: Response) => {
  if (!requireAuth(req, res)) return;
  const id = parseInt(req.params.engagementId);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const eng = await getEngagementOrFail(id, req.user!.id, res);
  if (!eng) return;
  const schema = z.object({ mealId: z.number().int(), compliance: z.enum(["full", "partial", "skipped"]), notes: z.string().optional() });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid body" }); return; }
  const [log] = await db.insert(mealLogsTable).values({ engagementId: id, clientId: req.user!.id, ...parsed.data }).returning();
  res.status(201).json(log);
});

// ─── Progress ──────────────────────────────────────────────────────────────────

router.get("/engagements/:engagementId/progress", async (req: Request, res: Response) => {
  if (!requireAuth(req, res)) return;
  const id = parseInt(req.params.engagementId);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const eng = await getEngagementOrFail(id, req.user!.id, res);
  if (!eng) return;
  const entries = await db.select().from(progressEntriesTable).where(eq(progressEntriesTable.engagementId, id)).orderBy(asc(progressEntriesTable.loggedAt));
  res.json(entries);
});

router.post("/engagements/:engagementId/progress", async (req: Request, res: Response) => {
  if (!requireAuth(req, res)) return;
  const id = parseInt(req.params.engagementId);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const eng = await getEngagementOrFail(id, req.user!.id, res);
  if (!eng) return;
  const schema = z.object({
    weightKg: z.number().optional(),
    waistCm: z.number().optional(),
    chestCm: z.number().optional(),
    hipsCm: z.number().optional(),
    energyLevel: z.number().int().min(1).max(5).optional(),
    sleepQuality: z.number().int().min(1).max(5).optional(),
    mood: z.number().int().min(1).max(5).optional(),
    notes: z.string().optional(),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid body" }); return; }
  const [entry] = await db.insert(progressEntriesTable).values({ engagementId: id, clientId: req.user!.id, ...parsed.data }).returning();
  res.status(201).json(entry);
});

router.patch("/progress/:entryId/annotate", async (req: Request, res: Response) => {
  if (!requireAuth(req, res)) return;
  const entryId = parseInt(req.params.entryId);
  if (isNaN(entryId)) { res.status(400).json({ error: "Invalid entryId" }); return; }
  const schema = z.object({ professionalNote: z.string() });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid body" }); return; }
  const [updated] = await db.update(progressEntriesTable).set(parsed.data).where(eq(progressEntriesTable.id, entryId)).returning();
  res.json(updated);
});

// ─── Check-ins ─────────────────────────────────────────────────────────────────

router.get("/engagements/:engagementId/check-ins", async (req: Request, res: Response) => {
  if (!requireAuth(req, res)) return;
  const id = parseInt(req.params.engagementId);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const eng = await getEngagementOrFail(id, req.user!.id, res);
  if (!eng) return;
  const checkIns = await db.select().from(checkInsTable).where(eq(checkInsTable.engagementId, id)).orderBy(desc(checkInsTable.weekNumber));
  res.json(checkIns);
});

router.post("/engagements/:engagementId/check-ins", async (req: Request, res: Response) => {
  if (!requireAuth(req, res)) return;
  const id = parseInt(req.params.engagementId);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const eng = await getEngagementOrFail(id, req.user!.id, res);
  if (!eng) return;
  const schema = z.object({
    weekNumber: z.number().int(),
    wentWell: z.string().optional(),
    challenges: z.string().optional(),
    painDiscomfort: z.string().optional(),
    questions: z.string().optional(),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid body" }); return; }
  const [checkIn] = await db.insert(checkInsTable).values({ engagementId: id, clientId: req.user!.id, ...parsed.data }).returning();
  res.status(201).json(checkIn);
});

router.get("/check-ins/:checkInId", async (req: Request, res: Response) => {
  if (!requireAuth(req, res)) return;
  const checkInId = parseInt(req.params.checkInId);
  if (isNaN(checkInId)) { res.status(400).json({ error: "Invalid checkInId" }); return; }
  const [checkIn] = await db.select().from(checkInsTable).where(eq(checkInsTable.id, checkInId));
  if (!checkIn) { res.status(404).json({ error: "Not found" }); return; }
  res.json(checkIn);
});

router.patch("/check-ins/:checkInId/respond", async (req: Request, res: Response) => {
  if (!requireAuth(req, res)) return;
  const checkInId = parseInt(req.params.checkInId);
  if (isNaN(checkInId)) { res.status(400).json({ error: "Invalid checkInId" }); return; }
  const schema = z.object({ professionalFeedback: z.string() });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid body" }); return; }
  const [updated] = await db.update(checkInsTable).set({ professionalFeedback: parsed.data.professionalFeedback, feedbackAt: new Date() }).where(eq(checkInsTable.id, checkInId)).returning();
  res.json(updated);
});

// ─── Messages ──────────────────────────────────────────────────────────────────

router.get("/engagements/:engagementId/messages", async (req: Request, res: Response) => {
  if (!requireAuth(req, res)) return;
  const id = parseInt(req.params.engagementId);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const eng = await getEngagementOrFail(id, req.user!.id, res);
  if (!eng) return;
  const { limit = "50", before } = req.query as Record<string, string>;
  const messages = await db.select().from(messagesTable).where(eq(messagesTable.engagementId, id)).orderBy(asc(messagesTable.sentAt)).limit(parseInt(limit));
  res.json(messages);
});

router.post("/engagements/:engagementId/messages", async (req: Request, res: Response) => {
  if (!requireAuth(req, res)) return;
  const id = parseInt(req.params.engagementId);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const eng = await getEngagementOrFail(id, req.user!.id, res);
  if (!eng) return;
  const schema = z.object({ content: z.string(), attachmentUrl: z.string().optional() });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid body" }); return; }
  const [message] = await db.insert(messagesTable).values({ engagementId: id, senderId: req.user!.id, ...parsed.data }).returning();
  res.status(201).json(message);
});

export default router;
