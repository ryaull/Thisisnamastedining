import { db } from '/js/config/firebase.js';
import { appCurrency } from '/js/adminSettings.js';
import { collection, onSnapshot, query, orderBy, limit } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";


function updateStats(orders) {
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
  const pendingOrders = orders.filter(order => order.status === 'Pending').length;
  const completedOrders = orders.filter(order => order.status === 'Completed').length;

  document.getElementById('total-orders-stat').textContent = totalOrders;
  document.getElementById('total-revenue-stat').textContent = `${appCurrency}${totalRevenue.toFixed(2)}`;
  document.getElementById('pending-orders-stat').textContent = pendingOrders;
  document.getElementById('completed-orders-stat').textContent = completedOrders;
}

function updateRecentActivity(orders) {
  const feed = document.getElementById('recent-activity-feed');
  feed.innerHTML = '';
  const recentOrders = orders.slice(0, 5);

  recentOrders.forEach(order => {
    const item = document.createElement('div');
    item.className = 'activity-item';
    item.innerHTML = `
      <div class="activity-icon">&#128221;</div>
      <div class="activity-details">
        <p>New order from ${order.user}</p>
        <p class="activity-time">${order.createdAt.toDate().toLocaleString()}</p>
      </div>
    `;
    feed.appendChild(item);
  });
}

export function setupAdminDashboard() {
  const ordersRef = query(collection(db, "orders"), orderBy("createdAt", "desc"));

  onSnapshot(ordersRef, snapshot => {
    const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    updateStats(orders);
    updateRecentActivity(orders);
  });
}
