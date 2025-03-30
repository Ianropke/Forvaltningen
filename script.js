document.addEventListener('DOMContentLoaded', () => {
    // Knapper
    const toggleCimtButton = document.getElementById('toggle-cimt');
    const toggleTrendsButton = document.getElementById('toggle-trends');
    const toggleSignificanceButton = document.getElementById('toggle-significance');

    // Containere / Lag
    const cimtBand = document.getElementById('cimt-band');
    const trendsBand = document.getElementById('trends-band');
    const workflowSteps = document.querySelectorAll('.workflow-step');
    const workflowLayer = document.getElementById('workflow-layer');
    const infoBoxContainer = document.querySelector('.info-box-container');
    const infoBoxes = document.querySelectorAll('.info-box:not(#info-significance)'); // Ekskl. significance
    const significanceInfoBox = document.getElementById('info-significance');
    // const trendInfoBox = // Fjernet
    const allIcons = document.querySelectorAll('.cimt-icon'); // Alle ikoner (CIMT + Trends)
    const allCimtIcons = document.querySelectorAll('#cimt-band .cimt-icon'); // Kun CIMT ikoner
    const trendIcons = document.querySelectorAll('#trends-band .cimt-icon'); // Kun Trend ikoner
    const tooltips = document.querySelectorAll('#cimt-band .tooltip'); // Kun CIMT tooltips
    const body = document.body;
    const fadeableWorkflowSteps = document.querySelectorAll('#workflow-layer .workflow-step'); // Kun workflow steps til fade
    const fadeableCimtIcons = document.querySelectorAll('#cimt-band .cimt-icon'); // Kun CIMT ikoner til fade
    const dynamicTooltipContainer = document.getElementById('dynamic-tooltip-container'); // Til trend eksempler

    // Elementer og state for 'Betydning' visualisering
    const significanceListItems = significanceInfoBox?.querySelectorAll('li[data-visual]');
    const priorityNumberElements = document.querySelectorAll('.priority-number');
    const riskMarkers = document.querySelectorAll('.risk-marker');
    const trendIndicators = document.querySelectorAll('.trend-indicator');
    let activeSignificanceVisual = null;
    let unifiedEffortLine = null;

    // State variable
    let activeLines = [];
    let currentVisibleInfoBox = null;
    let currentHighlightedStep = null;
    let currentVisibleTooltip = null;
    let currentTrendFocusIcon = null;
    let currentCimtFocusIcon = null; // Holder ID på aktivt CIMT ikon for fade
    let currentTrendExampleTooltip = null;

    // LeaderLine Options
    const defaultLineOptions = { color: 'rgba(120, 120, 120, 0.5)', size: 2, path: 'fluid', startSocket: 'bottom', endSocket: 'top' };
    // Opdateret "almindelig" bue-pil
    const unifiedLineOptions = {
        color: 'rgba(0, 95, 96, 0.7)',
        size: 4, // Tynd pil
        path: 'arc', // Bue sti
        endPlug: 'arrow1', // Simpel pilespids
        endPlugSize: 1.5, // Standard størrelse
    };

    // --- Debounce Funktion ---
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => { clearTimeout(timeout); func(...args); };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    // -------------------------------------------------------


    // --- Funktioner til rydning og state management ---
    function clearCimtFocus() {
        if (body.classList.contains('cimt-focus-active')) {
            body.classList.remove('cimt-focus-active');
            fadeableWorkflowSteps.forEach(el => el.classList.remove('relevant-for-cimt'));
            fadeableCimtIcons.forEach(el => el.classList.remove('cimt-focus-icon'));
            currentCimtFocusIcon = null;
        }
    }

    function clearTrendFocus() {
        if (body.classList.contains('trend-focus-active')) {
            body.classList.remove('trend-focus-active');
            fadeableWorkflowSteps.forEach(el => el.classList.remove('relevant-for-trend'));
            fadeableCimtIcons.forEach(el => el.classList.remove('relevant-for-trend'));
            trendIndicators.forEach(indicator => indicator.classList.remove('visible'));
            hideTrendExampleTooltip();
            currentTrendFocusIcon = null;
            // updateAllButtonTexts(); // Kaldes typisk af den funktion der kalder clearTrendFocus
        }
    }

    // Skjul alle info bokse (Workflow + Significance) og ryd fokus
    function hideAllInfoAndFocus() {
        let wasBoxVisible = false;
        infoBoxes.forEach(box => { if (box.classList.contains('visible')) { box.classList.remove('visible'); wasBoxVisible = true; } });
        if (significanceInfoBox?.classList.contains('visible')) { significanceInfoBox.classList.remove('visible'); wasBoxVisible = true; hideAllSignificanceVisuals(); }
        clearTrendFocus(); // Ryd altid trend fokus
        clearCimtFocus(); // Ryd altid CIMT fokus
        if (wasBoxVisible && currentVisibleInfoBox !== significanceInfoBox) {
            currentVisibleInfoBox = null;
        }
         if (wasBoxVisible && currentVisibleInfoBox !== significanceInfoBox) {
            removeAllStepHighlights();
         }
    }


    function removeAllLines() {
        activeLines.forEach(line => { try { line.remove(); } catch (e) {} });
        activeLines = [];
        hideUnifiedEffortLine();
    }

    function hideAllTooltips() {
        let wasVisible = false;
        tooltips.forEach(tip => { if (tip.classList.contains('visible')) { tip.classList.remove('visible'); wasVisible = true; } });
        if (wasVisible) {
             // removeAllLines(); // Linjer fjernes ikke længere for CIMT
             clearCimtFocus(); // Ryd CIMT fade effekt når tooltip lukkes
             currentVisibleTooltip = null;
        } else {
             clearCimtFocus(); // Ryd også hvis ingen tooltip var synlig
        }
    }

    function removeAllStepHighlights() {
        let wasVisible = false;
        workflowSteps.forEach(step => { if (step.classList.contains('highlighted')) { step.classList.remove('highlighted'); wasVisible = true; } });
        if (wasVisible) currentHighlightedStep = null;
    }

    // drawLinesForIcon er fjernet, da linjer ikke bruges mere for CIMT
    // function drawLinesForIcon(iconElement) { ... }

    // --- Funktioner til 'Betydning' Visualiseringer ---
    function hidePriorityNumbers() { priorityNumberElements.forEach(el => el.classList.remove('visible')); }
    function showPriorityNumbers() { hideAllSignificanceVisuals(); priorityNumberElements.forEach(el => el.classList.add('visible')); activeSignificanceVisual = 'priority'; }
    function hideUnifiedEffortLine() { if (unifiedEffortLine) { try { unifiedEffortLine.remove(); } catch(e) {} unifiedEffortLine = null; } }

    function showUnifiedEffortLine() {
        hideAllSignificanceVisuals(); hideAllTooltips(); clearTrendFocus();
        const startElement = infoBoxContainer; const endElement = workflowLayer;
        if (startElement && endElement && document.contains(startElement) && document.contains(endElement)) {
            workflowLayer?.classList.add('workflow-frame-active');
            try { unifiedEffortLine = new LeaderLine( startElement, endElement, {...unifiedLineOptions}); activeSignificanceVisual = 'unified'; }
            catch (e) { console.error("Error drawing unified effort line:", e); workflowLayer?.classList.remove('workflow-frame-active'); hideUnifiedEffortLine(); }
        } else { console.error("Cannot draw unified effort line: start or end element not found/visible."); }
    }
    function hideRiskMarkers() { riskMarkers.forEach(marker => marker.classList.remove('visible')); }
    function showRiskMarkers() { hideAllSignificanceVisuals(); riskMarkers.forEach(marker => marker.classList.add('visible')); activeSignificanceVisual = 'risk'; }


    function hideAllSignificanceVisuals() {
        hidePriorityNumbers();
        hideUnifiedEffortLine();
        hideRiskMarkers();
        workflowLayer?.classList.remove('workflow-frame-active');
        significanceListItems?.forEach(li => li.classList.remove('active-visual'));
        activeSignificanceVisual = null;
    }

    // --- Funktioner til Trend Eksempel Tooltips ---
    function hideTrendExampleTooltip() {
        if (currentTrendExampleTooltip) {
            currentTrendExampleTooltip.remove();
            currentTrendExampleTooltip = null;
        }
    }

    function showTrendExampleTooltip(stepElement, text) {
        hideTrendExampleTooltip();
        if (!text || !stepElement || !dynamicTooltipContainer) return;
        const tooltipEl = document.createElement('div');
        tooltipEl.className = 'trend-example-tooltip';
        tooltipEl.textContent = text;
        dynamicTooltipContainer.appendChild(tooltipEl);
        const stepRect = stepElement.getBoundingClientRect();
        const containerRect = dynamicTooltipContainer.getBoundingClientRect();
        tooltipEl.style.position = 'absolute';
        tooltipEl.offsetHeight; // Force reflow
        let top = stepRect.top - containerRect.top - (tooltipEl.offsetHeight / 2) + (stepRect.height / 2) ;
        let left = stepRect.right - containerRect.left + 10;
         if (left + tooltipEl.offsetWidth > containerRect.width - 10) { left = stepRect.left - containerRect.left - tooltipEl.offsetWidth - 10; }
         if (top < 0) { top = 5; }
         if (top + tooltipEl.offsetHeight > containerRect.height) { top = containerRect.height - tooltipEl.offsetHeight - 5; }
        tooltipEl.style.top = `${top}px`;
        tooltipEl.style.left = `${left}px`;
        setTimeout(() => { if (dynamicTooltipContainer.contains(tooltipEl)) { tooltipEl.classList.add('visible'); } }, 50);
        currentTrendExampleTooltip = tooltipEl;
    }


    // --- Event Listeners ---

    function updateAllButtonTexts() {
        if (toggleCimtButton) { toggleCimtButton.textContent = body.classList.contains('cimt-band-visible') ? 'Skjul CIMT Understøttelse' : 'Vis CIMT Understøttelse'; }
        if (toggleTrendsButton) { toggleTrendsButton.textContent = body.classList.contains('trends-band-visible') ? 'Skjul Tendenser/Risici' : 'Vis Tendenser/Risici'; }
        if (toggleSignificanceButton) { toggleSignificanceButton.textContent = significanceInfoBox?.classList.contains('visible') ? 'Skjul Betydning for CIMT' : 'Vis Betydning for CIMT'; }
    }

    const handleResize = debounce(() => {
        removeAllLines(); // Fjerner kun unified line nu
        workflowLayer?.classList.remove('workflow-frame-active');
        clearTrendFocus();
        clearCimtFocus();
        hideTrendExampleTooltip();
        }, 250);


    if (toggleCimtButton) {
        toggleCimtButton.addEventListener('click', () => {
            const shouldShow = !body.classList.contains('cimt-band-visible');
            hideAllInfoAndFocus();
            removeAllStepHighlights();
            body.classList.remove('trends-band-visible');

            if (shouldShow) { body.classList.add('cimt-band-visible'); }
            else { body.classList.remove('cimt-band-visible'); hideAllTooltips(); } // hideAllTooltips rydder også CIMT fokus
            updateAllButtonTexts();
        });
    }

    if (toggleTrendsButton) {
        toggleTrendsButton.addEventListener('click', () => {
            const shouldShow = !body.classList.contains('trends-band-visible');
            hideAllInfoAndFocus();
            hideAllTooltips();
            removeAllStepHighlights();
            body.classList.remove('cimt-band-visible');

            if (shouldShow) { body.classList.add('trends-band-visible'); }
            else { body.classList.remove('trends-band-visible'); clearTrendFocus(); }
            updateAllButtonTexts();
        });
    }

     if (toggleSignificanceButton && significanceInfoBox) {
        toggleSignificanceButton.addEventListener('click', () => {
            const shouldShow = !significanceInfoBox.classList.contains('visible');
            hideAllInfoAndFocus();
            hideAllTooltips();
            removeAllStepHighlights();
            body.classList.remove('cimt-band-visible'); body.classList.remove('trends-band-visible');
            infoBoxes.forEach(box => box.classList.remove('visible'));

            if (shouldShow) { significanceInfoBox.classList.add('visible'); currentVisibleInfoBox = significanceInfoBox; }
            else { significanceInfoBox.classList.remove('visible'); hideAllSignificanceVisuals(); currentVisibleInfoBox = null; }
            updateAllButtonTexts();
        });
     }

    workflowSteps.forEach(step => {
        step.addEventListener('click', () => {
            const infoBoxId = step.dataset.infoTarget; const targetInfoBox = document.getElementById(infoBoxId);
            hideAllInfoAndFocus();
            hideAllTooltips();
            body.classList.remove('cimt-band-visible'); body.classList.remove('trends-band-visible');

            if (step === currentHighlightedStep) { removeAllStepHighlights(); }
            else { removeAllStepHighlights(); step.classList.add('highlighted'); currentHighlightedStep = step; if (targetInfoBox) { targetInfoBox.classList.add('visible'); currentVisibleInfoBox = targetInfoBox; } }
            updateAllButtonTexts();
        });
        step.addEventListener('keypress', (e) => { if (e.key === 'Enter' || e.key === ' ') { step.click(); }});

        // Hover listener for trend eksempler
        step.addEventListener('mouseover', () => {
            if (body.classList.contains('trend-focus-active') && step.classList.contains('relevant-for-trend') && currentTrendFocusIcon) {
                const examplesMapStr = currentTrendFocusIcon.dataset.examplesMap;
                const stepId = step.id;
                if (examplesMapStr && stepId) {
                    try {
                        const examplesMap = JSON.parse(examplesMapStr.replace(/'/g, '"'));
                        const exampleText = examplesMap[stepId] || examplesMap["Generelt"] || null;
                        if (exampleText) { showTrendExampleTooltip(step, exampleText); }
                    } catch (e) { console.error("Error parsing data-examples-map JSON:", e, examplesMapStr); }
                }
            }
        });
        step.addEventListener('mouseout', () => { setTimeout(hideTrendExampleTooltip, 100); });
    });

    // Opdateret CIMT ikon listener (uden linjer, med fade)
    allCimtIcons.forEach(icon => {
        icon.addEventListener('click', (event) => {
            event.stopPropagation();
            if (!body.classList.contains('cimt-band-visible')) return;
            const iconId = icon.id; const isClickingActiveCimt = iconId && iconId === currentCimtFocusIcon;
            hideAllInfoAndFocus(); removeAllStepHighlights();

            hideAllTooltips(); // Rydder også evt. eksisterende CIMT fokus FØRST

            if (!isClickingActiveCimt) {
                 const tooltipId = icon.dataset.tooltipTarget; const tooltip = document.getElementById(tooltipId);
                 if (tooltip) {
                     // Sæt nyt CIMT fokus
                     currentCimtFocusIcon = iconId; body.classList.add('cimt-focus-active');
                     icon.classList.add('cimt-focus-icon'); // Marker aktivt ikon
                     // Markér relevante steps
                     const relevantSteps = icon.dataset.cimtRelevant?.split(' ') || [];
                     fadeableWorkflowSteps.forEach(el => { if (relevantSteps.includes(el.id)) { el.classList.add('relevant-for-cimt'); } });
                     // Vis tooltip (uden linjer)
                     tooltip.classList.add('visible'); currentVisibleTooltip = tooltip;
                     // drawLinesForIcon(icon); // *** LINIEN ER FJERNET ***
                 }
            }
        });
        icon.addEventListener('keypress', (e) => { if (e.key === 'Enter' || e.key === ' ') { icon.click(); } });
    });

    // Opdateret Trend ikon listener (uden info boks)
    trendIcons.forEach(icon => {
         icon.addEventListener('click', (event) => {
            event.stopPropagation();
            if (!body.classList.contains('trends-band-visible')) return;
            const trendId = icon.id; const isClickingActiveTrend = trendId && currentTrendFocusIcon && trendId === currentTrendFocusIcon.id;
            hideAllInfoAndFocus(); hideAllTooltips(); removeAllStepHighlights();
            clearTrendFocus(); // Ryd altid FØRST

            if (!isClickingActiveTrend && trendId) {
                currentTrendFocusIcon = icon; body.classList.add('trend-focus-active');
                const relevantSteps = icon.dataset.relevantSteps?.split(' ') || [];
                const relevantCimt = icon.dataset.relevantCimt?.split(' ') || [];
                fadeableWorkflowSteps.forEach(el => { if (relevantSteps.includes(el.id)) { el.classList.add('relevant-for-trend'); } });
                fadeableCimtIcons.forEach(el => { if (relevantCimt.includes(el.id)) { el.classList.add('relevant-for-trend'); } });
                trendIndicators.forEach(indicator => {
                     const parentStep = indicator.closest('.workflow-step');
                     if (indicator.classList.contains(`trend-icon-${trendId.replace('trend-', '')}`) && parentStep?.classList.contains('relevant-for-trend')) {
                          indicator.classList.add('visible');
                     }
                 });
                 // Ingen visning af info-boks her længere
            }
            updateAllButtonTexts();
         });
         icon.addEventListener('keypress', (e) => { if (e.key === 'Enter' || e.key === ' ') { icon.click(); } });
    });

    // Listener for Betydning List Items
    if (significanceListItems) {
        significanceListItems.forEach(item => {
            item.addEventListener('click', (event) => {
                event.stopPropagation(); const visualType = item.dataset.visual;
                hideAllInfoAndFocus(); hideAllTooltips(); removeAllStepHighlights();
                // hideAllSignificanceVisuals(); // Kaldes af hideAllInfoAndFocus indirekte

                if (visualType === activeSignificanceVisual) { // Blev nulstillet
                     hideAllSignificanceVisuals(); // Ekstra kald for at fjerne markering
                } else {
                    hideAllSignificanceVisuals(); // Sørg for alt er rent
                    switch (visualType) {
                        case 'priority': showPriorityNumbers(); break;
                        case 'unified': showUnifiedEffortLine(); break;
                        case 'risk': showRiskMarkers(); break;
                        default: console.warn("Unknown visual type:", visualType);
                    }
                    item.classList.add('active-visual');
                }
                 if (significanceInfoBox) { // Vis boksen igen
                    significanceInfoBox.classList.add('visible');
                    currentVisibleInfoBox = significanceInfoBox;
                 }
                 updateAllButtonTexts();
            });
            item.addEventListener('keypress', (e) => { if (e.key === 'Enter' || e.key === ' ') { item.click(); } });
        });
    }

     // Global click listener
     document.addEventListener('click', (event) => {
          const clickedElement = event.target;
          const isInteractive = clickedElement.closest('#controls button, .cimt-icon, .workflow-step, #info-significance li[data-visual], .trend-example-tooltip');

          if (!isInteractive) {
               let closedSomething = false;
               if (currentVisibleInfoBox && !clickedElement.closest('.info-box-container')) {
                    hideAllInfoAndFocus();
                    removeAllStepHighlights();
                    closedSomething = true;
               }
               if (currentVisibleTooltip && !clickedElement.closest('#cimt-band')) {
                   hideAllTooltips();
                   closedSomething = true;
               }
               if (!closedSomething && body.classList.contains('trend-focus-active')) { clearTrendFocus(); }
               else if (!closedSomething && body.classList.contains('cimt-focus-active')) { clearCimtFocus(); }
          }
     });

     window.addEventListener('resize', handleResize);
     updateAllButtonTexts();

}); // End DOMContentLoaded
