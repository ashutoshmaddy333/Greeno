# System Settings Documentation

## Overview

The GreenTech Jobs platform includes a comprehensive settings system that allows administrators to control various aspects of the application. These settings are stored in the database and can be accessed by both administrators and regular users.

## Features

- **Dynamic Settings**: All settings are stored in the database and can be updated without code changes
- **Public/Private Settings**: Some settings are visible to all users, others are admin-only
- **Real-time Updates**: Settings changes are immediately reflected throughout the application
- **Maintenance Mode**: Ability to put the entire site into maintenance mode
- **Job Control**: Enable/disable job posting and applications
- **Site Customization**: Change site name, contact email, and other branding

## Settings Categories

### Job Settings
- `allowJobPosting`: Enable/disable job posting for employers
- `allowJobApplications`: Enable/disable job applications for job seekers
- `maxJobsPerEmployer`: Maximum number of active jobs per employer
- `maxApplicationsPerJob`: Maximum number of applications per job posting
- `jobPostingFee`: Fee for posting a job (in USD)

### Security Settings
- `requireEmailVerification`: Require email verification for new accounts

### General Settings
- `siteName`: Name of the job board
- `contactEmail`: Contact email for support
- `maintenanceMode`: Enable/disable maintenance mode
- `maintenanceMessage`: Message displayed during maintenance mode

## API Endpoints

### Admin Settings API
- `GET /api/admin/settings` - Get all settings (admin only)
- `PATCH /api/admin/settings` - Update settings (admin only)
- `POST /api/admin/settings` - Reset settings to defaults (admin only)

### Public Settings API
- `GET /api/settings` - Get public settings (available to all users)

## Usage

### For Administrators

1. **Access Settings**: Navigate to `/admin/settings`
2. **Update Settings**: Modify any setting and click "Save Changes"
3. **Reset to Defaults**: Click "Reset to Defaults" to restore default values

### For Developers

#### Using the Settings Context

```tsx
import { useSettings } from '@/contexts/settings-context'

function MyComponent() {
  const { settings, loading } = useSettings()
  
  if (loading) return <div>Loading...</div>
  
  if (!settings?.allowJobPosting) {
    return <div>Job posting is currently disabled</div>
  }
  
  return <div>Job posting is enabled</div>
}
```

#### Using the Settings Check Hook

```tsx
import { useSettingsCheck } from '@/hooks/use-settings-check'

function MyComponent() {
  const { canPostJobs, getMaxJobsPerEmployer } = useSettingsCheck()
  
  if (!canPostJobs()) {
    return <div>Job posting is disabled</div>
  }
  
  return <div>You can post up to {getMaxJobsPerEmployer()} jobs</div>
}
```

#### Using Guard Components

```tsx
import { JobPostingGuard } from '@/components/job-posting-guard'

function JobPostingPage() {
  return (
    <JobPostingGuard>
      <JobPostingForm />
    </JobPostingGuard>
  )
}
```

### For Job Seekers and Employers

Settings are automatically applied throughout the application:

- **Job Posting**: If disabled, employers cannot post new jobs
- **Job Applications**: If disabled, job seekers cannot apply to jobs
- **Maintenance Mode**: If enabled, a maintenance message is displayed
- **Site Name**: Used in the navbar and page titles
- **Contact Email**: Used in contact forms and support pages

## Database Schema

Settings are stored in the `SystemSettings` collection with the following schema:

```typescript
interface ISystemSettings {
  key: string
  value: any
  description: string
  category: "general" | "email" | "job" | "security" | "notification"
  type: "string" | "number" | "boolean" | "json" | "array"
  isPublic: boolean
  updatedBy: mongoose.Types.ObjectId
  createdAt: Date
  updatedAt: Date
}
```

## Initialization

To initialize the database with default settings, run:

```bash
npm run init-settings
```

This will create all default settings if they don't already exist.

## Adding New Settings

1. **Update the Model**: Add the new setting to the `DEFAULT_SETTINGS` array in `/app/api/admin/settings/route.ts`
2. **Update the Context**: Add the new setting to the `SystemSettings` interface in `/contexts/settings-context.tsx`
3. **Update the Hook**: Add utility functions in `/hooks/use-settings-check.ts` if needed
4. **Update the Admin UI**: Add the setting to the admin settings page if it should be configurable
5. **Update Documentation**: Add the new setting to this documentation

## Security Considerations

- Only administrators can modify settings
- Public settings are visible to all users
- Private settings are only accessible to administrators
- Settings are validated on both client and server side
- All settings changes are logged with the user who made the change

## Troubleshooting

### Settings Not Loading
- Check if the database is connected
- Verify that settings exist in the database
- Run `npm run init-settings` to create default settings

### Settings Not Updating
- Check if you're logged in as an administrator
- Verify the API endpoint is working
- Check browser console for errors

### Maintenance Mode Not Working
- Ensure the `MaintenanceMode` component is included in the layout
- Check if the settings context is properly initialized
- Verify the maintenance mode setting is set to `true` 