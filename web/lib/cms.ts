import 'server-only';

const CMS_GRAPHQL_URL = process.env.CMS_GRAPHQL_URL;
if (!CMS_GRAPHQL_URL) throw new Error('CMS_GRAPHQL_URL is not set');

export async function cmsFetch<T>(
  query: string,
  variables: Record<string, unknown> = {},
): Promise<T> {
  const res = await fetch(CMS_GRAPHQL_URL!, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`CMS ${res.status}: ${errorText}`);
  }

  const json = await res.json();

  if (json.errors) {
    throw new Error(JSON.stringify(json.errors));
  }

  return json.data as T;
}