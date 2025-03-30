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
    const infoBoxes = document.querySelectorAll('.info-box:not(#info-significance)'); // Standard info bokse (ekskl. significance)
    const significanceInfoBox = document.getElementById('info-significance');
    // const trendInfoBox = document.getElementById('info-trend'); // Fjernet
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
    // Opdaterede options for "almindelig" pil
    const unifiedLineOptions = {
        color: 'rgba(0, 95, 96, 0.7)',
        size: 4, // Tyndere pil
        path: 'arc', // Bue sti
        endPlug: 'arrow1', // Enkel standard pilespids
        endPlugSize: 1.5, // Standard pilespids størrelse
    };

    // --- Debounce Funktion (Hjælpefunktion til resize) ---
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
    // -------------------------------------------------------


    // --- Andre Funktioner ---
    function clearCimtFocus() {
        if (body.classList.contains('cimt-focus-active')) {
            body.classList.remove('cimt-focus-active');
            fadeableWorkflowSteps.forEach(el => el.classList.remove('relevant-for-cimt'));
            // fadeableCimtIcons.forEach(el => el.classList.remove('cimt-focus-icon')); // Hvis vi ville highlighte aktivt ikon
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
            updateAllButtonTexts(); // Opdater knapper når trend fokus fjernes
        }
    }

    function hideAllWorkflowAndSignificanceInfoBoxes() {
        let wasVisible = false;
        infoBoxes.forEach(box => { if (box.classList.contains('visible')) { box.classList.remove('visible'); wasVisible = true; } });
        if (significanceInfoBox?.classList.contains('visible')) { significanceInfoBox.classList.remove('visible'); wasVisible = true; hideAllSignificanceVisuals(); }
        clearTrendFocus(); // Ryd OGSÅ trend fokus
        if (wasVisible && currentVisibleInfoBox !== significanceInfoBox) {
            currentVisibleInfoBox = null;
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
             removeAllLines();
             clearCimtFocus(); // Ryd CIMT fade effekt når tooltip lukkes
             currentVisibleTooltip = null;
        }
    }

    function removeAllStepHighlights() {
        let wasVisible = false;
        workflowSteps.forEach(step => { if (step.classList.contains('highlighted')) { step.classList.remove('highlighted'); wasVisible = true; } });
        if (wasVisible) currentHighlightedStep = null;
    }

    function drawLinesForIcon(iconElement) {
        if (!iconElement || !document.contains(iconElement) || !body.classList.contains('cimt-band-visible')) return;
        const relevantStepsStr = iconElement.dataset.cimtRelevant || '';
        const relevantSteps = relevantStepsStr.split(' ');
        relevantSteps.forEach(stepId => {
            if (stepId) {
                const stepElement = document.getElementById(stepId);
                // Tjek om stepElement overhovedet skal være synligt ift. CIMT fokus
                if (stepElement && stepElement.classList.contains('relevant-for-cimt') && document.contains(stepElement) && document.contains(iconElement)) {
                    try { const line = new LeaderLine(stepElement, iconElement, {...defaultLineOptions}); if (line) activeLines.push(line); }
                    catch(e) { console.error(`Error drawing line from ${stepId} to ${iconElement.id}:`, e); }
                }
            }
        });
    }

    // Funktioner til 'Betydning' Visualiseringer
    function hidePriorityNumbers() { priorityNumberElements.forEach(el => el.classList.remove('visible')); }
    function showPriorityNumbers() { hideAllSignificanceVisuals(); priorityNumberElements.forEach(el => el.classList.add('visible')); activeSignificanceVisual = 'priority'; }
    function hideUnifiedEffortLine() { if (unifiedEffortLine) { try { unifiedEffortLine.remove(); } catch(e) {} unifiedEffortLine = null; } }

    function showUnifiedEffortLine() {
        hideAllSignificanceVisuals(); hideAllTooltips(); // Rydder også CIMT fokus
        clearTrendFocus(); // Ryd også Trend fokus
        const startElement = infoBoxContainer; const endElement = workflowLayer;
        if (startElement && endElement && document.contains(startElement) && document.contains(endElement)) {
            workflowLayer?.classList.add('workflow-frame-active');
            try { unifiedEffortLine = new LeaderLine( startElement, endElement, {...unifiedLineOptions}); activeSignificanceVisual = 'unified'; }
            catch (e) { console.error("Error drawing unified effort line:", e); workflowLayer?.classList.remove('workflow-frame-active'); hideUnifiedEffortLine(); }
        } else { console.error("Cannot draw unified line: start or end element not found/visible."); }
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

    // Funktioner til Trend Eksempel Tooltips
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
        const containerRect = dynamicTooltipContainer.getBoundingClientRect(); // Brug container for relativ pos
        tooltipEl.style.position = 'absolute';
        tooltipEl.offsetHeight; // Force reflow for width/height calc
        let top = stepRect.top - containerRect.top - (tooltipEl.offsetHeight / 2) + (stepRect.height / 2) ;
        let left = stepRect.right - containerRect.left + 10; // Start til højre
         if (left + tooltipEl.offsetWidth > containerRect.width - 10) { left = stepRect.left - containerRect.left - tooltipEl.offsetWidth - 10; } // Flyt til venstre hvis udenfor
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

    // Brug af debounce funktionen
    const handleResize = debounce(() => {
        removeAllLines();
        workflowLayer?.classList.remove('workflow-frame-active');
        clearTrendFocus();
        clearCimtFocus();
        hideTrendExampleTooltip();
        }, 250);


    if (toggleCimtButton) {
        toggleCimtButton.addEventListener('click', () => {
            const shouldShow = !body.classList.contains('cimt-band-visible');
            clearTrendFocus();
            hideAllWorkflowAndSignificanceInfoBoxes();
            removeAllStepHighlights();
            body.classList.remove('trends-band-visible');
            // clearCimtFocus(); // Ryddes af hideAllTooltips hvis båndet lukkes nu

            if (shouldShow) { body.classList.add('cimt-band-visible'); }
            else { body.classList.remove('cimt-band-visible'); hideAllTooltips(); } // hideAllTooltips kalder clearCimtFocus
            updateAllButtonTexts();
        });
    }

    if (toggleTrendsButton) {
        toggleTrendsButton.addEventListener('click', () => {
            const shouldShow = !body.classList.contains('trends-band-visible');
            hideAllWorkflowAndSignificanceInfoBoxes(); // Rydder også evt. significance visuals
            hideAllTooltips(); // Rydder også CIMT fokus
            removeAllStepHighlights();
            body.classList.remove('cimt-band-visible');

            if (shouldShow) { body.classList.add('trends-band-visible'); }
            else { body.classList.remove('trends-band-visible'); clearTrendFocus(); } // Ryd trend fokus når båndet skjules
            updateAllButtonTexts();
        });
    }

     if (toggleSignificanceButton && significanceInfoBox) {
        toggleSignificanceButton.addEventListener('click', () => {
            const shouldShow = !significanceInfoBox.classList.contains('visible');
            clearTrendFocus();
            clearCimtFocus();
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
            clearTrendFocus();
            clearCimtFocus();
            hideAllTooltips();
            hideAllWorkflowAndSignificanceInfoBoxes();
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
                        // Erstatter enkelt-anførselstegn med dobbelt for valid JSON, før parse
                        const examplesMap = JSON.parse(examplesMapStr.replace(/'/g, '"'));
                        const exampleText = examplesMap[stepId] || examplesMap["Generelt"] || null;
                        if (exampleText) { showTrendExampleTooltip(step, exampleText); }
                    } catch (e) { console.error("Error parsing data-examples-map JSON:", e, examplesMapStr); }
                }
            }
        });
        step.addEventListener('mouseout', () => { setTimeout(hideTrendExampleTooltip, 100); });
    });

    // Opdateret CIMT ikon listener til at håndtere fade
    allCimtIcons.forEach(icon => {
        icon.addEventListener('click', (event) => {
            event.stopPropagation();
            if (!body.classList.contains('cimt-band-visible')) return;
            const iconId = icon.id; const isClickingActiveCimt = iconId && iconId === currentCimtFocusIcon;
            hideAllWorkflowAndSignificanceInfoBoxes(); removeAllStepHighlights(); clearTrendFocus();
            // Ryd altid CIMT tooltips/fokus FØR evt. nyt sættes
            hideAllTooltips(); // Dette kalder nu også clearCimtFocus

            if (!isClickingActiveCimt) {
                 const tooltipId = icon.dataset.tooltipTarget; const tooltip = document.getElementById(tooltipId);
                 if (tooltip) {
                     // Sæt nyt CIMT fokus
                     currentCimtFocusIcon = iconId; body.classList.add('cimt-focus-active');
                     const relevantSteps = icon.dataset.cimtRelevant?.split(' ') || [];
                     fadeableWorkflowSteps.forEach(el => { if (relevantSteps.includes(el.id)) { el.classList.add('relevant-for-cimt'); } });
                     // Vis tooltip og linjer
                     tooltip.classList.add('visible'); currentVisibleTooltip = tooltip; drawLinesForIcon(icon);
                 }
            }
            // Hvis man klikkede på aktivt ikon, har hideAllTooltips() ryddet op.
        });
        icon.addEventListener('keypress', (e) => { if (e.key === 'Enter' || e.key === ' ') { icon.click(); } });
    });

    // Opdateret Trend ikon listener
    trendIcons.forEach(icon => {
         icon.addEventListener('click', (event) => {
            event.stopPropagation();
            if (!body.classList.contains('trends-band-visible')) return;
            const trendId = icon.id; const isClickingActiveTrend = trendId && currentTrendFocusIcon && trendId === currentTrendFocusIcon.id;
            hideAllWorkflowAndSignificanceInfoBoxes(); hideAllTooltips(); removeAllStepHighlights();
            clearTrendFocus(); // Ryd altid FØRST

            if (!isClickingActiveTrend && trendId) {
                currentTrendFocusIcon = icon; body.classList.add('trend-focus-active');
                const relevantSteps = icon.dataset.relevantSteps?.split(' ') || [];
                const relevantCimt = icon.dataset.relevantCimt?.split(' ') || [];
                fadeableWorkflowSteps.forEach(el => { if (relevantSteps.includes(el.id)) { el.classList.add('relevant-for-trend'); } });
                fadeableCimtIcons.forEach(el => { if (relevantCimt.includes(el.id)) { el.classList.add('relevant-for-trend'); } });
                trendIndicators.forEach(indicator => {
                     const parentStep = indicator.closest('.workflow-step');
                     // Tjek om indikatoren har en klasse der matcher trendId (fx 'trend-icon-tech' hvis trendId='trend-tech')
                     // OG om parent step er relevant
                     if (indicator.classList.contains(`trend-icon-${trendId.replace('trend-', '')}`) && parentStep?.classList.contains('relevant-for-trend')) {
                          indicator.classList.add('visible');
                     }
                 });
            }
            updateAllButtonTexts();
         });
         icon.addEventListener('keypress', (e) => { if (e.key === 'Enter' || e.key === ' ') { icon.click(); } });
    });

    // Listener for Betydning List Items (uændret)
    if (significanceListItems) {
        significanceListItems.forEach(item => {
            item.addEventListener('click', (event) => {
                event.stopPropagation(); const visualType = item.dataset.visual;
                if (visualType === activeSignificanceVisual) { hideAllSignificanceVisuals(); }
                else { hideAllSignificanceVisuals(); switch (visualType) { case 'priority': showPriorityNumbers(); break; case 'unified': showUnifiedEffortLine(); break; case 'risk': showRiskMarkers(); break; default: console.warn("Unknown visual type:", visualType); } item.classList.add('active-visual'); }
            });
            item.addEventListener('keypress', (e) => { if (e.key === 'Enter' || e.key === ' ') { item.click(); } });
        });
    }

     // Global click listener (opdateret)
     document.addEventListener('click', (event) => {
          const clickedElement = event.target;
          // Opdateret til at inkludere trend eksempel tooltip som "interaktivt" område
          const isInteractive = clickedElement.closest('#controls button, .cimt-icon, .workflow-step, #info-significance li[data-visual], .trend-example-tooltip');

          if (!isInteractive) {
               let closedSomething = false;
               // Hvis en standard infobox eller significance box er synlig og vi klikker udenfor
               if (currentVisibleInfoBox && !clickedElement.closest('.info-box-container')) {
                    hideAllWorkflowAndSignificanceInfoBoxes(); // Skjuler workflow/significance boks + rydder visuals + rydder trend fokus
                    removeAllStepHighlights();
                    closedSomething = true;
               }

               // Hvis en CIMT tooltip er synlig og vi klikker udenfor CIMT båndet
               if (currentVisibleTooltip && !clickedElement.closest('#cimt-band')) {
                   hideAllTooltips(); // Rydder også CIMT fokus
                   closedSomething = true;
               }
               // Hvis der ikke blev lukket noget specifikt, men et trend-fokus er aktivt
               if (!closedSomething && body.classList.contains('trend-focus-active')) {
                    clearTrendFocus();
               }
               // Hvis der ikke blev lukket noget specifikt, men et cimt-fokus er aktivt (og ingen tooltip var synlig)
               else if (!closedSomething && !currentVisibleTooltip && body.classList.contains('cimt-focus-active')) {
                   clearCimtFocus();
               }
          }
     });

     window.addEventListener('resize', handleResize);
     updateAllButtonTexts();

}); // End DOMContentLoaded
