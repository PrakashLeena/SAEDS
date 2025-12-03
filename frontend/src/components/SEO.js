import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEO = ({ title, description, name, type, image, url }) => {
  const siteTitle = "SAEDS Community Hub";
  const defaultDescription = "Join the Student Association for Environmental Development & Sustainability. Explore our library, activities, and community events.";
  const defaultImage = "/logo.png"; // Ensure this exists in public folder
  const siteUrl = "https://saeds.org"; // Replace with actual domain if known, or use window.location.origin

  return (
    <Helmet>
      {/* Standard metadata tags */}
      <title>{title ? `${title} | ${siteTitle}` : siteTitle}</title>
      <meta name='description' content={description || defaultDescription} />
      
      {/* Facebook tags */}
      <meta property="og:type" content={type || 'website'} />
      <meta property="og:title" content={title ? `${title} | ${siteTitle}` : siteTitle} />
      <meta property="og:description" content={description || defaultDescription} />
      <meta property="og:image" content={image || defaultImage} />
      <meta property="og:url" content={url || window.location.href} />
      
      {/* Twitter tags */}
      <meta name="twitter:creator" content={name || "SAEDS"} />
      <meta name="twitter:card" content={type === 'article' ? 'summary_large_image' : 'summary'} />
      <meta name="twitter:title" content={title ? `${title} | ${siteTitle}` : siteTitle} />
      <meta name="twitter:description" content={description || defaultDescription} />
      <meta name="twitter:image" content={image || defaultImage} />
    </Helmet>
  );
}

export default SEO;
