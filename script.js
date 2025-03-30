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

    // Status variable
    let currentHighlightedStep = null;
    let currentVisibleInfoBox = null;
    let currentVisibleTooltip = null;
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
        if (wasVisible) {
            currentVisibleInfoBox = null;
        }
        // Skjul altid modal, hvis en infoboks lukkes
        hideModal();
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
        removeAllLines(); // Altid fjern linjer når tooltips skjules
    }

    function removeAllStepHighlights() {
        if (currentHighlightedStep) {
            workflowSteps.forEach(step => step.classList.remove('highlighted'));
            currentHighlightedStep = null;
        }
    }

    // Skjuler ALLE interaktive popups/overlays/highlights
    function hideAllInteractiveElements() {
        hideAllWorkflowAndConclusionInfoBoxes(); // Skjuler også modal
        hideAllTooltips(); // Skjuler tooltips og linjer
        removeAllStepHighlights();
    }

    // Tegner KUN linjer for et specifikt CIMT ikon (Simplificeret)
    function drawLinesForIcon(iconElement) {
        removeAllLines(); // Fjern altid gamle linjer FØRST
        if (!iconElement || !document.contains(iconElement) || !body.classList.contains('cimt-band-visible')) {
             return;
        }

        const relevantStepsStr = iconElement.dataset.cimtRelevant || '';
        const relevantSteps = relevantStepsStr.split(' ');
        console.log("Attempting to draw lines for:", iconElement.id, "to steps:", relevantSteps);

        let linesDrawn = 0;
        relevantSteps.forEach(stepId => {
            if (stepId) {
                const stepElement = document.getElementById(stepId);
                // Simplere tjek: Findes begge elementer?
                if (stepElement && document.contains(stepElement) && document.contains(iconElement)) {
                    try {
                        const line = new LeaderLine(stepElement, iconElement, {...lineOptions});
                        if (line) {
                            activeLines.push(line);
                            linesDrawn++;
                        }
                    } catch(e) { console.error(`Error drawing line from ${stepId} to ${iconElement.id}:`, e); }
                }
            }
        });
        console.log("Lines drawn:", linesDrawn);
        // LeaderLine forsøger selv at positionere. setTimeout fjernet for nu.
    }


    function hideCimtBand() {
        if (body.classList.contains('cimt-band-visible')) {
            body.classList.remove('cimt-band-visible');
            updateToggleButtonText(toggleCimtButton, 'Vis CIMT Understøttelse');
            hideAllTooltips(); // Skjuler også linjer
        }
    }

    function hideTrendsBand() {
        if (body.classList.contains('trends-band-visible')) {
            body.classList.remove('trends-band-visible');
            updateToggleButtonText(toggleTrendsButton, 'Vis Tendenser/Risici');
            hideModal();
        }
    }

    // Opdaterer ALLE knappers tekst baseret på den aktuelle body/element klasse
    function updateAllButtonTexts() {
        updateToggleButtonText(toggleCimtButton, 'Vis CIMT Understøttelse');
        updateToggleButtonText(toggleTrendsButton, 'Vis Tendenser/Risici');
        updateToggleButtonText(toggleConclusionButton, 'Vis Konklusion');
    }

    // Funktion til at opdatere en specifik knaps tekst (bruges af updateAllButtonTexts)
    function updateToggleButtonText(button, showText) {
        if (!button) return;
        const baseText = showText.replace('Vis ', '');
        let bodyClassToCheck = '';
        let isConclusionBox = false;
        if (button === toggleCimtButton) { bodyClassToCheck = 'cimt-band-visible'; }
        else if (button === toggleTrendsButton) { bodyClassToCheck = 'trends-band-visible'; }
        else if (button === toggleConclusionButton) { isConclusionBox = true; }

        let isVisible = isConclusionBox
            ? (conclusionInfoBox && conclusionInfoBox.classList.contains('visible'))
            : body.classList.contains(bodyClassToCheck);

        button.textContent = isVisible ? `Skjul ${baseText}` : `Vis ${baseText}`;
    }

    // Debounce funktion (uændret)
    function debounce(func, wait, immediate) { /* ... uændret ... */ }

    // Håndterer resize - fjerner linjer
    const handleResize = debounce(() => {
        if (activeLines.length > 0) { removeAllLines(); }
    }, 250);


    // --- Event Listeners ---

    // Knap: Vis/Skjul CIMT bånd
    toggleCimtButton.addEventListener('click', () => {
        const shouldShow = !body.classList.contains('cimt-band-visible');
        hideAllInteractiveElements(); // Skjul alt FØRST
        hideTrendsBand();

        if (shouldShow) {
            body.classList.add('cimt-band-visible');
        }
        // Ellers har hideAllInteractiveElements/hideCimtBand klaret skjulningen
        updateAllButtonTexts();
    });

    // Knap: Vis/Skjul Tendens bånd
    toggleTrendsButton.addEventListener('click', () => {
        const shouldShow = !body.classList.contains('trends-band-visible');
        hideAllInteractiveElements();
        hideCimtBand();

        if (shouldShow) {
            body.classList.add('trends-band-visible');
        }
        updateAllButtonTexts();
    });

    // Knap: Vis/Skjul Konklusion
    if (toggleConclusionButton && conclusionInfoBox) {
        toggleConclusionButton.addEventListener('click', () => {
            const shouldShow = !conclusionInfoBox.classList.contains('visible');
            hideAllInteractiveElements(); // Skjul alt andet
            hideCimtBand();
            hideTrendsBand();

            if (shouldShow) {
                conclusionInfoBox.classList.add('visible');
                currentVisibleInfoBox = conclusionInfoBox;
            }
             // hideAllInteractiveElements skjuler den, hvis den var synlig
            updateAllButtonTexts();
        });
    }


    // Klik på workflow steps
    workflowSteps.forEach(step => {
        step.addEventListener('click', () => {
            const infoBoxId = step.dataset.infoTarget;
            const targetInfoBox = document.getElementById(infoBoxId);

            // Skjul bånd FØRST
            hideCimtBand();
            hideTrendsBand();
            if (conclusionInfoBox) conclusionInfoBox.classList.remove('visible');

            if (step === currentHighlightedStep) {
                hideAllWorkflowAndConclusionInfoBoxes(); // Skjul alt i infoboks-container
                removeAllStepHighlights();
            } else {
                hideAllWorkflowAndConclusionInfoBoxes(); // Skjul evt. anden synlig boks
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

             const parentCimtBand = icon.closest('#cimt-band');
             const parentTrendsBand = icon.closest('#trends-band');
             const isCimtActive = body.classList.contains('cimt-band-visible');
             const isTrendsActive = body.classList.contains('trends-band-visible');

             // Skjul altid info-bokse (inkl konklusion) og step highlights
             hideAllWorkflowAndConclusionInfoBoxes();
             removeAllStepHighlights();

             if (isTrendsActive && parentTrendsBand) {
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
                 currentVisibleTooltip = null; // Ingen aktiv tooltip

             } else if (isCimtActive && parentCimtBand) {
                 // *** CIMT IKON -> VIS TOOLTIP + LINJER ***
                 hideModal(); // Skjul evt. modal

                 const tooltipId = icon.dataset.tooltipTarget;
                 const tooltip = document.getElementById(tooltipId);
                 const isClickingVisibleTooltip = tooltip && tooltip === currentVisibleTooltip;

                 // Skjul altid gamle tooltips/linjer FØRST
                 hideAllTooltips(); // Inkluderer removeAllLines()

                 if (!isClickingVisibleTooltip && tooltip) {
                     // Vis ny tooltip OG tegn linjer
                     tooltip.classList.add('visible');
                     currentVisibleTooltip = tooltip;
                     drawLinesForIcon(icon);
                 }
                 // Hvis man klikkede på den allerede synlige, har hideAllTooltips klaret lukningen
             }
             // Opdater knap-tekster (kan være nødvendigt hvis en knap var "skjul")
             updateAllButtonTexts();
        });

         icon.addEventListener('keypress', (e) => { /* ... uændret ... */ });
    });

     // Luk Modal (uændret)
     if (modalOverlay && modalCloseBtn) { /* ... uændret ... */ }

     // Klik udenfor popups/tooltips/infobokse for at lukke dem
     document.addEventListener('click', (event) => {
         const clickedElement = event.target;

         // Luk synlig info-boks (workflow ELLER konklusion)
         if (currentVisibleInfoBox && !clickedElement.closest('.workflow-step') && !clickedElement.closest('.info-box-container') && !clickedElement.closest('#controls button')) {
              hideAllWorkflowAndConclusionInfoBoxes();
              removeAllStepHighlights();
         }

          // Luk aktiv tooltip (og fjern linjer)
         if (currentVisibleTooltip && !clickedElement.closest('.cimt-icon')) {
              if (!clickedElement.closest('#cimt-band') && !clickedElement.closest('#trends-band')) {
                   hideAllTooltips();
              }
         }
         // Modal lukkes af sin egen listener eller hideAllInfoBoxes()
     });

     // Lyt efter resize for at fjerne linjer
     window.addEventListener('resize', handleResize);

     // Initial opdatering af knaptekster
     updateAllButtonTexts();

}); // End DOMContentLoaded
