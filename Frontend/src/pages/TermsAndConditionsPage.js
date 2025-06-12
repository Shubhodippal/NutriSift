import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/LegalPages.css';

const TermsAndConditionsPage = () => {
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
        <h1>Terms and Conditions</h1>
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
          <h2>1. Agreement to Terms</h2>
          <p>These Terms and Conditions ("Terms") constitute a legally binding agreement between you and NutriSift ("we," "our," or "us") regarding your access to and use of the NutriSift website, applications, and services (collectively, the "Services").</p>
          <p>By accessing or using our Services, you agree to be bound by these Terms. If you do not agree to these Terms, you must not access or use our Services.</p>
        </section>
        
        <section>
          <h2>2. Services Description</h2>
          <p>NutriSift provides AI-powered recipe generation, meal planning, grocery list creation, and nutritional analysis tools. Our Services are designed to help users create meals based on available ingredients, dietary preferences, and nutritional goals.</p>
          <p>We may update, modify, or discontinue any aspect of our Services at any time without prior notice.</p>
        </section>
        
        <section>
          <h2>3. User Accounts</h2>
          <p>To access certain features of our Services, you may need to create an account. You are responsible for:</p>
          <ul>
            <li>Providing accurate and complete information when creating your account</li>
            <li>Maintaining the confidentiality of your account credentials</li>
            <li>All activities that occur under your account</li>
            <li>Notifying us immediately of any unauthorized use of your account</li>
          </ul>
          <p>We reserve the right to suspend or terminate your account if you violate these Terms or if we determine, in our sole discretion, that your actions may harm NutriSift or other users.</p>
        </section>
        
        <section>
          <h2>4. Intellectual Property Rights</h2>
          
          <h3>4.1 Non-Commercial License</h3>
          <p>NutriSift is provided under a Non-Commercial License. Under this license, you are permitted to:</p>
          <ul>
            <li>Use the software for personal, educational, and research purposes</li>
            <li>Copy and modify the software for non-commercial use</li>
            <li>Distribute the software to others, provided you maintain the same license terms</li>
          </ul>
          <p>You are expressly prohibited from:</p>
          <ul>
            <li>Using the software for any commercial purpose</li>
            <li>Selling or licensing the software or any derivative works</li>
            <li>Using the software in any manner that generates revenue</li>
          </ul>
          
          <h3>4.2 Our Intellectual Property</h3>
          <p>The Services, including all content, features, and functionality, are owned by NutriSift, its licensors, or other providers and are protected by copyright, trademark, and other intellectual property laws. Apart from the rights explicitly granted in the Non-Commercial License, you may not copy, modify, distribute, sell, or lease any part of our Services without our prior written consent.</p>
          
          <h3>4.3 User-Generated Content</h3>
          <p>By submitting, posting, or sharing content through our Services (such as custom recipes or reviews), you grant us a non-exclusive, royalty-free, worldwide license to use, reproduce, modify, publish, and distribute such content for the purpose of providing and promoting our Services.</p>
          <p>You represent and warrant that you own or have the necessary rights to the content you submit and that such content does not violate the rights of any third party.</p>
        </section>
        
        <section>
          <h2>5. Contributions to Open Source Project</h2>
          <p>We welcome contributions to the open source version of NutriSift. By submitting code or other content to the project, you agree that your contributions will be licensed under the same MIT License. You also certify that you have the right to submit such contributions.</p>
          <p>For detailed contribution guidelines, please refer to our CONTRIBUTING.md file in our GitHub repository.</p>
        </section>
        
        <section>
          <h2>6. Acceptable Use</h2>
          <p>When using our Services, you agree not to:</p>
          <ul>
            <li>Violate any applicable laws or regulations</li>
            <li>Infringe upon the rights of others</li>
            <li>Use our Services for any illegal or unauthorized purpose</li>
            <li>Attempt to interfere with or disrupt the integrity or performance of our Services</li>
            <li>Collect or harvest user data without permission</li>
            <li>Upload or transmit viruses, malware, or other malicious code</li>
            <li>Create multiple accounts for abusive purposes</li>
            <li>Share harmful, offensive, or inappropriate content</li>
          </ul>
        </section>
        
        <section>
          <h2>7. Subscriptions and Payments</h2>
          <p>We offer both free open source access and paid SaaS subscription plans:</p>
          <ul>
            <li><strong>Open Source:</strong> Free to use, modify, and redistribute under the MIT License terms.</li>
            <li><strong>SaaS Subscriptions:</strong> Paid plans that provide hosted services, enhanced features, dedicated support, and service level agreements.</li>
          </ul>
          <p>By subscribing to a paid plan, you agree to pay all applicable fees as described at the time of purchase.</p>
          <p>Subscription fees are billed in advance and are non-refundable except as required by law or as explicitly stated in these Terms. You may cancel your subscription at any time, but you will not receive a refund for the current billing period.</p>
          <p>We reserve the right to change our subscription fees upon reasonable notice. Such notice will be displayed on our website or sent to your registered email address.</p>
        </section>
        
        <section>
          <h2>8. Disclaimer of Warranties</h2>
          <p>THE SERVICES ARE PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT ANY WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT.</p>
          <p>We do not warrant that the Services will be uninterrupted, timely, secure, or error-free, or that any content generated through our Services will be accurate, reliable, or complete.</p>
        </section>
        
        <section>
          <h2>9. Health and Nutrition Disclaimer</h2>
          <p>The nutritional information, recipes, and dietary recommendations provided through our Services are for informational purposes only and are not intended as medical advice, diagnosis, or treatment. Always consult with a qualified healthcare provider before making significant changes to your diet or if you have any health concerns or conditions.</p>
          <p>We cannot guarantee that recipes generated by our AI will be suitable for specific dietary needs or restrictions. Users with severe allergies or medical dietary requirements should verify all ingredients and nutritional information independently.</p>
        </section>
        
        <section>
          <h2>10. Limitation of Liability</h2>
          <p>TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, NUTRISIFT AND ITS DIRECTORS, EMPLOYEES, AGENTS, AND AFFILIATES SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING LOSS OF PROFITS, DATA, OR GOODWILL, ARISING OUT OF OR IN CONNECTION WITH YOUR USE OF OR INABILITY TO USE THE SERVICES.</p>
          <p>IN NO EVENT SHALL OUR TOTAL LIABILITY TO YOU FOR ALL CLAIMS EXCEED THE AMOUNT PAID BY YOU, IF ANY, FOR ACCESSING OR USING OUR SERVICES DURING THE TWELVE (12) MONTHS PRECEDING YOUR CLAIM.</p>
        </section>
        
        <section>
          <h2>11. Indemnification</h2>
          <p>You agree to indemnify, defend, and hold harmless NutriSift and its officers, directors, employees, and agents from and against any claims, liabilities, damages, losses, and expenses, including reasonable attorneys' fees, arising out of or in any way connected with your access to or use of the Services or your violation of these Terms.</p>
        </section>
        
        <section>
          <h2>12. Governing Law and Dispute Resolution</h2>
          <p>These Terms shall be governed by and construed in accordance with the laws of the state of [State], without regard to its conflict of law provisions.</p>
          <p>Any dispute arising out of or relating to these Terms or the Services shall be resolved through binding arbitration in accordance with the rules of the American Arbitration Association. The arbitration shall take place in [City, State], and the language of the arbitration shall be English.</p>
        </section>
        
        <section>
          <h2>13. Changes to Terms</h2>
          <p>We may revise these Terms at any time by updating this page. Your continued use of the Services after such changes constitutes your acceptance of the new Terms.</p>
        </section>
        
        <section>
          <h2>14. Severability</h2>
          <p>If any provision of these Terms is found to be unenforceable or invalid, that provision shall be limited or eliminated to the minimum extent necessary so that the Terms shall otherwise remain in full force and effect and enforceable.</p>
        </section>
        
        <section>
          <h2>15. Contact Information</h2>
          <p>If you have any questions about these Terms, please contact us at:</p>
          <p>Email: legal@nutrisift.com</p>
          <p>Address: NutriSift Headquarters, 123 Food Avenue, Kitchen City, NS 12345</p>
        </section>
      </div>
    </div>
  );
};

export default TermsAndConditionsPage;