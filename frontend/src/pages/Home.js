import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div>
      <section className="bg-primary text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Welcome to HackIT Platform</h1>
          <p className="text-xl mb-10">The ultimate hackathon management solution</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/register" className="bg-white text-primary px-6 py-3 rounded-md font-semibold hover:bg-gray-100 transition">Get Started</Link>
            <Link to="/teams" className="bg-transparent border-2 border-white px-6 py-3 rounded-md font-semibold hover:bg-white hover:text-primary transition">Explore Teams</Link>
          </div>
        </div>
      </section>
      
      <section className="py-16 container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="bg-primary text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">1</div>
            <h3 className="text-xl font-semibold mb-3">Register & Form Teams</h3>
            <p className="text-gray-600">Sign up and create or join a team with fellow innovators.</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="bg-primary text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">2</div>
            <h3 className="text-xl font-semibold mb-3">Build Your Project</h3>
            <p className="text-gray-600">Collaborate with your team to build something amazing.</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="bg-primary text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">3</div>
            <h3 className="text-xl font-semibold mb-3">Submit & Win</h3>
            <p className="text-gray-600">Submit your project and compete for awesome prizes.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
