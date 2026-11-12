import { useEffect, useState } from 'react';
import './App.css'

function App() {

  type Health = {
    status: string;
    database: string;
    time: string;
  }

  const [health, setHealth] = useState<Health | null>(null);

  useEffect(() => {
    fetch('/api/health')
      .then(response => response.json())
      .then(data => setHealth(data))
      .catch(error => console.error('Error fetching health data:', error));
  }, []);

  return (
    <>
      <h1>Chefie</h1>
      <p>Health Status: {health ? health.status : 'Loading...'}</p>
      <p>Database: {health ? health.database : 'Loading...'}</p>
      <p>Time: {health ? health.time : 'Loading...'}</p>
    </>
  )
}

export default App
