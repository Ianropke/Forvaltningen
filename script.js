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
    const infoBoxContainer = document.querySelector('.info-box-container'); // Tilføjet for linje anker
    const infoBoxes = document.querySelectorAll('.info-box:not(#info-significance)');
    const significanceInfoBox = document.getElementById('info-significance');
    const allIcons = document.querySelectorAll('.cimt-icon');
    const allCimtIcons = document.querySelectorAll('#cimt-band .cimt-icon');
    const tooltips = document.querySelectorAll('.tooltip');
    const body = document.body;

    // Modal elementer
    const modalOverlay = document.getElementById('modal-overlay');
    const modalContent = document.getElementById('modal-content');
    const modalTitle = document.getElementById('modal-title');
    const modalDescription = document.getElementById('modal-description');
    const modalExamples = document.getElementById('modal-examples');
    const modalCloseBtn = document.getElementById('modal-close-btn');

    // Elementer og state for 'Betydning' visualisering
    const significanceListItems = significanceInfoBox?.querySelectorAll('li[data-visual]');
    const priorityNumberElements = document.querySelectorAll('.priority-number');
    let activeSignificanceVisual = null;
    let unifiedEffortLine = null;

    // State variable
    let activeLines = []; // For normale CIMT linjer
    let currentVisibleInfoBox = null;
    let currentHighlightedStep = null;
    let currentVisibleTooltip = null;

    // LeaderLine Options
    const defaultLineOptions = { color: 'rgba(120, 120, 120, 0.5)', size: 2, path: 'fluid', startSocket: 'bottom', endSocket: 'top' };
    // Opdaterede options for den samlede linje (tyndere, ikke stiplet, blød kurve)
    const unifiedLineOptions = {
        color: 'rgba(0, 95, 96, 0.7)',
        size: 4, // Tyndere
        path: 'arc', // Blød kurve
        startSocket: 'top', // Start fra toppen af start element
        endSocket: 'bottom', // Slut ved bunden af slut element
        // Fjernet start/slut plugs og dash animation
    };


    // --- Funktioner ---
    function hideModal() { if (modalOverlay?.classList.contains('visible')) { modalOverlay.classList.remove('visible'); } }

    function hideAllWorkflowAndSignificanceInfoBoxes() {
        let wasVisible = false;
        infoBoxes.forEach(box => { if (box.classList.contains('visible')) { box.classList.remove('visible'); wasVisible = true; } });
        if (significanceInfoBox?.classList.contains('visible')) { significanceInfoBox.classList.remove('visible'); wasVisible = true; hideAllSignificanceVisuals(); }
        if (wasVisible) currentVisibleInfoBox = null;
    }

    function removeAllLines() {
        activeLines.forEach(line => { try { line.remove(); } catch (e) {} });
        activeLines = [];
        hideUnifiedEffortLine(); // Sørg også for at fjerne den samlede linje
    }

    function hideAllTooltips() {
        let wasVisible = false;
        tooltips.forEach(tip => { if (tip.classList.contains('visible')) { tip.classList.remove('visible'); wasVisible = true; } });
        if (wasVisible) { removeAllLines(); currentVisibleTooltip = null; }
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
                if (stepElement && document.contains(stepElement) && document.contains(iconElement)) {
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

    // Opdateret funktion for samlet linje
    function showUnifiedEffortLine() {
        hideAllSignificanceVisuals(); // Skjul andre først
        hideAllTooltips(); // Skjul alm. tooltips/linjer

        // Definer start- og slut-elementer mere robust
        const startElement = infoBoxContainer; // Starter fra toppen af info-boks containeren
        const endElement = workflowLayer; // Slutter ved bunden af workflow laget

        if (startElement && endElement && document.contains(startElement) && document.contains(endElement)) {
            try {
                // Tegn linjen mellem de definerede elementer
                unifiedEffortLine = new LeaderLine(
                    startElement, // Start element
                    endElement,   // Slut element
                    {...unifiedLineOptions} // Brug de justerede options
                );
                 activeSignificanceVisual = 'unified';
            } catch (e) {
                console.error("Error drawing unified effort line:", e);
                hideUnifiedEffortLine(); // Ryd op hvis fejl
            }
        } else {
            console.error("Cannot draw unified line: start element (.info-box-container) or end element (#workflow-layer) not found/visible.");
        }
    }

    function hideRiskFocusHighlight() { allCimtIcons.forEach(icon => icon.classList.remove('risk-focus-highlight')); }
    function showRiskFocusHighlight() { hideAllSignificanceVisuals(); allCimtIcons.forEach(icon => icon.classList.add('risk-focus-highlight')); activeSignificanceVisual = 'risk'; }

    function hideAllSignificanceVisuals() {
        hidePriorityNumbers(); hideUnifiedEffortLine(); hideRiskFocusHighlight();
        significanceListItems?.forEach(li => li.classList.remove('active-visual'));
        activeSignificanceVisual = null;
    }

    function updateAllButtonTexts() {
        if (toggleCimtButton) { toggleCimtButton.textContent = body.classList.contains('cimt-band-visible') ? 'Skjul CIMT Understøttelse' : 'Vis CIMT Understøttelse'; }
        if (toggleTrendsButton) { toggleTrendsButton.textContent = body.classList.contains('trends-band-visible') ? 'Skjul Tendenser/Risici' : 'Vis Tendenser/Risici'; }
        if (toggleSignificanceButton) { toggleSignificanceButton.textContent = significanceInfoBox?.classList.contains('visible') ? 'Skjul Betydning for CIMT' : 'Vis Betydning for CIMT'; }
    }

    function debounce(func, wait) { let timeout; return function executedFunction(...args) { const later = () => { clearTimeout(timeout); func(...args); }; clearTimeout(timeout); timeout = setTimeout(later, wait); }; }
    const handleResize = debounce(() => { if (activeLines.length > 0 || unifiedEffortLine) { removeAllLines(); } }, 250);

    // --- Event Listeners ---
    if (toggleCimtButton) {
        toggleCimtButton.addEventListener('click', () => {
            const shouldShow = !body.classList.contains('cimt-band-visible');
            body.classList.remove('trends-band-visible'); hideModal(); hideAllWorkflowAndSignificanceInfoBoxes(); removeAllStepHighlights();
            if (shouldShow) { body.classList.add('cimt-band-visible'); }
            else { body.classList.remove('cimt-band-visible'); hideAllTooltips(); }
            updateAllButtonTexts();
        });
    }

    if (toggleTrendsButton) {
        toggleTrendsButton.addEventListener('click', () => {
            const shouldShow = !body.classList.contains('trends-band-visible');
            body.classList.remove('cimt-band-visible'); hideAllTooltips(); hideAllWorkflowAndSignificanceInfoBoxes(); removeAllStepHighlights();
            if (shouldShow) { body.classList.add('trends-band-visible'); }
            else { body.classList.remove('trends-band-visible'); hideModal(); }
            updateAllButtonTexts();
        });
    }

     if (toggleSignificanceButton && significanceInfoBox) {
        toggleSignificanceButton.addEventListener('click', () => {
            const shouldShow = !significanceInfoBox.classList.contains('visible');
            body.classList.remove('cimt-band-visible'); body.classList.remove('trends-band-visible'); hideAllTooltips(); hideModal(); removeAllStepHighlights(); infoBoxes.forEach(box => box.classList.remove('visible'));
            if (shouldShow) { hideAllWorkflowAndSignificanceInfoBoxes(); significanceInfoBox.classList.add('visible'); currentVisibleInfoBox = significanceInfoBox; }
            else { significanceInfoBox.classList.remove('visible'); hideAllSignificanceVisuals(); currentVisibleInfoBox = null; }
            updateAllButtonTexts();
        });
     }

    workflowSteps.forEach(step => {
        step.addEventListener('click', () => {
            const infoBoxId = step.dataset.infoTarget; const targetInfoBox = document.getElementById(infoBoxId);
            body.classList.remove('cimt-band-visible'); body.classList.remove('trends-band-visible'); hideAllTooltips(); hideModal(); hideAllWorkflowAndSignificanceInfoBoxes();
            if (step === currentHighlightedStep) { removeAllStepHighlights(); }
            else { removeAllStepHighlights(); step.classList.add('highlighted'); currentHighlightedStep = step; if (targetInfoBox && targetInfoBox !== significanceInfoBox) { targetInfoBox.classList.add('visible'); currentVisibleInfoBox = targetInfoBox; } }
            updateAllButtonTexts();
        });
        step.addEventListener('keypress', (e) => { if (e.key === 'Enter' || e.key === ' ') { step.click(); }});
    });

    allIcons.forEach(icon => {
        icon.addEventListener('click', (event) => {
            event.stopPropagation();
            const parentCimtBand = icon.closest('#cimt-band'); const parentTrendsBand = icon.closest('#trends-band');
            const isCimtActive = body.classList.contains('cimt-band-visible'); const isTrendsActive = body.classList.contains('trends-band-visible');
            hideAllWorkflowAndSignificanceInfoBoxes(); removeAllStepHighlights();

            if (isTrendsActive && parentTrendsBand) {
                hideAllTooltips();
                const title = icon.querySelector('.cimt-icon-title')?.textContent || 'Tendens/Risiko'; const description = icon.dataset.description || 'Ingen beskrivelse.'; const examplesRaw = icon.dataset.examples || '';
                const examplesHtml = examplesRaw.split('<br>').map(ex => ex.trim()).filter(ex => ex).map(ex => `<li>${ex}</li>`).join('');
                modalTitle.textContent = title; modalDescription.textContent = description; modalExamples.innerHTML = examplesHtml ? `<h3>Eksempler i Workflow:</h3><ul>${examplesHtml}</ul>` : '';
                if(modalContent) modalContent.scrollTop = 0; modalOverlay.classList.add('visible'); currentVisibleTooltip = null;
            } else if (isCimtActive && parentCimtBand) {
                hideModal();
                const tooltipId = icon.dataset.tooltipTarget; const tooltip = document.getElementById(tooltipId); const isClickingVisibleTooltip = tooltip && tooltip === currentVisibleTooltip;
                hideAllTooltips(); // Inkluderer removeAllLines()
                if (!isClickingVisibleTooltip && tooltip) { tooltip.classList.add('visible'); currentVisibleTooltip = tooltip; drawLinesForIcon(icon); }
            }
        });
        icon.addEventListener('keypress', (e) => { if (e.key === 'Enter' || e.key === ' ') { icon.click(); } });
    });

    if (significanceListItems) {
        significanceListItems.forEach(item => {
            item.addEventListener('click', (event) => {
                event.stopPropagation(); const visualType = item.dataset.visual;
                if (visualType === activeSignificanceVisual) { hideAllSignificanceVisuals(); }
                else { hideAllSignificanceVisuals(); switch (visualType) { case 'priority': showPriorityNumbers(); break; case 'unified': showUnifiedEffortLine(); break; case 'risk': showRiskFocusHighlight(); break; default: console.warn("Unknown visual type:", visualType); } item.classList.add('active-visual'); }
            });
            item.addEventListener('keypress', (e) => { if (e.key === 'Enter' || e.key === ' ') { item.click(); } });
        });
    }

     if (modalOverlay && modalCloseBtn) {
         modalCloseBtn.addEventListener('click', (e) => { e.stopPropagation(); hideModal(); });
         modalOverlay.addEventListener('click', (event) => { if (event.target === modalOverlay) { hideModal(); } });
     } else { console.error("FEJL: Kunne ikke finde #modal-overlay eller #modal-close-btn!"); }

     document.addEventListener('click', (event) => {
          const clickedElement = event.target;
          const isInteractive = clickedElement.closest('#controls button, .cimt-icon, .workflow-step, #info-significance li[data-visual], #modal-content');
          if (!isInteractive) {
               if (currentVisibleInfoBox && !clickedElement.closest('.info-box-container')) { hideAllWorkflowAndSignificanceInfoBoxes(); removeAllStepHighlights(); }
               else if (currentVisibleTooltip && !clickedElement.closest('#cimt-band')) { hideAllTooltips(); }
          }
     });

     window.addEventListener('resize', handleResize);
     updateAllButtonTexts();

}); // End DOMContentLoaded
