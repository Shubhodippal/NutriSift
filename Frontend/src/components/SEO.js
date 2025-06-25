import React from 'react';
import { Helmet } from 'react-helmet-async';

function SEO({ title, description, keywords, image, url, schemaType = 'WebPage' }) {
  const siteUrl = 'https://shubhodippal.github.io/NutriSift/'; // Replace with your domain
  const fullUrl = url ? `${siteUrl}${url}` : siteUrl;
  const defaultImage = `${siteUrl}/logo512.png`;
  
  return (
    <Helmet>
      <title>{title ? `${title} | NutriSift` : 'NutriSift - AI-powered Recipe Generator'}</title>
      <meta name="description" content={description || 'AI-powered recipes for homes, restaurants, and businesses. Transform your ingredients into chef-level meals.'} />
      <meta name="keywords" content={keywords || 'recipes, AI recipes, meal planner, food waste reduction'} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:title" content={title || 'NutriSift'} />
      <meta property="og:description" content={description || 'AI-powered recipes for homes, restaurants, and businesses.'} />
      <meta property="og:image" content={image || defaultImage} />
      
      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={fullUrl} />
      <meta property="twitter:title" content={title || 'NutriSift'} />
      <meta property="twitter:description" content={description || 'AI-powered recipes for homes, restaurants, and businesses.'} />
      <meta property="twitter:image" content={image || defaultImage} />
      
      {/* Schema.org markup */}
      <script type="application/ld+json">
        {`
          {
            "@context": "https://schema.org",
            "@type": "${schemaType}",
            "name": "${title || 'NutriSift'}",
            "description": "${description || 'AI-powered recipes'}",
            "url": "${fullUrl}"
            ${image ? `,"image": "${image}"` : ''}
          }
        `}
      </script>
    </Helmet>
  );
}

export default SEO;