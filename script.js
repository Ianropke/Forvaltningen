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
             console.log("Modal hidden."); // DEBUG
        } else {
             console.log("Modal was not visible or not found."); // DEBUG
        }
    }

    function hideAllInfoBoxes() {
        let wasVisible = false;
        infoBoxes.forEach(box => { /* ... uændret ... */ });
        if (conclusionInfoBox && conclusionInfoBox.classList.contains('visible')) { /* ... uændret ... */ }
        if (wasVisible) {
            currentVisibleInfoBox = null;
        }
        // Kald ALTID hideModal når info bokse skjules (for at sikre den er væk)
        hideModal();
    }

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

    // Knap: Vis/Skjul CIMT bånd (uændret)
    toggleCimtButton.addEventListener('click', () => { /* ... uændret ... */ });

    // Knap: Vis/Skjul Tendens bånd (uændret)
    toggleTrendsButton.addEventListener('click', () => { /* ... uændret ... */ });

    // Knap: Vis/Skjul Konklusion (uændret)
    if (toggleConclusionButton && conclusionInfoBox) { /* ... uændret ... */ }

    // Klik på workflow steps (uændret)
    workflowSteps.forEach(step => { /* ... uændret ... */ });

    // Klik på ikoner i BEGGE bånd (uændret logik, men tjek console for fejl)
    allIcons.forEach(icon => { /* ... uændret - forhåbentlig virker modal-visning nu korrekt ... */ });

     // Luk Modal - DEBUGGING TILFØJET
     console.log("Modal Elements Check:", modalOverlay, modalCloseBtn); // DEBUG
     if (modalOverlay && modalCloseBtn) {
        console.log("Attaching modal close listeners"); // DEBUG
        modalCloseBtn.addEventListener('click', () => {
            console.log("Close button clicked!"); // DEBUG
            hideModal();
        });
        modalOverlay.addEventListener('click', (event) => {
            console.log("Overlay clicked! Target:", event.target); // DEBUG
            if (event.target === modalOverlay) {
                console.log("Closing modal via overlay click."); // DEBUG
                hideModal();
            }
        });
     } else {
          console.error("Could not find modal overlay or close button to attach listeners!"); // DEBUG
     }

     // Klik udenfor popups/tooltips/infobokse for at lukke dem (uændret)
     document.addEventListener('click', (event) => { /* ... uændret ... */ });

     // Lyt efter resize for at fjerne linjer (uændret)
     window.addEventListener('resize', handleResize);

     // Initial opdatering af knaptekster (uændret)
     updateToggleButtonText(toggleCimtButton, 'Vis CIMT Understøttelse');
     updateToggleButtonText(toggleTrendsButton, 'Vis Tendenser/Risici');
     if(toggleConclusionButton) updateToggleButtonText(toggleConclusionButton, 'Vis Konklusion');

}); // End DOMContentLoaded
