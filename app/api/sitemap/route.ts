import { NextResponse } from 'next/server';
import { getAllPosts } from '@/lib/wordpress';

export async function GET() {
    const posts = await getAllPosts();
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://phind-ai.com';

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    ${posts.map(post => `
    <url>
        <loc>${baseUrl}/en/blog/${post.slug}</loc>
        <lastmod>${new Date().toISOString()}</lastmod>
    </url>
    `).join('')}
</urlset>`;

    return new NextResponse(xml, {
        headers: {
            'Content-Type': 'application/xml',
        },
    });
}