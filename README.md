# CampusOS AI

CampusOS AI is an AI-powered campus opportunity discovery platform designed specifically for DAU students. It automatically ingests, structures, matches, and delivers personalized opportunities directly to students, ensuring they never miss valuable workshops, hackathons, lectures, or competitions.

---

## Problem Statement

DAU students miss valuable campus opportunities like workshops, hackathons, alumni meets, competitions, and lectures every semester. Announcements are buried on the university website or lost in group chats. By the time students find out, registration is already closed. There is no personalized system that understands what each student cares about and alerts them before deadlines.

---

## Tech Stack

The platform is designed around a modern, scalable architecture splitting concerns between a fast asynchronous Python API and a highly interactive typescript-based user interface.

*   **Frontend**: Built with **React**, **TypeScript**, and **Vite** for a swift development experience and high-speed execution, styled using **Tailwind CSS**.
*   **Backend**: Powered by **Python** and **FastAPI** using asynchronous capabilities, integrating **SQLAlchemy** (ORM) and **Alembic** (migrations) backed by **PostgreSQL**.
*   **Artificial Intelligence**: Leverages the **Anthropic Claude API** to parse, categorize, and extract structured details from unstructured emails and announcements, as well as scoring recommendations.
*   **Background Workers**: Employs **Celery** and **Redis** for executing background scraping, parsing, and scheduling.
*   **Notifications**: Powered by **Twilio API** for WhatsApp notifications and **SMTP** for transaction/alert emails.
*   **Web Scraping**: Utilizes **httpx** and **BeautifulSoup** for extracting raw data from university web portals.
*   **Authentication**: Implements **JWT tokens** with a domain-based restriction enforcing DAU email logins.

---

## Current Progress

### Backend Progress
*   **FastAPI Core Structure**: Complete base project setup with clean modular design.
*   **PostgreSQL Schema**: Successfully mapped all required SQLAlchemy models:
    *   `users`, `student profiles`
    *   `events`, `event matches`
    *   `notification logs`, `ingestion logs`, `Gmail tokens`
*   **Security & Authentication**: Implemented JWT authentication restricted exclusively to the DAU email domain.
*   **Student Profile endpoints**: Full CRUD operations for managing student preferences and details.
*   **AI Extraction Service**: Integrates Claude API to parse raw text announcements into structured JSON.
*   **AI Matching Engine**: Custom scoring algorithms that compare opportunities to student profiles.
*   **Web Scraping**: Functional scraper specifically for `daiict.ac.in` events page.
*   **Gmail OAuth Integration**: OAuth flow implemented to read incoming opportunity emails.
*   **Notification Dispatcher**: Operational services for email transmission and Twilio WhatsApp notifications.
*   **Celery Workers**: Background scheduler configuration completed for periodic ingestion.
*   **Admin & Analytics**: Dashboard query endpoints and unit test coverage.

### Frontend Progress
*   **React + TypeScript + Vite Setup**: Build-system and linter configurations ready.
*   **Landing Page UI**: Beautiful layout showcasing:
    *   *Hero, Features, How It Works, Testimonials, Product Roadmap, Admin Pitch*
*   **Interactive Demo Dashboard**: High-fidelity dashboard mock-up with recommendation cards.
*   **AI Assistant Chat Page**: Dynamic interface to converse with the campus opportunity assistant.
*   **State Management & Auth**: Fully integrated `AuthContext` connected to backend auth endpoints.
*   **AuthModal**: Clean modal flow supporting both registration and login.
*   **Design System & Components**: Reusable, customizable UI components including:
    *   `GlassCard`, `GradientButton`, `DeadlineBadge`
*   **Routing Layout**: Integrated React Router with endpoints for `Home`, `Demo`, `Assistant`, and `Universities` pages.

---

## Planned Features

- **OTP Email Verification**: Implementation of secure OTP verification post-hackathon.
- **Automated Scraping Scheduler**: Set scrapers to run automatically every 3 hours.
- **Live Gmail Stream**: Live inbox processing of incoming DAU event emails.
- **Personalized Recommendations Feed**: Full integration of the matching engine into the user's dashboard feed.
- **Proactive Alerts**: Direct real-time alerts before registration deadlines hit via Email/WhatsApp.
- **Frontend Student Profile Setup**: Guided onboarding page for students to set up their profiles.
- **Advanced Events Search**: Comprehensive browsing and multi-filter interface for events.
- **Admin Dashboard**: Full portal UI for managing event creation, ingestion statistics, and analytics.
- **Mobile Responsive Polish**: Optimized layout scaling for all screen sizes.

---

## Setup Instructions

### Backend Setup

1. **Clone the repository** and navigate to the backend directory:
   ```bash
   cd backend
   ```

2. **Create a Python virtual environment and activate it**:
   On Windows:
   ```powershell
   python -m venv venv
   .\venv\Scripts\Activate.ps1
   ```
   On macOS/Linux:
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   ```

3. **Install the dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up your environment variables**:
   Copy the example template and fill in the corresponding values:
   ```bash
   cp .env.example .env
   ```
   Ensure the following key variables are configured inside your `.env`:
   *   `DATABASE_URL` (your PostgreSQL connection string)
   *   `JWT_SECRET_KEY` (secret key for JWT verification)
   *   `FERNET_KEY` (encryption key for credentials storage)
   *   `ANTHROPIC_API_KEY` (your Anthropic Claude developer key)
   *   `ALLOWED_EMAIL_DOMAIN` (restricted login domain, e.g., `@dau.ac.in`)

5. **Run database migrations**:
   ```bash
   alembic upgrade head
   ```

6. **Start the FastAPI server**:
   ```bash
   uvicorn app.main:app --reload
   ```

### Frontend Setup

1. **Navigate to the frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install frontend dependencies**:
   ```bash
   npm install
   ```

3. **Start the local development server**:
   ```bash
   npm run dev
   ```

---

## Repository Structure

```
CampusOS-AI/
├── assets/                 # Empty directory for media and branding assets
├── backend/                # FastAPI backend application
│   ├── alembic/            # Alembic migration files
│   ├── app/                # Main Python package
│   ├── .env.example        # Reference configurations file
│   ├── requirements.txt    # Backend dependencies list
│   └── ...
├── docs/                   # Empty directory for project documentation
├── frontend/               # React frontend application
│   ├── public/             # Static public assets
│   ├── src/                # Frontend application code
│   │   ├── components/     # Reusable UI elements
│   │   ├── contexts/       # Global React Contexts
│   │   ├── pages/          # Navigation views & layouts
│   │   └── ...
│   ├── eslint.config.js    # ESLint configurations
│   ├── package.json        # Frontend configuration & dependencies
│   ├── tsconfig.json       # TypeScript base settings
│   └── vite.config.ts      # Vite configuration file
├── .gitignore              # Global git ignore configuration
└── README.md               # Project documentation guide
```
