import React from "react";

function PricingSection() {
  return (
    <section className="features-section" id="pricing">
      <h2>Pricing</h2>
      <div className="features-list">
        <div className="feature-card">
          <span className="feature-icon">🏠</span>
          <h3>Home</h3>
          <p>Free basic plan for individuals and families.</p>
          <p><strong>$0/month</strong></p>
        </div>
        <div className="feature-card">
          <span className="feature-icon">🍽️</span>
          <h3>Restaurant</h3>
          <p>Advanced features for restaurants and cafes.</p>
          <p><strong>$9/month</strong></p>
        </div>
        <div className="feature-card">
          <span className="feature-icon">🏢</span>
          <h3>Business</h3>
          <p>Custom solutions for enterprises and food services.</p>
          <p><strong>Contact Us</strong></p>
        </div>
      </div>
    </section>
  );
}

export default PricingSection;