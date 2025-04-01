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
    const allInfoBoxes = document.querySelectorAll('.info-box'); // Inkl. workflow, cimt, trends, significance
    const significanceInfoBox = document.getElementById('info-significance');
    const allCimtIcons = document.querySelectorAll('#cimt-band .cimt-icon');
    const trendIcons = document.querySelectorAll('#trends-band .cimt-icon');
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
    let activeSignificanceVisual = null;
    let unifiedEffortLine = null;
    let activeLines = []; // For CIMT lines
    let currentVisibleInfoBox = null;
    let currentHighlightedStep = null;
    let currentHighlightedCimtIcon = null;
    let currentHighlightedTrendIcon = null; // NYT: For Trend ikon highlight
    let currentTrendFocusIcon = null; // Holder stadig det *data*-mæssigt aktive trend ikon for fade/indicator logic
    let currentCimtFocusIconId = null; // Holder ID på aktivt CIMT ikon (for fade/line logic)
    // currentTrendExampleTooltip fjernet

    // --- LeaderLine Options ---
    const cimtLineOptions = { color: 'rgba(80, 80, 80, 0.6)', size: 2, path: 'fluid', startSocket: 'auto', endSocket: 'auto', startSocketGravity: [0, -50], endSocketGravity: [0, 100], dash: { animation: true, len: 8, gap: 4 } };
    const unifiedLineOptions = { color: 'rgba(0, 95, 96, 0.7)', size: 4, path: 'arc', startSocket: 'auto', endSocket: 'auto', endPlug: 'arrow1', endPlugSize: 1.5, outline: true, outlineColor: 'rgba(0, 95, 96, 0.2)', outlineSize: 1.5 };

    // --- Debounce Funktion ---
    function debounce(func, wait) { /* ... (uændret) ... */
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
    function removeAllLines() { activeLines.forEach(line => { try { line.remove(); } catch (e) {} }); activeLines = []; hideUnifiedEffortLine(); }
    function removeAllStepHighlights() { if (currentHighlightedStep) { currentHighlightedStep.classList.remove('highlighted'); currentHighlightedStep = null; } }
    function removeCimtIconHighlight() { if (currentHighlightedCimtIcon) { currentHighlightedCimtIcon.classList.remove('highlighted'); currentHighlightedCimtIcon = null; } }
    function removeTrendIconHighlight() { if (currentHighlightedTrendIcon) { currentHighlightedTrendIcon.classList.remove('highlighted'); currentHighlightedTrendIcon = null; } } // NYT

    function clearCimtFocus() {
        if (body.classList.contains('cimt-focus-active')) {
            body.classList.remove('cimt-focus-active');
            fadeableWorkflowSteps.forEach(el => el.classList.remove('relevant-for-cimt'));
            fadeableCimtIcons.forEach(el => el.classList.remove('cimt-focus-icon')); // Bruges stadig til fade logic
            currentCimtFocusIconId = null;
        }
        removeAllLines(); // Fjern linjer
        removeCimtIconHighlight(); // Fjern highlight
    }

    function clearTrendFocus() {
        if (body.classList.contains('trend-focus-active')) {
            body.classList.remove('trend-focus-active');
            fadeableWorkflowSteps.forEach(el => el.classList.remove('relevant-for-trend'));
            fadeableCimtIcons.forEach(el => el.classList.remove('relevant-for-trend'));
            fadeableTrendIcons.forEach(el => el.classList.remove('relevant-for-trend')); // Sørg for at trend ikoner også fader ud
            trendIndicators.forEach(indicator => indicator.classList.remove('visible'));
            // hideTrendExampleTooltip() fjernet
            currentTrendFocusIcon = null;
        }
         removeTrendIconHighlight(); // NYT: Fjern highlight fra trend ikon
    }

    function hideAllInfoAndFocus() {
        let wasInfoBoxVisible = false;
        allInfoBoxes.forEach(box => { if (box.classList.contains('visible')) { box.classList.remove('visible'); wasInfoBoxVisible = true; } });
        if (significanceInfoBox?.classList.contains('visible')) { hideAllSignificanceVisuals(); }
        clearTrendFocus(); // Fjerner trend highlight/fade/indicators
        clearCimtFocus(); // Fjerner CIMT highlight/fade/lines
        if (wasInfoBoxVisible) { currentVisibleInfoBox = null; }
        removeAllStepHighlights(); // Fjerner workflow step highlight
    }

    // --- Funktioner til 'Betydning' Visualiseringer (uændret) ---
    function hidePriorityNumbers() { priorityNumberElements.forEach(el => el.classList.remove('visible')); }
    function showPriorityNumbers() { hideAllSignificanceVisuals(); priorityNumberElements.forEach(el => el.classList.add('visible')); activeSignificanceVisual = 'priority'; }
    function hideUnifiedEffortLine() { if (unifiedEffortLine) { try { unifiedEffortLine.remove(); } catch(e) {} unifiedEffortLine = null; } workflowLayer?.classList.remove('workflow-frame-active'); }
    function showUnifiedEffortLine() { /* ... (uændret) ... */
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
    function hideAllSignificanceVisuals() { hidePriorityNumbers(); hideUnifiedEffortLine(); hideRiskMarkers(); significanceListItems?.forEach(li => li.classList.remove('active-visual')); activeSignificanceVisual = null; }

    // --- Funktioner til Trend Eksempel Tooltips (FJERNEDE) ---
    // function hideTrendExampleTooltip() { ... }
    // function showTrendExampleTooltip() { ... }

    // --- Funktion til at tegne linjer for CIMT Ikon (uændret) ---
    function drawLinesForIcon(iconElement) {
        removeAllLines(); // Fjerner KUN unified line her, da CIMT linjer fjernes før kald
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
    function updateAllButtonTexts() { /* ... (uændret) ... */
        if (toggleCimtButton) { toggleCimtButton.textContent = body.classList.contains('cimt-band-visible') ? 'Skjul CIMT Understøttelse' : 'Vis CIMT Understøttelse'; }
        if (toggleTrendsButton) { toggleTrendsButton.textContent = body.classList.contains('trends-band-visible') ? 'Skjul Tendenser/Risici' : 'Vis Tendenser/Risici'; }
        if (toggleSignificanceButton) { toggleSignificanceButton.textContent = significanceInfoBox?.classList.contains('visible') ? 'Skjul Betydning for CIMT' : 'Vis Betydning for CIMT'; }
    }

    const handleResize = debounce(() => { /* ... (uændret - kalder removeAllLines) ... */
        removeAllLines();
        clearTrendFocus();
        clearCimtFocus();
        // hideTrendExampleTooltip() fjernet
        hideAllInfoAndFocus();
        removeAllStepHighlights();
        updateAllButtonTexts();
    }, 250);

    // --- Klik-Listeners for Kontrolknapper (uændret) ---
    if (toggleCimtButton) { /* ... (uændret) ... */
        toggleCimtButton.addEventListener('click', () => {
            const shouldShow = !body.classList.contains('cimt-band-visible');
            hideAllInfoAndFocus(); removeAllStepHighlights(); body.classList.remove('trends-band-visible');
            if (shouldShow) { body.classList.add('cimt-band-visible'); } else { body.classList.remove('cimt-band-visible'); }
            updateAllButtonTexts();
        });
    }
    if (toggleTrendsButton) { /* ... (uændret) ... */
        toggleTrendsButton.addEventListener('click', () => {
            const shouldShow = !body.classList.contains('trends-band-visible');
            hideAllInfoAndFocus(); removeAllStepHighlights(); body.classList.remove('cimt-band-visible');
            if (shouldShow) { body.classList.add('trends-band-visible'); } else { body.classList.remove('trends-band-visible'); }
            updateAllButtonTexts();
        });
    }
    if (toggleSignificanceButton && significanceInfoBox) { /* ... (uændret) ... */
        toggleSignificanceButton.addEventListener('click', () => {
            const shouldShow = !significanceInfoBox.classList.contains('visible');
            hideAllInfoAndFocus(); removeAllStepHighlights(); body.classList.remove('cimt-band-visible'); body.classList.remove('trends-band-visible');
            if (shouldShow) { significanceInfoBox.classList.add('visible'); currentVisibleInfoBox = significanceInfoBox; } else { currentVisibleInfoBox = null; }
            updateAllButtonTexts();
        });
    }

    // --- Klik/Keypress Listeners for Workflow Steps (FJERNET hover listeners) ---
    workflowSteps.forEach(step => {
        step.addEventListener('click', () => { /* ... (uændret) ... */
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
        // Hover Listeners for Trend Eksempler FJERNEDE
        // step.addEventListener('mouseover', () => { ... });
        // step.addEventListener('mouseout', () => { ... });
        // step.addEventListener('focusout', () => { ... });
    }); // End workflowSteps.forEach


    // --- Klik/Keypress Listeners for CIMT Ikoner (uændret logik - viser info-boks og tegner linjer) ---
    allCimtIcons.forEach(icon => {
        icon.addEventListener('click', (event) => { /* ... (uændret fra forrige version) ... */
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
                     setTimeout(() => { drawLinesForIcon(icon); }, 50); // Kald drawLinesForIcon
                 } else { clearCimtFocus(); }
            }
             updateAllButtonTexts();
        });
        icon.addEventListener('keypress', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); icon.click(); } });
    }); // End allCimtIcons.forEach


    // --- Klik/Keypress Listeners for Trend Ikoner (OPDATERET til at vise info-boks) ---
    trendIcons.forEach(icon => {
         icon.addEventListener('click', (event) => {
            event.stopPropagation(); if (!body.classList.contains('trends-band-visible')) return;

            const trendId = icon.id;
            const infoBoxId = icon.dataset.infoTarget; // NYT: Info target
            const targetInfoBox = document.getElementById(infoBoxId); // NYT: Find info boksen
            // Tjek om det klikkede ikon *allerede* er highlighted
            const isClickingActiveTrend = icon.classList.contains('highlighted');

            // Håndter klik på samme ikon for at lukke
             if (isClickingActiveTrend) {
                 hideAllInfoAndFocus(); // Lukker info boks, fjerner fokus, highlight etc.
                 currentVisibleInfoBox = null;
                 currentTrendFocusIcon = null; // Nulstil data-ikon
                 currentHighlightedTrendIcon = null; // Nulstil highlight-ikon
             } else {
                 // Ryd altid andre visninger/fokus FØRST
                 hideAllInfoAndFocus();
                 removeAllStepHighlights();

                 // Vis nyt Trend fokus
                 if (targetInfoBox && trendId) {
                     currentTrendFocusIcon = icon; // Gem reference til data-ikon
                     currentVisibleInfoBox = targetInfoBox; // Sæt denne som aktiv boks
                     currentHighlightedTrendIcon = icon; // Gem reference til highlight-ikon

                     body.classList.add('trend-focus-active'); // Aktiver fade-effekt
                     icon.classList.add('highlighted'); // Highlight det aktive trend ikon

                     // Find og marker relevante steps og CIMT ikoner (for fade-effekt)
                     const relevantSteps = icon.dataset.relevantSteps?.split(' ') || [];
                     const relevantCimt = icon.dataset.relevantCimt?.split(' ') || [];
                     fadeableWorkflowSteps.forEach(el => { if (relevantSteps.includes(el.id)) { el.classList.add('relevant-for-trend'); } });
                     fadeableCimtIcons.forEach(el => { if (relevantCimt.includes(el.id)) { el.classList.add('relevant-for-trend'); } });
                     // Fade også andre trend ikoner
                     fadeableTrendIcons.forEach(el => { if (!el.classList.contains('highlighted')) { el.classList.add('relevant-for-trend');} }); // Lidt en hack - marker alle andre som relevante for fade out


                     // Vis de små trend-indikator-ikoner på relevante steps
                     trendIndicators.forEach(indicator => {
                          const parentStep = indicator.closest('.workflow-step');
                          if (indicator.classList.contains(`trend-icon-${trendId.replace('trend-', '')}`) && parentStep?.classList.contains('relevant-for-trend')) {
                               indicator.classList.add('visible');
                          }
                     });

                     targetInfoBox.classList.add('visible'); // Vis den korrekte info-boks

                 } else {
                     // Hvis der ikke findes en info-boks, ryd op
                     clearTrendFocus();
                 }
             }
             updateAllButtonTexts();
         }); // End click listener

        icon.addEventListener('keypress', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); icon.click(); } });
    }); // End trendIcons.forEach


    // --- Klik/Keypress Listeners for Betydning List Items (uændret) ---
    if (significanceListItems) { /* ... (uændret) ... */
        significanceListItems.forEach(item => {
            item.addEventListener('click', (event) => {
                event.stopPropagation(); if (!significanceInfoBox?.classList.contains('visible')) return;
                const visualType = item.dataset.visual; const wasActive = item.classList.contains('active-visual');
                clearTrendFocus(); clearCimtFocus(); removeAllStepHighlights(); body.classList.remove('cimt-band-visible'); body.classList.remove('trends-band-visible');
                hideAllSignificanceVisuals();
                if (!wasActive && visualType) {
                     switch (visualType) { case 'priority': showPriorityNumbers(); break; case 'unified': showUnifiedEffortLine(); break; case 'risk': showRiskMarkers(); break; default: console.warn("Unknown visual type:", visualType); }
                    item.classList.add('active-visual');
                }
                if (significanceInfoBox) { significanceInfoBox.classList.add('visible'); currentVisibleInfoBox = significanceInfoBox; }
                 updateAllButtonTexts();
            });
            item.addEventListener('keypress', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); item.click(); } });
        });
    }


     // --- Global Click Listener (Opdateret til at håndtere alle info bokse ens) ---
     document.addEventListener('click', (event) => {
          const clickedElement = event.target;
          const isInteractive = clickedElement.closest('#controls button, #cimt-band .cimt-icon, #trends-band .cimt-icon, .workflow-step, #info-significance li[data-visual], .leader-line');
          const isInsideInfoBox = clickedElement.closest('.info-box-container');

          if (!isInteractive && !isInsideInfoBox) { // Klik udenfor ALT interaktivt og info-området
               let closedSomething = false;
               if (currentVisibleInfoBox) { // Hvis ENHVER info boks er synlig
                   hideAllInfoAndFocus(); // Skjul den, fjern ALLE highlights/fokus/linjer
                   closedSomething = true;
                   currentVisibleInfoBox = null;
               } else { // Hvis ingen info boks var synlig, ryd evt. resterende fokus
                   if (body.classList.contains('trend-focus-active')) { clearTrendFocus(); closedSomething = true; }
                   else if (body.classList.contains('cimt-focus-active')) { clearCimtFocus(); closedSomething = true; }
               }
               if (closedSomething) { updateAllButtonTexts(); }
          }
          // Klik inde i info-boksen (men ikke på et list item) gør ingenting
     }); // End global click listener

     // --- Initialisering ---
     window.addEventListener('resize', handleResize);
     updateAllButtonTexts();

}); // End DOMContentLoaded
