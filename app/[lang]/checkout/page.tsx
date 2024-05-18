// app/checkout/page.tsx
'use client';

import React, { useEffect, useRef } from 'react';

const CheckoutPage: React.FC = () => {
    const formRef = useRef<HTMLFormElement>(null);

    useEffect(() => {
        // Automatically submit the form when the component mounts
        if (formRef.current) {
            formRef.current.submit();
        }
    }, []);

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <div className="redirecting">
                正在跳转<span>.</span><span>.</span><span>.</span>
            </div>
            <form ref={formRef} action="/api/checkout_sessions" method="POST" style={{ display: 'none' }}>
                <button type="submit" role="link">Checkout</button>
            </form>
            <style jsx>{`
                .redirecting {
                    font-size: 24px;
                    font-weight: bold;
                }
                .redirecting span {
                    opacity: 0;
                    animation: fade 1.5s infinite;
                }
                .redirecting span:nth-child(1) {
                    animation-delay: 0s;
                }
                .redirecting span:nth-child(2) {
                    animation-delay: 0.5s;
                }
                .redirecting span:nth-child(3) {
                    animation-delay: 1s;
                }
                @keyframes fade {
                    0%, 100% { opacity: 0; }
                    50% { opacity: 1; }
                }
            `}</style>
        </div>
    );
};

export default CheckoutPage;