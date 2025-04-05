
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
    let currentHighlightedTrendIcon = null;
    let currentTrendFocusIcon = null;
    let currentCimtFocusIconId = null;

    // --- LeaderLine Options ---
    const cimtLineOptions = { color: 'rgba(80, 80, 80, 0.6)', size: 2, path: 'fluid', startSocket: 'auto', endSocket: 'auto', startSocketGravity: [0, -50], endSocketGravity: [0, 100], dash: { animation: true, len: 8, gap: 4 } };
    const unifiedLineOptions = { color: 'rgba(0, 95, 96, 0.7)', size: 4, path: 'arc', startSocket: 'auto', endSocket: 'auto', endPlug: 'arrow1', endPlugSize: 1.5, outline: true, outlineColor: 'rgba(0, 95, 96, 0.2)', outlineSize: 1.5 };

    // --- Debounce Funktion ---
    function debounce(func, wait) {
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
    function removeTrendIconHighlight() { if (currentHighlightedTrendIcon) { currentHighlightedTrendIcon.classList.remove('highlighted'); currentHighlightedTrendIcon = null; } }

    function clearCimtFocus() {
        if (body.classList.contains('cimt-focus-active')) {
            body.classList.remove('cimt-focus-active');
            fadeableWorkflowSteps.forEach(el => el.classList.remove('relevant-for-cimt'));
            fadeableCimtIcons.forEach(el => el.classList.remove('cimt-focus-icon'));
            currentCimtFocusIconId = null;
        }
        removeAllLines();
        removeCimtIconHighlight();
    }

    function clearTrendFocus() {
        if (body.classList.contains('trend-focus-active')) {
            body.classList.remove('trend-focus-active');
            fadeableWorkflowSteps.forEach(el => el.classList.remove('relevant-for-trend'));
            fadeableCimtIcons.forEach(el => el.classList.remove('relevant-for-trend'));
            fadeableTrendIcons.forEach(el => el.classList.remove('relevant-for-trend'));
            trendIndicators.forEach(indicator => indicator.classList.remove('visible'));
            currentTrendFocusIcon = null;
        }
         removeTrendIconHighlight();
    }

    function hideAllSignificanceVisuals() { // Denne kaldes nu altid fra hideAllInfoAndFocus
        hidePriorityNumbers();
        hideUnifiedEffortLine();
        hideRiskMarkers();
        significanceListItems?.forEach(li => li.classList.remove('active-visual'));
        activeSignificanceVisual = null;
    }

    // Opdateret funktion:
    function hideAllInfoAndFocus() {
        let wasInfoBoxVisible = false;
        allInfoBoxes.forEach(box => { if (box.classList.contains('visible')) { box.classList.remove('visible'); wasInfoBoxVisible = true; } });

        // *** ÆNDRING HER: Kald ALTID hideAllSignificanceVisuals ***
        hideAllSignificanceVisuals();
        // *** SLUT ÆNDRING ***

        clearTrendFocus();
        clearCimtFocus();
        if (wasInfoBoxVisible) { currentVisibleInfoBox = null; }
        removeAllStepHighlights();
    }


    // --- Funktioner til 'Betydning' Visualiseringer ---
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


    // --- Funktion til at tegne linjer for CIMT Ikon ---
    function drawLinesForIcon(iconElement) {
        // removeAllLines() kaldes nu FØR denne funktion i klik-handleren for CIMT ikoner
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
        if (toggleTrendsButton) { toggleTrendsButton.textContent = body.classList.contains('trends-band-visible') ? 'Skjul Tendenser/Risici' : 'Vis Tendenser/Risici'; }
        if (toggleSignificanceButton) { toggleSignificanceButton.textContent = significanceInfoBox?.classList.contains('visible') ? 'Skjul Betydning for CIMT' : 'Vis Betydning for CIMT'; }
    }

    const handleResize = debounce(() => {
        removeAllLines(); clearTrendFocus(); clearCimtFocus();
        hideAllInfoAndFocus(); removeAllStepHighlights();
        updateAllButtonTexts();
    }, 250);

    // --- Klik-Listeners for Kontrolknapper ---
    if (toggleCimtButton) {
        toggleCimtButton.addEventListener('click', () => {
            const shouldShow = !body.classList.contains('cimt-band-visible');
            hideAllInfoAndFocus(); removeAllStepHighlights(); body.classList.remove('trends-band-visible');
            if (shouldShow) { body.classList.add('cimt-band-visible'); } else { body.classList.remove('cimt-band-visible'); }
            updateAllButtonTexts();
        });
    }
    if (toggleTrendsButton) {
        toggleTrendsButton.addEventListener('click', () => {
            const shouldShow = !body.classList.contains('trends-band-visible');
            hideAllInfoAndFocus(); removeAllStepHighlights(); body.classList.remove('cimt-band-visible');
            if (shouldShow) { body.classList.add('trends-band-visible'); } else { body.classList.remove('trends-band-visible'); }
            updateAllButtonTexts();
        });
    }
     if (toggleSignificanceButton && significanceInfoBox) {
        toggleSignificanceButton.addEventListener('click', () => {
            const shouldShow = !significanceInfoBox.classList.contains('visible');
            hideAllInfoAndFocus(); removeAllStepHighlights(); body.classList.remove('cimt-band-visible'); body.classList.remove('trends-band-visible');
            if (shouldShow) { significanceInfoBox.classList.add('visible'); currentVisibleInfoBox = significanceInfoBox; }
            else { currentVisibleInfoBox = null; }
            updateAllButtonTexts();
        });
    }

    // --- Klik/Keypress Listeners for Workflow Steps ---
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
    }); // End workflowSteps.forEach


    // --- Klik/Keypress Listeners for CIMT Ikoner ---
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
                     // Kald drawLines EFTER oprydning og FØR delay er slut
                     removeAllLines(); // Fjern gamle linjer før nye tegnes
                     setTimeout(() => { drawLinesForIcon(icon); }, 50);
                 } else { clearCimtFocus(); }
            }
             updateAllButtonTexts();
        });
        icon.addEventListener('keypress', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); icon.click(); } });
    }); // End allCimtIcons.forEach


    // --- Klik/Keypress Listeners for Trend Ikoner ---
    trendIcons.forEach(icon => {
         icon.addEventListener('click', (event) => {
            event.stopPropagation(); if (!body.classList.contains('trends-band-visible')) return;
            const trendId = icon.id; const infoBoxId = icon.dataset.infoTarget; const targetInfoBox = document.getElementById(infoBoxId);
            const isClickingActiveTrend = icon.classList.contains('highlighted');
             if (isClickingActiveTrend) { hideAllInfoAndFocus(); currentVisibleInfoBox = null; currentTrendFocusIcon = null; currentHighlightedTrendIcon = null; }
             else {
                 hideAllInfoAndFocus(); removeAllStepHighlights();
                 if (targetInfoBox && trendId) {
                     currentTrendFocusIcon = icon; currentVisibleInfoBox = targetInfoBox; currentHighlightedTrendIcon = icon;
                     body.classList.add('trend-focus-active'); icon.classList.add('highlighted');
                     const relevantSteps = icon.dataset.relevantSteps?.split(' ') || []; const relevantCimt = icon.dataset.relevantCimt?.split(' ') || [];
                     fadeableWorkflowSteps.forEach(el => { if (relevantSteps.includes(el.id)) { el.classList.add('relevant-for-trend'); } });
                     fadeableCimtIcons.forEach(el => { if (relevantCimt.includes(el.id)) { el.classList.add('relevant-for-trend'); } });
                     fadeableTrendIcons.forEach(el => { if (!el.classList.contains('highlighted')) { el.classList.add('relevant-for-trend');} });
                     trendIndicators.forEach(indicator => { const parentStep = indicator.closest('.workflow-step'); if (indicator.classList.contains(`trend-icon-${trendId.replace('trend-', '')}`) && parentStep?.classList.contains('relevant-for-trend')) { indicator.classList.add('visible'); } });
                     targetInfoBox.classList.add('visible');
                 } else { clearTrendFocus(); }
             }
             updateAllButtonTexts();
         });
        icon.addEventListener('keypress', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); icon.click(); } });
    }); // End trendIcons.forEach


    // --- Klik/Keypress Listeners for Betydning List Items ---
    if (significanceListItems) {
        significanceListItems.forEach(item => {
            item.addEventListener('click', (event) => {
                event.stopPropagation(); if (!significanceInfoBox?.classList.contains('visible')) return;
                const visualType = item.dataset.visual; const wasActive = item.classList.contains('active-visual');
                // Ryd FØRST - men kald IKKE hideAllInfoAndFocus, da significance boksen skal forblive åben
                clearTrendFocus(); clearCimtFocus(); removeAllStepHighlights();
                body.classList.remove('cimt-band-visible'); body.classList.remove('trends-band-visible');
                hideAllSignificanceVisuals(); // Ryd kun significance visuals

                if (!wasActive && visualType) {
                     switch (visualType) { case 'priority': showPriorityNumbers(); break; case 'unified': showUnifiedEffortLine(); break; case 'risk': showRiskMarkers(); break; default: console.warn("Unknown visual type:", visualType); }
                    item.classList.add('active-visual');
                }
                // Gen-vis significance boksen hvis den blev skjult ved et uheld (burde ikke ske nu)
                 if (significanceInfoBox && !significanceInfoBox.classList.contains('visible')) {
                     significanceInfoBox.classList.add('visible');
                     currentVisibleInfoBox = significanceInfoBox;
                 } else if (significanceInfoBox) {
                      // Sørg for at den stadig er markeret som den synlige boks
                      currentVisibleInfoBox = significanceInfoBox;
                 }
                 updateAllButtonTexts();
            });
            item.addEventListener('keypress', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); item.click(); } });
        });
    }


     // --- Global Click Listener ---
     document.addEventListener('click', (event) => {
          const clickedElement = event.target;
          const isInteractive = clickedElement.closest('#controls button, #cimt-band .cimt-icon, #trends-band .cimt-icon, .workflow-step, #info-significance li[data-visual], .leader-line');
          const isInsideInfoBox = clickedElement.closest('.info-box-container');

          if (!isInteractive && !isInsideInfoBox) {
               let closedSomething = false;
               if (currentVisibleInfoBox) {
                    // Hvis den synlige boks er significance, skjul kun dens visuals ved klik udenfor
                    if (currentVisibleInfoBox === significanceInfoBox) {
                        hideAllSignificanceVisuals();
                    } else {
                        // Ellers skjul boksen og ryd alt fokus/highlight
                        hideAllInfoAndFocus();
                        currentVisibleInfoBox = null;
                    }
                    closedSomething = true;
               } else {
                   if (body.classList.contains('trend-focus-active')) { clearTrendFocus(); closedSomething = true; }
                   else if (body.classList.contains('cimt-focus-active')) { clearCimtFocus(); closedSomething = true; }
               }
               if (closedSomething) { updateAllButtonTexts(); }
          }
     }); // End global click listener

     // --- Initialisering ---
     window.addEventListener('resize', handleResize);
     updateAllButtonTexts();

}); // End DOMContentLoaded
