// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDGQV2fzbfIY7NiFRGddW_z7j88zzJRcNM",
  authDomain: "my-e-commerce-app-c2d0f.firebaseapp.com",
  projectId: "my-e-commerce-app-c2d0f",
  storageBucket: "my-e-commerce-app-c2d0f.firebasestorage.app",
  messagingSenderId: "423681153618",
  appId: "1:423681153618:web:ad2132782064197adf5d8b",
  measurementId: "G-CWRFQKCV1D"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
    window.onerror = function (msg, url, line) {
  alert("Error: " + msg + "\nLine: " + line);
};
// --- 1. DATA (Fixed Images & Stock) ---
const products = [
    { id: 1, name: "Red Apples", price: 120, cat: "Fruits", key: "apple", stock: 15, variant: "1kg", img: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400&q=80" },
    { id: 2, name: "Bananas", price: 50, cat: "Fruits", key: "banana", stock: 20, variant: "1 Dozen", img: "https://images.unsplash.com/photo-1603833665858-e61d17a86224?w=400&q=80" },
    { id: 3, name: "Farm Eggs", price: 90, cat: "Dairy", key: "eggs", stock: 4, variant: "6 pcs", img: "https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=400&q=80" }, // Low Stock
    { id: 4, name: "Fresh Milk", price: 34, cat: "Dairy", key: "milk", stock: 30, variant: "500ml", img: "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400&q=80" },
    { id: 5, name: "Basmati Rice", price: 140, cat: "Staples", key: "rice", stock: 15, variant: "1kg", img: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&q=80" },
    { id: 6, name: "Atta (Flour)", price: 210, cat: "Staples", key: "flour", stock: 12, variant: "5kg", img: "https://images.unsplash.com/photo-1627485937980-221c88ac04f9?w=400&q=80" },
    { id: 7, name: "Potato Chips", price: 20, cat: "Snacks", key: "chips", stock: 50, variant: "Standard", img: "https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400&q=80" },
    { id: 8, name: "Tomatoes", price: 40, cat: "Vegetables", key: "tomato", stock: 5, variant: "1kg", img: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&q=80" },
    { id: 9, name: "Onions", price: 30, cat: "Vegetables", key: "onion", stock: 0, variant: "1kg", img: "https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=400&q=80" }, // Out Stock
    { id: 10, name: "Cooking Oil", price: 160, cat: "Staples", key: "oil", stock: 18, variant: "1L", img: "https://images.unsplash.com/photo-1474979266404-7cadd9165458?w=400&q=80" },
    { id: 11, name: "Bread", price: 40, cat: "Staples", key: "bread", stock: 20, variant: "400g", img: "https://images.unsplash.com/photo-1598373182133-52452f7691ef?w=400&q=80" },
    { id: 12, name: "Cola", price: 90, cat: "Snacks", key: "soda", stock: 24, variant: "2L", img: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400&q=80" }
];

const coupons = {
    'SAVE50': { min: 299, off: 50 },
    'WELCOME10': { min: 0, off: 10 } // Flat 10 off for testing
};

// --- 2. GLOBAL STATE ---
const state = {
    cart: JSON.parse(localStorage.getItem('cart')) || [],
    user: JSON.parse(localStorage.getItem('user')) || null,
    addresses: JSON.parse(localStorage.getItem('addresses')) || [],
    wishlist: JSON.parse(localStorage.getItem('wishlist')) || [],
    orderHistory: JSON.parse(localStorage.getItem('orderHistory')) || [],
    selectedAddrIdx: 0,
    selectedSlot: 'Express',
    appliedCoupon: null,
    map: null,
    marker: null,
    tempLocation: null
};

// --- 3. LOGIC CONTROLLER (APP) ---
const app = {
    init: () => {
        // Splash
        setTimeout(() => {
            document.getElementById('splashScreen').style.opacity = '0';
            setTimeout(() => document.getElementById('splashScreen').style.display = 'none', 500);
        }, 2000);

        // Auth Check
        if (state.user) {
            ui.showApp();
        } else {
            document.getElementById('authScreen').style.display = 'flex';
        }

        // Event Listeners
        document.getElementById('loginForm').addEventListener('submit', app.login);
        document.getElementById('addressForm').addEventListener('submit', app.saveAddress);
        document.getElementById('searchInput').addEventListener('input', (e) => ui.renderGrid(e.target.value));
        window.addEventListener('scroll', ui.handleScroll);
        
        // Theme
        if(localStorage.getItem('theme') === 'dark') document.body.setAttribute('data-theme', 'dark');
    },

    login: (e) => {
        e.preventDefault();
        const phone = document.getElementById('loginPhone').value;
        const name = document.getElementById('loginName').value;
        if(phone.length === 10 && name) {
            state.user = { name, phone };
            localStorage.setItem('user', JSON.stringify(state.user));
            document.getElementById('authScreen').style.display = 'none';
            ui.showApp();
        } else alert("Please enter valid details");
    },

    logout: () => {
        localStorage.removeItem('user');
        location.reload();
    },

    addToCart: (id, event) => {
        const p = products.find(x => x.id === id);
        const item = state.cart.find(i => i.id === id);
        
        // Stock Validation
        const currentQty = item ? item.qty : 0;
        if(currentQty >= p.stock) {
            ui.showToast(`Only ${p.stock} units available!`);
            return;
        }

        // Animation
        ui.animateFlyToCart(id, event);

        // Logic
        if(item) item.qty++;
        else state.cart.push({ ...p, qty: 1 });
        
        app.saveCart();
    },

    updateQty: (id, change) => {
        const item = state.cart.find(i => i.id === id);
        if(item) {
            // Stock Check for Increase
            if (change > 0) {
                const p = products.find(x => x.id === id);
                if (item.qty >= p.stock) {
                    ui.showToast("Stock limit reached");
                    return;
                }
            }
            
            item.qty += change;
            if(item.qty <= 0) state.cart = state.cart.filter(i => i.id !== id);
            app.saveCart();
        }
    },

    saveCart: () => {
        localStorage.setItem('cart', JSON.stringify(state.cart));
        ui.renderCart();
    },

    toggleWishlist: (id, btn) => {
        if(state.wishlist.includes(id)) {
            state.wishlist = state.wishlist.filter(pid => pid !== id);
            btn.classList.remove('active');
        } else {
            state.wishlist.push(id);
            btn.classList.add('active');
            // Heart pop animation
            btn.style.transform = "scale(1.3)";
            setTimeout(() => btn.style.transform = "scale(1)", 200);
        }
        localStorage.setItem('wishlist', JSON.stringify(state.wishlist));
    },

    filterByCat: (cat, btn) => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        if(btn) btn.classList.add('active');
        const items = cat === 'all' ? products : products.filter(p => p.cat === cat);
        ui.renderGrid(null, items);
    },

    toggleFavoritesMode: (btn) => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const favs = products.filter(p => state.wishlist.includes(p.id));
        ui.renderGrid(null, favs);
    },

    saveAddress: (e) => {
        e.preventDefault();
        const newAddr = {
            flat: document.getElementById('flat').value,
            floor: document.getElementById('floor').value,
            area: document.getElementById('area').value,
            phone: document.getElementById('addrPhone').value,
            lat: state.tempLocation ? state.tempLocation.lat : null,
            lng: state.tempLocation ? state.tempLocation.lng : null
        };
        state.addresses.unshift(newAddr);
        localStorage.setItem('addresses', JSON.stringify(state.addresses));
        state.selectedAddrIdx = 0;
        ui.updateAddressDisplay();
        ui.closeModal('addressModal');
        e.target.reset();
        state.tempLocation = null;
    },

    confirmMapLocation: () => {
        if(!state.marker) return;
        const lat = state.marker.getLatLng().lat;
        const lng = state.marker.getLatLng().lng;
        state.tempLocation = { lat, lng };

        // Loader
        document.getElementById('mapLoader').style.display = 'block';

        fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
            .then(res => res.json())
            .then(data => {
                ui.closeModal('mapModal');
                ui.openAddressModal(); // Back to form
                document.getElementById('area').value = data.address.road || data.address.suburb || "";
                if(data.address.house_number) document.getElementById('flat').value = data.address.house_number;
                ui.showToast("Location Captured!");
            })
            .catch(() => {
                ui.showToast("Network Error: Could not fetch address text");
                ui.closeModal('mapModal');
                ui.openAddressModal();
            })
            .finally(() => {
                document.getElementById('mapLoader').style.display = 'none';
            });
    },

    applyCoupon: () => {
        const code = document.getElementById('couponInput').value.trim();
        const subtotal = state.cart.reduce((a, b) => a + (b.price * b.qty), 0);
        
        if(coupons[code]) {
            if(subtotal >= coupons[code].min) {
                state.appliedCoupon = { code, ...coupons[code] };
                ui.renderCart();
                ui.showToast("Coupon Applied!");
            } else {
                ui.showToast(`Min order ₹${coupons[code].min} for this code`);
            }
        } else {
            ui.showToast("Invalid Coupon Code");
        }
    },

    selectSlot: (slot, el) => {
        state.selectedSlot = slot;
        document.querySelectorAll('.slot-card').forEach(c => c.classList.remove('selected'));
        el.classList.add('selected');
        const radio = el.querySelector('input');
        if(radio) radio.checked = true;
    },

    initCheckout: () => {
        if(state.cart.length === 0) return ui.showToast("Your basket is empty");
        if(state.addresses.length === 0) return ui.openAddressModal();
        document.getElementById('slotModal').classList.add('active');
    },

    processOrder: () => {
        const addr = state.addresses[state.selectedAddrIdx];
        const subtotal = state.cart.reduce((a, b) => a + (b.price * b.qty), 0);
        const delivery = subtotal > 499 ? 0 : 30;
        const discount = state.appliedCoupon ? state.appliedCoupon.off : 0;
        const total = subtotal + delivery - discount;
        const phone = "918096585038";

        // Save Order
        const order = {
            id: Date.now(),
            date: new Date().toLocaleDateString(),
            total: total,
            items: state.cart.map(i => `${i.name} (${i.qty})`)
        };
        state.orderHistory.unshift(order);
        localStorage.setItem('orderHistory', JSON.stringify(state.orderHistory));

        // WhatsApp Msg
        let msg = `*New Order from ${state.user.name}* 🛍️\n`;
        msg += `*Slot:* ${state.selectedSlot}\n\n`;
        state.cart.forEach(i => msg += `▪️ ${i.name} (${i.variant}) x ${i.qty} = ₹${i.price*i.qty}\n`);
        msg += `\n*Subtotal:* ₹${subtotal}`;
        if(discount > 0) msg += `\n*Coupon (${state.appliedCoupon.code}):* -₹${discount}`;
        msg += `\n*Delivery:* ${delivery === 0 ? 'FREE' : '₹'+delivery}`;
        msg += `\n*TOTAL PAYABLE: ₹${total}*`;
        msg += `\n\n*📍 Delivery:*\nPhone: ${addr.phone}\nAddr: ${addr.flat}, ${addr.floor||''}, ${addr.area}`;
        if(addr.lat) msg += `\nMap: https://maps.google.com/?q=${addr.lat},${addr.lng}`;

        window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');

        // Cleanup
        state.cart = [];
        state.appliedCoupon = null;
        app.saveCart();
        ui.closeModal('slotModal');
        ui.closeAllSidebars();
        document.getElementById('successModal').classList.add('active');
        ui.renderBuyAgain();
    },

    contactSupport: () => {
        window.open(`https://wa.me/919160934771`, '_blank');
    }
};

// --- 4. UI HANDLER ---
const ui = {
    showApp: () => {
        document.getElementById('app').style.display = 'block';
        ui.renderGrid();
        ui.renderBuyAgain();
        ui.renderCart();
        ui.updateAddressDisplay();
    },

    renderGrid: (term = null, customList = null) => {
        const grid = document.getElementById('productGrid');
        let items = customList || products;
        
        if (term) {
            items = products.filter(p => p.name.toLowerCase().includes(term.toLowerCase()));
        }

        if(items.length === 0) {
            grid.innerHTML = "<p style='width:100%; text-align:center; grid-column:1/-1; color:var(--text-muted);'>No items found.</p>";
            return;
        }

        grid.innerHTML = items.map(p => {
            const isOut = p.stock <= 0;
            const isLow = p.stock > 0 && p.stock <= 5;
            const isFav = state.wishlist.includes(p.id);
            
            return `
            <div class="card ${isOut ? 'out-stock' : ''}">
                <div class="heart-icon ${isFav ? 'active' : ''}" onclick="app.toggleWishlist(${p.id}, this)">
                    <i class="fas fa-heart"></i>
                </div>
                <div class="card-img-box">
                    <img src="${p.img}" class="card-img" id="img-${p.id}" loading="lazy" alt="${p.name}">
                </div>
                <div class="card-body">
                    <div class="stock-badge ${isLow ? 'show' : ''}" style="display:${isLow?'block':'none'}">Only ${p.stock} left</div>
                    <div class="card-title">${p.name}</div>
                    <div class="card-desc">${p.variant}</div>
                    <div class="card-footer">
                        <div class="price">₹${p.price}</div>
                        <button class="add-btn" onclick="app.addToCart(${p.id}, event)" ${isOut ? 'disabled' : ''}>
                            ${isOut ? 'OUT' : 'ADD'}
                        </button>
                    </div>
                </div>
            </div>
        `}).join('');
    },

    renderCart: () => {
        const container = document.getElementById('cartItems');
        const badge = document.getElementById('cartBadge');
        
        container.innerHTML = state.cart.map(i => `
            <div class="cart-item">
                <div style="flex:1;">
                    <div style="font-weight:600; font-size:0.9rem">${i.name}</div>
                    <div style="font-size:0.8rem; color:var(--text-muted)">${i.variant} • ₹${i.price}</div>
                </div>
                <div class="qty-controls">
                    <button class="qty-btn" onclick="app.updateQty(${i.id}, -1)">-</button>
                    <span class="qty-val">${i.qty}</span>
                    <button class="qty-btn" onclick="app.updateQty(${i.id}, 1)">+</button>
                </div>
            </div>
        `).join('');

        // Totals
        const subtotal = state.cart.reduce((a, b) => a + (b.price * b.qty), 0);
        const delivery = subtotal > 499 ? 0 : (subtotal > 0 ? 30 : 0);
        const discount = state.appliedCoupon ? state.appliedCoupon.off : 0;
        const total = subtotal + delivery - discount;
        
        badge.innerText = state.cart.reduce((a,b) => a + b.qty, 0);

        document.getElementById('billDetails').innerHTML = `
            <div style="display:flex; justify-content:space-between; margin-bottom:5px;"><span>Item Total</span> <span>₹${subtotal}</span></div>
            <div style="display:flex; justify-content:space-between; color:${delivery===0?'green':'inherit'};"><span>Delivery</span> <span>${delivery === 0 ? 'FREE' : '₹'+delivery}</span></div>
            ${discount > 0 ? `<div style="display:flex; justify-content:space-between; color:green;"><span>Coupon</span> <span>-₹${discount}</span></div>` : ''}
            <div style="display:flex; justify-content:space-between; font-weight:bold; font-size:1.1rem; margin-top:10px; border-top:1px dashed var(--border); padding-top:10px;"><span>To Pay</span> <span>₹${total}</span></div>
        `;

        if(state.cart.length === 0) container.innerHTML = "<p style='text-align:center; color:var(--text-muted); margin-top:20px;'>Your basket is empty</p>";
    },

    renderBuyAgain: () => {
        if(state.orderHistory.length === 0) return;
        document.getElementById('buyAgainSection').style.display = 'block';
        const row = document.getElementById('buyAgainList');
        
        // Extract unique item IDs (parsing strings back to IDs is hard here, so we simplify logic)
        // For production, order history should store Item IDs. 
        // Here we just use a random subset of products for demo effect
        const randomPicks = products.slice(0, 5); 
        
        row.innerHTML = randomPicks.map(p => `
            <div class="mini-card" onclick="app.addToCart(${p.id}, event)">
                <img src="${p.img}">
                <div style="font-size:0.75rem; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${p.name}</div>
            </div>
        `).join('');
    },

    animateFlyToCart: (id, event) => {
        const img = document.getElementById(`img-${id}`) || event.target.closest('.card').querySelector('img');
        if(!img) return;

        const clone = img.cloneNode(true);
        clone.classList.add('flying-img');
        const rect = img.getBoundingClientRect();
        const cartBtn = document.querySelector('.cart-trigger');
        const cartRect = cartBtn.getBoundingClientRect();

        clone.style.top = `${rect.top}px`;
        clone.style.left = `${rect.left}px`;
        document.body.appendChild(clone);

        setTimeout(() => {
            clone.style.top = `${cartRect.top + 10}px`;
            clone.style.left = `${cartRect.left + 10}px`;
            clone.style.width = '10px';
            clone.style.height = '10px';
            clone.style.opacity = '0';
        }, 10);

        setTimeout(() => {
            clone.remove();
            document.getElementById('cartBadge').classList.add('bounce');
            setTimeout(() => document.getElementById('cartBadge').classList.remove('bounce'), 300);
        }, 800);
    },

    // Sidebar & Modal Helpers
    toggleCart: () => {
        if(state.cart.length === 0 && !document.getElementById('cartSidebar').classList.contains('open')) {
            return ui.showToast("Your basket is empty 🛒");
        }
        document.getElementById('cartSidebar').classList.toggle('open');
        const overlay = document.getElementById('overlay');
        overlay.style.display = overlay.style.display === 'block' ? 'none' : 'block';
    },

    closeAllSidebars: () => {
        document.getElementById('cartSidebar').classList.remove('open');
        document.getElementById('overlay').style.display = 'none';
    },

    openAccountModal: () => {
        document.getElementById('accName').innerText = state.user.name;
        document.getElementById('accPhone').innerText = '+91 ' + state.user.phone;
        
        const list = document.getElementById('orderList');
        if(state.orderHistory.length === 0) list.innerHTML = "<p style='color:var(--text-muted)'>No past orders</p>";
        else {
            list.innerHTML = state.orderHistory.map(o => `
                <div class="order-item">
                    <div style="font-weight:bold; display:flex; justify-content:space-between">
                        <span>📅 ${o.date}</span> <span>₹${o.total}</span>
                    </div>
                    <div style="font-size:0.8rem; margin-top:5px; color:var(--text-muted)">${o.items.join(', ')}</div>
                </div>
            `).join('');
        }
        document.getElementById('accountModal').classList.add('active');
    },

    openAddressModal: () => {
        document.getElementById('addressModal').classList.add('active');
        ui.renderSavedAddr();
    },

    openMapModal: () => {
        ui.closeModal('addressModal');
        document.getElementById('mapModal').classList.add('active');
        
        if(!state.map) {
            state.map = L.map('map').setView([20.5937, 78.9629], 5);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(state.map);
            state.marker = L.marker([20.5937, 78.9629], {draggable: true}).addTo(state.map);
            
            if(navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(pos => {
                    const lat = pos.coords.latitude;
                    const lng = pos.coords.longitude;
                    state.map.setView([lat, lng], 15);
                    state.marker.setLatLng([lat, lng]);
                });
            }
            state.map.on('click', (e) => state.marker.setLatLng(e.latlng));
        }
        setTimeout(() => state.map.invalidateSize(), 200);
    },

    renderSavedAddr: () => {
        const div = document.getElementById('savedList');
        if(state.addresses.length === 0) {
            div.innerHTML = "<p style='text-align:center; color:var(--text-muted); font-size:0.9rem;'>No saved addresses</p>";
            return;
        }
        div.innerHTML = state.addresses.map((a, i) => `
            <div style="padding:10px; border-bottom:1px solid var(--border); cursor:pointer;" onclick="ui.setAddr(${i})">
                <div style="font-weight:bold; font-size:0.9rem">Address ${i+1}</div>
                <div style="font-size:0.8rem; color:var(--text-muted)">${a.flat}, ${a.area}</div>
                <div style="font-size:0.75rem; color:var(--primary)">📞 ${a.phone}</div>
            </div>
        `).join('');
    },

    setAddr: (i) => {
        state.selectedAddrIdx = i;
        ui.updateAddressDisplay();
        ui.closeModal('addressModal');
    },

    updateAddressDisplay: () => {
        const txt = document.getElementById('currentAddrText');
        if(state.addresses.length > 0) {
            const a = state.addresses[state.selectedAddrIdx];
            txt.innerText = `${a.flat}, ${a.area}`;
        } else {
            txt.innerText = "Select Address";
        }
    },

    toggleTheme: () => {
        if(document.body.hasAttribute('data-theme')) {
            document.body.removeAttribute('data-theme');
            localStorage.setItem('theme', 'light');
        } else {
            document.body.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
        }
    },

    closeModal: (id) => document.getElementById(id).classList.remove('active'),

    handleScroll: () => {
        if (window.scrollY > 50) document.body.classList.add('scrolled-down');
        else document.body.classList.remove('scrolled-down');
    },

    showToast: (msg) => {
        const t = document.getElementById('toast');
        t.innerText = msg;
        t.classList.add('show');
        setTimeout(() => t.classList.remove('show'), 2000);
    }
};

// Start App
window.onload = app.init;
</script>