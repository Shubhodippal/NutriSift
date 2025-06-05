import React from "react";

function AboutSection() {
  return (
    <section className="features-section" id="about">
      <h2>About Us</h2>
      <div className="features-list">
        <div className="feature-card">
          <span className="feature-icon">🌍</span>
          <h3>Our Mission</h3>
          <p>Empowering kitchens to cook smarter, save money, and reduce waste globally.</p>
        </div>
        <div className="feature-card" id="contact">
          <span className="feature-icon">📧</span>
          <h3>Contact</h3>
          <p>Email: <a href="mailto:info@smartrecipegen.com">info@smartrecipegen.com</a></p>
          <p>Follow us:
            <a href="https://smartrecipegen.com" target="_blank" rel="noopener noreferrer" style={{marginLeft: '8px'}}>🌐</a>
            <a href="https://twitter.com/" target="_blank" rel="noopener noreferrer" style={{marginLeft: '8px'}}>🐦</a>
            <a href="https://facebook.com/" target="_blank" rel="noopener noreferrer" style={{marginLeft: '8px'}}>📘</a>
          </p>
        </div>
      </div>
    </section>
  );
}

export default AboutSection;