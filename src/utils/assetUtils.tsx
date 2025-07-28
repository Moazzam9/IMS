/**
 * Utility functions for handling asset paths in both development and production environments
 */
import React from 'react';

/**
 * Get the correct path for an asset that works in both development and production
 * @param assetName The name of the asset file (e.g., 'company.png')
 * @returns The correct path to the asset
 */
export const getAssetPath = (assetName: string): string => {
  // Use import.meta.env.BASE_URL which is set by Vite
  // This will be '/' in development and './' in production by default
  return `${import.meta.env.BASE_URL}${assetName}`;
};

/**
 * Create an image element with fallback handling
 * @param props Image properties
 * @returns JSX element with proper src and error handling
 */
export const AssetImage = (props: {
  src: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
}): JSX.Element => {
  const { src, alt, className, style } = props;
  const assetPath = getAssetPath(src);
  
  return (
    <img
      src={assetPath}
      alt={alt}
      className={className}
      style={style}
      onError={(e) => {
        console.error(`Failed to load image: ${src}, trying fallback path`);
        // Try a relative path as fallback
        e.currentTarget.src = `./${src}`;
      }}
    />
  );
};