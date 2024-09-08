import axios from 'axios';

const WORDPRESS_API_URL = process.env.NEXT_PUBLIC_WORDPRESS_API_URL;
const WORDPRESS_CATEGORY_SLUG = process.env.NEXT_PUBLIC_WORDPRESS_CATEGORY_SLUG;

// 缓存对象
const categoryCache: { [slug: string]: number } = {};

async function getCategoryIdBySlug(slug: string): Promise<number | null> {
    if (categoryCache[slug]) {
        return categoryCache[slug];
    }

    try {
        const response = await axios.get(`${WORDPRESS_API_URL}/categories`, {
            params: { slug },
        });
        if (response.data && response.data.length > 0) {
            const categoryId = response.data[0].id;
            categoryCache[slug] = categoryId;
            return categoryId;
        }
        return null;
    } catch (error) {
        console.error('Error fetching category ID:', error);
        return null;
    }
}

interface WordPressPost {
    id: number;
    slug: string;
    title: { rendered: string };
    content: { rendered: string };
    excerpt: { rendered: string };
    featured_media: number;
    _embedded?: {
        'wp:featuredmedia'?: Array<{
            source_url: string;
            alt_text: string;
        }>;
    };
}

export async function getPostsByCategory(page: number = 1): Promise<{ posts: WordPressPost[], totalPages: number }> {
    const categoryId = await getCategoryIdBySlug(WORDPRESS_CATEGORY_SLUG || '');
    if (!categoryId) {
        throw new Error('Category not found');
    }

    const response = await axios.get(`${WORDPRESS_API_URL}/posts`, {
        params: {
            categories: categoryId,
            page,
            _embed: true,
        },
    });

    const posts: WordPressPost[] = response.data;
    const totalPages = parseInt(response.headers['x-wp-totalpages'] || '1', 10);
    return { posts, totalPages };
}

export async function getPostBySlug(slug: string): Promise<WordPressPost | null> {
    try {
        const response = await axios.get(`${WORDPRESS_API_URL}/posts`, {
            params: {
                slug,
                _embed: true,
            },
        });
        const posts: WordPressPost[] = response.data;
        return posts.length > 0 ? posts[0] : null;
    } catch (error) {
        console.error('Error fetching post by slug:', error);
        return null;
    }
}