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
    let currentVisibleInfoBox = null; // Kan være workflow, konklusion
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

    function hideAllWorkflowAndConclusionInfoBoxes() {
        let wasVisible = false;
        infoBoxes.forEach(box => {
            if (box.classList.contains('visible')) {
                box.classList.remove('visible');
                wasVisible = true;
            }
        });
        if (conclusionInfoBox && conclusionInfoBox.classList.contains('visible')) {
             conclusionInfoBox.classList.remove('visible');
             wasVisible = true;
             if(toggleConclusionButton) updateToggleButtonText(toggleConclusionButton, 'Vis Konklusion');
        }
        if(wasVisible) currentVisibleInfoBox = null;
    }


    function removeAllLines() {
        if (activeLines.length > 0) {
            activeLines.forEach(line => { try { line.remove(); } catch (e) {} });
            activeLines = [];
        }
    }

    function hideAllTooltips() {
         if (currentVisibleTooltip) {
            tooltips.forEach(tip => tip.classList.remove('visible'));
            currentVisibleTooltip = null;
         }
         removeAllLines(); // ALTID fjern linjer når tooltips skjules
    }

    function removeAllStepHighlights() {
        if (currentHighlightedStep) {
            workflowSteps.forEach(step => step.classList.remove('highlighted'));
            currentHighlightedStep = null;
        }
    }

    function hideCimtBand() {
        if (body.classList.contains('cimt-band-visible')) {
            body.classList.remove('cimt-band-visible');
            updateToggleButtonText(toggleCimtButton, 'Vis CIMT Understøttelse');
            hideAllTooltips(); // Vigtigt: Skjuler tooltips og fjerner linjer
        }
    }

    function hideTrendsBand() {
        if (body.classList.contains('trends-band-visible')) {
            body.classList.remove('trends-band-visible');
            updateToggleButtonText(toggleTrendsButton, 'Vis Tendenser/Risici');
            hideModal(); // Skjul modal hvis den var åben
        }
    }

    // Funktion til at opdatere en specifik knaps tekst
    function updateToggleButtonText(button, showText) {
        if (!button) return; // Sikkerhedstjek
        const baseText = showText.replace('Vis ', '');
        let bodyClassToCheck = '';
        let isConclusionBox = false;

        if (button === toggleCimtButton) { bodyClassToCheck = 'cimt-band-visible'; }
        else if (button === toggleTrendsButton) { bodyClassToCheck = 'trends-band-visible'; }
        else if (button === toggleConclusionButton) { isConclusionBox = true; }

        let isVisible;
        if (isConclusionBox) {
            isVisible = conclusionInfoBox && conclusionInfoBox.classList.contains('visible');
        } else {
            isVisible = body.classList.contains(bodyClassToCheck);
        }

        button.textContent = isVisible ? `Skjul ${baseText}` : `Vis ${baseText}`;
    }

     // Tegner KUN linjer for et specifikt CIMT ikon (uændret fra sidst)
    function drawLinesForIcon(iconElement) { /* ... uændret ... */ }

    // Debounce funktion (uændret)
    function debounce(func, wait, immediate) { /* ... uændret ... */ }

    // Håndterer resize (uændret)
    const handleResize = debounce(() => { /* ... uændret ... */ }, 250);


    // --- Event Listeners ---

    // Knap: Vis/Skjul CIMT bånd
    toggleCimtButton.addEventListener('click', () => {
        console.log("CIMT Button Clicked"); // DEBUG
        const shouldShow = !body.classList.contains('cimt-band-visible');

        // Skjul ALTID de andre primære visninger
        hideTrendsBand();
        hideAllWorkflowAndConclusionInfoBoxes();
        removeAllStepHighlights();
        // hideAllTooltips(); // Skjules af hideCimtBand hvis den var synlig

        if (shouldShow) {
            body.classList.add('cimt-band-visible');
        } else {
            hideCimtBand(); // Skjuler bånd, tooltips, linjer
        }
        // Opdater alle knapper
        updateToggleButtonText(toggleCimtButton, 'Vis CIMT Understøttelse');
        updateToggleButtonText(toggleTrendsButton, 'Vis Tendenser/Risici');
        updateToggleButtonText(toggleConclusionButton, 'Vis Konklusion');
    });

    // Knap: Vis/Skjul Tendens bånd
    toggleTrendsButton.addEventListener('click', () => {
        console.log("Trends Button Clicked"); // DEBUG
        const shouldShow = !body.classList.contains('trends-band-visible');

        // Skjul ALTID de andre primære visninger
        hideCimtBand();
        hideAllWorkflowAndConclusionInfoBoxes();
        removeAllStepHighlights();
        // hideModal(); // Skjules af hideTrendsBand hvis den var synlig

        if (shouldShow) {
            body.classList.add('trends-band-visible');
        } else {
            hideTrendsBand(); // Skjuler bånd og modal
        }
        // Opdater alle knapper
        updateToggleButtonText(toggleTrendsButton, 'Vis Tendenser/Risici');
        updateToggleButtonText(toggleCimtButton, 'Vis CIMT Understøttelse');
        updateToggleButtonText(toggleConclusionButton, 'Vis Konklusion');
    });

    // Knap: Vis/Skjul Konklusion
     if (toggleConclusionButton && conclusionInfoBox) {
        toggleConclusionButton.addEventListener('click', () => {
            console.log("Conclusion Button Clicked"); // DEBUG
            const shouldShow = !conclusionInfoBox.classList.contains('visible');

            // Skjul ALTID de andre primære visninger
            hideCimtBand();
            hideTrendsBand();
            removeAllStepHighlights();
            // hideAllWorkflowAndConclusionInfoBoxes(); // Skjuler den selv, hvis den er synlig

            if (shouldShow) {
                 // Skjul andre info bokse FØR vi viser konklusion
                 hideAllWorkflowAndConclusionInfoBoxes();
                 conclusionInfoBox.classList.add('visible');
                 currentVisibleInfoBox = conclusionInfoBox;
            } else {
                 // Bliver skjult af hideAllWorkflowAndConclusionInfoBoxes hvis nødvendigt
                 conclusionInfoBox.classList.remove('visible'); // Eksplicit skjul
                 if (currentVisibleInfoBox === conclusionInfoBox) {
                    currentVisibleInfoBox = null;
                 }
            }
             // Opdater alle knapper
            updateToggleButtonText(toggleConclusionButton, 'Vis Konklusion');
            updateToggleButtonText(toggleCimtButton, 'Vis CIMT Understøttelse');
            updateToggleButtonText(toggleTrendsButton, 'Vis Tendenser/Risici');
        });
     }


    // Klik på workflow steps
    workflowSteps.forEach(step => {
        step.addEventListener('click', () => {
            console.log("Workflow Step Clicked:", step.id); // DEBUG
            const infoBoxId = step.dataset.infoTarget;
            const targetInfoBox = document.getElementById(infoBoxId); // Den boks vi vil vise

            // Skjul bånd og konklusion
            hideCimtBand();
            hideTrendsBand();
            if (conclusionInfoBox) conclusionInfoBox.classList.remove('visible');

            if (step === currentHighlightedStep) {
                // Klik på allerede aktivt step: Skjul alt
                hideAllWorkflowAndConclusionInfoBoxes();
                removeAllStepHighlights();
            } else {
                // Klik på nyt step
                hideAllWorkflowAndConclusionInfoBoxes(); // Skjul evt. anden synlig boks
                removeAllStepHighlights();

                step.classList.add('highlighted');
                currentHighlightedStep = step;

                if (targetInfoBox) {
                    targetInfoBox.classList.add('visible');
                    currentVisibleInfoBox = targetInfoBox;
                } else {
                    currentVisibleInfoBox = null;
                }
            }
             // Opdater alle knap-tekster
            updateToggleButtonText(toggleCimtButton, 'Vis CIMT Understøttelse');
            updateToggleButtonText(toggleTrendsButton, 'Vis Tendenser/Risici');
            updateToggleButtonText(toggleConclusionButton, 'Vis Konklusion');
        });

        step.addEventListener('keypress', (e) => { /* ... uændret ... */ });
    });

    // Klik på ikoner i BEGGE bånd
    allIcons.forEach(icon => {
        icon.addEventListener('click', (event) => {
             event.stopPropagation();
             console.log("Icon Clicked:", icon.id); // DEBUG

             const parentCimtBand = icon.closest('#cimt-band');
             const parentTrendsBand = icon.closest('#trends-band');
             const isCimtActive = body.classList.contains('cimt-band-visible');
             const isTrendsActive = body.classList.contains('trends-band-visible');

             // Skjul altid info-bokse (inkl konklusion) og step highlights
             hideAllWorkflowAndConclusionInfoBoxes();
             removeAllStepHighlights();

             if (isTrendsVisible && parentTrendsBand) {
                 // *** TRENDS IKON -> VIS MODAL ***
                 console.log("-> Handling as Trend Icon");
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
                 currentVisibleTooltip = null;

             } else if (isCimtVisible && parentCimtBand) {
                 // *** CIMT IKON -> VIS TOOLTIP + LINJER ***
                 console.log("-> Handling as CIMT Icon");
                 hideModal(); // Skjul evt. modal

                 const tooltipId = icon.dataset.tooltipTarget;
                 const tooltip = document.getElementById(tooltipId);
                 // Tjek om den tooltip vi VIL vise, ER den der VAR synlig
                 const isClickingVisibleTooltip = tooltip && tooltip === currentVisibleTooltip;

                 // Skjul ALTID gamle tooltips/linjer FØRST
                 hideAllTooltips();

                 if (!isClickingVisibleTooltip && tooltip) {
                     // Hvis vi *ikke* klikkede på den synlige tooltip (eller ingen var synlig),
                     // OG tooltip findes, SÅ vis den nye og tegn linjer.
                     console.log("Showing tooltip:", tooltipId);
                     tooltip.classList.add('visible');
                     currentVisibleTooltip = tooltip;
                     drawLinesForIcon(icon);
                 } else {
                      console.log("Hiding tooltip (was already visible or no tooltip found)");
                     // Ellers er tooltip + linjer allerede fjernet af hideAllTooltips()
                 }
             } else {
                  console.log("-> Clicked icon in an inactive band or unknown situation.");
             }
        });

         icon.addEventListener('keypress', (e) => { /* ... uændret ... */ });
    });

     // Luk Modal
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
          console.error("Could not find modal overlay or close button to attach listeners!");
     }

     // Klik udenfor (Generel lukning)
     document.addEventListener('click', (event) => {
         const clickedElement = event.target;

         // Luk synlig info-boks (workflow ELLER konklusion)
         if (currentVisibleInfoBox && !clickedElement.closest('.workflow-step') && !clickedElement.closest('.info-box-container') && !clickedElement.closest('#toggle-conclusion') && !clickedElement.closest('#toggle-cimt') && !clickedElement.closest('#toggle-trends') ) {
              hideAllWorkflowAndConclusionInfoBoxes();
              removeAllStepHighlights();
              // updateToggleButtonText(toggleConclusionButton, 'Vis Konklusion'); // Gøres nu i hide funktionen
         }

          // Luk aktiv tooltip (og fjern linjer)
         if (currentVisibleTooltip && !clickedElement.closest('.cimt-icon')) {
              if (!clickedElement.closest('#cimt-band') && !clickedElement.closest('#trends-band')) {
                   hideAllTooltips();
              }
         }
         // Modal lukkes af sin egen listener eller hideAllInfoBoxes()
     });

     // Fjern resize listener (kan genindsættes hvis nødvendigt)
     // window.removeEventListener('resize', handleResize);

     // Initial opdatering af knaptekster
     updateToggleButtonText(toggleCimtButton, 'Vis CIMT Understøttelse');
     updateToggleButtonText(toggleTrendsButton, 'Vis Tendenser/Risici');
     updateToggleButtonText(toggleConclusionButton, 'Vis Konklusion'); // Korrekt initial tekst

}); // End DOMContentLoaded
