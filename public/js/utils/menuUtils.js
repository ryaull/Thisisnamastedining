// Menu rendering utilities
export function createLoadingCard() {
    const card = document.createElement('div');
    card.className = 'menu-card skeleton';
    
    const img = document.createElement('div');
    img.className = 'skeleton-image';
    card.appendChild(img);
    
    for (let i = 0; i < 3; i++) {
        const text = document.createElement('div');
        text.className = 'skeleton-text';
        text.style.width = i === 0 ? '70%' : '100%';
        card.appendChild(text);
    }
    
    return card;
}

export function renderLoadingState(container, count = 6) {
    const fragment = document.createDocumentFragment();
    for (let i = 0; i < count; i++) {
        fragment.appendChild(createLoadingCard());
    }
    container.appendChild(fragment);
}

export function setupLazyLoading() {
    const options = {
        root: null,
        rootMargin: '50px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    observer.unobserve(img);
                }
            }
        });
    }, options);

    return observer;
}

export function handleImageError(img) {
    img.onerror = () => {
        img.src = '/logo-image/thisislogo.png'; // Fallback image
        img.classList.add('error-image');
    };
}
