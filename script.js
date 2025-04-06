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

    function removeOverviewVisuals() { /* ... (uændret) ... */ }
    function hideAllInfoAndFocus() { /* ... (uændret) ... */ }
    function showInfoBox(targetSelector) { /* ... (uændret) ... */ }
    function setActiveButton(buttonElement) { /* ... (uændret) ... */ }

    // *** JUSTERET FUNKTION - Tilbage til fluid path ***
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
                                { // TILBAGE TIL FLUID PATH:
                                    color: 'rgba(0, 100, 200, 0.7)', // Lidt transparent blå
                                    size: 3,                         // Tyndere streg
                                    path: 'fluid',                   // *** TILBAGE TIL FLUID ***
                                    dash: { animation: true }        // Stiplede, animerede
                                }
                            );
                            lines.push(line);
                            console.log(`Tegnede FLUID linje fra ${iconElement.id} til ${stepId}`); // Opdateret log
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

    // CIMT Knap (uændret - bruger fluid path til overview)
    if (showCimtBtn) { showCimtBtn.addEventListener('click', () => { /* ... */ }); }
    else { console.error("FEJL: Kunne ikke tilføje listener til showCimtBtn."); }


    // Listener for "Vis Tendenser / Risici" button (VERIFICERET KODE)
    if (showTrendsBtn) {
        showTrendsBtn.addEventListener('click', () => {
            console.log(">>> KLIK: Vis Tendenser / Risici <<<");
            hideAllInfoAndFocus();
             if (trendsBand) {
                 trendsBand.style.display = 'flex';
                 console.log("Trends Bånd vist.");
             } else {
                  console.error("FEJL: trendsBand element ikke fundet!");
             }
            document.body.classList.remove('cimt-focus-active');
            setActiveButton(showTrendsBtn);
            console.log("Tendens Klik handler færdig.");
        });
    } else {
         console.error("FEJL: Kunne ikke tilføje listener til showTrendsBtn (ikke fundet).");
    }


    // Workflow Steps listener (uændret)
    workflowSteps.forEach(step => { step.addEventListener('click', () => { /* ... */ }); /* hover listeners... */ });

    // CIMT Ikoner listener (uændret - vil nu kalde drawLinesForIcon med fluid path)
    cimtIcons.forEach(icon => { icon.addEventListener('click', () => { /* ... */ }); });

    // Trend Ikoner listener (uændret - med log)
    trendIcons.forEach(icon => { icon.addEventListener('click', () => { /* ... */ }); });

    // Global click listener (uændret)
    document.addEventListener('click', (event) => { /* ... */ });
    // Resize listener (uændret)
    let resizeTimeout; window.addEventListener('resize', () => { /* ... */ });

    console.log("===== Script Initialisering Færdig =====");
}); // End of DOMContentLoaded
