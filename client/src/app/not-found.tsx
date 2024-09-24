import React from 'react'

export default function NotFound() {
    return (
        <div className='text-center py-12'>
            <p className='text-2xl font-bold mb-3'>404 - Page Not Found</p>
            <p>The page you&#39;re looking for doesn&#39;t exist.</p>
            <p>Click <a href="/" className='underline text-blue-500'>here</a> to start a game</p>
        </div>
    )
}