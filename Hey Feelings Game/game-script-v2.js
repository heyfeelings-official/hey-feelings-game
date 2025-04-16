// Pobieranie elementów DOM
document.addEventListener('DOMContentLoaded', function() {
    const video = document.getElementById('bg-video');
    const soundOnBtn = document.getElementById('sound-on');
    const soundOffBtn = document.getElementById('sound-off');
    const fullscreenOnBtn = document.getElementById('fullscreen-on');
    const fullscreenOffBtn = document.getElementById('fullscreen-off');
    const countdownElement = document.getElementById('countdown');
    const zoomInBtn = document.getElementById('zoom-in');
    const zoomOutBtn = document.getElementById('zoom-out');
    const gameWrapper = document.getElementById('game-wrapper');

    // Ukryj przyciski dźwięku
    if (soundOnBtn) soundOnBtn.style.display = 'none';
    if (soundOffBtn) soundOffBtn.style.display = 'none';

    // Funkcje zarządzania widocznością przycisków
    function updateSoundButtons() {
        soundOnBtn.style.display = video.muted ? 'block' : 'none';
        soundOffBtn.style.display = video.muted ? 'none' : 'block';
    }

    function updateFullscreenButtons() {
        const isFullscreen = document.fullscreenElement || 
                           document.webkitFullscreenElement || 
                           document.mozFullScreenElement || 
                           document.msFullscreenElement;
        fullscreenOnBtn.style.display = isFullscreen ? 'none' : 'block';
        fullscreenOffBtn.style.display = isFullscreen ? 'block' : 'none';
    }

    function updateZoomButtons() {
        zoomInBtn.style.display = scale >= maxScale ? 'none' : 'block';
        zoomOutBtn.style.display = scale <= minScale ? 'none' : 'block';
    }

    // Inicjalizacja zmiennych przybliżenia i przesuwania
    let scale = 1;
    const maxScale = 2;
    const minScale = 1;
    let isPanning = false;
    let startX, startY;
    let translateX = 0;
    let translateY = 0;

    // Funkcja do aktualizacji transformacji
    function updateTransform() {
        gameWrapper.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
        updateZoomButtons();
    }

    // Funkcja do dostosowania limitów przesuwania
    function adjustPanLimits() {
        const container = gameWrapper.parentElement;
        if (!container) return;

        const containerRect = container.getBoundingClientRect();
        const wrapperRect = gameWrapper.getBoundingClientRect();

        // Oblicz rzeczywiste wymiary po przeskalowaniu
        const scaledWidth = wrapperRect.width;
        const scaledHeight = wrapperRect.height;

        // Oblicz maksymalne dozwolone przesunięcia
        const maxTranslateX = 0;
        const minTranslateX = containerRect.width - scaledWidth;
        const maxTranslateY = 0;
        const minTranslateY = containerRect.height - scaledHeight;

        // Jeśli element jest mniejszy niż kontener, wyśrodkuj go
        if (scaledWidth <= containerRect.width) {
            translateX = (containerRect.width - scaledWidth) / 2;
        } else {
            // W przeciwnym razie ogranicz przesuwanie
            translateX = Math.min(maxTranslateX, Math.max(minTranslateX, translateX));
        }

        if (scaledHeight <= containerRect.height) {
            translateY = (containerRect.height - scaledHeight) / 2;
        } else {
            translateY = Math.min(maxTranslateY, Math.max(minTranslateY, translateY));
        }

        updateTransform();
    }

    // Funkcja do ustawiania przybliżenia
    function setZoom(newScale, mouseX, mouseY) {
        const oldScale = scale;
        scale = Math.min(Math.max(newScale, minScale), maxScale);

        if (mouseX !== undefined && mouseY !== undefined) {
            const wrapperRect = gameWrapper.getBoundingClientRect();
            const containerRect = gameWrapper.parentElement.getBoundingClientRect();

            // Oblicz pozycję kursora względem elementu
            const offsetX = mouseX - containerRect.left - translateX;
            const offsetY = mouseY - containerRect.top - translateY;

            // Oblicz nowe przesunięcie, aby zachować punkt pod kursorem
            const scaleFactor = scale / oldScale;
            translateX -= (offsetX * (scaleFactor - 1));
            translateY -= (offsetY * (scaleFactor - 1));
        }

        adjustPanLimits();
        updateCursor();
    }

    // Aktualizacja kursora
    function updateCursor() {
        gameWrapper.style.cursor = scale > minScale ? (isPanning ? 'grabbing' : 'grab') : 'default';
    }

    // Obsługa przycisków zoom
    zoomInBtn.addEventListener('click', () => {
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        setZoom(scale * 1.1, centerX, centerY);
    });

    zoomOutBtn.addEventListener('click', () => {
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        setZoom(scale / 1.1, centerX, centerY);
    });

    // Obsługa kółka myszy
    gameWrapper.addEventListener('wheel', (e) => {
        if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            const delta = -e.deltaY / 500;
            setZoom(scale * (1 + delta), e.clientX, e.clientY);
        }
    }, { passive: false });

    // Obsługa przeciągania
    gameWrapper.addEventListener('mousedown', (e) => {
        if (e.button !== 0 || scale <= minScale) return;
        isPanning = true;
        startX = e.clientX - translateX;
        startY = e.clientY - translateY;
        updateCursor();
    });

    document.addEventListener('mousemove', (e) => {
        if (!isPanning) return;
        translateX = e.clientX - startX;
        translateY = e.clientY - startY;
        adjustPanLimits();
    });

    document.addEventListener('mouseup', () => {
        if (isPanning) {
            isPanning = false;
            updateCursor();
        }
    });

    // Obsługa dźwięku
    soundOnBtn.addEventListener('click', () => {
        video.muted = false;
        updateSoundButtons();
    });

    soundOffBtn.addEventListener('click', () => {
        video.muted = true;
        updateSoundButtons();
    });

    // Obsługa trybu pełnoekranowego
    fullscreenOnBtn.addEventListener('click', () => {
        if (document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen();
        } else if (document.documentElement.webkitRequestFullscreen) {
            document.documentElement.webkitRequestFullscreen();
        } else if (document.documentElement.msRequestFullscreen) {
            document.documentElement.msRequestFullscreen();
        }
    });

    fullscreenOffBtn.addEventListener('click', () => {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
    });

    // Nasłuchiwanie zmian trybu pełnoekranowego
    document.addEventListener('fullscreenchange', updateFullscreenButtons);
    document.addEventListener('webkitfullscreenchange', updateFullscreenButtons);
    document.addEventListener('mozfullscreenchange', updateFullscreenButtons);
    document.addEventListener('MSFullscreenChange', updateFullscreenButtons);

    // Timer odliczający
    let timeLeft = 30 * 60; // 30 minut w sekundach

    function updateTimer() {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        
        countdownElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        if (timeLeft > 0) {
            timeLeft--;
        }
    }

    // Aktualizacja timera co sekundę
    updateTimer(); // Pierwsze wywołanie, żeby nie czekać sekundy na start
    const timerInterval = setInterval(updateTimer, 1000);

    // Inicjalizacja stylów i stanów
    gameWrapper.style.transformOrigin = '0 0';
    gameWrapper.style.userSelect = 'none';
    
    updateCursor();
    updateSoundButtons();
    updateFullscreenButtons();
    updateZoomButtons();

    // Dodaj nasłuchiwanie na zmiany rozmiaru okna
    window.addEventListener('resize', adjustPanLimits);

    // Nasłuchiwanie zmian stanu wideo
    video.addEventListener('volumechange', updateSoundButtons);
});
