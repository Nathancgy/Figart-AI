/**
 * Home page logic for FigArt AI
 */

document.addEventListener('DOMContentLoaded', function() {
    // Simple animations for the hero content
    const heroContent = document.querySelector('.hero-content');
    if (heroContent) {
        // Add animation class after a short delay
        setTimeout(() => {
            heroContent.style.opacity = '0';
            heroContent.style.transform = 'translateY(20px)';
            
            // Define a transition
            heroContent.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
            
            // Trigger the animation
            setTimeout(() => {
                heroContent.style.opacity = '1';
                heroContent.style.transform = 'translateY(0)';
            }, 100);
        }, 200);
    }
    
    // Add parallax effect to background image
    const bgImage = document.querySelector('.bg-image');
    if (bgImage) {
        window.addEventListener('scroll', function() {
            const scrollPosition = window.scrollY;
            bgImage.style.transform = `translateY(${scrollPosition * 0.4}px)`;
        });
    }
}); 