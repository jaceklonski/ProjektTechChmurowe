'use client';

import { useState, useEffect } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  email: string;
  role: string;
  createdAt: string;
}

interface Stats {
  tasksToday: number;
  tasksWeek: number;
  tasksMonth: number;
  tasksYear: number;
  usersCount: number;
  avgTasksPerUser: number;
  activeUsersWeek: number;
}

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

 useEffect(() => {
    if (status === 'unauthenticated') {
      signIn('keycloak');
    }
  }, [status]);

  useEffect(() => {
    if (status !== 'authenticated' || !session?.accessToken) return;

    const fetchUsers = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/users`,
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${session.accessToken}`,
            },
          }
        );
        const data = await response.json();
        if (response.ok) {
          setUsers(data.users);
        } else {
          setError(data.error || 'Błąd podczas pobierania użytkowników.');
        }
      } catch {
        setError('Wystąpił błąd podczas pobierania użytkowników.');
      }
    };

    const fetchStats = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/statistics`,
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${session.accessToken}`,
            },
          }
        );
        const data = await response.json();
        if (response.ok) {
          setStats(data);
        }
      } catch {
        console.error('Błąd podczas pobierania statystyk.');
      }
    };

    Promise.all([fetchUsers(), fetchStats()]).finally(() => {
      setLoading(false);
    });
  }, [session, status]);

  if (status === 'loading' || loading) {
    return <div>Loading...</div>;
  }

  if (error === 'Brak uprawnień administracyjnych.') {
    return <div>Brak dostępu</div>;
  }

  const filteredUsers = users.filter((user) =>
    user.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (userId: string) => {
    if (!confirm('Czy na pewno chcesz usunąć tego użytkownika?')) return;
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/users/${userId}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session?.accessToken}`,
          },
        }
      );
      const data = await response.json();
      if (response.ok) {
        setUsers(users.filter((user) => user.id !== userId));
      } else {
        alert(data.error || 'Błąd usuwania użytkownika');
      }
    } catch {
      alert('Błąd usuwania użytkownika');
    }
  };

  const handleEdit = (userId: string) => {
    router.push(`/admin/edit/${userId}`);
  };

  return (
    <div className="content">
      <h1>User Management Panel</h1>

      {error && error !== 'Brak uprawnień administracyjnych.' && (
        <p className="error">{error}</p>
      )}

      {stats && (
        <div className="content2">
          <h2>Statystyki</h2>
          <p>Dodane zadania dzisiaj: {stats.tasksToday}</p>
          <p>Dodane zadania w tym tygodniu: {stats.tasksWeek}</p>
          <p>Dodane zadania w tym miesiącu: {stats.tasksMonth}</p>
          <p>Dodane zadania w tym roku: {stats.tasksYear}</p>
          <p>Zarejestrowane konta: {stats.usersCount}</p>
          <p>
            Średnio zadań na użytkownika: {stats.avgTasksPerUser.toFixed(2)}
          </p>
          <p>Aktywni użytkownicy w tym tygodniu: {stats.activeUsersWeek}</p>
        </div>
      )}

      <div className="content">
        <input
          className="input"
          type="text"
          placeholder="Szukaj użytkownika..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <table border={1} cellPadding={10}>
          <thead>
            <tr>
              <th>Email</th>
              <th>Rola</th>
              <th>Utworzono</th>
              <th>Akcje</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td>{user.email}</td>
                  <td>{user.role}</td>
                  <td>
                    {new Date(user.createdAt).toLocaleDateString('pl-PL')}
                  </td>
                  <td>
                    <button onClick={() => handleEdit(user.id)}>Edytuj</button>{' '}
                    <button onClick={() => handleDelete(user.id)}>
                      Usuń
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4}>Brak zarejestrowanych użytkowników</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
