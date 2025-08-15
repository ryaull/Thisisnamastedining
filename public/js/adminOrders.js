import { db } from '/js/config/firebase.js';
import { collection, onSnapshot, query, doc, updateDoc, orderBy } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { showToast } from './ui.js';


export function setupAdminOrders() {
    const ordersRef = query(collection(db, "orders"), orderBy("createdAt", "desc"));
    const ordersDiv = document.getElementById("orders");
    const orderTagFilterInput = document.getElementById("orderTagFilter");

    let allOrders = []; // Cache for all orders

    function renderFilteredOrders() {
        const filterTags = orderTagFilterInput.value.toLowerCase().split(',').map(tag => tag.trim()).filter(tag => tag);

        ordersDiv.innerHTML = ""; // Clear previous orders
        const fragment = document.createDocumentFragment();
        let totalRevenue = 0;
        let totalOrdersCount = 0;

        const filteredOrders = allOrders.filter(order => {
            if (filterTags.length === 0) return true; // No filter, show all
            // Check if any item in the order has a tag that matches the filter
            return order.items.some(item => 
                item.tags && item.tags.some(itemTag => 
                    filterTags.some(filterTag => itemTag.toLowerCase().includes(filterTag))
                )
            );
        });

        filteredOrders.forEach(order => {
            totalOrdersCount++;
            const orderId = order.id;

            const container = document.createElement('div');
            container.className = 'order-item-admin';

            const title = document.createElement('h4');
            const orderDate = order.createdAt ? order.createdAt.toDate().toLocaleString() : 'Date not available';
            title.textContent = `Order from ${order.user} on ${orderDate}`;
            container.appendChild(title);

            const itemList = document.createElement('ul');
            (order.items || []).forEach(item => {
                const li = document.createElement('li');
                li.textContent = `${item.quantity}x ${item.itemName}`;
                if (item.tags && item.tags.length > 0) {
                    li.textContent += ` (Tags: ${item.tags.join(', ')})`;
                }
                itemList.appendChild(li);
            });
            container.appendChild(itemList);

            const totalP = document.createElement('p');
            const orderTotal = typeof order.total === 'number' ? order.total : 0;
            totalP.textContent = `Total: $${orderTotal.toFixed(2)}`;
            totalRevenue += orderTotal;
            container.appendChild(totalP);

            const addressP = document.createElement('p');
            addressP.textContent = `Address: ${order.deliveryAddress || 'N/A'}`;
            container.appendChild(addressP);

            // Status changer dropdown
            const statusContainer = document.createElement('div');
            const statusLabel = document.createElement('label');
            statusLabel.textContent = 'Status: ';
            statusLabel.htmlFor = `status-${orderId}`;

            const statusSelect = document.createElement('select');
            statusSelect.id = `status-${orderId}`;
            statusSelect.dataset.orderId = orderId;
            const statuses = ["Pending", "Preparing", "Out for Delivery", "Completed", "Cancelled"];
            statuses.forEach(status => {
                const option = document.createElement('option');
                option.value = status;
                option.textContent = status;
                if (order.status === status) option.selected = true;
                statusSelect.appendChild(option);
            });

            statusContainer.append(statusLabel, statusSelect);
            container.appendChild(statusContainer);
            fragment.appendChild(container);
        });

        ordersDiv.appendChild(fragment);

        // Update dashboard stats (these are still based on ALL orders, not filtered ones)
        // If you want these to reflect filtered orders, move them inside the filteredOrders.forEach loop
        document.getElementById('total-orders-stat').textContent = allOrders.length;
        document.getElementById('total-revenue-stat').textContent = `${allOrders.reduce((sum, order) => sum + order.total, 0).toFixed(2)}`;
    }

    onSnapshot(ordersRef, snapshot => {
        allOrders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        renderFilteredOrders(); // Initial render and re-render on data change
    });

    // Use event delegation to handle all status changes
    ordersDiv.addEventListener('change', async (e) => {
        if (e.target.tagName === 'SELECT' && e.target.dataset.orderId) {
            const orderId = e.target.dataset.orderId;
            const newStatus = e.target.value;
            const orderDocRef = doc(db, "orders", orderId);
            await updateDoc(orderDocRef, { status: newStatus });
            showToast(`Order status updated to ${newStatus}.`);
        }
    });

    // Event listener for tag filter input
    orderTagFilterInput.addEventListener('input', renderFilteredOrders);
}
