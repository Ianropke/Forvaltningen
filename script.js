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
    const allCimtIcons 
[source: 192] = document.querySelectorAll('#cimt-band .cimt-icon');
    const trendIcons = document.querySelectorAll('#trends-band .cimt-icon');
    const body = document.body;
[source: 193] // Fadeable elements
    const fadeableWorkflowSteps = document.querySelectorAll('#workflow-layer .workflow-step');
    const fadeableCimtIcons = document.querySelectorAll('#cimt-band .cimt-icon');
[source: 194] const fadeableTrendIcons = document.querySelectorAll('#trends-band .cimt-icon');

    // Elementer for 'Betydning' visualisering
    const significanceListItems = significanceInfoBox?.querySelectorAll('li[data-visual]');
[source: 195] const priorityNumberElements = document.querySelectorAll('.priority-number');
    const riskMarkers = document.querySelectorAll('.risk-marker');
    const trendIndicators = document.querySelectorAll('.trend-indicator');
[source: 196] // --- State Variabler ---
    let activeSignificanceVisual = null;
    let unifiedEffortLine = null;
    let activeLines = [];
[source: 197] // For CIMT lines
    let currentVisibleInfoBox = null;
    let currentHighlightedStep = null;
    let currentHighlightedCimtIcon = null;
[source: 198] let currentHighlightedTrendIcon = null;
    let currentTrendFocusIcon = null;
    let currentCimtFocusIconId = null;
[source: 199] // --- LeaderLine Options ---
    const cimtLineOptions = { color: 'rgba(80, 80, 80, 0.6)', size: 2, path: 'fluid', startSocket: 'auto', endSocket: 'auto', startSocketGravity: [0, -50], endSocketGravity: [0, 100], dash: { animation: true, len: 8, gap: 4 } };
[source: 200] const unifiedLineOptions = { color: 'rgba(0, 95, 96, 0.7)', size: 4, path: 'arc', startSocket: 'auto', endSocket: 'auto', endPlug: 'arrow1', endPlugSize: 1.5, outline: true, outlineColor: 'rgba(0, 95, 96, 0.2)', outlineSize: 1.5 };
[source: 201] // --- Debounce Funktion ---
    function debounce(func, wait) {
        let timeout;
[source: 202] return function executedFunction(...args) {
            const later = () => { clearTimeout(timeout);
[source: 203] func(...args); };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // --- Funktioner til rydning og state management ---
    function removeAllLines() { activeLines.forEach(line => { try { line.remove(); } catch (e) {} });
[source: 204] activeLines = []; hideUnifiedEffortLine(); }
    function removeAllStepHighlights() { if (currentHighlightedStep) { currentHighlightedStep.classList.remove('highlighted'); currentHighlightedStep = null;
[source: 205] } }
    function removeCimtIconHighlight() { if (currentHighlightedCimtIcon) { currentHighlightedCimtIcon.classList.remove('highlighted'); currentHighlightedCimtIcon = null;
[source: 206] } }
    function removeTrendIconHighlight() { if (currentHighlightedTrendIcon) { currentHighlightedTrendIcon.classList.remove('highlighted'); currentHighlightedTrendIcon = null;
[source: 207] } }

    function clearCimtFocus() {
        if (body.classList.contains('cimt-focus-active')) {
            body.classList.remove('cimt-focus-active');
[source: 208] fadeableWorkflowSteps.forEach(el => el.classList.remove('relevant-for-cimt'));
            fadeableCimtIcons.forEach(el => el.classList.remove('cimt-focus-icon'));
            currentCimtFocusIconId = null;
        }
        removeAllLines();
        removeCimtIconHighlight();
[source: 209] }

    function clearTrendFocus() {
        if (body.classList.contains('trend-focus-active')) {
            body.classList.remove('trend-focus-active');
[source: 210] fadeableWorkflowSteps.forEach(el => el.classList.remove('relevant-for-trend'));
            fadeableCimtIcons.forEach(el => el.classList.remove('relevant-for-trend'));
            fadeableTrendIcons.forEach(el => el.classList.remove('relevant-for-trend'));
            trendIndicators.forEach(indicator => indicator.classList.remove('visible'));
            currentTrendFocusIcon = null;
[source: 211] }
         removeTrendIconHighlight();
[source: 212] }

    function hideAllSignificanceVisuals() { // Denne kaldes nu altid fra hideAllInfoAndFocus
        hidePriorityNumbers();
[source: 213] hideUnifiedEffortLine();
        hideRiskMarkers();
        significanceListItems?.forEach(li => li.classList.remove('active-visual'));
        activeSignificanceVisual = null;
    }

    // Opdateret funktion:
    function hideAllInfoAndFocus() {
        let wasInfoBoxVisible = false;
[source: 214] allInfoBoxes.forEach(box => { if (box.classList.contains('visible')) { box.classList.remove('visible'); wasInfoBoxVisible = true; } });
[source: 215] // *** ÆNDRING HER: Kald ALTID hideAllSignificanceVisuals ***
        hideAllSignificanceVisuals();
[source: 216] // *** SLUT ÆNDRING ***

        clearTrendFocus();
        clearCimtFocus();
        if (wasInfoBoxVisible) { currentVisibleInfoBox = null;
[source: 217] }
        removeAllStepHighlights();
    }


    // --- Funktioner til 'Betydning' Visualiseringer ---
    function hidePriorityNumbers() { priorityNumberElements.forEach(el => el.classList.remove('visible'));
[source: 218] }
    function showPriorityNumbers() { hideAllSignificanceVisuals(); priorityNumberElements.forEach(el => el.classList.add('visible')); activeSignificanceVisual = 'priority';
[source: 219] }
    function hideUnifiedEffortLine() { if (unifiedEffortLine) { try { unifiedEffortLine.remove(); } catch(e) {} unifiedEffortLine = null;
[source: 220] } workflowLayer?.classList.remove('workflow-frame-active'); }
    function showUnifiedEffortLine() {
        hideAllSignificanceVisuals();
[source: 221] const startElement = infoBoxContainer; const endElement = workflowLayer;
        if (startElement && endElement && document.contains(startElement) && document.contains(endElement)) {
             workflowLayer?.classList.add('workflow-frame-active');
[source: 222] try { unifiedEffortLine = new LeaderLine(startElement, endElement, unifiedLineOptions); activeSignificanceVisual = 'unified'; setTimeout(() => { if (unifiedEffortLine) unifiedEffortLine.position(); }, 50);
[source: 223] }
            catch (e) { console.error("Error drawing unified effort line:", e);
[source: 224] workflowLayer?.classList.remove('workflow-frame-active'); hideUnifiedEffortLine(); }
        } else { console.error("Cannot draw unified effort line: start or end element not found/visible.");
[source: 225] workflowLayer?.classList.remove('workflow-frame-active'); }
    }
    function hideRiskMarkers() { riskMarkers.forEach(marker => marker.classList.remove('visible'));
[source: 226] }
    function showRiskMarkers() { hideAllSignificanceVisuals(); riskMarkers.forEach(marker => marker.classList.add('visible')); activeSignificanceVisual = 'risk';
[source: 227] }


    // --- Funktion til at tegne linjer for CIMT Ikon ---
    function drawLinesForIcon(iconElement) {
        // removeAllLines() kaldes nu FØR denne funktion i klik-handleren for CIMT ikoner
        const relevantStepIds = iconElement.dataset.cimtRelevant?.split(' ') ||
[source: 228] [];
        relevantStepIds.forEach(stepId => {
            const stepElement = document.getElementById(stepId);
            if (stepElement && window.getComputedStyle(stepElement).opacity === '1') {
                try { const line = new LeaderLine(iconElement, stepElement, cimtLineOptions); activeLines.push(line); }
                catch (e) { console.error(`Error drawing line from ${iconElement.id} to ${stepId}:`, e); }
           
[source: 229]  }
        });
[source: 230] }


    // --- Event Listeners ---
    function updateAllButtonTexts() {
        if (toggleCimtButton) { toggleCimtButton.textContent = body.classList.contains('cimt-band-visible') ?
[source: 231] 'Skjul CIMT Understøttelse' : 'Vis CIMT Understøttelse'; }
        if (toggleTrendsButton) { toggleTrendsButton.textContent = body.classList.contains('trends-band-visible') ?
[source: 232] 'Skjul Tendenser/Risici' : 'Vis Tendenser/Risici'; }
        if (toggleSignificanceButton) { toggleSignificanceButton.textContent = significanceInfoBox?.classList.contains('visible') ?
[source: 233] 'Skjul Betydning for CIMT' : 'Vis Betydning for CIMT'; }
    }

    const handleResize = debounce(() => {
        removeAllLines(); clearTrendFocus(); clearCimtFocus();
        hideAllInfoAndFocus(); removeAllStepHighlights();
        updateAllButtonTexts();
    }, 250);
[source: 234] // --- Klik-Listeners for Kontrolknapper ---
    if (toggleCimtButton) {
        toggleCimtButton.addEventListener('click', () => {
            const shouldShow = !body.classList.contains('cimt-band-visible');
            hideAllInfoAndFocus(); removeAllStepHighlights(); body.classList.remove('trends-band-visible');
            if (shouldShow) { body.classList.add('cimt-band-visible'); } else { body.classList.remove('cimt-band-visible'); }
            updateAllButtonTexts();
        });
[source: 235] }
    if (toggleTrendsButton) {
        toggleTrendsButton.addEventListener('click', () => {
            const shouldShow = !body.classList.contains('trends-band-visible');
            hideAllInfoAndFocus(); removeAllStepHighlights(); body.classList.remove('cimt-band-visible');
            if (shouldShow) { body.classList.add('trends-band-visible'); } else { body.classList.remove('trends-band-visible'); }
            updateAllButtonTexts();
        });
[source: 236] }
     if (toggleSignificanceButton && significanceInfoBox) {
        toggleSignificanceButton.addEventListener('click', () => {
            const shouldShow = !significanceInfoBox.classList.contains('visible');
            hideAllInfoAndFocus(); removeAllStepHighlights(); body.classList.remove('cimt-band-visible'); body.classList.remove('trends-band-visible');
            if (shouldShow) { significanceInfoBox.classList.add('visible'); currentVisibleInfoBox = significanceInfoBox; }
            else { currentVisibleInfoBox = null; }
            updateAllButtonTexts();
  
[source: 237]       });
    }

    // --- Klik/Keypress Listeners for Workflow Steps ---
    workflowSteps.forEach(step => {
        step.addEventListener('click', () => {
            const infoBoxId = step.dataset.infoTarget; const targetInfoBox = document.getElementById(infoBoxId);
            if (step === currentHighlightedStep) { hideAllInfoAndFocus(); removeAllStepHighlights(); }
            else {
              
[source: 238]   hideAllInfoAndFocus(); removeAllStepHighlights();
                body.classList.remove('cimt-band-visible'); body.classList.remove('trends-band-visible');
                step.classList.add('highlighted'); currentHighlightedStep = step;
                if (targetInfoBox) { targetInfoBox.classList.add('visible'); currentVisibleInfoBox = targetInfoBox; }
            }
            updateAllButtonTexts();
        });
      
[source: 239]   step.addEventListener('keypress', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); step.click(); }});
    });
[source: 240] // End workflowSteps.forEach


    // --- Klik/Keypress Listeners for CIMT Ikoner ---
    allCimtIcons.forEach(icon => {
        icon.addEventListener('click', (event) => {
            event.stopPropagation(); if (!body.classList.contains('cimt-band-visible')) return;
            const iconId = icon.id; const infoBoxId = icon.dataset.infoTarget; const targetInfoBox = document.getElementById(infoBoxId); const isClickingActiveCimt = iconId && iconId === currentCimtFocusIconId;
            if (isClickingActiveCimt) { hideAllInfoAndFocus(); currentVisibleInfoBox = null; currentCimtFocusIconId = null; currentHighlightedCimtIcon = 
[source: 241] null; }
            else {
                 hideAllInfoAndFocus(); removeAllStepHighlights();
                 if (targetInfoBox && iconId) {
                     currentCimtFocusIconId = iconId; currentVisibleInfoBox = targetInfoBox; currentHighlightedCimtIcon = icon;
                  
[source: 242]    body.classList.add('cimt-focus-active'); icon.classList.add('highlighted'); icon.classList.add('cimt-focus-icon');
                     const relevantSteps = icon.dataset.cimtRelevant?.split(' ') || [];
[source: 243] fadeableWorkflowSteps.forEach(el => { if (relevantSteps.includes(el.id)) { el.classList.add('relevant-for-cimt'); } });
                     targetInfoBox.classList.add('visible');
[source: 244] // Kald drawLines EFTER oprydning og FØR delay er slut
                     removeAllLines();
[source: 245] // Fjern gamle linjer før nye tegnes
                     setTimeout(() => { drawLinesForIcon(icon); }, 50);
[source: 246] } else { clearCimtFocus(); }
            }
             updateAllButtonTexts();
[source: 247] });
        icon.addEventListener('keypress', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); icon.click(); } });
    });
[source: 248] // End allCimtIcons.forEach


    // --- Klik/Keypress Listeners for Trend Ikoner ---
    trendIcons.forEach(icon => {
         icon.addEventListener('click', (event) => {
            event.stopPropagation(); if (!body.classList.contains('trends-band-visible')) return;
            const trendId = icon.id; const infoBoxId = icon.dataset.infoTarget; const targetInfoBox = document.getElementById(infoBoxId);
            const isClickingActiveTrend = icon.classList.contains('highlighted');
             if (isClickingActiveTrend) { 
[source: 249] hideAllInfoAndFocus(); currentVisibleInfoBox = null; currentTrendFocusIcon = null; currentHighlightedTrendIcon = null; }
             else {
                 hideAllInfoAndFocus(); removeAllStepHighlights();
                 if (targetInfoBox && trendId) {
                     currentTrendFocusIcon = icon; currentVisibleInfoBox = targetInfoBox; currentHighlightedTrendIcon = icon;
        
[source: 250]              body.classList.add('trend-focus-active'); icon.classList.add('highlighted');
[source: 251] const relevantSteps = icon.dataset.relevantSteps?.split(' ') || []; const relevantCimt = icon.dataset.relevantCimt?.split(' ') || [];
[source: 252] fadeableWorkflowSteps.forEach(el => { if (relevantSteps.includes(el.id)) { el.classList.add('relevant-for-trend'); } });
                     fadeableCimtIcons.forEach(el => { if (relevantCimt.includes(el.id)) { el.classList.add('relevant-for-trend'); } });
[source: 253] fadeableTrendIcons.forEach(el => { if (!el.classList.contains('highlighted')) { el.classList.add('relevant-for-trend');} });
                     trendIndicators.forEach(indicator => { const parentStep = indicator.closest('.workflow-step'); if (indicator.classList.contains(`trend-icon-${trendId.replace('trend-', '')}`) && parentStep?.classList.contains('relevant-for-trend')) { indicator.classList.add('visible'); } });
[source: 254] targetInfoBox.classList.add('visible');
                 } else { clearTrendFocus(); }
             }
             updateAllButtonTexts();
[source: 255] });
        icon.addEventListener('keypress', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); icon.click(); } });
    });
[source: 256] // End trendIcons.forEach


    // --- Klik/Keypress Listeners for Betydning List Items ---
    if (significanceListItems) {
        significanceListItems.forEach(item => {
            item.addEventListener('click', (event) => {
                event.stopPropagation(); if (!significanceInfoBox?.classList.contains('visible')) return;
                const visualType = item.dataset.visual; const wasActive = item.classList.contains('active-visual');
             
[source: 257]    // Ryd FØRST - men kald IKKE hideAllInfoAndFocus, da significance boksen skal forblive åben
                clearTrendFocus(); clearCimtFocus(); removeAllStepHighlights();
                body.classList.remove('cimt-band-visible'); body.classList.remove('trends-band-visible');
                hideAllSignificanceVisuals(); // Ryd kun significance visuals

                if (!wasActive && visualType) {
        
[source: 258]              switch (visualType) { case 'priority': showPriorityNumbers(); break; case 'unified': showUnifiedEffortLine();
[source: 259] break; case 'risk': showRiskMarkers(); break; default: console.warn("Unknown visual type:", visualType);
[source: 260] }
                    item.classList.add('active-visual');
[source: 261] }
                // Gen-vis significance boksen hvis den blev skjult ved et uheld (burde ikke ske nu)
                 if (significanceInfoBox && !significanceInfoBox.classList.contains('visible')) {
                     significanceInfoBox.classList.add('visible');
[source: 262] currentVisibleInfoBox = significanceInfoBox;
                 } else if (significanceInfoBox) {
                      // Sørg for at den stadig er markeret som den synlige boks
                      currentVisibleInfoBox = significanceInfoBox;
[source: 263] }
                 updateAllButtonTexts();
            });
[source: 264] item.addEventListener('keypress', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); item.click(); } });
        });
[source: 265] }


     // --- Global Click Listener ---
     document.addEventListener('click', (event) => {
          const clickedElement = event.target;
          const isInteractive = clickedElement.closest('#controls button, #cimt-band .cimt-icon, #trends-band .cimt-icon, .workflow-step, #info-significance li[data-visual], .leader-line');
          const isInsideInfoBox = clickedElement.closest('.info-box-container');

          if (!isInteractive && !isInsideInfoBox) {
               let closedSomething = false;
  
[source: 266]              if (currentVisibleInfoBox) {
                    // Hvis den synlige boks er significance, skjul kun dens visuals ved klik udenfor
                    if (currentVisibleInfoBox === significanceInfoBox) {
                        hideAllSignificanceVisuals();
    
[source: 267]                 } else {
                        // Ellers skjul boksen og ryd alt fokus/highlight
                        hideAllInfoAndFocus();
                        currentVisibleInfoBox = null;
 
[source: 268]                    }
                    closedSomething = true;
[source: 269] } else {
                   if (body.classList.contains('trend-focus-active')) { clearTrendFocus();
[source: 270] closedSomething = true; }
                   else if (body.classList.contains('cimt-focus-active')) { clearCimtFocus();
[source: 271] closedSomething = true; }
               }
               if (closedSomething) { updateAllButtonTexts();
[source: 272] }
          }
     });
[source: 273] // End global click listener

     // --- Initialisering ---
     window.addEventListener('resize', handleResize);
     updateAllButtonTexts();
[source: 274] }); // End DOMContentLoaded
