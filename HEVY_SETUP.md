# Hevy Integration Setup

This guide will help you set up Hevy integration for your fitness tracker app to track gym workouts.

## Step 1: Get Your Hevy API Key

1. Open the Hevy app on your phone
2. Go to **Settings** → **API**
3. Copy your **API Key**

## Step 2: Configure the App

1. Run your app: `npm start`
2. Use tunnel mode: `npx expo start --tunnel`
3. Open the app on your phone

## Step 3: Test the Integration

1. After saving your API key, the app will automatically fetch your workout data
2. Your gym workout dates should now appear on the calendar with **orange circles**
3. If you have both Strava and Hevy connected, you'll see:
   - **Blue circles** for running days (Strava)
   - **Orange circles** for gym days (Hevy)
   - **Multiple dots** for days with both activities

## Features

- **Automatic Sync**: Gym workouts from Hevy are automatically fetched and displayed
- **Calendar Integration**: Gym dates are highlighted with orange circles
- **Multi-Activity Support**: Shows both running and gym activities on the same calendar
- **Month Navigation**: Data is loaded for each month as you navigate through the calendar
- **Visual Legend**: Clear indicators showing what each color represents

## Calendar Legend

- 🔵 **Blue Circle**: Running activity (from Strava)
- 🟠 **Orange Circle**: Gym workout (from Hevy)
- 🔵🟠 **Multiple Dots**: Both running and gym on the same day

## Troubleshooting

### Common Issues

1. **"API key not configured" error**:

   - Make sure you've entered your Hevy API key correctly
   - Check that the API key is valid in your Hevy app

2. **"Failed to fetch workouts" error**:

   - Check your internet connection
   - Verify your API key is correct
   - Make sure you have workouts in your Hevy account

3. **No workouts showing**:

   - Make sure you have gym workouts logged in your Hevy app
   - Check that the date range includes your workouts
   - Verify the API key was saved successfully

4. **Slow loading**:
   - The app fetches all your workouts from Hevy, which can take time
   - Subsequent loads will be faster due to caching

### Debug Mode

To see detailed logs, check the console output in your development environment. The app logs API calls and data processing for debugging purposes.

## API Details

The app uses the Hevy API endpoint:

- **GET** `/v1/workouts` - Fetches all your workouts
- **Authentication**: Bearer token (your API key)
- **Pagination**: Automatically handles multiple pages of data

## Security Notes

- Your API key is stored locally on your device
- The app only requests read access to your workout data
- You can revoke access by removing the API key from the app
- Never share your API key with others

## Next Steps

Once the basic integration is working, you can:

1. Add workout details view when tapping on calendar dates
2. Implement workout statistics and summaries
3. Add sync status indicators
4. Implement background sync
5. Add workout type filtering (strength, cardio, etc.)

## Combined Integration

With both Strava and Hevy connected, your calendar will show a complete picture of your fitness activities:

- **Running days** from Strava (blue)
- **Gym days** from Hevy (orange)
- **Mixed activity days** with both dots
- **Rest days** clearly visible as unmarked dates

This gives you a comprehensive view of your fitness routine across different platforms!
