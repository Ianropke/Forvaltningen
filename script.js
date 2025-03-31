document.addEventListener('DOMContentLoaded', () => {
    // Knapper
    const toggleCimtButton = document.getElementById('toggle-cimt');
    const toggleTrendsButton = document.getElementById('toggle-trends');
    const toggleSignificanceButton = document.getElementById('toggle-significance');

    // Containere / Lag
    const cimtBand = document.getElementById('cimt-band');
    const trendsBand = document.getElementById('trends-band');
    const workflowSteps = document.querySelectorAll('.workflow-step');
    // const workflowLayer = document.getElementById('workflow-layer');
    const infoBoxContainer = document.querySelector('.info-box-container');
    const infoBoxes = document.querySelectorAll('.info-box:not(#info-significance)'); // Ekskl. significance
    const significanceInfoBox = document.getElementById('info-significance');
    // const allIcons = document.querySelectorAll('.cimt-icon');
    // const allCimtIcons = document.querySelectorAll('#cimt-band .cimt-icon');
    // const trendIcons = document.querySelectorAll('#trends-band .cimt-icon');
    // const tooltips = document.querySelectorAll('#cimt-band .tooltip');
    const body = document.body;
    // const fadeableWorkflowSteps = document.querySelectorAll('#workflow-layer .workflow-step');
    // const fadeableCimtIcons = document.querySelectorAll('#cimt-band .cimt-icon');
    // const dynamicTooltipContainer = document.getElementById('dynamic-tooltip-container');

    // Elementer og state for 'Betydning' visualisering (deaktiveret)
    const significanceListItems = significanceInfoBox?.querySelectorAll('li[data-visual]');
    // const priorityNumberElements = document.querySelectorAll('.priority-number');
    // const riskMarkers = document.querySelectorAll('.risk-marker');
    // const trendIndicators = document.querySelectorAll('.trend-indicator');
    // let activeSignificanceVisual = null;
    // let unifiedEffortLine = null;

    // State variable
    // let activeLines = [];
    let currentVisibleInfoBox = null;
    let currentHighlightedStep = null;
    // let currentVisibleTooltip = null;
    // let currentTrendFocusIcon = null;
    // let currentCimtFocusIcon = null;
    // let currentTrendExampleTooltip = null;

    // LeaderLine Options (ikke brugt i denne version)
    // const defaultLineOptions = { ... };
    // const unifiedLineOptions = { ... };

    // --- Debounce Funktion (Stadig nødvendig for resize listener) ---
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => { clearTimeout(timeout); func(...args); };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    // -------------------------------------------------------

    // --- Minimalistiske Funktioner ---

    // Skjul alle info bokse (Workflow + Significance)
    function hideAllInfoBoxes() {
        infoBoxes.forEach(box => { box.classList.remove('visible'); });
        if (significanceInfoBox) { significanceInfoBox.classList.remove('visible'); }
        // Hide significance visuals (selvom de ikke aktiveres)
        // hideAllSignificanceVisuals();
        // if (currentVisibleInfoBox === significanceInfoBox) {
           // workflowLayer?.classList.remove('workflow-frame-active'); // Fjern ramme hvis den var på
        // }
        currentVisibleInfoBox = null;
    }

     function removeAllStepHighlights() {
        workflowSteps.forEach(step => { step.classList.remove('highlighted'); });
        currentHighlightedStep = null;
    }

    // Opdater knaptekster
     function updateAllButtonTexts() {
        if (toggleCimtButton) { toggleCimtButton.textContent = body.classList.contains('cimt-band-visible') ? 'Skjul CIMT Understøttelse' : 'Vis CIMT Understøttelse'; }
        if (toggleTrendsButton) { toggleTrendsButton.textContent = body.classList.contains('trends-band-visible') ? 'Skjul Tendenser/Risici' : 'Vis Tendenser/Risici'; }
        if (toggleSignificanceButton) { toggleSignificanceButton.textContent = significanceInfoBox?.classList.contains('visible') ? 'Skjul Betydning for CIMT' : 'Vis Betydning for CIMT'; }
    }

    // Resize handler (minimalistisk)
    const handleResize = debounce(() => {
       // Minimal handling - fjern evt. linjer hvis de blev tilføjet
       // removeAllLines();
    }, 250);


    // --- Minimalistiske Event Listeners ---

    if (toggleCimtButton) {
        toggleCimtButton.addEventListener('click', () => {
            console.log("CIMT Button Clicked"); // DEBUG
            const shouldShow = !body.classList.contains('cimt-band-visible');
            // Skjul andre hovedelementer
            hideAllInfoBoxes();
            removeAllStepHighlights();
            body.classList.remove('trends-band-visible');

            // Vis/skjul CIMT bånd
            if (shouldShow) {
                 console.log("Adding cimt-band-visible to body"); // DEBUG
                 body.classList.add('cimt-band-visible');
            } else {
                 console.log("Removing cimt-band-visible from body"); // DEBUG
                 body.classList.remove('cimt-band-visible');
            }
            updateAllButtonTexts();
        });
    }

    if (toggleTrendsButton) {
        toggleTrendsButton.addEventListener('click', () => {
             console.log("Trends Button Clicked"); // DEBUG
            const shouldShow = !body.classList.contains('trends-band-visible');
             // Skjul andre hovedelementer
            hideAllInfoBoxes();
            removeAllStepHighlights();
            body.classList.remove('cimt-band-visible');

            // Vis/skjul Trends bånd
            if (shouldShow) { body.classList.add('trends-band-visible'); }
            else { body.classList.remove('trends-band-visible'); }
            updateAllButtonTexts();
        });
    }

     if (toggleSignificanceButton && significanceInfoBox) {
        toggleSignificanceButton.addEventListener('click', () => {
            console.log("Significance Button Clicked"); // DEBUG
            const shouldShow = !significanceInfoBox.classList.contains('visible');
            // Skjul andre hovedelementer
             removeAllStepHighlights();
             body.classList.remove('cimt-band-visible');
             body.classList.remove('trends-band-visible');
             infoBoxes.forEach(box => box.classList.remove('visible')); // Skjul workflow bokse

            // Vis/skjul Significance boks
            if (shouldShow) { significanceInfoBox.classList.add('visible'); currentVisibleInfoBox = significanceInfoBox; }
            else { significanceInfoBox.classList.remove('visible'); currentVisibleInfoBox = null; }
            updateAllButtonTexts();
        });
     }

    workflowSteps.forEach(step => {
        step.addEventListener('click', () => {
            console.log("Workflow Step Clicked:", step.id); // DEBUG
            const infoBoxId = step.dataset.infoTarget; const targetInfoBox = document.getElementById(infoBoxId);
             // Skjul andre hovedelementer
             hideAllInfoBoxes();
             body.classList.remove('cimt-band-visible');
             body.classList.remove('trends-band-visible');

             // Håndter klik på step
            if (step === currentHighlightedStep) {
                removeAllStepHighlights(); // Klik på aktivt step = skjul info
            } else {
                removeAllStepHighlights();
                step.classList.add('highlighted');
                currentHighlightedStep = step;
                if (targetInfoBox) {
                    targetInfoBox.classList.add('visible');
                    currentVisibleInfoBox = targetInfoBox;
                }
            }
            updateAllButtonTexts();
        });
        step.addEventListener('keypress', (e) => { if (e.key === 'Enter' || e.key === ' ') { step.click(); }});
        // Hover listeners fjernet midlertidigt
    });

     // Listeners for CIMT ikoner (kun til evt. fremtidig brug - de gør intet nu)
    // allCimtIcons.forEach(icon => {
    //     icon.addEventListener('click', (event) => { ... });
    //     icon.addEventListener('keypress', (e) => { ... });
    // });

    // Listeners for Trend ikoner (kun til evt. fremtidig brug - de gør intet nu)
    // trendIcons.forEach(icon => {
    //      icon.addEventListener('click', (event) => { ... });
    //      icon.addEventListener('keypress', (e) => { ... });
    // });

    // Listener for Betydning List Items (deaktiveret midlertidigt)
    // if (significanceListItems) {
    //     significanceListItems.forEach(item => {
    //         item.addEventListener('click', (event) => { ... });
    //         item.addEventListener('keypress', (e) => { ... });
    //     });
    // }

     // Global click listener (simplificeret)
     document.addEventListener('click', (event) => {
          const clickedElement = event.target;
          const isInteractive = clickedElement.closest('#controls button, .workflow-step'); // Kun knapper og steps er interaktive nu

          if (!isInteractive) {
                // Hvis en info boks er synlig og vi klikker udenfor
               if (currentVisibleInfoBox && !clickedElement.closest('.info-box-container')) {
                   console.log("Global click closing info box"); // DEBUG
                    hideAllInfoBoxes();
                    removeAllStepHighlights();
               }
          }
     });

     window.addEventListener('resize', handleResize);
     updateAllButtonTexts(); // Kald til sidst for at sætte initiel tekst

}); // End DOMContentLoaded
