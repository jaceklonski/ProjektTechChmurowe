'use client';

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
  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/tasks/${taskId}/comments/${comment.id}`, {
        method: 'DELETE',
      });

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
        By: {comment.user.email} on {new Date(comment.createdAt).toLocaleString('pl-PL')}
      </small>
      <button onClick={handleDelete}>Delete</button>
      </div>
    </div>
  );
};

export default CommentItem;
