let products = [
  { id:'attigai-classic', name:'The Attigai', category:'Temple Necklaces', price:1850, image:'https://raw.githubusercontent.com/clinceraj/ruth-jewels-1/main/ATTIGAI-01.jpeg', tag:'Signature', description:'A regal collar necklace with a rich, temple-inspired silhouette, chosen to take centre stage at every celebration.', finish:'Antique-tone finish', styling:'Pair with silk sarees and high necklines.' },
  { id:'attigai-emerald', name:'Emerald Attigai', category:'Temple Necklaces', price:2100, image:'https://raw.githubusercontent.com/clinceraj/ruth-jewels-1/main/ATTIGAI-04.png', tag:'New arrival', description:'Our classic Attigai, brightened by emerald-green detailing for a considered burst of colour.', finish:'Emerald-tone detailing', styling:'Style with jewel tones for a polished look.' },
  { id:'attigai-sun', name:'Radiant Attigai', category:'Temple Necklaces', price:1750, image:'https://raw.githubusercontent.com/clinceraj/ruth-jewels-1/main/ATTIGAI-05.png', tag:'Bestseller', description:'A luminous temple necklace with graceful details and a wonderfully easy-to-wear presence.', finish:'Warm antique-tone finish', styling:'An effortless choice for daytime ceremonies.' },
  { id:'lotus-choker', name:'Lotus Line Choker', category:'Chokers', price:1450, image:'https://raw.githubusercontent.com/clinceraj/ruth-jewels-1/main/ONE%20LINE%20LOTUS%20CHOCKER-06.png', tag:'Ruth edit', description:'A finely detailed choker that frames the neckline with a row of lotus-inspired motifs.', finish:'Classic heritage finish', styling:'Layer with a fine chain or let it stand alone.' },
  { id:'lakshmi-choker', name:'Lakshmi Choker', category:'Chokers', price:1650, image:'https://raw.githubusercontent.com/clinceraj/ruth-jewels-1/main/LAKSHMI%20CHOKER-01.png', tag:'Iconic', description:'A sculptural Lakshmi choker with ceremonial character and statement detail.', finish:'Antique-tone finish', styling:'Made for memorable festive entrances.' },
  { id:'coin-necklace', name:'Coin Necklace', category:'Wedding Edit', price:1250, image:'https://raw.githubusercontent.com/clinceraj/ruth-jewels-1/main/COIN%20NECKLACE-01.jpeg', tag:'Heritage favourite', description:'A classic coin necklace that lends a heritage feel to celebration and everyday dressing.', finish:'Soft antique-tone finish', styling:'Beautiful alone or layered with a longer chain.' },
  { id:'floral-ad', name:'Floral AD Necklace', category:'Wedding Edit', price:2350, image:'https://raw.githubusercontent.com/clinceraj/ruth-jewels-1/main/FLORAL%20AD%20NECKLACE-01.png', tag:'Wedding favourite', description:'A luminous floral statement necklace for wedding rituals, receptions, and the photographs that follow.', finish:'Crystal and polished detailing', styling:'Pair with a clean silk blouse and matching earrings.' },
  { id:'mango-mala', name:'Mango Mala', category:'Festive Statements', price:2500, image:'https://raw.githubusercontent.com/clinceraj/ruth-jewels-1/main/MANGO%20MALA%20WITH%20LEKSHMI%20PENDANT-01.png', tag:'Limited edit', description:'A grand mango mala with a Lakshmi pendant, selected for weddings and important celebrations.', finish:'Ruby-tone detailing', styling:'A statement for wedding and festive dressing.' },
  { id:'palakk-haram', name:'Palakk Haram', category:'Wedding Edit', price:2200, image:'https://raw.githubusercontent.com/clinceraj/ruth-jewels-1/main/PALAKK%20HARAM-01.png', tag:'Ceremonial', description:'A traditional silhouette presented in a striking, modern proportion.', finish:'Green stone detailing', styling:'A natural match for classic wedding colour palettes.' },
  { id:'heritage-green', name:'Heritage Green Necklace', category:'Festive Statements', price:950, image:'https://raw.githubusercontent.com/clinceraj/ruth-jewels-1/main/GOLD%20AND%20GREEN-01.png', tag:'Easy elegance', description:'A refined green-detailed necklace that moves effortlessly from puja mornings to evening celebrations.', finish:'Green and warm-tone detailing', styling:'Try it with a simple kurta or an evening saree.' }
];
const fallbackProducts = products.map(product => ({ ...product }));

const money = value => new Intl.NumberFormat('en-IN', { style:'currency', currency:'INR', maximumFractionDigits:0 }).format(value);
const getCart = () => JSON.parse(localStorage.getItem('ruth-jewels-cart') || '[]');
const saveCart = cart => { localStorage.setItem('ruth-jewels-cart', JSON.stringify(cart)); updateCartCount(); };
const findProduct = id => products.find(product => product.id === id);
const page = location.pathname.split('/').pop() || 'index.html';
const pageContent = {};
const escapePageCopy = value => String(value ?? '').replace(/[&<>'"]/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[character]));
const pageCopy = (pageName, key, fallback) => {
  const value = pageContent[pageName]?.[key];
  return escapePageCopy(typeof value === 'string' && value.trim() ? value.trim() : fallback);
};

function logoMarkup() {
  return '<span class="brand-emblem"><img src="assets/ruth-jewels-logo-v2.jpg" alt=""></span><span class="brand-name">Ruth <small>Jewels</small></span>';
}
function headerTemplate() {
  const active = name => page === name ? 'is-current' : '';
  return `<a class="brand" href="index.html" aria-label="Ruth Jewels home">${logoMarkup()}</a><button class="menu-toggle" type="button" aria-expanded="false" aria-controls="main-nav">Menu</button><nav class="nav" id="main-nav" aria-label="Main navigation"><a class="${active('collections.html')}" href="collections.html">Shop collections</a><a class="${active('about.html')}" href="about.html">Our story</a><a href="collections.html?category=Wedding+Edit">Wedding edit</a><a href="https://www.instagram.com/ruth_jewels_/?hl=en" target="_blank" rel="noopener">Instagram</a></nav><div class="header-actions"><a class="${active('account.html') || active('create-account.html') || active('account-overview.html')}" href="account-overview.html">My account</a><a class="bag-link ${active('cart.html')}" href="cart.html">Shopping bag <span class="bag-count" data-cart-count>0</span></a></div>`;
}
function footerTemplate() {
  return `<div class="footer-top"><div class="footer-brand"><a class="brand brand--footer" href="index.html">${logoMarkup()}</a><p>Temple-inspired fashion jewellery for Indian weddings, festivals, and everyday celebrations.</p></div><div><p class="footer-heading">Shop</p><nav class="footer-links"><a href="collections.html">All jewellery</a><a href="collections.html?category=Temple+Necklaces">Temple necklaces</a><a href="collections.html?category=Chokers">Chokers</a><a href="collections.html?category=Wedding+Edit">Wedding edit</a></nav></div><div><p class="footer-heading">Ruth Jewels</p><nav class="footer-links"><a href="about.html">Our story</a><a href="account.html">Sign in</a><a href="create-account.html">Create account</a><a href="https://www.instagram.com/ruth_jewels_/?hl=en" target="_blank" rel="noopener">Shop on Instagram</a></nav></div></div><div class="footer-bottom"><span>&copy; 2026 Ruth Jewels, India</span><span>Curated for celebrations across India</span></div>`;
}
function productCard(product) {
  return `<article class="product-card reveal"><a class="product-image" href="product.html?id=${product.id}" aria-label="View ${product.name} details"><img src="${product.image}" alt="${product.name}" loading="lazy"><span class="product-tag">${product.tag}</span><span class="image-action">View details</span></a><div class="product-info"><h3><a href="product.html?id=${product.id}">${product.name}</a></h3><span class="product-price">${money(product.price)}</span><p>${product.category}</p><button class="quick-add" type="button" data-quick-add="${product.id}">Add ${product.name} to bag</button></div></article>`;
}
function updateCartCount() { document.querySelectorAll('[data-cart-count]').forEach(node => node.textContent = getCart().reduce((total,item) => total + item.quantity, 0)); }
function showToast(message) { let toast = document.querySelector('.toast'); if (!toast) { toast = document.createElement('div'); toast.className = 'toast'; toast.setAttribute('role','status'); document.body.append(toast); } toast.textContent = message; toast.classList.add('is-visible'); window.setTimeout(() => toast.classList.remove('is-visible'), 2600); }
function addToCart(productId) { const cart = getCart(); const existing = cart.find(item => item.id === productId); if (existing) existing.quantity += 1; else cart.push({id:productId,quantity:1}); saveCart(cart); showToast(`${findProduct(productId)?.name || 'Piece'} added to your shopping bag.`); }
function cartTotal() { return getCart().reduce((total,item) => total + (findProduct(item.id)?.price || 0) * item.quantity, 0); }
function cartItemsTemplate(compact=false) {
  const cart = getCart();
  if (!cart.length) {
    return compact ? '<p>Your shopping bag is empty.</p>' : '<div class="empty-state"><h2>' + pageCopy('cart', 'emptyTitle', 'Your shopping bag is waiting.') + '</h2><p>' + pageCopy('cart', 'emptyCopy', 'Explore statement pieces for weddings, festivals, and thoughtful gifting.') + '</p><a class="button button--primary" href="collections.html">' + pageCopy('cart', 'browseLabel', 'Shop all jewellery') + '</a></div>';
  }
  return cart.map(item => { const product = findProduct(item.id); if (!product) return ''; return compact ? `<div class="summary-item"><img src="${product.image}" alt=""><div><strong>${product.name}</strong><span>${item.quantity} &times; ${money(product.price)}</span></div></div>` : `<article class="cart-line"><img src="${product.image}" alt="${product.name}"><div><h2>${product.name}</h2><p>${product.category}</p><div class="quantity" aria-label="Quantity for ${product.name}"><button data-adjust-quantity="${product.id}" data-change="-1" aria-label="Decrease ${product.name} quantity">âˆ’</button><span>${item.quantity}</span><button data-adjust-quantity="${product.id}" data-change="1" aria-label="Increase ${product.name} quantity">+</button></div><br><button class="remove" data-remove-item="${product.id}">Remove from bag</button></div><span class="line-price">${money(product.price * item.quantity)}</span></article>`; }).join('');
}
function summaryTemplate(withButton=false) {
  const total = cartTotal();
  return `<h2>${pageCopy('cart', 'summaryTitle', 'Order summary')}</h2><div class="summary-row"><span>Subtotal</span><span>${money(total)}</span></div><div class="summary-row"><span>Delivery within India</span><span>Complimentary</span></div><div class="summary-total"><span>Total</span><span>${money(total)}</span></div>${withButton ? '<a class="button button--primary" href="checkout.html">' + pageCopy('cart', 'checkoutLabel', 'Proceed to secure checkout') + '</a>' : ''}`;
}
function renderHome() { const target = document.querySelector('[data-featured-products]'); if (target) { target.innerHTML = products.slice(0,3).map(productCard).join(''); observeReveals(); } }
function renderCollections() { const target = document.querySelector('[data-collection-products]'); const filters = document.querySelector('[data-category-filters]'); if (!target || !filters) return; const categories = ['All', ...new Set(products.map(product => product.category))]; let current = new URLSearchParams(location.search).get('category') || 'All'; let latestFirst = false;
  filters.innerHTML = categories.map(category => `<button class="filter-button ${category === current ? 'is-active':''}" data-filter="${category}" aria-pressed="${category === current}">${category === 'All' ? 'View all jewellery' : category}</button>`).join('');
  const render = () => { let result = current === 'All' ? [...products] : products.filter(product => product.category === current); if (latestFirst) result.reverse(); target.innerHTML = result.map(productCard).join(''); document.querySelector('[data-product-count]').textContent = `${result.length} ${result.length === 1 ? 'design' : 'designs'}`; observeReveals(); };
  filters.addEventListener('click', event => { const button = event.target.closest('[data-filter]'); if (!button) return; current = button.dataset.filter; filters.querySelectorAll('[data-filter]').forEach(item => { const selected = item === button; item.classList.toggle('is-active', selected); item.setAttribute('aria-pressed', selected); }); render(); });
  document.querySelector('[data-sort-products]')?.addEventListener('click', event => { latestFirst = !latestFirst; event.currentTarget.innerHTML = `${latestFirst ? 'Show featured order' : 'Show newest first'} <span aria-hidden="true">â†“</span>`; render(); }); render();
}
function renderProduct() {
  const root = document.querySelector('[data-product-page]');
  if (!root) return;
  const product = findProduct(new URLSearchParams(location.search).get('id')) || products[0];
  document.title = `${product.name} | Ruth Jewels`;
  root.innerHTML = `<p class="breadcrumbs"><a href="collections.html">${pageCopy('product', 'allLabel', 'All jewellery')}</a> / <a href="collections.html?category=${encodeURIComponent(product.category)}">${product.category}</a> / ${product.name}</p><section class="product-detail"><div class="product-detail-image reveal"><img src="${product.image}" alt="${product.name}"></div><div class="product-detail-copy reveal"><p class="eyebrow">${product.category}</p><h1>${product.name}</h1><p class="product-detail-price">${money(product.price)}</p><p class="tax-note">${pageCopy('product', 'taxNote', 'Inclusive of applicable taxes')}</p><p class="product-detail-description">${product.description}</p><div class="product-meta"><div><span>Finish</span><strong>${product.finish}</strong></div><div><span>Styling note</span><strong>${product.styling}</strong></div><div><span>${pageCopy('product', 'presentationLabel', 'Presentation')}</span><strong>${pageCopy('product', 'presentationValue', 'Gift-ready Ruth packaging')}</strong></div><div><span>${pageCopy('product', 'deliveryLabel', 'Delivery')}</span><strong>${pageCopy('product', 'deliveryValue', 'Available across India')}</strong></div></div><button class="button button--primary add-to-cart" type="button" data-add-to-cart="${product.id}">${pageCopy('product', 'addLabel', 'Add to shopping bag')} · ${money(product.price)}</button><a class="button button--secondary product-back" href="collections.html">${pageCopy('product', 'browseLabel', 'Continue browsing jewellery')}</a></div></section>`;
}
function renderCart() { const root = document.querySelector('[data-cart-page]'); if (!root) return; if (!getCart().length) { root.innerHTML = cartItemsTemplate(); return; } root.innerHTML = `<div class="cart-layout"><section>${cartItemsTemplate()}</section><aside class="cart-summary">${summaryTemplate(true)}</aside></div>`; }
function renderCheckout() { const summary = document.querySelector('[data-checkout-summary]'); if (summary) summary.innerHTML = `${cartItemsTemplate(true)}${getCart().length ? summaryTemplate() : '<p><a class="text-link" href="collections.html">Shop jewellery before checkout â†’</a></p>'}`; }
function observeReveals() { const items = document.querySelectorAll('.reveal:not(.is-observed)'); if (!('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) { items.forEach(item => item.classList.add('is-visible')); return; } const observer = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); } }), { threshold:.12, rootMargin:'0px 0px -35px' }); items.forEach((item,index) => { item.classList.add('is-observed'); item.style.setProperty('--reveal-delay', `${Math.min(index % 3, 2) * 90}ms`); observer.observe(item); }); }
function bindInteractions() { document.addEventListener('click', event => { const menu = event.target.closest('.menu-toggle'); if (menu) { const open = document.body.classList.toggle('menu-open'); menu.setAttribute('aria-expanded', open); menu.textContent = open ? 'Close' : 'Menu'; return; } const quickAdd = event.target.closest('[data-quick-add],[data-add-to-cart]'); if (quickAdd) { addToCart(quickAdd.dataset.quickAdd || quickAdd.dataset.addToCart); return; } const adjust = event.target.closest('[data-adjust-quantity]'); if (adjust) { const cart = getCart(); const item = cart.find(line => line.id === adjust.dataset.adjustQuantity); if (!item) return; item.quantity += Number(adjust.dataset.change); saveCart(cart.filter(line => line.quantity > 0)); renderCart(); return; } const remove = event.target.closest('[data-remove-item]'); if (remove) { saveCart(getCart().filter(item => item.id !== remove.dataset.removeItem)); renderCart(); showToast('Piece removed from your shopping bag.'); return; } const create = event.target.closest('[data-create-account]'); if (create) { event.preventDefault(); showToast('Account creation will be available when secure customer accounts launch.'); } });
}
function replaceProducts(nextProducts) {
  const cleaned = nextProducts.map(product => ({
    ...product,
    id:String(product.id || '').trim(),
    name:String(product.name || 'Untitled piece').trim(),
    category:String(product.category || 'Everyday pieces').trim(),
    price:Number(product.price || 0),
    image:product.image || product.images?.[0] || 'assets/ruth-jewels-editorial-hero.jpg',
    images:Array.isArray(product.images) ? product.images : [],
    tag:String(product.tag || 'Ruth edit').trim(),
    description:String(product.description || 'A hand-picked Ruth Jewels piece.').trim(),
    finish:String(product.finish || 'Selected finish').trim(),
    styling:String(product.styling || 'Chosen for your occasion.').trim()
  })).filter(product => product.id && product.price >= 0);
  if (!cleaned.length) return;
  const incoming = new Map(cleaned.map(product => [product.id, product]));
  products = [...fallbackProducts.filter(product => !incoming.has(product.id)), ...cleaned];
  renderHome(); renderCollections(); renderProduct(); renderCart(); renderCheckout(); updateCartCount();
}
function init() { document.querySelectorAll('[data-header]').forEach(node => node.innerHTML = headerTemplate()); document.querySelectorAll('[data-footer]').forEach(node => node.innerHTML = footerTemplate()); updateCartCount(); renderHome(); renderCollections(); renderProduct(); renderCart(); renderCheckout(); bindInteractions(); observeReveals(); }
function setPageContent(pageName, content) {
  pageContent[pageName] = content || {};
  if (pageName === 'product') renderProduct();
  if (pageName === 'cart') { renderCart(); renderCheckout(); }
}
window.RuthJewelsStore = { get products() { return products; }, getCart, findProduct, cartTotal, money, showToast, updateCartCount, renderCart, renderCheckout, replaceProducts, setPageContent, clearCart() { localStorage.removeItem('ruth-jewels-cart'); updateCartCount(); } };
init();
import('./firebase-client.js').catch(() => {});

