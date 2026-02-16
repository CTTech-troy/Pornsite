import React from 'react';

export default function Leaderboard() {
  const [items, setItems] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    let mounted = true;
    const base = (import.meta.env && import.meta.env.VITE_API_URL) ? String(import.meta.env.VITE_API_URL).replace(/\/$/, '') : '';
    const url = `${base}/api/videos/pornstars?limit=100`;
    (async () => {
      try {
        const res = await fetch(url);
        if (!mounted) return;
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const body = await res.json();
        const data = Array.isArray(body) ? body : (body && body.data ? body.data : []);
        const threshold = 661;
        // filter out default avatars
        const filtered = data.filter(d => d && d.star_thumb && !d.star_thumb.includes('pornstars/default'));

        // place users with videos_count_all > threshold at the top (sorted desc by videos_count_all),
        // then the rest alphabetically by name
        filtered.sort((a, b) => {
          const ai = Number(a.videos_count_all) || 0;
          const bi = Number(b.videos_count_all) || 0;
          const aHot = ai > threshold;
          const bHot = bi > threshold;
          if (aHot && bHot) return bi - ai; // both hot -> higher video count first
          if (aHot) return -1; // a hot -> before b
          if (bHot) return 1;  // b hot -> before a
          return String(a.name || '').localeCompare(String(b.name || ''), undefined, { sensitivity: 'base' });
        });

        // assign ranks and slice to 100 (or desired)
        const ranked = filtered.slice(0, 100).map((item, idx) => ({ ...item, rank: idx + 1 }));
        setItems(ranked);
      } catch (err) {
        console.error('Leaderboard fetch error:', err);
        setError(err.message || 'Failed to load');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-500">Error: {error}</div>;
  if (!items.length) return <div className="p-6">No items</div>;

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">Leaderboard — Top {items.length}</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {items.map((s, i) => (
          <div key={s.id || i} className="flex items-center gap-3 p-3 bg-white rounded-lg shadow">
            <img src={s.star_thumb} alt={s.name} className="w-16 h-16 rounded-full object-cover" />
            <div>
              <div className="font-bold">{s.name || 'Unknown'}</div>
              <div className="text-sm text-gray-500">{s.videos_count_all || 0} videos</div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}