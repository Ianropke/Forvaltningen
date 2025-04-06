// Wait for the DOM to be fully loaded before running the script
document.addEventListener('DOMContentLoaded', () => {
    console.log("===== DOM Content Loaded - Initializing Script =====");

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
    // ...

    console.log(`Fundet ${workflowSteps.length} workflow steps.`);
    console.log(`Fundet ${cimtIcons.length} CIMT icons.`);
    console.log(`Fundet ${trendIcons.length} Trend icons.`);
    console.log(`Fundet ${infoBoxes.length} info boxes.`);


    // --- Helper Functions ---

    function removeOverviewVisuals() {
        console.log("--> removeOverviewVisuals() kaldt");
        if (overviewLine) {
            try { overviewLine.remove(); } catch (e) { console.warn("Fejl fjernelse overview line:", e); }
            overviewLine = null;
            console.log("Fjernede overviewLine objekt");
        } else { console.log("Ingen overviewLine at fjerne."); }

        if (workflowLayer) {
             if (workflowLayer.classList.contains('overview-active')) {
                 workflowLayer.classList.remove('overview-active');
                 console.log("Fjernede .overview-active klasse");
             } else {
                 console.log("Klassen .overview-active var ikke på workflowLayer.");
             }
        } else { console.error("removeOverviewVisuals: workflowLayer ikke fundet!"); }
    }

    function hideAllInfoAndFocus() {
        console.log("--> hideAllInfoAndFocus() kaldt");
        // ... (Resten af funktionen som før - kalder removeOverviewVisuals) ...
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
            if (!document.body.classList.contains('trend-focus-active')) { icon.style.display = 'none'; }
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
                // Log med det samme (uden timeout)
                if (workflowLayer.classList.contains('overview-active')) {
                     console.log("SUCCESS: .overview-active klasse tilføjet.");
                } else {
                     console.error("FEJL: .overview-active klasse blev IKKE tilføjet.");
                }
            } else { console.error("FEJL: Kan ikke tilføje .overview-active, workflowLayer ikke fundet!"); }

            // --- LeaderLine tegning ---
            console.log("Forsøger at tegne overview line...");
            if (typeof LeaderLine !== 'undefined' && cimtBand && workflowLayer) {
                // Fjern KUN gammel overviewLine FØR ny tegnes (gøres nu i hideAllInfoAndFocus, så ikke nødvendigt her)
                // removeOverviewVisuals(); // Overflødig her, da hideAllInfoAndFocus allerede har kørt

                try {
                     console.log("Tegner NY overview line med areaAnchors...");
                     overviewLine = new LeaderLine(
                        LeaderLine.areaAnchor(cimtBand, {y: '0%', width: '100%', height: '10%', color: 'transparent' }),
                        LeaderLine.areaAnchor(workflowLayer, {y: '100%', width: '100%', height: '10%', color: 'transparent' }),
                        {
                            // Justeret styling for tydelighed:
                            color: 'rgb(0, 86, 179)', // Solid mørkeblå
                            size: 6,                 // Tykkere pil
                            path: 'fluid',           // Prøv 'fluid' for en blød kurve
                            startSocket: 'top',
                            endSocket: 'bottom',
                            endPlug: 'arrow1',
                            endPlugSize: 2           // Større pilehoved
                        }
                    );
                     console.log("Overview line tegnet:", overviewLine);
                 } catch(e) {
                     console.error("FEJL ved tegning af Overview LeaderLine:", e);
                 }
            } else if (typeof LeaderLine === 'undefined') {
                 console.error("FEJL: LeaderLine er ikke loaded.");
            } else {
                 console.error("FEJL: cimtBand eller workflowLayer mangler for overview line.");
            }
            // --- SLUT PÅ LeaderLine tegning ---

            console.log("CIMT Klik handler færdig.");
        });
    } else { console.error("FEJL: Kunne ikke tilføje listener til showCimtBtn."); }

    // Listener for "Vis Tendenser / Risici" button (uændret)
    if (showTrendsBtn) { showTrendsBtn.addEventListener('click', () => { /* ... */ }); }

    // Add listeners to each Workflow Step
    workflowSteps.forEach(step => {
        step.addEventListener('click', () => {
            // TILFØJET LOG: Tjek om klikket registreres
            console.log(`>>> WORKFLOW STEP KLIK registreret: ${step.id} <<<`);

            hideAllInfoAndFocus(); // Rydder alt, inkl overview
            console.log(`Efter hideAllInfoAndFocus i step ${step.id} klik`); // DEBUG

            step.classList.add('active'); // Highlight step
            console.log(`Tilføjet .active til ${step.id}`); // DEBUG

            const infoTarget = step.getAttribute('data-info-target');
            if (infoTarget) {
                showInfoBox(infoTarget); // Vis info boks
            } else { console.warn(`Workflow step ${step.id} mangler data-info-target`); }
            console.log(`Workflow step ${step.id} klik handler færdig.`); // DEBUG
        });

        // Hover listeners for trends (uændret)
         step.addEventListener('mouseover', () => { /* ... */ });
         step.addEventListener('mouseout', hideTrendExampleTooltip);
         step.addEventListener('focusout', hideTrendExampleTooltip);
    });

    // Add listeners to each CIMT Icon (uændret)
    cimtIcons.forEach(icon => { icon.addEventListener('click', () => { /* ... */ }); });

    // Add listeners to each Trend Icon (uændret)
    trendIcons.forEach(icon => { icon.addEventListener('click', () => { /* ... */ }); });

    // Global click listener (uændret)
    document.addEventListener('click', (event) => { /* ... */ });

    // Resize listener (uændret)
     let resizeTimeout;
     window.addEventListener('resize', () => { /* ... */ });

    console.log("===== Script Initialisering Færdig =====");

}); // End of DOMContentLoaded
