export type ApiPostRow = {
  id: number | string;
  description?: string | null;
  Image?: string | null;
  createdAt?: string | null;
  userId?: number | null;
  userName?: string | null;
  userImage?: string | null;
};

async function fetchJson<T>(url: string) {
  const res = await fetch(url);
  const json = await res.json();
  if (!res.ok) throw new Error(json?.error || "API error");
  return json as T;
}

export async function fetchPosts() {
  return fetchJson<{ data: ApiPostRow[] }>("/actions/userposts");
}

export async function fetchPostById(id: string) {
  return fetchJson<{ data: ApiPostRow }>(`/actions/userposts/${id}`);
}
