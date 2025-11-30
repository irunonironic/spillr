import { useState } from "react";
import Modal from "./Modals";

const Footer = () => {
  const [modalContent, setModalContent] = useState(null);

  const privacyPolicy = () => {
    return (
      <div className="min-h-screen bg-yellow-200 flex items-center justify-center p-6">
        <div className="max-w-4xl w-full border-4 border-black bg-yellow-200 shadow-[12px_12px_0_0_#000] p-10 space-y-10 font-mono text-black">
          <h1 className="text-2xl font-extrabold uppercase tracking-tight border-b-4 border-black pb-4">
            Privacy Policy
          </h1>

          <section className="space-y-6 text-base leading-relaxed text-sm">
            <div>
              <h2 className="text-md font-bold uppercase border-b-2 border-black inline-block mb-2">
                Definitions
              </h2>
              <p>
                The feedback or opinion that a user gives to other users on our
                platform.
              </p>
            </div>

            <div>
              <h2 className="text-md font-bold uppercase border-b-2 border-black inline-block mb-2">
                Information You Share
              </h2>
              <p>
                Some services require registration and provide certain personal
                data.
              </p>
            </div>

            <div>
              <h2 className="text-md font-bold uppercase border-b-2 border-black inline-block mb-2">
                Information We Collect
              </h2>
              <p>IP Address, Cookies, Timestamps, and analytics data.</p>
            </div>

            <div>
              <h2 className="text-md font-bold uppercase border-b-2 border-black inline-block mb-2">
                Third-Party Services
              </h2>
              <p>Email providers, analytics and push notifications.</p>
            </div>

            <div>
              <h2 className="text-md font-bold uppercase border-b-2 border-black inline-block mb-2">
                Opting Out
              </h2>
              <p>
                You can adjust your browser to block cookies, but some features
                may not work.
              </p>
            </div>

            <div>
              <h2 className="text-md font-bold uppercase border-b-2 border-black inline-block mb-2">
                Policy Changes
              </h2>
              <p>We may update this policy at any time without prior notice.</p>
            </div>
          </section>

          <section className="pt-6 border-t-4 border-black">
            <h2 className="text-md font-bold uppercase mb-2">Contact Us</h2>
            <p>
              Email:{" "}
              <a
                href="mailto:spillr.app.email@gmail.com"
                className="underline underline-offset-4 text-black hover:bg-black hover:text-yellow-200 transition-all"
              >
                spillr.app.email@gmail.com
              </a>
            </p>
          </section>
        </div>
      </div>
    );
  };

  const termsAndConditions = () => {
    return (
      <div className="min-h-screen bg-yellow-200 flex items-center justify-center p-6">
        <div className="max-w-4xl w-full border-4 border-black bg-yellow-200 shadow-[12px_12px_0_0_#000] p-10 space-y-10 font-mono text-black">
          <h1 className="text-2xl font-extrabold uppercase tracking-tight border-b-4 border-black pb-4">
            Terms & Conditions
          </h1>

          <section className="space-y-6 text-base leading-relaxed text-sm">
            <div>
              <h2 className="text-md font-bold uppercase border-b-2 border-black inline-block mb-2">
                Introduction
              </h2>
              <p>
                Welcome to Spillr. Please read these Terms and Conditions
                carefully before use.
              </p>
            </div>

            <div>
              <h2 className="text-md font-bold uppercase border-b-2 border-black inline-block mb-2">
                User Responsibilities
              </h2>
              <p>
                Maintain confidentiality, provide truthful information, and use
                the platform ethically.
              </p>
            </div>

            <div>
              <h2 className="text-md font-bold uppercase border-b-2 border-black inline-block mb-2">
                Acceptable Use
              </h2>
              <p>
                You must not violate laws, harass others, or post harmful
                content.
              </p>
            </div>

            <div>
              <h2 className="text-md font-bold uppercase border-b-2 border-black inline-block mb-2">
                Content Guidelines
              </h2>
              <p>
                No pornographic, violent, discriminatory, or infringing content.
              </p>
            </div>

            <div>
              <h2 className="text-md font-bold uppercase border-b-2 border-black inline-block mb-2">
                Intellectual Property Rights
              </h2>
              <p>
                All content belongs to Spillr or licensors. No unauthorized
                reproduction.
              </p>
            </div>

            <div>
              <h2 className="text-md font-bold uppercase border-b-2 border-black inline-block mb-2">
                Disclaimers & Limitation of Liability
              </h2>
              <p>
                The service is provided "as is" without warranties. We are not
                liable for indirect damages.
              </p>
            </div>

            <div>
              <h2 className="text-md font-bold uppercase border-b-2 border-black inline-block mb-2">
                Termination
              </h2>
              <p>We may terminate access without notice for breach of terms.</p>
            </div>
          </section>

          <section className="pt-6 border-t-4 border-black">
            <h2 className="text-md font-bold uppercase mb-2">Contact Us</h2>
            <p>
              Email:{" "}
              <a
                href="mailto:spillr.app.email@gmail.com"
                className="underline underline-offset-4 text-black hover:bg-black hover:text-yellow-200 transition-all"
              >
                spillr.app.email@gmail.com
              </a>
            </p>
          </section>
        </div>
      </div>
    );
  };

  const contactUs = (
    <div
      className="max-w-3xl mx-auto p-8 border-2 border-black bg-yellow-200 shadow-[6px_6px_0_0_#000] space-y-6 font-mono text-black"
      style={{ fontFamily: "Space Grotesk" }}
    >
      <h1 className="text-2xl font-extrabold uppercase tracking-tight border-b-2 border-black pb-2">
        Contact Us
      </h1>

      <p className="text-sm uppercase text-gray-700">
        We'd love to hear from you
      </p>

      <div className="space-y-2">
        <p className="text-lg">
          Email:{" "}
          <a
            href="mailto:spillr.app.email@gmail.com"
            className="underline underline-offset-4 text-black hover:bg-black hover:text-blue-100 transition-all"
          >
            spillr.app.email@gmail.com
          </a>
        </p>

        <p className="text-base border-t-2 border-black pt-3">
          For questions, concerns, or feedback — reach out anytime.
        </p>
      </div>
    </div>
  );

  return (
    <footer className="w-full mt-auto">
      <div
        className="w-full mx-auto px-4 sm:px-6 py-8 text-gray-100 bg-black"
        style={{ fontFamily: "Space Grotesk" }}
      >
        {/* Footer Top */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-6 md:gap-0">
          <div
            className="flex flex-col space-y-2"
            style={{ fontFamily: "Space Grotesk" }}
          >
            <h2
              className="text-xl font-bold"
              style={{ fontFamily: "Space Grotesk" }}
            >
              Spillr
            </h2>
            <p className="text-sm text-gray-400 max-w-xs">
              Share and receive anonymous feedback with ease and privacy.
            </p>
          </div>

          <div className="flex flex-wrap gap-4 sm:gap-6 text-sm">
            <button
              onClick={() => setModalContent(privacyPolicy)}
              className="hover:underline hover:text-white transition"
            >
              Privacy Policy
            </button>
            <button
              onClick={() => setModalContent(termsAndConditions)}
              className="hover:underline hover:text-white transition"
            >
              Terms & Conditions
            </button>
            <button
              onClick={() => setModalContent(contactUs)}
              className="hover:underline hover:text-white transition"
            >
              Contact Us
            </button>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="mt-4 border-t border-gray-400 pt-3 text-center text-xs text-gray-400">
          &copy; {new Date().getFullYear()} Spillr. All rights reserved.
        </div>
      </div>

      {/* Modal */}
      {modalContent && (
        <Modal onClose={() => setModalContent(null)}>{modalContent}</Modal>
      )}
    </footer>
  );
};

export default Footer;
