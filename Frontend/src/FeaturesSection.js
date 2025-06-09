import React from "react";

function FeaturesSection() {
  return (
    <section className="features-section" id="features">
      <h2>Why Choose Smart Recipe Generator?</h2>
      <div className="features-list">
        <div className="feature-card">
          <span className="feature-icon">🤖</span>
          <h3>AI Recipe Suggestions</h3>
          <p>Personalized, creative recipes based on your real ingredients.</p>
        </div>
        <div className="feature-card">
          <span className="feature-icon">🌱</span>
          <h3>Reduce Food Waste</h3>
          <p>Maximize your pantry and help the environment.</p>
        </div>
        <div className="feature-card">
          <span className="feature-icon">💼</span>
          <h3>For Home & Business</h3>
          <p>Solutions for individuals, restaurants, and food services.</p>
        </div>
        <div className="feature-card">
          <span className="feature-icon">📊</span>
          <h3>Analytics & Insights</h3>
          <p>Track your savings and sustainability impact.</p>
        </div>
      </div>
    </section>
  );
}

export default FeaturesSection;