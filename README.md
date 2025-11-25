# Birthday Countdown for Seemi 💕

A beautiful, personalized countdown website to celebrate a special birthday on December 4th. This digital gift features an animated starry sky, seven unlock-able heart cards with daily love messages, and a surprise animation that triggers at midnight Lahore time on the birthday.

## ✨ Features

- **Timezone-Aware Unlocking**: Hearts unlock daily at midnight in Lahore (Asia/Karachi timezone)
- **Responsive Design**: Optimized for iPhone 12 Pro and all modern devices
- **Accessibility First**: Full keyboard navigation, ARIA labels, focus management, and screen reader support
- **Surprise Animation**: Confetti and heart burst effect triggers exactly at midnight on December 4, 2025 in Lahore
- **Glassmorphic UI**: Modern, frosted-glass modal cards with smooth animations
- **Starry Background**: Animated canvas with twinkling stars and subtle glow effects

Recent fixes (Nov 25, 2025):
- Cake click now opens the same blurred modal as hearts (improves readability).
- Better mobile spacing: hearts use mobile-specific coordinates and the grid uses visualViewport where available to avoid the "sandwiching" effect.
- Canvas sizing improved to reduce iOS Safari bottom white banner (`100dvh` in CSS + visualViewport in JS).

## 📋 Project Structure

```
/BirthdaySky
├── index.html       # Main HTML file (clean, semantic structure)
├── style.css        # All styling and animations
├── script.js        # Core functionality (hearts, unlocking, surprise)
└── README.md        # This file
```

## 🎯 How It Works

### Heart Unlocking Logic
- The page calculates the current date and time in **Lahore timezone (Asia/Karachi)**
- It compares this to the target date: **December 4, 2025 at 00:00 AM**
- Days remaining are calculated, and hearts unlock progressively:
  - Day 7 unlocks when 7 days remain (Nov 27 at 12:00 AM)
  - Day 6 unlocks when 6 days remain (Nov 28 at 12:00 AM)
  - ... and so on until Dec 3

### Locked vs Unlocked Hearts
- **Locked hearts** (grayed out) show a 🔒 lock icon and cannot be clicked
- **Unlocked hearts** (pink, glowing) are interactive and display personalized messages
- The grid updates automatically every 60 seconds to reflect newly unlocked hearts

### Surprise Animation (Dec 4 at Midnight Lahore Time)
When the clock strikes midnight in Lahore on December 4, 2025:
- 80 falling confetti pieces (hearts ❤️ and sparkles ✨) animate downward
- 12 hearts burst outward from the center in a radial pattern
- A special birthday message card appears with a heartfelt greeting
- All animations automatically clean up after 5 seconds

### Accessibility
- **Keyboard Navigation**: Tab through hearts, use Enter/Space to open messages, Esc to close
- **ARIA Labels**: Screen readers announce heart day numbers, lock states, and message titles
- **Focus Management**: Clear focus indicators on all interactive elements
- **Mobile Zoom**: Removed viewport scaling restrictions for better accessibility
- **Safe Area Support**: Respects iPhone notch and home indicator areas

## 🚀 Deployment to GitHub Pages

### Steps:
1. Push all files to GitHub repository `zft4/BirthdaySky`
2. Go to **Settings → Pages**
3. Set **Source** to `main` branch (or whichever branch has the code)
4. Save and wait for the deploy (usually ~1 minute)
5. Your site will be available at: `https://zft4.github.io/BirthdaySky/`

### Share with Seemi:
- Send her the GitHub Pages URL via WhatsApp, email, or text
- The page works great on iPhone 12 Pro Safari
- Bookmarking recommended for easy daily access

## 📱 iPhone 12 Pro Optimization

This project is optimized specifically for iPhone 12 Pro:
- Touch targets are 44px minimum (accessibility standard)
- Safe area insets respected for notch and home indicator
- Smooth scrolling and animations at 60 FPS
- Pinch-zoom allowed (removed viewport restrictions)
- Font sizes readable without zooming
- Modal cards scale responsively for smaller screens

### Testing on iPhone:
1. Open Safari on the iPhone
2. Navigate to the GitHub Pages URL
3. Tap hearts to view messages
4. Try keyboard shortcuts: Tab, Enter, Esc
5. For the surprise animation test: Change system time to Dec 4, 2025 at 11:59 PM, wait for midnight

## 🧪 Test Mode (Before Your Wife Sees It)

Before sharing with Seemi, you can test the unlocking and surprise animation without waiting for actual dates!

### Test URL Parameters

Add `?testDays=X` to the URL where X is the number of days remaining:

**Examples:**

- `http://localhost:8000/?testDays=7` - All hearts locked (7 days left)
- `http://localhost:8000/?testDays=3` - First 4 hearts unlocked, last 3 locked
- `http://localhost:8000/?testDays=0` - All hearts unlocked + trigger surprise animation
- `https://zft4.github.io/BirthdaySky/?testDays=2` - Test on live GitHub Pages

### What Each Test Value Shows

| URL Parameter | What It Shows |
|---|---|
| `?testDays=7` | All hearts locked (mimics Nov 27, 2025) |
| `?testDays=6` | Day 7 unlocked, rest locked |
| `?testDays=5` | Days 7-6 unlocked, rest locked |
| `?testDays=4` | Days 7-5 unlocked, rest locked |
| `?testDays=3` | Days 7-4 unlocked, rest locked |
| `?testDays=2` | Days 7-5 unlocked, rest locked |
| `?testDays=1` | Days 7-6 unlocked, rest locked |
| `?testDays=0` | All hearts unlocked + confetti/surprise animation triggers |

### Testing Workflow

**Step 1: Test Hearts Locked**
```
http://localhost:8000/?testDays=7
```
- Should show all 7 hearts (Day 7 down to Day 1) in descending order
- All hearts should be grayed out with 🔒 lock icons
- Clicking any heart should do nothing

**Step 2: Test Progressive Unlocking**
```
http://localhost:8000/?testDays=5
```
- Top 2 hearts (Day 7, Day 6) should be bright pink and glowing
- Bottom 5 hearts should be grayed out with lock icons
- Click the unlocked hearts to see the messages

**Step 3: Test All Unlocked**
```
http://localhost:8000/?testDays=1
```
- All hearts should be visible and clickable
- All should be bright pink with beating animation

**Step 4: Test Surprise Animation**
```
http://localhost:8000/?testDays=0
```
- All hearts unlocked
- Confetti should immediately burst and fall
- 12 hearts should explode outward from center
- Birthday message card should appear
- Everything should clean up after 5 seconds

### Browser Console Notifications

When test mode is active, you'll see helpful messages in the browser console (F12 → Console):
```
🧪 TEST MODE ACTIVE: 3 days remaining
📝 URL: http://localhost:8000/?testDays=3
💡 To unlock all hearts, use: ?testDays=0
```

### Important Notes

- Test mode only affects unlock status, **not the actual date**
- Test mode is **safe to use** and won't break anything
- The actual surprise animation (Dec 4 at midnight) will still work normally
- Once you remove `?testDays=X`, it goes back to normal timezone-based unlocking
- Test mode works on both local (`localhost:8000`) and GitHub Pages URLs

## 💌 Customizing Messages

To change the daily messages, edit `script.js` and update the `MESSAGES` array:

```javascript
const MESSAGES = [
    { day: 1, title: '1 Day Left', text: 'Your custom message here' },
    { day: 2, title: '2 Days Left', text: 'Another message' },
    // ... etc
];
```

Messages can be any length. The card will scale to fit the content. Messages are shuffled in display order, so day 7 may appear in any position in the grid.

## 🎨 Visual Customization

### Colors:
- **Background gradient**: Edit lines 7-8 in `style.css`
- **Heart color**: Change `fill: #ff6b8b` in `.heart-svg` class
- **Glow intensity**: Adjust `drop-shadow` values

### Animations:
- **Heart beat speed**: Change `2s` in `.heart-svg` animation
- **Float animation**: Modify `7s` in `.heart-wrapper` animation
- **Confetti fall speed**: Adjust `2s` and `3s` range in `triggerSurpriseAnimation()`

### Card styling:
- **Modal background**: Change `rgba(255, 230, 240, 0.1)` in `.card` class
- **Text colors**: Edit `#ffd1dc` (pink), `#fff0f5` (light pink)

## 🔧 Technical Details

### Dependencies
- **None!** This is vanilla HTML/CSS/JavaScript with no external dependencies
- Works offline (except for GitHub Pages hosting)

### Browser Support
- ✅ Safari (iOS 14+) - tested on iPhone 12 Pro
- ✅ Chrome, Edge, Firefox (latest)
- ✅ Mobile Safari on iPadOS

### JavaScript Libraries Used
- **Intl.DateTimeFormat**: For timezone-aware date calculations (built into browsers)
- No external frameworks or libraries

### File Sizes
- `index.html`: ~0.8 KB
- `style.css`: ~8 KB
- `script.js`: ~10 KB
- **Total**: ~18.8 KB (very lightweight)

## 🛠️ Development

### Local Testing
```bash
# Navigate to project directory
cd /workspaces/BirthdaySky

# Start a simple HTTP server
python3 -m http.server 8000

# Open http://localhost:8000 in your browser
```

### Testing Timezone Logic
To test the unlock mechanism with different dates:
1. Change your system time to a date close to the target
2. Reload the page
3. Hearts will lock/unlock based on the new system date

To test the surprise animation:
1. Set system time to Dec 4, 2025 at 11:59 PM Lahore time
2. Wait for the clock to strike midnight
3. Confetti and hearts should burst across the screen

## ❤️ Notes for Seemi

This countdown is designed with love, specifically for you:
- Each heart represents a day of anticipation
- Every message is handpicked and heartfelt
- The surprise animation is your personal celebration
- The starry sky represents the infinite nature of my love for you

Enjoy unlocking each message and treasure every moment leading up to your special day!

## 📝 License

This project is personal and made with love. Feel free to modify and share as needed.

---

**Created with ❤️ for the most wonderful person**
