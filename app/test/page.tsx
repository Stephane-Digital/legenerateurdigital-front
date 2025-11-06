'use client';
import { useEffect, useState } from 'react';

export default function TestApi() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/health`)
      .then(res => res.json())
      .then(setData)
      .catch(console.error);
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h1>🧠 Test API</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
