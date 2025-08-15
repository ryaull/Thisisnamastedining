/**
 * Shows a toast notification message.
 * @param {string} message The message to display.
 * @param {'success'|'error'} type The type of toast, for styling.
 * @param {number} duration How long the toast should be visible in milliseconds.
 */
export function showToast(message, type = 'success', duration = 3000) {
  const container = document.getElementById('toast-container');
  if (!container) {
    console.error('Toast container not found!');
    return;
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;

  container.appendChild(toast);

  // Animate in
  setTimeout(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateX(0)';
  }, 10);

  // Animate out and remove
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    toast.addEventListener('transitionend', () => toast.remove());
  }, duration);
}

/**
 * Shows a modal with the given title and content.
 * @param {string} title The title of the modal.
 * @param {HTMLElement} contentElement The HTML element to display as the modal's body.
 */
export function showModal(title, contentElement) {
  const modalOverlay = document.getElementById('modal-overlay');
  const modalTitle = document.getElementById('modal-title');
  const modalBody = document.getElementById('modal-body');

  modalTitle.textContent = title;
  modalBody.innerHTML = ''; // Clear previous content
  modalBody.appendChild(contentElement);

  modalOverlay.classList.add('visible');
}

/**
 * Hides the main modal.
 */
export function hideModal() {
  const modalOverlay = document.getElementById('modal-overlay');
  modalOverlay.classList.remove('visible');
}

/**
 * Initializes modal close buttons.
 */
export function setupModal() {
    document.getElementById('modal-close').addEventListener('click', hideModal);
    document.getElementById('modal-overlay').addEventListener('click', (e) => {
        if (e.target.id === 'modal-overlay') hideModal();
    });
}