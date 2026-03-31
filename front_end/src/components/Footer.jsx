import logo from "../assets/logologin.png";

const Footer = () => {
  return (
    <footer className="bg-[#003E77] border-t border-white/10">
      <div className="relative px-10 py-4 flex items-center justify-between">

        {/* Left - Nav links */}
        <nav className="flex items-center gap-6">
          <a href="/" className="text-xs tracking-widest text-white  uppercase transition-colors">Contacts</a>
          <a href="/" className="text-xs tracking-widest text-white  uppercase transition-colors">092-888-4155 (Koko)</a>
        </nav>

        {/* Center - Logo */}
        <div className="absolute left-1/2 -translate-x-1/2">
          <img src={logo} alt="SportGo" className="h-8 w-auto" />
        </div>

        {/* Right - Copyright */}
        <span className="text-xs text-white">
          © {new Date().getFullYear()} SportGo. All rights reserved.
        </span>

      </div>
    </footer>
  );
};

export default Footer;