import { useEffect, useState } from "react";
import api from "../lib/api";

const cache = {};

/** Loads a full (unpaginated) list once and caches it for the session. */
export default function useOptions(path, { fresh = false } = {}) {
  const [data, setData] = useState(cache[path] || []);
  const [loading, setLoading] = useState(!cache[path]);
  useEffect(() => {
    if (cache[path] && !fresh) return;
    let alive = true;
    api
      .get(path)
      .then((res) => {
        cache[path] = res.data || [];
        if (alive) setData(cache[path]);
      })
      .catch(() => alive && setData([]))
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, [path, fresh]);
  return { data, loading };
}

export const clearOptions = (path) => { if (path) delete cache[path]; else Object.keys(cache).forEach((k) => delete cache[k]); };
