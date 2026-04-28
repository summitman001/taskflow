# 🚀 TaskFlow - AI-Powered Collaborative Kanban Board

> A modern, full-stack project management tool with real-time collaboration, AI-powered task breakdown, and enterprise-grade architecture.

**🔗 Live Demo:** [https://taskflow-37yp2m87o-summitman001s-projects.vercel.app](https://taskflow-37yp2m87o-summitman001s-projects.vercel.app)  
**📦 Repository:** [https://github.com/summitman001/taskflow](https://github.com/summitman001/taskflow)

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Getting Started](#-getting-started)
- [Deployment](#-deployment)
- [What I Learned](#-what-i-learned)
- [Future Enhancements](#-future-enhancements)

---

## 🎯 Overview

TaskFlow is a sophisticated Kanban board application built with cutting-edge web technologies. It combines the simplicity of traditional project management tools with modern features like **AI-powered task breakdown**, **multi-user collaboration**, and **role-based access control**.

### Why TaskFlow?

- **🤝 Collaborative by Design:** Share boards with team members, assign roles (Owner/Editor/Viewer), and work together seamlessly
- **🤖 AI-Enhanced Productivity:** Leverage OpenAI GPT-4 to break down complex tasks into actionable subtasks
- **⚡ Blazing Fast:** Next.js 16 with Turbopack, optimistic UI updates, and intelligent caching
- **🎨 Polished UX:** Smooth drag-and-drop, keyboard shortcuts, real-time feedback, and responsive design
- **🔒 Enterprise-Grade Security:** Clerk authentication, row-level security, and role-based permissions

---

## ✨ Key Features

### 🎯 Core Kanban Functionality

#### Board Management
- **Create unlimited boards** with automatic 3-column initialization (To Do, In Progress, Done)
- **Board overview dashboard** with quick stats (column count, card count, member count)
- **Smart board filtering** - automatically shows boards you own or have been invited to
- **Sample board generator** for quick onboarding

#### Column Operations
- **Dynamic column creation** with custom titles
- **Drag-and-drop reordering** between columns with visual feedback
- **Fractional indexing** for position management (no reindexing overhead)
- **Inline editing** for column titles
- **Delete with confirmation** (cascades to cards safely)

#### Card Management
- **Rich card details:**
  - Title and description (markdown support planned)
  - Priority levels (Low, Medium, High) with color coding
  - Due dates with calendar picker
  - Creation/modification timestamps
- **Drag-and-drop:** Move cards within columns or across columns
- **Optimistic updates:** Instant UI feedback before server confirmation
- **Card activity log:** Automatic tracking of moves and edits with user attribution

### 🤝 Collaboration Features ⭐ NEW

#### Multi-User Board Sharing
- **Email-based invitations:** Add collaborators by email (must be registered users)
- **Real-time member list:** See all board members with avatars and roles
- **Member management UI:** Dedicated share dialog with search and filtering

#### Role-Based Access Control
Three distinct permission levels:

| Role | Permissions |
|------|-------------|
| **Owner** | Full control: edit, delete board, manage members, change roles |
| **Editor** | Create/edit/delete cards & columns, invite new members |
| **Viewer** | Read-only access, can view all content but cannot modify |

#### Access Control Implementation
- **Database-level security:** `BoardMember` join table with role enum
- **API middleware:** `requireBoardAccess()` function validates permissions on every request
- **Automatic owner provisioning:** Board creators are automatically added as OWNER members
- **Graceful permission errors:** Clear feedback when users lack required permissions

### 🤖 AI-Powered Features

#### Intelligent Subtask Generation
- **Context-aware AI:** Analyzes card title and description to generate 3-5 actionable subtasks
- **GPT-4 Mini integration:** Fast, cost-effective task breakdown
- **Smart formatting:** 
  - Each subtask is action-oriented (starts with a verb)
  - Sized for 30min - 4hr work units
  - Includes clear descriptions of what and why
- **Multilingual support:** Automatically matches input language (English/Turkish)
- **Graceful fallback:** Mock subtasks if API key is missing (no breaking errors)

### ⚡ Performance & UX

#### Advanced State Management
- **TanStack Query (React Query):**
  - Automatic background refetching
  - Optimistic updates for instant feedback
  - Smart cache invalidation
  - Request deduplication
- **Local state optimization:** Minimal re-renders with focused query scopes

#### Drag & Drop Excellence
- **dnd-kit library:** Accessible, performant, touch-friendly
- **Visual feedback:**
  - Drag overlays with card preview
  - Drop zone highlighting
  - Smooth animations (60fps)
- **Collision detection:** Smart algorithms for precise drop targeting
- **Keyboard navigation:** Full keyboard support for accessibility

#### Fractional Indexing
- **Position management:** Cards/columns use string-based lexicographic ordering
- **Zero reindexing:** Insert between any two items without touching other records
- **Conflict-free:** Multiple users can reorder simultaneously
- **Library:** `fractional-indexing` npm package

### 🎨 User Interface

#### Design System
- **Tailwind CSS:** Utility-first styling with custom design tokens
- **Consistent components:** Reusable button, dialog, input, and card components
- **Color palette:** Professional blue/purple gradients with semantic color usage
- **Typography:** Clear hierarchy with Inter font family

#### Responsive Design
- **Mobile-first approach:** Fully functional on phones (320px+)
- **Tablet optimization:** Adaptive layouts for medium screens
- **Desktop excellence:** Multi-column layouts with sidebar navigation

#### Interactive Elements
- **Toast notifications:** Real-time feedback with Sonner library
- **Loading states:** Skeleton screens and spinners
- **Error boundaries:** Graceful error handling with retry options
- **Keyboard shortcuts:** 
  - `N` - New card
  - `Esc` - Close dialogs
  - Arrow keys - Navigate cards

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose | Why Chosen |
|------------|---------|------------|
| **Next.js 16.2.4** | React framework | App Router, Server Components, Turbopack performance |
| **TypeScript** | Type safety | Catch bugs at compile time, better DX |
| **Tailwind CSS** | Styling | Rapid development, consistent design system |
| **TanStack Query** | Data fetching | Caching, optimistic updates, background sync |
| **dnd-kit** | Drag & drop | Accessibility, performance, customizability |
| **Sonner** | Notifications | Beautiful toasts with minimal setup |
| **Lucide React** | Icons | Modern, consistent iconography |

### Backend
| Technology | Purpose | Why Chosen |
|------------|---------|------------|
| **Next.js API Routes** | REST API | Co-located with frontend, type-safe |
| **Prisma ORM** | Database access | Type-safe queries, migrations, great DX |
| **PostgreSQL** | Database | ACID compliance, relational data, scalability |
| **Neon** | Database hosting | Serverless Postgres, generous free tier |
| **Clerk** | Authentication | Secure, feature-rich, easy integration |
| **OpenAI API** | AI features | GPT-4 Mini for task generation |

### DevOps & Tools
| Technology | Purpose |
|------------|---------|
| **Vercel** | Deployment & hosting |
| **Git/GitHub** | Version control |
| **ESLint** | Code quality |
| **Prettier** | Code formatting |

---

## 🏗️ Architecture

### System Design
```text
┌─────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                         │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │  Next.js UI │  │ TanStack     │  │  Clerk Auth      │   │
│  │  Components │←→│  Query       │←→│  Middleware      │   │
│  └─────────────┘  └──────────────┘  └──────────────────┘   │
└────────────────────────────┬────────────────────────────────┘
│ HTTPS
┌────────────────────────────┴────────────────────────────────┐
│                       API LAYER (Next.js)                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │   Boards     │  │   Cards      │  │   Collaboration  │  │
│  │   API        │  │   API        │  │   API            │  │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────────┘  │
│         │                  │                  │               │
│         └──────────────────┴──────────────────┘              │
│                            │                                  │
│                   ┌────────┴─────────┐                       │
│                   │  Auth Middleware │                       │
│                   │  requireBoardAccess()                    │
│                   └────────┬─────────┘                       │
└────────────────────────────┴────────────────────────────────┘
│
┌────────────────────────────┴────────────────────────────────┐
│                      DATA LAYER (Prisma)                     │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              PostgreSQL (Neon)                       │   │
│  │  ┌────────┐  ┌────────┐  ┌────────────┐  ┌───────┐ │   │
│  │  │  User  │  │ Board  │  │ BoardMember│  │Column │ │   │
│  │  └────────┘  └────────┘  └────────────┘  └───────┘ │   │
│  │  ┌────────┐  ┌──────────────┐                       │   │
│  │  │  Card  │  │ CardActivity │                       │   │
│  │  └────────┘  └──────────────┘                       │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘

### Database Schema (ERD)

```prisma
┌─────────────────┐
│      User       │
├─────────────────┤
│ id (PK)         │◄─────┐
│ email (unique)  │      │
│ name            │      │
│ createdAt       │      │
└─────────────────┘      │
         △               │
         │               │
         │ ownerId       │ userId
         │               │
┌─────────────────┐      │       ┌──────────────────┐
│     Board       │      │       │   BoardMember    │
├─────────────────┤      │       ├──────────────────┤
│ id (PK)         │◄─────┼───────┤ id (PK)          │
│ title           │      │       │ userId (FK)      │───┐
│ ownerId (FK)    │──────┘       │ boardId (FK)     │◄──┘
│ createdAt       │              │ role (ENUM)      │
│ updatedAt       │              │ joinedAt         │
└─────────────────┘              └──────────────────┘
         │                       UNIQUE(userId, boardId)
         │ boardId
         ▼
┌─────────────────┐
│     Column      │
├─────────────────┤
│ id (PK)         │
│ title           │
│ position        │◄── Fractional indexing (string)
│ boardId (FK)    │
│ createdAt       │
└─────────────────┘
         │ columnId
         ▼
┌─────────────────┐              ┌──────────────────┐
│      Card       │              │  CardActivity    │
├─────────────────┤              ├──────────────────┤
│ id (PK)         │◄─────────────┤ id (PK)          │
│ title           │   cardId     │ cardId (FK)      │
│ description     │              │ userId (FK)      │
│ priority        │              │ type             │
│ dueDate         │              │ metadata (JSON)  │
│ position        │◄── Fractional│ createdAt        │
│ columnId (FK)   │              └──────────────────┘
│ createdAt       │              (tracks moves/edits)
└─────────────────┘

Role ENUM: OWNER | EDITOR | VIEWER
```

### API Structure
```text
/api
├── /boards
│   ├── GET     - List user's accessible boards (owned + member)
│   ├── POST    - Create board (auto-adds creator as OWNER member)
│   ├── /[boardId]
│   │   ├── GET     - Get board with columns, cards, members
│   │   ├── PATCH   - Update board title (EDITOR+)
│   │   ├── DELETE  - Delete board (OWNER only)
│   │   └── /members
│   │       ├── POST    - Invite user by email (EDITOR+)
│   │       └── /[memberId]
│   │           ├── PATCH  - Update member role (OWNER only)
│   │           └── DELETE - Remove member (OWNER or self)
│   └── /sample
│       └── POST    - Create sample board with demo data
│
├── /columns
│   ├── POST    - Create column (EDITOR+)
│   └── /[columnId]
│       ├── PATCH  - Update column (EDITOR+)
│       └── DELETE - Delete column (EDITOR+)
│
├── /cards
│   ├── POST    - Create card (EDITOR+)
│   └── /[cardId]
│       ├── PATCH  - Update/move card (EDITOR+)
│       ├── DELETE - Delete card (EDITOR+)
│       └── /activity
│           └── GET - Get card activity log (VIEWER+)
│
└── /ai
└── /breakdown
└── POST - Generate subtasks with AI (EDITOR+)

### Authentication & Authorization Flow

```typescript
// 1. Clerk Middleware (every request)
middleware.ts → clerkMiddleware() → protects /boards/* routes

// 2. API Route Authorization
async function requireBoardAccess(
    boardId: string,
    minimumRole: Role = "VIEWER"
): Promise<Role> {
    const user = await getOrCreateUser();
    
    // Check ownership
    const board = await prisma.board.findUnique({
        where: { id: boardId },
        select: { ownerId: true }
    });
    
    if (board.ownerId === user.id) {
        // Auto-provision: add owner as OWNER member if not exists
        await prisma.boardMember.upsert({
            where: { userId_boardId: { userId: user.id, boardId } },
            create: { userId: user.id, boardId, role: "OWNER" },
            update: {}
        });
        return "OWNER";
    }
    
    // Check membership
    const member = await prisma.boardMember.findUnique({
        where: { userId_boardId: { userId: user.id, boardId } }
    });
    
    if (!member) throw new Error("Board access denied");
    
    // Validate role hierarchy
    const hierarchy = { OWNER: 3, EDITOR: 2, VIEWER: 1 };
    if (hierarchy[member.role] < hierarchy[minimumRole]) {
        throw new Error("Insufficient permissions");
    }
    
    return member.role;
}
```

### State Management Pattern

```typescript
// React Query setup
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60,        // 1 minute
            refetchOnWindowFocus: true,   // Sync on tab switch
            retry: 1
        }
    }
});

// Example: Optimistic card move
const moveCard = useMutation({
    mutationFn: (data) => apiFetch(`/api/cards/${cardId}`, {
        method: 'PATCH',
        body: JSON.stringify(data)
    }),
    
    // Immediate UI update
    onMutate: async (newData) => {
        await queryClient.cancelQueries(['board', boardId]);
        const previous = queryClient.getQueryData(['board', boardId]);
        
        queryClient.setQueryData(['board', boardId], (old) => {
            // Optimistically update card position
            return updateCardInBoard(old, newData);
        });
        
        return { previous };
    },
    
    // Rollback on error
    onError: (err, newData, context) => {
        queryClient.setQueryData(['board', boardId], context.previous);
        toast.error('Failed to move card');
    },
    
    // Sync with server
    onSuccess: () => {
        queryClient.invalidateQueries(['board', boardId]);
    }
});
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js:** 18.x or higher
- **pnpm/npm/yarn:** Latest version
- **PostgreSQL:** Database (or use Neon free tier)
- **Clerk Account:** For authentication
- **OpenAI API Key:** (Optional) For AI features

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/summitman001/taskflow.git
cd taskflow

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
```

### Environment Variables

Create `.env.local` file:

```env
# Database
DATABASE_URL="postgresql://user:password@host:5432/database?sslmode=require"

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL="/boards"
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL="/boards"

# OpenAI (Optional - for AI features)
OPENAI_API_KEY="sk-..."
```

### Database Setup

```bash
# 1. Push schema to database
npx prisma db push

# 2. Generate Prisma Client
npx prisma generate

# 3. (Optional) Open Prisma Studio to view data
npx prisma studio
```

### Development

```bash
# Start development server
npm run dev

# Open browser
open http://localhost:3000
```

### Production Build

```bash
# Build application
npm run build

# Start production server
npm start
```

---

## 🌐 Deployment

### Vercel Deployment (Current)

**Live URL:** [https://taskflow-37yp2m87o-summitman001s-projects.vercel.app](https://taskflow-37yp2m87o-summitman001s-projects.vercel.app)

#### Setup Steps:

1. **Connect Repository:**
   - Import project from GitHub on Vercel dashboard
   - Auto-detects Next.js framework

2. **Configure Environment Variables:**
   - Add all variables from `.env.local` in Vercel dashboard
   - Ensure `DATABASE_URL` points to production database

3. **Deploy:**
   - Vercel automatically deploys on `git push`
   - Preview deployments for pull requests
   - Production deployment on main branch

#### Vercel Configuration:

```json
{
  "buildCommand": "npx prisma generate && next build",
  "framework": "nextjs",
  "installCommand": "npm install"
}
```

### Alternative Deployment Options

#### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build
CMD ["npm", "start"]
```

#### Railway/Render
- Set build command: `npx prisma generate && npm run build`
- Set start command: `npm start`
- Configure environment variables in dashboard

---

## 🎓 What I Learned

### Technical Challenges Solved

#### 1. **Collaborative Board Architecture**
**Challenge:** Implementing multi-user access without breaking existing owner-based system.

**Solution:**
- Created `BoardMember` join table with role enum
- Implemented `requireBoardAccess()` middleware for granular permissions
- Auto-provisioning pattern: owners are automatically added as OWNER members
- Database-level unique constraint prevents duplicate memberships

**Key Learning:** Database design decisions have cascading effects. The join table pattern with role-based access control proved scalable and maintainable.

#### 2. **Optimistic UI Updates with Rollback**
**Challenge:** Providing instant feedback for drag-and-drop while handling server errors gracefully.

**Solution:**
- TanStack Query's `onMutate` for immediate UI updates
- Store previous state in mutation context
- Rollback on `onError` using stored state
- Background refetch on `onSuccess` for server sync

**Key Learning:** Optimistic updates significantly improve perceived performance, but require careful error handling to maintain data integrity.

#### 3. **Fractional Indexing for Ordering**
**Challenge:** Traditional integer-based ordering requires reindexing all items on insert.

**Solution:**
- String-based lexicographic ordering with `fractional-indexing` library
- `generateKeyBetween(a, b)` generates key between any two positions
- No database updates needed for existing items

**Example:**
```typescript
// Insert between "a" and "c"
const newPosition = generateKeyBetween("a", "c"); // → "b"

// Insert at start
const firstPosition = generateKeyBetween(null, "a"); // → "a0"

// Insert at end
const lastPosition = generateKeyBetween("z", null); // → "z0"
```

**Key Learning:** Sometimes adopting a different data model (strings vs integers) eliminates entire classes of problems.

#### 4. **Type-Safe API Routes with Zod-like Validation**
**Challenge:** Ensuring request body validation without sacrificing TypeScript benefits.

**Solution:**
- Custom validation helpers (`validateTitle`, `validatePosition`)
- Type guards for runtime type checking
- Consistent error response format via `apiError` helper

**Key Learning:** Small utility functions compound into robust, maintainable code.

#### 5. **Access Control Propagation**
**Challenge:** Every API endpoint (cards, columns, activities) needs board access checks.

**Solution:**
- Centralized `requireBoardAccess()` function
- Fetch card → column → boardId chain
- Single source of truth for permission logic

**Key Learning:** Middleware patterns prevent permission bugs and reduce code duplication.

### Architectural Decisions

#### Why Next.js App Router?
- **Server Components:** Reduced client bundle, faster initial load
- **Parallel Data Fetching:** Multiple Prisma queries in parallel
- **API Routes Co-location:** Frontend and backend in one codebase

#### Why Prisma over Raw SQL?
- **Type Safety:** Auto-generated types match database schema
- **Migration Management:** Declarative schema with version control
- **Developer Experience:** IntelliSense for queries, Prisma Studio for debugging

#### Why TanStack Query?
- **Cache Management:** Automatic stale-while-revalidate pattern
- **Optimistic Updates:** Built-in support for rollback
- **DevTools:** React Query DevTools for debugging

#### Why Clerk over NextAuth?
- **Pre-built UI:** Sign-in/sign-up components out of the box
- **User Management:** Admin dashboard for user operations
- **Security:** SOC 2 compliant, handles GDPR

---

## 🔮 Future Enhancements

### Planned Features

#### 1. **Real-Time Collaboration**
- **WebSocket Integration:** Socket.io or Pusher for live updates
- **Presence Indicators:** See who's viewing the board
- **Live Cursors:** See collaborators' mouse positions
- **Conflict Resolution:** Operational Transform (OT) or CRDT

#### 2. **Advanced Notifications**
- **In-app Notifications:** Bell icon with unread count
- **Email Digests:** Daily/weekly board activity summaries
- **@Mentions:** Tag users in card comments
- **Push Notifications:** Browser notifications for updates

#### 3. **Rich Text & Attachments**
- **Markdown Editor:** For card descriptions with formatting
- **File Uploads:** Attach images, PDFs, documents to cards
- **Image Preview:** Inline image rendering in cards
- **Cloud Storage:** S3/Cloudinary integration

#### 4. **Enhanced AI Features**
- **Smart Due Dates:** AI suggests realistic deadlines based on subtask complexity
- **Priority Prediction:** Automatically assign priority based on description keywords
- **Board Templates:** AI generates board structure from project description
- **Natural Language Commands:** "Create a card for user login feature"

#### 5. **Analytics & Reporting**
- **Velocity Tracking:** Cards completed per sprint/week
- **Burndown Charts:** Progress visualization
- **Time Tracking:** Estimate vs actual time per card
- **Export Reports:** PDF/CSV board snapshots

#### 6. **Customization**
- **Board Backgrounds:** Custom colors, gradients, images
- **Custom Fields:** Add custom metadata to cards (e.g., "Story Points")
- **Workflow Automation:** Trigger actions on card status changes
- **Themes:** Dark mode, custom color schemes

#### 7. **Mobile App**
- **React Native:** iOS/Android native apps
- **Offline Support:** Local-first architecture with sync
- **Push Notifications:** Mobile notification support

### Performance Optimizations

- **Server-Side Pagination:** Load cards/columns on-demand
- **Virtual Scrolling:** For boards with 100+ cards
- **Image CDN:** Optimize user avatars with Next.js Image
- **Edge Functions:** Deploy API routes to Vercel Edge for lower latency
- **Database Connection Pooling:** Prisma Accelerate for better scaling

### Scalability Considerations

- **Database Indexing:** Compound indexes on frequently queried columns
- **Redis Caching:** Cache board data for read-heavy operations
- **Rate Limiting:** Prevent API abuse with rate limiters
- **Horizontal Scaling:** Stateless API design enables load balancing

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

## 🙏 Acknowledgments

- **Next.js Team** - Amazing framework and documentation
- **Prisma Team** - Best-in-class ORM
- **Clerk** - Seamless authentication
- **Vercel** - Stellar deployment platform
- **OpenAI** - Powerful AI capabilities

---

## 📧 Contact

**Developer:** Enes Altunbaş  
**GitHub:** [@summitman001](https://github.com/summitman001)  
**Email:** [enesaltunbas12@gmail.com]  
**LinkedIn:** [https://www.linkedin.com/in/enesaltunbas34/]  

---