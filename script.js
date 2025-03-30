document.addEventListener('DOMContentLoaded', () => {
    // Knapper
    const toggleCimtButton = document.getElementById('toggle-cimt');
    const toggleTrendsButton = document.getElementById('toggle-trends');
    const toggleConclusionButton = document.getElementById('toggle-conclusion');

    // Containere / Lag
    const cimtBand = document.getElementById('cimt-band');
    const trendsBand = document.getElementById('trends-band');
    const workflowSteps = document.querySelectorAll('.workflow-step');
    const infoBoxes = document.querySelectorAll('.info-box:not(#info-conclusion)');
    const conclusionInfoBox = document.getElementById('info-conclusion');
    const allIcons = document.querySelectorAll('.cimt-icon');
    const tooltips = document.querySelectorAll('.tooltip');
    const body = document.body;

    // Modal elementer
    const modalOverlay = document.getElementById('modal-overlay');
    const modalContent = document.getElementById('modal-content');
    const modalTitle = document.getElementById('modal-title');
    const modalDescription = document.getElementById('modal-description');
    const modalExamples = document.getElementById('modal-examples');
    const modalCloseBtn = document.getElementById('modal-close-btn');

    // Status variable
    let currentHighlightedStep = null;
    let currentVisibleInfoBox = null;
    let currentVisibleTooltip = null;
    let activeLines = [];

    // --- LeaderLine Options ---
    const lineOptions = { /* ... uændret ... */ };

    // --- Funktioner ---

    function hideModal() {
        console.log("Attempting to hide modal..."); // DEBUG
        if (modalOverlay && modalOverlay.classList.contains('visible')) {
            modalOverlay.classList.remove('visible');
            console.log("Modal hidden via hideModal() function."); // DEBUG
        } else {
             console.log("Modal was not visible or modalOverlay not found."); // DEBUG
        }
    }

    function hideAllWorkflowAndConclusionInfoBoxes() { /* ... uændret (kalder hideModal) ... */ }
    function removeAllLines() { /* ... uændret ... */ }
    function hideAllTooltips() { /* ... uændret ... */ }
    function removeAllStepHighlights() { /* ... uændret ... */ }
    function hideAllInteractiveElements() { /* ... uændret ... */ }
    function drawLinesForIcon(iconElement) { /* ... uændret ... */ }
    function hideCimtBand() { /* ... uændret ... */ }
    function hideTrendsBand() { /* ... uændret ... */ }
    function updateToggleButtonText(button, showText) { /* ... uændret ... */ }
    function debounce(func, wait, immediate) { /* ... uændret ... */ }
    const handleResize = debounce(() => { /* ... uændret ... */ }, 250);


    // --- Event Listeners ---

    toggleCimtButton.addEventListener('click', () => { /* ... uændret ... */ });
    toggleTrendsButton.addEventListener('click', () => { /* ... uændret ... */ });
    if (toggleConclusionButton && conclusionInfoBox) { /* ... uændret ... */ }
    workflowSteps.forEach(step => { /* ... uændret ... */ });
    allIcons.forEach(icon => { /* ... uændret ... */ });

     // Luk Modal - DEBUGGING TILFØJET / VERIFICERET
     console.log("Checking Modal Elements:", {modalOverlay, modalCloseBtn}); // DEBUG
     if (modalOverlay && modalCloseBtn) {
        console.log("Attaching modal close listeners."); // DEBUG
        modalCloseBtn.addEventListener('click', () => {
            console.log("Close button (X) clicked!"); // DEBUG
            hideModal();
        });
        modalOverlay.addEventListener('click', (event) => {
            // Tjek om der klikkes direkte på overlay baggrunden
            if (event.target === modalOverlay) {
                console.log("Overlay background clicked!"); // DEBUG
                hideModal();
            } else {
                 console.log("Clicked inside modal content, not closing."); // DEBUG
            }
        });
     } else {
          console.error("FEJL: Kunne ikke finde #modal-overlay eller #modal-close-btn for at tilføje listeners!"); // DEBUG
     }

     // Klik udenfor popups/tooltips/infobokse for at lukke dem (uændret)
     document.addEventListener('click', (event) => { /* ... uændret ... */ });

     // Lyt efter resize for at fjerne linjer (uændret)
     window.addEventListener('resize', handleResize);

     // Initial opdatering af knaptekster (uændret)
     updateAllButtonTexts(); // Bruger den nye samlede funktion

}); // End DOMContentLoaded
