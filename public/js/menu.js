import { db, cart, userProfile, getUserEmail } from './auth.js';
import { collection, addDoc, onSnapshot, GeoPoint } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { showToast } from './ui.js';
import { tagCategories } from '/js/config/tags.js';
import { customCategorizedTags, loadCustomTags } from '/js/adminTags.js';
import { appCurrency } from '/js/adminSettings.js';
import { createLoadingCard, renderLoadingState, setupLazyLoading, handleImageError } from './utils/menuUtils.js';

export function setupMenuAndCart() {
  const menuRef = collection(db, "menu");
  const tagFilterInput = document.getElementById("tagFilter");

  let allMenuItems = []; // Store all menu items to filter locally

  // Function to populate the datalist with all available tags (predefined + custom)
  async function populateTagDatalist() {
    await loadCustomTags(); // Ensure custom tags are loaded
    const datalist = document.getElementById('suggested-tags');
    datalist.innerHTML = ''; // Clear existing options

    const allSuggestedTags = Object.values(tagCategories).flat();
    const combinedTags = [...allSuggestedTags];
    for (const category in customCategorizedTags) {
      combinedTags.push(...customCategorizedTags[category]);
    }

    combinedTags.forEach(tag => {
      const option = document.createElement('option');
      option.value = tag;
      datalist.appendChild(option);
    });
  }

  // Call populateTagDatalist initially
  populateTagDatalist();

  // Function to render the menu based on current filter
  function renderFilteredMenu() {
    const filterTags = tagFilterInput.value.toLowerCase().split(',').map(tag => tag.trim()).filter(tag => tag);

    const menuContainer = document.getElementById("menu");
    menuContainer.innerHTML = "";
    
    // Show loading state
    renderLoadingState(menuContainer);

    const filteredItems = allMenuItems.filter(item => {
      if (filterTags.length === 0) return true; // No filter, show all
      if (!item.tags || item.tags.length === 0) return false; // Item has no tags, can't match filter

      // Check if any of the item's tags match any of the filter tags
      return filterTags.some(filterTag => 
        item.tags.some(itemTag => itemTag.toLowerCase().includes(filterTag))
      );
    });

    filteredItems.forEach(item => {
      const card = document.createElement('div');
      card.className = 'menu-card';

      // Image with lazy loading
      const img = document.createElement('img');
      img.dataset.src = item.imageUrl || '';
      img.alt = item.name;
      img.className = 'menu-card-image';
      img.src = '/logo-image/thisislogo.png'; // Placeholder
      handleImageError(img);
      card.appendChild(img);
      
      // Observe for lazy loading
      window.lazyLoadObserver = window.lazyLoadObserver || setupLazyLoading();
      window.lazyLoadObserver.observe(img);

      // Name
      const name = document.createElement('h3');
      name.textContent = item.name;
      card.appendChild(name);

      // Description
      const description = document.createElement('p');
      description.textContent = item.description;
      description.className = 'menu-card-description';
      card.appendChild(description);

      // Price
      const price = document.createElement('p');
      price.textContent = `Price: ${appCurrency}${item.price ? item.price.toFixed(2) : 'N/A'}`;
      price.className = 'menu-card-price';
      card.appendChild(price);

      // Quantity and Action Button container
      const actionsDiv = document.createElement('div');
      actionsDiv.className = 'menu-card-actions';

      // Quantity
      const quantityInput = document.createElement('input');
      quantityInput.type = 'number';
      quantityInput.id = `quantity-${item.id}`;
      quantityInput.value = '1';
      quantityInput.min = '1';
      quantityInput.className = 'menu-card-quantity-input';
      actionsDiv.appendChild(quantityInput);

      // Action Button
      const addButton = document.createElement('button');
      addButton.textContent = 'Add to Cart';
      addButton.className = 'add-to-cart-btn';
      addButton.dataset.id = item.id;
      addButton.dataset.name = item.name;
      addButton.dataset.price = item.price;
      actionsDiv.appendChild(addButton);

      card.appendChild(actionsDiv);
      menuContainer.appendChild(card);
    });
  }

  // Real-time listener for menu items
  // For very large datasets, consider implementing pagination or infinite scrolling
  // to optimize performance and reduce Firestore read costs.
  onSnapshot(menuRef, snapshot => {
    allMenuItems = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    renderFilteredMenu(); // Initial render and re-render on data change
  });

  // Event listener for tag filter input
  tagFilterInput.addEventListener('input', renderFilteredMenu);

  // This function now safely builds the cart display
  function renderCart() {
    const cartDiv = document.getElementById("cart");
    const cartTotalSpan = document.getElementById("cartTotal");
    let total = 0;
    cartDiv.innerHTML = ""; // Clear existing content

    const fragment = document.createDocumentFragment();
    cart.forEach((item, index) => {
      total += item.price * item.quantity;

      const cartItemDiv = document.createElement('div');
      cartItemDiv.textContent = `${item.quantity}x ${item.itemName} `;

      const removeBtn = document.createElement('button');
      removeBtn.textContent = 'Remove';
      removeBtn.className = 'remove-from-cart-btn';
      removeBtn.dataset.index = index;
      cartItemDiv.appendChild(removeBtn);

      fragment.appendChild(cartItemDiv);
    });

    cartDiv.appendChild(fragment);
    cartTotalSpan.textContent = `${appCurrency}${total.toFixed(2)}`;
  };

  // This event listener now correctly handles adding items to the cart
  document.getElementById("menu").addEventListener("click", (event) => {
    if (event.target.classList.contains("add-to-cart-btn")) {
      const itemId = event.target.dataset.id;
      const itemName = event.target.dataset.name;
      const price = parseFloat(event.target.dataset.price);
      const quantityInput = document.getElementById(`quantity-${itemId}`);
      const quantity = parseInt(quantityInput.value, 10);
      cart.push({ itemId, itemName, price, quantity });
      renderCart();
      showToast(`${quantity}x ${itemName} added to cart!`);
    }
  });

  document.getElementById("cart").addEventListener("click", (event) => {
    if (event.target.classList.contains("remove-from-cart-btn")) {
      const index = parseInt(event.target.dataset.index, 10);
      cart.splice(index, 1);
      renderCart();
    }
  });

  // This now uses toasts for user feedback instead of alerts
  document.getElementById("placeOrderBtn").onclick = async () => {
    if (cart.length === 0) {
      showToast("Your cart is empty!", "error");
      return;
    }
    if (!userProfile.address) {
      showToast("Please update your profile with an-address before ordering.", "error");
      return;
    }

    const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const orderData = { 
      items: cart, 
      user: getUserEmail(), 
      status: "Pending",
      createdAt: new Date(),
      total: total,
      deliveryAddress: userProfile.address,
      deliveryLocation: null,
      phoneNumber: userProfile.phone || '',
      specialNotes: userProfile.notes || ''
    };

    const lat = userProfile.location?.latitude ?? userProfile.latitude;
    const lon = userProfile.location?.longitude ?? userProfile.longitude;
    if (lat && lon) {
      orderData.deliveryLocation = new GeoPoint(lat, lon);
    }

    // IMPORTANT: In a production environment, order placement should be handled
    // by a secure backend (e.g., Firebase Cloud Functions) to validate data,
    // prevent fraud, and ensure proper inventory management.
    await addDoc(collection(db, "orders"), orderData);
    cart.length = 0; // Clear the array
    renderCart();
    showToast("Order placed successfully!");
  };
}
