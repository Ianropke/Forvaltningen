// Wait for the DOM to be fully loaded before running the script
document.addEventListener('DOMContentLoaded', () => {
    console.log("===== DOM Content Loaded - Initializing Script =====");

    // --- Check if LeaderLine is loaded ---
    if (typeof LeaderLine === 'undefined') { console.error("FATAL ERROR: LeaderLine library not loaded!"); }
    else { console.log("LeaderLine library loaded successfully."); }

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

    // Sanity Checks
    if (!showCimtBtn) console.error("FEJL: Knap #show-cimt-btn ikke fundet!");
    if (!showTrendsBtn) console.error("FEJL: Knap #show-trends-btn ikke fundet!");
    if (!cimtBand) console.warn("Advarsel: Element #cimt-band ikke fundet!");
    if (!trendsBand) console.warn("Advarsel: Element #trends-band ikke fundet!");
    if (!workflowLayer) console.error("FEJL: Element #workflow-layer ikke fundet!");
    if (workflowSteps.length === 0) console.warn("Advarsel: Ingen .workflow-step elementer fundet!");

    console.log(`Fundet ${workflowSteps.length} workflow steps.`);
    console.log(`Fundet ${cimtIcons.length} CIMT icons.`);
    console.log(`Fundet ${trendIcons.length} Trend icons.`);
    console.log(`Fundet ${infoBoxes.length} info boxes.`);


    // --- Helper Functions ---

    function removeOverviewVisuals() {
        console.log("--> removeOverviewVisuals() kaldt");
        if (overviewLine) { try { overviewLine.remove(); } catch (e) { console.warn("Fejl fjernelse overview line:", e); } overviewLine = null; console.log("Fjernede overviewLine objekt"); }
        else { console.log("Ingen overviewLine at fjerne."); }
        if (workflowLayer) { if (workflowLayer.classList.contains('overview-active')) { workflowLayer.classList.remove('overview-active'); console.log("Fjernede .overview-active klasse"); } else { console.log("Klassen .overview-active var ikke på workflowLayer."); } }
        else { console.error("removeOverviewVisuals: workflowLayer ikke fundet!"); }
    }

    function hideAllInfoAndFocus() {
        console.log("--> hideAllInfoAndFocus() kaldt");
        infoBoxes.forEach(box => box.style.display = 'none');
        if (cimtBand) cimtBand.style.display = 'none';
        if (trendsBand) trendsBand.style.display = 'none';
        document.body.classList.remove('cimt-focus-active', 'trend-focus-active');
        document.querySelectorAll('.workflow-step.active, .cimt-icon.active, .trend-icon.active').forEach(el => el.classList.remove('active', 'highlight'));
        document.querySelectorAll('.relevant-for-cimt, .irrelevant-for-cimt, .relevant-for-trend, .irrelevant-for-trend').forEach(el => el.classList.remove('relevant-for-cimt', 'irrelevant-for-cimt', 'relevant-for-trend', 'irrelevant-for-trend'));
        document.querySelectorAll('.trend-indicator').forEach(icon => { if (!document.body.classList.contains('trend-focus-active')) { icon.style.display = 'none'; } });
        console.log(`Fjerner ${lines.length} specifikke linjer.`);
        lines.forEach(line => { try { line.remove(); } catch (e) { console.warn("Fejl fjernelse linje:", e); } });
        lines = [];
        removeOverviewVisuals();
        hideTrendExampleTooltip();
        document.querySelectorAll('#controls button.active').forEach(btn => btn.classList.remove('active'));
        console.log("<-- hideAllInfoAndFocus() færdig");
    }

    function showInfoBox(targetSelector) {
        console.log(`--> showInfoBox() kaldt med target: ${targetSelector}`);
        if (!targetSelector || typeof targetSelector !== 'string') { console.error("FEJL: showInfoBox kaldt med ugyldigt target:", targetSelector); return; }
        const targetBox = document.querySelector(targetSelector);
        if (targetBox) {
            infoBoxes.forEach(box => box.style.display = 'none');
            targetBox.style.display = 'block';
            console.log(`SUCCESS: Sætter display:block for ${targetSelector}`);
            setTimeout(() => { if (targetBox.offsetParent !== null) { const c = window.getComputedStyle(targetBox).display; if(c==='block'){console.log(`VERIFICERET: Computed display for ${targetSelector} er 'block'.`);}else{console.error(`FEJL: Computed display for ${targetSelector} er '${c}'`);}} else {console.error(`FEJL: ${targetSelector} er ikke synlig.`);}}, 0);
        } else { console.error(`FEJL: Info-boks "${targetSelector}" ikke fundet!`); }
    }

    function setActiveButton(buttonElement) {
        console.log(`--> setActiveButton() kaldt for: ${buttonElement ? buttonElement.id : 'null'}`);
        document.querySelectorAll('#controls button').forEach(btn => btn.classList.remove('active'));
        if (buttonElement) { buttonElement.classList.add('active'); }
    }

     // *** Bruger FLUID path igen ***
    function drawLinesForIcon(iconElement) {
        console.log(`--> drawLinesForIcon() kaldt for: ${iconElement.id}`);
        lines.forEach(line => line.remove()); lines = []; // Ryd gamle linjer
        const relevantStepsAttr = iconElement.getAttribute('data-cimt-relevant');
        if (relevantStepsAttr) {
            try {
                const relevantStepIds = JSON.parse(relevantStepsAttr.replace(/'/g, '"'));
                console.log(`Relevante steps for ${iconElement.id}:`, relevantStepIds);
                relevantStepIds.forEach(stepId => {
                    const stepElement = document.getElementById(stepId);
                    if (stepElement && window.getComputedStyle(stepElement).opacity !== '0') {
                        try {
                            const line = new LeaderLine(
                                iconElement, stepElement,
                                { color: 'rgba(0, 100, 200, 0.7)', size: 3, path: 'fluid', dash: { animation: true } }
                            );
                            lines.push(line);
                            console.log(`Tegnede FLUID linje fra ${iconElement.id} til ${stepId}`);
                        } catch(e) { console.error(`FEJL ved tegning af LeaderLine fra ${iconElement.id} til ${stepId}:`, e); }
                    } else { console.warn(`Skipped line til ${stepId} (element ikke fundet eller ikke synligt)`); }
                });
            } catch (e) { console.error(`FEJL: Parse data-cimt-relevant for ${iconElement.id}: ${relevantStepsAttr}`, e); }
        } else { console.warn(`Attribut 'data-cimt-relevant' mangler på ${iconElement.id}`); }
        console.log("<-- drawLinesForIcon() færdig");
    }

    // Trend Tooltip Functions (uændret)
    let tooltipTimeout;
    function showTrendExampleTooltip(stepElement, trendIconElement) { /* ... */ }
    function hideTrendExampleTooltip() { /* ... */ }


    // --- Event Listeners ---
    console.log("Tilføjer Event Listeners...");

    // CIMT Knap
    if (showCimtBtn) {
        showCimtBtn.addEventListener('click', () => {
            console.log(">>> KLIK: Vis CIMT Understøttelse <<<");
            hideAllInfoAndFocus();
            if (cimtBand) cimtBand.style.display = 'flex'; else console.error("FEJL: cimtBand ej fundet!");
            document.body.classList.remove('trend-focus-active');
            document.querySelectorAll('.trend-indicator').forEach(ind => ind.style.display = 'none');
            setActiveButton(showCimtBtn);

            console.log("Checker elementer for overview:", { workflowLayer, cimtBand });
            if (workflowLayer) {
                console.log("Forsøger at tilføje .overview-active klasse...");
                workflowLayer.classList.add('overview-active');
                if (workflowLayer.classList.contains('overview-active')) console.log("SUCCESS: .overview-active klasse tilføjet.");
                else console.error("FEJL: .overview-active klasse blev IKKE tilføjet.");
            } else { console.error("FEJL: Kan ikke tilføje .overview-active, workflowLayer ikke fundet!"); }

            console.log("Forsøger at tegne overview line (med fluid path)...");
            if (typeof LeaderLine !== 'undefined' && cimtBand && workflowLayer) {
                try {
                     if (overviewLine) { try { overviewLine.remove(); } catch(e){} overviewLine = null; } // Sikrer gammel er væk
                    console.log("Tegner NY overview line med OPRINDELIG areaAnchor og fluid path...");
                    overviewLine = new LeaderLine(
                        LeaderLine.areaAnchor(cimtBand, {y: '0%', width: '100%', height: '10%', color: 'transparent' }),
                        LeaderLine.areaAnchor(workflowLayer, {y: '100%', width: '100%', height: '10%', color: 'transparent' }),
                        { color: 'rgb(0, 86, 179)', size: 5, path: 'fluid', startSocket: 'top', endSocket: 'bottom', endPlug: 'arrow1', endPlugSize: 1.8 }
                    );
                    console.log("Overview line tegnet:", overviewLine);
                } catch(e) { console.error("FEJL ved tegning af Overview LeaderLine:", e); }
            } else if (typeof LeaderLine === 'undefined'){ console.error("FEJL: LeaderLine er ikke loaded."); }
            else { console.error("FEJL: cimtBand eller workflowLayer mangler for overview line."); }
            console.log("CIMT Klik handler færdig.");
        });
    } else { console.error("FEJL: Kunne ikke tilføje listener til showCimtBtn."); }


    // Tendens Knap
    if (showTrendsBtn) {
        showTrendsBtn.addEventListener('click', () => {
            console.log(">>> KLIK: Vis Tendenser / Risici <<<");
            hideAllInfoAndFocus();
             if (trendsBand) { trendsBand.style.display = 'flex'; console.log("Trends Bånd vist."); }
             else { console.error("FEJL: trendsBand element ikke fundet!"); }
            document.body.classList.remove('cimt-focus-active');
            setActiveButton(showTrendsBtn);
            console.log("Tendens Klik handler færdig.");
        });
    } else { console.error("FEJL: Kunne ikke tilføje listener til showTrendsBtn."); }


    // Workflow Steps listener
    workflowSteps.forEach(step => {
        step.addEventListener('click', () => {
            console.log(`>>> WORKFLOW STEP KLIK registreret: ${step.id} <<<`);
            hideAllInfoAndFocus();
            console.log(`Efter hideAllInfoAndFocus i step ${step.id} klik`);
            step.classList.add('active');
            console.log(`Tilføjet .active til ${step.id}`);
            const infoTarget = step.getAttribute('data-info-target');
            console.log(`Søger efter info boks med target: "${infoTarget}"`);
            if (infoTarget) { showInfoBox(infoTarget); }
            else { console.warn(`Workflow step ${step.id} mangler data-info-target`); }
            console.log(`Workflow step ${step.id} klik handler færdig.`);
        });
        // Hover listeners
         step.addEventListener('mouseover', () => { if (document.body.classList.contains('trend-focus-active')) { const a = document.querySelector('.trend-icon.active'); if (a && step.classList.contains('relevant-for-trend')) { if(trendTooltip) showTrendExampleTooltip(step, a); else console.error("FEJL: Trend tooltip mangler!"); } } });
         step.addEventListener('mouseout', hideTrendExampleTooltip);
         step.addEventListener('focusout', hideTrendExampleTooltip);
    });

    // CIMT Ikoner listener (Kalder drawLinesForIcon med fluid path)
    cimtIcons.forEach(icon => { icon.addEventListener('click', () => { /* ... som før ... */ }); });

    // Trend Ikoner listener (uændret)
    trendIcons.forEach(icon => { icon.addEventListener('click', () => { /* ... som før ... */ }); });

    // Global click listener (uændret)
    document.addEventListener('click', (event) => { /* ... */ });
    // Resize listener (uændret)
    let resizeTimeout; window.addEventListener('resize', () => { /* ... */ });

    console.log("===== Script Initialisering Færdig =====");
}); // End of DOMContentLoaded
