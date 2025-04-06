// Wait for the DOM to be fully loaded before running the script
document.addEventListener('DOMContentLoaded', () => {
    console.log("===== DOM Content Loaded - Initializing Script =====");

    // --- Check if LeaderLine is loaded ---
    if (typeof LeaderLine === 'undefined') {
        console.error("FATAL ERROR: LeaderLine library not loaded!");
    } else {
        console.log("LeaderLine library loaded successfully.");
    }

    // Get references (uændret)
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

    // Variables (uændret)
    let lines = [];
    let overviewLine = null;

    // Sanity Checks (uændret)
    // ... console logs for element finding ...

    // --- Helper Functions ---

    function removeOverviewVisuals() {
        console.log("--> removeOverviewVisuals() kaldt");
        if (overviewLine) {
            try { overviewLine.remove(); } catch (e) { console.warn("Fejl fjernelse overview line:", e); }
            overviewLine = null;
             console.log("Fjernede overviewLine objekt");
        } else {
             console.log("Ingen overviewLine at fjerne.");
        }
        if (workflowLayer) {
             if (workflowLayer.classList.contains('overview-active')) {
                 workflowLayer.classList.remove('overview-active');
                 console.log("Fjernede .overview-active klasse");
             }
        } else { console.error("removeOverviewVisuals: workflowLayer ikke fundet!"); }
    }

    function hideAllInfoAndFocus() {
        // ... (uændret fra sidst - kalder removeOverviewVisuals) ...
        console.log("--> hideAllInfoAndFocus() kaldt");
        infoBoxes.forEach(box => box.style.display = 'none');
        if (cimtBand) cimtBand.style.display = 'none';
        if (trendsBand) trendsBand.style.display = 'none';
        document.body.classList.remove('cimt-focus-active', 'trend-focus-active');
        document.querySelectorAll('.workflow-step.active, .cimt-icon.active, .trend-icon.active').forEach(el => {
            el.classList.remove('active', 'highlight');
        });
        document.querySelectorAll('.relevant-for-cimt, .irrelevant-for-cimt, .relevant-for-trend, .irrelevant-for-trend').forEach(el => {
             el.classList.remove('relevant-for-cimt', 'irrelevant-for-cimt', 'relevant-for-trend', 'irrelevant-for-trend');
        });
         document.querySelectorAll('.trend-indicator').forEach(icon => {
            if (!document.body.classList.contains('trend-focus-active')) {
                 icon.style.display = 'none';
            }
         });
        console.log(`Fjerner ${lines.length} specifikke linjer.`);
        lines.forEach(line => { try { line.remove(); } catch (e) { console.warn("Fejl fjernelse linje:", e); } });
        lines = [];
        removeOverviewVisuals(); // Rydder nu også overview line/box
        hideTrendExampleTooltip();
        document.querySelectorAll('#controls button.active').forEach(btn => btn.classList.remove('active'));
        console.log("<-- hideAllInfoAndFocus() færdig");
    }

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
            console.log("Efter hideAllInfoAndFocus i CIMT Klik");

            if (cimtBand) {
                 cimtBand.style.display = 'flex';
                 console.log("CIMT Bånd vist.");
            } else { console.error("FEJL: cimtBand element ikke fundet ved klik!"); }

            document.body.classList.remove('trend-focus-active');
            document.querySelectorAll('.trend-indicator').forEach(ind => ind.style.display = 'none');
            setActiveButton(showCimtBtn);
            console.log("Efter setActiveButton i CIMT Klik");

            // --- Overview Visuals ---
            console.log("Checker elementer for overview:", { workflowLayer, cimtBand });

            if (workflowLayer) {
                console.log("Forsøger at tilføje .overview-active klasse...");
                workflowLayer.classList.add('overview-active');
                // Verificering (kan fjernes senere)
                setTimeout(() => {
                     if (workflowLayer.classList.contains('overview-active')) console.log("VERIFICERET: .overview-active klasse ER til stede.");
                     else console.error("FEJL: .overview-active klasse blev IKKE tilføjet.");
                }, 0);
            } else { console.error("FEJL: Kan ikke tilføje .overview-active, workflowLayer ikke fundet!"); }

            // --- LeaderLine tegning AKTIVERET ---
            console.log("Forsøger at tegne overview line...");
            // Tjek om LeaderLine er loaded, før vi bruger den
            if (typeof LeaderLine !== 'undefined' && cimtBand && workflowLayer) {
                try {
                     removeOverviewVisuals(); // Fjern evt. gammel linje FØR ny tegnes

                     console.log("Tegner NY overview line med areaAnchors...");
                     overviewLine = new LeaderLine(
                        // Start: Top area of CIMT band
                        LeaderLine.areaAnchor(cimtBand, {y: '0%', width: '100%', height: '10%', color: 'transparent' }), // Gør ankerområdet usynligt
                        // End: Bottom area of workflow layer
                        LeaderLine.areaAnchor(workflowLayer, {y: '100%', width: '100%', height: '10%', color: 'transparent' }), // Gør ankerområdet usynligt
                        {
                            // Styling af pilen
                            color: 'rgba(0, 86, 179, 0.8)', // Mørkeblå, solid
                            size: 4, // Lidt tykkere
                            path: 'arc', // Prøv 'arc' for en pæn bue
                            startSocket: 'top', // Start fra toppen af CIMT bånd anker
                            endSocket: 'bottom', // Slut i bunden af workflow anker
                            // Tilføj pilehoved
                            endPlug: 'arrow1', // Standard pilehoved
                            endPlugSize: 1.5 // Størrelse på pilehoved
                        }
                    );
                     console.log("Overview line tegnet:", overviewLine);
                 } catch(e) {
                     console.error("FEJL ved tegning af Overview LeaderLine:", e); // Log eventuelle fejl
                 }
            } else if (typeof LeaderLine === 'undefined') {
                 console.error("FEJL: LeaderLine er ikke loaded, kan ikke tegne pil.");
            } else {
                 console.error("FEJL: Kan ikke tegne overview line: cimtBand eller workflowLayer element mangler!");
            }
            // --- SLUT PÅ LeaderLine tegning ---

            console.log("CIMT Klik handler færdig.");
        });
    } else { console.error("FEJL: Kunne ikke tilføje listener til showCimtBtn."); }

    // Øvrige event listeners (uændrede, men bruger opdateret hideAllInfoAndFocus/removeOverviewVisuals)
    if (showTrendsBtn) { /* ... */ }
    workflowSteps.forEach(step => { /* ... */ });
    cimtIcons.forEach(icon => { /* ... */ });
    trendIcons.forEach(icon => { /* ... */ });
    document.addEventListener('click', (event) => { /* ... */ });
    let resizeTimeout;
    window.addEventListener('resize', () => { /* ... */ });

    console.log("===== Script Initialisering Færdig =====");

}); // End of DOMContentLoaded
