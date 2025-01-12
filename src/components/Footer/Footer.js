import React from "react";

const Footer = () => {
  return (
    <footer className="bg-black text-white">
      <div className="container mx-auto px-4 py-6 text-center">
        <p className="text-sm">
          &copy; {new Date().getFullYear()} User Management. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
