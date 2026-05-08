import { useRouter } from 'next/navigation';

export default function NavigationTestPage() {
  const router = useRouter();
  
  return (
    <div>
      <a href="/test">Click here</a>
      <button onClick={() => router.forward()}>
        Write and Redirect
      </button>
    </div>
  );
}