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
    const allIcons = document.querySelectorAll('.cimt-icon'); // Fanger ikoner i begge bånd
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
    let currentVisibleInfoBox = null; // Kan være workflow-boks ELLER konklusion
    let currentVisibleTooltip = null;
    let activeLines = []; // Til LeaderLine instanser

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

    function hideAllInfoBoxes() {
        let wasVisible = false;
        // Skjul workflow info bokse
        infoBoxes.forEach(box => {
            if (box.classList.contains('visible')) {
                box.classList.remove('visible');
                wasVisible = true;
            }
        });
        // Skjul konklusion info boks
        if (conclusionInfoBox && conclusionInfoBox.classList.contains('visible')) {
            conclusionInfoBox.classList.remove('visible');
            wasVisible = true;
             // Nulstil knaptekst hvis konklusion lukkes
             if(toggleConclusionButton) updateToggleButtonText(toggleConclusionButton, 'Vis Konklusion');
        }
        if (wasVisible) {
            currentVisibleInfoBox = null;
        }
        // Altid skjul modal, hvis en infoboks (eller konklusion) var synlig
        // (selvom de ideelt set udelukker hinanden, for en sikkerheds skyld)
        // if (wasVisible) {
             hideModal();
        // }
    }


    function removeAllLines() {
        if (activeLines.length > 0) {
            console.log("Removing lines:", activeLines.length);
            activeLines.forEach(line => { try { line.remove(); } catch (e) {} });
            activeLines = [];
        }
    }

    function hideAllTooltips() {
         if (currentVisibleTooltip) {
            console.log("Hiding tooltip");
            tooltips.forEach(tip => tip.classList.remove('visible'));
            currentVisibleTooltip = null;
         }
         removeAllLines(); // Fjern ALTID linjer når tooltips skjules
    }

    function removeAllStepHighlights() {
        if (currentHighlightedStep) {
            workflowSteps.forEach(step => step.classList.remove('highlighted'));
            currentHighlightedStep = null;
        }
    }

    // Skjuler ALLE interaktive popups/overlays/highlights
    function hideAllInteractiveElements() {
         hideAllInfoBoxes(); // Skjuler også modal og konklusion
         hideAllTooltips(); // Skjuler tooltips og linjer
         removeAllStepHighlights();
    }

    // Tegner KUN linjer for et specifikt CIMT ikon
    function drawLinesForIcon(iconElement) {
        // removeAllLines() kaldes nu ALTID FØR denne funktion via hideAllTooltips() i click handler
        if (!iconElement || !document.contains(iconElement) || !body.classList.contains('cimt-band-visible')) {
             console.log("Conditions not met for drawing lines for", iconElement?.id);
             return;
        }

        const relevantStepsStr = iconElement.dataset.cimtRelevant || '';
        const relevantSteps = relevantStepsStr.split(' ');
        console.log("Attempting to draw lines for:", iconElement.id, "to steps:", relevantSteps);

        requestAnimationFrame(() => {
            let linesDrawn = 0;
            relevantSteps.forEach(stepId => {
                if (stepId) {
                    const stepElement = document.getElementById(stepId);
                    if (stepElement && document.contains(stepElement)) {
                         const stepStyle = window.getComputedStyle(stepElement);
                         const iconStyle = window.getComputedStyle(iconElement);
                         if (stepStyle.display !== 'none' && iconStyle.display !== 'none') {
                            try {
                                console.log(`Drawing line from ${stepElement.id} to ${iconElement.id}`);
                                const line = new LeaderLine(stepElement, iconElement, {...lineOptions});
                                if (line) { // Check if line was created
                                    activeLines.push(line);
                                    linesDrawn++;
                                } else {
                                     console.error(`LeaderLine failed to create line from ${stepId} to ${iconElement.id}`);
                                }
                            } catch(e) { console.error(`Error drawing line from ${stepId} to ${iconElement.id}:`, e); }
                         } else {
                              console.warn(`Element ${stepId} or ${iconElement.id} has display:none`);
                         }
                    } else {
                         console.warn(`Element ${stepId} not found for ${iconElement.id}`);
                    }
                }
            });
             console.log("Lines drawn:", linesDrawn, "Total active lines:", activeLines.length);
             // Genpositionering efter kort tid
             if (linesDrawn > 0) {
                 setTimeout(() => {
                    activeLines.forEach(l => { try { l.position(); } catch(e){ console.warn("Error repositioning line:", e);} });
                 }, 50);
             }
        });
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

    // Funktion til at opdatere en specifik knaps tekst (uændret)
    function updateToggleButtonText(button, showText) { /* ... uændret ... */ }

    // Debounce funktion (uændret)
    function debounce(func, wait, immediate) { /* ... uændret ... */ }

    // Håndterer resize - fjerner blot linjer
    const handleResize = debounce(() => {
        if (activeLines.length > 0) {
             console.log("Resize detected, removing lines.");
             removeAllLines();
             // Brugeren skal klikke på ikonet igen for at se linjer
             // (alternativt kunne man gemme 'activeIcon' og kalde drawLinesForIcon(activeIcon))
        }
    }, 250);


    // --- Event Listeners ---

     // Knap: Vis/Skjul CIMT bånd
    toggleCimtButton.addEventListener('click', () => {
        const isCurrentlyVisible = body.classList.contains('cimt-band-visible');
        const otherBandVisible = body.classList.contains('trends-band-visible');
        const infoVisible = currentVisibleInfoBox !== null;

        if (isCurrentlyVisible) {
            // Skjuler CIMT bånd
            hideCimtBand(); // Skjuler bånd, linjer, tooltips
        } else {
            // Viser CIMT bånd
            hideAllInteractiveElements(); // Skjul alt andet FØRST
            hideTrendsBand(); // Ekstra sikring
            body.classList.add('cimt-band-visible');
        }
        updateToggleButtonText(toggleCimtButton, 'Vis CIMT Understøttelse');
        updateToggleButtonText(toggleTrendsButton, 'Vis Tendenser/Risici');
        if(toggleConclusionButton) updateToggleButtonText(toggleConclusionButton, 'Vis Konklusion');
    });

    // Knap: Vis/Skjul Tendens bånd
    toggleTrendsButton.addEventListener('click', () => {
        const isCurrentlyVisible = body.classList.contains('trends-band-visible');
        const otherBandVisible = body.classList.contains('cimt-band-visible');
        const infoVisible = currentVisibleInfoBox !== null;

        if (isCurrentlyVisible) {
            // Skjuler Trends bånd
            hideTrendsBand(); // Skjuler bånd og modal
        } else {
             // Viser Trends bånd
            hideAllInteractiveElements(); // Skjul alt andet FØRST
            hideCimtBand(); // Ekstra sikring
            body.classList.add('trends-band-visible');
        }
        updateToggleButtonText(toggleTrendsButton, 'Vis Tendenser/Risici');
        updateToggleButtonText(toggleCimtButton, 'Vis CIMT Understøttelse');
        if(toggleConclusionButton) updateToggleButtonText(toggleConclusionButton, 'Vis Konklusion');
    });

    // Knap: Vis/Skjul Konklusion
     if (toggleConclusionButton && conclusionInfoBox) {
        toggleConclusionButton.addEventListener('click', () => {
            const isCurrentlyVisible = conclusionInfoBox.classList.contains('visible');
            const otherBandCIMT = body.classList.contains('cimt-band-visible');
            const otherBandTrends = body.classList.contains('trends-band-visible');
            const otherInfo = currentVisibleInfoBox && currentVisibleInfoBox !== conclusionInfoBox;


            if (isCurrentlyVisible) {
                // Skjuler konklusion
                hideAllInfoBoxes(); // Skjuler alle info-bokse (inkl konklusion)
                // Opdater knaptekst gøres i hideAllInfoBoxes
            } else {
                // Viser konklusion
                hideAllInteractiveElements(); // Skjul alt andet FØRST
                hideCimtBand();
                hideTrendsBand();

                conclusionInfoBox.classList.add('visible');
                currentVisibleInfoBox = conclusionInfoBox;
                updateToggleButtonText(toggleConclusionButton, 'Vis Konklusion');
            }
            // Opdater de andre knappers tekst
            updateToggleButtonText(toggleCimtButton, 'Vis CIMT Understøttelse');
            updateToggleButtonText(toggleTrendsButton, 'Vis Tendenser/Risici');
        });
     }


    // Klik på workflow steps
    workflowSteps.forEach(step => {
        step.addEventListener('click', () => {
            const infoBoxId = step.dataset.infoTarget;
            const infoBox = document.getElementById(infoBoxId);

            // Skjul bånd (og dermed linjer/tooltips/modal) FØRST
            hideCimtBand();
            hideTrendsBand();

            if (step === currentHighlightedStep) {
                 // Klik på allerede aktivt step: Skjul info-boks og fjern highlight
                hideAllInfoBoxes(); // Skjuler KUN info-bokse (inkl. konklusion)
                removeAllStepHighlights();
            } else {
                hideAllInfoBoxes(); // Skjul forrige info-boks (inkl. konklusion)
                removeAllStepHighlights();

                step.classList.add('highlighted');
                currentHighlightedStep = step;

                // Find den specifikke info-boks til dette trin (ikke konklusionen)
                const targetInfoBox = document.getElementById(infoBoxId);
                if (targetInfoBox && targetInfoBox !== conclusionInfoBox) {
                    targetInfoBox.classList.add('visible');
                    currentVisibleInfoBox = targetInfoBox;
                } else {
                     currentVisibleInfoBox = null; // Nulstil hvis ingen specifik boks
                }
            }
             // Opdater alle knap-tekster
            updateToggleButtonText(toggleCimtButton, 'Vis CIMT Understøttelse');
            updateToggleButtonText(toggleTrendsButton, 'Vis Tendenser/Risici');
            if(toggleConclusionButton) updateToggleButtonText(toggleConclusionButton, 'Vis Konklusion');
        });

         step.addEventListener('keypress', (e) => { /* ... uændret ... */ });
    });

    // Klik på ikoner i BEGGE bånd (fælles listener - RENSET LOGIK)
    allIcons.forEach(icon => {
        icon.addEventListener('click', (event) => {
             event.stopPropagation();

             const parentCimtBand = icon.closest('#cimt-band');
             const parentTrendsBand = icon.closest('#trends-band');
             const isCimtActive = body.classList.contains('cimt-band-visible');
             const isTrendsActive = body.classList.contains('trends-band-visible');

             // Skjul altid info-bokse og step highlights
             hideAllInfoBoxes();
             removeAllStepHighlights();

             if (isTrendsActive && parentTrendsBand) {
                 // *** TRENDS IKON -> VIS MODAL ***
                 console.log("Trend icon clicked:", icon.id);
                 hideAllTooltips(); // Skjul evt. CIMT tooltips/linjer

                 const title = icon.querySelector('.cimt-icon-title')?.textContent || 'Tendens/Risiko';
                 const description = icon.dataset.description || 'Ingen beskrivelse.';
                 const examplesRaw = icon.dataset.examples || '';
                 const examplesHtml = examplesRaw.split('<br>')
                                          .map(ex => ex.trim()).filter(ex => ex)
                                          .map(ex => `<li>${ex}</li>`).join('');

                 modalTitle.textContent = title;
                 modalDescription.textContent = description;
                 modalExamples.innerHTML = examplesHtml ? `<h3>Eksempler i Workflow:</h3><ul>${examplesHtml}</ul>` : '';
                 if(modalContent) modalContent.scrollTop = 0;
                 modalOverlay.classList.add('visible');
                 currentVisibleTooltip = null; // Der er ingen aktiv tooltip nu

             } else if (isCimtActive && parentCimtBand) {
                 // *** CIMT IKON -> VIS TOOLTIP + LINJER ***
                 console.log("CIMT icon clicked:", icon.id);
                 hideModal(); // Skjul evt. modal

                 const tooltipId = icon.dataset.tooltipTarget;
                 const tooltip = document.getElementById(tooltipId);
                 const isCurrentTooltip = tooltip && tooltip.classList.contains('visible');

                 // Gem id på det ikon, hvis tooltip/linjer skal vises (til evt. redraw on resize)
                 // const activeIconId = icon.id; // Gem dette globalt hvis resize skal redraw

                 // Først skjul evt. gamle tooltips/linjer
                 hideAllTooltips(); // Inkluderer removeAllLines()

                 if (!isCurrentTooltip && tooltip) {
                     // Vis ny tooltip OG tegn linjer
                     console.log("Showing tooltip:", tooltipId);
                     tooltip.classList.add('visible');
                     currentVisibleTooltip = tooltip;
                     drawLinesForIcon(icon);
                 } else {
                     console.log("Hiding tooltip (was already visible or no tooltip found)");
                     // Tooltip var synlig (eller findes ikke), og hideAllTooltips() har allerede fjernet den + linjer
                 }
             } else {
                  console.log("Clicked icon in an inactive band?");
             }
        });

         icon.addEventListener('keypress', (e) => { /* ... uændret ... */ });
    });

     // Luk Modal (uændret)
     if (modalOverlay && modalCloseBtn) { /* ... uændret ... */ }

     // Klik udenfor popups/tooltips/infobokse for at lukke dem (uændret)
     document.addEventListener('click', (event) => { /* ... uændret ... */ });

     // Lyt efter resize for at fjerne linjer
     window.addEventListener('resize', handleResize);

     // Initial opdatering af knaptekster (uændret)
     updateToggleButtonText(toggleCimtButton, 'Vis CIMT Understøttelse');
     updateToggleButtonText(toggleTrendsButton, 'Vis Tendenser/Risici');
     if(toggleConclusionButton) updateToggleButtonText(toggleConclusionButton, 'Vis Konklusion');

}); // End DOMContentLoaded
