"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === 'authenticated') {
      if (session.user.role !== 'ADMIN') {
        setError('Brak uprawnień administracyjnych.');
        setLoading(false);
        return;
      }

      const fetchUsers = async () => {
        try {
          const response = await fetch('/api/users');
          const data = await response.json();
          if (response.ok) {
            setUsers(data.users);
          } else {
            setError(data.error || 'Błąd podczas pobierania danych.');
          }
        } catch (err) {
          setError('Wystąpił błąd podczas pobierania danych.');
        } finally {
          setLoading(false);
        }
      };

      const fetchStats = async () => {
        try {
          const res = await fetch('/api/statistics');
          const data = await res.json();
          if (res.ok) {
            setStats(data);
          } else {
            console.error(data.error || 'Error fetching stats');
          }
        } catch (err) {
          console.error('Error fetching stats');
        }
      };

      fetchUsers();
      fetchStats();
    }
  }, [session, status]);

  if (status === 'loading' || loading) {
    return <div>Loading...</div>;
  }

  if (!session || session.user.role !== 'ADMIN') {
    return <div>Unauthorized access</div>;
  }

  const filteredUsers = users.filter((user) =>
    user.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (userId) => {
    if (!confirm('Are you sure you want to delete user?')) return;
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (response.ok) {
        setUsers(users.filter((user) => user.id !== userId));
      } else {
        alert(data.error || 'Delete error');
      }
    } catch (err) {
      alert('Delete error');
    }
  };

  const handleEdit = (userId) => {
    router.push(`/admin/edit/${userId}`);
  };

  return (
    <div className='content'>
      <h1>User Management Panel</h1>

      {error && <p>{error}</p>}

      {stats && (
        <div className='content2'>
          <h2>Stats</h2>
          <p>Tasks added today: {stats.tasksToday}</p>
          <p>Tasks this week: {stats.tasksWeek}</p>
          <p>Tasks this month: {stats.tasksMonth}</p>
          <p>Tasks this year: {stats.tasksYear}</p>
          <p>Registered accounts: {stats.usersCount}</p>
          <p>
            Tasks per user: {stats.avgTasksPerUser.toFixed(2)}
          </p>
          <p>Active users this week: {stats.activeUsersWeek}</p>
        </div>
      )}


      <div className='content'>
      <div>
        <input
          className='input'
          type="text"
          placeholder="Search User..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <table
        border="1"
        cellPadding="10"
      >
        <thead>
          <tr>
            <th>Email</th>
            <th>Role</th>
            <th>Created</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.map((user) => (
            <tr key={user.id}>
              <td>{user.email}</td>
              <td>{user.role}</td>
              <td>{new Date(user.createdAt).toLocaleDateString()}</td>
              <td>
                <button
                  onClick={() => handleEdit(user.id)}
                >
                  Edit
                </button>
                <button onClick={() => handleDelete(user.id)}>Delete</button>
              </td>
            </tr>
          ))}
          {filteredUsers.length === 0 && (
            <tr>
              <td colSpan="4">
                No registered users
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
    </div>
  );
}
