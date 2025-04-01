document.addEventListener('DOMContentLoaded', () => {
    // --- Element Selektorer ---
    const toggleCimtButton = document.getElementById('toggle-cimt');
    const toggleTrendsButton = document.getElementById('toggle-trends');
    const toggleSignificanceButton = document.getElementById('toggle-significance');

    const cimtBand = document.getElementById('cimt-band');
    const trendsBand = document.getElementById('trends-band');
    const workflowSteps = document.querySelectorAll('.workflow-step');
    const workflowLayer = document.getElementById('workflow-layer');
    const infoBoxContainer = document.querySelector('.info-box-container');
    // Finder ALLE info-bokse nu, inkl. dem for CIMT
    const allInfoBoxes = document.querySelectorAll('.info-box');
    const significanceInfoBox = document.getElementById('info-significance');
    const allCimtIcons = document.querySelectorAll('#cimt-band .cimt-icon');
    const trendIcons = document.querySelectorAll('#trends-band .cimt-icon');
    // Tooltip selektor fjernet
    const body = document.body;

    // Fadeable elements
    const fadeableWorkflowSteps = document.querySelectorAll('#workflow-layer .workflow-step');
    const fadeableCimtIcons = document.querySelectorAll('#cimt-band .cimt-icon');
    const fadeableTrendIcons = document.querySelectorAll('#trends-band .cimt-icon');

    // Elementer for 'Betydning' visualisering
    const significanceListItems = significanceInfoBox?.querySelectorAll('li[data-visual]');
    const priorityNumberElements = document.querySelectorAll('.priority-number');
    const riskMarkers = document.querySelectorAll('.risk-marker');
    const trendIndicators = document.querySelectorAll('.trend-indicator');

    // --- State Variabler ---
    let activeSignificanceVisual = null; // 'priority', 'unified', 'risk'
    let unifiedEffortLine = null; // Holder LeaderLine instans for unified pil
    let activeLines = []; // NYT: Til at holde CIMT LeaderLines
    let currentVisibleInfoBox = null; // Holder styr på aktiv info-boks (kan være step, cimt eller significance)
    let currentHighlightedStep = null; // Holder styr på highlightet step (workflow)
    let currentHighlightedCimtIcon = null; // NYT: Holder styr på highlightet CIMT ikon
    // currentVisibleTooltip fjernet
    let currentTrendFocusIcon = null; // Holder styr på aktivt Trend ikon
    let currentCimtFocusIconId = null; // NYT: Holder ID på aktivt CIMT ikon (for fokus-effekt)
    let currentTrendExampleTooltip = null; // Holder det dynamisk oprettede trend tooltip element

    // --- LeaderLine Options ---
    // NYT: Options for linjer fra CIMT ikon til workflow step
    const cimtLineOptions = {
        color: 'rgba(80, 80, 80, 0.6)', // Mørkegrå, semi-transparent
        size: 2,
        path: 'fluid', // Bølget sti
        startSocket: 'auto', // Start fra toppen af ikonet
        endSocket: 'auto',   // Slut på bunden af steppet
        // Sæt lidt "tyngdekraft" for at styre start/slut punkter bedre
        startSocketGravity: [0, -50], // Start lidt oppe fra ikonets center
        endSocketGravity: [0, 100],  // Slut lidt nede på steppets center
        dash: { animation: true, len: 8, gap: 4 } // Animeret stiplet linje
    };

    const unifiedLineOptions = {
        color: 'rgba(0, 95, 96, 0.7)',
        size: 4,
        path: 'arc',
        startSocket: 'auto',
        endSocket: 'auto',
        endPlug: 'arrow1',
        endPlugSize: 1.5,
        outline: true,
        outlineColor: 'rgba(0, 95, 96, 0.2)',
        outlineSize: 1.5
    };

    // --- Debounce Funktion ---
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

    // --- Funktioner til rydning og state management ---

    // NYT: Fjerner alle aktive LeaderLines (både CIMT og Unified)
    function removeAllLines() {
        // Fjern CIMT linjer
        activeLines.forEach(line => {
            try { line.remove(); } catch (e) {}
        });
        activeLines = []; // Tøm array

        // Fjern Unified linje
        hideUnifiedEffortLine(); // Skjuler og nulstiller unifiedEffortLine
    }


    // Rydder CIMT fokus (fade-effekt, aktivt ikon, linjer og highlight)
    function clearCimtFocus() {
        if (body.classList.contains('cimt-focus-active')) {
            body.classList.remove('cimt-focus-active');
            fadeableWorkflowSteps.forEach(el => el.classList.remove('relevant-for-cimt'));
            fadeableCimtIcons.forEach(el => el.classList.remove('cimt-focus-icon'));
            currentCimtFocusIconId = null;
        }
        removeAllLines(); // Fjern linjer når CIMT fokus fjernes
        removeCimtIconHighlight(); // Fjern highlight fra ikonet
         // Skjul ikke info-boks her, det styres af hideAllInfoAndFocus
    }

    // Rydder Trend fokus (uændret)
    function clearTrendFocus() {
        if (body.classList.contains('trend-focus-active')) {
            body.classList.remove('trend-focus-active');
            fadeableWorkflowSteps.forEach(el => el.classList.remove('relevant-for-trend'));
            fadeableCimtIcons.forEach(el => el.classList.remove('relevant-for-trend'));
            trendIndicators.forEach(indicator => indicator.classList.remove('visible'));
            hideTrendExampleTooltip();
            currentTrendFocusIcon = null;
        }
    }

    // Skjuler alle info-bokse og fjerner alle fokus-tilstande/linjer
    function hideAllInfoAndFocus() {
        let wasInfoBoxVisible = false;

        // Skjul ALLE info-bokse (workflow, cimt, significance)
        allInfoBoxes.forEach(box => {
            if (box.classList.contains('visible')) {
                box.classList.remove('visible');
                wasInfoBoxVisible = true;
            }
        });

         // Skjul significance visuals hvis boksen var synlig
        if (significanceInfoBox?.classList.contains('visible')) { // Dobbelttjek, selvom den er i allInfoBoxes
             hideAllSignificanceVisuals();
        }

        // Ryd fokus-tilstande og linjer
        clearTrendFocus();
        clearCimtFocus(); // clearCimtFocus kalder removeAllLines og removeCimtIconHighlight

        // Nulstil state variabler for synlige bokse
        if (wasInfoBoxVisible) {
            currentVisibleInfoBox = null;
        }

        // Fjern highlights
        removeAllStepHighlights(); // Fjerner workflow step highlight
        // removeCimtIconHighlight() kaldes af clearCimtFocus

    }

    // Skjuler alle CIMT tooltips (funktion findes ikke længere)

    // Fjerner highlight fra alle workflow steps
    function removeAllStepHighlights() {
        if (currentHighlightedStep) {
            currentHighlightedStep.classList.remove('highlighted');
            currentHighlightedStep = null;
        }
    }
    // NYT: Fjerner highlight fra CIMT ikon
    function removeCimtIconHighlight() {
        if (currentHighlightedCimtIcon) {
            currentHighlightedCimtIcon.classList.remove('highlighted');
            currentHighlightedCimtIcon = null;
        }
    }


    // --- Funktioner til 'Betydning' Visualiseringer (uændret) ---
    function hidePriorityNumbers() { priorityNumberElements.forEach(el => el.classList.remove('visible')); }
    function showPriorityNumbers() { hideAllSignificanceVisuals(); priorityNumberElements.forEach(el => el.classList.add('visible')); activeSignificanceVisual = 'priority'; }
    function hideUnifiedEffortLine() { if (unifiedEffortLine) { try { unifiedEffortLine.remove(); } catch(e) {} unifiedEffortLine = null; } workflowLayer?.classList.remove('workflow-frame-active'); }
    function showUnifiedEffortLine() {
        hideAllSignificanceVisuals();
        const startElement = infoBoxContainer; const endElement = workflowLayer;
        if (startElement && endElement && document.contains(startElement) && document.contains(endElement)) {
             workflowLayer?.classList.add('workflow-frame-active');
            try { unifiedEffortLine = new LeaderLine(startElement, endElement, unifiedLineOptions); activeSignificanceVisual = 'unified'; setTimeout(() => { if (unifiedEffortLine) unifiedEffortLine.position(); }, 50); }
            catch (e) { console.error("Error drawing unified effort line:", e); workflowLayer?.classList.remove('workflow-frame-active'); hideUnifiedEffortLine(); }
        } else { console.error("Cannot draw unified effort line: start or end element not found/visible."); workflowLayer?.classList.remove('workflow-frame-active'); }
    }
    function hideRiskMarkers() { riskMarkers.forEach(marker => marker.classList.remove('visible')); }
    function showRiskMarkers() { hideAllSignificanceVisuals(); riskMarkers.forEach(marker => marker.classList.add('visible')); activeSignificanceVisual = 'risk'; }
    function hideAllSignificanceVisuals() {
        hidePriorityNumbers();
        hideUnifiedEffortLine();
        hideRiskMarkers();
        significanceListItems?.forEach(li => li.classList.remove('active-visual'));
        activeSignificanceVisual = null;
    }

    // --- Funktioner til Trend Eksempel Tooltips (uændret) ---
    function hideTrendExampleTooltip() { if (currentTrendExampleTooltip) { if (document.body.contains(currentTrendExampleTooltip)) { document.body.removeChild(currentTrendExampleTooltip); } currentTrendExampleTooltip = null; } }
    function showTrendExampleTooltip(stepElement, text) {
        hideTrendExampleTooltip(); if (!text || !stepElement) return;
        const tooltipEl = document.createElement('div'); tooltipEl.className = 'trend-example-tooltip'; tooltipEl.textContent = text;
        document.body.appendChild(tooltipEl);
        const stepRect = stepElement.getBoundingClientRect(); const tooltipRect = tooltipEl.getBoundingClientRect(); const margin = 10;
        let top = stepRect.top + (stepRect.height / 2) - (tooltipRect.height / 2); let left = stepRect.right + margin;
        if (left + tooltipRect.width > window.innerWidth - margin) { left = stepRect.left - tooltipRect.width - margin; }
        if (left < margin) { left = margin; top = stepRect.top - tooltipRect.height - margin; if (top < margin) { top = stepRect.bottom + margin; } }
        if (top < margin) { top = margin; } if (top + tooltipRect.height > window.innerHeight - margin) { top = window.innerHeight - tooltipRect.height - margin; }
        tooltipEl.style.top = `${top}px`; tooltipEl.style.left = `${left}px`;
        requestAnimationFrame(() => { tooltipEl.classList.add('visible'); });
        currentTrendExampleTooltip = tooltipEl;
    }

    // --- NYT: Funktion til at tegne linjer for CIMT Ikon ---
    function drawLinesForIcon(iconElement) {
        removeAllLines(); // Start med at fjerne eksisterende linjer

        const relevantStepIds = iconElement.dataset.cimtRelevant?.split(' ') || [];

        relevantStepIds.forEach(stepId => {
            const stepElement = document.getElementById(stepId);

            // Tjek om stepElement findes OG om det IKKE er fadet ud (opacity < 1)
            if (stepElement && window.getComputedStyle(stepElement).opacity === '1') {
                try {
                    const line = new LeaderLine(iconElement, stepElement, cimtLineOptions);
                    activeLines.push(line); // Gem linjen for at kunne fjerne den senere
                } catch (e) {
                    console.error(`Error drawing line from ${iconElement.id} to ${stepId}:`, e);
                }
            }
        });
    }


    // --- Event Listeners ---

    // Opdaterer teksten på alle kontrolknapper (uændret)
    function updateAllButtonTexts() {
        if (toggleCimtButton) { toggleCimtButton.textContent = body.classList.contains('cimt-band-visible') ? 'Skjul CIMT Understøttelse' : 'Vis CIMT Understøttelse'; }
        if (toggleTrendsButton) { toggleTrendsButton.textContent = body.classList.contains('trends-band-visible') ? 'Skjul Tendenser/Risici' : 'Vis Tendenser/Risici'; }
        if (toggleSignificanceButton) { toggleSignificanceButton.textContent = significanceInfoBox?.classList.contains('visible') ? 'Skjul Betydning for CIMT' : 'Vis Betydning for CIMT'; }
    }

    // Debounced resize handler (opdateret til at kalde removeAllLines)
    const handleResize = debounce(() => {
        removeAllLines(); // Fjerner ALLE linjer (CIMT + Unified)
        clearTrendFocus();
        clearCimtFocus(); // Fjerner også CIMT highlight/fade
        hideTrendExampleTooltip();
        hideAllInfoAndFocus(); // Skjul info bokse ved resize for simpelhed
        removeAllStepHighlights(); // Fjern workflow step highlight
        updateAllButtonTexts();
    }, 250);

    // --- Klik-Listeners for Kontrolknapper (uændret logik) ---
    if (toggleCimtButton) {
        toggleCimtButton.addEventListener('click', () => {
            const shouldShow = !body.classList.contains('cimt-band-visible');
            hideAllInfoAndFocus(); // Ryd alt andet (fjerner også evt. linjer)
            removeAllStepHighlights();
            body.classList.remove('trends-band-visible');
            if (shouldShow) { body.classList.add('cimt-band-visible'); }
            else { body.classList.remove('cimt-band-visible'); /* clearCimtFocus kaldes af hideAllInfo */ }
            updateAllButtonTexts();
        });
    }
    if (toggleTrendsButton) {
        toggleTrendsButton.addEventListener('click', () => {
            const shouldShow = !body.classList.contains('trends-band-visible');
            hideAllInfoAndFocus();
            removeAllStepHighlights();
            body.classList.remove('cimt-band-visible');
            if (shouldShow) { body.classList.add('trends-band-visible'); }
            else { body.classList.remove('trends-band-visible'); /* clearTrendFocus kaldes af hideAllInfo */ }
            updateAllButtonTexts();
        });
    }
     if (toggleSignificanceButton && significanceInfoBox) {
        toggleSignificanceButton.addEventListener('click', () => {
            const shouldShow = !significanceInfoBox.classList.contains('visible');
            hideAllInfoAndFocus();
            removeAllStepHighlights();
            body.classList.remove('cimt-band-visible'); body.classList.remove('trends-band-visible');
            if (shouldShow) { significanceInfoBox.classList.add('visible'); currentVisibleInfoBox = significanceInfoBox; }
            else { currentVisibleInfoBox = null; /* hideAllInfo... skjuler boksen og visuals */ }
            updateAllButtonTexts();
        });
    }

    // --- Klik/Keypress Listeners for Workflow Steps (uændret logik) ---
    workflowSteps.forEach(step => {
        step.addEventListener('click', () => {
            const infoBoxId = step.dataset.infoTarget; const targetInfoBox = document.getElementById(infoBoxId);
            if (step === currentHighlightedStep) { hideAllInfoAndFocus(); removeAllStepHighlights(); }
            else {
                hideAllInfoAndFocus(); removeAllStepHighlights();
                body.classList.remove('cimt-band-visible'); body.classList.remove('trends-band-visible');
                step.classList.add('highlighted'); currentHighlightedStep = step;
                if (targetInfoBox) { targetInfoBox.classList.add('visible'); currentVisibleInfoBox = targetInfoBox; }
            }
            updateAllButtonTexts();
        });
        step.addEventListener('keypress', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); step.click(); }});

        // Hover Listeners for Trend Eksempler (uændret logik)
        step.addEventListener('mouseover', () => {
            if (body.classList.contains('trend-focus-active') && step.classList.contains('relevant-for-trend') && currentTrendFocusIcon) {
                const examplesMapStr = currentTrendFocusIcon.dataset.examplesMap; const stepId = step.id;
                if (examplesMapStr && stepId) {
                    try { const examplesMap = JSON.parse(examplesMapStr.replace(/'/g, '"')); const exampleText = examplesMap[stepId] || examplesMap["Generelt"] || null; if (exampleText) { showTrendExampleTooltip(step, exampleText); } else { hideTrendExampleTooltip(); } }
                    catch (e) { console.error("Error parsing data-examples-map JSON:", e, examplesMapStr); hideTrendExampleTooltip(); }
                } else { hideTrendExampleTooltip(); }
            }
        });
        step.addEventListener('mouseout', () => { setTimeout(() => { hideTrendExampleTooltip(); }, 100); });
         step.addEventListener('focusout', () => { setTimeout(() => { hideTrendExampleTooltip(); }, 100); });
    }); // End workflowSteps.forEach


    // --- Klik/Keypress Listeners for CIMT Ikoner (Opdateret for Info Boks + Linjer) ---
    allCimtIcons.forEach(icon => {
        icon.addEventListener('click', (event) => {
            event.stopPropagation();
            if (!body.classList.contains('cimt-band-visible')) return;

            const iconId = icon.id;
            const infoBoxId = icon.dataset.infoTarget; // Nu info target
            const targetInfoBox = document.getElementById(infoBoxId);
            const isClickingActiveCimt = iconId && iconId === currentCimtFocusIconId;

            // Håndter klik på samme ikon for at lukke
            if (isClickingActiveCimt) {
                 hideAllInfoAndFocus(); // Lukker info boks, fjerner linjer og fokus
                 currentVisibleInfoBox = null;
                 currentCimtFocusIconId = null;
                 currentHighlightedCimtIcon = null; // Nulstil highlight state
            } else {
                 // Ryd altid andre visninger/fokus FØRST
                 hideAllInfoAndFocus();
                 removeAllStepHighlights(); // Fjern evt. workflow highlight

                 // Vis nyt CIMT fokus
                 if (targetInfoBox && iconId) {
                     currentCimtFocusIconId = iconId; // Gem ID for aktivt ikon
                     currentVisibleInfoBox = targetInfoBox; // Sæt denne som aktiv boks
                     currentHighlightedCimtIcon = icon; // Gem reference til ikonet for highlight

                     body.classList.add('cimt-focus-active'); // Aktiver fade-effekt
                     icon.classList.add('highlighted'); // NYT: Highlight det aktive ikon
                     icon.classList.add('cimt-focus-icon'); // (Beholdes for evt. anden styling/selektion)

                     // Find og marker relevante steps (kun for fade-effekt)
                     const relevantSteps = icon.dataset.cimtRelevant?.split(' ') || [];
                     fadeableWorkflowSteps.forEach(el => {
                         if (relevantSteps.includes(el.id)) {
                             el.classList.add('relevant-for-cimt');
                         }
                     });

                     targetInfoBox.classList.add('visible'); // Vis den korrekte info-boks

                     // Tegn linjer EFTER fade er sat og info-boks er synlig (lille delay)
                     setTimeout(() => {
                         drawLinesForIcon(icon);
                     }, 50); // Kort delay for at sikre layout er stabilt

                 } else {
                     // Hvis der ikke findes en info-boks, ryd op
                     clearCimtFocus();
                 }
            }
             updateAllButtonTexts();
        }); // End click listener

        icon.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                icon.click();
            }
        });
    }); // End allCimtIcons.forEach


    // --- Klik/Keypress Listeners for Trend Ikoner (uændret logik) ---
    trendIcons.forEach(icon => {
         icon.addEventListener('click', (event) => {
            event.stopPropagation(); if (!body.classList.contains('trends-band-visible')) return;
            const trendId = icon.id; const isClickingActiveTrend = trendId && currentTrendFocusIcon && trendId === currentTrendFocusIcon.id;
            hideAllInfoAndFocus(); removeAllStepHighlights();
             if (isClickingActiveTrend) { clearTrendFocus(); currentTrendFocusIcon = null; }
             else {
                 clearTrendFocus(); // Ryd gammelt trend fokus
                 if (trendId) {
                     currentTrendFocusIcon = icon; body.classList.add('trend-focus-active');
                     const relevantSteps = icon.dataset.relevantSteps?.split(' ') || []; const relevantCimt = icon.dataset.relevantCimt?.split(' ') || [];
                     fadeableWorkflowSteps.forEach(el => { if (relevantSteps.includes(el.id)) { el.classList.add('relevant-for-trend'); } });
                     fadeableCimtIcons.forEach(el => { if (relevantCimt.includes(el.id)) { el.classList.add('relevant-for-trend'); } });
                     trendIndicators.forEach(indicator => { const parentStep = indicator.closest('.workflow-step'); if (indicator.classList.contains(`trend-icon-${trendId.replace('trend-', '')}`) && parentStep?.classList.contains('relevant-for-trend')) { indicator.classList.add('visible'); } });
                 }
             }
             updateAllButtonTexts();
         });
        icon.addEventListener('keypress', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); icon.click(); } });
    }); // End trendIcons.forEach


    // --- Klik/Keypress Listeners for Betydning List Items (uændret logik) ---
    if (significanceListItems) {
        significanceListItems.forEach(item => {
            item.addEventListener('click', (event) => {
                event.stopPropagation(); if (!significanceInfoBox?.classList.contains('visible')) return;
                const visualType = item.dataset.visual; const wasActive = item.classList.contains('active-visual');
                // Ryd FØRST
                clearTrendFocus(); clearCimtFocus(); removeAllStepHighlights();
                body.classList.remove('cimt-band-visible'); body.classList.remove('trends-band-visible');
                hideAllSignificanceVisuals(); // Ryd alle betydning visuals

                if (!wasActive && visualType) { // Vis ny hvis den ikke var aktiv
                     switch (visualType) {
                        case 'priority': showPriorityNumbers(); break;
                        case 'unified': showUnifiedEffortLine(); break;
                        case 'risk': showRiskMarkers(); break;
                        default: console.warn("Unknown visual type:", visualType);
                    }
                    item.classList.add('active-visual');
                }
                // Gen-vis significance boksen
                 if (significanceInfoBox) { significanceInfoBox.classList.add('visible'); currentVisibleInfoBox = significanceInfoBox; }
                 updateAllButtonTexts();
            });
            item.addEventListener('keypress', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); item.click(); } });
        });
    }


     // --- Global Click Listener (Opdateret for CIMT info bokse) ---
     document.addEventListener('click', (event) => {
          const clickedElement = event.target;

          // Definer interaktive elementer der IKKE skal lukke alt
          const isInteractive = clickedElement.closest(`
              #controls button,
              #cimt-band .cimt-icon, /* Klik på CIMT ikon håndteres af egen listener */
              #trends-band .cimt-icon, /* Klik på Trend ikon håndteres af egen listener */
              .workflow-step, /* Klik på step håndteres af egen listener */
              #info-significance li[data-visual], /* Klik på betydning håndteres af egen listener */
              .leader-line
          `);
           // Tillad klik INDE I info-boksen uden at lukke den
           const isInsideInfoBox = clickedElement.closest('.info-box-container');

          // Hvis der klikkes udenfor interaktive elementer OG udenfor info-boksen
          if (!isInteractive && !isInsideInfoBox) {
               let closedSomething = false;

               // Hvis en info-boks er synlig (og det ikke er significance, som ikke lukker ved klik ude)
               if (currentVisibleInfoBox && currentVisibleInfoBox !== significanceInfoBox) {
                   hideAllInfoAndFocus(); // Skjuler boksen, fjerner fokus, linjer, highlights
                   closedSomething = true;
                   currentVisibleInfoBox = null; // Nulstil
               }
               // Hvis det VAR significance boksen, og klik er udenfor, ryd kun visuals
               else if (currentVisibleInfoBox === significanceInfoBox) {
                   hideAllSignificanceVisuals();
                   closedSomething = true;
                   // currentVisibleInfoBox forbliver significanceInfoBox indtil knappen trykkes
               }

               // Hvis der ikke blev lukket en info-boks, ryd evt. resterende fokus
               if (!closedSomething) {
                   if (body.classList.contains('trend-focus-active')) {
                        clearTrendFocus();
                        closedSomething = true;
                   } else if (body.classList.contains('cimt-focus-active')) {
                        // Hvis der er CIMT fokus, men ingen synlig info boks (burde ikke ske, men for en sikkerheds skyld)
                        clearCimtFocus();
                        closedSomething = true;
                   }
               }

               if (closedSomething) {
                    updateAllButtonTexts();
               }
          }
          // Håndter klik inde i info-boksen, men udenfor et interaktivt element (fx på H2 eller P)
          // - Gør ingenting i dette tilfælde, boksen skal forblive åben.

     }); // End global click listener


     // --- Initialisering ---
     window.addEventListener('resize', handleResize); // Tilføj resize listener
     updateAllButtonTexts(); // Sæt korrekt knaptekst ved start

}); // End DOMContentLoaded
