import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Orders.css';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const token = localStorage.getItem('access_token');

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
      setOrders(res.data.results || []);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
      setError('Failed to load order history.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    const confirm = window.confirm(`Are you sure you want to cancel Order #${orderId}?`);
    if (!confirm) return;

    try {
      await axios.post(`http://localhost:8000/api/orders/${orderId}/cancel/`, {}, axiosConfig);
      fetchOrders(); // refresh list
    } catch (err) {
      console.error('Cancel failed:', err);
      alert('Failed to cancel order.');
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
        <>
          {orders.map((order) => {
            const orderTime = new Date(order.created_at).toLocaleString();
            const items = order.items.map((item) => {
              const name = item.menu_item_name || item.menu_item?.name || `Item #${item.menu_item?.id || 'N/A'}`;
              const quantity = item.quantity;
              const price = parseFloat(item.menu_item_price ?? item.menu_item?.price ?? 0);
              return {
                name,
                quantity,
                price,
                subtotal: price * quantity,
              };
            });

            const total = parseFloat(order.total_amount || 0).toFixed(2);

            return (
              <div className="order-card" key={order.id}>
                <div className="order-header">Order #{order.id}</div>
                <p><strong>Status:</strong> {order.status}</p>
                <p><strong>Placed On:</strong> {orderTime}</p>
                {order.notes && <p><strong>Notes:</strong> {order.notes}</p>}

                <ul className="order-items">
                  {items.map((item, index) => (
                    <li key={index}>
                      {item.name} × {item.quantity} = ₹{item.subtotal.toFixed(2)}
                    </li>
                  ))}
                </ul>

                <div className="order-total"><strong>Total:</strong> ₹{total}</div>

                <div className="order-actions">
                  {order.status === "PLACED" && (
                    <button className="cancel-order-btn" onClick={() => handleCancelOrder(order.id)}>
                      ❌ Cancel Order
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </>
      )}
    </div>
  );
};

export default Orders;
