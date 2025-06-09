import React from "react";

function HowItWorksSection() {
  return (
    <section className="features-section" id="how">
      <h2>How It Works</h2>
      <div className="features-list">
        <div className="feature-card">
          <span className="feature-icon">📝</span>
          <h3>1. Enter Ingredients</h3>
          <p>List what you have in your kitchen or inventory.</p>
        </div>
        <div className="feature-card">
          <span className="feature-icon">💡</span>
          <h3>2. Get Recipes</h3>
          <p>Our AI suggests recipes tailored to your ingredients.</p>
        </div>
        <div className="feature-card">
          <span className="feature-icon">🍽️</span>
          <h3>3. Cook & Enjoy</h3>
          <p>Follow easy steps and enjoy delicious meals.</p>
        </div>
      </div>
    </section>
  );
}

export default HowItWorksSection;