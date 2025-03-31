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
    // const trendInfoBox = // Fjernet
    const allIcons = document.querySelectorAll('.cimt-icon'); // Alle ikoner (CIMT + Trends)
    const allCimtIcons = document.querySelectorAll('#cimt-band .cimt-icon'); // Kun CIMT ikoner
    const trendIcons = document.querySelectorAll('#trends-band .cimt-icon'); // Kun Trend ikoner
    const tooltips = document.querySelectorAll('#cimt-band .tooltip'); // Kun CIMT tooltips
    const body = document.body;
    const fadeableWorkflowSteps = document.querySelectorAll('#workflow-layer .workflow-step'); // Kun workflow steps til fade
    const fadeableCimtIcons = document.querySelectorAll('#cimt-band .cimt-icon'); // Kun CIMT ikoner til fade
    // const dynamicTooltipContainer = // Fjernet

    // Elementer og state for 'Betydning' visualisering
    const significanceListItems = significanceInfoBox?.querySelectorAll('li[data-visual]');
    const priorityNumberElements = document.querySelectorAll('.priority-number');
    const riskMarkers = document.querySelectorAll('.risk-marker');
    const trendIndicators = document.querySelectorAll('.trend-indicator');
    let activeSignificanceVisual = null;
    let unifiedEffortLine = null;

    // State variable
    let activeLines = []; // <<< Bruges igen til CIMT-linjer
    let currentVisibleInfoBox = null;
    let currentHighlightedStep = null;
    let currentVisibleTooltip = null;
    let currentTrendFocusIcon = null;
    let currentCimtFocusIcon = null; // Holder ID på aktivt CIMT ikon for fade
    let currentTrendExampleTooltip = null;
    let hideTooltipTimeoutId = null; // <<< Tilføjet for tooltip delay

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
            // updateAllButtonTexts(); // Kaldes typisk af den funktion der kalder denne
        }
    }

    // Skjul alle info bokse (Workflow + Significance) og ryd fokus
    function hideAllInfoAndFocus() {
        let wasBoxVisible = false;
        infoBoxes.forEach(box => { if (box.classList.contains('visible')) { box.classList.remove('visible'); wasBoxVisible = true; } });
        if (significanceInfoBox?.classList.contains('visible')) { significanceInfoBox.classList.remove('visible'); wasBoxVisible = true; hideAllSignificanceVisuals(); }
        clearTrendFocus();
        clearCimtFocus();
        if (wasBoxVisible && currentVisibleInfoBox !== significanceInfoBox) {
            currentVisibleInfoBox = null;
        }
         if (wasBoxVisible && currentVisibleInfoBox !== significanceInfoBox) {
            removeAllStepHighlights();
         }
    }


    // Opdateret til at håndtere activeLines igen
    function removeAllLines() {
        // Fjern individuelle CIMT linjer
        activeLines.forEach(line => { try { line.remove(); } catch (e) {} });
        activeLines = [];
        // Fjern samlet linje
        hideUnifiedEffortLine();
    }

    function hideAllTooltips() {
        let wasVisible = false;
        tooltips.forEach(tip => { if (tip.classList.contains('visible')) { tip.classList.remove('visible'); wasVisible = true; } });
        if (wasVisible) {
             removeAllLines(); // <<< Fjerner nu linjer igen
             clearCimtFocus();
             currentVisibleTooltip = null;
        } else {
             clearCimtFocus();
        }
    }

    function removeAllStepHighlights() {
        let wasVisible = false;
        workflowSteps.forEach(step => { if (step.classList.contains('highlighted')) { step.classList.remove('highlighted'); wasVisible = true; } });
        if (wasVisible) currentHighlightedStep = null;
    }

    // Funktion til at tegne CIMT linjer (gen-aktiveret)
    function drawLinesForIcon(iconElement) {
        if (!iconElement || !document.contains(iconElement) || !body.classList.contains('cimt-band-visible')) return;
        const relevantStepsStr = iconElement.dataset.cimtRelevant || '';
        const relevantSteps = relevantStepsStr.split(' ');
        // Sørg for at fjerne gamle linjer FØR nye tegnes for dette ikon
        activeLines.forEach(line => { try { line.remove(); } catch (e) {} });
        activeLines = [];

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

    // --- Funktioner til Trend Eksempel Tooltips (Opdateret) ---
    function hideTrendExampleTooltip() {
        if (currentTrendExampleTooltip) {
            currentTrendExampleTooltip.classList.remove('visible'); // Start fade ud
            setTimeout(() => {
                // Fjern kun hvis den ikke er blevet vist igen i mellemtiden OG musen ikke er over
                if (currentTrendExampleTooltip && !currentTrendExampleTooltip.matches(':hover')) {
                   if (document.body.contains(currentTrendExampleTooltip)) {
                        document.body.removeChild(currentTrendExampleTooltip);
                    }
                   currentTrendExampleTooltip = null;
                }
            }, 300); // Matcher ca CSS transition
        }
        if (hideTooltipTimeoutId) {
            clearTimeout(hideTooltipTimeoutId);
            hideTooltipTimeoutId = null;
        }
    }

    // Ny funktion til forsinket skjulning
    function delayedHideTrendExampleTooltip(delay = 300) {
         if (hideTooltipTimeoutId) { clearTimeout(hideTooltipTimeoutId); }
         hideTooltipTimeoutId = setTimeout(() => {
             if (currentTrendExampleTooltip && !currentTrendExampleTooltip.matches(':hover')) {
                 hideTrendExampleTooltip();
             }
         }, delay);
    }


    // Opdateret showTrendExampleTooltip med hover listeners på tooltip
    function showTrendExampleTooltip(stepElement, text) {
        // Ryd eksisterende timer og skjul straks evt. gammel tooltip visuelt
        if (hideTooltipTimeoutId) { clearTimeout(hideTooltipTimeoutId); hideTooltipTimeoutId = null;}
        // Undgå at genskabe hvis den allerede er vist for dette step
        if (currentTrendExampleTooltip && currentTrendExampleTooltip.dataset.step === stepElement.id) {
            return;
        }
        hideTrendExampleTooltip(); // Skjul evt. tidligere fra andet step


        if (!text || !stepElement) return;

        const tooltipEl = document.createElement('div');
        tooltipEl.className = 'trend-example-tooltip';
        tooltipEl.textContent = text;
        tooltipEl.dataset.step = stepElement.id; // Marker hvilket step den hører til
        document.body.appendChild(tooltipEl); // Tilføj til body

        const stepRect = stepElement.getBoundingClientRect();
        tooltipEl.style.position = 'fixed'; // Brug fixed
        tooltipEl.offsetHeight; // Force reflow

        let top = stepRect.top + (stepRect.height / 2) - (tooltipEl.offsetHeight / 2);
        let left = stepRect.right + 10; // Start til højre

        // Tjek viewport grænser
        if (left + tooltipEl.offsetWidth > window.innerWidth - 10) { left = stepRect.left - tooltipEl.offsetWidth - 10; } // Flyt til venstre
        if (top < 5) { top = 5; } // Undgå top
        if (top + tooltipEl.offsetHeight > window.innerHeight - 5) { top = window.innerHeight - tooltipEl.offsetHeight - 5; } // Undgå bund
        if (left < 5) { left = 5; } // Undgå venstre

        tooltipEl.style.top = `${top}px`;
        tooltipEl.style.left = `${left}px`;

        tooltipEl.classList.add('visible'); // Gør synlig
        currentTrendExampleTooltip = tooltipEl;

        // Tilføj listeners til selve tooltip'en for at holde den åben ved hover
        tooltipEl.addEventListener('mouseover', () => {
             if (hideTooltipTimeoutId) { clearTimeout(hideTooltipTimeoutId); hideTooltipTimeoutId = null;} // Annuller skjulning
        });
        tooltipEl.addEventListener('mouseout', () => {
             delayedHideTrendExampleTooltip(300); // Start kort timer når musen forlader tooltip
        });
    }


    // --- Event Listeners ---

    function updateAllButtonTexts() {
        if (toggleCimtButton) { toggleCimtButton.textContent = body.classList.contains('cimt-band-visible') ? 'Skjul CIMT Understøttelse' : 'Vis CIMT Understøttelse'; }
        if (toggleTrendsButton) { toggleTrendsButton.textContent = body.classList.contains('trends-band-visible') ? 'Skjul Tendenser/Risici' : 'Vis Tendenser/Risici'; }
        if (toggleSignificanceButton) { toggleSignificanceButton.textContent = significanceInfoBox?.classList.contains('visible') ? 'Skjul Betydning for CIMT' : 'Vis Betydning for CIMT'; }
    }

    const handleResize = debounce(() => {
        removeAllLines(); // <<< Fjerner nu CIMT linjer igen ved resize
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
            else { body.classList.remove('cimt-band-visible'); hideAllTooltips(); }
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

        // Opdateret Hover listener for trend eksempler
        step.addEventListener('mouseover', () => {
            if (hideTooltipTimeoutId) { clearTimeout(hideTooltipTimeoutId); hideTooltipTimeoutId = null;}
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
        // Opdateret mouseout til at bruge delay
        step.addEventListener('mouseout', () => {
            delayedHideTrendExampleTooltip(500); // Start længere timer
        });
    });

    // Opdateret CIMT ikon listener (MED linjer, med fade)
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
                     currentCimtFocusIcon = iconId; body.classList.add('cimt-focus-active');
                     icon.classList.add('cimt-focus-icon');
                     const relevantSteps = icon.dataset.cimtRelevant?.split(' ') || [];
                     fadeableWorkflowSteps.forEach(el => { if (relevantSteps.includes(el.id)) { el.classList.add('relevant-for-cimt'); } });
                     tooltip.classList.add('visible'); currentVisibleTooltip = tooltip;
                     drawLinesForIcon(icon); // <<< GEN-AKTIVERET
                 }
            }
        });
        icon.addEventListener('keypress', (e) => { if (e.key === 'Enter' || e.key === ' ') { icon.click(); } });
    });

    // Opdateret Trend ikon listener
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
                const wasActive = item.classList.contains('active-visual');
                hideAllInfoAndFocus(); hideAllTooltips(); removeAllStepHighlights();
                hideAllSignificanceVisuals();

                if (!wasActive) {
                     switch (visualType) {
                        case 'priority': showPriorityNumbers(); break;
                        case 'unified': showUnifiedEffortLine(); break;
                        case 'risk': showRiskMarkers(); break;
                        default: console.warn("Unknown visual type:", visualType);
                    }
                    item.classList.add('active-visual');
                }

                 if (significanceInfoBox) {
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
               if (currentVisibleInfoBox && !clickedElement.closest('.info-box-container')) { hideAllInfoAndFocus(); removeAllStepHighlights(); closedSomething = true; }
               if (currentVisibleTooltip && !clickedElement.closest('#cimt-band')) { hideAllTooltips(); closedSomething = true; }
               if (!closedSomething && body.classList.contains('trend-focus-active')) { clearTrendFocus(); }
               else if (!closedSomething && body.classList.contains('cimt-focus-active')) { clearCimtFocus(); }
          }
     });

     window.addEventListener('resize', handleResize);
     updateAllButtonTexts(); // Initial opdatering

}); // End DOMContentLoaded
