import { NextRequest, NextResponse } from 'next/server';
import { getRepositoriesForDisplay } from '@/lib/github-service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const starred = searchParams.get('starred') === 'true';
    const pinned = searchParams.get('pinned') !== 'false'; // Default to true
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const username = searchParams.get('username') || undefined;
    const sort = (searchParams.get('sort') || 'updated') as
      | 'created'
      | 'updated'
      | 'pushed'
      | 'full_name';

    const repositories = await getRepositoriesForDisplay({
      sort,
      limit,
      starred,
      username,
      pinned,
    });

    return NextResponse.json(repositories);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch repositories' },
      { status: 500 }
    );
  }
}
