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
    // ... (som før) ...

    console.log(`Fundet ${workflowSteps.length} workflow steps.`);
    console.log(`Fundet ${cimtIcons.length} CIMT icons.`);
    console.log(`Fundet ${trendIcons.length} Trend icons.`);
    console.log(`Fundet ${infoBoxes.length} info boxes.`);


    // --- Helper Functions ---

    function removeOverviewVisuals() { /* ... (uændret) ... */ }
    function hideAllInfoAndFocus() { /* ... (uændret) ... */ }
    function showInfoBox(targetSelector) { /* ... (uændret) ... */ }
    function setActiveButton(buttonElement) { /* ... (uændret) ... */ }
    function drawLinesForIcon(iconElement) { /* ... (uændret) ... */ }
    // Trend Tooltip Functions (uændret)
    let tooltipTimeout;
    function showTrendExampleTooltip(stepElement, trendIconElement) { /* ... */ }
    function hideTrendExampleTooltip() { /* ... */ }


    // --- Event Listeners ---
    console.log("Tilføjer Event Listeners...");

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

            console.log("Forsøger at tegne overview line...");
            if (typeof LeaderLine !== 'undefined' && cimtBand && workflowLayer) {
                try {
                    console.log("Tegner NY overview line med JUSTERET start anker...");
                    overviewLine = new LeaderLine(
                        // Start: Top CENTER area of CIMT band (small width)
                        LeaderLine.areaAnchor(cimtBand, {x: '45%', y: '0%', width: '10%', height: '10%', color: 'transparent' }),
                        // End: Bottom area of workflow layer
                        LeaderLine.areaAnchor(workflowLayer, {y: '100%', width: '100%', height: '10%', color: 'transparent' }),
                        {
                            color: 'rgb(0, 86, 179)',
                            size: 5,
                            path: 'straight', // Ændret til 'straight' for en direkte pil
                            startSocket: 'top', // Stadig fra toppen af ankeret
                            endSocket: 'bottom',// Stadig til bunden af ankeret
                            endPlug: 'arrow1',
                            endPlugSize: 1.8
                        }
                    );
                    console.log("Overview line tegnet:", overviewLine);
                } catch(e) { console.error("FEJL ved tegning af Overview LeaderLine:", e); }
            } else if (typeof LeaderLine === 'undefined'){ console.error("FEJL: LeaderLine er ikke loaded."); }
            else { console.error("FEJL: cimtBand eller workflowLayer mangler for overview line."); }
            console.log("CIMT Klik handler færdig.");
        });
    } else { console.error("FEJL: Kunne ikke tilføje listener til showCimtBtn."); }

    // Øvrige listeners (uændrede)
    if (showTrendsBtn) { showTrendsBtn.addEventListener('click', () => { /* ... */ }); }
    else { console.error("FEJL: Kunne ikke tilføje listener til showTrendsBtn."); }
    workflowSteps.forEach(step => { step.addEventListener('click', () => { /* ... */ }); step.addEventListener('mouseover', () => { /* ... */ }); /* ... */ });
    cimtIcons.forEach(icon => { icon.addEventListener('click', () => { /* ... */ }); });
    trendIcons.forEach(icon => { icon.addEventListener('click', () => { /* ... */ }); });
    document.addEventListener('click', (event) => { /* ... */ });
    let resizeTimeout; window.addEventListener('resize', () => { /* ... */ });

    console.log("===== Script Initialisering Færdig =====");
}); // End of DOMContentLoaded
