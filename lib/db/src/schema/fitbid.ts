import {
  pgTable,
  text,
  integer,
  serial,
  timestamp,
  boolean,
  real,
  jsonb,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

// ─── Users ────────────────────────────────────────────────────────────────────
export const usersTable = pgTable("users", {
  id: text("id").primaryKey(),
  email: text("email"),
  firstName: text("first_name"),
  lastName: text("last_name"),
  profileImageUrl: text("profile_image_url"),
  role: text("role"), // client | trainer | nutritionist | admin
  onboardingCompleted: boolean("onboarding_completed").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export type User = typeof usersTable.$inferSelect;
export const insertUserSchema = createInsertSchema(usersTable);

// ─── Client Profiles ──────────────────────────────────────────────────────────
export const clientProfilesTable = pgTable("client_profiles", {
  userId: text("user_id")
    .primaryKey()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  age: integer("age"),
  gender: text("gender"),
  heightCm: real("height_cm"),
  weightKg: real("weight_kg"),
  healthConditions: text("health_conditions").array().notNull().default([]),
  fitnessGoals: text("fitness_goals").array().notNull().default([]),
  activityLevel: text("activity_level"), // sedentary | lightly_active | moderately_active | very_active
  budgetMin: real("budget_min"),
  budgetMax: real("budget_max"),
  preferredDurationWeeks: integer("preferred_duration_weeks"),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export type ClientProfile = typeof clientProfilesTable.$inferSelect;
export const insertClientProfileSchema = createInsertSchema(clientProfilesTable);

// ─── Professional Profiles ────────────────────────────────────────────────────
export const professionalProfilesTable = pgTable("professional_profiles", {
  userId: text("user_id")
    .primaryKey()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  specialty: text("specialty"),
  bio: text("bio"),
  yearsExperience: integer("years_experience"),
  certifications: text("certifications").array().notNull().default([]),
  verificationStatus: text("verification_status")
    .notNull()
    .default("pending"), // pending | approved | rejected
  avgRating: real("avg_rating"),
  totalEngagements: integer("total_engagements").notNull().default(0),
  hourlyRate: real("hourly_rate"),
  availabilityStatus: text("availability_status").notNull().default("open"), // open | booked
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export type ProfessionalProfile = typeof professionalProfilesTable.$inferSelect;
export const insertProfessionalProfileSchema = createInsertSchema(
  professionalProfilesTable
);

// ─── Posts ────────────────────────────────────────────────────────────────────
export const postsTable = pgTable("posts", {
  id: serial("id").primaryKey(),
  clientId: text("client_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  tags: text("tags").array().notNull().default([]),
  needsTrainer: boolean("needs_trainer").notNull().default(true),
  needsNutritionist: boolean("needs_nutritionist").notNull().default(false),
  budgetMin: real("budget_min"),
  budgetMax: real("budget_max"),
  durationWeeks: integer("duration_weeks"),
  status: text("status").notNull().default("open"), // open | in_progress | completed | closed
  visibility: text("visibility").notNull().default("public"), // public | invite_only
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export type Post = typeof postsTable.$inferSelect;
export const insertPostSchema = createInsertSchema(postsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// ─── Bids ─────────────────────────────────────────────────────────────────────
export const bidsTable = pgTable("bids", {
  id: serial("id").primaryKey(),
  postId: integer("post_id")
    .notNull()
    .references(() => postsTable.id, { onDelete: "cascade" }),
  professionalId: text("professional_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  proposalText: text("proposal_text"),
  price: real("price"),
  estimatedWeeks: integer("estimated_weeks"),
  introOffer: text("intro_offer"),
  status: text("status").notNull().default("pending"), // pending | accepted | rejected
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export type Bid = typeof bidsTable.$inferSelect;
export const insertBidSchema = createInsertSchema(bidsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// ─── Engagements ──────────────────────────────────────────────────────────────
export const engagementsTable = pgTable("engagements", {
  id: serial("id").primaryKey(),
  postId: integer("post_id")
    .notNull()
    .references(() => postsTable.id),
  clientId: text("client_id")
    .notNull()
    .references(() => usersTable.id),
  trainerId: text("trainer_id").references(() => usersTable.id),
  nutritionistId: text("nutritionist_id").references(() => usersTable.id),
  status: text("status").notNull().default("active"), // active | paused | completed | disputed
  startDate: timestamp("start_date", { withTimezone: true })
    .notNull()
    .defaultNow(),
  endDate: timestamp("end_date", { withTimezone: true }),
  totalAmount: real("total_amount"),
  escrowStatus: text("escrow_status").default("held"), // held | released | refunded
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type Engagement = typeof engagementsTable.$inferSelect;
export const insertEngagementSchema = createInsertSchema(
  engagementsTable
).omit({ id: true, createdAt: true });

// ─── Workout Plans ────────────────────────────────────────────────────────────
export const workoutPlansTable = pgTable("workout_plans", {
  id: serial("id").primaryKey(),
  engagementId: integer("engagement_id")
    .notNull()
    .references(() => engagementsTable.id, { onDelete: "cascade" }),
  trainerId: text("trainer_id")
    .notNull()
    .references(() => usersTable.id),
  weekNumber: integer("week_number").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type WorkoutPlan = typeof workoutPlansTable.$inferSelect;
export const insertWorkoutPlanSchema = createInsertSchema(
  workoutPlansTable
).omit({ id: true, createdAt: true });

// ─── Workout Days ─────────────────────────────────────────────────────────────
export const workoutDaysTable = pgTable("workout_days", {
  id: serial("id").primaryKey(),
  planId: integer("plan_id")
    .notNull()
    .references(() => workoutPlansTable.id, { onDelete: "cascade" }),
  dayOfWeek: text("day_of_week").notNull(), // monday | tuesday | ...
  focusArea: text("focus_area"),
  durationMinutes: integer("duration_minutes"),
  notes: text("notes"),
  isRestDay: boolean("is_rest_day").notNull().default(false),
});

export type WorkoutDay = typeof workoutDaysTable.$inferSelect;
export const insertWorkoutDaySchema = createInsertSchema(
  workoutDaysTable
).omit({ id: true });

// ─── Exercises ────────────────────────────────────────────────────────────────
export const exercisesTable = pgTable("exercises", {
  id: serial("id").primaryKey(),
  dayId: integer("day_id")
    .notNull()
    .references(() => workoutDaysTable.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  sets: integer("sets"),
  reps: integer("reps"),
  restSeconds: integer("rest_seconds"),
  videoUrl: text("video_url"),
  notes: text("notes"),
  orderIndex: integer("order_index").notNull().default(0),
});

export type Exercise = typeof exercisesTable.$inferSelect;
export const insertExerciseSchema = createInsertSchema(exercisesTable).omit({
  id: true,
});

// ─── Workout Logs ─────────────────────────────────────────────────────────────
export const workoutLogsTable = pgTable("workout_logs", {
  id: serial("id").primaryKey(),
  engagementId: integer("engagement_id")
    .notNull()
    .references(() => engagementsTable.id, { onDelete: "cascade" }),
  clientId: text("client_id")
    .notNull()
    .references(() => usersTable.id),
  dayId: integer("day_id")
    .notNull()
    .references(() => workoutDaysTable.id),
  completedAt: timestamp("completed_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  notes: text("notes"),
  rating: integer("rating"),
});

export type WorkoutLog = typeof workoutLogsTable.$inferSelect;
export const insertWorkoutLogSchema = createInsertSchema(workoutLogsTable).omit(
  { id: true }
);

// ─── Meal Plans ───────────────────────────────────────────────────────────────
export const mealPlansTable = pgTable("meal_plans", {
  id: serial("id").primaryKey(),
  engagementId: integer("engagement_id")
    .notNull()
    .references(() => engagementsTable.id, { onDelete: "cascade" }),
  nutritionistId: text("nutritionist_id")
    .notNull()
    .references(() => usersTable.id),
  weekNumber: integer("week_number").notNull(),
  dailyCalories: integer("daily_calories"),
  proteinG: integer("protein_g"),
  carbsG: integer("carbs_g"),
  fatsG: integer("fats_g"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type MealPlan = typeof mealPlansTable.$inferSelect;
export const insertMealPlanSchema = createInsertSchema(mealPlansTable).omit({
  id: true,
  createdAt: true,
});

// ─── Meals ────────────────────────────────────────────────────────────────────
export const mealsTable = pgTable("meals", {
  id: serial("id").primaryKey(),
  planId: integer("plan_id")
    .notNull()
    .references(() => mealPlansTable.id, { onDelete: "cascade" }),
  dayOfWeek: text("day_of_week").notNull(),
  mealType: text("meal_type").notNull(), // breakfast | lunch | dinner | snack
  items: text("items").array().notNull().default([]),
  totalCalories: integer("total_calories"),
  notes: text("notes"),
});

export type Meal = typeof mealsTable.$inferSelect;
export const insertMealSchema = createInsertSchema(mealsTable).omit({ id: true });

// ─── Meal Logs ────────────────────────────────────────────────────────────────
export const mealLogsTable = pgTable("meal_logs", {
  id: serial("id").primaryKey(),
  engagementId: integer("engagement_id")
    .notNull()
    .references(() => engagementsTable.id, { onDelete: "cascade" }),
  clientId: text("client_id")
    .notNull()
    .references(() => usersTable.id),
  mealId: integer("meal_id")
    .notNull()
    .references(() => mealsTable.id),
  loggedAt: timestamp("logged_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  compliance: text("compliance").notNull(), // full | partial | skipped
  notes: text("notes"),
});

export type MealLog = typeof mealLogsTable.$inferSelect;
export const insertMealLogSchema = createInsertSchema(mealLogsTable).omit({
  id: true,
});

// ─── Progress Entries ─────────────────────────────────────────────────────────
export const progressEntriesTable = pgTable("progress_entries", {
  id: serial("id").primaryKey(),
  engagementId: integer("engagement_id")
    .notNull()
    .references(() => engagementsTable.id, { onDelete: "cascade" }),
  clientId: text("client_id")
    .notNull()
    .references(() => usersTable.id),
  loggedAt: timestamp("logged_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  weightKg: real("weight_kg"),
  waistCm: real("waist_cm"),
  chestCm: real("chest_cm"),
  hipsCm: real("hips_cm"),
  energyLevel: integer("energy_level"),
  sleepQuality: integer("sleep_quality"),
  mood: integer("mood"),
  notes: text("notes"),
  professionalNote: text("professional_note"),
});

export type ProgressEntry = typeof progressEntriesTable.$inferSelect;
export const insertProgressEntrySchema = createInsertSchema(
  progressEntriesTable
).omit({ id: true });

// ─── Check-ins ────────────────────────────────────────────────────────────────
export const checkInsTable = pgTable("check_ins", {
  id: serial("id").primaryKey(),
  engagementId: integer("engagement_id")
    .notNull()
    .references(() => engagementsTable.id, { onDelete: "cascade" }),
  clientId: text("client_id")
    .notNull()
    .references(() => usersTable.id),
  weekNumber: integer("week_number").notNull(),
  wentWell: text("went_well"),
  challenges: text("challenges"),
  painDiscomfort: text("pain_discomfort"),
  questions: text("questions"),
  professionalFeedback: text("professional_feedback"),
  submittedAt: timestamp("submitted_at", { withTimezone: true }).defaultNow(),
  feedbackAt: timestamp("feedback_at", { withTimezone: true }),
});

export type CheckIn = typeof checkInsTable.$inferSelect;
export const insertCheckInSchema = createInsertSchema(checkInsTable).omit({
  id: true,
});

// ─── Messages ─────────────────────────────────────────────────────────────────
export const messagesTable = pgTable("messages", {
  id: serial("id").primaryKey(),
  engagementId: integer("engagement_id")
    .notNull()
    .references(() => engagementsTable.id, { onDelete: "cascade" }),
  senderId: text("sender_id")
    .notNull()
    .references(() => usersTable.id),
  content: text("content").notNull(),
  attachmentUrl: text("attachment_url"),
  sentAt: timestamp("sent_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Message = typeof messagesTable.$inferSelect;
export const insertMessageSchema = createInsertSchema(messagesTable).omit({
  id: true,
});

// ─── Reviews ──────────────────────────────────────────────────────────────────
export const reviewsTable = pgTable("reviews", {
  id: serial("id").primaryKey(),
  engagementId: integer("engagement_id")
    .notNull()
    .references(() => engagementsTable.id),
  reviewerId: text("reviewer_id")
    .notNull()
    .references(() => usersTable.id),
  revieweeId: text("reviewee_id")
    .notNull()
    .references(() => usersTable.id),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  professionalReply: text("professional_reply"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type Review = typeof reviewsTable.$inferSelect;
export const insertReviewSchema = createInsertSchema(reviewsTable).omit({
  id: true,
  createdAt: true,
});

// ─── Notifications ────────────────────────────────────────────────────────────
export const notificationsTable = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  message: text("message").notNull(),
  link: text("link"),
  read: boolean("read").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type Notification = typeof notificationsTable.$inferSelect;
export const insertNotificationSchema = createInsertSchema(
  notificationsTable
).omit({ id: true, createdAt: true });
