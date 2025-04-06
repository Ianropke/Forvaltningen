// Wait for the DOM to be fully loaded before running the script
document.addEventListener('DOMContentLoaded', () => {
    console.log("===== DOM Content Loaded - Initializing Script =====");

    // --- Check if LeaderLine is loaded ---
    if (typeof LeaderLine === 'undefined') {
        console.error("FATAL ERROR: LeaderLine library not loaded!");
        // Optionally alert the user or disable line-drawing features
    } else {
        console.log("LeaderLine library loaded successfully.");
    }

    // Get references to the main control buttons
    const showCimtBtn = document.getElementById('show-cimt-btn');
    const showTrendsBtn = document.getElementById('show-trends-btn');

    // Get references to the information bands and workflow layer
    const cimtBand = document.getElementById('cimt-band');
    const trendsBand = document.getElementById('trends-band');
    const workflowLayer = document.getElementById('workflow-layer'); // Reference to workflow layer

    // Get references to all workflow steps and icons
    const workflowSteps = document.querySelectorAll('.workflow-step');
    const cimtIcons = document.querySelectorAll('.cimt-icon');
    const trendIcons = document.querySelectorAll('.trend-icon');

    // Get references to all info boxes
    const infoBoxes = document.querySelectorAll('.info-box');

    // Get reference to the tooltip element
    const trendTooltip = document.getElementById('trend-tooltip');

    // Array/Variables to keep track of drawn LeaderLines
    let lines = [];
    let overviewLine = null; // Variable for the overview line

    // --- Sanity Checks ---
    if (!showCimtBtn) console.error("FEJL: Knap #show-cimt-btn ikke fundet!");
    if (!showTrendsBtn) console.error("FEJL: Knap #show-trends-btn ikke fundet!");
    if (!cimtBand) console.warn("Advarsel: Element #cimt-band ikke fundet!");
    if (!trendsBand) console.warn("Advarsel: Element #trends-band ikke fundet!");
    if (!workflowLayer) console.error("FEJL: Element #workflow-layer ikke fundet!"); // Vigtig check
    if (workflowSteps.length === 0) console.warn("Advarsel: Ingen .workflow-step elementer fundet!");

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
        }
        if (workflowLayer) { // Tjek at workflowLayer eksisterer
             if (workflowLayer.classList.contains('overview-active')) {
                 workflowLayer.classList.remove('overview-active');
                 console.log("Fjernede .overview-active klasse");
             }
        } else {
             console.error("removeOverviewVisuals: workflowLayer ikke fundet!");
        }
    }

    function hideAllInfoAndFocus() {
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
        removeOverviewVisuals(); // Kald den opdaterede funktion
        hideTrendExampleTooltip();
        document.querySelectorAll('#controls button.active').forEach(btn => btn.classList.remove('active'));
        console.log("<-- hideAllInfoAndFocus() færdig");
    }

    function showInfoBox(targetSelector) {
        // ... (uændret fra sidst) ...
        console.log(`--> showInfoBox() kaldt med target: ${targetSelector}`);
        const targetBox = document.querySelector(targetSelector);
        if (targetBox) {
            infoBoxes.forEach(box => box.style.display = 'none');
            targetBox.style.display = 'block';
            console.log(`Viste info-boks: ${targetSelector}`);
        } else {
            console.error(`FEJL: Info-boks med selector "${targetSelector}" ikke fundet!`);
        }
    }

    function setActiveButton(buttonElement) {
       // ... (uændret fra sidst, med null check) ...
        console.log(`--> setActiveButton() kaldt for: ${buttonElement ? buttonElement.id : 'null'}`);
        document.querySelectorAll('#controls button').forEach(btn => btn.classList.remove('active'));
        if (buttonElement) {
            buttonElement.classList.add('active');
        }
    }

    function drawLinesForIcon(iconElement) {
        // ... (uændret fra sidst) ...
        console.log(`--> drawLinesForIcon() kaldt for: ${iconElement.id}`);
        lines.forEach(line => line.remove()); lines = [];
        const relevantStepsAttr = iconElement.getAttribute('data-cimt-relevant');
        if (relevantStepsAttr) {
            try { /* ... tegne logik ... */ } catch (e) { /* ... fejl håndtering ... */ }
        } else { console.warn(`Attribut 'data-cimt-relevant' mangler på ${iconElement.id}`); }
        console.log("<-- drawLinesForIcon() færdig");
    }

    // Trend Tooltip Functions (uændret fra sidst)
    let tooltipTimeout;
    function showTrendExampleTooltip(stepElement, trendIconElement) { /* ... */ }
    function hideTrendExampleTooltip() { /* ... */ }


    // --- Event Listeners ---
    console.log("Tilføjer Event Listeners...");

    if (showCimtBtn) {
        showCimtBtn.addEventListener('click', () => {
            console.log(">>> KLIK: Vis CIMT Understøttelse <<<"); // *** START ***
            hideAllInfoAndFocus();
            console.log("Efter hideAllInfoAndFocus i CIMT Klik"); // DEBUG LOG

            if (cimtBand) {
                 cimtBand.style.display = 'flex';
                 console.log("CIMT Bånd vist."); // DEBUG LOG
            } else {
                 console.error("FEJL: cimtBand element ikke fundet ved klik!");
            }

            document.body.classList.remove('trend-focus-active');
            document.querySelectorAll('.trend-indicator').forEach(ind => ind.style.display = 'none');
            setActiveButton(showCimtBtn);
            console.log("Efter setActiveButton i CIMT Klik"); // DEBUG LOG


            // --- DEBUGGING Overview Visuals ---
            console.log("Checker elementer for overview FØR tilføjelse:", { workflowLayer, cimtBand }); // DEBUG LOG

            if (workflowLayer) {
                console.log("Forsøger at tilføje .overview-active klasse..."); // DEBUG LOG
                workflowLayer.classList.add('overview-active');

                // Verificer om klassen faktisk blev tilføjet
                setTimeout(() => { // Lille timeout for at lade browseren opdatere
                     if (workflowLayer.classList.contains('overview-active')) {
                        console.log("VERIFICERET: .overview-active klasse ER til stede på workflowLayer."); // DEBUG LOG
                    } else {
                        console.error("FEJL: .overview-active klasse blev IKKE tilføjet til workflowLayer."); // DEBUG LOG
                    }
                }, 0);

            } else {
                console.error("FEJL: Kan ikke tilføje .overview-active, da workflowLayer ikke blev fundet!");
            }

            // --- LeaderLine tegning MIDLERTIDIGT UDKOMMENTERET ---
             console.log("LeaderLine tegning er midlertidigt udkommenteret for test.");
            /*
            if (cimtBand && workflowLayer) {
                try {
                     console.log("Attempting to draw overview line...");
                     removeOverviewVisuals(); // Ensure any previous line is gone first

                     overviewLine = new LeaderLine(
                         cimtBand, // Use the whole element
                         workflowLayer, // Use the whole element
                         {
                             color: 'rgba(0, 86, 179, 0.8)', size: 4, path: 'fluid',
                             startSocket: 'auto', endSocket: 'auto',
                             endPlug: 'arrow1', endPlugSize: 1.5
                         }
                     );
                     console.log("Overview line drawn:", overviewLine);
                 } catch(e) {
                     console.error("FEJL ved tegning af Overview LeaderLine:", e);
                 }
            } else {
                 console.error("Cannot draw overview line: cimtBand or workflowLayer element not found!");
            }
            */
            // --- SLUT PÅ UDKOMMENTERING ---

            console.log("CIMT Klik handler færdig."); // *** SLUT ***
        });
    } else {
         console.error("FEJL: Kunne ikke tilføje listener til showCimtBtn (ikke fundet).");
    }


    // Listener for "Vis Tendenser / Risici" button (uændret)
    if (showTrendsBtn) { showTrendsBtn.addEventListener('click', () => { /* ... */ }); }

    // Add listeners to each Workflow Step (uændret, men husk at hideAllInfoAndFocus nu også kalder removeOverviewVisuals)
    workflowSteps.forEach(step => { step.addEventListener('click', () => { /* ... */ }); step.addEventListener('mouseover', () => { /* ... */ }); /* ... */ });

    // Add listeners to each CIMT Icon (uændret, men husk at hideAllInfoAndFocus nu også kalder removeOverviewVisuals)
    cimtIcons.forEach(icon => { icon.addEventListener('click', () => { /* ... */ }); });

    // Add listeners to each Trend Icon (uændret, men husk at hideAllInfoAndFocus nu også kalder removeOverviewVisuals)
    trendIcons.forEach(icon => { icon.addEventListener('click', () => { /* ... */ }); });

    // Global click listener (uændret, men husk at hideAllInfoAndFocus nu også kalder removeOverviewVisuals)
    document.addEventListener('click', (event) => { /* ... */ });

    // Resize listener (uændret, men husk at removeOverviewVisuals nu kaldes her)
     let resizeTimeout;
     window.addEventListener('resize', () => { /* ... */ });


    console.log("===== Script Initialisering Færdig =====");

}); // End of DOMContentLoaded
