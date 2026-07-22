import { NextResponse } from 'next/server';
import { draftMode } from 'next/headers';
import { cmsFetch } from '@/lib/cms';

type PagePreviewResponse = {
  page: {
    id: string;
    slug: string;
    url: string | null;
    urlPath: string;
  } | null;
};

const PAGE_PREVIEW_QUERY = `
  query GetPagePreview($token: String!) {
    page(token: $token) {
      id
      slug
      url
      urlPath
    }
  }
`;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const previewToken = searchParams.get('token');

    if (!previewToken) {
      return new Response('Missing preview token', { status: 400 });
    }

    const data = await cmsFetch<PagePreviewResponse>(PAGE_PREVIEW_QUERY, {
      token: previewToken,
    });

    if (!data.page) {
      return new Response('Invalid preview token', { status: 401 });
    }

    (await draftMode()).enable();

    const targetUrl = data.page.url || `/${data.page.slug}`;
    const redirectUrl = new URL(targetUrl, request.url);
    redirectUrl.searchParams.set('token', previewToken);

    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error('Preview Route Failure:', error);
    return new Response('Internal Server Error inside Preview Route Handler', { status: 500 });
  }
}