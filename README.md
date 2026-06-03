# HabitFlow

HabitFlow is a mobile habit tracking application built with React Native, Expo and Firebase. The app helps users create, manage and track daily habits, monitor progress, set reminders, record moods and personalise their experience through settings such as dark mode, notifications and voice reminders.

## Project Overview

HabitFlow was developed as a group mobile application project. The aim of the app is to support users in building consistent routines by giving them a simple way to track habits, view completion progress and manage reminders.

The application includes account-based access using Firebase Authentication, cloud habit storage using Firestore, local demo-user storage, reminder notifications, progress tracking, mood tracking and a clean mobile interface.

## Key Features

- User sign-up and login using Firebase Authentication
- Demo user mode using local AsyncStorage
- Add new habits with name, category and reminder time
- Edit existing habits
- Delete habits
- Mark habits as complete
- Save and fetch habit data using Firestore
- Store demo user habits locally
- Track progress percentage
- Display completed habits and total habits
- Mood tracking
- Light mode and dark mode
- Notification and voice reminder settings
- APK build using EAS Build
- Firebase Test Lab testing
- Jest unit and integration testing

## Technologies Used

- React Native
- Expo
- Expo Router
- TypeScript
- Firebase Authentication
- Cloud Firestore
- AsyncStorage
- Expo Notifications
- Expo Speech
- Jest
- EAS Build
- Firebase Test Lab

## Installation and Setup

### Prerequisites

Before running the app, make sure the following are installed:

- Node.js
- npm
- Expo CLI or Expo through `npx`
- Expo Go app on a mobile device, or an Android emulator
- Git

### Clone the Repository

```bash
git clone https://github.com/adamzec1z/habitflow-app.git
cd habitflow-app
```

### Install Dependencies

```bash
npm install
```

### Start the App

```bash
npx expo start
```

To clear the cache and start fresh:

```bash
npx expo start -c
```

After the Expo server starts, scan the QR code with Expo Go or run the app on an emulator.

## App Structure

```text
habitflow-app
│
├── app
│   ├── (tabs)
│   │   ├── index.tsx
│   │   ├── home.tsx
│   │   └── settings.tsx
│   ├── add-habit.tsx
│   ├── edit-habit.tsx
│   ├── login.tsx
│   ├── signup.tsx
│   └── _layout.tsx
│
├── assets
│   └── images
│
├── components
│
├── services
│   ├── firebase.ts
│   ├── authService.ts
│   └── habitService.ts
│   
│
├── app.json
├── eas.json
├── package.json
└── README.md
```

## Main Screens

### Login Screen

The login screen allows existing users to sign in using their email and password. Users can also continue as a demo user.

### Sign-Up Screen

The sign-up screen allows new users to create an account using Firebase Authentication.

### Home Dashboard

The home screen displays:

- Total habits
- Completed habits
- Progress percentage
- Habit cards
- Mood tracker
- Add habit option
- Edit and delete options

### Add Habit Screen

Users can create a habit by entering:

- Habit name
- Category
- Reminder time

### Edit Habit Screen

Users can update an existing habit's name, category and reminder time.

### Settings Screen

The settings screen allows users to control:

- Dark mode
- Voice reminders
- Notifications
- Logout
- Clear all data

## Firebase Integration

HabitFlow uses Firebase for authentication and cloud storage.

### Firebase Authentication

Firebase Authentication is used for:

- Creating user accounts
- Logging users in
- Logging users out
- Linking habits to logged-in users

### Firestore

Cloud Firestore is used to store and retrieve habit data for logged-in users.

Habit data can include:

- Habit name
- Category
- Frequency
- Reminder time
- Completion status
- Created date
- User ID

### Demo Mode

Demo mode allows users to use HabitFlow without creating an account. In demo mode, habits are stored locally using AsyncStorage instead of Firestore.

## Local Storage

AsyncStorage is used for local app data such as:

- Demo user habits
- Mood selection
- Dark mode preference
- Voice reminder setting
- Notification setting

This allows the app to preserve user preferences and demo data on the device.

## Notifications and Reminders

HabitFlow uses Expo Notifications to support local habit reminders. Users can set reminder times when creating or editing habits.

The app also includes voice reminder support using Expo Speech.

Note: Expo Go may have limitations with some notification behaviours. For reliable notification testing, the app should be tested using an APK or development build.

## Testing

Testing was completed using Jest and Firebase Test Lab.

## Firebase Test Lab

Firebase Test Lab was used to test the Android APK through a Robo Test. The automated test explored the app on an Android device and generated evidence such as logs, screenshots and a crawl graph.

Firebase Test Lab was used to confirm that the APK could launch, navigate through screens and run without major crashes.

## APK Build

The Android APK was built using EAS Build.

### Build Configuration

The project includes an `eas.json` file with an APK preview build profile.

Example:

```json
{
  "build": {
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    }
  }
}
```

### Build APK

```bash
eas build -p android --profile preview
```

After the build completes, the APK can be downloaded from the Expo build page.

## Branching and Version Control

Git and GitHub were used for version control. Sprint work was separated into branches to show development progress and contribution evidence.

Example branches:

```text
main
ibrahim-sprint1
ibrahim-sprint2
ibrahim-sprint3
Adam-sprint1
Adam-sprint2
Adam-sprint3
```

Sprint 3 work included testing evidence, documentation, APK build evidence and supporting project artefacts.

## Known Limitations

- Expo Go may not fully support all notification behaviours.
- Firebase Test Lab Robo Test cannot fully replace manual testing.
- Automated tests may not test every real user path.
- Demo user data is stored locally and may be lost if app data is cleared.
- Firestore features require an internet connection.
- iOS Firebase Test Lab testing requires XCTest/XCUITest setup and is more complex than Android Robo testing.

## Future Improvements

Possible future improvements include:

- More advanced notification scheduling
- Improved offline support
- Better habit streak history
- More detailed progress analytics
- Calendar-based habit tracking
- Improved user profile management
- More automated end-to-end tests
- Better accessibility support
- Improved UI animations and feedback

## Contributors

- Adam Zec
- Ibrahim Khurram

## Application Version

Version: 1.0

## Licence

This project was developed for educational purposes as part of a university mobile application development assessment.
