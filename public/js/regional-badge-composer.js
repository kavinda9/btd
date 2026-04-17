(function () {
  const imageCache = new Map();
  const composeCache = new Map();

  function unique(values) {
    return [...new Set(values.filter(Boolean))];
  }

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

  async function mergeRegionalBadge(baseSrc, flagSrc, options) {
    const opts = options || {};
    const scale = Number(opts.flagScale) || 1.2;
    const offsetX = Number(opts.offsetX) || 0;
    const offsetY = Number(opts.offsetY) || 0;
    const key = JSON.stringify([baseSrc, flagSrc, scale, offsetX, offsetY]);

    if (composeCache.has(key)) {
      return composeCache.get(key);
    }

    const promise = (async () => {
      const [baseImg, flagImg] = await Promise.all([
        loadImage(baseSrc),
        loadImage(flagSrc),
      ]);

      const baseW = Math.max(1, baseImg.naturalWidth || baseImg.width || 64);
      const baseH = Math.max(1, baseImg.naturalHeight || baseImg.height || 64);
      const rawFlagW = Math.max(1, flagImg.naturalWidth || flagImg.width || 64);
      const rawFlagH = Math.max(
        1,
        flagImg.naturalHeight || flagImg.height || 64,
      );
      const flagW = Math.max(1, Math.round(rawFlagW * scale));
      const flagH = Math.max(1, Math.round(rawFlagH * scale));

      // Keep original image sizes and align centers, with optional px offsets.
      const width = Math.max(baseW, flagW) + Math.abs(Math.round(offsetX)) * 2;
      const height = Math.max(baseH, flagH) + Math.abs(Math.round(offsetY)) * 2;

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        return null;
      }

      ctx.clearRect(0, 0, width, height);
      const baseX = Math.round((width - baseW) / 2);
      const baseY = Math.round((height - baseH) / 2);
      const flagX = Math.round((width - flagW) / 2) + Math.round(offsetX);
      const flagY = Math.round((height - flagH) / 2) + Math.round(offsetY);

      ctx.drawImage(baseImg, baseX, baseY, baseW, baseH);
      ctx.drawImage(flagImg, flagX, flagY, flagW, flagH);

      return canvas.toDataURL("image/png");
    })();

    composeCache.set(key, promise);
    return promise;
  }

  async function mergeRegionalBadgeWithFallback(
    baseSrc,
    candidateFlagSources,
    options,
  ) {
    const candidates = unique(candidateFlagSources || []);

    for (const flagSrc of candidates) {
      try {
        const merged = await mergeRegionalBadge(baseSrc, flagSrc, options);
        if (merged) {
          return merged;
        }
      } catch (_) {
        // Try next candidate.
      }
    }

    return null;
  }

  window.RegionalBadgeComposer = {
    mergeRegionalBadge,
    mergeRegionalBadgeWithFallback,
  };
})();
