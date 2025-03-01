'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function TermsPage() {
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const toggleSection = (section: string) => {
    if (activeSection === section) {
      setActiveSection(null);
    } else {
      setActiveSection(section);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 text-white">
      <h1 className="text-3xl font-bold mb-8 text-center">Terms of Service</h1>
      
      <div className="mb-8 text-indigo-200">
        <p>Last Updated: {new Date().toLocaleDateString()}</p>
        <p className="mt-4">
          Please read these Terms of Service ("Terms", "Terms of Service") carefully before using the Figart AI website and services operated by Figart AI.
        </p>
        <p className="mt-2">
          Your access to and use of the Service is conditioned on your acceptance of and compliance with these Terms. 
          These Terms apply to all visitors, users, and others who access or use the Service.
        </p>
        <p className="mt-2">
          By accessing or using the Service, you agree to be bound by these Terms. If you disagree with any part of the terms, 
          you may not access the Service.
        </p>
      </div>

      {/* Table of Contents */}
      <div className="mb-8 p-4 bg-indigo-900/30 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Table of Contents</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <button 
            onClick={() => toggleSection('accounts')}
            className="text-left p-2 hover:bg-indigo-800/30 rounded transition-colors"
          >
            1. Accounts
          </button>
          <button 
            onClick={() => toggleSection('content')}
            className="text-left p-2 hover:bg-indigo-800/30 rounded transition-colors"
          >
            2. Content and Conduct
          </button>
          <button 
            onClick={() => toggleSection('intellectual')}
            className="text-left p-2 hover:bg-indigo-800/30 rounded transition-colors"
          >
            3. Intellectual Property
          </button>
          <button 
            onClick={() => toggleSection('termination')}
            className="text-left p-2 hover:bg-indigo-800/30 rounded transition-colors"
          >
            4. Termination
          </button>
          <button 
            onClick={() => toggleSection('limitation')}
            className="text-left p-2 hover:bg-indigo-800/30 rounded transition-colors"
          >
            5. Limitation of Liability
          </button>
          <button 
            onClick={() => toggleSection('disclaimer')}
            className="text-left p-2 hover:bg-indigo-800/30 rounded transition-colors"
          >
            6. Disclaimer
          </button>
          <button 
            onClick={() => toggleSection('governing')}
            className="text-left p-2 hover:bg-indigo-800/30 rounded transition-colors"
          >
            7. Governing Law
          </button>
          <button 
            onClick={() => toggleSection('changes')}
            className="text-left p-2 hover:bg-indigo-800/30 rounded transition-colors"
          >
            8. Changes to Terms
          </button>
          <button 
            onClick={() => toggleSection('contact')}
            className="text-left p-2 hover:bg-indigo-800/30 rounded transition-colors"
          >
            9. Contact Us
          </button>
        </div>
      </div>

      {/* Accounts */}
      <div className="mb-6">
        <button 
          onClick={() => toggleSection('accounts')}
          className="w-full flex justify-between items-center p-4 bg-indigo-900/30 rounded-lg hover:bg-indigo-800/30 transition-colors"
        >
          <h2 className="text-xl font-semibold">1. Accounts</h2>
          <span>{activeSection === 'accounts' ? '−' : '+'}</span>
        </button>
        {activeSection === 'accounts' && (
          <div className="mt-2 p-4 bg-indigo-950/30 rounded-lg text-indigo-200">
            <p>
              When you create an account with us, you must provide accurate, complete, and current information. 
              Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account.
            </p>
            <p className="mt-2">
              You are responsible for safeguarding the password that you use to access the Service and for any activities 
              or actions under your password, whether your password is with our Service or a third-party service.
            </p>
            <p className="mt-2">
              You agree not to disclose your password to any third party. You must notify us immediately upon becoming 
              aware of any breach of security or unauthorized use of your account.
            </p>
            <p className="mt-2">
              You may not use as a username the name of another person or entity that is not lawfully available for use, 
              a name or trademark that is subject to any rights of another person or entity without appropriate authorization, 
              or a name that is offensive, vulgar, or obscene.
            </p>
          </div>
        )}
      </div>

      {/* Content and Conduct */}
      <div className="mb-6">
        <button 
          onClick={() => toggleSection('content')}
          className="w-full flex justify-between items-center p-4 bg-indigo-900/30 rounded-lg hover:bg-indigo-800/30 transition-colors"
        >
          <h2 className="text-xl font-semibold">2. Content and Conduct</h2>
          <span>{activeSection === 'content' ? '−' : '+'}</span>
        </button>
        {activeSection === 'content' && (
          <div className="mt-2 p-4 bg-indigo-950/30 rounded-lg text-indigo-200">
            <p>
              Our Service allows you to post, link, store, share and otherwise make available certain information, text, 
              graphics, videos, photographs, or other material ("Content"). You are responsible for the Content that you 
              post on or through the Service, including its legality, reliability, and appropriateness.
            </p>
            <p className="mt-2">
              By posting Content on or through the Service, you represent and warrant that: (i) the Content is yours (you own it) 
              or you have the right to use it and grant us the rights and license as provided in these Terms, and (ii) the posting 
              of your Content on or through the Service does not violate the privacy rights, publicity rights, copyrights, contract 
              rights or any other rights of any person.
            </p>
            <p className="mt-2">
              You agree not to use the Service to:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Post or transmit any content that is unlawful, harmful, threatening, abusive, harassing, defamatory, vulgar, obscene, or invasive of another's privacy.</li>
              <li>Impersonate any person or entity, or falsely state or otherwise misrepresent your affiliation with a person or entity.</li>
              <li>Engage in any conduct that restricts or inhibits any other user from using or enjoying the Service.</li>
              <li>Use the Service for any illegal purpose or in violation of any local, state, national, or international law.</li>
              <li>Upload or transmit any material that contains software viruses or any other computer code designed to interrupt, destroy, or limit the functionality of any computer software or hardware.</li>
              <li>Interfere with or disrupt the Service or servers or networks connected to the Service.</li>
            </ul>
          </div>
        )}
      </div>

      {/* Intellectual Property */}
      <div className="mb-6">
        <button 
          onClick={() => toggleSection('intellectual')}
          className="w-full flex justify-between items-center p-4 bg-indigo-900/30 rounded-lg hover:bg-indigo-800/30 transition-colors"
        >
          <h2 className="text-xl font-semibold">3. Intellectual Property</h2>
          <span>{activeSection === 'intellectual' ? '−' : '+'}</span>
        </button>
        {activeSection === 'intellectual' && (
          <div className="mt-2 p-4 bg-indigo-950/30 rounded-lg text-indigo-200">
            <p>
              The Service and its original content (excluding Content provided by users), features, and functionality are and 
              will remain the exclusive property of Figart AI and its licensors. The Service is protected by copyright, 
              trademark, and other laws of both the United States and foreign countries. Our trademarks and trade dress may 
              not be used in connection with any product or service without the prior written consent of Figart AI.
            </p>
            <p className="mt-2">
              When you upload content to the Service, you grant us a worldwide, non-exclusive, royalty-free license to use, 
              reproduce, adapt, publish, translate and distribute your content in any existing or future media. This license 
              is for the purpose of operating, promoting, and improving our Service.
            </p>
            <p className="mt-2">
              You retain all of your ownership rights in your content. You are responsible for protecting your own intellectual 
              property rights. We take no responsibility and assume no liability for content you or any third party posts on or 
              through the Service.
            </p>
          </div>
        )}
      </div>

      {/* Termination */}
      <div className="mb-6">
        <button 
          onClick={() => toggleSection('termination')}
          className="w-full flex justify-between items-center p-4 bg-indigo-900/30 rounded-lg hover:bg-indigo-800/30 transition-colors"
        >
          <h2 className="text-xl font-semibold">4. Termination</h2>
          <span>{activeSection === 'termination' ? '−' : '+'}</span>
        </button>
        {activeSection === 'termination' && (
          <div className="mt-2 p-4 bg-indigo-950/30 rounded-lg text-indigo-200">
            <p>
              We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, 
              including without limitation if you breach the Terms.
            </p>
            <p className="mt-2">
              Upon termination, your right to use the Service will immediately cease. If you wish to terminate your account, 
              you may simply discontinue using the Service, or notify us that you wish to delete your account.
            </p>
            <p className="mt-2">
              All provisions of the Terms which by their nature should survive termination shall survive termination, including, 
              without limitation, ownership provisions, warranty disclaimers, indemnity and limitations of liability.
            </p>
          </div>
        )}
      </div>

      {/* Limitation of Liability */}
      <div className="mb-6">
        <button 
          onClick={() => toggleSection('limitation')}
          className="w-full flex justify-between items-center p-4 bg-indigo-900/30 rounded-lg hover:bg-indigo-800/30 transition-colors"
        >
          <h2 className="text-xl font-semibold">5. Limitation of Liability</h2>
          <span>{activeSection === 'limitation' ? '−' : '+'}</span>
        </button>
        {activeSection === 'limitation' && (
          <div className="mt-2 p-4 bg-indigo-950/30 rounded-lg text-indigo-200">
            <p>
              In no event shall Figart AI, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable 
              for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of 
              profits, data, use, goodwill, or other intangible losses, resulting from (i) your access to or use of or inability 
              to access or use the Service; (ii) any conduct or content of any third party on the Service; (iii) any content 
              obtained from the Service; and (iv) unauthorized access, use or alteration of your transmissions or content, 
              whether based on warranty, contract, tort (including negligence) or any other legal theory, whether or not we have 
              been informed of the possibility of such damage, and even if a remedy set forth herein is found to have failed of 
              its essential purpose.
            </p>
          </div>
        )}
      </div>

      {/* Disclaimer */}
      <div className="mb-6">
        <button 
          onClick={() => toggleSection('disclaimer')}
          className="w-full flex justify-between items-center p-4 bg-indigo-900/30 rounded-lg hover:bg-indigo-800/30 transition-colors"
        >
          <h2 className="text-xl font-semibold">6. Disclaimer</h2>
          <span>{activeSection === 'disclaimer' ? '−' : '+'}</span>
        </button>
        {activeSection === 'disclaimer' && (
          <div className="mt-2 p-4 bg-indigo-950/30 rounded-lg text-indigo-200">
            <p>
              Your use of the Service is at your sole risk. The Service is provided on an "AS IS" and "AS AVAILABLE" basis. 
              The Service is provided without warranties of any kind, whether express or implied, including, but not limited to, 
              implied warranties of merchantability, fitness for a particular purpose, non-infringement or course of performance.
            </p>
            <p className="mt-2">
              Figart AI, its subsidiaries, affiliates, and its licensors do not warrant that a) the Service will function 
              uninterrupted, secure or available at any particular time or location; b) any errors or defects will be corrected; 
              c) the Service is free of viruses or other harmful components; or d) the results of using the Service will meet 
              your requirements.
            </p>
            <p className="mt-2">
              The AI analysis and recommendations provided by our Service are for educational and informational purposes only. 
              We do not guarantee the accuracy, completeness, or usefulness of this information. Any reliance you place on such 
              information is strictly at your own risk.
            </p>
          </div>
        )}
      </div>

      {/* Governing Law */}
      <div className="mb-6">
        <button 
          onClick={() => toggleSection('governing')}
          className="w-full flex justify-between items-center p-4 bg-indigo-900/30 rounded-lg hover:bg-indigo-800/30 transition-colors"
        >
          <h2 className="text-xl font-semibold">7. Governing Law</h2>
          <span>{activeSection === 'governing' ? '−' : '+'}</span>
        </button>
        {activeSection === 'governing' && (
          <div className="mt-2 p-4 bg-indigo-950/30 rounded-lg text-indigo-200">
            <p>
              These Terms shall be governed and construed in accordance with the laws of the United States, without regard 
              to its conflict of law provisions.
            </p>
            <p className="mt-2">
              Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights. 
              If any provision of these Terms is held to be invalid or unenforceable by a court, the remaining provisions of 
              these Terms will remain in effect. These Terms constitute the entire agreement between us regarding our Service, 
              and supersede and replace any prior agreements we might have between us regarding the Service.
            </p>
          </div>
        )}
      </div>

      {/* Changes to Terms */}
      <div className="mb-6">
        <button 
          onClick={() => toggleSection('changes')}
          className="w-full flex justify-between items-center p-4 bg-indigo-900/30 rounded-lg hover:bg-indigo-800/30 transition-colors"
        >
          <h2 className="text-xl font-semibold">8. Changes to Terms</h2>
          <span>{activeSection === 'changes' ? '−' : '+'}</span>
        </button>
        {activeSection === 'changes' && (
          <div className="mt-2 p-4 bg-indigo-950/30 rounded-lg text-indigo-200">
            <p>
              We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is 
              material, we will try to provide at least 30 days' notice prior to any new terms taking effect. What constitutes 
              a material change will be determined at our sole discretion.
            </p>
            <p className="mt-2">
              By continuing to access or use our Service after those revisions become effective, you agree to be bound by the 
              revised terms. If you do not agree to the new terms, please stop using the Service.
            </p>
          </div>
        )}
      </div>

      {/* Contact Us */}
      <div className="mb-6">
        <button 
          onClick={() => toggleSection('contact')}
          className="w-full flex justify-between items-center p-4 bg-indigo-900/30 rounded-lg hover:bg-indigo-800/30 transition-colors"
        >
          <h2 className="text-xl font-semibold">9. Contact Us</h2>
          <span>{activeSection === 'contact' ? '−' : '+'}</span>
        </button>
        {activeSection === 'contact' && (
          <div className="mt-2 p-4 bg-indigo-950/30 rounded-lg text-indigo-200">
            <p>
              If you have any questions about these Terms, please contact us through our GitHub repository at{' '}
              <a 
                href="https://github.com/Nathancgy/Figart-AI" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-indigo-400 hover:text-white transition-colors"
              >
                https://github.com/Nathancgy/Figart-AI
              </a>.
            </p>
          </div>
        )}
      </div>

      <div className="mt-12 text-center">
        <Link href="/" className="inline-block px-6 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors">
          Back to Home
        </Link>
      </div>
    </div>
  );
} 