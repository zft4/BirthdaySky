# 🧪 Test Mode Quick Guide

## What's New?

Hearts now display in **descending order (7 → 1)** and you can test unlocking/animations with URL parameters!

## Test URLs (Copy & Paste)

### Local Testing
```
http://localhost:8000/?testDays=7   # All locked
http://localhost:8000/?testDays=3   # 4 unlocked, 3 locked
http://localhost:8000/?testDays=0   # All unlocked + surprise!
```

### Live GitHub Pages Testing
```
https://zft4.github.io/BirthdaySky/?testDays=7
https://zft4.github.io/BirthdaySky/?testDays=3
https://zft4.github.io/BirthdaySky/?testDays=0
```

## What Each Value Does

- **?testDays=7** → 7 days remaining (all hearts locked)
- **?testDays=6** → 6 days remaining (day 7 unlocked)
- **?testDays=5** → 5 days remaining (days 7-6 unlocked)
- **?testDays=4** → 4 days remaining (days 7-5 unlocked)
- **?testDays=3** → 3 days remaining (days 7-4 unlocked)
- **?testDays=2** → 2 days remaining (days 7-5 unlocked)
- **?testDays=1** → 1 day remaining (days 7-6 unlocked)
- **?testDays=0** → 0 days remaining (all unlocked + confetti burst!)

## Testing Checklist

- [ ] Visit with `?testDays=7` - see all hearts locked
- [ ] Visit with `?testDays=3` - see some unlocked
- [ ] Click unlocked hearts - see your messages
- [ ] Visit with `?testDays=0` - see surprise animation
- [ ] Press Esc in modal - modal closes
- [ ] Tab through hearts - keyboard works
- [ ] Remove `?testDays=X` - goes back to real timezone

## How It Works

When you add `?testDays=X` to the URL:
- The system ignores the real Lahore timezone
- Hearts unlock based on the X value you provide
- Everything else works normally (animations, messages, keyboard)
- Remove the parameter to go back to real dates

## Browser Console Debug

Open DevTools (F12) and check Console tab:

```javascript
getDaysRemainingInLahore()  // Returns test value or real days
getTestDaysOverride()       // Returns the ?testDays parameter value
```

## Performance Notes

- Test mode works on both local and GitHub Pages
- No performance impact
- Safe to use anytime
- Won't affect the real date-based unlocking

## Quick Troubleshooting

**Hearts not showing in order?**
- Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+F5 (Windows)

**Surprise animation not showing with testDays=0?**
- Check browser console for any JavaScript errors
- Make sure you're at `testDays=0` (not `testDays=1`)

**Test mode not working?**
- Make sure the `?testDays=` parameter is in the URL
- Use `?testDays=3` instead of `?test=3`
- Refresh the page after changing the parameter

---

**Ready to test! Try `http://localhost:8000/?testDays=0` to see the full experience.** 🎉
