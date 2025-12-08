# How to Run Fortis Mobile App

## Prerequisites

Make sure you have:
- ✅ Node.js installed (v18 or later)
- ✅ Expo Go app on your phone (download from App Store/Play Store)
- OR iOS Simulator (Mac only) / Android Emulator

## Running the App

### 1. Navigate to the project
```bash
cd fortis-mobile-app
```

### 2. Start the development server
```bash
npm start
```

This will open the Expo Dev Tools in your browser.

### 3. Choose how to run:

#### Option A: On Your Physical Device (Recommended for testing)
1. Download **Expo Go** from App Store (iOS) or Play Store (Android)
2. Scan the QR code from the terminal with:
   - **iOS**: Camera app
   - **Android**: Expo Go app
3. The app will load on your device

#### Option B: iOS Simulator (Mac only)
```bash
npm run ios
```
Or press `i` in the terminal after `npm start`

#### Option C: Android Emulator
```bash
npm run android
```
Or press `a` in the terminal after `npm start`

#### Option D: Web Browser (Limited functionality)
```bash
npm run web
```
Or press `w` in the terminal after `npm start`

## What You'll See

### Current Features (Phase 1):
1. **Landing Page** - "Fortis" title with "Get Started" button
2. **Tab Navigation** - 4 tabs at the bottom
   - Workout (home icon)
   - History (clock icon)
   - Analytics (chart icon)
   - Profile (user icon)
3. **Dark Theme** - Dark industrial aesthetic matching Figma
4. **Placeholder Screens** - Each tab shows a title and subtitle

### Design Elements:
- ✅ Dark background (#0a0a0a)
- ✅ White text (#fafafa)
- ✅ Blue accent (#0ea5e9)
- ✅ Smooth navigation transitions
- ✅ Safe area handling (notches, status bar)

## Troubleshooting

### Issue: Metro bundler won't start
```bash
# Clear cache and restart
npm start -- --clear
```

### Issue: "Unable to resolve module"
```bash
# Reinstall dependencies
rm -rf node_modules
npm install
npm start
```

### Issue: App crashes on launch
- Make sure you're using Expo Go app (not the Expo Dev Client)
- Check terminal for error messages

### Issue: White screen
- Wait 30 seconds for the app to build
- Check for red error screen
- Shake device and reload

## Development Tips

### Hot Reload
- Saves automatically reload the app
- Fast refresh preserves component state
- Shake device → "Reload" for full refresh

### Debug Menu
- **iOS**: Cmd + D (Simulator) or Shake device
- **Android**: Cmd + M (Emulator) or Shake device

### View Logs
Check the terminal where you ran `npm start` for console logs

## Next Steps After Running

Once you see the app working:
1. Navigate between tabs
2. Verify dark theme
3. Check that buttons and navigation work
4. Report any issues you see

Then we'll proceed to:
- Build UI components
- Add authentication
- Implement workout logging

---

**Need Help?**
- Check terminal for errors
- Use Expo Dev Menu (shake device)
- Press `r` in terminal to reload
