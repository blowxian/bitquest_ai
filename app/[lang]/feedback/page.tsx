'use client'

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import TopNavBar from "@/components/TopNavBar";
import { SessionProvider } from '@/app/context/sessionContext';
import { notifyFeishu } from '@/lib/feishu';

export default function FeedbackPage() {
    const params = useParams()!;
    const lang = params.lang as string;
    const [formData, setFormData] = useState({ name: '', email: '', message: '' });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const message = `New Feedback:\nName: ${formData.name}\nEmail: ${formData.email}\nMessage: ${formData.message}`;
        await notifyFeishu(message);
        alert('Thank you for your feedback!');
        setFormData({ name: '', email: '', message: '' });
    };

    return (
        <SessionProvider>
            <div className="flex min-h-screen flex-col">
                <TopNavBar lang={lang} />
                <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-16 sm:mt-20">
                    <h1 className="text-3xl sm:text-4xl font-bold mb-6 text-gray-800">Feedback</h1>
                    <p className="mb-8 text-lg text-gray-600">We value your feedback. Please share your thoughts with us in {lang}.</p>
                    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto bg-white shadow-md rounded-lg p-6">
                        <div className="mb-4">
                            <label htmlFor="name" className="block text-gray-700 font-semibold mb-2">Name</label>
                            <input type="text" id="name" value={formData.name} onChange={handleChange} className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                        </div>
                        <div className="mb-4">
                            <label htmlFor="email" className="block text-gray-700 font-semibold mb-2">Email</label>
                            <input type="email" id="email" value={formData.email} onChange={handleChange} className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                        </div>
                        <div className="mb-6">
                            <label htmlFor="message" className="block text-gray-700 font-semibold mb-2">Message</label>
                            <textarea id="message" value={formData.message} onChange={handleChange} rows={4} className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500" required></textarea>
                        </div>
                        <button type="submit" className="w-full bg-blue-500 text-white font-semibold py-2 px-4 rounded hover:bg-blue-600 transition-colors">Submit</button>
                    </form>
                </main>
            </div>
        </SessionProvider>
    );
}