import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/LegalPages.css';

const PrivacyPolicyPage = () => {
  const navigate = useNavigate();
  
  // Add this useEffect to scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  return (
    <div className="legal-page-container">
      <div className="legal-page-header">
        <button className="back-button" onClick={() => navigate('/')}>
          ← Back to Home
        </button>
        <h1>Privacy Policy</h1>
        <p className="legal-effective-date">Last Updated: June 12, 2025</p>
      </div>
      
      <div className="legal-content">
        <section className="license-notice">
          <h2>License Notice</h2>
          <p>This software is licensed under a Non-Commercial License. You are free to use, copy, and modify it for personal, educational, and research purposes. Commercial use is strictly prohibited.</p>
          <p className="github-link">
            <strong>Open Source Repository:</strong>{" "}
            <a href="https://github.com/Shubhodippal/NutriSift.git" target="_blank" rel="noopener noreferrer">
              https://github.com/Shubhodippal/NutriSift.git
            </a>
          </p>
        </section>
        
        <section>
          <h2>1. Introduction</h2>
          <p>Welcome to NutriSift ("we," "our," or "us"). At NutriSift, we value your privacy and are committed to protecting your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website and services.</p>
          <p>Please read this Privacy Policy carefully. By accessing or using NutriSift, you acknowledge that you have read, understood, and agree to be bound by this Privacy Policy.</p>
        </section>
        
        <section>
          <h2>2. Open Source vs. SaaS Data Collection</h2>
          <p>It's important to understand the difference in data collection between our open source and SaaS offerings:</p>
          <ul>
            <li><strong>Open Source Version:</strong> When you self-host NutriSift, we do not collect any data from your installation. Any data collection and storage is managed entirely by you and subject to your own privacy practices.</li>
            <li><strong>SaaS Version:</strong> When you use our hosted service, we collect and process data as described in this Privacy Policy.</li>
          </ul>
        </section>
        
        <section>
          <h2>3. Information We Collect</h2>
          
          <h3>3.1 Personal Information</h3>
          <p>We may collect personal information that you voluntarily provide to us when you:</p>
          <ul>
            <li>Register for an account</li>
            <li>Use our recipe generation features</li>
            <li>Save or share recipes</li>
            <li>Create grocery lists</li>
            <li>Contact our customer support</li>
            <li>Subscribe to our newsletters</li>
            <li>Participate in promotions or surveys</li>
          </ul>
          <p>This information may include your name, email address, dietary preferences, allergies, and food restrictions.</p>
          
          <h3>3.2 Usage Information</h3>
          <p>We automatically collect certain information when you visit, use, or navigate our platform. This information may include:</p>
          <ul>
            <li>Device and browser information</li>
            <li>IP address</li>
            <li>Usage patterns and preferences</li>
            <li>Recipe search history</li>
            <li>Saved recipes and ingredients</li>
            <li>Interactions with our AI assistant</li>
          </ul>
        </section>
        
        <section>
          <h2>4. How We Use Your Information</h2>
          <p>We use your information for various purposes, including to:</p>
          <ul>
            <li>Provide, maintain, and improve our services</li>
            <li>Personalize your recipe recommendations</li>
            <li>Process and fulfill your requests</li>
            <li>Communicate with you about our services</li>
            <li>Analyze usage patterns to enhance user experience</li>
            <li>Protect against unauthorized access and fraud</li>
            <li>Comply with legal obligations</li>
          </ul>
        </section>
        
        <section>
          <h2>5. Sharing Your Information</h2>
          <p>We may share your information with:</p>
          <ul>
            <li><strong>Service Providers:</strong> Third-party vendors who perform services on our behalf, such as payment processing, data analysis, and customer service.</li>
            <li><strong>Business Partners:</strong> With your consent, we may share data with trusted partners to provide you with relevant offers and promotions.</li>
            <li><strong>Legal Requirements:</strong> When required by law or to protect our rights, privacy, safety, or property.</li>
          </ul>
          <p>We do not sell your personal information to third parties.</p>
        </section>
        
        <section>
          <h2>6. Data Security</h2>
          <p>We implement appropriate technical and organizational measures to protect your personal information from unauthorized access, loss, misuse, or alteration. However, no method of transmission over the Internet or electronic storage is 100% secure, and we cannot guarantee absolute security.</p>
        </section>
        
        <section>
          <h2>7. Your Privacy Rights</h2>
          <p>Depending on your location, you may have certain rights regarding your personal information, including:</p>
          <ul>
            <li>Access to your personal information</li>
            <li>Correction of inaccurate information</li>
            <li>Deletion of your information</li>
            <li>Restriction of processing</li>
            <li>Data portability</li>
            <li>Objection to processing</li>
          </ul>
          <p>To exercise these rights, please contact us at privacy@nutrisift.com.</p>
        </section>
        
        <section>
          <h2>8. Cookies and Tracking Technologies</h2>
          <p>We use cookies and similar tracking technologies to track activity on our platform and hold certain information. Cookies are files with a small amount of data that may include an anonymous unique identifier. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.</p>
        </section>
        
        <section>
          <h2>9. Children's Privacy</h2>
          <p>Our services are not intended for individuals under the age of 16. We do not knowingly collect personal information from children under 16. If you are a parent or guardian and believe your child has provided us with personal information, please contact us.</p>
        </section>
        
        <section>
          <h2>10. Changes to This Privacy Policy</h2>
          <p>We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date.</p>
        </section>
        
        <section>
          <h2>11. Open Source Contributions</h2>
          <p>If you contribute to our open source project, we may collect and process personal information, such as your name, email address, and GitHub username. This information is necessary to manage contributions and maintain attribution. All contributions to the open source project are public and will be visible to anyone who accesses our repository.</p>
        </section>
        
        <section>
          <h2>12. Contact Us</h2>
          <p>If you have any questions about this Privacy Policy, please contact us at:</p>
          <p>Email: privacy@nutrisift.com</p>
          <p>Address: NutriSift Headquarters, 123 Food Avenue, Kitchen City, NS 12345</p>
          <p>GitHub Issues: For matters related to the open source project, you can also open an issue in our GitHub repository.</p>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;