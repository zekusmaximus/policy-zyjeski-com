/**
 * Social Card Generation Module
 * Generates shareable image cards after viewpoint endorsement
 */

import { generateCitizenId } from './futuristic-ui';
import type { ViewpointData } from './types';

/**
 * Generate a social card image using Canvas API
 */
export function generateSocialCard(
  viewpoint: ViewpointData,
  citizenId: string = generateCitizenId()
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Unable to get canvas context');
  }

  // Set canvas dimensions (social media friendly: 1200x630)
  canvas.width = 1200;
  canvas.height = 630;

  // Background gradient
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, '#1C2B4A');
  gradient.addColorStop(1, '#2a3f6a');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // ECC Seal
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(100, 100, 50, 0, 2 * Math.PI);
  ctx.fill();

  ctx.fillStyle = '#1C2B4A';
  ctx.font = 'bold 32px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText('ECC', 100, 115);

  // Title
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 48px Arial, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('I Stood for AI Rights', 60, 220);

  // Viewpoint author
  ctx.font = '32px Arial, sans-serif';
  ctx.fillStyle = '#a9d0f5';
  const authorText = `Supporting ${viewpoint.attribution}`;
  ctx.fillText(authorText, 60, 280);

  // Divider line
  ctx.strokeStyle = '#a9d0f5';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(60, 320);
  ctx.lineTo(canvas.width - 60, 320);
  ctx.stroke();

  // Viewpoint excerpt (truncated)
  ctx.font = '24px Georgia, serif';
  ctx.fillStyle = '#e0e0e0';
  const maxWidth = canvas.width - 120;
  const excerpt = truncateText(viewpoint.text, 120);
  wrapText(ctx, `"${excerpt}"`, 60, 370, maxWidth, 36);

  // Bottom section
  ctx.fillStyle = '#a9d0f5';
  ctx.font = '20px Courier New, monospace';
  ctx.fillText(`ECC Citizen ID: ${citizenId}`, 60, 560);

  ctx.font = 'bold 20px Arial, sans-serif';
  ctx.fillText('AI Personhood Act of 2077', 60, 590);

  // Footer
  ctx.fillStyle = '#ffffff';
  ctx.font = '16px Arial, sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText('policy.zyjeski.com', canvas.width - 60, 590);

  return canvas;
}

/**
 * Truncate text to specified length
 */
function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

/**
 * Wrap text to fit within a specified width
 */
function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
): void {
  const words = text.split(' ');
  let line = '';
  let lineCount = 0;
  const maxLines = 4;

  for (let i = 0; i < words.length; i++) {
    const testLine = line + words[i] + ' ';
    const metrics = ctx.measureText(testLine);
    const testWidth = metrics.width;

    if (testWidth > maxWidth && i > 0) {
      ctx.fillText(line, x, y);
      line = words[i] + ' ';
      y += lineHeight;
      lineCount++;

      if (lineCount >= maxLines) break;
    } else {
      line = testLine;
    }
  }

  if (lineCount < maxLines) {
    ctx.fillText(line, x, y);
  }
}

/**
 * Download canvas as PNG image
 */
export function downloadSocialCard(canvas: HTMLCanvasElement, filename: string = 'ecc-endorsement.png'): void {
  canvas.toBlob((blob) => {
    if (!blob) {
      console.error('Failed to generate image blob');
      return;
    }

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  });
}

/**
 * Show social card modal after endorsement
 */
export function showSocialCardModal(viewpoint: ViewpointData): void {
  const citizenId = generateCitizenId();
  const canvas = generateSocialCard(viewpoint, citizenId);

  // Create modal
  const modal = document.createElement('div');
  modal.id = 'social-card-modal';
  modal.className = 'modal active';
  modal.innerHTML = `
    <div class="modal-overlay"></div>
    <div class="modal-content social-card-modal-content">
      <button class="modal-close" aria-label="Close">&times;</button>
      <div class="social-card-container">
        <h2>Share Your Voice</h2>
        <p class="social-card-intro">Your endorsement has been recorded. Download and share your support for AI rights:</p>
        <div class="canvas-container">
          ${canvas.outerHTML}
        </div>
        <div class="social-card-actions">
          <button id="download-card-btn" class="primary-btn">
            Download Image
          </button>
          <button id="close-card-btn" class="secondary-btn">
            Close
          </button>
        </div>
        <div class="share-text">
          <p><strong>Suggested share text:</strong></p>
          <textarea readonly class="share-textarea">I stood with ${viewpoint.attribution} on AI rights in 2077. The AI Personhood Act will define our future. #AIRights #ECC2077 policy.zyjeski.com</textarea>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  // Attach event handlers
  const downloadBtn = modal.querySelector<HTMLButtonElement>('#download-card-btn');
  const closeBtn = modal.querySelector<HTMLButtonElement>('#close-card-btn');
  const closeX = modal.querySelector<HTMLButtonElement>('.modal-close');
  const overlay = modal.querySelector<HTMLElement>('.modal-overlay');

  const closeModal = () => {
    modal.classList.remove('active');
    setTimeout(() => modal.remove(), 300);
    document.body.style.overflow = '';
  };

  downloadBtn?.addEventListener('click', () => {
    const canvasInModal = modal.querySelector('canvas');
    if (canvasInModal) {
      downloadSocialCard(canvasInModal, `ecc-endorsement-${citizenId}.png`);
    }
  });

  closeBtn?.addEventListener('click', closeModal);
  closeX?.addEventListener('click', closeModal);
  overlay?.addEventListener('click', closeModal);

  // Prevent body scroll
  document.body.style.overflow = 'hidden';
}
