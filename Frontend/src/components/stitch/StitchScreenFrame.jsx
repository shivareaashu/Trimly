'use client';

export function StitchScreenFrame({ title, src, fallbackImage, height = 1100 }) {
  const handleLoad = (e) => {
    try {
      const iframeDoc = e.target.contentDocument || e.target.contentWindow.document;
      if (iframeDoc) {
        const style = iframeDoc.createElement('style');
        style.textContent = `
          aside { display: none !important; }
          header { display: none !important; }
          main { margin-left: 0px !important; padding-left: 0px !important; }
          .p-container-padding-desktop { padding: 24px !important; }
        `;
        iframeDoc.head.appendChild(style);
      }
    } catch (err) {
      console.warn('Could not inject style into iframe', err);
    }
  };

  return (
    <main className="min-h-screen bg-[#fbf9f9]">
      <iframe
        title={title}
        src={src}
        onLoad={handleLoad}
        className="block min-h-screen w-full border-0 bg-[#fbf9f9]"
        style={{ height }}
        loading="eager"
      />
      <noscript>
        <a href={fallbackImage}>Open {title} screenshot</a>
      </noscript>
    </main>
  );
}

export default StitchScreenFrame;
