// Wait for the DOM to be fully loaded before running the script
document.addEventListener('DOMContentLoaded', () => {
    console.log("===== DOM Content Loaded - Initializing Script ====="); // TEST OUTPUT

    // Get references to the main control buttons
    const showCimtBtn = document.getElementById('show-cimt-btn');
    const showTrendsBtn = document.getElementById('show-trends-btn');
    const showSignificanceBtn = document.getElementById('show-significance-btn'); // Keep for now, remove later

    // Get references to the information bands
    const cimtBand = document.getElementById('cimt-band');
    const trendsBand = document.getElementById('trends-band');

    // Get references to all workflow steps and icons
    const workflowSteps = document.querySelectorAll('.workflow-step');
    const cimtIcons = document.querySelectorAll('.cimt-icon');
    const trendIcons = document.querySelectorAll('.trend-icon');

    // Get references to all info boxes
    const infoBoxes = document.querySelectorAll('.info-box');
    const infoSignificanceBox = document.getElementById('info-significance'); // Keep for now

    // Get reference to the tooltip element
    const trendTooltip = document.getElementById('trend-tooltip');

    // Array to keep track of drawn LeaderLines
    let lines = [];
    let significanceLines = []; // Specific lines for significance visuals

    // --- Sanity Checks ---
    if (!showCimtBtn) console.error("FEJL: Knap #show-cimt-btn ikke fundet!");
    if (!showTrendsBtn) console.error("FEJL: Knap #show-trends-btn ikke fundet!");
    if (!showSignificanceBtn) console.error("FEJL: Knap #show-significance-btn ikke fundet!");
    if (!cimtBand) console.warn("Advarsel: Element #cimt-band ikke fundet!"); // Warn instead of error if bands are optional
    if (!trendsBand) console.warn("Advarsel: Element #trends-band ikke fundet!");
    if (workflowSteps.length === 0) console.warn("Advarsel: Ingen .workflow-step elementer fundet!");
    // ... add more checks if needed

    console.log(`Fundet ${workflowSteps.length} workflow steps.`);
    console.log(`Fundet ${cimtIcons.length} CIMT icons.`);
    console.log(`Fundet ${trendIcons.length} Trend icons.`);
    console.log(`Fundet ${infoBoxes.length} info boxes.`);


    // --- Helper Functions ---

    // Function to hide all dynamic info and remove focus states
    function hideAllInfoAndFocus() {
        console.log("--> hideAllInfoAndFocus() kaldt"); // TEST OUTPUT

        // Hide all regular info boxes (except significance box initially)
        infoBoxes.forEach(box => {
            if (box.id !== 'info-significance') { // Don't hide significance box here
                box.style.display = 'none';
            }
        });

        // Hide info bands
        if (cimtBand) cimtBand.style.display = 'none';
        if (trendsBand) trendsBand.style.display = 'none';

        // Remove focus classes from body
        document.body.classList.remove('cimt-focus-active', 'trend-focus-active');

        // Remove active/highlight classes from steps and icons
        document.querySelectorAll('.workflow-step.active, .cimt-icon.active, .trend-icon.active, .significance-item.active').forEach(el => {
            el.classList.remove('active', 'highlight'); // Ensure 'highlight' is also removed if used
        });
        // Remove relevance classes used for fading
        document.querySelectorAll('.relevant-for-cimt, .irrelevant-for-cimt, .relevant-for-trend, .irrelevant-for-trend').forEach(el => {
             el.classList.remove('relevant-for-cimt', 'irrelevant-for-cimt', 'relevant-for-trend', 'irrelevant-for-trend');
        });
         // Ensure hidden overlay icons are hidden again
         document.querySelectorAll('.priority-number, .risk-marker, .trend-indicator').forEach(icon => {
            // Check if they should be hidden by default or based on state
             if (!icon.classList.contains('trend-indicator')) { // Keep trend indicators potentially visible if trend active? Need logic review.
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

        // Hide significance-specific visuals (we'll remove this function later)
        hideAllSignificanceVisuals();

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
            // First hide all others (except significance maybe)
            infoBoxes.forEach(box => {
                 if (box.id !== 'info-significance' || targetSelector === '#info-significance') {
                    box.style.display = 'none';
                 }
            });
             // Then show the target
            targetBox.style.display = 'block';
            console.log(`Viste info-boks: ${targetSelector}`); // TEST OUTPUT
        } else {
            console.error(`FEJL: Info-boks med selector "${targetSelector}" ikke fundet!`);
        }
    }

    // Function to set the active button style
    function setActiveButton(buttonElement) {
        console.log(`--> setActiveButton() kaldt for: ${buttonElement.id}`); // TEST OUTPUT
        // Remove active class from all buttons first
        document.querySelectorAll('#controls button').forEach(btn => btn.classList.remove('active'));
        // Add active class to the clicked button
        if (buttonElement) {
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

     // --- Significance Visual Functions (To be removed later) ---
    function hideAllSignificanceVisuals() {
        console.log("--> hideAllSignificanceVisuals() kaldt"); // TEST OUTPUT
         // Remove priority numbers if shown
         document.querySelectorAll('.workflow-step .priority-number').forEach(num => num.style.display = 'none');
         // Remove risk markers if shown
         document.querySelectorAll('.workflow-step .risk-marker').forEach(marker => marker.style.display = 'none');
         // Remove unified effort line and frame
         significanceLines.forEach(line => line.remove());
         significanceLines = [];
         document.getElementById('workflow-layer')?.classList.remove('workflow-frame-active');
         // Remove highlights from list items
         document.querySelectorAll('#info-significance li.active').forEach(li => li.classList.remove('active'));
    }

    function showPriorityNumbers() {
        console.log("Viser Priority Numbers"); // TEST OUTPUT
        hideAllSignificanceVisuals(); // Clear others first
        document.querySelectorAll('.workflow-step .priority-number').forEach(num => num.style.display = 'block');
    }

    function showRiskMarkers() {
         console.log("Viser Risk Markers"); // TEST OUTPUT
         hideAllSignificanceVisuals(); // Clear others first
        document.querySelectorAll('.workflow-step .risk-marker').forEach(marker => marker.style.display = 'block');
    }

     function showUnifiedEffortLine() {
         console.log("Viser Unified Effort Line"); // TEST OUTPUT
        hideAllSignificanceVisuals(); // Clear others first
        const steps = document.querySelectorAll('#workflow-layer .workflow-step');
        if (steps.length >= 2) {
            const firstStep = steps[0];
            const lastStep = steps[steps.length - 1];
             try {
                const line = new LeaderLine(firstStep, lastStep, { color: 'green', size: 3, dash: true });
                significanceLines.push(line);
                document.getElementById('workflow-layer')?.classList.add('workflow-frame-active'); // Add frame style
             } catch(e) {
                 console.error("FEJL ved tegning af Unified Effort Line:", e);
             }
        }
    }

    // --- Trend Tooltip Functions ---
    let tooltipTimeout;
    function showTrendExampleTooltip(stepElement, trendIconElement) {
        // ... (Keep existing tooltip logic, maybe add console logs inside if needed) ...
         console.log(`Viser tooltip for step ${stepElement.id} relateret til trend ${trendIconElement.id}`);
        // Existing logic...
        // Remember to get text from trendIconElement's data-examples-map based on stepElement.id
        // Position the trendTooltip near stepElement
        // trendTooltip.style.display = 'block';
    }

    function hideTrendExampleTooltip() {
        // Use setTimeout to avoid flickering if moving between step and tooltip
        clearTimeout(tooltipTimeout);
        tooltipTimeout = setTimeout(() => {
             if (trendTooltip) trendTooltip.style.display = 'none';
             console.log("Skjuler trend tooltip (med timeout)"); // TEST OUTPUT
        }, 150); // Adjust timeout as needed
    }


    // --- Event Listeners ---
    console.log("Tilføjer Event Listeners..."); // TEST OUTPUT

    // Listener for "Vis CIMT Understøttelse" button
    if (showCimtBtn) {
        showCimtBtn.addEventListener('click', () => {
            console.log(">>> KLIK: Vis CIMT Understøttelse <<<"); // TEST OUTPUT
            hideAllInfoAndFocus();
            if (cimtBand) cimtBand.style.display = 'flex'; // Use flex to allow scrolling if needed
             // Reset potential trend focus styles explicitly if needed
             document.body.classList.remove('trend-focus-active');
             document.querySelectorAll('.trend-indicator').forEach(ind => ind.style.display = 'none'); // Hide trend indicators
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
             if (trendsBand) trendsBand.style.display = 'flex'; // Use flex to allow wrapping
             // Reset potential CIMT focus styles explicitly if needed
            document.body.classList.remove('cimt-focus-active');
            lines.forEach(line => line.remove()); // Remove CIMT lines
             lines = [];
            setActiveButton(showTrendsBtn);
            console.log("Trends Bånd vist."); // TEST OUTPUT
        });
    }

    // Listener for "Vis Betydning for CIMT" button (Temporary)
     if (showSignificanceBtn) {
        showSignificanceBtn.addEventListener('click', () => {
            console.log(">>> KLIK: Vis Betydning for CIMT <<<"); // TEST OUTPUT
            hideAllInfoAndFocus(); // Should clear previous states
             // Show the significance info box specifically
             if (infoSignificanceBox) {
                infoSignificanceBox.style.display = 'block';
                console.log("Significance Info Boks vist."); // TEST OUTPUT
             } else {
                 console.error("FEJL: Significance info-boks (#info-significance) ikke fundet!");
             }
            setActiveButton(showSignificanceBtn);
            // Note: Visuals are triggered by clicking list items inside the box
        });
    }

    // Add listeners to each Workflow Step
    workflowSteps.forEach(step => {
        step.addEventListener('click', () => {
            console.log(`>>> KLIK: Workflow Step: ${step.id} <<<`); // TEST OUTPUT
            hideAllInfoAndFocus();
            step.classList.add('active'); // Highlight the clicked step
            const infoTarget = step.getAttribute('data-info-target');
            if (infoTarget) {
                showInfoBox(infoTarget);
            } else {
                console.warn(`Workflow step ${step.id} mangler data-info-target`);
            }
        });

        // Add hover listeners ONLY if needed for trends later
         step.addEventListener('mouseover', () => {
            if (document.body.classList.contains('trend-focus-active')) {
                const activeTrendIcon = document.querySelector('.trend-icon.active');
                if (activeTrendIcon && step.classList.contains('relevant-for-trend')) {
                     // Ensure tooltip exists before trying to show
                     if (trendTooltip) {
                        showTrendExampleTooltip(step, activeTrendIcon);
                     } else {
                        console.error("FEJL: Trend tooltip element (#trend-tooltip) mangler!");
                     }
                }
            }
         });
         step.addEventListener('mouseout', hideTrendExampleTooltip);
         step.addEventListener('focusout', hideTrendExampleTooltip); // For accessibility if focus moves away

    });

    // Add listeners to each CIMT Icon
    cimtIcons.forEach(icon => {
        icon.addEventListener('click', () => {
            console.log(`>>> KLIK: CIMT Icon: ${icon.id} <<<`); // TEST OUTPUT
             if (!document.body.classList.contains('trend-focus-active')) { // Don't activate if trend focus is active? Or should CIMT override? Decide. Let's assume CIMT overrides for now.

                hideAllInfoAndFocus(); // Clear previous state first
                if(cimtBand) cimtBand.style.display = 'flex'; // Make sure band is visible

                icon.classList.add('active'); // Highlight clicked icon
                document.body.classList.add('cimt-focus-active'); // Enable fade effect via body class

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
                drawLinesForIcon(icon); // Draw lines AFTER potential state changes
                setActiveButton(showCimtBtn); // Ensure parent button is active
             } else {
                 console.log("Ignorerer CIMT klik pga. aktivt Trend fokus."); // Optional: Change this logic if needed
             }

        });
    });

    // Add listeners to each Trend Icon
    trendIcons.forEach(icon => {
        icon.addEventListener('click', () => {
            console.log(`>>> KLIK: Trend Icon: ${icon.id} <<<`); // TEST OUTPUT

             hideAllInfoAndFocus(); // Clear previous state first
            if (trendsBand) trendsBand.style.display = 'flex'; // Ensure band is visible

            icon.classList.add('active'); // Highlight clicked icon
            document.body.classList.add('trend-focus-active'); // Enable fade effect

            // Dim irrelevant steps AND CIMT icons
            let relevantStepIds = [];
             let relevantCimtIds = [];
            const relevantStepsAttr = icon.getAttribute('data-relevant-steps');
            const relevantCimtAttr = icon.getAttribute('data-relevant-cimt');

             try { if(relevantStepsAttr) relevantStepIds = JSON.parse(relevantStepsAttr.replace(/'/g, '"')); } catch(e){ console.error("Parse fejl steps:", e); }
             try { if(relevantCimtAttr) relevantCimtIds = JSON.parse(relevantCimtAttr.replace(/'/g, '"')); } catch(e){ console.error("Parse fejl cimt:", e); }

             console.log("Relevante steps for Trend fokus:", relevantStepIds); // TEST OUTPUT
             console.log("Relevante CIMT icons for Trend fokus:", relevantCimtIds); // TEST OUTPUT

             workflowSteps.forEach(step => {
                 if (relevantStepIds.includes(step.id)) {
                     step.classList.add('relevant-for-trend');
                     step.classList.remove('irrelevant-for-trend');
                     // Show relevant trend indicator on the step
                     const indicator = step.querySelector(`.trend-indicator.${icon.id}`); // Assumes indicator class matches trend id
                     if (indicator) indicator.style.display = 'block';

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
            setActiveButton(showTrendsBtn); // Ensure parent button is active
        });
    });

     // Add listeners to significance list items (Temporary)
    const significanceItems = document.querySelectorAll('#info-significance li');
     console.log(`Fundet ${significanceItems.length} significance list items.`); // TEST OUTPUT
    significanceItems.forEach(item => {
        item.addEventListener('click', () => {
             console.log(`>>> KLIK: Significance Item <<<`); // TEST OUTPUT
             // Remove active state from other items
             significanceItems.forEach(i => i.classList.remove('active'));
             // Add active state to clicked item
            item.classList.add('active');

             const visualType = item.getAttribute('data-visual');
             console.log(`Significance item visual type: ${visualType}`); // TEST OUTPUT
             hideAllSignificanceVisuals(); // Clear previous visuals first

             switch (visualType) {
                 case 'priority':
                     showPriorityNumbers();
                     break;
                 case 'unified':
                     showUnifiedEffortLine();
                     break;
                 case 'risk':
                     showRiskMarkers();
                     break;
                 default:
                      console.log("Ingen specifik visualisering for dette punkt.");
                     // No specific visual, just highlight the item
                     break;
            }
        });
    });


    // Global click listener to potentially close info boxes or remove focus
    document.addEventListener('click', (event) => {
        const container = document.getElementById('infographic-container');
        // Check if the click is outside the main container or on the body directly
        if (!container.contains(event.target) || event.target === document.body || event.target === container) {
             console.log("Global klik udenfor interaktive elementer (eller på baggrund). Nulstiller delvist."); // TEST OUTPUT
             // Decide what needs resetting. Maybe just close info boxes and remove focus?
             // Avoid full hideAllInfoAndFocus as it might be too aggressive
             infoBoxes.forEach(box => {
                 // Only hide if it's not the significance box OR if significance box is the target
                if (box.id !== 'info-significance') {
                    box.style.display = 'none';
                }
             });
            // Maybe remove highlights?
             document.querySelectorAll('.active').forEach(el => el.classList.remove('active'));
             // Maybe remove focus classes?
             document.body.classList.remove('cimt-focus-active', 'trend-focus-active');
             // Maybe remove lines?
             lines.forEach(line => line.remove());
             lines = [];
            // Don't hide bands or significance box here usually
             setActiveButton(null); // Deactivate main buttons visually

        }
    });

    // Resize listener to remove lines (they might become misaligned)
     let resizeTimeout;
     window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
             console.log("Resize event - fjerner linjer."); // TEST OUTPUT
             lines.forEach(line => line.remove());
             lines = [];
             significanceLines.forEach(line => line.remove()); // Also clear significance lines
             significanceLines = [];
             // Optionally, call hideAllInfoAndFocus or parts of it if layout breaks significantly
        }, 250); // Debounce resize events
    });


    console.log("===== Script Initialisering Færdig ====="); // TEST OUTPUT

}); // End of DOMContentLoaded
