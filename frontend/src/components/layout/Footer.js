import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-dark text-white p-6 mt-10">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <h2 className="text-lg font-bold">HackIT Platform</h2>
            <p className="text-sm text-gray-300">Empowering innovation through hackathons</p>
          </div>
          <div className="text-sm text-gray-300">
            &copy; {new Date().getFullYear()} HackIT. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
