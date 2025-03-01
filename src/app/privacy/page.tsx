'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function PrivacyPage() {
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const toggleSection = (section: string) => {
    if (activeSection === section) {
      setActiveSection(null);
    } else {
      setActiveSection(section);
    }
  };

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-white sm:text-5xl sm:tracking-tight lg:text-6xl">
            Privacy Policy
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-xl text-indigo-200">
            Your privacy matters to us. Learn how we handle your data.
          </p>
        </div>

        <div className="bg-white text-gray-800 rounded-xl shadow-md p-6 mb-12">
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-600 mb-6">
              Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>

            <p className="mb-6">
              Welcome to Figart AI. We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you about how we look after your personal data when you visit our website and tell you about your privacy rights and how the law protects you.
            </p>

            {/* Table of Contents */}
            <div className="bg-gray-50 p-4 rounded-lg mb-8">
              <h2 className="text-xl font-semibold mb-4">Contents</h2>
              <ul className="space-y-2">
                <li>
                  <button 
                    onClick={() => toggleSection('information')}
                    className="text-indigo-600 hover:text-indigo-800 font-medium focus:outline-none"
                  >
                    1. Information We Collect
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => toggleSection('use')}
                    className="text-indigo-600 hover:text-indigo-800 font-medium focus:outline-none"
                  >
                    2. How We Use Your Information
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => toggleSection('sharing')}
                    className="text-indigo-600 hover:text-indigo-800 font-medium focus:outline-none"
                  >
                    3. Information Sharing and Disclosure
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => toggleSection('cookies')}
                    className="text-indigo-600 hover:text-indigo-800 font-medium focus:outline-none"
                  >
                    4. Cookies and Similar Technologies
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => toggleSection('rights')}
                    className="text-indigo-600 hover:text-indigo-800 font-medium focus:outline-none"
                  >
                    5. Your Rights and Choices
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => toggleSection('security')}
                    className="text-indigo-600 hover:text-indigo-800 font-medium focus:outline-none"
                  >
                    6. Data Security
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => toggleSection('children')}
                    className="text-indigo-600 hover:text-indigo-800 font-medium focus:outline-none"
                  >
                    7. Children's Privacy
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => toggleSection('changes')}
                    className="text-indigo-600 hover:text-indigo-800 font-medium focus:outline-none"
                  >
                    8. Changes to This Privacy Policy
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => toggleSection('contact')}
                    className="text-indigo-600 hover:text-indigo-800 font-medium focus:outline-none"
                  >
                    9. Contact Us
                  </button>
                </li>
              </ul>
            </div>

            {/* Section 1: Information We Collect */}
            <div className="mb-8">
              <h2 id="information" className="text-2xl font-bold mb-4 flex items-center justify-between">
                <span>1. Information We Collect</span>
                <button 
                  onClick={() => toggleSection('information')}
                  className="text-gray-500 hover:text-gray-700"
                  aria-label="Toggle section"
                >
                  {activeSection === 'information' ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  )}
                </button>
              </h2>
              
              <div className={`transition-all duration-300 ease-in-out overflow-hidden ${activeSection === 'information' ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                <h3 className="text-xl font-semibold mb-2">Personal Information</h3>
                <p className="mb-4">
                  When you register for an account, we collect information such as your name, email address, and username. We also collect profile information that you provide, such as profile pictures and biographical information.
                </p>
                
                <h3 className="text-xl font-semibold mb-2">Content Information</h3>
                <p className="mb-4">
                  We collect the photos and content you upload to our platform, including metadata associated with the content (such as when it was taken, device information, location if enabled).
                </p>
                
                <h3 className="text-xl font-semibold mb-2">Usage Information</h3>
                <p className="mb-4">
                  We collect information about how you use our services, such as the types of content you view or engage with, the features you use, the actions you take, and the time, frequency, and duration of your activities.
                </p>
                
                <h3 className="text-xl font-semibold mb-2">Device Information</h3>
                <p>
                  We collect information about the device you use to access our services, including hardware model, operating system, unique device identifiers, and mobile network information.
                </p>
              </div>
            </div>

            {/* Section 2: How We Use Your Information */}
            <div className="mb-8">
              <h2 id="use" className="text-2xl font-bold mb-4 flex items-center justify-between">
                <span>2. How We Use Your Information</span>
                <button 
                  onClick={() => toggleSection('use')}
                  className="text-gray-500 hover:text-gray-700"
                  aria-label="Toggle section"
                >
                  {activeSection === 'use' ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  )}
                </button>
              </h2>
              
              <div className={`transition-all duration-300 ease-in-out overflow-hidden ${activeSection === 'use' ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                <p className="mb-4">
                  We use the information we collect to:
                </p>
                
                <ul className="list-disc pl-6 mb-4 space-y-2">
                  <li>Provide, maintain, and improve our services</li>
                  <li>Process and complete transactions</li>
                  <li>Send you technical notices, updates, security alerts, and support messages</li>
                  <li>Respond to your comments, questions, and requests</li>
                  <li>Develop new products and services</li>
                  <li>Personalize your experience by providing content and features that match your profile and interests</li>
                  <li>Monitor and analyze trends, usage, and activities in connection with our services</li>
                  <li>Detect, investigate, and prevent fraudulent transactions and other illegal activities</li>
                  <li>Protect the rights and property of Figart AI and others</li>
                </ul>
                
                <p>
                  For AI-powered features, we use your uploaded photos to provide composition analysis and feedback. This processing is essential to the service we provide, and we take measures to protect your content during this process.
                </p>
              </div>
            </div>

            {/* Section 3: Information Sharing and Disclosure */}
            <div className="mb-8">
              <h2 id="sharing" className="text-2xl font-bold mb-4 flex items-center justify-between">
                <span>3. Information Sharing and Disclosure</span>
                <button 
                  onClick={() => toggleSection('sharing')}
                  className="text-gray-500 hover:text-gray-700"
                  aria-label="Toggle section"
                >
                  {activeSection === 'sharing' ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  )}
                </button>
              </h2>
              
              <div className={`transition-all duration-300 ease-in-out overflow-hidden ${activeSection === 'sharing' ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                <p className="mb-4">
                  We do not sell your personal information. We may share your information in the following circumstances:
                </p>
                
                <h3 className="text-xl font-semibold mb-2">With Your Consent</h3>
                <p className="mb-4">
                  We may share information when you direct us to do so.
                </p>
                
                <h3 className="text-xl font-semibold mb-2">Service Providers</h3>
                <p className="mb-4">
                  We may share information with vendors, consultants, and other service providers who need access to such information to carry out work on our behalf.
                </p>
                
                <h3 className="text-xl font-semibold mb-2">Legal Requirements</h3>
                <p className="mb-4">
                  We may disclose information if we believe that disclosure is necessary to comply with any applicable law, regulation, legal process, or governmental request.
                </p>
                
                <h3 className="text-xl font-semibold mb-2">Protection of Rights</h3>
                <p>
                  We may share information to protect the safety, rights, property, or security of Figart AI, our services, any third party, or the general public; to detect, prevent, or otherwise address fraud, security, or technical issues; to prevent or stop activity that we consider to be illegal, unethical, or legally actionable.
                </p>
              </div>
            </div>

            {/* Section 4: Cookies and Similar Technologies */}
            <div className="mb-8">
              <h2 id="cookies" className="text-2xl font-bold mb-4 flex items-center justify-between">
                <span>4. Cookies and Similar Technologies</span>
                <button 
                  onClick={() => toggleSection('cookies')}
                  className="text-gray-500 hover:text-gray-700"
                  aria-label="Toggle section"
                >
                  {activeSection === 'cookies' ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  )}
                </button>
              </h2>
              
              <div className={`transition-all duration-300 ease-in-out overflow-hidden ${activeSection === 'cookies' ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                <p className="mb-4">
                  We use cookies and similar technologies to collect information about your activity, browser, and device. Cookies are small data files stored on your browser or device that help us improve our services and your experience, see which areas and features of our services are popular, and count visits.
                </p>
                
                <p className="mb-4">
                  We use the following types of cookies:
                </p>
                
                <ul className="list-disc pl-6 mb-4 space-y-2">
                  <li><strong>Essential Cookies:</strong> These cookies are necessary for the website to function and cannot be switched off in our systems.</li>
                  <li><strong>Performance Cookies:</strong> These cookies allow us to count visits and traffic sources so we can measure and improve the performance of our site.</li>
                  <li><strong>Functional Cookies:</strong> These cookies enable the website to provide enhanced functionality and personalization.</li>
                  <li><strong>Targeting Cookies:</strong> These cookies may be set through our site by our advertising partners to build a profile of your interests.</li>
                </ul>
                
                <p>
                  Most web browsers are set to accept cookies by default. If you prefer, you can usually choose to set your browser to remove or reject browser cookies. Please note that if you choose to remove or reject cookies, this could affect the availability and functionality of our services.
                </p>
              </div>
            </div>

            {/* Section 5: Your Rights and Choices */}
            <div className="mb-8">
              <h2 id="rights" className="text-2xl font-bold mb-4 flex items-center justify-between">
                <span>5. Your Rights and Choices</span>
                <button 
                  onClick={() => toggleSection('rights')}
                  className="text-gray-500 hover:text-gray-700"
                  aria-label="Toggle section"
                >
                  {activeSection === 'rights' ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  )}
                </button>
              </h2>
              
              <div className={`transition-all duration-300 ease-in-out overflow-hidden ${activeSection === 'rights' ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                <p className="mb-4">
                  Depending on your location, you may have certain rights regarding your personal information, including:
                </p>
                
                <ul className="list-disc pl-6 mb-4 space-y-2">
                  <li><strong>Access:</strong> You can request a copy of the personal information we hold about you.</li>
                  <li><strong>Correction:</strong> You can ask us to correct inaccurate or incomplete information.</li>
                  <li><strong>Deletion:</strong> You can ask us to delete your personal information in certain circumstances.</li>
                  <li><strong>Restriction:</strong> You can ask us to restrict the processing of your information in certain circumstances.</li>
                  <li><strong>Data Portability:</strong> You can ask us to transfer your information to another service provider.</li>
                  <li><strong>Objection:</strong> You can object to our processing of your information in certain circumstances.</li>
                </ul>
                
                <p className="mb-4">
                  To exercise these rights, please contact us using the information provided in the "Contact Us" section. Please note that these rights may be limited in some circumstances by local law requirements.
                </p>
                
                <p>
                  You can also update your account information at any time by logging into your account settings.
                </p>
              </div>
            </div>

            {/* Section 6: Data Security */}
            <div className="mb-8">
              <h2 id="security" className="text-2xl font-bold mb-4 flex items-center justify-between">
                <span>6. Data Security</span>
                <button 
                  onClick={() => toggleSection('security')}
                  className="text-gray-500 hover:text-gray-700"
                  aria-label="Toggle section"
                >
                  {activeSection === 'security' ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  )}
                </button>
              </h2>
              
              <div className={`transition-all duration-300 ease-in-out overflow-hidden ${activeSection === 'security' ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                <p className="mb-4">
                  We take reasonable measures to help protect information about you from loss, theft, misuse, unauthorized access, disclosure, alteration, and destruction. However, no internet or email transmission is ever fully secure or error-free.
                </p>
                
                <p className="mb-4">
                  We implement a variety of security measures when a user enters, submits, or accesses their information to maintain the safety of your personal data, including:
                </p>
                
                <ul className="list-disc pl-6 mb-4 space-y-2">
                  <li>All sensitive information is transmitted via Secure Socket Layer (SSL) technology</li>
                  <li>All information is stored in secure databases protected by multiple layers of security</li>
                  <li>Regular security assessments and penetration testing</li>
                  <li>Employee training on security and privacy practices</li>
                </ul>
                
                <p>
                  Please do your part to help us keep your information secure by maintaining the confidentiality of your account password and limiting access to your account and your computer.
                </p>
              </div>
            </div>

            {/* Section 7: Children's Privacy */}
            <div className="mb-8">
              <h2 id="children" className="text-2xl font-bold mb-4 flex items-center justify-between">
                <span>7. Children's Privacy</span>
                <button 
                  onClick={() => toggleSection('children')}
                  className="text-gray-500 hover:text-gray-700"
                  aria-label="Toggle section"
                >
                  {activeSection === 'children' ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  )}
                </button>
              </h2>
              
              <div className={`transition-all duration-300 ease-in-out overflow-hidden ${activeSection === 'children' ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                <p className="mb-4">
                  Our services are not directed to children under 13 (or other age as required by local law), and we do not knowingly collect personal information from children.
                </p>
                
                <p className="mb-4">
                  If we learn we have collected or received personal information from a child under 13 without verification of parental consent, we will delete that information. If you believe we might have any information from or about a child under 13, please contact us using the information provided in the "Contact Us" section.
                </p>
              </div>
            </div>

            {/* Section 8: Changes to This Privacy Policy */}
            <div className="mb-8">
              <h2 id="changes" className="text-2xl font-bold mb-4 flex items-center justify-between">
                <span>8. Changes to This Privacy Policy</span>
                <button 
                  onClick={() => toggleSection('changes')}
                  className="text-gray-500 hover:text-gray-700"
                  aria-label="Toggle section"
                >
                  {activeSection === 'changes' ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  )}
                </button>
              </h2>
              
              <div className={`transition-all duration-300 ease-in-out overflow-hidden ${activeSection === 'changes' ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                <p className="mb-4">
                  We may update this privacy policy from time to time. If we make material changes, we will notify you by email or through a notice on our website prior to the change becoming effective.
                </p>
                
                <p className="mb-4">
                  We encourage you to review this privacy policy periodically to stay informed about our information practices and the choices available to you.
                </p>
              </div>
            </div>

            {/* Section 9: Contact Us */}
            <div className="mb-8">
              <h2 id="contact" className="text-2xl font-bold mb-4 flex items-center justify-between">
                <span>9. Contact Us</span>
                <button 
                  onClick={() => toggleSection('contact')}
                  className="text-gray-500 hover:text-gray-700"
                  aria-label="Toggle section"
                >
                  {activeSection === 'contact' ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  )}
                </button>
              </h2>
              
              <div className={`transition-all duration-300 ease-in-out overflow-hidden ${activeSection === 'contact' ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                <p className="mb-4">
                  If you have any questions about this privacy policy or our information practices, please contact us at:
                </p>
                
                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <p className="font-semibold">Figart AI</p>
                  <p>Email: privacy@figart-ai.com</p>
                  <p>Address: 123 Photography Lane, Suite 456, San Francisco, CA 94105</p>
                </div>
                
                <p>
                  We will respond to your request within a reasonable timeframe.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center">
          <Link href="/" className="inline-flex items-center text-indigo-300 hover:text-indigo-100 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
} 