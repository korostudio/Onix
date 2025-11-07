import React from 'react';
import LoadingSpinner from './LoadingSpinner';

const LoadingPage: React.FC = () => {
    return (
        <div className="flex items-center justify-center w-full h-96">
            <LoadingSpinner />
        </div>
    )
}

export default LoadingPage;