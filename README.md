# Fitness Tracker

A simple workout tracking app to monitor running, lifting, and soccer activities.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm start
```

3. Run on iOS:

- Press 'i' in the terminal after starting the dev server
- Or run: `npm run ios`

4. Run on Android:

- Press 'a' in the terminal after starting the dev server
- Or run: `npm run android`

## Features

- Track three types of workouts: Running, Lifting, and Soccer
- Calendar view with color-coded activities
- Streak tracking
- Rest day monitoring
- Prevents more than 2 consecutive days without activity

## TODO

- add navigation bar on bottom for "workout" and "cal"
- add functionality to be able to log workout (run, soccer, lift)
- add functionality to read logged workout and update cal with color coding
- add "double click" into cal logged workouts (shows stats and duration? idk)
- add widget
- add streaks
- add push notifcation if "breaking habit" by going 2 days without it
