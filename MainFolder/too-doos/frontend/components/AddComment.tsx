'use client';

import { useState } from 'react';
import { useSession, signIn } from 'next-auth/react';

interface AddCommentProps {
  taskId: string;
  onCommentAdded: () => void;
}

const AddComment: React.FC<AddCommentProps> = ({ taskId, onCommentAdded }) => {
  const { data: session, status } = useSession();
  const [content, setContent] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (status !== 'authenticated' || !session?.accessToken) {
      signIn('keycloak');
      return;
    }

    if (!content.trim()) {
      setError('Comment cannot be empty');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/tasks/${taskId}/comments`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.accessToken}`,
          },
          body: JSON.stringify({ content }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to add comment');
      }

      setContent('');
      onCommentAdded();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="commentbox" onSubmit={handleSubmit}>
      <textarea
        className="input"
        value={content}
        onChange={e => setContent(e.target.value)}
        placeholder="Add a comment..."
        required
      />
      {error && <p className="error">{error}</p>}
      <button type="submit" disabled={loading}>
        {loading ? 'Adding...' : 'Add Comment'}
      </button>
    </form>
  );
};

export default AddComment;
