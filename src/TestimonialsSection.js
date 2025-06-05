import React from "react";

function TestimonialsSection() {
  return (
    <section className="features-section" id="testimonials">
      <h2>What Our Customers Say</h2>
      <div className="features-list">
        <div className="feature-card">
          <span className="feature-icon">⭐</span>
          <h3>Sarah, Home Cook</h3>
          <p>"I save money and never waste food anymore. The recipes are creative and easy!"</p>
        </div>
        <div className="feature-card">
          <span className="feature-icon">⭐</span>
          <h3>Chef Marco, Restaurant Owner</h3>
          <p>"A game changer for my kitchen. We optimize inventory and surprise our guests daily."</p>
        </div>
        <div className="feature-card">
          <span className="feature-icon">⭐</span>
          <h3>Priya, Business Manager</h3>
          <p>"The analytics help us track savings and sustainability. Highly recommended!"</p>
        </div>
      </div>
    </section>
  );
}

export default TestimonialsSection;