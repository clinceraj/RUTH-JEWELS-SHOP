import { onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js';
import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, serverTimestamp, setDoc, updateDoc } from 'https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js';
import { getStorage, getDownloadURL, ref, uploadBytesResumable } from 'https://www.gstatic.com/firebasejs/12.16.0/firebase-storage.js';
import { auth, db, escapeHtml } from './firebase-client.js';

const root = document.querySelector('[data-admin-root]');
const storage = getStorage();
const state = { user:null, products:[], categories:[], campaigns:[], orders:[], siteContent:{ home:{}, checkout:{} }, editingProductId:null, existingImages:[] };

const titleCase = value => String(value || '').replaceAll('_', ' ').replace(/\b\w/g, letter => letter.toUpperCase());
const money = value => new Intl.NumberFormat('en-IN', { style:'currency', currency:'INR', maximumFractionDigits:0 }).format(Number(value || 0));
const safeDate = value => value ? new Date(value).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' }) : 'No end date';
const slug = value => String(value || 'piece').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'piece';
const byName = (left, right) => String(left.name || left.title || '').localeCompare(String(right.name || right.title || ''));

const pageContentDefaults = {
  home: {
    mark:'Ruth Jewels · The occasion edit',
    eyebrow:'Hand-picked for every celebration',
    titleLineOne:'JEWELS THAT',
    titleLineTwo:'EMPOWER EVERY STORY',
    intro:'Hand-picked fashion jewellery for bridal rituals, festive evenings, and the everyday celebrations in between.',
    primaryLabel:'Shop the collection',
    primaryLink:'collections.html',
    secondaryLabel:'Explore temple jewellery',
    secondaryLink:'collections.html?category=Temple+Necklaces',
    proofOne:'Bridal and temple edits',
    proofTwo:'Delivery across India',
    captionLabel:'Selected with intention',
    captionTitle:'The occasion edit',
    captionLinkLabel:'View the collection',
    captionLink:'collections.html'
  },
  checkout: {
    announcement:'Gift-ready packaging · Delivery across India · Wedding and festive edits',
    eyebrow:'Secure checkout',
    title:'Delivery and UPI payment.',
    deliveryTitle:'Contact and delivery',
    paymentTitle:'UPI payment',
    paymentNote:'The QR contains your exact shopping-bag total and a unique Ruth Jewels order reference. Payment is confirmed only after manual verification.',
    submitLabel:'Submit order for payment verification'
  }
};

const pageLink = (value, fallback) => /^[a-z0-9-]+\.html(?:\?[a-zA-Z0-9%&=+_.-]+)?$/i.test(String(value || '')) ? value : fallback;
const editorInput = (label, name, value, placeholder='') => '<label>' + label + '<input name="' + name + '" required value="' + escapeHtml(value || '') + '" placeholder="' + escapeHtml(placeholder) + '"></label>';
const editorTextArea = (label, name, value, placeholder='') => '<label>' + label + '<textarea name="' + name + '" required rows="3" placeholder="' + escapeHtml(placeholder) + '">' + escapeHtml(value || '') + '</textarea></label>';

function homeEditorTemplate() {
  const copy = { ...pageContentDefaults.home, ...(state.siteContent.home || {}) };
  return '<section class="admin-section admin-page-editor" id="home-page"><div class="section-heading"><div><p class="eyebrow">Home page editor</p><h2>Shape the first impression.</h2></div><p>Update the home-page wording, buttons, and image caption. Save to publish your changes.</p></div><form class="admin-form" data-page-content-form data-page="home"><div class="form-row">' +
    editorInput('Top label', 'mark', copy.mark, 'Ruth Jewels · The occasion edit') +
    editorInput('Small headline', 'eyebrow', copy.eyebrow, 'Hand-picked for every celebration') +
    '</div><div class="form-row">' +
    editorInput('Headline — line one', 'titleLineOne', copy.titleLineOne, 'JEWELS THAT') +
    editorInput('Headline — line two', 'titleLineTwo', copy.titleLineTwo, 'EMPOWER EVERY STORY') +
    '</div>' +
    editorTextArea('Introduction', 'intro', copy.intro, 'A short introduction for your home page.') +
    '<div class="form-row">' +
    editorInput('Primary button label', 'primaryLabel', copy.primaryLabel, 'Shop the collection') +
    editorInput('Primary button link', 'primaryLink', copy.primaryLink, 'collections.html') +
    '</div><div class="form-row">' +
    editorInput('Second button label', 'secondaryLabel', copy.secondaryLabel, 'Explore temple jewellery') +
    editorInput('Second button link', 'secondaryLink', copy.secondaryLink, 'collections.html?category=Temple+Necklaces') +
    '</div><div class="form-row">' +
    editorInput('Trust note one', 'proofOne', copy.proofOne, 'Bridal and temple edits') +
    editorInput('Trust note two', 'proofTwo', copy.proofTwo, 'Delivery across India') +
    '</div><div class="form-row">' +
    editorInput('Image caption label', 'captionLabel', copy.captionLabel, 'Selected with intention') +
    editorInput('Image caption title', 'captionTitle', copy.captionTitle, 'The occasion edit') +
    '</div><div class="form-row">' +
    editorInput('Image caption button', 'captionLinkLabel', copy.captionLinkLabel, 'View the collection') +
    editorInput('Image caption link', 'captionLink', copy.captionLink, 'collections.html') +
    '</div><p class="admin-form-note">Links must be a page in this shop, for example <code>collections.html</code>.</p><div class="admin-form-actions"><button class="button button--primary" type="submit">Save home page changes</button><a class="button button--secondary" href="index.html" target="_blank" rel="noopener">Preview home page</a></div><p data-home-message class="form-message" hidden></p></form></section>';
}

function checkoutEditorTemplate() {
  const copy = { ...pageContentDefaults.checkout, ...(state.siteContent.checkout || {}) };
  return '<section class="admin-section admin-page-editor" id="checkout-page"><div class="section-heading"><div><p class="eyebrow">Checkout page editor</p><h2>Keep checkout clear.</h2></div><p>Edit the customer-facing headings and payment guidance without changing the secure order fields.</p></div><form class="admin-form" data-page-content-form data-page="checkout">' +
    editorTextArea('Top announcement', 'announcement', copy.announcement, 'Delivery and packaging promise') +
    '<div class="form-row">' +
    editorInput('Small headline', 'eyebrow', copy.eyebrow, 'Secure checkout') +
    editorInput('Main headline', 'title', copy.title, 'Delivery and UPI payment.') +
    '</div><div class="form-row">' +
    editorInput('Delivery section heading', 'deliveryTitle', copy.deliveryTitle, 'Contact and delivery') +
    editorInput('Payment section heading', 'paymentTitle', copy.paymentTitle, 'UPI payment') +
    '</div>' +
    editorTextArea('Payment guidance', 'paymentNote', copy.paymentNote, 'Explain the payment process clearly.') +
    editorInput('Order button label', 'submitLabel', copy.submitLabel, 'Submit order for payment verification') +
    '<div class="admin-form-actions"><button class="button button--primary" type="submit">Save checkout changes</button><a class="button button--secondary" href="checkout.html" target="_blank" rel="noopener">Preview checkout page</a></div><p data-checkout-message class="form-message" hidden></p></form></section>';
}

function decorateDashboard() {
  const heading = root.querySelector('.admin-heading');
  if (!heading || root.querySelector('.admin-workspace')) return;
  const workspace = document.createElement('div');
  workspace.className = 'admin-workspace';
  const sidebar = document.createElement('aside');
  sidebar.className = 'admin-sidebar';
  sidebar.innerHTML = '<p class="eyebrow">Owner studio</p><strong>Ruth <small>Jewels</small></strong><nav aria-label="Owner dashboard sections"><a href="#overview">Overview</a><a href="#products">Products</a><a href="#categories">Categories</a><a href="#campaigns">Events &amp; offers</a><a href="#orders">Orders</a><a href="#home-page">Edit home page</a><a href="#checkout-page">Edit checkout</a></nav><div class="admin-sidebar-preview"><span>Customer view</span><a href="index.html" target="_blank" rel="noopener">Home page</a><a href="collections.html" target="_blank" rel="noopener">Collections</a><a href="checkout.html" target="_blank" rel="noopener">Checkout</a></div>';
  const main = document.createElement('div');
  main.className = 'admin-main';
  [...root.children].forEach(node => main.append(node));
  main.querySelector('.admin-nav')?.remove();
  main.querySelector('.admin-heading')?.setAttribute('id', 'overview');
  const orders = main.querySelector('#orders');
  if (orders) orders.insertAdjacentHTML('beforebegin', homeEditorTemplate() + checkoutEditorTemplate());
  workspace.append(sidebar, main);
  root.append(workspace);
}

async function submitPageContent(form) {
  const page = form.dataset.page;
  const defaults = pageContentDefaults[page];
  if (!defaults) return;
  const data = new FormData(form);
  const button = form.querySelector('button[type="submit"]');
  const payload = {};
  Object.keys(defaults).forEach(key => { payload[key] = String(data.get(key) || '').trim() || defaults[key]; });
  Object.keys(payload).filter(key => key.toLowerCase().includes('link')).forEach(key => { payload[key] = pageLink(payload[key], defaults[key]); });
  button.disabled = true;
  button.textContent = 'Saving…';
  try {
    await setDoc(doc(db, 'siteContent', page), { ...payload, updatedAt:serverTimestamp() }, { merge:true });
    state.siteContent[page] = payload;
    message('[data-' + page + '-message]', 'Saved. Refresh the customer page to see your live changes.');
    button.textContent = page === 'home' ? 'Save home page changes' : 'Save checkout changes';
    button.disabled = false;
  } catch (error) {
    message('[data-' + page + '-message]', error.message || 'The page changes could not be saved. Publish the latest Firestore rules, then try again.', true);
    button.textContent = page === 'home' ? 'Save home page changes' : 'Save checkout changes';
    button.disabled = false;
  }
}

function loginTemplate() {
  return `<section class="admin-gate"><p class="eyebrow">Ruth Jewels owner dashboard</p><h1>Manage the shop from one place.</h1><p>Sign in with your owner account to manage products, images, categories, offers, and customer orders.</p><a class="button button--primary" href="account.html?return=admin.html">Sign in to the dashboard</a><a class="text-link" href="create-account.html?return=admin.html">Create owner account</a></section>`;
}

function setupTemplate(user, message='') {
  return `<section class="admin-gate admin-gate--setup"><p class="eyebrow">One-time security step</p><h1>Approve this owner account.</h1><p>Sign-in worked. Add this UID as a document ID in the private <code>Owners</code> Firestore collection, then deploy the included security rules. This ensures nobody else can manage your shop.</p><div class="owner-uid"><span>Your UID</span><code>${escapeHtml(user.uid)}</code><button class="button button--secondary" type="button" data-copy-uid>Copy UID</button></div>${message ? `<p class="form-message is-error">${escapeHtml(message)}</p>` : ''}<p class="admin-help">The exact one-time steps are in <a class="text-link" href="OWNER_SETUP.md" target="_blank" rel="noopener">OWNER_SETUP.md</a>.</p><button class="button button--primary" type="button" data-recheck-owner>I've completed the setup</button><button class="text-button" type="button" data-owner-sign-out>Sign out</button></section>`;
}

function dashboardTemplate() {
  const categories = [...new Map([...state.categories, ...state.products.map(product => ({ name:product.category, status:'active' }))].filter(item => item.name).map(item => [item.name, item])).values()].sort(byName);
  const productRows = state.products.sort(byName).map(product => `<article class="admin-record"><img src="${escapeHtml(product.image || product.images?.[0] || 'assets/ruth-jewels-editorial-hero.jpg')}" alt=""><div><span>${escapeHtml(product.category || 'Uncategorised')} Â· ${escapeHtml(product.status || 'draft')}</span><h3>${escapeHtml(product.name)}</h3><p>${money(product.price)}</p></div><div class="admin-record-actions"><button class="text-link" type="button" data-edit-product="${escapeHtml(product.id)}">Edit</button><button class="text-link text-link--danger" type="button" data-delete-product="${escapeHtml(product.id)}">Remove</button></div></article>`).join('') || '<p class="admin-empty">No products yet. Add your first hand-picked piece above.</p>';
  const campaignRows = state.campaigns.sort(byName).map(campaign => `<article class="admin-record admin-record--compact"><div><span>${escapeHtml(campaign.status || 'draft')} Â· ends ${escapeHtml(safeDate(campaign.endsAt))}</span><h3>${escapeHtml(campaign.title)}</h3><p>${escapeHtml(campaign.message || '')}</p></div><div class="admin-record-actions"><button class="text-link text-link--danger" type="button" data-delete-campaign="${escapeHtml(campaign.id)}">Remove</button></div></article>`).join('') || '<p class="admin-empty">No events or offers created yet.</p>';
  const orderRows = state.orders.map(order => `<article class="admin-order"><div><span>${escapeHtml(order.orderReference || order.id)}</span><h3>${escapeHtml(order.delivery?.firstName || 'Customer')} Â· ${money(order.total)}</h3><p>${escapeHtml(order.customerEmail || '')}</p></div><div><label>Status<select data-order-status="${escapeHtml(order.id)}"><option ${order.status === 'payment_verification_pending' ? 'selected':''} value="payment_verification_pending">Payment verification pending</option><option ${order.status === 'payment_confirmed' ? 'selected':''} value="payment_confirmed">Payment confirmed</option><option ${order.status === 'preparing_order' ? 'selected':''} value="preparing_order">Preparing order</option><option ${order.status === 'dispatched' ? 'selected':''} value="dispatched">Dispatched</option><option ${order.status === 'delivered' ? 'selected':''} value="delivered">Delivered</option><option ${order.status === 'cancelled' ? 'selected':''} value="cancelled">Cancelled</option></select></label></div></article>`).join('') || '<p class="admin-empty">Orders will appear here when customers check out.</p>';
  const categoryOptions = categories.map(category => `<option value="${escapeHtml(category.name)}">${escapeHtml(category.name)}</option>`).join('');
  return `<section class="admin-heading"><div><p class="eyebrow">Owner dashboard</p><h1>Good to see you.</h1><p>${escapeHtml(state.user.email || 'Owner account')}</p></div><div class="admin-heading-actions"><button class="button button--secondary" type="button" data-install-owner-app>Install app</button><a class="button button--secondary" href="index.html" target="_blank" rel="noopener">View shop</a><button class="text-button" type="button" data-owner-sign-out>Sign out</button></div></section>
  <nav class="admin-nav" aria-label="Owner dashboard"><a href="#products">Products</a><a href="#categories">Categories</a><a href="#campaigns">Events & offers</a><a href="#orders">Orders</a></nav>
  <section class="admin-stats"><article><span>Published products</span><strong>${state.products.filter(product => product.status === 'published').length}</strong></article><article><span>Categories</span><strong>${categories.length}</strong></article><article><span>Orders</span><strong>${state.orders.length}</strong></article></section>
  <section class="admin-section" id="products"><div class="section-heading"><div><p class="eyebrow">Products</p><h2>${state.editingProductId ? 'Edit your piece' : 'Add a new piece'}</h2></div><p>Photos, description, rate, category, and visibility all in one place.</p></div>${state.products.length ? '' : '<div class="admin-import"><div><strong>Bring in your current catalogue</strong><p>Import the pieces already displayed on the shop once. Afterwards, all product changes happen here.</p></div><button class="button button--secondary" type="button" data-import-catalogue>Import current catalogue</button></div>'}
    <form class="admin-form" data-product-form><input type="hidden" name="editingProductId" value="${escapeHtml(state.editingProductId || '')}"><div class="form-row"><label>Name<input name="name" required placeholder="Product name"></label><label>Category<select name="category" required><option value="">Choose a category</option>${categoryOptions}</select></label></div><div class="form-row"><label>Rate in â‚¹<input name="price" required min="1" step="1" type="number" placeholder="1500"></label><label>Label<input name="tag" placeholder="New arrival, Bestseller, Ruth edit"></label></div><label>Description<textarea name="description" required rows="4" placeholder="Describe the piece, how it feels, and the occasion it suits."></textarea></label><div class="form-row"><label>Finish note<input name="finish" placeholder="Example: Antique-tone finish"></label><label>Styling note<input name="styling" placeholder="Example: Pair with silk sarees"></label></div><div class="form-row"><label>Publish state<select name="status"><option value="published">Published â€” visible to customers</option><option value="draft">Draft â€” visible only here</option></select></label><label>Product images<input name="images" accept="image/jpeg,image/png,image/webp" multiple type="file"></label></div><p class="admin-form-note">Add at least one image for a new product. On edits, new images are added to the existing gallery.</p><div class="admin-form-actions"><button class="button button--primary" type="submit">${state.editingProductId ? 'Save product changes' : 'Publish product'}</button>${state.editingProductId ? '<button class="button button--secondary" data-cancel-edit type="button">Cancel edit</button>' : ''}</div><p data-product-message class="form-message" hidden></p></form>
    <div class="admin-list">${productRows}</div>
  </section>
  <section class="admin-section" id="categories"><div class="section-heading"><div><p class="eyebrow">Categories</p><h2>Keep your shop easy to browse.</h2></div><p>Create a category once, then select it whenever you add a product.</p></div><form class="admin-inline-form" data-category-form><label>New category<input name="name" required placeholder="Example: Everyday Pieces"></label><button class="button button--primary" type="submit">Add category</button><p data-category-message class="form-message" hidden></p></form><div class="admin-chips">${categories.map(category => `<span>${escapeHtml(category.name)}${state.categories.some(item => item.id === category.id) ? `<button aria-label="Remove ${escapeHtml(category.name)}" data-delete-category="${escapeHtml(category.id)}" type="button">Ã—</button>` : ''}</span>`).join('')}</div></section>
  <section class="admin-section" id="campaigns"><div class="section-heading"><div><p class="eyebrow">Events & offers</p><h2>Give each moment its own spotlight.</h2></div><p>An active event appears on the home page only between its selected dates.</p></div><form class="admin-form admin-form--campaign" data-campaign-form><div class="form-row"><label>Event or offer title<input name="title" required placeholder="Festival edit"></label><label>Small label<input name="label" placeholder="New from Ruth"></label></div><label>Message<textarea name="message" required rows="3" placeholder="A short message customers will see on the home page."></textarea></label><div class="form-row"><label>Starts<input name="startsAt" type="date"></label><label>Ends<input name="endsAt" type="date"></label></div><div class="form-row"><label>Button label<input name="cta" placeholder="Explore now"></label><label>Button link<input name="link" placeholder="collections.html"></label></div><label>State<select name="status"><option value="active">Active</option><option value="draft">Draft</option></select></label><div class="admin-form-actions"><button class="button button--primary" type="submit">Save event or offer</button></div><p data-campaign-message class="form-message" hidden></p></form><div class="admin-list">${campaignRows}</div></section>
  <section class="admin-section" id="orders"><div class="section-heading"><div><p class="eyebrow">Orders</p><h2>Keep every customer in the loop.</h2></div><p>Payment confirmation and invoice emails will become automatic when the secure payment connection is enabled.</p></div><div class="admin-orders">${orderRows}</div></section>`;
}

function message(selector, value, isError=false) {
  const node = root.querySelector(selector);
  if (!node) return;
  node.textContent = value;
  node.hidden = false;
  node.classList.toggle('is-error', isError);
}

async function uploadImages(files, productName) {
  const uploads = [...files].map((file, index) => new Promise((resolve, reject) => {
    const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const imageRef = ref(storage, `products/${slug(productName)}/${Date.now()}-${index}.${extension}`);
    const task = uploadBytesResumable(imageRef, file, { contentType:file.type });
    task.on('state_changed', undefined, reject, async () => resolve(await getDownloadURL(task.snapshot.ref)));
  }));
  return Promise.all(uploads);
}

async function refreshDashboard() {
  const [products, categories, campaigns, orders, homeContent, checkoutContent] = await Promise.all([
    getDocs(collection(db, 'products')),
    getDocs(collection(db, 'categories')),
    getDocs(collection(db, 'campaigns')),
    getDocs(collection(db, 'orders')),
    getDoc(doc(db, 'siteContent', 'home')).catch(() => null),
    getDoc(doc(db, 'siteContent', 'checkout')).catch(() => null)
  ]);
  state.products = products.docs.map(item => ({ id:item.id, ...item.data() }));
  state.categories = categories.docs.map(item => ({ id:item.id, ...item.data() }));
  state.campaigns = campaigns.docs.map(item => ({ id:item.id, ...item.data() }));
  state.orders = orders.docs.map(item => ({ id:item.id, ...item.data() }));
  state.siteContent = {
    home:homeContent?.exists() ? homeContent.data() : {},
    checkout:checkoutContent?.exists() ? checkoutContent.data() : {}
  };
  root.innerHTML = dashboardTemplate();
  decorateDashboard();
}

async function submitProduct(form) {
  const data = new FormData(form);
  const productName = data.get('name').trim();
  const editingId = data.get('editingProductId');
  const submit = form.querySelector('[type="submit"]');
  submit.disabled = true;
  message('[data-product-message]', 'Uploading images and saving your productâ€¦');
  try {
    const uploads = data.getAll('images').filter(file => file && file.size);
    const newImages = uploads.length ? await uploadImages(uploads, productName) : [];
    const previous = editingId ? state.existingImages : [];
    const images = [...previous, ...newImages];
    if (!images.length) throw new Error('Add at least one product image before publishing.');
    const record = { name:productName, category:data.get('category').trim(), price:Number(data.get('price')), tag:data.get('tag').trim() || 'Ruth edit', description:data.get('description').trim(), finish:data.get('finish').trim() || 'Selected finish', styling:data.get('styling').trim() || 'Chosen for your occasion.', image:images[0], images, status:data.get('status'), updatedAt:serverTimestamp() };
    if (editingId) await updateDoc(doc(db, 'products', editingId), record);
    else await addDoc(collection(db, 'products'), { ...record, createdAt:serverTimestamp() });
    state.editingProductId = null; state.existingImages = [];
    await refreshDashboard();
  } catch (error) {
    message('[data-product-message]', error.message || 'Product could not be saved. Check your owner access and image setup.', true);
    submit.disabled = false;
  }
}

async function submitCategory(form) {
  const name = new FormData(form).get('name').trim();
  try {
    if (state.categories.some(category => category.name.toLowerCase() === name.toLowerCase())) throw new Error('That category already exists.');
    await addDoc(collection(db, 'categories'), { name, status:'active', createdAt:serverTimestamp(), updatedAt:serverTimestamp() });
    await refreshDashboard();
  } catch (error) { message('[data-category-message]', error.message || 'Category could not be added.', true); }
}

async function submitCampaign(form) {
  const data = new FormData(form);
  try {
    const status = data.get('status');
    if (status === 'active') await Promise.all(state.campaigns.filter(campaign => campaign.status === 'active').map(campaign => updateDoc(doc(db, 'campaigns', campaign.id), { status:'draft', updatedAt:serverTimestamp() })));
    await addDoc(collection(db, 'campaigns'), { title:data.get('title').trim(), label:data.get('label').trim() || 'Ruth Jewels event', message:data.get('message').trim(), startsAt:data.get('startsAt') || '', endsAt:data.get('endsAt') || '', cta:data.get('cta').trim() || 'Explore now', link:data.get('link').trim() || 'collections.html', status, createdAt:serverTimestamp(), updatedAt:serverTimestamp() });
    await refreshDashboard();
  } catch (error) { message('[data-campaign-message]', error.message || 'Event could not be saved.', true); }
}

async function importCurrentCatalogue() {
  const button = root.querySelector('[data-import-catalogue]');
  if (button) { button.disabled = true; button.textContent = 'Importingâ€¦'; }
  try {
    const currentProducts = window.RuthJewelsStore?.products || [];
    for (const product of currentProducts) {
      const target = doc(db, 'products', product.id);
      const existing = await getDoc(target);
      if (existing.exists()) continue;
      await setDoc(target, { name:product.name, category:product.category, price:Number(product.price), image:product.image, images:product.images?.length ? product.images : [product.image], tag:product.tag || 'Ruth edit', description:product.description || '', finish:product.finish || '', styling:product.styling || '', status:'published', createdAt:serverTimestamp(), updatedAt:serverTimestamp() });
    }
    await refreshDashboard();
  } catch (error) {
    if (button) { button.disabled = false; button.textContent = 'Import current catalogue'; }
    alert('The catalogue could not be imported. Confirm your owner setup and Firebase rules, then try again.');
  }
}

function beginEditProduct(id) {
  const product = state.products.find(item => item.id === id);
  if (!product) return;
  state.editingProductId = id;
  state.existingImages = product.images?.length ? product.images : [product.image].filter(Boolean);
  root.innerHTML = dashboardTemplate();
  decorateDashboard();
  const form = root.querySelector('[data-product-form]');
  for (const field of ['name','category','price','tag','description','finish','styling','status']) if (form.elements[field]) form.elements[field].value = product[field] ?? '';
  form.scrollIntoView({ behavior:'smooth', block:'start' });
}

async function handleRootClick(event) {
  const target = event.target.closest('button');
  if (!target) return;
  if (target.matches('[data-owner-sign-out]')) { await signOut(auth); return; }
  if (target.matches('[data-copy-uid]')) { await navigator.clipboard?.writeText(state.user.uid); target.textContent = 'Copied'; return; }
  if (target.matches('[data-recheck-owner]')) { await renderForUser(state.user); return; }
  if (target.matches('[data-cancel-edit]')) { state.editingProductId = null; state.existingImages = []; await refreshDashboard(); return; }
  if (target.matches('[data-import-catalogue]')) { await importCurrentCatalogue(); return; }
  if (target.dataset.editProduct) { beginEditProduct(target.dataset.editProduct); return; }
  const type = target.dataset.deleteProduct ? 'products' : target.dataset.deleteCategory ? 'categories' : target.dataset.deleteCampaign ? 'campaigns' : '';
  const id = target.dataset.deleteProduct || target.dataset.deleteCategory || target.dataset.deleteCampaign;
  if (!type || !id || !confirm('Remove this record? This cannot be undone from the dashboard.')) return;
  await deleteDoc(doc(db, type, id));
  await refreshDashboard();
}

async function handleRootChange(event) {
  const orderId = event.target.dataset.orderStatus;
  if (!orderId) return;
  await updateDoc(doc(db, 'orders', orderId), { status:event.target.value, updatedAt:serverTimestamp() });
}

async function renderForUser(user) {
  state.user = user;
  if (!user) { root.innerHTML = loginTemplate(); return; }
  try {
    const owner = await getDoc(doc(db, 'Owners', user.uid));
    if (!owner.exists()) { root.innerHTML = setupTemplate(user); return; }
    await refreshDashboard();
  } catch (error) {
    root.innerHTML = setupTemplate(user, 'Owner access has not been enabled yet, or the Firebase security rules still need to be deployed.');
  }
}

root.addEventListener('click', handleRootClick);
root.addEventListener('change', event => { handleRootChange(event).catch(() => {}); });
root.addEventListener('submit', event => {
  event.preventDefault();
  if (event.target.matches('[data-product-form]')) submitProduct(event.target);
  if (event.target.matches('[data-category-form]')) submitCategory(event.target);
  if (event.target.matches('[data-campaign-form]')) submitCampaign(event.target);
  if (event.target.matches('[data-page-content-form]')) submitPageContent(event.target);
});

onAuthStateChanged(auth, user => { renderForUser(user); });

