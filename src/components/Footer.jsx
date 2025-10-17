// FILE: src/components/Footer.jsx
const Footer = () => {
  return (
    <footer className="w-full text-center py-4 text-gray-400 bg-black relative z-10">
      &copy; {new Date().getFullYear()} Md Ashfaqur Rahman Khan. All rights reserved.
    </footer>
  );
};

export default Footer;
