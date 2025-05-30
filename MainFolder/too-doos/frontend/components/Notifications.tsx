import { useState, useEffect } from 'react';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/notifications');
      const data = await res.json();
      if (res.ok) {
        setNotifications(data.notifications);
      } else {
        setError(data.error || 'Error');
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError('Błąd podczas pobierania powiadomień.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleNotificationClick = async (notificationId) => {
    try {
      const res = await fetch(`/api/notifications?id=${notificationId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok) {
        setNotifications((prev) =>
          prev.filter((notification) => notification.id !== notificationId)
        );
      } else {
        console.error('Błąd podczas usuwania powiadomienia:', data.error);
      }
    } catch (err) {
      console.error('Błąd podczas usuwania powiadomienia:', err);
    }
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div>
      <h2 className='title'>Notifications</h2>
      {notifications.length === 0 ? (
        <p>You are up to date</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {notifications.map((notification) => (
            <li
              className='border'
              key={notification.id}
              onClick={() => handleNotificationClick(notification.id)}
            >
              {notification.content}
              <span className='details'>X</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Notifications;
