/* ========================================
   Anaadi Ecofutures — Website JavaScript
   ======================================== */

// ========== PRODUCTS DATA ==========
const products = {
    '1kg': { name: 'Organic Rice — 1 Kg', price: 150 },
    '5kg': { name: 'Organic Rice — 5 Kg', price: 700 },
    '10kg': { name: 'Organic Rice — 10 Kg', price: 1300 }
};

// ========== STATE ==========
let quantities = { '1kg': 1, '5kg': 1, '10kg': 1 };
let cart = [];

// ========== NAVBAR ==========
window.addEventListener('scroll', () => {
    const navbar = document.getElementById('navbar');
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

function toggleMenu() {
    document.getElementById('navLinks').classList.toggle('open');
}

// Close mobile menu on link click
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        document.getElementById('navLinks').classList.remove('open');
    });
});

// ========== QUANTITY CONTROL ==========
function changeQty(size, delta) {
    quantities[size] = Math.max(1, quantities[size] + delta);
    document.getElementById('qty-' + size).textContent = quantities[size];
}

// ========== CART ==========
function addToCart(size) {
    const qty = quantities[size];
    const existing = cart.find(item => item.size === size);

    if (existing) {
        existing.qty += qty;
    } else {
        cart.push({ size, qty });
    }

    // Reset display quantity
    quantities[size] = 1;
    document.getElementById('qty-' + size).textContent = 1;

    updateCartUI();
    showToast(`Added ${qty}x ${products[size].name} to cart`);
}

function updateCartQty(size, delta) {
    const item = cart.find(i => i.size === size);
    if (!item) return;

    item.qty += delta;
    if (item.qty <= 0) {
        removeFromCart(size);
        return;
    }

    updateCartUI();
}

function removeFromCart(size) {
    cart = cart.filter(i => i.size !== size);
    updateCartUI();
}

function getCartTotal() {
    return cart.reduce((sum, item) => sum + products[item.size].price * item.qty, 0);
}

function getCartCount() {
    return cart.reduce((sum, item) => sum + item.qty, 0);
}

function updateCartUI() {
    const countEl = document.getElementById('cartCount');
    const itemsEl = document.getElementById('cartItems');
    const emptyEl = document.getElementById('cartEmpty');
    const footerEl = document.getElementById('cartFooter');
    const totalEl = document.getElementById('cartTotal');

    const count = getCartCount();
    countEl.textContent = count;

    if (cart.length === 0) {
        itemsEl.innerHTML = '<div class="cart-empty"><span>🛒</span><p>Your cart is empty</p></div>';
        footerEl.style.display = 'none';
        return;
    }

    footerEl.style.display = 'block';
    totalEl.textContent = '₹' + getCartTotal().toLocaleString('en-IN');

    let html = '';
    cart.forEach(item => {
        const product = products[item.size];
        html += `
            <div class="cart-item">
                <div class="cart-item-icon">🌾</div>
                <div class="cart-item-details">
                    <h4>${product.name}</h4>
                    <div class="cart-item-price">₹${(product.price * item.qty).toLocaleString('en-IN')}</div>
                    <div class="cart-item-qty">
                        <button onclick="updateCartQty('${item.size}', -1)">−</button>
                        <span>${item.qty}</span>
                        <button onclick="updateCartQty('${item.size}', 1)">+</button>
                    </div>
                </div>
                <button class="cart-item-remove" onclick="removeFromCart('${item.size}')">&times;</button>
            </div>
        `;
    });

    itemsEl.innerHTML = html;
}

// ========== CART SIDEBAR ==========
function openCart() {
    document.getElementById('cartOverlay').classList.add('open');
    document.getElementById('cartSidebar').classList.add('open');
    document.body.style.overflow = 'hidden';
}

function closeCart() {
    document.getElementById('cartOverlay').classList.remove('open');
    document.getElementById('cartSidebar').classList.remove('open');
    document.body.style.overflow = '';
}

// ========== CHECKOUT ==========
function proceedToCheckout() {
    if (cart.length === 0) return;
    closeCart();
    document.getElementById('checkoutModal').classList.add('open');
    document.body.style.overflow = 'hidden';
    showStep(1);
}

function closeCheckout() {
    document.getElementById('checkoutModal').classList.remove('open');
    document.body.style.overflow = '';
    showStep(1);
}

function showStep(n) {
    document.getElementById('step1').style.display = n === 1 ? 'block' : 'none';
    document.getElementById('step2').style.display = n === 2 ? 'block' : 'none';
    document.getElementById('step3').style.display = n === 3 ? 'block' : 'none';
    document.getElementById('stepConfirm').style.display = n === 4 ? 'block' : 'none';
}

function goToStep2(e) {
    e.preventDefault();
    // Build review address
    const firstName = document.getElementById('shipFirstName').value;
    const lastName = document.getElementById('shipLastName').value;
    const phone = document.getElementById('shipPhone').value;
    const addr1 = document.getElementById('shipAddress1').value;
    const addr2 = document.getElementById('shipAddress2').value;
    const city = document.getElementById('shipCity').value;
    const state = document.getElementById('shipState').value;
    const pincode = document.getElementById('shipPincode').value;

    let addressHtml = `<strong>${firstName} ${lastName}</strong><br>`;
    addressHtml += addr1;
    if (addr2) addressHtml += ', ' + addr2;
    addressHtml += `<br>${city}, ${state} — ${pincode}<br>India<br>Phone: ${phone}`;

    document.getElementById('reviewAddress').innerHTML = addressHtml;

    // Build review items
    let itemsHtml = '';
    cart.forEach(item => {
        const product = products[item.size];
        itemsHtml += `
            <div class="review-item">
                <span>${product.name} × ${item.qty}</span>
                <span>₹${(product.price * item.qty).toLocaleString('en-IN')}</span>
            </div>
        `;
    });
    document.getElementById('reviewItems').innerHTML = itemsHtml;

    const subtotal = getCartTotal();
    const shipping = subtotal >= 1000 ? 0 : 80;

    document.getElementById('reviewSubtotal').textContent = '₹' + subtotal.toLocaleString('en-IN');
    document.getElementById('reviewShipping').textContent = shipping === 0 ? 'Free' : '₹' + shipping;
    document.getElementById('reviewTotal').textContent = '₹' + (subtotal + shipping).toLocaleString('en-IN');

    showStep(2);
}

function backToStep1() {
    showStep(1);
}

function goToStep3() {
    const subtotal = getCartTotal();
    const shipping = subtotal >= 1000 ? 0 : 80;
    document.getElementById('payAmount').textContent = '₹' + (subtotal + shipping).toLocaleString('en-IN');
    showStep(3);
    showPaymentForm('upi');
}

function backToStep2() {
    showStep(2);
}

function showPaymentForm(method) {
    document.getElementById('payUpi').style.display = method === 'upi' ? 'block' : 'none';
    document.getElementById('payCard').style.display = method === 'card' ? 'block' : 'none';
    document.getElementById('payNetbanking').style.display = method === 'netbanking' ? 'block' : 'none';
    document.getElementById('payCod').style.display = method === 'cod' ? 'block' : 'none';

    // Update total with COD fee
    const subtotal = getCartTotal();
    const shipping = subtotal >= 1000 ? 0 : 80;
    const codFee = method === 'cod' ? 50 : 0;
    document.getElementById('payAmount').textContent = '₹' + (subtotal + shipping + codFee).toLocaleString('en-IN');
}

function placeOrder() {
    // Generate order ID
    const orderId = 'AE' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substring(2, 6).toUpperCase();
    document.getElementById('orderId').textContent = orderId;

    // Clear cart
    cart = [];
    updateCartUI();

    // Show confirmation
    showStep(4);
    showToast('Order placed successfully!');
}

// ========== CONTACT FORM ==========
function submitContact(e) {
    e.preventDefault();
    showToast('Thank you! We will get back to you soon.');
    e.target.reset();
}

// ========== TOAST ==========
function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}

// ========== SMOOTH SCROLL OFFSET ==========
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const offset = 72;
            const top = target.getBoundingClientRect().top + window.pageYOffset - offset;
            window.scrollTo({ top, behavior: 'smooth' });
        }
    });
});
