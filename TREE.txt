└── annotator-platform
    ├── apps
    │   ├── backend
    │   │   ├── src
    │   │   │   ├── common
    │   │   │   │   ├── decorators
    │   │   │   │   │   ├── current-user.decorator.ts
    │   │   │   │   │   ├── permissions.decorator.ts
    │   │   │   │   │   ├── public.decorator.ts
    │   │   │   │   │   └── roles.decorator.ts
    │   │   │   │   ├── filters
    │   │   │   │   │   └── http-exception.filter.ts
    │   │   │   │   ├── guards
    │   │   │   │   │   ├── permissions.guard.ts
    │   │   │   │   │   └── roles.guard.ts
    │   │   │   │   ├── interceptors
    │   │   │   │   │   ├── logging.interceptor.ts
    │   │   │   │   │   └── transform.interceptor.ts
    │   │   │   │   ├── middleware
    │   │   │   │   │   └── request-id.middleware.ts
    │   │   │   │   ├── pipes
    │   │   │   │   │   └── validation.pipe.ts
    │   │   │   │   └── utils
    │   │   │   │       ├── jwt.utils.ts
    │   │   │   │       └── password.utils.ts
    │   │   │   ├── config
    │   │   │   │   ├── app.config.ts
    │   │   │   │   ├── database.config.ts
    │   │   │   │   ├── jwt.config.ts
    │   │   │   │   └── supabase.config.ts
    │   │   │   ├── database
    │   │   │   │   ├── entities
    │   │   │   │   ├── migrations
    │   │   │   │   ├── seeds
    │   │   │   │   │   ├── admin.seed.ts
    │   │   │   │   │   ├── roles.seed.ts
    │   │   │   │   │   ├── run-seeds.ts
    │   │   │   │   │   └── test-data.seed.ts
    │   │   │   │   └── data-source.ts
    │   │   │   ├── modules
    │   │   │   │   ├── accounts
    │   │   │   │   │   ├── dto
    │   │   │   │   │   ├── entities
    │   │   │   │   │   ├── accounts.controller.spec.ts
    │   │   │   │   │   ├── accounts.controller.ts
    │   │   │   │   │   ├── accounts.module.ts
    │   │   │   │   │   ├── accounts.service.spec.ts
    │   │   │   │   │   └── accounts.service.ts
    │   │   │   │   ├── admins
    │   │   │   │   │   ├── dto
    │   │   │   │   │   ├── entities
    │   │   │   │   │   ├── admins.controller.spec.ts
    │   │   │   │   │   ├── admins.controller.ts
    │   │   │   │   │   ├── admins.module.ts
    │   │   │   │   │   ├── admins.service.spec.ts
    │   │   │   │   │   └── admins.service.ts
    │   │   │   │   ├── audit-logs
    │   │   │   │   │   ├── dto
    │   │   │   │   │   ├── entities
    │   │   │   │   │   ├── audit-logs.controller.spec.ts
    │   │   │   │   │   ├── audit-logs.controller.ts
    │   │   │   │   │   ├── audit-logs.module.ts
    │   │   │   │   │   ├── audit-logs.service.spec.ts
    │   │   │   │   │   └── audit-logs.service.ts
    │   │   │   │   ├── auth
    │   │   │   │   │   ├── dto
    │   │   │   │   │   ├── entities
    │   │   │   │   │   ├── guards
    │   │   │   │   │   ├── interfaces
    │   │   │   │   │   ├── strategies
    │   │   │   │   │   ├── auth.controller.spec.ts
    │   │   │   │   │   ├── auth.controller.ts
    │   │   │   │   │   ├── auth.module.ts
    │   │   │   │   │   ├── auth.service.spec.ts
    │   │   │   │   │   └── auth.service.ts
    │   │   │   │   ├── clients
    │   │   │   │   │   ├── dto
    │   │   │   │   │   ├── entities
    │   │   │   │   │   ├── clients.controller.spec.ts
    │   │   │   │   │   ├── clients.controller.ts
    │   │   │   │   │   ├── clients.module.ts
    │   │   │   │   │   ├── clients.service.spec.ts
    │   │   │   │   │   └── clients.service.ts
    │   │   │   │   ├── dashboard-analytics
    │   │   │   │   │   ├── dto
    │   │   │   │   │   ├── entities
    │   │   │   │   │   ├── dashboard-analytics.controller.spec.ts
    │   │   │   │   │   ├── dashboard-analytics.controller.ts
    │   │   │   │   │   ├── dashboard-analytics.module.ts
    │   │   │   │   │   ├── dashboard-analytics.service.spec.ts
    │   │   │   │   │   └── dashboard-analytics.service.ts
    │   │   │   │   ├── exports
    │   │   │   │   │   ├── dto
    │   │   │   │   │   ├── entities
    │   │   │   │   │   ├── exports.controller.spec.ts
    │   │   │   │   │   ├── exports.controller.ts
    │   │   │   │   │   ├── exports.module.ts
    │   │   │   │   │   ├── exports.service.spec.ts
    │   │   │   │   │   └── exports.service.ts
    │   │   │   │   ├── health
    │   │   │   │   │   ├── dto
    │   │   │   │   │   ├── entities
    │   │   │   │   │   ├── health.controller.spec.ts
    │   │   │   │   │   ├── health.controller.ts
    │   │   │   │   │   ├── health.module.ts
    │   │   │   │   │   ├── health.service.spec.ts
    │   │   │   │   │   └── health.service.ts
    │   │   │   │   ├── notifications
    │   │   │   │   │   ├── dto
    │   │   │   │   │   ├── entities
    │   │   │   │   │   ├── notifications.controller.spec.ts
    │   │   │   │   │   ├── notifications.controller.ts
    │   │   │   │   │   ├── notifications.module.ts
    │   │   │   │   │   ├── notifications.service.spec.ts
    │   │   │   │   │   └── notifications.service.ts
    │   │   │   │   ├── permissions
    │   │   │   │   │   ├── dto
    │   │   │   │   │   ├── entities
    │   │   │   │   │   ├── permissions.controller.spec.ts
    │   │   │   │   │   ├── permissions.controller.ts
    │   │   │   │   │   ├── permissions.module.ts
    │   │   │   │   │   ├── permissions.service.spec.ts
    │   │   │   │   │   └── permissions.service.ts
    │   │   │   │   ├── profiles
    │   │   │   │   │   ├── dto
    │   │   │   │   │   ├── entities
    │   │   │   │   │   ├── profiles.controller.spec.ts
    │   │   │   │   │   ├── profiles.controller.ts
    │   │   │   │   │   ├── profiles.module.ts
    │   │   │   │   │   ├── profiles.service.spec.ts
    │   │   │   │   │   └── profiles.service.ts
    │   │   │   │   ├── projects
    │   │   │   │   │   ├── dto
    │   │   │   │   │   ├── entities
    │   │   │   │   │   ├── projects.controller.spec.ts
    │   │   │   │   │   ├── projects.controller.ts
    │   │   │   │   │   ├── projects.module.ts
    │   │   │   │   │   ├── projects.service.spec.ts
    │   │   │   │   │   └── projects.service.ts
    │   │   │   │   ├── reports
    │   │   │   │   │   ├── dto
    │   │   │   │   │   ├── entities
    │   │   │   │   │   ├── reports.controller.spec.ts
    │   │   │   │   │   ├── reports.controller.ts
    │   │   │   │   │   ├── reports.module.ts
    │   │   │   │   │   ├── reports.service.spec.ts
    │   │   │   │   │   └── reports.service.ts
    │   │   │   │   ├── roles
    │   │   │   │   │   ├── dto
    │   │   │   │   │   ├── entities
    │   │   │   │   │   ├── roles.controller.spec.ts
    │   │   │   │   │   ├── roles.controller.ts
    │   │   │   │   │   ├── roles.module.ts
    │   │   │   │   │   ├── roles.service.spec.ts
    │   │   │   │   │   └── roles.service.ts
    │   │   │   │   ├── supabase
    │   │   │   │   │   ├── dto
    │   │   │   │   │   ├── entities
    │   │   │   │   │   ├── supabase.controller.spec.ts
    │   │   │   │   │   ├── supabase.controller.ts
    │   │   │   │   │   ├── supabase.module.ts
    │   │   │   │   │   ├── supabase.service.spec.ts
    │   │   │   │   │   └── supabase.service.ts
    │   │   │   │   ├── taskers
    │   │   │   │   │   ├── dto
    │   │   │   │   │   ├── entities
    │   │   │   │   │   ├── taskers.controller.spec.ts
    │   │   │   │   │   ├── taskers.controller.ts
    │   │   │   │   │   ├── taskers.module.ts
    │   │   │   │   │   ├── taskers.service.spec.ts
    │   │   │   │   │   └── taskers.service.ts
    │   │   │   │   ├── timesheets
    │   │   │   │   │   ├── dto
    │   │   │   │   │   ├── entities
    │   │   │   │   │   ├── timesheets.controller.spec.ts
    │   │   │   │   │   ├── timesheets.controller.ts
    │   │   │   │   │   ├── timesheets.module.ts
    │   │   │   │   │   ├── timesheets.service.spec.ts
    │   │   │   │   │   └── timesheets.service.ts
    │   │   │   │   └── users
    │   │   │   │       ├── dto
    │   │   │   │       ├── entities
    │   │   │   │       ├── users.controller.spec.ts
    │   │   │   │       ├── users.controller.ts
    │   │   │   │       ├── users.module.ts
    │   │   │   │       ├── users.service.spec.ts
    │   │   │   │       └── users.service.ts
    │   │   │   ├── app.module.ts
    │   │   │   └── main.ts
    │   │   ├── test
    │   │   │   ├── e2e
    │   │   │   ├── integration
    │   │   │   └── unit
    │   │   ├── jest.config.js
    │   │   ├── nest-cli.json
    │   │   ├── package.json
    │   │   └── tsconfig.json
    │   └── frontend
    │       ├── app
    │       │   ├── (auth)
    │       │   │   ├── forgot-password
    │       │   │   │   └── page.tsx
    │       │   │   ├── login
    │       │   │   │   └── page.tsx
    │       │   │   ├── register
    │       │   │   │   └── page.tsx
    │       │   │   ├── reset-password
    │       │   │   │   └── page.tsx
    │       │   │   └── layout.tsx
    │       │   ├── (dashboard)
    │       │   │   ├── admin
    │       │   │   │   ├── accounts
    │       │   │   │   ├── audit-logs
    │       │   │   │   ├── dashboard
    │       │   │   │   ├── notifications
    │       │   │   │   ├── profile
    │       │   │   │   ├── projects
    │       │   │   │   ├── reports
    │       │   │   │   ├── settings
    │       │   │   │   ├── taskers
    │       │   │   │   ├── timesheets
    │       │   │   │   └── users
    │       │   │   ├── client
    │       │   │   │   ├── billing
    │       │   │   │   ├── dashboard
    │       │   │   │   ├── profile
    │       │   │   │   ├── projects
    │       │   │   │   └── reports
    │       │   │   ├── tasker
    │       │   │   │   ├── assigned-tasks
    │       │   │   │   ├── dashboard
    │       │   │   │   ├── notifications
    │       │   │   │   ├── performance
    │       │   │   │   ├── profile
    │       │   │   │   ├── timesheets
    │       │   │   │   └── work-history
    │       │   │   └── layout.tsx
    │       │   ├── globals.css
    │       │   └── layout.tsx
    │       ├── components
    │       │   ├── cards
    │       │   │   ├── activity-card.tsx
    │       │   │   ├── chart-card.tsx
    │       │   │   ├── empty-state-card.tsx
    │       │   │   ├── notification-card.tsx
    │       │   │   ├── project-card.tsx
    │       │   │   ├── stat-card.tsx
    │       │   │   └── tasker-card.tsx
    │       │   ├── charts
    │       │   │   ├── analytics-chart.tsx
    │       │   │   ├── area-chart.tsx
    │       │   │   ├── bar-chart.tsx
    │       │   │   ├── chart-wrapper.tsx
    │       │   │   ├── line-chart.tsx
    │       │   │   └── pie-chart.tsx
    │       │   ├── empty-states
    │       │   │   ├── empty-notifications.tsx
    │       │   │   ├── empty-projects.tsx
    │       │   │   ├── empty-search.tsx
    │       │   │   ├── empty-taskers.tsx
    │       │   │   ├── empty-timesheets.tsx
    │       │   │   └── generic-empty-state.tsx
    │       │   ├── forms
    │       │   │   ├── account-form.tsx
    │       │   │   ├── filter-form.tsx
    │       │   │   ├── profile-form.tsx
    │       │   │   ├── project-form.tsx
    │       │   │   ├── settings-form.tsx
    │       │   │   ├── tasker-form.tsx
    │       │   │   └── timesheet-form.tsx
    │       │   ├── layout
    │       │   │   ├── content-area.tsx
    │       │   │   ├── dashboard-shell.tsx
    │       │   │   ├── mobile-drawer.tsx
    │       │   │   ├── nav-item.tsx
    │       │   │   ├── page-header.tsx
    │       │   │   ├── role-based-nav.tsx
    │       │   │   ├── sidebar.tsx
    │       │   │   └── top-bar.tsx
    │       │   ├── modals
    │       │   │   ├── add-tasker-modal.tsx
    │       │   │   ├── confirm-modal.tsx
    │       │   │   ├── create-project-modal.tsx
    │       │   │   ├── export-modal.tsx
    │       │   │   ├── image-preview-modal.tsx
    │       │   │   └── notification-modal.tsx
    │       │   ├── shared
    │       │   │   ├── breadcrumb.tsx
    │       │   │   ├── date-range-picker.tsx
    │       │   │   ├── error-boundary.tsx
    │       │   │   ├── loading-spinner.tsx
    │       │   │   ├── ... (6 more files)
    │       │   ├── tables
    │       │   │   ├── column-filter.tsx
    │       │   │   ├── data-table.tsx
    │       │   │   ├── mobile-card-list.tsx
    │       │   │   ├── responsive-table.tsx
    │       │   │   ├── sortable-header.tsx
    │       │   │   └── table-pagination.tsx
    │       │   └── ui
    │       │       ├── avatar.tsx
    │       │       ├── badge.tsx
    │       │       ├── button.tsx
    │       │       ├── calendar.tsx
    │       │       ├── ... (16 more files)
    │       ├── constants
    │       │   ├── api-endpoints.ts
    │       │   ├── chart-configs.ts
    │       │   ├── date-formats.ts
    │       │   ├── local-storage-keys.ts
    │       │   ├── ... (5 more files)
    │       ├── hooks
    │       │   ├── use-analytics.ts
    │       │   ├── use-auth.ts
    │       │   ├── use-click-outside.ts
    │       │   ├── use-debounce.ts
    │       │   ├── ... (16 more files)
    │       ├── lib
    │       │   ├── api.ts
    │       │   ├── auth.ts
    │       │   ├── supabase.ts
    │       │   └── utils.ts
    │       ├── public
    │       │   ├── fonts
    │       │   ├── icons
    │       │   └── images
    │       ├── services
    │       │   ├── account-service.ts
    │       │   ├── analytics-service.ts
    │       │   ├── api-client.ts
    │       │   ├── auth-service.ts
    │       │   ├── ... (7 more files)
    │       ├── stores
    │       │   ├── auth-store.ts
    │       │   ├── dashboard-store.ts
    │       │   ├── filter-store.ts
    │       │   ├── notification-store.ts
    │       │   └── ui-store.ts
    │       ├── styles
    │       ├── tests
    │       │   ├── e2e
    │       │   ├── integration
    │       │   └── unit
    │       ├── types
    │       │   ├── account.types.ts
    │       │   ├── analytics.types.ts
    │       │   ├── api.types.ts
    │       │   ├── auth.types.ts
    │       │   ├── ... (11 more files)
    │       ├── utils
    │       │   ├── cn.ts
    │       │   ├── date-utils.ts
    │       │   ├── error-utils.ts
    │       │   ├── export-utils.ts
    │       │   ├── ... (6 more files)
    │       ├── validations
    │       │   ├── account-schema.ts
    │       │   ├── auth-schema.ts
    │       │   ├── export-schema.ts
    │       │   ├── profile-schema.ts
    │       │   ├── project-schema.ts
    │       │   ├── settings-schema.ts
    │       │   ├── tasker-schema.ts
    │       │   └── timesheet-schema.ts
    │       ├── jest.config.js
    │       ├── next-env.d.ts
    │       ├── next.config.js
    │       ├── package.json
    │       ├── postcss.config.js
    │       ├── tailwind.config.ts
    │       └── tsconfig.json
    ├── database
    │   ├── migrations
    │   │   ├── versions
    │   │   └── README.md
    │   ├── schemas
    │   │   ├── entities.schema.sql
    │   │   ├── projects.schema.sql
    │   │   ├── roles.schema.sql
    │   │   ├── system.schema.sql
    │   │   ├── timesheets.schema.sql
    │   │   └── users.schema.sql
    │   ├── seeds
    │   │   ├── development
    │   │   │   ├── README.md
    │   │   │   ├── permissions.sql
    │   │   │   └── roles.sql
    │   │   └── production
    │   └── supabase
    │       ├── config.toml
    │       └── schema.sql
    ├── docker
    │   ├── backend
    │   │   └── Dockerfile
    │   ├── database
    │   │   └── init
    │   │       └── 01-init.sql
    │   ├── frontend
    │   │   └── Dockerfile
    │   ├── nginx
    │   │   └── nginx.conf
    │   └── redis
    ├── docs
    │   ├── api
    │   │   └── API.md
    │   ├── architecture
    │   │   └── ARCHITECTURE.md
    │   ├── backend
    │   │   └── BACKEND.md
    │   ├── database
    │   │   └── DATABASE.md
    │   ├── deployment
    │   │   └── DEPLOYMENT.md
    │   ├── design
    │   │   └── DESIGN_SYSTEM.md
    │   ├── frontend
    │   │   └── FRONTEND.md
    │   ├── testing
    │   │   └── TESTING.md
    │   └── README.md
    ├── packages
    │   ├── shared-constants
    │   │   ├── src
    │   │   │   ├── date-formats.ts
    │   │   │   ├── index.ts
    │   │   │   ├── permissions.ts
    │   │   │   ├── roles.ts
    │   │   │   ├── routes.ts
    │   │   │   └── status-codes.ts
    │   │   ├── package.json
    │   │   └── tsconfig.json
    │   ├── shared-rbac
    │   │   ├── src
    │   │   │   ├── index.ts
    │   │   │   ├── permissions.ts
    │   │   │   ├── role-permissions.ts
    │   │   │   └── roles.ts
    │   │   ├── package.json
    │   │   └── tsconfig.json
    │   ├── shared-types
    │   │   ├── src
    │   │   │   ├── api.types.ts
    │   │   │   ├── auth.types.ts
    │   │   │   ├── common.types.ts
    │   │   │   ├── index.ts
    │   │   │   ├── ... (6 more files)
    │   │   ├── package.json
    │   │   └── tsconfig.json
    │   ├── shared-utils
    │   │   ├── src
    │   │   │   ├── array-utils.ts
    │   │   │   ├── date-utils.ts
    │   │   │   ├── index.ts
    │   │   │   ├── number-utils.ts
    │   │   │   ├── slug-utils.ts
    │   │   │   └── string-utils.ts
    │   │   ├── package.json
    │   │   └── tsconfig.json
    │   └── shared-validation
    │       ├── src
    │       │   ├── auth.schema.ts
    │       │   ├── common.schema.ts
    │       │   ├── index.ts
    │       │   ├── project.schema.ts
    │       │   ├── tasker.schema.ts
    │       │   ├── timesheet.schema.ts
    │       │   └── user.schema.ts
    │       ├── package.json
    │       └── tsconfig.json
    ├── scripts
    │   ├── bash
    │   │   ├── backup-db.sh
    │   │   └── restore-db.sh
    │   └── python
    │       ├── bulk-ops
    │       │   └── bulk-tasker-create.py
    │       ├── cleanup
    │       │   └── data-cleanup.py
    │       ├── exports
    │       │   └── csv-export.py
    │       ├── imports
    │       │   └── csv-import.py
    │       ├── reports
    │       │   └── report-generator.py
    │       ├── utils
    │       │   └── db-utils.py
    │       └── timesheet-export.py
    ├── README.md
    ├── docker-compose.yml
    ├── package.json
    └── turbo.json
