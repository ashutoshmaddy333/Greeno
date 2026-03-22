# Maintenance Mode Management

## Overview

Maintenance mode allows you to temporarily disable access to your website while performing updates or maintenance. When enabled, it shows a full-screen overlay that prevents users from accessing the site.

## How to Enable/Disable Maintenance Mode

### Method 1: Admin Dashboard (When Accessible)

1. **Login to Admin Dashboard**: Go to `/admin/login`
2. **Navigate to Settings**: Go to `/admin/settings`
3. **Find Maintenance Section**: Look for the "Maintenance" card
4. **Toggle Maintenance Mode**: Switch the "Maintenance Mode" toggle to ON
5. **Save Changes**: Click "Save Changes" button

### Method 2: Command Line (Recommended)

Use the provided shell script to manage maintenance mode:

```bash
# Check current status
./scripts/maintenance.sh status

# Enable maintenance mode
./scripts/maintenance.sh on

# Disable maintenance mode
./scripts/maintenance.sh off
```

### Method 3: Direct API Call

```bash
# Disable maintenance mode
curl -X PATCH http://localhost:3000/api/admin/settings \
  -H "Content-Type: application/json" \
  -d '[{"key":"maintenanceMode","value":false}]'

# Enable maintenance mode
curl -X PATCH http://localhost:3000/api/admin/settings \
  -H "Content-Type: application/json" \
  -d '[{"key":"maintenanceMode","value":true}]'
```

### Method 4: NPM Scripts

```bash
# Disable maintenance mode
npm run maintenance-off

# Enable maintenance mode
npm run maintenance-on
```

## Important Notes

### ✅ **Admin Access Preserved**

**Feature**: When maintenance mode is enabled, admins can still access the admin dashboard at `/admin/*` routes to turn off maintenance mode through the web interface.

**How it works**: The maintenance overlay automatically excludes admin routes, allowing administrators to manage the site even during maintenance.

### 🔧 **Recommended Workflow**

1. **Enable via Admin Dashboard**: Go to `/admin/settings` and toggle maintenance mode ON
2. **Disable via Admin Dashboard**: Go to `/admin/settings` and toggle maintenance mode OFF
3. **Alternative**: Use command-line methods if needed

### 📋 **Maintenance Mode Settings**

- **Maintenance Mode**: Enable/disable the overlay
- **Maintenance Message**: Custom message displayed to users
- **Default Message**: "The site is currently under maintenance. Please check back later."

## Troubleshooting

### Maintenance Mode Won't Turn Off

1. **Use Admin Dashboard**: Go to `/admin/settings` and toggle maintenance mode OFF
2. **Use Command Line**: Run `./scripts/maintenance.sh off` as backup
3. **Check Server**: Ensure the server is running
4. **Check Database**: Verify settings are saved correctly

### Maintenance Mode Not Working

1. **Check Settings**: Verify `maintenanceMode` is set to `true`
2. **Clear Cache**: Refresh the browser or clear localStorage
3. **Check Components**: Ensure `MaintenanceMode` component is loaded

### API Errors

If you get 404 errors when using the API:

1. **Check Server**: Ensure the development server is running
2. **Check Route**: Verify `/api/admin/settings` exists
3. **Use Alternative**: Try the shell script instead

## Best Practices

1. **Always Test**: Test maintenance mode on a staging environment first
2. **Keep Access**: Always have a command-line method to disable
3. **Inform Users**: Update the maintenance message to inform users
4. **Monitor**: Check that maintenance mode is working as expected
5. **Quick Recovery**: Keep the disable command ready for quick recovery

## Emergency Recovery

If you're stuck with maintenance mode enabled:

```bash
# Quick disable command
curl -X PATCH http://localhost:3000/api/admin/settings \
  -H "Content-Type: application/json" \
  -d '[{"key":"maintenanceMode","value":false}]'
```

Or use the shell script:

```bash
./scripts/maintenance.sh off
```

## Files Involved

- `components/maintenance-mode.tsx` - Maintenance overlay component
- `contexts/settings-context.tsx` - Settings management
- `app/api/admin/settings/route.ts` - Settings API
- `scripts/maintenance.sh` - Command-line management script 