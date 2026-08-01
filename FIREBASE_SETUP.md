# Ruth Jewels Firebase setup

The storefront uses Firebase Authentication for customer accounts and Cloud Firestore for customer profiles and order records. It loads the Firebase browser SDK directly, so this GitHub Pages project does not need `npm install`.

## One-time console setup

1. Open the `jewels-by-ruth` project in the Firebase console.
2. Open **Authentication** → **Get started** → **Sign-in method**.
3. Enable **Email/Password** (the first switch). The email-link option is not required.
4. In **Authentication** → **Settings** → **Authorized domains**, add `clinceraj.github.io` if it is not already present.
5. Open **Firestore Database** → **Create database**.
6. Select **Production mode**, choose the closest appropriate region, and create the database.
7. Open the Firestore **Rules** tab, replace its contents with [`firestore.rules`](firestore.rules), then click **Publish**.

## What the live flow does

- A new customer is created in Firebase Authentication and receives a verification email.
- The customer's name and mobile number are stored in their own protected Firestore profile.
- Checkout generates a UPI URI and QR for the exact bag total, payee `merlinjmerlin97@okicici`, and a unique order reference.
- After the customer pays and enters the UPI transaction reference, an order is stored with `payment_verification_pending` status.
- Only the signed-in customer can read their profile and orders.

## Important payment limitation

The QR sets the requested amount, but the storefront cannot confirm settlement by itself. The entered UPI reference must be checked against the receiving bank/UPI app before an order is fulfilled. Automatic payment confirmation requires a payment gateway or merchant PSP with a server-side webhook; a personal UPI ID and static GitHub Pages site do not provide that capability.
