// Wait for the DOM to be fully loaded before running the script
document.addEventListener('DOMContentLoaded', () => {
    console.log("===== DOM Content Loaded - Initializing Script =====");

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
            setTimeout(() => { if (targetBox.offsetParent !== null) { const c = window.getComputedStyle(targetBox).display; if(c==='block'){console.log(`VERIFICERET: Computed display er 'block'.`);}else{console.error(`FEJL: Computed display er '${c}'`);}} else {console.error(`FEJL: ${targetSelector} er ikke synlig.`);}}, 0);
        } else { console.error(`FEJL: Info-boks "${targetSelector}" ikke fundet!`); }
    }

    function setActiveButton(buttonElement) { /* ... (uændret) ... */ }

    // *** JUSTERET FUNKTION ***
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
                    // Tjek stadig om step er synligt (ikke fadet ud)
                    if (stepElement && window.getComputedStyle(stepElement).opacity !== '0') {
                        try {
                            const line = new LeaderLine(
                                iconElement, // Start: CIMT Ikonet
                                stepElement, // Slut: Workflow Step
                                { // JUSTEREDE OPTIONS:
                                    color: 'rgba(0, 100, 200, 0.7)', // Lidt transparent blå
                                    size: 3,                         // Lidt tyndere end før
                                    path: 'grid',                    // *** ÆNDRET TIL GRID ***
                                    dash: { animation: true }        // Stiplede, animerede
                                    // startSocket: 'auto',          // Lad LeaderLine bestemme sockets
                                    // endSocket: 'auto'
                                }
                            );
                            lines.push(line);
                            console.log(`Tegnede GRID linje fra ${iconElement.id} til ${stepId}`);
                        } catch(e) { console.error(`FEJL ved tegning af LeaderLine fra ${iconElement.id} til ${stepId}:`, e); }
                    } else { console.warn(`Skipped line til ${stepId} (element ikke fundet eller ikke synligt)`); }
                });
            } catch (e) { console.error(`FEJL: Parse data-cimt-relevant for ${iconElement.id}: ${relevantStepsAttr}`, e); }
        } else { console.warn(`Attribut 'data-cimt-relevant' mangler på ${iconElement.id}`); }
        console.log("<-- drawLinesForIcon() færdig");
    }

    // Trend Tooltip Functions
    let tooltipTimeout;
    function showTrendExampleTooltip(stepElement, trendIconElement) { /* ... (uændret) ... */ }
    function hideTrendExampleTooltip() { /* ... (uændret) ... */ }


    // --- Event Listeners ---
    console.log("Tilføjer Event Listeners...");

    // CIMT Knap (uændret - bruger nu fluid path til overview)
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


    // Tendens Knap (uændret)
    if (showTrendsBtn) { showTrendsBtn.addEventListener('click', () => { /* ... */ }); }
    else { console.error("FEJL: Kunne ikke tilføje listener til showTrendsBtn."); }


    // Workflow Steps listener (uændret)
    workflowSteps.forEach(step => { step.addEventListener('click', () => { /* ... */ }); step.addEventListener('mouseover', () => { /* ... */ }); /* ... */ });

    // CIMT Ikoner listener (uændret - vil nu bruge den opdaterede drawLinesForIcon med path: 'grid')
    cimtIcons.forEach(icon => {
        icon.addEventListener('click', () => {
            console.log(`>>> KLIK: CIMT Icon: ${icon.id} <<<`);
             hideAllInfoAndFocus();
             if(cimtBand) cimtBand.style.display = 'flex';
             icon.classList.add('active');
             document.body.classList.add('cimt-focus-active');
             // Dim irrelevante steps
              const relevantStepsAttr = icon.getAttribute('data-cimt-relevant');
              let relevantStepIds = [];
              if (relevantStepsAttr) { try { relevantStepIds = JSON.parse(relevantStepsAttr.replace(/'/g, '"')); } catch(e) { console.error("Parse fejl:", e); } }
              console.log("Relevante steps for CIMT focus:", relevantStepIds);
              workflowSteps.forEach(step => { step.classList.toggle('relevant-for-cimt', relevantStepIds.includes(step.id)); step.classList.toggle('irrelevant-for-cimt', !relevantStepIds.includes(step.id)); });
             const infoTarget = icon.getAttribute('data-info-target');
             if (infoTarget) { showInfoBox(infoTarget); }
             else { console.warn(`CIMT icon ${icon.id} mangler data-info-target`); }
             // KALDER NU DEN OPDATEREDE FUNKTION MED GRID PATH:
             drawLinesForIcon(icon);
             setActiveButton(showCimtBtn);
        });
    });

    // Trend Ikoner listener (uændret)
    trendIcons.forEach(icon => { icon.addEventListener('click', () => { /* ... */ }); });

    // Global click listener (uændret)
    document.addEventListener('click', (event) => { /* ... */ });
    // Resize listener (uændret)
    let resizeTimeout; window.addEventListener('resize', () => { /* ... */ });

    console.log("===== Script Initialisering Færdig =====");
}); // End of DOMContentLoaded
