Symptom: Tapping the last transcript row crashes the physical iPhone app.
User impact: Agent GUI artifacts cannot be opened reliably, and unloaded media rows do not reserve their final geometry.
Source: User recording plus two physical-device crash reports from 2026-07-23 14:59.
Target surface: iOS physical device, iPhone 17 Pro Max.
Build/version/tag: commit af7664db7a, tag sagux, bundle dev.cmux.ios.sagux.
Repro workload:
1. Open the seeded Claude transcript in Agent GUI.
2. Scroll to the final artifact row.
3. Tap the row.
4. Observe the app terminate.
Expected bad behavior: The app process exits immediately after the tap.
Success criteria: Tapping any artifact row presents one stable viewer; unloaded image rows reserve the final image aspect ratio; bytes replace the placeholder without changing row height; missing or malformed metadata stays recoverable and never crashes.
