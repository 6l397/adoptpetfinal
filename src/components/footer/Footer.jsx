import Image from "next/image";
import Link from "next/link";
import { footerLinks } from "@/constants";

const Footer = () => {
  return (
    <footer id="footer" className="footer">
      <div className="footer__links-container">
        <div className="footer__rights">
          <Image 
            src='/logo.svg' 
            alt='logo' 
            width={60} 
            height={18} 
            className="object-contain" 
          />
          <p className="text-gray-700">
            AdoptPet 2025 <br />
            Усі права захищені &copy;
          </p>
        </div>

        <div className="footer__links">
  {footerLinks.map((item) => (
    <div key={item.title} className="footer__link">
      <h3>{item.title}</h3>
      <div className="flex flex-col gap-5">
        {item.links.map((link) => (
          <Link
            key={link.title}
            href={link.url}
            className="text-gray-500"
          >
            {link.title}
          </Link>
        ))}
      </div>
    </div>
  ))}
</div>
      </div>

      <div className="footer__copyrights">
        <p>@2025 AdoptPet. Усі права захищені</p>
        <div className="footer__copyrights-link">
          <Link href="/" className="text-gray-500">
            Політика конфіденційності
          </Link>
          <Link href="/" className="text-gray-500">
            Умови і положення
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;