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
            overviewLine = null; console.log("Fjernede overviewLine objekt");
        } else { console.log("Ingen overviewLine at fjerne."); }
        if (workflowLayer) {
             if (workflowLayer.classList.contains('overview-active')) {
                 workflowLayer.classList.remove('overview-active');
                 console.log("Fjernede .overview-active klasse");
             } else { console.log("Klassen .overview-active var ikke på workflowLayer."); }
        } else { console.error("removeOverviewVisuals: workflowLayer ikke fundet!"); }
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
        console.log(`--> showInfoBox() kaldt med target: ${targetSelector}`); // DEBUG
        if (!targetSelector || typeof targetSelector !== 'string') {
             console.error("FEJL: showInfoBox kaldt med ugyldigt target:", targetSelector);
             return;
        }
        const targetBox = document.querySelector(targetSelector);
        if (targetBox) {
            infoBoxes.forEach(box => box.style.display = 'none');
            targetBox.style.display = 'block';
            console.log(`SUCCESS: Viste info-boks: ${targetSelector}`); // DEBUG
        } else {
            console.error(`FEJL: Info-boks med selector "${targetSelector}" ikke fundet!`);
        }
    }

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
                    // removeOverviewVisuals(); // Behøves ikke her, gøres i hideAll...
                    console.log("Tegner NY overview line med areaAnchors...");
                    overviewLine = new LeaderLine(
                        LeaderLine.areaAnchor(cimtBand, {y: '0%', width: '100%', height: '10%', color: 'transparent' }),
                        LeaderLine.areaAnchor(workflowLayer, {y: '100%', width: '100%', height: '10%', color: 'transparent' }),
                        { // Justeret styling
                            color: 'rgb(0, 86, 179)', // Solid mørkeblå
                            size: 5,                 // Lidt mindre tyk end 6
                            path: 'fluid',           // Blød kurve
                            startSocket: 'top', endSocket: 'bottom',
                            endPlug: 'arrow1', endPlugSize: 1.8 // Lidt større hoved
                        }
                    );
                    console.log("Overview line tegnet:", overviewLine);
                } catch(e) { console.error("FEJL ved tegning af Overview LeaderLine:", e); }
            } else if (typeof LeaderLine === 'undefined'){ console.error("FEJL: LeaderLine er ikke loaded."); }
            else { console.error("FEJL: cimtBand eller workflowLayer mangler for overview line."); }
            console.log("CIMT Klik handler færdig.");
        });
    } else { console.error("FEJL: Kunne ikke tilføje listener til showCimtBtn."); }


    // Listener for "Vis Tendenser / Risici" button
    if (showTrendsBtn) {
        showTrendsBtn.addEventListener('click', () => {
            // TILFØJET LOG
            console.log(">>> KLIK: Vis Tendenser / Risici <<<");
            hideAllInfoAndFocus();
             if (trendsBand) {
                 trendsBand.style.display = 'flex'; // Use flex to allow wrapping
                 console.log("Trends Bånd vist."); // DEBUG
             } else {
                  console.error("FEJL: trendsBand element ikke fundet!");
             }
            document.body.classList.remove('cimt-focus-active');
            // lines.forEach(line => line.remove()); // Gøres i hideAll...
            // lines = [];
            setActiveButton(showTrendsBtn);
            console.log("Tendens Klik handler færdig."); // DEBUG
        });
    } else {
         console.error("FEJL: Kunne ikke tilføje listener til showTrendsBtn (ikke fundet).");
    }


    // Add listeners to each Workflow Step
    workflowSteps.forEach(step => {
        step.addEventListener('click', () => {
            console.log(`>>> WORKFLOW STEP KLIK registreret: ${step.id} <<<`);
            hideAllInfoAndFocus();
            console.log(`Efter hideAllInfoAndFocus i step ${step.id} klik`);
            step.classList.add('active');
            console.log(`Tilføjet .active til ${step.id}`);

            const infoTarget = step.getAttribute('data-info-target');
            // TILFØJET LOG: Vis hvad vi prøver at finde
            console.log(`Søger efter info boks med target: "${infoTarget}"`);
            if (infoTarget) {
                showInfoBox(infoTarget); // Prøv at vise info boks
            } else {
                console.warn(`Workflow step ${step.id} mangler data-info-target`);
            }
            console.log(`Workflow step ${step.id} klik handler færdig.`);
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
