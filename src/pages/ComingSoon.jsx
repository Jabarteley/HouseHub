import React from 'react';
import Header from '../components/ui/Header';
import Footer from '../pages/hompage/components/Footer';

const ComingSoon = () => {
  return (
    <div className="min-h-screen bg-background text-text-primary flex flex-col">
      <Header />
      <main className="flex-grow flex items-center justify-center p-8">
        <div className="text-center">
          <h1 className="text-5xl font-bold mb-4">Coming Soon!</h1>
          <p className="text-xl text-text-secondary">We're working hard to bring you this feature.</p>
          <p className="text-md text-text-secondary mt-2">Stay tuned for updates!</p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ComingSoon;
