import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
    return (
        <Html lang="en">
            <Head>
                {/* Preconnect for performance */}
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                
                {/* Google Fonts */}
                <link
                    href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
                    rel="stylesheet"
                />
                
                {/* Google AdSense */}
                <script 
                    async 
                    src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3908400190376942"
                    crossOrigin="anonymous"
                />
                
                {/* Default Favicon - Create multiple sizes for better compatibility */}
                <link rel="icon" href="/favicon.ico" />
                <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
                <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
                <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
                <link rel="manifest" href="/site.webmanifest" />
                
                {/* Default Open Graph Image - This is your fallback image */}
                {/* IMPORTANT: Create a 1200x630px image for optimal social sharing */}
                <meta property="og:image:width" content="1200" />
                <meta property="og:image:height" content="630" />
                
                {/* Default theme color */}
                <meta name="theme-color" content="#2563EB" />
                
                {/* Verify site ownership (add your actual verification codes) */}
                {/* <meta name="google-site-verification" content="YOUR_GOOGLE_VERIFICATION_CODE" /> */}
                {/* <meta name="facebook-domain-verification" content="YOUR_FACEBOOK_VERIFICATION_CODE" /> */}
                
                {/* Default meta tags that can be overridden by pages */}
                <meta name="robots" content="index, follow, max-image-preview:large" />
                <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
                
                {/* PWA related */}
                <meta name="mobile-web-app-capable" content="yes" />
                <meta name="apple-mobile-web-app-capable" content="yes" />
                <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
                
                {/* Default social media tags */}
                <meta property="og:locale" content="en_US" />
                <meta property="og:site_name" content="ToolUp Store" />
                
                {/* Twitter default configuration */}
                <meta name="twitter:site" content="@toolupstore" />
                <meta name="twitter:creator" content="@toolupstore" />
                <meta name="twitter:card" content="summary_large_image" />
                
                {/* Facebook App ID - Replace with your actual App ID for better insights */}
                {/* <meta property="fb:app_id" content="YOUR_FACEBOOK_APP_ID" /> */}
                
                {/* Additional meta tags for better SEO */}
                <meta name="author" content="ToolUp Store" />
                <meta name="publisher" content="ToolUp Store" />
                <meta name="copyright" content="ToolUp Store" />
                
                {/* Geo-targeting for local SEO */}
                <meta name="geo.region" content="NG-RI" />
                <meta name="geo.placename" content="Port Harcourt" />
                <meta name="geo.position" content="4.815554;7.049844" />
                <meta name="ICBM" content="4.815554, 7.049844" />
            </Head>
            <body>
                <Main />
                <NextScript />
            </body>
        </Html>
    );
}