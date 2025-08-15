import { db, getUserEmail } from './auth.js';
import { collection, onSnapshot, query, where, Timestamp, orderBy } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { showToast } from './ui.js';

export function setupOrders() {
  // Query for user's orders and sort them by most recent first.
  // NOTE: This query requires a composite index in Firestore on `user` (asc) and `createdAt` (desc).
  // Firestore will provide a link to create this index in the browser console if it's missing.
  // For very large datasets, consider implementing pagination or infinite scrolling
  // to optimize performance and reduce Firestore read costs.
  const ordersRef = query(
    collection(db, "orders"), 
    where("user", "==", getUserEmail()),
    orderBy("createdAt", "desc")
  );
  let isFirstLoad = true; // Flag to prevent notifications on initial page load

  onSnapshot(ordersRef, snapshot => {
    const orderDiv = document.getElementById("myOrders");
    orderDiv.innerHTML = ""; // Clear existing content once

    const fragment = document.createDocumentFragment(); // Use a fragment for performance

    snapshot.docChanges().forEach((change) => {
      const data = change.doc.data();
      const docId = change.doc.id;

      // Notify user on order status change
      if (change.type === "modified" && !isFirstLoad) {
        showToast(`Your order status has been updated to: ${data.status}`);
      }

      // Always re-render the order list
      const orderContainer = document.createElement('div');

      const title = document.createElement('h4');
      const orderDate = data.createdAt ? data.createdAt.toDate().toLocaleString() : 'Date not available';
      title.textContent = `Order placed on ${orderDate}`;
      orderContainer.appendChild(title);

      const itemList = document.createElement('ul');
      (data.items || []).forEach(item => {
        const listItem = document.createElement('li');
        // Assuming item.itemName is from a controlled list (the menu) and is safe.
        listItem.textContent = `${item.quantity}x ${item.itemName} (${(item.price * item.quantity).toFixed(2)})`;
        itemList.appendChild(listItem);
      });
      orderContainer.appendChild(itemList);

      const totalP = document.createElement('p');
      const orderTotal = typeof data.total === 'number' ? data.total : 0;
      totalP.textContent = `Total: $${orderTotal.toFixed(2)}`;
      orderContainer.appendChild(totalP);

      const statusP = document.createElement('p');
      statusP.textContent = `Status: ${data.status || "Pending"}`;
      orderContainer.appendChild(statusP);

      const addressP = document.createElement('p');
      addressP.textContent = `Deliver to: ${data.deliveryAddress || 'N/A'}`;
      orderContainer.appendChild(addressP);

      if (data.deliveryLocation) {
        const locationP = document.createElement('p');
        const locationA = document.createElement('a');
        locationA.href = `https://www.google.com/maps/search/?api=1&query=${data.deliveryLocation.latitude},${data.deliveryLocation.longitude}`;
        locationA.target = '_blank';
        locationA.textContent = `${data.deliveryLocation.latitude.toFixed(4)}, ${data.deliveryLocation.longitude.toFixed(4)}`;
        locationP.textContent = 'Location: ';
        locationP.appendChild(locationA);
        orderContainer.appendChild(locationP);
      }

      if (data.phoneNumber) {
        const phoneP = document.createElement('p');
        phoneP.textContent = `Phone: ${data.phoneNumber}`;
        orderContainer.appendChild(phoneP);
      }

      if (data.specialNotes) {
        const notesP = document.createElement('p');
        notesP.textContent = `Notes: ${data.specialNotes}`;
        orderContainer.appendChild(notesP);
      }

      fragment.appendChild(orderContainer);
    });

    orderDiv.appendChild(fragment); // Append all new elements at once
    isFirstLoad = false; // After the first render, any change is a real update
  });
}

/**
 * Sets up a real-time listener for orders placed in the last hour.
 */
export function setupCurrentOrders() {
  // NOTE: This query uses the same composite index as setupOrders().
  // (`user` asc, `createdAt` desc).
  // For very large datasets, consider implementing pagination or infinite scrolling
  // to optimize performance and reduce Firestore read costs.
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const currentOrdersRef = query(
    collection(db, "orders"),
    where("user", "==", getUserEmail()),
    where("createdAt", ">=", Timestamp.fromDate(oneHourAgo)),
    orderBy("createdAt", "desc") // Add sorting for consistency
  );

  onSnapshot(currentOrdersRef, snapshot => {
    const container = document.getElementById("currentOrdersContainer");
    const listDiv = document.getElementById("currentOrders");
    if (!container || !listDiv) return; // Exit if elements aren't on the page

    if (snapshot.empty) {
      container.hidden = true;
      return;
    }

    container.hidden = false;
    listDiv.innerHTML = "";
    const fragment = document.createDocumentFragment();

    snapshot.forEach(doc => {
      const data = doc.data();
      const orderItem = document.createElement('div');
      orderItem.className = 'current-order-item';

      const total = typeof data.total === 'number' ? data.total.toFixed(2) : 'N/A';
      const status = data.status || 'Pending';

      orderItem.innerHTML = `
        <p><strong>Order Total:</strong> $${total}</p>
        <p><strong>Status:</strong> <span class="status-${status.toLowerCase()}">${status}</span></p>
      `;
      fragment.appendChild(orderItem);
    });
    listDiv.appendChild(fragment);
  }, error => {
    console.error("Error fetching current orders:", error);
    showToast("Could not fetch current orders.", "error");
  });
}
