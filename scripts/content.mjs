export function normalizeProjects(input) {
  const ids = new Set();
  for (const p of input) {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(p.id || '')) throw new Error(`Invalid project id: ${p.id}`);
    if (ids.has(p.id)) throw new Error(`Duplicate project id: ${p.id}`);
    ids.add(p.id);
    if (!p.title || !p.category || !p.year) throw new Error(`Missing title, category or year: ${p.id}`);
    if (!Array.isArray(p.blocks || [])) throw new Error(`blocks must be an array: ${p.id}`);
    if (!Array.isArray(p.related || [])) throw new Error(`related must be an array: ${p.id}`);
    if (!Array.isArray(p.links || [])) throw new Error(`links must be an array: ${p.id}`);
    for (const key of ['published','featured','sample']) if(p[key]!==undefined && typeof p[key]!=='boolean') throw new Error(`${key} must be true or false: ${p.id}`);
    for (const b of p.blocks || []) {
      if (!b || !['text','image','pair','embed'].includes(b.type)) throw new Error(`Unknown block: ${p.id}`);
      if (b.type==='pair' && (!Array.isArray(b.images) || b.images.length!==2)) throw new Error(`pair needs exactly two images: ${p.id}`);
    }
  }
  const published = input.filter(p => p.published !== false);
  const publicIds = new Set(published.map(p => p.id));
  return published.map(p => ({ ...p, related: [...new Set(p.related || [])].filter(id => publicIds.has(id) && id !== p.id) }))
    .sort((a,b) => Number(!!b.featured) - Number(!!a.featured) || String(b.year).localeCompare(String(a.year)) || a.title.localeCompare(b.title));
}
export function graphEdges(projects) {
  const edges = new Map();
  for (const p of projects) for (const id of p.related) {
    const pair = [p.id, id].sort(); edges.set(pair.join('|'), pair);
  }
  return [...edges.values()];
}
