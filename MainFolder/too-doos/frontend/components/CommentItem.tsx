'use client';

import { useSession, signIn } from 'next-auth/react';

interface User {
  id: string;
  email: string;
}

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  user: User;
}

interface CommentItemProps {
  comment: Comment;
  taskId: string;
  onCommentDeleted: () => void;
}

const CommentItem: React.FC<CommentItemProps> = ({ comment, taskId, onCommentDeleted }) => {
  const { data: session, status } = useSession();
  const isAuthor = session?.user?.email === comment.user.email;

  const handleDelete = async () => {
    if (status !== 'authenticated' || !session?.accessToken) {
      signIn('keycloak');
      return;
    }

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/tasks/${taskId}/comments/${comment.id}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.accessToken}`,
          },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to delete comment');
      }

      onCommentDeleted();
    } catch (err: any) {
      console.error(err.message);
    }
  };

  return (
    <div className="comment">
      <div className="box">
        <p>{comment.content}</p>
        <small>
          By: {comment.user.email} on{' '}
          {new Date(comment.createdAt).toLocaleString('pl-PL')}
        </small>
        {isAuthor && (
          <button onClick={handleDelete}>Delete</button>
        )}
      </div>
    </div>
  );
};

export default CommentItem;
