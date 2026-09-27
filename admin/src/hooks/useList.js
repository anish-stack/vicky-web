import { useCallback, useEffect, useRef, useState } from "react";
import api from "../lib/api";
import { cleanParams } from "../lib/format";

/** Paginated list loader for the API's `{data, payload:{pagination}}` shape. */
export default function useList(path, initial = {}, perPage = 20) {
  const [params, setParams] = useState({ page: 1, items_per_page: perPage, search: "", ...initial });
  const [rows, setRows] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const reqId = useRef(0);

  const load = useCallback(async () => {
    const id = ++reqId.current;
    setLoading(true);
    setError("");
    try {
      const res = await api.get(path, { params: cleanParams(params) });
      if (id !== reqId.current) return;
      setRows(res.data || []);
      setPagination(res.payload?.pagination || null);
    } catch (e) {
      if (id !== reqId.current) return;
      setRows([]);
      setPagination(null);
      setError(e.message);
    } finally {
      if (id === reqId.current) setLoading(false);
    }
  }, [path, params]);

  useEffect(() => { load(); }, [load]);

  const setFilter = (key, value) => setParams((p) => ({ ...p, [key]: value, page: key === "page" ? value : 1 }));

  return { rows, pagination, loading, error, params, setFilter, reload: load };
}
