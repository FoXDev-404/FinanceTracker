# Finance Tracker Enhancement Implementation Plan


- [ ] Add `Tag` model (many-to-many with Transaction)
- [ ] Add `RecurringTransaction` model
- [ ] Add `SavingsGoal` model
- [ ] Add `Notification` model
- [ ] Add `Transaction.tags` ManyToMany field
- [ ] Create and run migrations

## Phase 2: Backend APIs
- [ ] Update Serializers for new models
- [ ] Dashboard Stats API (`GET /api/dashboard/`)
- [ ] Budget Alerts API
- [ ] Notifications API (CRUD + mark-as-read)
- [ ] Advanced Transaction Filters
- [ ] Export API (Excel/PDF)
- [ ] Recurring Transactions API
- [ ] Savings Goals API
- [ ] Tags API
- [ ] Improve AI Chatbot with data query tools

## Phase 3: Frontend Dependencies
- [ ] Install `recharts`, `date-fns`, `jspdf`, `xlsx`

## Phase 4: Frontend Pages & Components
- [ ] Enhanced Dashboard with charts
- [ ] Notifications Component in Navbar
- [ ] Advanced Filters on Transactions + Export
- [ ] Tags Management in Transactions
- [ ] Recurring Transactions Page
- [ ] Savings Goals Page
- [ ] Navbar Updates
- [ ] API Service Updates

## Phase 5: AI Chatbot Improvements
- [ ] Add quick-action buttons in chat
- [ ] Enhance backend ChatView

## Testing
- [ ] Test all new APIs
- [ ] Test frontend build
