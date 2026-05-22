# FitBid — Full Development Prompt
### A Competitive Fitness & Nutrition Bidding Platform

---

## 1. Project Overview

Build a full-stack web application called **FitBid** where clients post their fitness or health problems, and certified trainers and nutritionists compete by submitting bid proposals. The client selects the best combination, and a shared collaboration dashboard opens for the full engagement — tracking workouts, meal plans, and progress in one place.

Think: **Upwork × MyFitnessPal × Notion**, purpose-built for fitness.

---

## 2. Core Roles

### 2.1 Client
- A person with a fitness or nutrition goal (weight loss, muscle gain, injury rehab, sports performance, diet management for a condition like diabetes, etc.)
- Posts a public or semi-private request describing their problem, goals, budget, and timeline
- Reviews incoming bids and selects one trainer + one nutritionist (or just one, if they only need one)
- Accesses a shared dashboard once engagement begins
- Pays through the platform (escrow model)

### 2.2 Trainer
- A fitness professional (personal trainer, physical therapist, strength coach, etc.)
- Browses open client posts filtered by their specialty
- Submits a bid with a proposal, price, and estimated timeline
- If selected, accesses the client's shared dashboard to assign and track workouts
- Can communicate and coordinate with the nutritionist inside the shared dashboard

### 2.3 Nutritionist
- A certified nutrition professional (registered dietitian, sports nutritionist, clinical nutritionist, etc.)
- Same bidding flow as trainer
- If selected, assigns meal plans and dietary guidance inside the shared dashboard
- Can reference the trainer's assigned workout plan when building the diet

### 2.4 Admin
- Platform superuser
- Approves or rejects professional credential submissions
- Handles disputes and payment releases
- Can view all platform activity, flag suspicious accounts, and manage categories/tags

---

## 3. User Flows

### 3.1 Client Registration & Onboarding
1. Sign up with email/password or Google OAuth
2. Fill a structured onboarding form:
   - Age, gender, height, weight → auto-calculates BMI
   - Health conditions (diabetes, hypertension, past injuries, etc.)
   - Fitness goals (weight loss, bulk, endurance, rehab, nutrition-only)
   - Activity level (sedentary, lightly active, moderately active, very active)
   - Budget range (monthly or per-engagement)
   - Preferred engagement duration (1 month, 3 months, 6 months, custom)
3. Profile is created with a health summary card visible to professionals after bid acceptance

### 3.2 Posting a Request
1. Client clicks "Post a Request"
2. Fills in:
   - Problem title (e.g., "Need help losing belly fat before my wedding in 4 months")
   - Problem description (free text, with rich text support)
   - Tags: `weight-loss`, `nutrition`, `strength`, `rehab`, `diabetes-friendly`, etc.
   - Who they need: Trainer only / Nutritionist only / Both
   - Budget range (per month or one-time)
   - Timeline / deadline
   - Visibility: Public (any professional can bid) or Invite-only (client invites specific professionals)
3. Post is published and appears on the professional's feed

### 3.3 Professional Bidding
1. Trainer/Nutritionist browses the feed with filters (specialty, budget, timeline, tags)
2. Opens a client's post — sees:
   - Problem description
   - BMI and health summary (only after account is verified)
   - Budget range
   - Number of bids already received
3. Clicks "Submit Bid"
4. Writes:
   - Proposal (how they plan to help)
   - Proposed price (must fall within client's budget range; they can go below, not above)
   - Estimated results timeline
   - An optional free introductory offer (e.g., "First week free")
5. Bid is submitted and the client is notified

### 3.4 Client Selects Bids
1. Client opens their post and views all incoming bids
2. Each bid shows:
   - Professional's profile (photo, verified badge, specialty, star rating, review count, years of experience)
   - Their proposal text
   - Price and timeline
3. Client can:
   - Message a professional before accepting (quick Q&A)
   - Save bids to shortlist
   - Accept one Trainer bid + one Nutritionist bid (or just one if they only need one)
4. On acceptance:
   - Payment is charged and held in escrow
   - A shared dashboard is created and both professionals are granted access
   - Client and both professionals are notified

### 3.5 Shared Dashboard (Core Feature)
This is the heart of the platform. Once an engagement begins, a three-way workspace opens.

**Tabs inside the dashboard:**

#### Tab 1: Overview
- Client's health summary card (BMI, goals, conditions, current weight)
- Engagement timeline with start date, end date, and milestones
- Quick stats: workouts completed this week, meals logged, latest weight entry
- Activity feed (recent updates from trainer and nutritionist)

#### Tab 2: Workout Plan (managed by Trainer)
- Trainer assigns weekly workout programs
- Each program contains:
  - Day-by-day breakdown (e.g., Monday: Chest & Triceps, Tuesday: Rest, etc.)
  - Exercise cards with: name, sets, reps, rest time, video link, and notes
  - Difficulty level and estimated duration
- Client can log workout completions with optional notes (e.g., "couldn't finish set 3")
- Trainer can see completion logs and adjust the plan weekly
- Nutritionist can view the workout plan (read-only) to calibrate calorie and macro targets accordingly

#### Tab 3: Meal Plan (managed by Nutritionist)
- Nutritionist assigns weekly meal plans
- Each plan contains:
  - Daily calorie target (auto-suggested based on BMI + workout intensity from Tab 2)
  - Macros breakdown (protein, carbs, fats, fiber)
  - Meal-by-meal schedule (Breakfast, Lunch, Dinner, Snacks)
  - Each meal has: food items, portion sizes, preparation notes, and estimated calories
  - Allergy/condition flags (e.g., "low sodium — hypertension")
- Client can log what they actually ate vs. the plan (meal compliance tracker)
- Nutritionist can see compliance and adjust plans weekly
- Trainer can view calorie targets (read-only) and coordinate rest/active days with high-carb or recovery meals

#### Tab 4: Progress Tracker
- Client logs weekly:
  - Weight
  - Body measurements (waist, chest, hips, arms, etc.)
  - Optional progress photos (private, visible only to the client and their hired professionals)
  - Energy level (1–5 rating)
  - Sleep quality (1–5 rating)
  - Mood/motivation (1–5 rating)
- Auto-generates charts:
  - Weight over time (line chart)
  - BMI over time (line chart)
  - Workout completion rate (bar chart per week)
  - Meal compliance rate (bar chart per week)
- Professionals can annotate the progress chart with milestone notes (e.g., "Great progress — increasing workout intensity next week")

#### Tab 5: Messages
- Three-way group chat between Client, Trainer, and Nutritionist
- Supports text, image uploads, and file attachments (e.g., PDF meal plans, workout PDFs)
- Direct messages between just two parties also supported (e.g., Client ↔ Trainer without the nutritionist)
- Notifications on new messages (email + in-app)

#### Tab 6: Check-ins
- Weekly structured check-in form assigned by the trainer and/or nutritionist
- Client fills in: what went well, what was hard, any pain or discomfort, questions for the team
- Professional reviews and responds with a written feedback note
- Check-in history is logged and searchable

---

## 4. Verification & Trust System

### 4.1 Professional Verification
This is non-negotiable. Anyone can claim to be certified.

- During registration, professionals must upload:
  - Government-issued ID
  - Relevant certification documents (e.g., NASM, ACE, ISSA for trainers; RD, CNS, CISSN for nutritionists)
  - Optional: profile video introduction (max 60 seconds)
- Admin reviews submissions within 48 hours
- Professionals receive a Verified badge only after manual approval
- Unverified accounts can create a profile but cannot bid

### 4.2 Review System
- After engagement ends (or milestone reached), client leaves a rating (1–5 stars) and written review for each professional
- Professionals can respond to reviews (one reply per review)
- Reviews are public on the professional's profile
- Platform calculates: average rating, total completed engagements, response rate, and response time

### 4.3 Dispute Resolution
- Client or professional can raise a dispute from the dashboard
- Admin investigates by reviewing dashboard activity, messages, and check-ins
- If client has valid grounds (professional didn't deliver), funds are refunded from escrow
- If professional has valid grounds (client was unresponsive/non-compliant), partial or full payment is released to professional

---

## 5. Payment & Escrow Model

### 5.1 Flow
1. Client accepts a bid → charged immediately
2. Funds held in platform escrow
3. Milestone-based release: e.g., 50% released at 4 weeks, 50% at engagement end
   - OR: full release at end of engagement
4. Professional requests payment release → admin approves if no dispute raised within 72 hours
5. Platform takes a service fee (e.g., 10–15%) from the professional's payout

### 5.2 Supported Payment Methods
- Credit/debit card (Stripe)
- Optional: installment billing for longer engagements (e.g., monthly billing for a 3-month plan)

### 5.3 Refund Policy
- Full refund if professional fails to initiate contact within 48 hours of acceptance
- Partial refund if engagement ends early (prorated based on milestones completed)
- No refund if client abandons engagement without cause (after milestone 1)

---

## 6. Notifications System

Notify users via in-app notifications + email:

| Trigger | Who Gets Notified |
|---|---|
| New bid received | Client |
| Bid accepted | Trainer, Nutritionist |
| New message in chat | All relevant parties |
| Workout assigned | Client |
| Meal plan assigned | Client |
| Weekly check-in due | Client |
| Check-in submitted | Trainer, Nutritionist |
| Progress update logged | Trainer, Nutritionist |
| Payment released | Professional |
| Dispute raised | Admin, Other party |
| Engagement ending in 7 days | Client, Professionals |
| Review requested | Client (after engagement ends) |

---

## 7. Discovery & Search

### 7.1 Professional Directory
- Separate browseable directory of trainers and nutritionists
- Filters: specialty, location, price range, rating, availability, years of experience, language
- Clients can directly invite a professional to bid on their post from the directory

### 7.2 Client Post Feed (for professionals)
- Professionals see a feed of open client posts
- Filters: budget range, problem tags, engagement length, client location, who they need (trainer/nutritionist/both)
- Saved search alerts: professional sets criteria and gets notified when a matching post appears

---

## 8. Dashboard for Professionals (Separate from Client Dashboard)

Each professional has their own personal dashboard:

- Active engagements list (with quick status badges: on-track, needs attention, ending soon)
- Pending bids (submitted but not yet accepted)
- Earnings summary (total earned, pending in escrow, platform fees deducted)
- Calendar view showing all active clients' check-in deadlines and plan assignment dates
- Notification center
- Profile editor (bio, specialties, certifications, availability status: Open to Bids / Not Taking New Clients)

---

## 9. Database Schema (Core Tables)

```
users
  id, email, password_hash, role (client | trainer | nutritionist | admin),
  name, avatar_url, created_at, is_verified

client_profiles
  user_id, age, gender, height_cm, weight_kg, bmi (computed),
  health_conditions (jsonb), fitness_goals (array), activity_level,
  budget_min, budget_max

professional_profiles
  user_id, specialty, bio, years_experience, certifications (jsonb),
  verification_status (pending | approved | rejected), avg_rating,
  total_engagements, hourly_rate, availability_status

posts
  id, client_id, title, description, tags (array), needs_trainer,
  needs_nutritionist, budget_min, budget_max, duration_weeks,
  status (open | in_progress | completed | closed), created_at

bids
  id, post_id, professional_id, proposal_text, price,
  estimated_weeks, intro_offer, status (pending | accepted | rejected),
  created_at

engagements
  id, post_id, client_id, trainer_id, nutritionist_id,
  status (active | paused | completed | disputed), start_date, end_date,
  total_amount, escrow_status (held | released | refunded)

workout_plans
  id, engagement_id, trainer_id, week_number, created_at

workout_days
  id, plan_id, day_of_week, focus_area, duration_minutes, notes

exercises
  id, day_id, name, sets, reps, rest_seconds, video_url, notes, order

workout_logs
  id, engagement_id, client_id, day_id, completed_at, notes, rating

meal_plans
  id, engagement_id, nutritionist_id, week_number,
  daily_calories, protein_g, carbs_g, fats_g, created_at

meals
  id, plan_id, day_of_week, meal_type (breakfast | lunch | dinner | snack),
  items (jsonb), total_calories, notes

meal_logs
  id, engagement_id, client_id, meal_id, logged_at, compliance (full | partial | skipped), notes

progress_entries
  id, engagement_id, client_id, logged_at, weight_kg, measurements (jsonb),
  energy_level, sleep_quality, mood, notes, photo_urls (array)

check_ins
  id, engagement_id, client_id, week_number, responses (jsonb),
  submitted_at, professional_feedback (text), feedback_at

messages
  id, engagement_id, sender_id, recipient_ids (array or null for group),
  content, attachment_url, sent_at, read_by (array)

reviews
  id, engagement_id, reviewer_id, reviewee_id, rating, comment,
  professional_reply, created_at

payments
  id, engagement_id, amount, fee, status (held | released | refunded),
  stripe_payment_intent_id, created_at

notifications
  id, user_id, type, message, link, read, created_at
```

---

## 10. Recommended Tech Stack

### Frontend
- **React** 
- **TailwindCSS** for styling
- **Recharts** or **Chart.js** for progress charts
- **React Query (TanStack)** for data fetching and cache management
- **Socket.io client** for real-time messaging

### Backend
- **Node.js + Express** (or Next.js API routes if keeping it monorepo)
- **PostgreSQL** as primary database (Supabase is a great option — gives you DB + auth + storage + real-time out of the box)
- **Prisma** as ORM
- **Socket.io** for real-time chat
- **Redis** for session management and notification queuing(optional)
- **database based logic** for payments and escrow logic
- **Cloudinary or Supabase Storage** for image/file uploads

### Authentication
- **Supabase Auth** (supports email/password + Google OAuth)
- Role-based access control (RBAC) middleware protecting routes by user role

### Deployment
don't yet delply just give me access to the system

---

## 11. Pages & Routes

```
/ → Landing page (hero, how it works, testimonials, featured professionals)
/register → Role selection → Registration form
/login → Login
/dashboard → Role-aware dashboard (client/trainer/nutritionist/admin)
/posts → Browse all open client posts (for professionals)
/posts/new → Create a new post (for clients)
/posts/:id → Individual post detail with bid list
/bids/:id → Individual bid detail
/engagements/:id → Shared engagement dashboard (tabs: Overview, Workouts, Meals, Progress, Messages, Check-ins)
/profile/:id → Public professional profile
/profile/edit → Edit own profile
/directory → Browse professionals
/admin → Admin panel (verification queue, disputes, platform metrics)
/settings → Account settings, notification preferences, payment methods
```

---

## 12. Key UI/UX Details

- **BMI display**: Show the client's BMI prominently on their profile as a visual gauge, not just a number. Color-code it (underweight / normal / overweight / obese) with a note that BMI is a rough indicator only.
- **Bid comparison view**: When a client is comparing bids, show them side-by-side cards with price, rating, proposal summary, and a "View Full Profile" button.
- **Progress charts**: Auto-generate a "before/after" summary at engagement end for the client to optionally share (as a personal achievement — no public sharing without consent).
- **Availability badge**: Professionals have a visible "Open to Bids" / "Fully Booked" badge so clients don't waste time on unavailable professionals.
- **Mobile-first**: Most clients will check progress and log meals on their phones. The engagement dashboard tabs must be fully responsive with a bottom navigation bar on mobile.
- **Onboarding tooltips**: First-time users get a guided walkthrough of the dashboard (can use a library like Shepherd.js or Intro.js).
- **Empty states**: Every empty state (no bids yet, no workout assigned yet) should have a clear call-to-action and encouraging copy — never just a blank area.

---

## 13. Security Considerations

- All API routes require authentication (JWT or session cookie)
- Role-based middleware: clients can't access professional-only routes and vice versa
- Client health data (conditions, measurements, photos) is private — only accessible to the client and their active hired professionals within that engagement
- Progress photos are stored in private cloud buckets, not publicly accessible URLs
- All payment data goes through Stripe — no raw card data is ever stored on the platform
- Admin actions are audit-logged (who approved what, when)
- Rate limiting on bid submissions (a professional can't spam a single post)

---

## 14. Future Features (Phase 2 Ideas)

- **Group programs**: A trainer creates a standardized 8-week program and multiple clients can buy it (like a course) without the bidding flow
- **Live sessions**: Video call integration (Jitsi or Daily.co) so trainer/client can do live check-ins from inside the dashboard
- **Wearable integration**: Sync with Apple Health, Google Fit, or Fitbit to auto-populate workout logs and calorie burn data
- **AI-assisted bid ranking**: Automatically surface the most relevant bids to a client based on their profile and the professional's track record (use with care — never replace the client's choice)
- **Community forum**: A public forum where users can discuss fitness topics, with professionals able to answer questions to build credibility
- **Referral program**: Client refers a friend, both get a discount on their next engagement

---

## 15. What Makes This Different (Your Pitch)

Most fitness apps either connect you to one trainer OR give you a generic AI meal plan. FitBid does something fundamentally different:

1. **Bidding creates accountability.** Professionals are competing for your business — they have to bring their A-game to win the bid and keep it.
2. **Trainer + Nutritionist coordination in one place.** No more your trainer saying "eat more protein" and your dietitian saying "cut the carbs" — they literally see each other's plans on the same dashboard.
3. **The platform owns the engagement, not just the connection.** Most platforms stop at matchmaking. FitBid is where the actual work happens — plans, logs, progress, check-ins, payments, reviews.

---

*End of FitBid Development Prompt — Version 1.0*
