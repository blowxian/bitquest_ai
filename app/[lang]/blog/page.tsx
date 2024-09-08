'use client'

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import TopNavBar from "@/components/TopNavBar";
import { SessionProvider } from '@/app/context/sessionContext';
import { getPostsByCategory } from '@/lib/wordpress';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBlog, faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";
import Head from 'next/head';

interface WordPressPost {
    id: number;
    slug: string;
    title: { rendered: string };
    excerpt: { rendered: string };
    featured_media: number;
    _embedded?: {
        'wp:featuredmedia'?: Array<{
            source_url: string;
            alt_text: string;
        }>;
    };
}

export default function BlogPage() {
    const params = useParams()!;
    const lang = params.lang as string;

    const [posts, setPosts] = useState<WordPressPost[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchPosts();
    }, [currentPage]);

    const fetchPosts = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const { posts, totalPages } = await getPostsByCategory(currentPage);
            setPosts(posts);
            setTotalPages(totalPages);
        } catch (err) {
            setError('Failed to fetch blog posts. Please try again later.');
        } finally {
            setIsLoading(false);
        }
    };

    const pageTitle = `AI and Machine Learning Blog | Cutting-edge Insights | Page ${currentPage}`;
    const pageDescription = "Explore the latest advancements in AI and machine learning. Our expert-written blog covers research breakthroughs, practical applications, and industry trends.";

    return (
        <SessionProvider>
            <Head>
                <title>{pageTitle}</title>
                <meta name="description" content={pageDescription} />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
            </Head>
            <div className="flex min-h-screen flex-col">
                <TopNavBar lang={lang} />
                <main className="flex-1 mx-auto sm:p-4 pt-20 sm:pt-24 text-customBlackText max-w-6xl w-full">
                    <div className="px-4 sm:px-6 py-8">
                        <h1 className="text-3xl md:text-4xl font-bold mb-4 flex items-center">
                            <FontAwesomeIcon icon={faBlog} className="text-customOrange mr-2" />
                            AI-Powered Language Learning Insights
                        </h1>
                        <p className="mb-6 text-gray-600 text-lg">Explore cutting-edge AI applications in language learning, personalized education techniques, and the latest advancements in NLP for more effective and engaging language acquisition.</p>

                        {isLoading ? (
                            <p className="text-center py-10">Loading posts...</p>
                        ) : error ? (
                            <div className="text-center py-10 text-red-500">
                                <FontAwesomeIcon icon={faExclamationTriangle} className="mr-2" />
                                {error}
                            </div>
                        ) : (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {posts.map((post) => (
                                        <Link href={`/${lang}/blog/${post.slug}`} key={post.id}>
                                            <div className="bg-white shadow-md rounded-lg overflow-hidden cursor-pointer hover:shadow-lg transition-shadow">
                                                {post._embedded?.['wp:featuredmedia']?.[0]?.source_url && (
                                                    <div className="relative h-48 w-full">
                                                        <Image
                                                            src={post._embedded['wp:featuredmedia'][0].source_url}
                                                            alt={post._embedded['wp:featuredmedia'][0].alt_text || post.title.rendered}
                                                            layout="fill"
                                                            objectFit="cover"
                                                        />
                                                    </div>
                                                )}
                                                <div className="p-6">
                                                    <h2 className="text-xl font-semibold mb-3">{post.title.rendered}</h2>
                                                    <div className="text-gray-600" dangerouslySetInnerHTML={{ __html: post.excerpt.rendered }} />
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                                <nav className="mt-8 flex justify-center items-center" aria-label="Pagination">
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                        disabled={currentPage === 1}
                                        className="mx-2 px-4 py-2 bg-customOrange text-white rounded disabled:bg-gray-300 hover:bg-orange-600 transition-colors"
                                        aria-label="Previous page"
                                    >
                                        Previous
                                    </button>
                                    <span className="mx-4 text-gray-600">Page {currentPage} of {totalPages}</span>
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                        disabled={currentPage === totalPages}
                                        className="mx-2 px-4 py-2 bg-customOrange text-white rounded disabled:bg-gray-300 hover:bg-orange-600 transition-colors"
                                        aria-label="Next page"
                                    >
                                        Next
                                    </button>
                                </nav>
                            </>
                        )}
                    </div>
                </main>
            </div>
        </SessionProvider>
    );
}