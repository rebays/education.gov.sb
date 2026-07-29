import { NextResponse } from 'next/server';
import { cmsFetch } from '@/lib/cms';

export async function POST(request: Request) {
  try {
    const { query, variables } = await request.json();
    if (typeof query !== 'string' || !query.trim()) {
      return NextResponse.json({ error: 'Missing query' }, { status: 400 });
    }
    const data = await cmsFetch(query, variables ?? {});
    return NextResponse.json({ data });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
