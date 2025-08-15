# MechTrackPulse - Current Data Model Export

## Database Schema Overview
**Current Stack:** React + TypeScript + Supabase (PostgreSQL)

### Core Tables Structure

#### 1. **profiles** (User Management)
```sql
TABLE: profiles
- id: uuid (Primary Key, references auth.users)
- name: text (NOT NULL)
- email: text (NOT NULL) 
- role: text (NOT NULL) - 'operator' | 'supervisor' | 'owner'
- phone: text
- profile_image: text
- status: text (default: 'offline')
- on_holiday: boolean (default: false)
- first_login_completed: boolean (default: false)

-- Company Information
- company_id: uuid
- company_name: text
- company_address: text
- gst_number: text
- registration_number: text

-- Personal Details
- address: text
- height: text
- weight: text
- emergency_contact: text
- qualifications: text
- certifications: text
- notes: text

-- Timestamps
- created_at: timestamp with time zone (default: now())
- updated_at: timestamp with time zone (default: now())
```

**RLS Policies:**
- Users can view all profiles
- Users can update their own profile only

#### 2. **tasks** (Task Management)
```sql
TABLE: tasks
- id: uuid (Primary Key)
- title: text (NOT NULL)
- description: text
- status: text (NOT NULL)
- priority: text (NOT NULL)
- assigned_to: uuid (references profiles.id)
- client_id: uuid (references clients.id)
- due_date: timestamp with time zone
- estimated_hours: numeric
- completed_hours: numeric (default: 0)
- created_at: timestamp with time zone (default: now())
- updated_at: timestamp with time zone (default: now())
```

**RLS Policies:**
- Users can view all tasks
- Operators can update assigned tasks
- Owners/supervisors can manage all tasks

#### 3. **work_updates** (Progress Tracking)
```sql
TABLE: work_updates
- id: uuid (Primary Key)
- task_id: uuid (references tasks.id)
- operator_id: uuid (references profiles.id)
- image_url: text (NOT NULL)
- comment: text
- status: text (default: 'pending')
- submitted_at: timestamp with time zone (default: now())
- reviewed_by: uuid (references profiles.id)
- reviewed_at: timestamp with time zone
- supervisor_feedback: text
- supervisor_audio: text
- supervisor_image: text
```

**RLS Policies:**
- Operators can create their own work updates
- Users can view updates they're involved with
- Supervisors can update work updates

#### 4. **schedule** (Scheduling System)
```sql
TABLE: schedule
- id: uuid (Primary Key)
- title: text (NOT NULL)
- description: text
- user_id: uuid (references profiles.id)
- task_id: uuid (references tasks.id)
- start_time: timestamp with time zone (NOT NULL)
- end_time: timestamp with time zone (NOT NULL)
- created_at: timestamp with time zone (default: now())
- updated_at: timestamp with time zone (default: now())
```

**RLS Policies:**
- Users can view all schedules
- Users can manage their own schedule + supervisors/owners can manage all

#### 5. **clients** (Client Management)
```sql
TABLE: clients
- id: uuid (Primary Key)
- name: text (NOT NULL)
- email: text (NOT NULL)
- phone: text
- address: text
- created_at: timestamp with time zone (default: now())
- updated_at: timestamp with time zone (default: now())
```

**RLS Policies:**
- Users can view clients
- Owners/supervisors can manage clients

#### 6. **messages** (Communication)
```sql
TABLE: messages
- id: uuid (Primary Key)
- sender_id: uuid (references profiles.id)
- content: text (NOT NULL)
- created_at: timestamp with time zone (default: now())
```

**RLS Policies:**
- Users can send messages
- Users can view all messages

### Storage Buckets
- **work_updates** (Public) - Work progress images
- **workupdates** (Private) - Additional work files

### Authentication & Roles
- **Three Role System:** operator, supervisor, owner
- **Supabase Auth:** JWT-based authentication
- **Profile Creation:** Auto-trigger on user signup

### Current Features Implemented
1. **User Management:** Role-based access control
2. **Task Assignment:** Manual task creation and assignment
3. **Progress Tracking:** Image-based work updates with supervisor feedback
4. **AI Insights:** Basic task assignment recommendations
5. **Real-time Chat:** Communication system
6. **Scheduling:** Time-based task planning
7. **Client Management:** Basic CRM functionality
8. **Dashboard Analytics:** Performance insights

### Data Relationships
```
auth.users (1) -> (1) profiles
profiles (1) -> (M) tasks (assigned_to)
profiles (1) -> (M) work_updates (operator_id, reviewed_by)
profiles (1) -> (M) schedule (user_id)
profiles (1) -> (M) messages (sender_id)
tasks (1) -> (M) work_updates (task_id)
tasks (1) -> (M) schedule (task_id)
clients (1) -> (M) tasks (client_id)
```

### Current AI Features
- **Task Prediction:** Basic operator recommendation algorithm
- **Performance Insights:** Simulated AI-generated insights
- **Smart Alerts:** Rule-based notification system

### Key Business Logic
1. **Task Status Flow:** pending → in_progress → completed
2. **Work Update Approval:** operator submits → supervisor reviews → approved/rejected
3. **Role Permissions:** Hierarchical access (owner > supervisor > operator)
4. **Real-time Updates:** Live task status and message updates