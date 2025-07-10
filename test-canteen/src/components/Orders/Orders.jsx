import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Orders.css';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const token = localStorage.getItem('access_token');
  const user = JSON.parse(localStorage.getItem('user'));

  const axiosConfig = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const fetchOrders = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get('http://localhost:8000/api/orders/', axiosConfig);
      const apiOrders = res.data.results || [];

      let localOrders = [];
      if (user?.email) {
        const localKey = `orderHistory_${user.email}`;
        localOrders = JSON.parse(localStorage.getItem(localKey)) || [];
      }

      const combinedOrders = [...localOrders, ...apiOrders];
      setOrders(combinedOrders);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
      setError('Failed to load order history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="orders-container">
      <h2 className="orders-title">Order History</h2>

      {loading ? (
        <p>Loading your orders...</p>
      ) : error ? (
        <p style={{ color: 'red' }}>{error}</p>
      ) : orders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        <div className="orders-table-wrapper">
          <table className="orders-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Date</th>
                <th>Status</th>
                <th>Items</th>
                <th>Total (₹)</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order, index) => {
                const orderTime = new Date(order.created_at || order.time).toLocaleString();
                const items = (order.items || []).map((item) => {
                  const name =
                    item.menu_item_name ||
                    item.name ||
                    item.menu_item?.name ||
                    `Item #${item.menu_item?.id || 'N/A'}`;
                  const quantity = item.quantity;
                  const price = parseFloat(
                    item.price ?? item.menu_item_price ?? item.menu_item?.price ?? 0
                  );
                  return {
                    name,
                    quantity,
                    price,
                    subtotal: price * quantity,
                  };
                });

                const total = parseFloat(order.total || order.total_amount || 0).toFixed(2);

                return (
                  <tr key={order.id || index}>
                    <td>{order.orderId || order.id}</td>
                    <td>{orderTime}</td>
                    <td>{order.status || 'CONFIRMED'}</td>
                    <td>
                      <ul className="order-items-list">
                        {items.map((item, idx) => (
                          <li key={idx}>
                            {item.name} × {item.quantity} = ₹{item.subtotal.toFixed(2)}
                          </li>
                        ))}
                      </ul>
                    </td>
                    <td>₹{total}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Orders;
