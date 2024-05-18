// components/Overlay.jsx
'use client';

import React, { useEffect } from 'react';
import { loadStripe, Stripe } from '@stripe/stripe-js';


// loadStripe should be called outside the component's render method
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY);

const Overlay = ({ onClose }) => {
    const handleSubscribeClick = () => {
        // Open a new window or tab. Adjust URL as necessary.
        window.open('/checkout', '_blank');
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg max-w-lg w-full relative">
                <button
                    className="absolute top-2 right-4 text-2xl text-gray-600"
                    onClick={onClose}
                >
                    &times;
                </button>
                <h2 className="text-xl font-bold mb-4">Pro</h2>
                <ul className="space-y-4">
                    <li>
                        <strong>LLaMA 3 70B</strong>
                        <p>Meta的高效模型，适合需要高级语言理解和生成的任务，性价比高，提供卓越的性能和输出质量。</p>
                    </li>
                    <li>
                        <strong>Qwen 32B</strong>
                        <p>中型规模的Qwen模型，在成本和性能之间取得了良好平衡，适合各种复杂任务，具有高效的上下文理解能力。</p>
                    </li>
                    <li>
                        <strong>Qwen 72B</strong>
                        <p>更强大的Qwen模型，能够处理更复杂的任务，提供高精度和详细的答案，适用于高需求应用场景。</p>
                    </li>
                    <li>
                        <strong>Mixtral 8x7B</strong>
                        <p>Mixtral的多模型组合版本，利用多个模型的协同效应，提供强大的综合性能，适合广泛的商业和研究应用。</p>
                    </li>
                </ul>
                <div className="flex justify-between mt-6">
                    <div>
                        <h3 className="font-bold">每月</h3>
                        <p>$8 billed 每月</p>
                    </div>
                    <div>
                        <h3 className="font-bold">每年</h3>
                        <p>$40 billed 每年</p>
                        <p className="text-red-500 font-bold text-lg">节省 $56</p>
                    </div>
                </div>
                <button
                    onClick={handleSubscribeClick}
                    className="bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold text-lg py-3 px-6 rounded-full shadow-lg hover:shadow-xl hover:from-purple-500 hover:to-blue-500 transition-transform transform hover:scale-105 active:scale-95 mt-6 w-full"
                >
                    立刻订阅
                </button>
            </div>
        </div>
    );
};

export default Overlay;