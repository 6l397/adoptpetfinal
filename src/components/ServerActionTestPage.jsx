'use client';

import { addPost } from '@/lib/action';
import { deletePost } from '@/lib/action';

export default function ServerActionTestPage() {
  return (
    <div>
      {/* Мінімальна форма для тесту додавання посту */}
      <form action={addPost}>
        <input 
          type="text" 
          name="title" 
          placeholder="title" 
          required 
        />
      </form>

      {/* Мінімальна форма для тесту видалення посту */}
      <form action={deletePost}>
        <input 
          type="text" 
          name="id" 
          placeholder="postId" 
          required 
        />
      </form>
    </div>
  );
}