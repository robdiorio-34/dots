# Strava Integration Setup

This guide will help you set up Strava integration for your fitness tracker app.

## Step 1: Create a Strava API Application

1. Go to [Strava API Settings](https://www.strava.com/settings/api)
2. Click "Create Your Own Application"
3. Fill in the application details:

   - **Application Name**: Fitness Tracker (or your preferred name)
   - **Category**: Fitness
   - **Website**: `https://your-website.com` (can be any valid URL)
   - **Application Description**: A fitness tracking app that syncs with Strava
   - **Authorization Callback Domain**: `localhost` (for development)

4. Click "Create"
5. Note down your **Client ID** and **Client Secret**

## Step 2: Update Configuration Files

### Update Strava Service

Edit `src/services/stravaService.ts`:

```typescript
const STRAVA_CLIENT_ID = "YOUR_ACTUAL_CLIENT_ID"; // Replace with your Client ID
const STRAVA_CLIENT_SECRET = "YOUR_ACTUAL_CLIENT_SECRET"; // Replace with your Client Secret
```

### Update Strava Auth Component

Edit `src/components/StravaAuth.tsx`:

```typescript
const STRAVA_CLIENT_ID = "YOUR_ACTUAL_CLIENT_ID"; // Replace with your Client ID
```

And in the `exchangeCodeForToken` function:

```typescript
client_secret: 'YOUR_ACTUAL_CLIENT_SECRET', // Replace with your Client Secret
```

## Step 3: Update Redirect URI

The app is configured to use the scheme `fitness-tracker://` for OAuth redirects. This should work with the current setup.

## Step 4: Test the Integration

1. Run your app: `npm start`
2. Use tunnel mode: `npx expo start --tunnel`
3. Open the app on your phone
4. Tap "Connect to Strava"
5. Complete the OAuth flow
6. Your running activities should now appear on the calendar with opaque blue circles

## Features

- **Automatic Sync**: Running activities from Strava are automatically fetched and displayed
- **Calendar Integration**: Running dates are highlighted with opaque blue circles
- **Month Navigation**: Data is loaded for each month as you navigate through the calendar
- **Token Management**: Access tokens are automatically refreshed when needed
- **Offline Fallback**: Shows example data when not connected to Strava

## Troubleshooting

### Common Issues

1. **"Invalid redirect URI" error**:

   - Make sure your Strava app's callback domain is set to `localhost`
   - The scheme `fitness-tracker://` should work automatically

2. **"Client ID not found" error**:

   - Double-check that you've replaced `YOUR_STRAVA_CLIENT_ID` with your actual Client ID
   - Make sure the Client ID is correct in both files

3. **"Authentication failed" error**:

   - Check your internet connection
   - Make sure you're using the tunnel mode for development
   - Verify your Strava app settings

4. **No activities showing**:
   - Make sure you have running activities in your Strava account
   - Check that the date range includes your activities
   - Verify the authentication was successful

### Debug Mode

To see detailed logs, check the console output in your development environment. The app logs authentication steps and API calls for debugging purposes.

## Security Notes

- Never commit your Client Secret to version control
- Consider using environment variables for production
- The app only requests read access to your activities
- You can revoke access at any time from your Strava settings

## Next Steps

Once the basic integration is working, you can:

1. Add more activity types (cycling, swimming, etc.)
2. Implement activity details view when tapping on calendar dates
3. Add sync status indicators
4. Implement background sync
5. Add activity statistics and summaries
