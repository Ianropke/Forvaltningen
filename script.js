document.addEventListener('DOMContentLoaded', () => {
    // --- Element Selektorer ---
    const toggleCimtButton = document.getElementById('toggle-cimt');
    // Omdøbt knap og variabel
    const toggleContextButton = document.getElementById('toggle-context');
    // toggleSignificanceButton fjernet

    const cimtBand = document.getElementById('cimt-band');
    const trendsBand = document.getElementById('trends-band'); // Bruges nu som Kontekst-bånd
    const workflowSteps = document.querySelectorAll('.workflow-step');
    const workflowLayer = document.getElementById('workflow-layer');
    const infoBoxContainer = document.querySelector('.info-box-container');
    const allInfoBoxes = document.querySelectorAll('.info-box'); // Inkl. workflow, cimt, trends
    // significanceInfoBox fjernet
    const allCimtIcons = document.querySelectorAll('#cimt-band .cimt-icon');
    // Vælger nu ALLE ikoner i trends/kontekst-båndet
    const allContextIcons = document.querySelectorAll('#trends-band .cimt-icon');
    const body = document.body;

    // Fadeable elements
    const fadeableWorkflowSteps = document.querySelectorAll('#workflow-layer .workflow-step');
    const fadeableCimtIcons = document.querySelectorAll('#cimt-band .cimt-icon');
    const fadeableContextIcons = document.querySelectorAll('#trends-band .cimt-icon'); // Opdateret

    // Elementer for 'Betydning' visualisering (findes stadig på diagrammet)
    const priorityNumberElements = document.querySelectorAll('.priority-number');
    const riskMarkers = document.querySelectorAll('.risk-marker');
    const trendIndicators = document.querySelectorAll('.trend-indicator'); // Bruges stadig for trends

    // --- State Variabler ---
    let activeSignificanceVisual = null; // Bruges stadig til at tracke aktiv visual
    let unifiedEffortLine = null;
    let activeLines = []; // For CIMT lines
    let currentVisibleInfoBox = null; // Kan være step, cimt eller trend info boks
    let currentHighlightedStep = null;
    let currentHighlightedCimtIcon = null;
    let currentHighlightedContextIcon = null; // Erstatter Trend og Significance highlight
    let currentTrendFocusIcon = null; // Bruges stadig til at vide HVILKEN trend der er aktiv for fade/indicators
    let currentCimtFocusIconId = null;

    // --- LeaderLine Options --- (uændret)
    const cimtLineOptions = { color: 'rgba(80, 80, 80, 0.6)', size: 2, path: 'fluid', startSocket: 'auto', endSocket: 'auto', startSocketGravity: [0, -50], endSocketGravity: [0, 100], dash: { animation: true, len: 8, gap: 4 } };
    const unifiedLineOptions = { color: 'rgba(0, 95, 96, 0.7)', size: 4, path: 'arc', startSocket: 'auto', endSocket: 'auto', endPlug: 'arrow1', endPlugSize: 1.5, outline: true, outlineColor: 'rgba(0, 95, 96, 0.2)', outlineSize: 1.5 };

    // --- Debounce Funktion --- (uændret)
    function debounce(func, wait) { /* ... */
        let timeout;
        return function executedFunction(...args) {
            const later = () => { clearTimeout(timeout); func(...args); };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
     }

    // --- Funktioner til rydning og state management ---
    function removeAllLines() { activeLines.forEach(line => { try { line.remove(); } catch (e) {} }); activeLines = []; hideUnifiedEffortLine(); }
    function removeAllStepHighlights() { if (currentHighlightedStep) { currentHighlightedStep.classList.remove('highlighted'); currentHighlightedStep = null; } }
    function removeCimtIconHighlight() { if (currentHighlightedCimtIcon) { currentHighlightedCimtIcon.classList.remove('highlighted'); currentHighlightedCimtIcon = null; } }
    function removeContextIconHighlight() { if (currentHighlightedContextIcon) { currentHighlightedContextIcon.classList.remove('highlighted'); currentHighlightedContextIcon = null; } } // Opdateret

    // Rydder significance visuals (flyttet ud fra hideAllInfoAndFocus)
    function hideAllSignificanceVisuals() {
        hidePriorityNumbers();
        hideUnifiedEffortLine();
        hideRiskMarkers();
        // Fjern highlight fra betydning-ikoner i kontekst-båndet
        allContextIcons.forEach(icon => {
            if (icon.dataset.betydningVisual) { // Hvis det er et betydning-ikon
                icon.classList.remove('highlighted'); // Fjern specifik highlight for disse
            }
        });
        activeSignificanceVisual = null;
    }

    function clearCimtFocus() {
        if (body.classList.contains('cimt-focus-active')) {
            body.classList.remove('cimt-focus-active');
            fadeableWorkflowSteps.forEach(el => el.classList.remove('relevant-for-cimt'));
            fadeableCimtIcons.forEach(el => el.classList.remove('cimt-focus-icon'));
            currentCimtFocusIconId = null;
        }
        removeAllLines(); // Fjerner kun CIMT linjer nu
        removeCimtIconHighlight();
    }

    function clearTrendFocus() { // Nu "Kontekst" fokus for fade/indicators
        if (body.classList.contains('trend-focus-active')) {
            body.classList.remove('trend-focus-active');
            fadeableWorkflowSteps.forEach(el => el.classList.remove('relevant-for-trend'));
            fadeableCimtIcons.forEach(el => el.classList.remove('relevant-for-trend'));
            fadeableContextIcons.forEach(el => el.classList.remove('relevant-for-trend')); // Ryd context ikoner
            trendIndicators.forEach(indicator => indicator.classList.remove('visible'));
            currentTrendFocusIcon = null;
        }
         removeContextIconHighlight(); // Fjerner highlight fra det aktive kontekst ikon
    }


    // Skjuler alle info-bokse og fjerner alle fokus-tilstande/linjer/visuals
    function hideAllInfoAndFocus() {
        let wasInfoBoxVisible = false;
        allInfoBoxes.forEach(box => { if (box.classList.contains('visible')) { box.classList.remove('visible'); wasInfoBoxVisible = true; } });

        hideAllSignificanceVisuals(); // Ryd altid significance visuals
        clearTrendFocus(); // Ryd trend/kontekst fokus (fade, indicators, highlight)
        clearCimtFocus(); // Ryd CIMT fokus (fade, lines, highlight)

        if (wasInfoBoxVisible) { currentVisibleInfoBox = null; }
        removeAllStepHighlights();
        // Ikon highlights ryddes af clearXxxFocus
    }


    // --- Funktioner til 'Betydning' Visualiseringer (ryddet op, da de nu kaldes direkte) ---
    function hidePriorityNumbers() { priorityNumberElements.forEach(el => el.classList.remove('visible')); }
    function showPriorityNumbers() { /* hideAll... kaldes FØR denne */ priorityNumberElements.forEach(el => el.classList.add('visible')); activeSignificanceVisual = 'priority'; }
    function hideUnifiedEffortLine() { if (unifiedEffortLine) { try { unifiedEffortLine.remove(); } catch(e) {} unifiedEffortLine = null; } workflowLayer?.classList.remove('workflow-frame-active'); }
    function showUnifiedEffortLine() { /* hideAll... kaldes FØR denne */
        const startElement = infoBoxContainer; const endElement = workflowLayer; // Start fra bunden, peg op
        if (startElement && endElement && document.contains(startElement) && document.contains(endElement)) {
             workflowLayer?.classList.add('workflow-frame-active');
            try { unifiedEffortLine = new LeaderLine(startElement, endElement, unifiedLineOptions); activeSignificanceVisual = 'unified'; setTimeout(() => { if (unifiedEffortLine) unifiedEffortLine.position(); }, 50); }
            catch (e) { console.error("Error drawing unified effort line:", e); workflowLayer?.classList.remove('workflow-frame-active'); hideUnifiedEffortLine(); }
        } else { console.error("Cannot draw unified effort line: start or end element not found/visible."); workflowLayer?.classList.remove('workflow-frame-active'); }
    }
    function hideRiskMarkers() { riskMarkers.forEach(marker => marker.classList.remove('visible')); }
    function showRiskMarkers() { /* hideAll... kaldes FØR denne */ riskMarkers.forEach(marker => marker.classList.add('visible')); activeSignificanceVisual = 'risk'; }

    // --- Funktion til at tegne linjer for CIMT Ikon (uændret) ---
    function drawLinesForIcon(iconElement) {
        // removeAllLines() kaldes FØR denne i klik-handleren
        const relevantStepIds = iconElement.dataset.cimtRelevant?.split(' ') || [];
        relevantStepIds.forEach(stepId => {
            const stepElement = document.getElementById(stepId);
            if (stepElement && window.getComputedStyle(stepElement).opacity === '1') {
                try { const line = new LeaderLine(iconElement, stepElement, cimtLineOptions); activeLines.push(line); }
                catch (e) { console.error(`Error drawing line from ${iconElement.id} to ${stepId}:`, e); }
            }
        });
    }


    // --- Event Listeners ---
    function updateAllButtonTexts() {
        if (toggleCimtButton) { toggleCimtButton.textContent = body.classList.contains('cimt-band-visible') ? 'Skjul CIMT Understøttelse' : 'Vis CIMT Understøttelse'; }
        // Opdateret knaptekst og klasse
        if (toggleContextButton) { toggleContextButton.textContent = body.classList.contains('context-band-visible') ? 'Skjul Kontekst & Tendenser' : 'Vis Kontekst & Tendenser'; }
        // toggleSignificanceButton fjernet
    }

    const handleResize = debounce(() => { removeAllLines(); clearTrendFocus(); clearCimtFocus(); hideAllInfoAndFocus(); removeAllStepHighlights(); updateAllButtonTexts(); }, 250);

    // --- Klik-Listeners for Kontrolknapper (Opdateret) ---
    if (toggleCimtButton) {
        toggleCimtButton.addEventListener('click', () => {
            const shouldShow = !body.classList.contains('cimt-band-visible');
            hideAllInfoAndFocus(); removeAllStepHighlights();
            body.classList.remove('context-band-visible'); // Sørg for at kontekst-bånd er skjult
            if (shouldShow) { body.classList.add('cimt-band-visible'); }
            else { body.classList.remove('cimt-band-visible'); }
            updateAllButtonTexts();
        });
    }
    // Opdateret listener for Kontekst-knap
    if (toggleContextButton) {
        toggleContextButton.addEventListener('click', () => {
            const shouldShow = !body.classList.contains('context-band-visible');
            hideAllInfoAndFocus(); removeAllStepHighlights();
            body.classList.remove('cimt-band-visible'); // Sørg for at CIMT-bånd er skjult
            if (shouldShow) { body.classList.add('context-band-visible'); }
            else { body.classList.remove('context-band-visible'); }
            updateAllButtonTexts();
        });
    }
     // toggleSignificanceButton listener fjernet

    // --- Klik/Keypress Listeners for Workflow Steps (uændret) ---
    workflowSteps.forEach(step => {
        step.addEventListener('click', () => {
            const infoBoxId = step.dataset.infoTarget; const targetInfoBox = document.getElementById(infoBoxId);
            if (step === currentHighlightedStep) { hideAllInfoAndFocus(); removeAllStepHighlights(); }
            else {
                hideAllInfoAndFocus(); removeAllStepHighlights();
                body.classList.remove('cimt-band-visible'); body.classList.remove('context-band-visible'); // Opdateret klasse
                step.classList.add('highlighted'); currentHighlightedStep = step;
                if (targetInfoBox) { targetInfoBox.classList.add('visible'); currentVisibleInfoBox = targetInfoBox; }
            }
            updateAllButtonTexts();
        });
        step.addEventListener('keypress', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); step.click(); }});
    }); // End workflowSteps.forEach


    // --- Klik/Keypress Listeners for CIMT Ikoner (uændret logik) ---
    allCimtIcons.forEach(icon => {
        icon.addEventListener('click', (event) => {
            event.stopPropagation(); if (!body.classList.contains('cimt-band-visible')) return;
            const iconId = icon.id; const infoBoxId = icon.dataset.infoTarget; const targetInfoBox = document.getElementById(infoBoxId); const isClickingActiveCimt = iconId && iconId === currentCimtFocusIconId;
            if (isClickingActiveCimt) { hideAllInfoAndFocus(); currentVisibleInfoBox = null; currentCimtFocusIconId = null; currentHighlightedCimtIcon = null; }
            else {
                 hideAllInfoAndFocus(); removeAllStepHighlights();
                 if (targetInfoBox && iconId) {
                     currentCimtFocusIconId = iconId; currentVisibleInfoBox = targetInfoBox; currentHighlightedCimtIcon = icon;
                     body.classList.add('cimt-focus-active'); icon.classList.add('highlighted'); icon.classList.add('cimt-focus-icon');
                     const relevantSteps = icon.dataset.cimtRelevant?.split(' ') || [];
                     fadeableWorkflowSteps.forEach(el => { if (relevantSteps.includes(el.id)) { el.classList.add('relevant-for-cimt'); } });
                     targetInfoBox.classList.add('visible');
                     removeAllLines(); // Fjern gamle linjer før nye tegnes
                     setTimeout(() => { drawLinesForIcon(icon); }, 50);
                 } else { clearCimtFocus(); }
            }
             updateAllButtonTexts();
        });
        icon.addEventListener('keypress', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); icon.click(); } });
    }); // End allCimtIcons.forEach


    // --- Klik/Keypress Listeners for Kontekst Ikoner (Trends + Betydning) ---
    allContextIcons.forEach(icon => {
         icon.addEventListener('click', (event) => {
            event.stopPropagation(); if (!body.classList.contains('context-band-visible')) return;

            const isClickingActive = icon.classList.contains('highlighted');
            const infoBoxId = icon.dataset.infoTarget; // For Trend ikoner
            const betydningVisual = icon.dataset.betydningVisual; // For Betydning ikoner

            // Håndter klik på samme ikon for at lukke/fjerne
             if (isClickingActive) {
                 hideAllInfoAndFocus(); // Lukker info boks, fjerner fokus, highlight, visuals
                 currentVisibleInfoBox = null;
                 currentTrendFocusIcon = null;
                 currentHighlightedContextIcon = null;
                 activeSignificanceVisual = null; // Sørg for at nulstille denne også
             } else {
                 // Ryd altid andre visninger/fokus FØRST
                 hideAllInfoAndFocus();
                 removeAllStepHighlights();

                 // Vis nyt fokus/visual
                 currentHighlightedContextIcon = icon; // Sæt highlight på det klikkede ikon
                 icon.classList.add('highlighted');

                 // Håndter TREND ikoner
                 if (infoBoxId) {
                     const targetInfoBox = document.getElementById(infoBoxId);
                     if (targetInfoBox) {
                         currentTrendFocusIcon = icon; // Gem reference til data-ikon
                         currentVisibleInfoBox = targetInfoBox; // Sæt denne som aktiv boks

                         body.classList.add('trend-focus-active'); // Aktiver fade-effekt

                         // Find og marker relevante steps og CIMT ikoner (for fade-effekt)
                         const relevantSteps = icon.dataset.relevantSteps?.split(' ') || [];
                         const relevantCimt = icon.dataset.relevantCimt?.split(' ') || [];
                         fadeableWorkflowSteps.forEach(el => { if (relevantSteps.includes(el.id)) { el.classList.add('relevant-for-trend'); } });
                         fadeableCimtIcons.forEach(el => { if (relevantCimt.includes(el.id)) { el.classList.add('relevant-for-trend'); } });
                         fadeableContextIcons.forEach(el => { if (!el.classList.contains('highlighted') && !el.dataset.betydningVisual) { el.classList.add('relevant-for-trend');} }); // Fade andre trend ikoner

                         // Vis de små trend-indikator-ikoner
                         trendIndicators.forEach(indicator => {
                              const parentStep = indicator.closest('.workflow-step');
                              if (indicator.classList.contains(`trend-icon-${icon.id.replace('trend-', '')}`) && parentStep?.classList.contains('relevant-for-trend')) {
                                   indicator.classList.add('visible');
                              }
                         });

                         targetInfoBox.classList.add('visible'); // Vis info-boksen
                     } else {
                         clearTrendFocus(); // Ryd op hvis info-boks ikke findes
                     }
                 }
                 // Håndter BETYDNING ikoner
                 else if (betydningVisual) {
                     // HideAllInfoAndFocus har allerede ryddet visuals, så vi skal bare vise den nye
                     switch (betydningVisual) {
                        case 'priority': showPriorityNumbers(); break;
                        case 'unified': showUnifiedEffortLine(); break;
                        case 'risk': showRiskMarkers(); break;
                        default: console.warn("Unknown visual type:", betydningVisual);
                    }
                    // activeSignificanceVisual sættes i showXxx funktionerne
                    // Ingen info-boks at vise for disse
                    currentVisibleInfoBox = null;
                     // Ingen fade effekt for betydning visuals
                 }
             }
             updateAllButtonTexts();
         }); // End click listener

        icon.addEventListener('keypress', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); icon.click(); } });
    }); // End allContextIcons.forEach

    // Listener for significanceListItems er fjernet

    // --- Global Click Listener (Opdateret) ---
     document.addEventListener('click', (event) => {
          const clickedElement = event.target;
          // Opdateret selector til at inkludere context-bånd ikoner
          const isInteractive = clickedElement.closest('#controls button, #cimt-band .cimt-icon, #trends-band .cimt-icon, .workflow-step, .leader-line');
          const isInsideInfoBox = clickedElement.closest('.info-box-container');

          if (!isInteractive && !isInsideInfoBox) {
               let closedSomething = false;
               if (currentVisibleInfoBox) {
                   hideAllInfoAndFocus(); // Skjul info boksen og ryd alt
                   closedSomething = true;
                   currentVisibleInfoBox = null;
               } else { // Hvis ingen info boks var synlig
                    // Hvis kun en Betydning visual var aktiv
                    if (activeSignificanceVisual) {
                       hideAllSignificanceVisuals(); // Skjul kun den
                       removeContextIconHighlight(); // Fjern highlight fra Betydning-ikonet
                       closedSomething = true;
                    }
                    // Ellers ryd resterende fokus (burde være dækket af hideAllInfoAndFocus hvis boks var synlig)
                   else if (body.classList.contains('trend-focus-active')) { clearTrendFocus(); closedSomething = true; }
                   else if (body.classList.contains('cimt-focus-active')) { clearCimtFocus(); closedSomething = true; }
               }
               if (closedSomething) { updateAllButtonTexts(); }
          }
     }); // End global click listener

     // --- Initialisering ---
     window.addEventListener('resize', handleResize);
     updateAllButtonTexts();

}); // End DOMContentLoaded
