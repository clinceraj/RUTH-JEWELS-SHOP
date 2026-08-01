# Ruth Jewels owner dashboard setup

The public shop remains on GitHub Pages. Firebase stores your products, images, campaigns, and orders. The owner dashboard is at `admin.html` and is intentionally not linked in the public navigation.

## One-time secure setup

1. In Firebase Authentication, create or sign in to your own Ruth Jewels account through the website.
2. In Firebase Authentication > Users, copy that account's UID.
3. In Firestore Database > Data, create the collection `owners`.
4. Create one document whose document ID is exactly your UID. Add a simple field such as `email` with your owner email address.
5. Install the Firebase CLI, sign in, select the `jewels-by-ruth` project, then deploy the included rules:

   ```powershell
   firebase deploy --only firestore:rules,storage
   ```

6. Enable Cloud Storage in Firebase before uploading images. It requires Firebase's pay-as-you-go setup.
7. Sign in at `admin.html`. Only a UID listed in the private `owners` collection can write products, images, campaigns, or order states.

## Daily use

- Add a category before assigning it to a new product.
- Add one or more images, a description, and a rate, then publish the product.
- Create an active campaign with dates to show its message automatically on the home page.
- Update each order status as it moves from confirmation to dispatch and delivery.

## Payment automation next

This dashboard intentionally keeps the current payment state as verification pending. When the Razorpay account is ready, the payment confirmation webhook will update orders to paid and trigger invoices and emails from a secure server function.

