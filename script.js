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
    const tooltips = document.querySelectorAll('.tooltip'); // Kun for CIMT ikoner
    const body = document.body;

    // Modal elementer
    const modalOverlay = document.getElementById('modal-overlay');
    const modalContent = document.getElementById('modal-content');
    const modalTitle = document.getElementById('modal-title');
    const modalDescription = document.getElementById('modal-description');
    const modalExamples = document.getElementById('modal-examples');
    const modalCloseBtn = document.getElementById('modal-close-btn');

    // Status variable - Bruges mindre nu, da vi tjekker klasser direkte
    let activeLines = [];

    // --- LeaderLine Options ---
    const lineOptions = {
        color: 'rgba(120, 120, 120, 0.5)',
        size: 2,
        path: 'fluid',
        startSocket: 'bottom',
        endSocket: 'top',
    };

    // --- Funktioner ---

    function hideModal() {
        if (modalOverlay && modalOverlay.classList.contains('visible')) {
             console.log("Hiding Modal"); // DEBUG
             modalOverlay.classList.remove('visible');
        }
    }

    function hideAllWorkflowAndConclusionInfoBoxes() {
        let wasVisible = false;
        console.log("Hiding Info Boxes & Conclusion"); // DEBUG
        infoBoxes.forEach(box => {
            if (box.classList.contains('visible')) {
                box.classList.remove('visible');
                wasVisible = true;
            }
        });
        if (conclusionInfoBox && conclusionInfoBox.classList.contains('visible')) {
             conclusionInfoBox.classList.remove('visible');
             wasVisible = true;
        }
        // Skjul også modal, hvis en infoboks blev skjult
        // if (wasVisible) hideModal(); // Overvej om dette er nødvendigt/ønsket
    }

    function removeAllLines() {
        if (activeLines.length > 0) {
            console.log("Removing lines"); // DEBUG
            activeLines.forEach(line => { try { line.remove(); } catch (e) {} });
            activeLines = [];
        }
    }

    function hideAllTooltips() {
        let wasVisible = false;
         tooltips.forEach(tip => {
             if (tip.classList.contains('visible')) {
                 tip.classList.remove('visible');
                 wasVisible = true;
             }
         });
         if (wasVisible) {
            console.log("Hiding Tooltips"); // DEBUG
            removeAllLines(); // Fjern linjer når tooltips skjules
         }
    }

    function removeAllStepHighlights() {
        let wasVisible = false;
        workflowSteps.forEach(step => {
            if (step.classList.contains('highlighted')) {
                step.classList.remove('highlighted');
                wasVisible = true;
            }
        });
        // if (wasVisible) console.log("Removed Step Highlights"); // DEBUG
    }

    // Tegner KUN linjer for et specifikt CIMT ikon (Simplificeret)
    function drawLinesForIcon(iconElement) {
        // removeAllLines(); // Fjernes altid før kald nu
        if (!iconElement || !document.contains(iconElement) || !body.classList.contains('cimt-band-visible')) return;

        const relevantStepsStr = iconElement.dataset.cimtRelevant || '';
        const relevantSteps = relevantStepsStr.split(' ');
        console.log("Attempting to draw lines for:", iconElement.id, "to steps:", relevantSteps);

        // requestAnimationFrame(() => { // Prøv uden RAF igen for simplicitet
            let linesDrawn = 0;
            relevantSteps.forEach(stepId => {
                if (stepId) {
                    const stepElement = document.getElementById(stepId);
                    if (stepElement && document.contains(stepElement) && document.contains(iconElement)) {
                        try {
                            const line = new LeaderLine(stepElement, iconElement, {...lineOptions});
                            if (line) { activeLines.push(line); linesDrawn++; }
                        } catch(e) { console.error(`Error drawing line from ${stepId} to ${iconElement.id}:`, e); }
                    }
                }
            });
             console.log("Lines drawn:", linesDrawn);
        // });
    }


    // Funktion til at opdatere ALLE knappers tekst baseret på synlighed
    function updateAllButtonTexts() {
        // CIMT Knap
        if (toggleCimtButton) {
            toggleCimtButton.textContent = body.classList.contains('cimt-band-visible') ? 'Skjul CIMT Understøttelse' : 'Vis CIMT Understøttelse';
        }
        // Trends Knap
        if (toggleTrendsButton) {
            toggleTrendsButton.textContent = body.classList.contains('trends-band-visible') ? 'Skjul Tendenser/Risici' : 'Vis Tendenser/Risici';
        }
        // Konklusion Knap
        if (toggleConclusionButton) {
             toggleConclusionButton.textContent = conclusionInfoBox?.classList.contains('visible') ? 'Skjul Konklusion' : 'Vis Konklusion';
        }
    }

    // Debounce funktion (uændret)
    function debounce(func, wait, immediate) { /* ... uændret ... */ }

    // Håndterer resize - fjerner linjer
    const handleResize = debounce(() => {
        if (activeLines.length > 0) { removeAllLines(); }
    }, 250);


    // --- Event Listeners ---

    // Knap: Vis/Skjul CIMT bånd
    if (toggleCimtButton) {
        toggleCimtButton.addEventListener('click', () => {
            console.log("CIMT Button Clicked. Current state:", body.classList.contains('cimt-band-visible'));
            const shouldShow = !body.classList.contains('cimt-band-visible');

            // Skjul ALTID andre primære visninger FØRST
            body.classList.remove('trends-band-visible'); // Skjul trends bånd
            hideModal(); // Skjul modal (hvis trends var åben)
            hideAllWorkflowAndConclusionInfoBoxes(); // Skjul info/konklusion bokse
            removeAllStepHighlights();
            // hideAllTooltips(); // Skjules hvis CIMT bånd var synligt

            // Tænd/sluk for CIMT bånd
            if (shouldShow) {
                body.classList.add('cimt-band-visible');
            } else {
                body.classList.remove('cimt-band-visible');
                hideAllTooltips(); // Inkl. removeAllLines()
            }
            updateAllButtonTexts(); // Opdater alle knapper til sidst
        });
    }

    // Knap: Vis/Skjul Tendens bånd
    if (toggleTrendsButton) {
        toggleTrendsButton.addEventListener('click', () => {
            console.log("Trends Button Clicked. Current state:", body.classList.contains('trends-band-visible'));
            const shouldShow = !body.classList.contains('trends-band-visible');

             // Skjul ALTID andre primære visninger FØRST
            body.classList.remove('cimt-band-visible'); // Skjul CIMT bånd
            hideAllTooltips(); // Fjerner også linjer
            hideAllWorkflowAndConclusionInfoBoxes(); // Skjul info/konklusion bokse
            removeAllStepHighlights();
            // hideModal(); // Skjules hvis Trends bånd var synligt

            if (shouldShow) {
                body.classList.add('trends-band-visible');
            } else {
                 body.classList.remove('trends-band-visible');
                 hideModal(); // Skjul modal specifikt når båndet skjules
            }
            updateAllButtonTexts();
        });
    }

    // Knap: Vis/Skjul Konklusion
     if (toggleConclusionButton && conclusionInfoBox) {
        toggleConclusionButton.addEventListener('click', () => {
            console.log("Conclusion Button Clicked. Current state:", conclusionInfoBox.classList.contains('visible'));
            const shouldShow = !conclusionInfoBox.classList.contains('visible');

             // Skjul ALTID andre primære visninger FØRST
            body.classList.remove('cimt-band-visible');
            body.classList.remove('trends-band-visible');
            hideAllTooltips(); // Fjerner linjer
            hideModal();
            removeAllStepHighlights();
            // Skjul også andre info bokse (workflow steps)
            infoBoxes.forEach(box => box.classList.remove('visible'));
            currentVisibleInfoBox = null; // Nulstil status

            if (shouldShow) {
                conclusionInfoBox.classList.add('visible');
                currentVisibleInfoBox = conclusionInfoBox; // Sæt status
            } else {
                conclusionInfoBox.classList.remove('visible');
                // currentVisibleInfoBox nulstilles ovenfor
            }
            updateAllButtonTexts();
        });
     }


    // Klik på workflow steps
    workflowSteps.forEach(step => {
        step.addEventListener('click', () => {
            console.log("Workflow Step Clicked:", step.id);
            const infoBoxId = step.dataset.infoTarget;
            const targetInfoBox = document.getElementById(infoBoxId);

            // Skjul bånd og konklusion
            body.classList.remove('cimt-band-visible');
            body.classList.remove('trends-band-visible');
            if(conclusionInfoBox) conclusionInfoBox.classList.remove('visible');
            hideAllTooltips(); // Fjerner linjer
            hideModal();

            if (step === currentHighlightedStep) {
                // Klik på allerede aktivt step: Skjul alt
                hideAllWorkflowAndConclusionInfoBoxes(); // Skjuler KUN info/konklusion
                removeAllStepHighlights();
                currentVisibleInfoBox = null; // Sørg for at nulstille
            } else {
                // Klik på nyt step
                hideAllWorkflowAndConclusionInfoBoxes();
                removeAllStepHighlights();

                step.classList.add('highlighted');
                currentHighlightedStep = step;

                if (targetInfoBox && targetInfoBox !== conclusionInfoBox) {
                    targetInfoBox.classList.add('visible');
                    currentVisibleInfoBox = targetInfoBox;
                } else {
                     currentVisibleInfoBox = null;
                }
            }
            updateAllButtonTexts(); // Opdater knapper
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

             if (isTrendsActive && parentTrendsBand) {
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
                 currentVisibleTooltip = null; // Ingen aktiv tooltip nu

             } else if (isCimtActive && parentCimtBand) {
                 // *** CIMT IKON -> VIS TOOLTIP + LINJER ***
                 console.log("-> Handling as CIMT Icon");
                 hideModal(); // Skjul evt. modal

                 const tooltipId = icon.dataset.tooltipTarget;
                 const tooltip = document.getElementById(tooltipId);
                 const isClickingVisibleTooltip = tooltip && tooltip === currentVisibleTooltip; // Tjek mod global state

                 // Skjul altid gamle tooltips/linjer FØRST
                 hideAllTooltips(); // Inkluderer removeAllLines()

                 if (!isClickingVisibleTooltip && tooltip) {
                     // Vis ny tooltip OG tegn linjer
                     console.log("Showing tooltip:", tooltipId);
                     tooltip.classList.add('visible');
                     currentVisibleTooltip = tooltip; // Opdater global state
                     drawLinesForIcon(icon);
                 } else {
                      console.log("Hiding tooltip (was already visible or no tooltip found)");
                     // Hvis man klikkede på den allerede synlige, har hideAllTooltips() allerede lukket den + fjernet linjer
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
        modalCloseBtn.addEventListener('click', (e) => {
             e.stopPropagation(); // Undgå at lukke andre ting
            console.log("Close button (X) clicked!");
            hideModal();
        });
        modalOverlay.addEventListener('click', (event) => {
            if (event.target === modalOverlay) {
                console.log("Overlay background clicked!");
                hideModal();
            }
        });
     } else { console.error("FEJL: Kunne ikke finde #modal-overlay eller #modal-close-btn!"); }

     // Klik udenfor popups/tooltips/infobokse for at lukke dem
     document.addEventListener('click', (event) => {
         const clickedElement = event.target;
         const isButtonClicked = clickedElement.closest('#controls button');

         // Luk kun hvis der IKKE klikkes på en knap eller et ikon
         if (!isButtonClicked && !clickedElement.closest('.cimt-icon') && !clickedElement.closest('.workflow-step')) {
            // Luk info-boks hvis klik er udenfor relevant område
             if (currentVisibleInfoBox && !clickedElement.closest('.info-box-container')) {
                  hideAllWorkflowAndConclusionInfoBoxes();
                  removeAllStepHighlights();
             }
             // Luk tooltip hvis klik er udenfor relevant område
             if (currentVisibleTooltip && !clickedElement.closest('#cimt-band') && !clickedElement.closest('#trends-band')) {
                  hideAllTooltips();
             }
             // Modal lukkes af sin egen listener
         }
     });

     // Lyt efter resize for at fjerne linjer
     window.addEventListener('resize', handleResize);

     // Initial opdatering af knaptekster
     updateAllButtonTexts();

}); // End DOMContentLoaded
