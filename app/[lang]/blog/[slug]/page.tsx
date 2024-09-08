import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import TopNavBar from "@/components/TopNavBar";
import { getPostBySlug } from '@/lib/wordpress';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";

// Remove 'use client' directive

export async function generateMetadata({ params }: { params: { slug: string; lang: string } }) {
    const post = await getPostBySlug(params.slug);
    return {
        title: post ? post.title.rendered : 'Blog Post',
        description: post ? post.excerpt.rendered.replace(/<[^>]*>/g, '').slice(0, 160) : 'Loading blog post...',
    };
}

export default async function BlogPostPage({ params }: { params: { lang: string; slug: string } }) {
    const { lang, slug } = params;
    const post = await getPostBySlug(slug);

    if (!post) {
        return (
            <div className="flex min-h-screen flex-col">
                <TopNavBar lang={lang} />
                <main className="flex-1 mx-auto sm:p-4 pt-20 sm:pt-24 text-customBlackText max-w-6xl w-full">
                    <div className="px-4 sm:px-6 py-8">
                        <Link href={`/${lang}/blog`} className="inline-flex items-center text-customOrange hover:underline mb-6">
                            <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
                            Back to Blog
                        </Link>
                        <p className="text-center py-10">No post found.</p>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen flex-col">
            <TopNavBar lang={lang} />
            <main className="flex-1 mx-auto sm:p-4 pt-20 sm:pt-24 text-customBlackText max-w-6xl w-full">
                <div className="px-4 sm:px-6 py-8">
                    <Link href={`/${lang}/blog`} className="inline-flex items-center text-customOrange hover:underline mb-6">
                        <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
                        Back to Blog
                    </Link>
                    <article className="bg-white shadow-md rounded-lg overflow-hidden">
                        {post._embedded?.['wp:featuredmedia']?.[0]?.source_url && (
                            <div className="relative h-64 md:h-96 w-full">
                                <Image
                                    src={post._embedded['wp:featuredmedia'][0].source_url}
                                    alt={post._embedded['wp:featuredmedia'][0].alt_text || post.title.rendered}
                                    layout="fill"
                                    objectFit="cover"
                                />
                            </div>
                        )}
                        <div className="p-6">
                            <h1 className="text-3xl md:text-4xl font-bold mb-6">{post.title.rendered}</h1>
                            <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: post.content.rendered }} />
                        </div>
                    </article>
                </div>
            </main>
        </div>
    );
}