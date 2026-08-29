# SSK Matrimonial — Frontend (Expo SDK 52)

React Native app built with Expo SDK 52.

## Install

```bash
cd frontend
npm install
```

## Payments require a development build (not Expo Go)

`react-native-razorpay` and `@stripe/stripe-react-native` ship native code, so they are
**not** present in Expo Go. In Expo Go the helpers in `src/api/payments.ts`
(`getStripeSdk()` / `getRazorpaySdk()`) resolve to `null` and the app degrades gracefully:

- Razorpay falls back to the hosted subscription page (`short_url`) via `Linking`.
- Stripe falls back to the Checkout URL (`checkout_url`) when the backend provides one.
  The native Stripe **PaymentSheet** has no hosted fallback, so in-app Stripe payments
  only work in a development/production build.

To test real in-app payment sheets, install a custom development build that bundles both
native SDKs.

### Build locally

```bash
# iOS (requires macOS + Xcode; simulator builds need no Apple Developer account,
# physical devices require one for code signing)
npx expo prebuild
npx expo run:ios

# Android (requires Android Studio / Android SDK)
npx expo run:android
```

### Build in the cloud with EAS

```bash
npm i -g eas-cli
eas login
eas build --profile development --platform ios
eas build --profile development --platform android
```

Profiles live in `eas.json`:

| Profile | Notes |
|---------|-------|
| `development` | `developmentClient: true`, internal distribution, Android APK, iOS simulator |
| `preview` | internal distribution, Android APK |
| `production` | store-ready defaults |

### Run against the dev build

```bash
npx expo start --dev-client
```

Open the **custom dev build** on the simulator/device (not Expo Go). The Razorpay and
Stripe native sheets then open in-app instead of falling back to the browser.

## Native configuration

`app.json` must keep the following for prebuild to generate valid native projects:

- `ios.bundleIdentifier`: `com.ssk.matrimonial`
- `android.package`: `com.ssk.matrimonial`
- the `@stripe/stripe-react-native` plugin block (injects the required native setup,
  including `merchantIdentifier`)

## Scripts

```bash
npm run start      # expo start
npm run android    # expo start --android
npm run ios        # expo start --ios
npm run web        # expo start --web
npm run typecheck  # tsc --noEmit
npm run lint       # eslint
```

## iOS App Store note

Per `backend/DOCS.md`, digital subscriptions sold inside an iOS app must use Apple
StoreKit / In-App Purchase. The Stripe/Razorpay flow covers Android and web; it will not
pass App Store review for iOS as-is. Tracked as a separate product decision.
