document.addEventListener('DOMContentLoaded', () => {
    // Knapper
    const toggleCimtButton = document.getElementById('toggle-cimt');
    const toggleTrendsButton = document.getElementById('toggle-trends');
    const toggleConclusionButton = document.getElementById('toggle-conclusion'); // NY

    // Containere / Lag
    const cimtBand = document.getElementById('cimt-band');
    const trendsBand = document.getElementById('trends-band');
    const workflowSteps = document.querySelectorAll('.workflow-step');
    const infoBoxes = document.querySelectorAll('.info-box:not(#info-conclusion)'); // Alle undtagen konklusion
    const conclusionInfoBox = document.getElementById('info-conclusion'); // NY
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
    let currentVisibleInfoBox = null; // Kan nu være en workflow-boks ELLER konklusions-boks
    let currentVisibleTooltip = null;
    let activeLines = [];

    // --- LeaderLine Options ---
    const lineOptions = { /* ... uændret ... */ };


    // --- Funktioner ---

    function hideModal() {
        if (modalOverlay && modalOverlay.classList.contains('visible')) {
             modalOverlay.classList.remove('visible');
        }
    }

    // Skjuler ALLE info-bokse (både workflow og konklusion)
    function hideAllInfoBoxes() {
        let boxHidden = false;
        infoBoxes.forEach(box => {
            if(box.classList.contains('visible')) {
                box.classList.remove('visible');
                boxHidden = true;
            }
        });
        if (conclusionInfoBox && conclusionInfoBox.classList.contains('visible')) {
             conclusionInfoBox.classList.remove('visible');
             boxHidden = true;
        }
        if (boxHidden) {
            currentVisibleInfoBox = null;
        }
         hideModal(); // Skjul også altid modal
    }

    function removeAllLines() { /* ... uændret ... */ }

    function hideAllTooltips() { /* ... uændret ... */ }

    function removeAllStepHighlights() { /* ... uændret ... */ }

    // Skjuler ALLE interaktive popups/overlays/highlights
    function hideAllInteractiveElements() {
         hideAllInfoBoxes(); // Inkluderer hideModal() og konklusion
         hideAllTooltips(); // Inkluderer removeAllLines()
         removeAllStepHighlights();
    }

    // Tegner KUN linjer for et specifikt CIMT ikon (uændret)
    function drawLinesForIcon(iconElement) { /* ... uændret ... */ }


    function hideCimtBand() { /* ... uændret ... */ }

    function hideTrendsBand() { /* ... uændret ... */ }

    function updateToggleButtonText(button, showText) { /* ... uændret ... */ }

    // Debounce funktion (uændret)
    function debounce(func, wait, immediate) { /* ... uændret ... */ }

    // Håndterer resize (uændret)
    const handleResize = debounce(() => { /* ... uændret ... */ }, 250);


    // --- Event Listeners ---

    // Knap: Vis/Skjul CIMT bånd
    toggleCimtButton.addEventListener('click', () => {
        const becomingVisible = !body.classList.contains('cimt-band-visible');
        hideAllInteractiveElements(); // Skjul alt FØRST
        hideTrendsBand();

        if (becomingVisible) {
            body.classList.add('cimt-band-visible');
        }
        updateToggleButtonText(toggleCimtButton, 'Vis CIMT Understøttelse');
        updateToggleButtonText(toggleTrendsButton, 'Vis Tendenser/Risici');
        // Opdater også konklusionsknap (selvom den ikke har en body-klasse)
        if(toggleConclusionButton) toggleConclusionButton.textContent = 'Vis Konklusion';
    });

    // Knap: Vis/Skjul Tendens bånd
    toggleTrendsButton.addEventListener('click', () => {
        const becomingVisible = !body.classList.contains('trends-band-visible');
        hideAllInteractiveElements(); // Skjul alt FØRST
        hideCimtBand();

        if (becomingVisible) {
            body.classList.add('trends-band-visible');
        }
        updateToggleButtonText(toggleTrendsButton, 'Vis Tendenser/Risici');
        updateToggleButtonText(toggleCimtButton, 'Vis CIMT Understøttelse');
        if(toggleConclusionButton) toggleConclusionButton.textContent = 'Vis Konklusion';
    });

     // NY Knap: Vis/Skjul Konklusion
     if (toggleConclusionButton && conclusionInfoBox) {
        toggleConclusionButton.addEventListener('click', () => {
            const becomingVisible = !conclusionInfoBox.classList.contains('visible');

            hideAllInteractiveElements(); // Skjul alt FØRST
            hideCimtBand();
            hideTrendsBand();
            // hideAllInfoBoxes() skjuler nu alle, inkl. konklusion

            if (becomingVisible) {
                conclusionInfoBox.classList.add('visible');
                currentVisibleInfoBox = conclusionInfoBox; // Sæt denne som aktiv info-boks
                toggleConclusionButton.textContent = 'Skjul Konklusion';
            } else {
                 toggleConclusionButton.textContent = 'Vis Konklusion';
                 // hideAllInteractiveElements har allerede skjult den
            }
            // Opdater de andre knapper
            updateToggleButtonText(toggleCimtButton, 'Vis CIMT Understøttelse');
            updateToggleButtonText(toggleTrendsButton, 'Vis Tendenser/Risici');
        });
     }


    // Klik på workflow steps
    workflowSteps.forEach(step => {
        step.addEventListener('click', () => {
            const infoBoxId = step.dataset.infoTarget;
            const infoBox = document.getElementById(infoBoxId);

            // Skjul bånd og konklusion
            hideCimtBand();
            hideTrendsBand();
            if (conclusionInfoBox) conclusionInfoBox.classList.remove('visible'); // Skjul konklusion eksplicit

            if (step === currentHighlightedStep) {
                hideAllInfoBoxes(); // Skjuler nu kun workflow/band info
                removeAllStepHighlights();
            } else {
                hideAllInfoBoxes();
                removeAllStepHighlights();

                step.classList.add('highlighted');
                currentHighlightedStep = step;

                if (infoBox) {
                    infoBox.classList.add('visible');
                    currentVisibleInfoBox = infoBox; // Sæt denne som aktiv
                } else {
                    currentVisibleInfoBox = null; // Nulstil hvis der ikke er nogen boks
                }
            }
             // Opdater alle knap-tekster
            updateToggleButtonText(toggleCimtButton, 'Vis CIMT Understøttelse');
            updateToggleButtonText(toggleTrendsButton, 'Vis Tendenser/Risici');
            if(toggleConclusionButton) toggleConclusionButton.textContent = 'Vis Konklusion';
        });

         step.addEventListener('keypress', (e) => { /* ... uændret ... */ });
    });

    // Klik på ikoner i BEGGE bånd (fælles listener - Opdateret)
    allIcons.forEach(icon => {
        icon.addEventListener('click', (event) => {
             event.stopPropagation();

             const parentCimtBand = icon.closest('#cimt-band');
             const parentTrendsBand = icon.closest('#trends-band');
             const isCimtVisible = parentCimtBand && body.classList.contains('cimt-band-visible');
             const isTrendsVisible = parentTrendsBand && body.classList.contains('trends-band-visible');

             if (!isCimtVisible && !isTrendsVisible) return;

             // Skjul altid info-bokse (inkl konklusion) og step highlights
             hideAllInfoBoxes();
             removeAllStepHighlights();

             if (isTrendsVisible && parentTrendsBand) {
                 // *** TRENDS IKON -> VIS MODAL ***
                 hideAllTooltips(); // Skjul evt. CIMT tooltips/linjer

                 const title = icon.querySelector('.cimt-icon-title')?.textContent || 'Tendens/Risiko';
                 const description = icon.dataset.description || 'Ingen beskrivelse.';
                 const examplesRaw = icon.dataset.examples || '';
                 const examplesHtml = examplesRaw.split('<br>').map(ex => ex.trim()).filter(ex => ex).map(ex => `<li>${ex}</li>`).join('');

                 modalTitle.textContent = title;
                 modalDescription.textContent = description;
                 modalExamples.innerHTML = examplesHtml ? `<h3>Eksempler i Workflow:</h3><ul>${examplesHtml}</ul>` : '';
                 if(modalContent) modalContent.scrollTop = 0;
                 modalOverlay.classList.add('visible');
                 currentVisibleTooltip = null; // Nulstil tooltip status

             } else if (isCimtVisible && parentCimtBand) {
                 // *** CIMT IKON -> VIS TOOLTIP + LINJER ***
                 hideModal(); // Skjul evt. modal

                 const tooltipId = icon.dataset.tooltipTarget;
                 const tooltip = document.getElementById(tooltipId);
                 const isCurrentTooltip = tooltip && tooltip.classList.contains('visible');

                 hideAllTooltips(); // Fjerner også evt. gamle linjer

                 if (!isCurrentTooltip && tooltip) {
                     tooltip.classList.add('visible');
                     currentVisibleTooltip = tooltip;
                     drawLinesForIcon(icon);
                 }
             }
             // Opdater knap-tekster (kan være nødvendigt hvis en knap var "skjul")
             updateToggleButtonText(toggleCimtButton, 'Vis CIMT Understøttelse');
             updateToggleButtonText(toggleTrendsButton, 'Vis Tendenser/Risici');
             if(toggleConclusionButton) toggleConclusionButton.textContent = 'Vis Konklusion';

        });

         icon.addEventListener('keypress', (e) => { /* ... uændret ... */ });
    });

     // Luk Modal (uændret)
     if (modalOverlay && modalCloseBtn) { /* ... uændret ... */ }

     // Klik udenfor popups/tooltips/infobokse for at lukke dem
     document.addEventListener('click', (event) => {
         const clickedElement = event.target;

         // Luk synlig info-boks (workflow ELLER konklusion)
         if (currentVisibleInfoBox && !clickedElement.closest('.workflow-step') && !clickedElement.closest('.info-box-container') && !clickedElement.closest('#toggle-conclusion')) {
              hideAllInfoBoxes();
              removeAllStepHighlights();
              if(toggleConclusionButton) toggleConclusionButton.textContent = 'Vis Konklusion'; // Nulstil knap
         }

          // Luk aktiv tooltip (og fjern linjer)
         if (currentVisibleTooltip && !clickedElement.closest('.cimt-icon')) {
              if (!clickedElement.closest('#cimt-band') && !clickedElement.closest('#trends-band')) {
                   hideAllTooltips();
              }
         }
         // Modal lukkes af sin egen listener eller hideAllInfoBoxes()
     });

     // Fjernet resize listener
     // window.removeEventListener('resize', handleResize);

     // Initial opdatering af knaptekster
     updateToggleButtonText(toggleCimtButton, 'Vis CIMT Understøttelse');
     updateToggleButtonText(toggleTrendsButton, 'Vis Tendenser/Risici');
     if(toggleConclusionButton) toggleConclusionButton.textContent = 'Vis Konklusion'; // Initial tekst

}); // End DOMContentLoaded
