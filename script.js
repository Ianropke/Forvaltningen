document.addEventListener('DOMContentLoaded', () => {
    // Knapper
    const toggleCimtButton = document.getElementById('toggle-cimt');
    const toggleTrendsButton = document.getElementById('toggle-trends');
    const toggleSignificanceButton = document.getElementById('toggle-significance'); // NYT: Opdateret ID

    // Containere / Lag
    const cimtBand = document.getElementById('cimt-band');
    const trendsBand = document.getElementById('trends-band');
    const workflowSteps = document.querySelectorAll('.workflow-step');
    const workflowLayer = document.getElementById('workflow-layer'); // NYT: Tilføjet for linje
    const infoBoxes = document.querySelectorAll('.info-box:not(#info-significance)'); // NYT: Opdateret selector
    const significanceInfoBox = document.getElementById('info-significance'); // NYT: Opdateret ID + variabelnavn
    const allIcons = document.querySelectorAll('.cimt-icon'); // Inkluderer både CIMT & Trends ikoner
    const allCimtIcons = document.querySelectorAll('#cimt-band .cimt-icon'); // NYT: Kun CIMT ikoner
    const tooltips = document.querySelectorAll('.tooltip'); // Kun for CIMT ikoner
    const body = document.body;

    // Modal elementer (uændret)
    const modalOverlay = document.getElementById('modal-overlay');
    const modalContent = document.getElementById('modal-content');
    const modalTitle = document.getElementById('modal-title');
    const modalDescription = document.getElementById('modal-description');
    const modalExamples = document.getElementById('modal-examples');
    const modalCloseBtn = document.getElementById('modal-close-btn');

    // --- NYT: Elementer og state for 'Betydning' visualisering ---
    const significanceListItems = significanceInfoBox?.querySelectorAll('li[data-visual]');
    const priorityNumberElements = document.querySelectorAll('.priority-number');
    let activeSignificanceVisual = null; // Holder styr på hvilken visualisering der er aktiv ('priority', 'unified', 'risk')
    let unifiedEffortLine = null; // Til at holde instansen af den samlede linje
    // --- SLUT NYT ---

    // State variable (uændret, men 'currentVisibleInfoBox' kan nu også være significanceInfoBox)
    let activeLines = []; // For normale CIMT linjer
    let currentVisibleInfoBox = null;
    let currentHighlightedStep = null;
    let currentVisibleTooltip = null;

    // --- LeaderLine Options ---
    const defaultLineOptions = {
        color: 'rgba(120, 120, 120, 0.5)',
        size: 2,
        path: 'fluid',
        startSocket: 'bottom',
        endSocket: 'top',
    };

    // NYT: Options for den samlede linje
     const unifiedLineOptions = {
        color: 'rgba(0, 95, 96, 0.7)', // Mørkere, mere markant farve
        size: 6, // Tykkere linje
        path: 'straight', // Måske en lige linje er bedre her? Eller 'arc'
        startSocket: 'top', // Starter fra toppen af CIMT-båndet
        endSocket: 'bottom', // Slutter på bunden af workflow-laget
        startPlug: 'square',
        endPlug: 'arrow2',
        startPlugSize: 2,
        endPlugSize: 1.5,
        outline: true,
        outlineColor: 'rgba(255, 255, 255, 0.5)',
        outlineSize: 0.5,
        dash: { animation: true, len: 12, gap: 6 } // Gør den animeret
    };


    // --- Funktioner ---

    function hideModal() {
        if (modalOverlay && modalOverlay.classList.contains('visible')) {
            // console.log("Hiding Modal");
            modalOverlay.classList.remove('visible');
        }
    }

    // NYT: Opdateret funktion til at skjule alle info bokse (workflow + betydning)
    function hideAllWorkflowAndSignificanceInfoBoxes() {
        let wasVisible = false;
        // console.log("Hiding Info Boxes & Significance Box");
        infoBoxes.forEach(box => {
            if (box.classList.contains('visible')) {
                box.classList.remove('visible');
                wasVisible = true;
            }
        });
        if (significanceInfoBox && significanceInfoBox.classList.contains('visible')) {
             significanceInfoBox.classList.remove('visible');
             wasVisible = true;
             // NYT: Skjul også tilhørende visualiseringer når boksen skjules
             hideAllSignificanceVisuals();
        }
        if (wasVisible) currentVisibleInfoBox = null;
    }

    function removeAllLines() {
        if (activeLines.length > 0) {
            // console.log("Removing default CIMT lines");
            activeLines.forEach(line => { try { line.remove(); } catch (e) {} });
            activeLines = [];
        }
         // NYT: Sørg også for at fjerne den samlede linje, hvis den findes
         hideUnifiedEffortLine();
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
             // console.log("Hiding Tooltips");
             removeAllLines(); // Fjerner ALLE linjer (både alm. og evt. samlet)
             currentVisibleTooltip = null;
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
         if (wasVisible) currentHighlightedStep = null;
    }

    function drawLinesForIcon(iconElement) {
         // removeAllLines(); // Fjernes altid før kald nu
         if (!iconElement || !document.contains(iconElement) || !body.classList.contains('cimt-band-visible')) return;

         const relevantStepsStr = iconElement.dataset.cimtRelevant || '';
         const relevantSteps = relevantStepsStr.split(' ');
         // console.log("Attempting to draw lines for:", iconElement.id, "to steps:", relevantSteps);

         let linesDrawn = 0;
         relevantSteps.forEach(stepId => {
             if (stepId) {
                 const stepElement = document.getElementById(stepId);
                 if (stepElement && document.contains(stepElement) && document.contains(iconElement)) {
                     try {
                         const line = new LeaderLine(stepElement, iconElement, {...defaultLineOptions}); // Brug default options
                         if (line) { activeLines.push(line); linesDrawn++; }
                     } catch(e) { console.error(`Error drawing line from ${stepId} to ${iconElement.id}:`, e); }
                 }
             }
         });
         // console.log("Lines drawn:", linesDrawn);
    }

    // --- NYT: Funktioner til 'Betydning' Visualiseringer ---

    function hidePriorityNumbers() {
        priorityNumberElements.forEach(el => el.classList.remove('visible'));
    }
    function showPriorityNumbers() {
        hideAllSignificanceVisuals(); // Skjul andre først
        priorityNumberElements.forEach(el => el.classList.add('visible'));
        activeSignificanceVisual = 'priority';
    }

    function hideUnifiedEffortLine() {
        if (unifiedEffortLine) {
            try { unifiedEffortLine.remove(); } catch(e) {}
            unifiedEffortLine = null;
        }
    }
    function showUnifiedEffortLine() {
        hideAllSignificanceVisuals(); // Skjul andre først
        hideAllTooltips(); // Skjul alm. tooltips/linjer
        if (cimtBand && workflowLayer && document.contains(cimtBand) && document.contains(workflowLayer)) {
            try {
                // Vi tegner fra midten af CIMT-båndet til midten af workflow-laget
                unifiedEffortLine = new LeaderLine(
                    LeaderLine.areaAnchor(cimtBand, {x: '50%', y: '0%', width: 0, height: 0}), // Start punkt (top center)
                    LeaderLine.areaAnchor(workflowLayer, {x: '50%', y: '100%', width: 0, height: 0}), // Slut punkt (bund center)
                    {...unifiedLineOptions}
                );
                 activeSignificanceVisual = 'unified';
            } catch (e) {
                console.error("Error drawing unified effort line:", e);
                hideUnifiedEffortLine(); // Ryd op hvis fejl
            }
        } else {
            console.error("Cannot draw unified line: cimtBand or workflowLayer not found/visible.");
        }
    }


    function hideRiskFocusHighlight() {
        allCimtIcons.forEach(icon => icon.classList.remove('risk-focus-highlight'));
    }
    function showRiskFocusHighlight() {
        hideAllSignificanceVisuals(); // Skjul andre først
        allCimtIcons.forEach(icon => icon.classList.add('risk-focus-highlight'));
        activeSignificanceVisual = 'risk';
    }

    function hideAllSignificanceVisuals() {
        // console.log("Hiding all significance visuals");
        hidePriorityNumbers();
        hideUnifiedEffortLine();
        hideRiskFocusHighlight();
        // Fjern aktiv markering fra list items
        significanceListItems?.forEach(li => li.classList.remove('active-visual'));
        activeSignificanceVisual = null;
    }

    // --- SLUT NYT ---


    function updateAllButtonTexts() {
        if (toggleCimtButton) {
            toggleCimtButton.textContent = body.classList.contains('cimt-band-visible') ? 'Skjul CIMT Understøttelse' : 'Vis CIMT Understøttelse';
        }
        if (toggleTrendsButton) {
            toggleTrendsButton.textContent = body.classList.contains('trends-band-visible') ? 'Skjul Tendenser/Risici' : 'Vis Tendenser/Risici';
        }
        // NYT: Opdateret for 'Betydning'
        if (toggleSignificanceButton) {
             toggleSignificanceButton.textContent = significanceInfoBox?.classList.contains('visible') ? 'Skjul Betydning for CIMT' : 'Vis Betydning for CIMT';
        }
    }

    // Debounce funktion (uændret)
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Håndterer resize - fjerner linjer og evt. redraw samlet linje? (Start simpelt: fjern alle)
    const handleResize = debounce(() => {
        if (activeLines.length > 0) { removeAllLines(); }
         // NYT: Fjern også samlet linje ved resize, da positioner ændres
         if (unifiedEffortLine) { hideUnifiedEffortLine(); }
         // Man KUNNE forsøge at gentegne den aktive visualisering, men det er mere komplekst.
    }, 250);


    // --- Event Listeners ---

    // Knap: Vis/Skjul CIMT bånd
    if (toggleCimtButton) {
        toggleCimtButton.addEventListener('click', () => {
            // console.log("CIMT Button Clicked.");
            const shouldShow = !body.classList.contains('cimt-band-visible');

            // Skjul ALTID andre primære visninger FØRST
            body.classList.remove('trends-band-visible');
            hideModal();
            hideAllWorkflowAndSignificanceInfoBoxes(); // NYT: Bruger opdateret funktion (inkl. ryd op i visuals)
            removeAllStepHighlights();
            // hideAllTooltips(); // Gøres nedenfor hvis CIMT skjules

            if (shouldShow) {
                body.classList.add('cimt-band-visible');
            } else {
                body.classList.remove('cimt-band-visible');
                hideAllTooltips(); // Inkl. removeAllLines()
            }
            updateAllButtonTexts();
        });
    }

    // Knap: Vis/Skjul Tendens bånd
    if (toggleTrendsButton) {
        toggleTrendsButton.addEventListener('click', () => {
            // console.log("Trends Button Clicked.");
            const shouldShow = !body.classList.contains('trends-band-visible');

             // Skjul ALTID andre primære visninger FØRST
            body.classList.remove('cimt-band-visible');
            hideAllTooltips(); // Fjerner også linjer
            hideAllWorkflowAndSignificanceInfoBoxes(); // NYT: Bruger opdateret funktion
            removeAllStepHighlights();
            // hideModal(); // Skjules hvis Trends bånd var synligt og skjules nu

            if (shouldShow) {
                body.classList.add('trends-band-visible');
            } else {
                 body.classList.remove('trends-band-visible');
                 hideModal(); // Skjul modal specifikt når båndet skjules
            }
            updateAllButtonTexts();
        });
    }

    // Knap: Vis/Skjul Betydning for CIMT
     if (toggleSignificanceButton && significanceInfoBox) { // NYT: Bruger opdaterede navne
        toggleSignificanceButton.addEventListener('click', () => {
            // console.log("Significance Button Clicked.");
            const shouldShow = !significanceInfoBox.classList.contains('visible');

             // Skjul ALTID andre primære visninger FØRST
            body.classList.remove('cimt-band-visible');
            body.classList.remove('trends-band-visible');
            hideAllTooltips(); // Fjerner linjer
            hideModal();
            removeAllStepHighlights();
            // Skjul også workflow info bokse
            infoBoxes.forEach(box => box.classList.remove('visible'));
            // currentVisibleInfoBox nulstilles nedenfor eller i hideAll...

            if (shouldShow) {
                 // Skjul andre info bokse først, hvis en var synlig
                 hideAllWorkflowAndSignificanceInfoBoxes(); // Rydder også visuals
                 significanceInfoBox.classList.add('visible');
                 currentVisibleInfoBox = significanceInfoBox; // Sæt status
            } else {
                 significanceInfoBox.classList.remove('visible');
                 hideAllSignificanceVisuals(); // Sørg for at rydde visuals når boksen lukkes
                 currentVisibleInfoBox = null;
            }
            updateAllButtonTexts();
        });
     }


    // Klik på workflow steps
    workflowSteps.forEach(step => {
        step.addEventListener('click', () => {
            // console.log("Workflow Step Clicked:", step.id);
            const infoBoxId = step.dataset.infoTarget;
            const targetInfoBox = document.getElementById(infoBoxId);

            // Skjul bånd og Betydning boks (og dens visuals)
            body.classList.remove('cimt-band-visible');
            body.classList.remove('trends-band-visible');
            hideAllTooltips(); // Fjerner linjer
            hideModal();
            hideAllWorkflowAndSignificanceInfoBoxes(); // NYT: Bruger opdateret funktion

            if (step === currentHighlightedStep) {
                // Klik på allerede aktivt step: Skjul alt relateret til steps
                // hideAllWorkflowAndSignificanceInfoBoxes(); // Allerede kaldt ovenfor
                removeAllStepHighlights();
                 // currentVisibleInfoBox = null; // Nulstilles af hideAll...
            } else {
                // Klik på nyt step
                // hideAllWorkflowAndSignificanceInfoBoxes(); // Allerede kaldt
                removeAllStepHighlights();

                step.classList.add('highlighted');
                currentHighlightedStep = step;

                if (targetInfoBox && targetInfoBox !== significanceInfoBox) {
                    targetInfoBox.classList.add('visible');
                    currentVisibleInfoBox = targetInfoBox;
                } else {
                     // currentVisibleInfoBox = null; // Nulstilles af hideAll...
                }
            }
            updateAllButtonTexts(); // Opdater knapper
        });
        // Keypress listener (uændret)
        step.addEventListener('keypress', (e) => { if (e.key === 'Enter' || e.key === ' ') { step.click(); }});
    });

    // Klik på ikoner i BEGGE bånd (CIMT / Trends)
    allIcons.forEach(icon => {
        icon.addEventListener('click', (event) => {
            event.stopPropagation();
            // console.log("Icon Clicked:", icon.id);

            const parentCimtBand = icon.closest('#cimt-band');
            const parentTrendsBand = icon.closest('#trends-band');
            const isCimtActive = body.classList.contains('cimt-band-visible');
            const isTrendsActive = body.classList.contains('trends-band-visible');

            // Skjul altid info-bokse (workflow/betydning) og step highlights
            hideAllWorkflowAndSignificanceInfoBoxes(); // NYT: Bruger opdateret funktion
            removeAllStepHighlights();

            if (isTrendsActive && parentTrendsBand) {
                // *** TRENDS IKON -> VIS MODAL ***
                // console.log("-> Handling as Trend Icon");
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
                // console.log("-> Handling as CIMT Icon");
                hideModal(); // Skjul evt. modal

                const tooltipId = icon.dataset.tooltipTarget;
                const tooltip = document.getElementById(tooltipId);
                const isClickingVisibleTooltip = tooltip && tooltip === currentVisibleTooltip;

                // Skjul altid gamle tooltips/linjer FØRST
                hideAllTooltips(); // Inkluderer removeAllLines()

                if (!isClickingVisibleTooltip && tooltip) {
                    // Vis ny tooltip OG tegn linjer
                    // console.log("Showing tooltip:", tooltipId);
                    tooltip.classList.add('visible');
                    currentVisibleTooltip = tooltip; // Opdater global state
                    drawLinesForIcon(icon);
                } else {
                    // console.log("Hiding tooltip (was already visible or no tooltip found)");
                    // Hvis man klikkede på den allerede synlige, har hideAllTooltips() allerede lukket den + fjernet linjer
                    // Nulstil currentVisibleTooltip, da hideAllTooltips gør dette
                }
            } else {
                // console.log("-> Clicked icon in an inactive band or unknown situation.");
            }
        });
         // Keypress listener (uændret)
        icon.addEventListener('keypress', (e) => { if (e.key === 'Enter' || e.key === ' ') { icon.click(); } });
    });

    // --- NYT: Klik på punkter i 'Betydning' listen ---
    if (significanceListItems) {
        significanceListItems.forEach(item => {
            item.addEventListener('click', (event) => {
                event.stopPropagation(); // Undgå at lukke boksen med det samme
                const visualType = item.dataset.visual;
                // console.log("Significance item clicked:", visualType);

                if (visualType === activeSignificanceVisual) {
                     // Klik på allerede aktiv visualisering: Skjul den
                     hideAllSignificanceVisuals();
                } else {
                    // Klik på ny visualisering: Skjul gamle, vis nye
                    hideAllSignificanceVisuals(); // Ryd op først
                    switch (visualType) {
                        case 'priority':
                            showPriorityNumbers();
                            break;
                        case 'unified':
                            showUnifiedEffortLine();
                            break;
                        case 'risk':
                            showRiskFocusHighlight();
                            break;
                        default:
                            console.warn("Unknown visual type:", visualType);
                    }
                    // Marker det klikkede list item
                    item.classList.add('active-visual');
                }
            });
             // Keypress listener
             item.addEventListener('keypress', (e) => { if (e.key === 'Enter' || e.key === ' ') { item.click(); } });
        });
    }
    // --- SLUT NYT ---


     // Luk Modal (uændret logik, men sikrer at den er sidst for evt. stopPropagation)
     if (modalOverlay && modalCloseBtn) {
         // console.log("Attaching modal close listeners");
         modalCloseBtn.addEventListener('click', (e) => {
             e.stopPropagation();
             // console.log("Close button (X) clicked!");
             hideModal();
         });
         modalOverlay.addEventListener('click', (event) => {
             if (event.target === modalOverlay) {
                 // console.log("Overlay background clicked!");
                 hideModal();
             }
         });
     } else { console.error("FEJL: Kunne ikke finde #modal-overlay eller #modal-close-btn!"); }

     // Klik udenfor popups/tooltips/infobokse for at lukke dem (Udvidet logik)
     document.addEventListener('click', (event) => {
          const clickedElement = event.target;
          const isButtonClicked = clickedElement.closest('#controls button');
          const isCimtIcon = clickedElement.closest('#cimt-band .cimt-icon');
          const isTrendsIcon = clickedElement.closest('#trends-band .cimt-icon');
          const isWorkflowStep = clickedElement.closest('.workflow-step');
          const isSignificanceLi = clickedElement.closest('#info-significance li[data-visual]'); // NYT

          // Luk kun hvis der IKKE klikkes på interaktive elementer der håndterer deres egen state
          if (!isButtonClicked && !isCimtIcon && !isTrendsIcon && !isWorkflowStep && !isSignificanceLi && !clickedElement.closest('#modal-content')) {

              // Luk info-boks (workflow ELLER betydning) hvis klik er udenfor info-boks containeren
               if (currentVisibleInfoBox && !clickedElement.closest('.info-box-container')) {
                   // console.log("Global click: Closing info box");
                   hideAllWorkflowAndSignificanceInfoBoxes(); // Rydder også visuals
                   removeAllStepHighlights();
               }
              // Luk tooltip hvis klik er udenfor CIMT båndet
               else if (currentVisibleTooltip && !clickedElement.closest('#cimt-band')) {
                   // console.log("Global click: Closing tooltip");
                   hideAllTooltips();
               }
               // Modal lukkes af sin egen listener via overlay-klik
          }
     });

     // Lyt efter resize for at fjerne linjer
     window.addEventListener('resize', handleResize);

     // Initial opdatering af knaptekster
     updateAllButtonTexts();

}); // End DOMContentLoaded
