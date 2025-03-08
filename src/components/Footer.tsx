import {
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaGithub,
  FaLinkedin,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
} from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-gray-100 text-gray-700">
      <div className="container mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <h3 className="font-bold text-lg">Quick Links</h3>
          <ul className="text-sm text-gray-600 space-y-2 mt-2">
            {["Home", "About Us", "Services", "Contact"].map((item, index) => (
              <li key={index}>
                <a href="#" className="text-green-500 hover:text-green-700 transition text-decoration-none">
                  {item}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-bold text-lg">Contact Us</h3>
          <ul className="text-sm text-gray-600 space-y-3 mt-2">
            <li className="flex items-center gap-2">
              <FaEnvelope className="text-green-600" />
              <span>info@mywebsite.com</span>
            </li>
            <li className="flex items-center gap-2">
              <FaPhone className="text-green-600" />
              <span>+1 (123) 456-7890</span>
            </li>
            <li className="flex items-center gap-2">
              <FaMapMarkerAlt className="text-green-600" />
              <span>123 Main St, City, Country</span>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="font-bold text-lg">Newsletter</h3>
          <p className="text-sm text-gray-600 mt-2">
            Subscribe to our newsletter to get the latest updates.
          </p>
          <form className="flex mt-4">
            <input
              type="email"
              placeholder="Your email"
              className="p-2 rounded-md border border-gray-300 w-full"
            />
            <button className="ml-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition">
              Subscribe
            </button>
          </form>
        </div>
      </div>

      <div className="bg-green-100 py-6">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center px-6">
          <h3 className="text-lg font-semibold">Follow Us</h3>
          <div className="flex space-x-4 mt-4 md:mt-0">
            {[FaFacebook, FaTwitter, FaInstagram, FaGithub, FaLinkedin].map((Icon, index) => (
              <Icon key={index} className="text-green-600 text-xl cursor-pointer hover:text-green-800 transition" />
            ))}
          </div>
        </div>
      </div>

      <div className="text-center py-4 bg-gray-200 text-gray-600">
        &copy; {new Date().getFullYear()} MyWebsite. All Rights Reserved.
      </div>
    </footer>
  );
}
