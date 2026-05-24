"use client";

import Script from "next/script";
import { useEffect, useState } from "react";
import styles from "./swagger.module.css";

const SwaggerPage = () => {
  const [bundleLoaded, setBundleLoaded] = useState(false);
  const [presetLoaded, setPresetLoaded] = useState(false);

  useEffect(() => {
    if (!bundleLoaded || !presetLoaded || !window.SwaggerUIBundle) {
      return;
    }

    window.SwaggerUIBundle({
      url: "/api/openapi",
      dom_id: "#swagger-ui",
      deepLinking: true,
      presets: [
        window.SwaggerUIBundle.presets.apis,
        window.SwaggerUIStandalonePreset,
      ],
      plugins: [window.SwaggerUIBundle.plugins.DownloadUrl],
      layout: "StandaloneLayout",
    });
  }, [bundleLoaded, presetLoaded]);

  return (
    <>
      <link
        rel="stylesheet"
        href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css"
      />
      <div className={styles.swaggerPage}>
        <div id="swagger-ui" />
      </div>
      <Script
        src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"
        strategy="afterInteractive"
        onLoad={() => setBundleLoaded(true)}
      />
      <Script
        src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-standalone-preset.js"
        strategy="afterInteractive"
        onLoad={() => setPresetLoaded(true)}
      />
    </>
  );
};

export default SwaggerPage;
