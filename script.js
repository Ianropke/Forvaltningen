// Wait for the DOM to be fully loaded before running the script
document.addEventListener('DOMContentLoaded', () => {
    console.log("===== DOM Content Loaded - Initializing Script ====="); // TEST OUTPUT

    // Get references to the main control buttons
    const showCimtBtn = document.getElementById('show-cimt-btn');
    const showTrendsBtn = document.getElementById('show-trends-btn');
    // const showSignificanceBtn = document.getElementById('show-significance-btn'); // FJERN reference

    // Get references to the information bands
    const cimtBand = document.getElementById('cimt-band');
    const trendsBand = document.getElementById('trends-band');

    // Get references to all workflow steps and icons
    const workflowSteps = document.querySelectorAll('.workflow-step');
    const cimtIcons = document.querySelectorAll('.cimt-icon');
    const trendIcons = document.querySelectorAll('.trend-icon');

    // Get references to all info boxes
    const infoBoxes = document.querySelectorAll('.info-box'); // Vil ikke længere inkludere #info-significance
    // const infoSignificanceBox = document.getElementById('info-significance'); // FJERN reference

    // Get reference to the tooltip element
    const trendTooltip = document.getElementById('trend-tooltip');

    // Array to keep track of drawn LeaderLines
    let lines = [];
    // let significanceLines = []; // FJERN reference

    // --- Sanity Checks ---
    if (!showCimtBtn) console.error("FEJL: Knap #show-cimt-btn ikke fundet!");
    if (!showTrendsBtn) console.error("FEJL: Knap #show-trends-btn ikke fundet!");
    // if (!showSignificanceBtn) console.error("FEJL: Knap #show-significance-btn ikke fundet!"); // FJERN check
    if (!cimtBand) console.warn("Advarsel: Element #cimt-band ikke fundet!");
    if (!trendsBand) console.warn("Advarsel: Element #trends-band ikke fundet!");
    if (workflowSteps.length === 0) console.warn("Advarsel: Ingen .workflow-step elementer fundet!");


    console.log(`Fundet ${workflowSteps.length} workflow steps.`);
    console.log(`Fundet ${cimtIcons.length} CIMT icons.`);
    console.log(`Fundet ${trendIcons.length} Trend icons.`);
    console.log(`Fundet ${infoBoxes.length} info boxes (Significance er fjernet).`);


    // --- Helper Functions ---

    // Function to hide all dynamic info and remove focus states
    function hideAllInfoAndFocus() {
        console.log("--> hideAllInfoAndFocus() kaldt"); // TEST OUTPUT

        // Hide all regular info boxes
        infoBoxes.forEach(box => {
            // Simpel nu: bare skjul alle fundne info-bokse
            box.style.display = 'none';
        });

        // Hide info bands
        if (cimtBand) cimtBand.style.display = 'none';
        if (trendsBand) trendsBand.style.display = 'none';

        // Remove focus classes from body
        document.body.classList.remove('cimt-focus-active', 'trend-focus-active');

        // Remove active/highlight classes from steps and icons
        document.querySelectorAll('.workflow-step.active, .cimt-icon.active, .trend-icon.active').forEach(el => { // Fjernet .significance-item.active
            el.classList.remove('active', 'highlight');
        });
        // Remove relevance classes used for fading
        document.querySelectorAll('.relevant-for-cimt, .irrelevant-for-cimt, .relevant-for-trend, .irrelevant-for-trend').forEach(el => {
             el.classList.remove('relevant-for-cimt', 'irrelevant-for-cimt', 'relevant-for-trend', 'irrelevant-for-trend');
        });
         // Ensure hidden overlay icons (kun trend-indicators nu) are hidden again unless trend is active
         document.querySelectorAll('.trend-indicator').forEach(icon => {
            // Skjul kun hvis trend-fokus ikke er aktivt
            if (!document.body.classList.contains('trend-focus-active')) {
                 icon.style.display = 'none';
            }
         });


        // Remove existing LeaderLines
        console.log(`Fjerner ${lines.length} linjer.`); // TEST OUTPUT
        lines.forEach(line => {
            try {
                line.remove();
            } catch (e) {
                console.warn("Fejl ved fjernelse af linje:", e);
            }
        });
        lines = [];

        // Hide significance-specific visuals (FUNKTION ER FJERNET)
        // hideAllSignificanceVisuals(); // FJERN kald

        // Hide the trend tooltip
        hideTrendExampleTooltip();

        // Deactivate buttons visually
        document.querySelectorAll('#controls button.active').forEach(btn => btn.classList.remove('active'));

        console.log("<-- hideAllInfoAndFocus() færdig"); // TEST OUTPUT
    }

    // Function to show a specific info box
    function showInfoBox(targetSelector) {
        console.log(`--> showInfoBox() kaldt med target: ${targetSelector}`); // TEST OUTPUT
        const targetBox = document.querySelector(targetSelector);
        if (targetBox) {
            // First hide all others
            infoBoxes.forEach(box => {
                box.style.display = 'none';
            });
             // Then show the target
            targetBox.style.display = 'block';
            console.log(`Viste info-boks: ${targetSelector}`); // TEST OUTPUT
        } else {
            console.error(`FEJL: Info-boks med selector "${targetSelector}" ikke fundet!`);
        }
    }

    // Function to set the active button style (RETTET TIL AT HÅNDTERE NULL)
    function setActiveButton(buttonElement) {
        console.log(`--> setActiveButton() kaldt for: ${buttonElement ? buttonElement.id : 'null'}`); // TEST OUTPUT (modificeret)
        // Remove active class from all buttons first
        document.querySelectorAll('#controls button').forEach(btn => btn.classList.remove('active'));
        // Add active class to the clicked button ONLY if it exists
        if (buttonElement) { // TILFØJET CHECK
            buttonElement.classList.add('active');
        }
    }


    // Function to draw lines from a CIMT icon to relevant steps
    function drawLinesForIcon(iconElement) {
        console.log(`--> drawLinesForIcon() kaldt for: ${iconElement.id}`); // TEST OUTPUT
        // Remove previous lines first
        lines.forEach(line => line.remove());
        lines = [];

        const relevantStepsAttr = iconElement.getAttribute('data-cimt-relevant');
        if (relevantStepsAttr) {
            try {
                const relevantStepIds = JSON.parse(relevantStepsAttr.replace(/'/g, '"')); // Handle single quotes if used
                console.log(`Relevante steps for ${iconElement.id}:`, relevantStepIds); // TEST OUTPUT

                relevantStepIds.forEach(stepId => {
                    const stepElement = document.getElementById(stepId);
                    // Check if stepElement exists AND is reasonably visible (opacity check is simpler than display:none check)
                    if (stepElement && window.getComputedStyle(stepElement).opacity !== '0') {
                        try {
                            const line = new LeaderLine(
                                iconElement, // Start anchor
                                stepElement,  // End anchor
                                {
                                    color: 'rgba(0, 100, 200, 0.6)', // Example color
                                    size: 2,
                                    path: 'fluid', // Or 'grid', 'straight'
                                    dash: { animation: true }
                                }
                            );
                            lines.push(line);
                            console.log(`Tegnede linje fra ${iconElement.id} til ${stepId}`); // TEST OUTPUT
                        } catch(e) {
                             console.error(`FEJL ved tegning af LeaderLine fra ${iconElement.id} til ${stepId}:`, e);
                        }
                    } else {
                         console.warn(`Skipped line til ${stepId} (element ikke fundet eller ikke synligt)`);
                    }
                });
            } catch (e) {
                console.error(`FEJL: Kunne ikke parse data-cimt-relevant for ${iconElement.id}: ${relevantStepsAttr}`, e);
            }
        } else {
             console.warn(`Attribut 'data-cimt-relevant' mangler på ${iconElement.id}`);
        }
         console.log("<-- drawLinesForIcon() færdig"); // TEST OUTPUT
    }

     // --- Significance Visual Functions (ALLE ER FJERNET) ---
    // function hideAllSignificanceVisuals() { ... } // FJERN HELE FUNKTIONEN
    // function showPriorityNumbers() { ... } // FJERN HELE FUNKTIONEN
    // function showRiskMarkers() { ... } // FJERN HELE FUNKTIONEN
    // function showUnifiedEffortLine() { ... } // FJERN HELE FUNKTIONEN

    // --- Trend Tooltip Functions ---
    let tooltipTimeout;
    function showTrendExampleTooltip(stepElement, trendIconElement) {
        console.log(`Viser tooltip for step ${stepElement.id} relateret til trend ${trendIconElement.id}`); // TEST OUTPUT
        // --- DIN EKSISTERENDE TOOLTIP LOGIK SKAL VÆRE HER ---
        // Eksempel (skal tilpasses din faktiske implementering):
        if (!trendTooltip) {
            console.error("Trend tooltip element #trend-tooltip mangler!");
            return;
        }
        const examplesMapAttr = trendIconElement.getAttribute('data-examples-map');
        let exampleText = "Ingen specifik information for dette trin.";
        if (examplesMapAttr) {
            try {
                const examples = JSON.parse(examplesMapAttr.replace(/'/g, '"'));
                exampleText = examples[stepElement.id] || examples["Generelt"] || exampleText;
            } catch (e) {
                console.error("Fejl ved parsing af data-examples-map", e);
                exampleText = "Fejl i data.";
            }
        }
        trendTooltip.textContent = exampleText;

        // Positionering (simpel eksempel - skal måske forbedres)
        const stepRect = stepElement.getBoundingClientRect();
        const tooltipRect = trendTooltip.getBoundingClientRect(); // Get dimensions after setting text

        let top = stepRect.top + window.scrollY;
        let left = stepRect.right + window.scrollX + 10; // Lidt til højre

        // Kant-tjek (meget basalt)
        if (left + tooltipRect.width > window.innerWidth) {
            left = stepRect.left + window.scrollX - tooltipRect.width - 10; // Prøv til venstre
        }
        if (top + tooltipRect.height > window.innerHeight) {
             top = window.innerHeight - tooltipRect.height - 5; // Juster op
        }
         if (top < 0) {
             top = 5; // Juster ned
         }

        trendTooltip.style.left = `${left}px`;
        trendTooltip.style.top = `${top}px`;
        trendTooltip.style.display = 'block';
         clearTimeout(tooltipTimeout); // Stop eventuel skjul-timeout
    }

    function hideTrendExampleTooltip() {
        clearTimeout(tooltipTimeout);
        tooltipTimeout = setTimeout(() => {
             if (trendTooltip) trendTooltip.style.display = 'none';
             console.log("Skjuler trend tooltip (med timeout)"); // TEST OUTPUT
        }, 150);
    }


    // --- Event Listeners ---
    console.log("Tilføjer Event Listeners..."); // TEST OUTPUT

    // Listener for "Vis CIMT Understøttelse" button
    if (showCimtBtn) {
        showCimtBtn.addEventListener('click', () => {
            console.log(">>> KLIK: Vis CIMT Understøttelse <<<"); // TEST OUTPUT
            hideAllInfoAndFocus();
            if (cimtBand) cimtBand.style.display = 'flex';
             document.body.classList.remove('trend-focus-active');
             document.querySelectorAll('.trend-indicator').forEach(ind => ind.style.display = 'none');
            setActiveButton(showCimtBtn);
             // TODO: Implement the overview animation reuse here later
             console.log("CIMT Bånd vist."); // TEST OUTPUT
        });
    }

    // Listener for "Vis Tendenser / Risici" button
    if (showTrendsBtn) {
        showTrendsBtn.addEventListener('click', () => {
             console.log(">>> KLIK: Vis Tendenser / Risici <<<"); // TEST OUTPUT
            hideAllInfoAndFocus();
             if (trendsBand) trendsBand.style.display = 'flex';
            document.body.classList.remove('cimt-focus-active');
            lines.forEach(line => line.remove());
             lines = [];
            setActiveButton(showTrendsBtn);
            console.log("Trends Bånd vist."); // TEST OUTPUT
        });
    }

    // Listener for "Vis Betydning for CIMT" button (HELE BLOKKEN ER FJERNET)
    // if (showSignificanceBtn) { ... }

    // Add listeners to each Workflow Step
    workflowSteps.forEach(step => {
        step.addEventListener('click', () => {
            console.log(`>>> KLIK: Workflow Step: ${step.id} <<<`); // TEST OUTPUT
            hideAllInfoAndFocus();
            step.classList.add('active');
            const infoTarget = step.getAttribute('data-info-target');
            if (infoTarget) {
                showInfoBox(infoTarget);
            } else {
                console.warn(`Workflow step ${step.id} mangler data-info-target`);
            }
        });

        // Hover listeners for trends
         step.addEventListener('mouseover', () => {
            if (document.body.classList.contains('trend-focus-active')) {
                const activeTrendIcon = document.querySelector('.trend-icon.active');
                // Tjek også om dette step rent faktisk *er* relevant for den aktive trend
                if (activeTrendIcon && step.classList.contains('relevant-for-trend')) {
                     if (trendTooltip) {
                        showTrendExampleTooltip(step, activeTrendIcon);
                     } else {
                        console.error("FEJL: Trend tooltip element (#trend-tooltip) mangler!");
                     }
                }
            }
         });
         step.addEventListener('mouseout', hideTrendExampleTooltip);
         step.addEventListener('focusout', hideTrendExampleTooltip);

    });

    // Add listeners to each CIMT Icon
    cimtIcons.forEach(icon => {
        icon.addEventListener('click', () => {
            console.log(`>>> KLIK: CIMT Icon: ${icon.id} <<<`); // TEST OUTPUT
             // Vi antager, at CIMT klik altid skal fungere, selvom trend-fokus er aktivt.
             // hideAllInfoAndFocus() vil fjerne trend-fokus.
             hideAllInfoAndFocus();
             if(cimtBand) cimtBand.style.display = 'flex';

             icon.classList.add('active');
             document.body.classList.add('cimt-focus-active');

             // Dim irrelevant steps
              const relevantStepsAttr = icon.getAttribute('data-cimt-relevant');
              let relevantStepIds = [];
              if (relevantStepsAttr) {
                 try { relevantStepIds = JSON.parse(relevantStepsAttr.replace(/'/g, '"')); } catch(e) { console.error("Parse fejl:", e); }
              }
              console.log("Relevante steps for CIMT focus:", relevantStepIds); // TEST OUTPUT
              workflowSteps.forEach(step => {
                 if (relevantStepIds.includes(step.id)) {
                     step.classList.add('relevant-for-cimt');
                     step.classList.remove('irrelevant-for-cimt');
                 } else {
                     step.classList.add('irrelevant-for-cimt');
                     step.classList.remove('relevant-for-cimt');
                 }
              });

             const infoTarget = icon.getAttribute('data-info-target');
             if (infoTarget) {
                 showInfoBox(infoTarget);
             } else {
                  console.warn(`CIMT icon ${icon.id} mangler data-info-target`);
             }
             drawLinesForIcon(icon);
             setActiveButton(showCimtBtn);
        });
    });

    // Add listeners to each Trend Icon
    trendIcons.forEach(icon => {
        icon.addEventListener('click', () => {
            console.log(`>>> KLIK: Trend Icon: ${icon.id} <<<`); // TEST OUTPUT

             hideAllInfoAndFocus();
            if (trendsBand) trendsBand.style.display = 'flex';

            icon.classList.add('active');
            document.body.classList.add('trend-focus-active');

            // Dim irrelevant steps AND CIMT icons
            let relevantStepIds = [];
             let relevantCimtIds = [];
            const relevantStepsAttr = icon.getAttribute('data-relevant-steps');
            const relevantCimtAttr = icon.getAttribute('data-relevant-cimt');

             try { if(relevantStepsAttr) relevantStepIds = JSON.parse(relevantStepsAttr.replace(/'/g, '"')); } catch(e){ console.error("Parse fejl steps:", e); }
             try { if(relevantCimtAttr) relevantCimtIds = JSON.parse(relevantCimtAttr.replace(/'/g, '"')); } catch(e){ console.error("Parse fejl cimt:", e); }

             console.log("Relevante steps for Trend fokus:", relevantStepIds); // TEST OUTPUT
             console.log("Relevante CIMT icons for Trend fokus:", relevantCimtIds); // TEST OUTPUT

             // Først skjul alle trend indicators
             document.querySelectorAll('.trend-indicator').forEach(ind => ind.style.display = 'none');

             workflowSteps.forEach(step => {
                 if (relevantStepIds.includes(step.id)) {
                     step.classList.add('relevant-for-trend');
                     step.classList.remove('irrelevant-for-trend');
                     // Find og vis den specifikke indicator på dette step
                     const indicator = step.querySelector(`.trend-indicator#${icon.id}`); // Mere præcis selector hvis ID bruges
                     if (indicator) {
                        indicator.style.display = 'block';
                     } else {
                         // Fallback hvis ID ikke bruges, men klasse (mindre præcist)
                         const indicatorClass = step.querySelector(`.trend-indicator.${icon.id}`);
                         if(indicatorClass) indicatorClass.style.display = 'block';
                     }
                 } else {
                     step.classList.add('irrelevant-for-trend');
                    step.classList.remove('relevant-for-trend');
                 }
             });

             cimtIcons.forEach(cimtIcon => {
                 if (relevantCimtIds.includes(cimtIcon.id)) {
                     cimtIcon.classList.add('relevant-for-trend');
                     cimtIcon.classList.remove('irrelevant-for-trend');
                 } else {
                     cimtIcon.classList.add('irrelevant-for-trend');
                    cimtIcon.classList.remove('relevant-for-trend');
                 }
             });


            const infoTarget = icon.getAttribute('data-info-target');
            if (infoTarget) {
                showInfoBox(infoTarget);
            } else {
                console.warn(`Trend icon ${icon.id} mangler data-info-target`);
            }
            setActiveButton(showTrendsBtn);
        });
    });

     // Add listeners to significance list items (HELE BLOKKEN ER FJERNET)
    // const significanceItems = document.querySelectorAll('#info-significance li');
    // significanceItems.forEach(item => { ... });


    // Global click listener to potentially close info boxes or remove focus
    document.addEventListener('click', (event) => {
        const container = document.getElementById('infographic-container');
        // Tjek om klikket er UDENFOR containeren, eller direkte på body/container baggrunden
        if (!container?.contains(event.target) || event.target === document.body || event.target === container) {
             console.log("Global klik udenfor interaktive elementer (eller på baggrund). Nulstiller delvist."); // TEST OUTPUT
             // Nulstil kun visse ting - undgå at skjule aktive bånd?
             infoBoxes.forEach(box => {
                 box.style.display = 'none'; // Skjul alle info bokse
             });
             document.querySelectorAll('.active').forEach(el => el.classList.remove('active')); // Fjern highlights
             document.body.classList.remove('cimt-focus-active', 'trend-focus-active'); // Fjern fade-effekt klasser
             lines.forEach(line => line.remove()); // Fjern linjer
             lines = [];
             setActiveButton(null); // Deaktiver knapper visuelt
             // Skjul IKKE cimtBand eller trendsBand her - det ville være irriterende for brugeren.
        }
    });

    // Resize listener to remove lines
     let resizeTimeout;
     window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
             console.log("Resize event - fjerner linjer."); // TEST OUTPUT
             lines.forEach(line => line.remove());
             lines = [];
             // significanceLines.forEach(line => line.remove()); // FJERN reference
             // significanceLines = []; // FJERN reference
        }, 250);
    });


    console.log("===== Script Initialisering Færdig ====="); // TEST OUTPUT

}); // End of DOMContentLoaded
