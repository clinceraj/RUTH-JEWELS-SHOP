Exit code: 0
Wall time: 0.1 seconds
Output:
import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updateProfile, sendEmailVerification, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js';
import { getFirestore, doc, setDoc, getDoc, collection, addDoc, getDocs, query, where, serverTimestamp } from 'https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js';

const firebaseConfig = {
  apiKey: 'AIzaSyDGVCWdlr8Z9DSAA7_IF72X_x6jdmB0Nuo',
  authDomain: 'jewels-by-ruth.firebaseapp.com',
  projectId: 'jewels-by-ruth',
  storageBucket: 'jewels-by-ruth.firebasestorage.app',
  messagingSenderId: '1031026618144',
  appId: '1:1031026618144:web:8199631a64d0e4e836b145',
  measurementId: 'G-Y37HFKTVG9'
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const store = window.RuthJewelsStore;
const upiConfig = { payeeAddress:'merlinjmerlin97@okicici', payeeName:'Ruth Jewels' };

const escapeHtml = value => String(value ?? '').replace(/[&<>'"]/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[character]));
const returnDestination = () => {
  const returnTo = new URLSearchParams(location.search).get('return');
  return returnTo && /^[a-z0-9-]+\.html$/i.test(returnTo) ? returnTo : 'account-overview.html';
};
const formMessage = (form, message, isError=false) => { let node = form.querySelector('[data-form-message]'); if (!node) { node = document.createElement('p'); node.dataset.formMessage = ''; node.className = 'form-message'; form.append(node); } node.textContent = message; node.classList.toggle('is-error', isError); };
const friendlyError = error => {
  const messages = {
    'auth/email-already-in-use':'An account already exists for this email address.',
    'auth/invalid-credential':'The email address or password is incorrect.',
    'auth/invalid-email':'Enter a valid email address.',
    'auth/operation-not-allowed':'Email and password sign-in has not been enabled in Firebase yet.',
    'auth/weak-password':'Choose a stronger password with at least eight characters.',
    'auth/too-many-requests':'Too many attempts. Please wait and try again.',
    'permission-denied':'Firebase security rules are not yet configured for this action.'
  };
  return messages[error?.code] || messages[error?.message] || 'Something went wrong. Please try again.';
};

async function createAccount(form) {
  const data = new FormData(form);
  const button = form.querySelector('button[type="submit"]');
  button.disabled = true;
  formMessage(form, 'Creating your secure accountâ€¦');
  try {
    const credential = await createUserWithEmailAndPassword(auth, data.get('email').trim(), data.get('password'));
    const fullName = `${data.get('firstName').trim()} ${data.get('lastName').trim()}`.trim();
    await updateProfile(credential.user, { displayName:fullName });
    sendEmailVerification(credential.user).catch(() => {});
    try {
      await setDoc(doc(db, 'users', credential.user.uid), {
        uid:credential.user.uid,
        firstName:data.get('firstName').trim(),
        lastName:data.get('lastName').trim(),
        fullName,
        email:credential.user.email,
        mobile:data.get('mobile').trim(),
        createdAt:serverTimestamp(),
        updatedAt:serverTimestamp()
      });
    } catch (profileError) {
      formMessage(form, 'Your account was created, but the customer profile could not be saved until Firestore rules are published.', true);
      setTimeout(() => { location.href = returnDestination(); }, 1800);
      return;
    }
    location.href = returnDestination();
  } catch (error) {
    formMessage(form, friendlyError(error), true);
    button.disabled = false;
  }
}

async function signInAccount(form) {
  const data = new FormData(form);
  const button = form.querySelector('button[type="submit"]');
  button.disabled = true;
  formMessage(form, 'Signing you inâ€¦');
  try {
    await signInWithEmailAndPassword(auth, data.get('email').trim(), data.get('password'));
    location.href = returnDestination();
  } catch (error) {
    formMessage(form, friendlyError(error), true);
    button.disabled = false;
  }
}

async function loadPublishedProducts() {
  try {
    const snapshot = await getDocs(query(collection(db, 'products'), where('status', '==', 'published')));
    const liveProducts = snapshot.docs.map(product => ({ id:product.id, ...product.data() }));
    if (liveProducts.length) store?.replaceProducts(liveProducts);
  } catch (error) {
    // The curated local collection remains visible until Firestore rules and products are configured.
  }
}

async function loadActiveCampaign() {
  const root = document.querySelector('[data-live-campaign]');
  if (!root) return;
  try {
    const snapshot = await getDocs(query(collection(db, 'campaigns'), where('status', '==', 'active')));
    const now = Date.now();
    const campaign = snapshot.docs.map(item => ({ id:item.id, ...item.data() })).find(item => {
      const start = item.startsAt ? new Date(item.startsAt).getTime() : -Infinity;
      const end = item.endsAt ? new Date(`${item.endsAt}T23:59:59`).getTime() : Infinity;
      return start <= now && now <= end;
    });
    if (!campaign) return;
    const destination = /^[a-z0-9-]+\.html(\?.*)?$/i.test(campaign.link || '') ? campaign.link : 'collections.html';
    root.innerHTML = `<div><p class="eyebrow">${escapeHtml(campaign.label || 'Ruth Jewels event')}</p><h2>${escapeHtml(campaign.title || 'A special Ruth edit')}</h2><p>${escapeHtml(campaign.message || '')}</p></div><a class="button button--secondary" href="${escapeHtml(destination)}">${escapeHtml(campaign.cta || 'Explore now')}</a>`;
    root.hidden = false;
  } catch (error) {
    // A campaign is optional. The storefront remains fully usable when no campaign is active.
  }
}

function upiReference() {
  let reference = sessionStorage.getItem('ruth-jewels-order-reference');
  if (!reference) {
    reference = `RJ${Date.now()}`.slice(0,35);
    sessionStorage.setItem('ruth-jewels-order-reference', reference);
  }
  return reference;
}

function renderUpiPayment(user) {
  const root = document.querySelector('[data-upi-payment]');
  const submit = document.querySelector('[data-checkout-submit]');
  if (!root) return;
  const total = store?.cartTotal() || 0;
  if (!user) {
    root.innerHTML = '<div class="payment-gate"><h3>Sign in before payment</h3><p>Your account securely connects this payment reference to your order.</p><a class="button button--primary" href="account.html?return=checkout.html">Sign in to continue</a><a class="text-link" href="create-account.html?return=checkout.html">Create an account â†’</a></div>';
    if (submit) submit.disabled = true;
    return;
  }
  if (!total) {
    root.innerHTML = '<div class="payment-gate"><h3>Your shopping bag is empty</h3><a class="button button--primary" href="collections.html">Shop jewellery</a></div>';
    if (submit) submit.disabled = true;
    return;
  }
  const reference = upiReference();
  const parameters = new URLSearchParams({ pa:upiConfig.payeeAddress, pn:upiConfig.payeeName, tr:reference, tn:`Ruth Jewels order ${reference}`, am:total.toFixed(2), cu:'INR' });
  const paymentUrl = `upi://pay?${parameters.toString()}`;
  root.innerHTML = `<div class="upi-card"><p class="eyebrow">UPI payment</p><h3>Scan to pay ${store.money(total)}</h3><div class="upi-qr" data-upi-qr aria-label="UPI QR for ${store.money(total)}"></div><dl><div><dt>Payee</dt><dd>${escapeHtml(upiConfig.payeeName)}</dd></div><div><dt>UPI ID</dt><dd>${escapeHtml(upiConfig.payeeAddress)}</dd></div><div><dt>Order reference</dt><dd>${escapeHtml(reference)}</dd></div></dl><a class="button button--primary upi-open" href="${paymentUrl}">Pay ${store.money(total)} with any UPI app</a><p class="upi-note">After payment, return here and enter the UPI transaction/reference number below. Payment remains pending until Ruth Jewels verifies receipt.</p></div>`;
  const qrNode = root.querySelector('[data-upi-qr]');
  if (window.QRCode && qrNode) new window.QRCode(qrNode, { text:paymentUrl, width:220, height:220, colorDark:'#261318', colorLight:'#fffaf5', correctLevel:window.QRCode.CorrectLevel.M });
  if (submit) submit.disabled = false;
}

async function submitOrder(form, user) {
  if (!user) { formMessage(form, 'Sign in before submitting your order.', true); return; }
  const cart = store?.getCart() || [];
  if (!cart.length) { formMessage(form, 'Add jewellery to your bag before checkout.', true); return; }
  const data = new FormData(form);
  const transactionReference = data.get('upiTransactionReference').trim();
  if (transactionReference.length < 8) { formMessage(form, 'Enter the UPI transaction/reference number shown by your payment app.', true); return; }
  const button = form.querySelector('[data-checkout-submit]');
  button.disabled = true;
  formMessage(form, 'Saving your order for payment verificationâ€¦');
  try {
    const items = cart.map(item => { const product = store.findProduct(item.id); return { productId:item.id, name:product?.name || item.id, quantity:item.quantity, unitPrice:product?.price || 0, lineTotal:(product?.price || 0) * item.quantity }; });
    const order = {
      userId:user.uid,
      customerEmail:user.email,
      orderReference:upiReference(),
      items,
      subtotal:store.cartTotal(),
      deliveryFee:0,
      total:store.cartTotal(),
      currency:'INR',
      delivery:{ firstName:data.get('firstName').trim(), lastName:data.get('lastName').trim(), address:data.get('address').trim(), city:data.get('city').trim(), pinCode:data.get('pinCode').trim(), state:data.get('state').trim(), mobile:data.get('mobile').trim() },
      payment:{ method:'UPI', payeeAddress:upiConfig.payeeAddress, transactionReference, status:'pending_verification' },
      status:'payment_verification_pending',
      createdAt:serverTimestamp(),
      updatedAt:serverTimestamp()
    };
    const orderDocument = await addDoc(collection(db, 'orders'), order);
    store.clearCart();
    sessionStorage.removeItem('ruth-jewels-order-reference');
    form.innerHTML = `<div class="order-confirmation"><p class="eyebrow">Order received</p><h2>Payment verification pending.</h2><p>Your order reference is <strong>${escapeHtml(order.orderReference)}</strong>. We will review the UPI transaction before confirming your order.</p><a class="button button--primary" href="account-overview.html">View account overview</a></div>`;
    const summary = document.querySelector('[data-checkout-summary]');
    if (summary) summary.innerHTML = `<h2>Order saved</h2><p>Record: ${escapeHtml(orderDocument.id)}</p><p>UPI reference: ${escapeHtml(transactionReference)}</p>`;
  } catch (error) {
    formMessage(form, friendlyError(error), true);
    button.disabled = false;
  }
}

async function renderAccountOverview(user) {
  const root = document.querySelector('[data-account-overview]');
  if (!root) return;
  if (!user) {
    root.innerHTML = '<div class="account-empty"><h1>Sign in to view your account.</h1><a class="button button--primary" href="account.html">Sign in</a></div>';
    return;
  }
  try {
    const profileSnapshot = await getDoc(doc(db, 'users', user.uid));
    const profile = profileSnapshot.exists() ? profileSnapshot.data() : {};
    const orderSnapshot = await getDocs(query(collection(db, 'orders'), where('userId', '==', user.uid)));
    const orders = orderSnapshot.docs.map(order => ({ id:order.id, ...order.data() })).sort((a,b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
    root.innerHTML = `<section class="overview-heading"><div><p class="eyebrow">Ruth Jewels account</p><h1>Welcome, ${escapeHtml(profile.firstName || user.displayName?.split(' ')[0] || 'there')}.</h1><p>${escapeHtml(user.email)}</p></div><button class="button button--secondary" type="button" data-sign-out>Sign out</button></section><section class="overview-grid"><article><span>01</span><h2>Your profile</h2><p>${escapeHtml(profile.fullName || user.displayName || '')}</p><p>${escapeHtml(profile.mobile || 'Mobile number not added')}</p></article><article><span>02</span><h2>Shopping bag</h2><p>${store?.getCart().reduce((sum,item)=>sum+item.quantity,0) || 0} pieces currently selected</p><a class="text-link" href="cart.html">View shopping bag â†’</a></article><article><span>03</span><h2>Order history</h2><p>${orders.length} ${orders.length === 1 ? 'order' : 'orders'} recorded</p></article></section><section class="order-history"><div class="section-heading"><div><p class="eyebrow">Your orders</p><h2>Order history</h2></div><a class="button button--primary" href="collections.html">Continue shopping</a></div>${orders.length ? orders.map(order => `<article class="order-record"><div><span>${escapeHtml(order.orderReference || order.id)}</span><h3>${escapeHtml(order.status || 'Order received').replaceAll('_',' ')}</h3></div><strong>${store.money(order.total || 0)}</strong><p>${order.items?.map(item => `${item.quantity} Ã— ${escapeHtml(item.name)}`).join(', ') || ''}</p></article>`).join('') : '<div class="empty-state"><h3>No orders yet.</h3><p>Your completed checkout requests will appear here.</p></div>'}</section>`;
    root.querySelector('[data-sign-out]')?.addEventListener('click', async () => { await signOut(auth); location.href='account.html'; });
  } catch (error) {
    root.innerHTML = `<div class="account-empty"><h1>Account setup needs attention.</h1><p>${escapeHtml(friendlyError(error))}</p></div>`;
  }
}

document.querySelector('[data-create-account-form]')?.addEventListener('submit', event => { event.preventDefault(); createAccount(event.currentTarget); });
document.querySelector('[data-account-form]')?.addEventListener('submit', event => { event.preventDefault(); signInAccount(event.currentTarget); });

loadPublishedProducts();
loadActiveCampaign();

onAuthStateChanged(auth, user => {
  renderAccountOverview(user);
  renderUpiPayment(user);
  const checkoutForm = document.querySelector('[data-checkout-form]');
  if (checkoutForm && user) {
    const email = checkoutForm.elements.email;
    if (email && !email.value) email.value = user.email || '';
    checkoutForm.onsubmit = event => { event.preventDefault(); submitOrder(checkoutForm, user); };
  }
});

export { app, auth, db, escapeHtml, friendlyError };

