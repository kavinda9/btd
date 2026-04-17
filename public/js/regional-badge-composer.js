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

  function drawRoundedRect(ctx, x, y, width, height, radius) {
    const r = Math.max(0, Math.min(radius, Math.min(width, height) / 2));
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + width - r, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + r);
    ctx.lineTo(x + width, y + height - r);
    ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
    ctx.lineTo(x + r, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  async function mergeRegionalBadge(baseSrc, flagSrc, options) {
    const opts = options || {};
    const key = JSON.stringify([
      baseSrc,
      flagSrc,
      opts.flagScale,
      opts.padding,
    ]);

    if (composeCache.has(key)) {
      return composeCache.get(key);
    }

    const promise = (async () => {
      const [baseImg, flagImg] = await Promise.all([
        loadImage(baseSrc),
        loadImage(flagSrc),
      ]);

      const width = Math.max(1, baseImg.naturalWidth || baseImg.width || 64);
      const height = Math.max(1, baseImg.naturalHeight || baseImg.height || 64);

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        return null;
      }

      ctx.clearRect(0, 0, width, height);
      ctx.drawImage(baseImg, 0, 0, width, height);

      const scale = Math.min(
        Math.max(Number(opts.flagScale) || 0.44, 0.2),
        0.75,
      );
      const targetW = Math.round(width * scale);
      const flagRatio =
        (flagImg.naturalWidth || flagImg.width || 1) /
        (flagImg.naturalHeight || flagImg.height || 1);
      const targetH = Math.max(
        1,
        Math.round(targetW / Math.max(flagRatio, 0.2)),
      );

      const padding = Math.max(0, Math.round(Number(opts.padding) || 1));
      const x = width - targetW - padding;
      const y = height - targetH - padding;

      ctx.save();
      drawRoundedRect(
        ctx,
        x,
        y,
        targetW,
        targetH,
        Math.max(2, Math.round(targetH * 0.12)),
      );
      ctx.clip();
      ctx.drawImage(flagImg, x, y, targetW, targetH);
      ctx.restore();

      ctx.strokeStyle = "rgba(255,255,255,0.75)";
      ctx.lineWidth = 1;
      drawRoundedRect(
        ctx,
        x + 0.5,
        y + 0.5,
        targetW - 1,
        targetH - 1,
        Math.max(2, Math.round(targetH * 0.12)),
      );
      ctx.stroke();

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
