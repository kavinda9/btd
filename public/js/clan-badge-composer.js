(function () {
  const imageCache = new Map();
  const composeCache = new Map();

  function loadImage(src) {
    if (!src) {
      return Promise.reject(new Error("Missing image source"));
    }

    if (imageCache.has(src)) {
      return imageCache.get(src);
    }

    const promise = new Promise((resolve, reject) => {
      const img = new Image();
      img.decoding = "async";
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
      img.src = src;
    });

    imageCache.set(src, promise);
    return promise;
  }

  async function mergeClanBadge(shieldSrc, iconSrc) {
    const key = JSON.stringify([shieldSrc, iconSrc]);
    if (composeCache.has(key)) {
      return composeCache.get(key);
    }

    const promise = (async () => {
      const [shieldImg, iconImg] = await Promise.all([
        loadImage(shieldSrc),
        loadImage(iconSrc),
      ]);

      const shieldW = Math.max(
        1,
        shieldImg.naturalWidth || shieldImg.width || 64,
      );
      const shieldH = Math.max(
        1,
        shieldImg.naturalHeight || shieldImg.height || 64,
      );
      const iconW = Math.max(1, iconImg.naturalWidth || iconImg.width || 64);
      const iconH = Math.max(1, iconImg.naturalHeight || iconImg.height || 64);

      const width = Math.max(shieldW, iconW);
      const height = Math.max(shieldH, iconH);

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        return null;
      }

      const shieldX = Math.round((width - shieldW) / 2);
      const shieldY = Math.round((height - shieldH) / 2);
      const iconX = Math.round((width - iconW) / 2);
      const iconY = Math.round((height - iconH) / 2);

      ctx.clearRect(0, 0, width, height);
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(shieldImg, shieldX, shieldY, shieldW, shieldH);
      ctx.drawImage(iconImg, iconX, iconY, iconW, iconH);

      return canvas.toDataURL("image/png");
    })();

    composeCache.set(key, promise);
    return promise;
  }

  window.ClanBadgeComposer = {
    mergeClanBadge,
  };
})();
