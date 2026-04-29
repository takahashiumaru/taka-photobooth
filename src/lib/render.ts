import type { FrameDef, LayoutDef } from "./types";
import type { CustomBg } from "./store";
import { customBgToCss, isCustomFrame } from "./customBg";

/**
 * Renders the final strip onto a canvas (high-resolution print-ready) and
 * returns a Blob. We re-implement the same visual logic as <FrameStrip /> so
 * we don't depend on html2canvas.
 */
export async function renderStrip(opts: {
  layout: LayoutDef;
  frame: FrameDef;
  photos: string[]; // dataURLs
  customBg?: CustomBg;
  // pixels per inch
  dpi?: number;
  format?: "jpeg" | "png";
  quality?: number;
}): Promise<{ blob: Blob; canvas: HTMLCanvasElement; transparent: boolean }> {
  const { layout, frame, photos, customBg, dpi = 300, quality = 0.95 } = opts;
  let { format = "jpeg" } = opts;

  // Determine effective background.
  const isCustom = isCustomFrame(frame.id) && !!customBg;
  const customCss = isCustom && customBg ? customBgToCss(customBg) : undefined;
  const transparent = isCustom && customCss === null;

  // PNG is required for transparent output.
  if (transparent) format = "png";

  const W = Math.round(layout.inchW * dpi);
  const H = Math.round(layout.inchH * dpi);

  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  // Outer rounded rect clip
  const outerRadius = Math.max(8, Math.round((frame.outerRadius ?? 16) * (H / 600)));
  roundRectPath(ctx, 0, 0, W, H, outerRadius);
  ctx.save();
  ctx.clip();

  // Background
  if (!transparent) {
    const bgValue = isCustom ? customCss! : frame.background;
    await paintBackground(ctx, W, H, bgValue);
  }
  // For transparent custom mode, also paint optional uploaded image even when
  // the user picked transparent — they wouldn't, but be safe: skip overlay.

  // Decorative overlay (full) — skip on transparent
  if (!transparent && frame.overlay) {
    await paintBackground(ctx, W, H, frame.overlay);
  }

  // Layout calculations
  const pad = Math.max(8, Math.round(H * 0.035));
  const gap = Math.max(4, Math.round(H * 0.018));
  const titleH = Math.round(H * 0.08);

  const innerLeft = pad;
  const innerTop = pad;
  const innerW = W - pad * 2;
  const innerH = H - pad * 2 - titleH - gap;

  const cellW = (innerW - gap * (layout.cols - 1)) / layout.cols;
  const cellH = (innerH - gap * (layout.rows - 1)) / layout.rows;
  const cellRadius = Math.max(2, Math.round((frame.cellRadius ?? 6) * (H / 600)));

  const images = await Promise.all(
    photos.slice(0, layout.poses).map((src) => loadImage(src))
  );

  for (let i = 0; i < layout.poses; i++) {
    const r = Math.floor(i / layout.cols);
    const c = i % layout.cols;
    const x = innerLeft + c * (cellW + gap);
    const y = innerTop + r * (cellH + gap);

    // Cell background (in case image fails)
    ctx.save();
    roundRectPath(ctx, x, y, cellW, cellH, cellRadius);
    ctx.clip();
    ctx.fillStyle = "#000";
    ctx.fillRect(x, y, cellW, cellH);

    const img = images[i];
    if (img) {
      drawCover(ctx, img, x, y, cellW, cellH);
    }
    ctx.restore();

    // Cell border
    if (frame.cellBorder) {
      const m = frame.cellBorder.match(/(\d+(?:\.\d+)?)px\s+\w+\s+(.+)/);
      if (m) {
        const bw = parseFloat(m[1]);
        const bcol = m[2];
        ctx.save();
        ctx.lineWidth = bw * (H / 600);
        ctx.strokeStyle = bcol;
        roundRectPath(ctx, x, y, cellW, cellH, cellRadius);
        ctx.stroke();
        ctx.restore();
      }
    }

    // Layout-specific decoration: hearts
    if (layout.id === "hearts-4") {
      drawHeart(ctx, x + cellW - 6, y + 2, Math.round(cellW * 0.18), "#FF3D74");
    }
  }

  // Title row — stack vertically on narrow strips so long titles fully render
  const titleY = innerTop + innerH + gap;
  const titleText = layout.stripTitle ?? "Takaphotobooth";
  const year = new Date().getFullYear();
  const tagText = `${year} · ${layout.inchW}×${layout.inchH}`;

  let titleSize = Math.round(H * 0.034);
  let tagSize = Math.max(8, Math.round(H * 0.018));
  const gapPx = Math.max(8, Math.round(H * 0.012));

  ctx.font = `600 ${tagSize}px "Plus Jakarta Sans", Inter, sans-serif`;
  let tagW = ctx.measureText(tagText).width;
  ctx.font = `300 italic ${titleSize}px Fraunces, Georgia, serif`;
  let titleW = ctx.measureText(titleText).width;
  const stackVertical = titleW + tagW + gapPx > innerW;

  if (stackVertical) {
    // Shrink title to fit alone on its line
    while (titleW > innerW && titleSize > 8) {
      titleSize -= 1;
      ctx.font = `300 italic ${titleSize}px Fraunces, Georgia, serif`;
      titleW = ctx.measureText(titleText).width;
    }
    while (tagW > innerW && tagSize > 7) {
      tagSize -= 1;
      ctx.font = `600 ${tagSize}px "Plus Jakarta Sans", Inter, sans-serif`;
      tagW = ctx.measureText(tagText).width;
    }

    // Render: title on top, tag below — both centered horizontally
    const cx = innerLeft + innerW / 2;
    ctx.fillStyle = frame.titleColor ?? "#1A1326";
    ctx.font = `300 italic ${titleSize}px Fraunces, Georgia, serif`;
    ctx.textBaseline = "alphabetic";
    ctx.textAlign = "center";
    ctx.fillText(titleText, cx, titleY + titleSize);

    ctx.fillStyle = (frame.tagColor ?? frame.titleColor ?? "#1A1326") + "B3";
    ctx.font = `600 ${tagSize}px "Plus Jakarta Sans", Inter, sans-serif`;
    ctx.textAlign = "center";
    ctx.fillText(tagText, cx, titleY + titleSize + tagSize + 4);
  } else {
    ctx.fillStyle = frame.titleColor ?? "#1A1326";
    ctx.font = `300 italic ${titleSize}px Fraunces, Georgia, serif`;
    ctx.textBaseline = "alphabetic";
    ctx.textAlign = "left";
    ctx.fillText(titleText, innerLeft, titleY + titleH * 0.7);

    ctx.fillStyle = (frame.tagColor ?? frame.titleColor ?? "#1A1326") + "B3";
    ctx.font = `600 ${tagSize}px "Plus Jakarta Sans", Inter, sans-serif`;
    ctx.textAlign = "right";
    ctx.fillText(tagText, innerLeft + innerW, titleY + titleH * 0.7);
  }

  // Solace fine line
  if (layout.id === "solace-4") {
    ctx.save();
    ctx.strokeStyle = "rgba(0,0,0,0.08)";
    ctx.lineWidth = 1 * (H / 600);
    roundRectPath(
      ctx,
      pad / 2,
      pad / 2,
      W - pad,
      H - pad,
      outerRadius - 4
    );
    ctx.stroke();
    ctx.restore();
  }

  // Vintage glow
  if (layout.id === "vintage-4") {
    const g1 = ctx.createRadialGradient(W / 2, 0, 0, W / 2, 0, W * 0.6);
    g1.addColorStop(0, "rgba(255,200,140,0.18)");
    g1.addColorStop(1, "rgba(255,200,140,0)");
    ctx.fillStyle = g1;
    ctx.fillRect(0, 0, W, H);
    const g2 = ctx.createRadialGradient(W / 2, H, 0, W / 2, H, W * 0.6);
    g2.addColorStop(0, "rgba(110,60,20,0.18)");
    g2.addColorStop(1, "rgba(110,60,20,0)");
    ctx.fillStyle = g2;
    ctx.fillRect(0, 0, W, H);
  }

  ctx.restore();

  // Outer border (after restore because we cleared clip)
  if (frame.outerBorder) {
    const m = frame.outerBorder.match(/(\d+(?:\.\d+)?)px\s+\w+\s+(.+)/);
    if (m) {
      ctx.save();
      ctx.lineWidth = parseFloat(m[1]) * (H / 600);
      ctx.strokeStyle = m[2];
      roundRectPath(ctx, 0.5, 0.5, W - 1, H - 1, outerRadius);
      ctx.stroke();
      ctx.restore();
    }
  }

  const blob: Blob = await new Promise((resolve, reject) =>
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("toBlob failed"))),
      format === "png" ? "image/png" : "image/jpeg",
      quality
    )
  );

  return { blob, canvas, transparent };
}

function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

function drawCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number
) {
  const ir = img.width / img.height;
  const cr = w / h;
  let sx = 0,
    sy = 0,
    sw = img.width,
    sh = img.height;
  if (ir > cr) {
    // image wider — crop sides
    sw = img.height * cr;
    sx = (img.width - sw) / 2;
  } else {
    sh = img.width / cr;
    sy = (img.height - sh) / 2;
  }
  ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
}

function roundRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
  ctx.lineTo(x + radius, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function drawHeart(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string
) {
  ctx.save();
  ctx.translate(x - size / 2, y);
  ctx.scale(size / 24, size / 24);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(12, 21);
  ctx.bezierCurveTo(2, 14, -1, 8, 6.7, 5);
  ctx.bezierCurveTo(9, 5, 11, 6, 12, 7.6);
  ctx.bezierCurveTo(13, 6, 15, 5, 17.3, 5);
  ctx.bezierCurveTo(25, 8, 22, 14, 12, 21);
  ctx.fill();
  ctx.restore();
}

/**
 * Paint a CSS-style background onto a rectangle. We support solid color,
 * linear-gradient, radial-gradient, and "repeating-linear-gradient" / multi-bg
 * fallbacks via a hidden DOM div + html2canvas-like approach.
 *
 * Pure-canvas implementation supports: solid color, linear-gradient(<deg>,
 * <stops>) and radial-gradient(circle...). Anything else falls back to a
 * sampled color.
 */
async function paintBackground(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  bg: string
) {
  // Solid color (#hex or rgb()):
  if (/^#|^rgb|^hsl/.test(bg.trim())) {
    ctx.fillStyle = bg.trim();
    ctx.fillRect(0, 0, w, h);
    return;
  }

  // For complex backgrounds, render via a hidden DOM element + svg foreignObject -> Image
  const dataUrl = await cssToImage(bg, w, h);
  if (dataUrl) {
    const img = await loadImage(dataUrl);
    if (img) {
      ctx.drawImage(img, 0, 0, w, h);
      return;
    }
  }

  // Final fallback: try to extract first color
  const m = bg.match(/#[0-9A-Fa-f]{3,8}|rgb[a]?\([^\)]+\)/);
  ctx.fillStyle = m ? m[0] : "#ffffff";
  ctx.fillRect(0, 0, w, h);
}

async function cssToImage(bg: string, w: number, h: number): Promise<string | null> {
  // Use SVG foreignObject containing a div with the background style.
  const escaped = bg.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${w}' height='${h}'>
    <foreignObject width='100%' height='100%'>
      <div xmlns='http://www.w3.org/1999/xhtml' style="width:${w}px;height:${h}px;background:${escaped};"></div>
    </foreignObject>
  </svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
