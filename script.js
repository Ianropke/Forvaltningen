// Wait for the DOM to be fully loaded before running the script
document.addEventListener('DOMContentLoaded', () => {
    // console.log("===== DOM Content Loaded - Initializing Script ====="); // Fjernet log

    // --- Check if LeaderLine is loaded ---
    if (typeof LeaderLine === 'undefined') { console.error("FATAL ERROR: LeaderLine library not loaded!"); }
    // else { console.log("LeaderLine library loaded successfully."); } // Fjernet log

    // Get references
    const showCimtBtn = document.getElementById('show-cimt-btn');
    const showTrendsBtn = document.getElementById('show-trends-btn');
    const cimtBand = document.getElementById('cimt-band');
    const trendsBand = document.getElementById('trends-band');
    const workflowLayer = document.getElementById('workflow-layer');
    const workflowSteps = document.querySelectorAll('.workflow-step');
    const cimtIcons = document.querySelectorAll('.cimt-icon');
    const trendIcons = document.querySelectorAll('.trend-icon');
    const infoBoxes = document.querySelectorAll('.info-box');
    const trendTooltip = document.getElementById('trend-tooltip');

    // Variables
    let lines = [];
    let overviewLine = null;

    // Sanity Checks - behold fejl, fjern warnings?
    if (!showCimtBtn) console.error("FEJL: Knap #show-cimt-btn ikke fundet!");
    if (!showTrendsBtn) console.error("FEJL: Knap #show-trends-btn ikke fundet!");
    // if (!cimtBand) console.warn("Advarsel: Element #cimt-band ikke fundet!"); // Fjernet warning
    // if (!trendsBand) console.warn("Advarsel: Element #trends-band ikke fundet!"); // Fjernet warning
    if (!workflowLayer) console.error("FEJL: Element #workflow-layer ikke fundet!");
    // if (workflowSteps.length === 0) console.warn("Advarsel: Ingen .workflow-step elementer fundet!");// Fjernet warning

    // Fjernet logs om antal fundne elementer


    // --- Helper Functions ---

    function removeOverviewVisuals() {
        // console.log("--> removeOverviewVisuals() kaldt"); // Fjernet log
        if (overviewLine) { try { overviewLine.remove(); } catch (e) { console.warn("Fejl fjernelse overview line:", e); } overviewLine = null; }
        if (workflowLayer) { workflowLayer.classList.remove('overview-active'); }
        else { console.error("removeOverviewVisuals: workflowLayer ikke fundet!"); }
    }

    function hideAllInfoAndFocus() {
        // console.log("--> hideAllInfoAndFocus() kaldt"); // Fjernet log
        infoBoxes.forEach(box => box.style.display = 'none');
        if (cimtBand) cimtBand.style.display = 'none';
        if (trendsBand) trendsBand.style.display = 'none';
        document.body.classList.remove('cimt-focus-active', 'trend-focus-active');
        document.querySelectorAll('.workflow-step.active, .cimt-icon.active, .trend-icon.active').forEach(el => el.classList.remove('active', 'highlight'));
        document.querySelectorAll('.relevant-for-cimt, .irrelevant-for-cimt, .relevant-for-trend, .irrelevant-for-trend').forEach(el => el.classList.remove('relevant-for-cimt', 'irrelevant-for-cimt', 'relevant-for-trend', 'irrelevant-for-trend'));
        document.querySelectorAll('.trend-indicator').forEach(icon => { if (!document.body.classList.contains('trend-focus-active')) { icon.style.display = 'none'; } });
        // console.log(`Fjerner ${lines.length} specifikke linjer.`); // Fjernet log
        lines.forEach(line => { try { line.remove(); } catch (e) { console.warn("Fejl fjernelse linje:", e); } });
        lines = [];
        removeOverviewVisuals();
        hideTrendExampleTooltip();
        document.querySelectorAll('#controls button.active').forEach(btn => btn.classList.remove('active'));
        // console.log("<-- hideAllInfoAndFocus() færdig"); // Fjernet log
    }

    function showInfoBox(targetSelector) {
        // console.log(`--> showInfoBox() kaldt med target: ${targetSelector}`); // Fjernet log
        if (!targetSelector || typeof targetSelector !== 'string') { console.error("FEJL: showInfoBox kaldt med ugyldigt target:", targetSelector); return; }
        const targetBox = document.querySelector(targetSelector);
        if (targetBox) {
            infoBoxes.forEach(box => box.style.display = 'none');
            targetBox.style.display = 'block';
            // console.log(`SUCCESS: Sætter display:block for ${targetSelector}`); // Fjernet log
            // Fjernet timeout verificering for renere kode
        } else { console.error(`FEJL: Info-boks "${targetSelector}" ikke fundet!`); }
    }

    function setActiveButton(buttonElement) {
        // console.log(`--> setActiveButton() kaldt for: ${buttonElement ? buttonElement.id : 'null'}`); // Fjernet log
        document.querySelectorAll('#controls button').forEach(btn => btn.classList.remove('active'));
        if (buttonElement) { buttonElement.classList.add('active'); }
    }

    function drawLinesForIcon(iconElement) {
        // console.log(`--> drawLinesForIcon() kaldt for: ${iconElement.id}`); // Fjernet log
        lines.forEach(line => line.remove()); lines = [];
        const relevantStepsAttr = iconElement.getAttribute('data-cimt-relevant');
        if (relevantStepsAttr) {
            try {
                const relevantStepIds = JSON.parse(relevantStepsAttr.replace(/'/g, '"'));
                // console.log(`Relevante steps for ${iconElement.id}:`, relevantStepIds); // Fjernet log
                relevantStepIds.forEach(stepId => {
                    const stepElement = document.getElementById(stepId);
                    if (stepElement && window.getComputedStyle(stepElement).opacity !== '0') {
                        try {
                            const line = new LeaderLine(
                                iconElement, stepElement,
                                { color: 'rgba(0, 100, 200, 0.7)', size: 3, path: 'fluid', dash: { animation: true } }
                            );
                            lines.push(line);
                            // console.log(`Tegnede FLUID linje fra ${iconElement.id} til ${stepId}`); // Fjernet log
                        } catch(e) { console.error(`FEJL ved tegning af LeaderLine fra ${iconElement.id} til ${stepId}:`, e); }
                    } else { console.warn(`Skipped line til ${stepId}`); }
                });
            } catch (e) { console.error(`FEJL: Parse data-cimt-relevant for ${iconElement.id}: ${relevantStepsAttr}`, e); }
        } else { console.warn(`Attribut 'data-cimt-relevant' mangler på ${iconElement.id}`); }
        // console.log("<-- drawLinesForIcon() færdig"); // Fjernet log
    }

    // Trend Tooltip Functions
    let tooltipTimeout;
    function showTrendExampleTooltip(stepElement, trendIconElement) { /* ... (uændret) ... */ }
    function hideTrendExampleTooltip() { /* ... (uændret) ... */ }


    // --- Event Listeners ---
    // console.log("Tilføjer Event Listeners..."); // Fjernet log

    if (showCimtBtn) {
        showCimtBtn.addEventListener('click', () => {
            // console.log(">>> KLIK: Vis CIMT Understøttelse <<<"); // Fjernet log
            hideAllInfoAndFocus();
            if (cimtBand) cimtBand.style.display = 'flex'; else console.error("FEJL: cimtBand ej fundet!");
            document.body.classList.remove('trend-focus-active');
            document.querySelectorAll('.trend-indicator').forEach(ind => ind.style.display = 'none');
            setActiveButton(showCimtBtn);

            if (workflowLayer) { workflowLayer.classList.add('overview-active'); }
            else { console.error("FEJL: workflowLayer ikke fundet til overview!"); }

            if (typeof LeaderLine !== 'undefined' && cimtBand && workflowLayer) {
                try {
                     if (overviewLine) { try { overviewLine.remove(); } catch(e){} overviewLine = null; }
                    overviewLine = new LeaderLine(
                        LeaderLine.areaAnchor(cimtBand, {y: '0%', width: '100%', height: '10%', color: 'transparent' }),
                        LeaderLine.areaAnchor(workflowLayer, {y: '100%', width: '100%', height: '10%', color: 'transparent' }),
                        { color: 'rgb(0, 86, 179)', size: 5, path: 'fluid', startSocket: 'top', endSocket: 'bottom', endPlug: 'arrow1', endPlugSize: 1.8 }
                    );
                    // console.log("Overview line tegnet:", overviewLine); // Fjernet log
                } catch(e) { console.error("FEJL ved tegning af Overview LeaderLine:", e); }
            } else if (typeof LeaderLine === 'undefined'){ console.error("FEJL: LeaderLine er ikke loaded."); }
            else { console.error("FEJL: cimtBand/workflowLayer mangler for overview line."); }
            // console.log("CIMT Klik handler færdig."); // Fjernet log
        });
    } else { console.error("FEJL: Kunne ikke tilføje listener til showCimtBtn."); }


    if (showTrendsBtn) {
        showTrendsBtn.addEventListener('click', () => {
            // console.log(">>> KLIK: Vis Tendenser / Risici <<<"); // Fjernet log
            hideAllInfoAndFocus();
             if (trendsBand) { trendsBand.style.display = 'flex'; }
             else { console.error("FEJL: trendsBand element ikke fundet!"); }
            document.body.classList.remove('cimt-focus-active');
            setActiveButton(showTrendsBtn);
            // console.log("Tendens Klik handler færdig."); // Fjernet log
        });
    } else { console.error("FEJL: Kunne ikke tilføje listener til showTrendsBtn."); }


    workflowSteps.forEach(step => {
        step.addEventListener('click', () => {
            // console.log(`>>> WORKFLOW STEP KLIK registreret: ${step.id} <<<`); // Fjernet log
            hideAllInfoAndFocus();
            step.classList.add('active');
            const infoTarget = step.getAttribute('data-info-target');
            // console.log(`Søger efter info boks med target: "${infoTarget}"`); // Fjernet log
            if (infoTarget) { showInfoBox(infoTarget); }
            else { console.warn(`Workflow step ${step.id} mangler data-info-target`); }
            // console.log(`Workflow step ${step.id} klik handler færdig.`); // Fjernet log
        });
        // Hover listeners
         step.addEventListener('mouseover', () => { if (document.body.classList.contains('trend-focus-active')) { const a = document.querySelector('.trend-icon.active'); if (a && step.classList.contains('relevant-for-trend')) { if(trendTooltip) showTrendExampleTooltip(step, a); else console.error("FEJL: Trend tooltip mangler!"); } } });
         step.addEventListener('mouseout', hideTrendExampleTooltip);
         step.addEventListener('focusout', hideTrendExampleTooltip);
    });


    cimtIcons.forEach(icon => {
        icon.addEventListener('click', () => {
            // console.log(`>>> KLIK: CIMT Icon: ${icon.id} <<<`); // Fjernet log
             hideAllInfoAndFocus();
             if(cimtBand) cimtBand.style.display = 'flex';
             icon.classList.add('active');
             document.body.classList.add('cimt-focus-active');
              const relevantStepsAttr = icon.getAttribute('data-cimt-relevant');
              let relevantStepIds = [];
              if (relevantStepsAttr) { try { relevantStepIds = JSON.parse(relevantStepsAttr.replace(/'/g, '"')); } catch(e) { console.error("Parse fejl cimt relevant:", e); } }
              // console.log("Relevante steps for CIMT focus:", relevantStepIds); // Fjernet log
              workflowSteps.forEach(step => { step.classList.toggle('relevant-for-cimt', relevantStepIds.includes(step.id)); step.classList.toggle('irrelevant-for-cimt', !relevantStepIds.includes(step.id)); });
             const infoTarget = icon.getAttribute('data-info-target');
             if (infoTarget) { showInfoBox(infoTarget); }
             else { console.warn(`CIMT icon ${icon.id} mangler data-info-target`); }
             drawLinesForIcon(icon); // Kalder den med fluid path nu
             setActiveButton(showCimtBtn);
        });
    });


    trendIcons.forEach(icon => {
        icon.addEventListener('click', () => {
            // console.log(`>>> TREND ICON KLIK registreret: ${icon.id} <<<`); // Fjernet log
            hideAllInfoAndFocus();
            if (trendsBand) trendsBand.style.display = 'flex'; else console.error("FEJL: trendsBand ikke fundet ved trend klik!");
            icon.classList.add('active');
            document.body.classList.add('trend-focus-active');
            let relevantStepIds = []; let relevantCimtIds = [];
            const relevantStepsAttr = icon.getAttribute('data-relevant-steps'); const relevantCimtAttr = icon.getAttribute('data-relevant-cimt');
            try { if(relevantStepsAttr) relevantStepIds = JSON.parse(relevantStepsAttr.replace(/'/g, '"')); } catch(e){ console.error("Parse fejl trend steps:", e); }
            try { if(relevantCimtAttr) relevantCimtIds = JSON.parse(relevantCimtAttr.replace(/'/g, '"')); } catch(e){ console.error("Parse fejl trend cimt:", e); }
            // console.log("Relevante steps/CIMT for Trend:", relevantStepIds, relevantCimtIds); // Fjernet log
            document.querySelectorAll('.trend-indicator').forEach(ind => ind.style.display = 'none');
            workflowSteps.forEach(step => { const iR=relevantStepIds.includes(step.id); step.classList.toggle('relevant-for-trend',iR); step.classList.toggle('irrelevant-for-trend',!iR); if(iR){const ind=step.querySelector(`.trend-indicator#${icon.id}`)||step.querySelector(`.trend-indicator.${icon.id.replace('trend-','')}`); if(ind){ind.style.display='block';} else {console.warn(`Fandt ikke trend indicator for ${icon.id} på ${step.id}`);}}});
            cimtIcons.forEach(cimtIcon => { const iR=relevantCimtIds.includes(cimtIcon.id); cimtIcon.classList.toggle('relevant-for-trend', iR); cimtIcon.classList.toggle('irrelevant-for-trend', !iR);});
            const infoTarget = icon.getAttribute('data-info-target');
            if (infoTarget) { /* console.log(`Søger info boks for trend: "${infoTarget}"`); */ showInfoBox(infoTarget); } // Fjernet log
            else { console.warn(`Trend icon ${icon.id} mangler data-info-target`); }
            setActiveButton(showTrendsBtn);
            // console.log(`Trend icon ${icon.id} klik handler færdig.`); // Fjernet log
        });
    });

    // Global click listener
    document.addEventListener('click', (event) => {
        const container = document.getElementById('infographic-container');
        if (!container?.contains(event.target) || event.target === document.body || event.target === container) {
             // console.log("Global klik udenfor. Nulstiller delvist."); // Fjernet log
             infoBoxes.forEach(box => box.style.display = 'none');
             document.querySelectorAll('.active').forEach(el => el.classList.remove('active'));
             document.body.classList.remove('cimt-focus-active', 'trend-focus-active');
             lines.forEach(line => line.remove()); lines = [];
             removeOverviewVisuals();
             setActiveButton(null);
        }
    });

    // Resize listener
     let resizeTimeout;
     window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
             // console.log("Resize event - fjerner alle linjer."); // Fjernet log
             lines.forEach(line => line.remove()); lines = [];
             removeOverviewVisuals();
        }, 250);
    });

    // console.log("===== Script Initialisering Færdig ====="); // Fjernet log
}); // End of DOMContentLoaded
