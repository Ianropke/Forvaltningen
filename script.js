document.addEventListener('DOMContentLoaded', () => {
    // Knapper
    const toggleCimtButton = document.getElementById('toggle-cimt');
    const toggleTrendsButton = document.getElementById('toggle-trends');

    // Containere / Lag
    const cimtBand = document.getElementById('cimt-band');
    const trendsBand = document.getElementById('trends-band');
    const workflowSteps = document.querySelectorAll('.workflow-step');
    const infoBoxes = document.querySelectorAll('.info-box');
    const cimtIcons = document.querySelectorAll('#cimt-band .cimt-icon'); // Kun ikoner i CIMT bånd
    const trendIcons = document.querySelectorAll('#trends-band .cimt-icon'); // Ikoner i Trends bånd
    const allIcons = document.querySelectorAll('.cimt-icon'); // Fælles klasse for alle ikoner i bånd
    const tooltips = document.querySelectorAll('.tooltip');
    const body = document.body;

    // Status variable
    let currentHighlightedStep = null;
    let currentVisibleInfoBox = null;
    let currentVisibleTooltip = null;
    let activeLines = []; // Til at gemme LeaderLine instanser

    // --- LeaderLine Options ---
    const lineOptions = {
        color: 'rgba(0, 100, 150, 0.35)', // Diskret blålig farve
        size: 2,
        path: 'fluid', // 'straight', 'arc', 'fluid', 'grid'
        startSocket: 'bottom',
        endSocket: 'top',
        // Læg linjer under tooltips (z-index 150) og infoboks (z-index 100), men over bånd (z-index 50)
         outline: false, // Deaktiver standard outline
         // LeaderLine tilføjer selv en SVG med klasse leader-line
    };


    // --- Funktioner ---

    function hideAllInfoBoxes() {
        if (currentVisibleInfoBox) {
            infoBoxes.forEach(box => box.classList.remove('visible'));
            currentVisibleInfoBox = null;
        }
    }

    function hideAllTooltips() {
         if (currentVisibleTooltip) {
            tooltips.forEach(tip => tip.classList.remove('visible'));
            currentVisibleTooltip = null;
         }
    }

    function removeAllStepHighlights() {
        if (currentHighlightedStep) {
            workflowSteps.forEach(step => step.classList.remove('highlighted'));
            currentHighlightedStep = null;
        }
    }

    // Fjerner alle tegnede LeaderLine linjer
    function removeAllLines() {
        activeLines.forEach(line => {
            try { line.remove(); } catch (e) {} // Ignorer fejl hvis linje allerede er fjernet
        });
        activeLines = []; // Tøm arrayet
    }

    // Tegner linjer for CIMT båndet
    function drawCimtLines() {
        removeAllLines(); // Fjern gamle linjer først
        cimtIcons.forEach(icon => {
            const relevantStepsStr = icon.dataset.cimtRelevant || '';
            const relevantSteps = relevantStepsStr.split(' ');

            relevantSteps.forEach(stepId => {
                if (stepId) {
                    const stepElement = document.getElementById(stepId);
                    if (stepElement) {
                        try {
                            const line = new LeaderLine(stepElement, icon, lineOptions);
                            activeLines.push(line);
                        } catch(e) {
                            console.error("Fejl ved tegning af linje:", e);
                        }
                    }
                }
            });
        });
    }

    function hideCimtBand() {
        if (body.classList.contains('cimt-band-visible')) {
            body.classList.remove('cimt-band-visible');
            updateToggleButtonText(toggleCimtButton, 'Vis CIMT Understøttelse');
            removeAllLines(); // Fjern linjer når båndet skjules
            hideAllTooltips();
        }
    }

    function hideTrendsBand() {
        if (body.classList.contains('trends-band-visible')) {
            body.classList.remove('trends-band-visible');
            updateToggleButtonText(toggleTrendsButton, 'Vis Tendenser/Risici');
            // Ingen linjer at fjerne for trends båndet (endnu)
            hideAllTooltips();
        }
    }

    function updateToggleButtonText(button, showText) {
        const baseText = showText.replace('Vis ', '');
        let bodyClassToCheck = '';
        if (button === toggleCimtButton) {
            bodyClassToCheck = 'cimt-band-visible';
        } else if (button === toggleTrendsButton) {
            bodyClassToCheck = 'trends-band-visible';
        }

        if (body.classList.contains(bodyClassToCheck)) {
            button.textContent = `Skjul ${baseText}`;
        } else {
            button.textContent = `Vis ${baseText}`;
        }
    }

    // Debounce funktion til at begrænse hvor ofte resize-handler kører
    function debounce(func, wait, immediate) {
        var timeout;
        return function() {
            var context = this, args = arguments;
            var later = function() {
                timeout = null;
                if (!immediate) func.apply(context, args);
            };
            var callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func.apply(context, args);
        };
    };

    // Håndterer resize - gentegner linjer hvis CIMT bånd er synligt
    const handleResize = debounce(() => {
        if (body.classList.contains('cimt-band-visible')) {
             // LeaderLine har indbygget position() metode, men redraw er mere robust ved store ændringer
             // activeLines.forEach(line => { try { line.position(); } catch (e) {} }); // Alternativ: Prøv kun at repositionere
             drawCimtLines(); // Gen-tegn alle linjer
        }
    }, 250); // Vent 250ms efter resize stopper før der reageres


    // --- Event Listeners ---

    // Knap: Vis/Skjul CIMT bånd
    toggleCimtButton.addEventListener('click', () => {
        const isCurrentlyVisible = body.classList.contains('cimt-band-visible');

        hideTrendsBand();
        hideAllInfoBoxes();
        removeAllStepHighlights();

        if (isCurrentlyVisible) {
            body.classList.remove('cimt-band-visible');
            removeAllLines(); // Fjern linjer
            hideAllTooltips();
        } else {
            body.classList.add('cimt-band-visible');
            // Vent et øjeblik for at sikre elementer er synlige før linjer tegnes
             requestAnimationFrame(drawCimtLines);
             // Alternativt: setTimeout(drawCimtLines, 50); // Lille timeout
        }
        updateToggleButtonText(toggleCimtButton, 'Vis CIMT Understøttelse');
        updateToggleButtonText(toggleTrendsButton, 'Vis Tendenser/Risici');
    });

    // Knap: Vis/Skjul Tendens bånd
    toggleTrendsButton.addEventListener('click', () => {
        const isCurrentlyVisible = body.classList.contains('trends-band-visible');

        hideCimtBand(); // Skjuler også evt. linjer
        hideAllInfoBoxes();
        removeAllStepHighlights();

        if (isCurrentlyVisible) {
            body.classList.remove('trends-band-visible');
             hideAllTooltips();
        } else {
            body.classList.add('trends-band-visible');
        }
        updateToggleButtonText(toggleTrendsButton, 'Vis Tendenser/Risici');
        updateToggleButtonText(toggleCimtButton, 'Vis CIMT Understøttelse');
    });


    // Klik på workflow steps
    workflowSteps.forEach(step => {
        step.addEventListener('click', () => {
            const infoBoxId = step.dataset.infoTarget;
            const infoBox = document.getElementById(infoBoxId);

            // Skjul BEGGE bånd (og dermed linjer/tooltips)
            hideCimtBand();
            hideTrendsBand();

            if (step === currentHighlightedStep) {
                hideAllInfoBoxes();
                removeAllStepHighlights();
            } else {
                hideAllInfoBoxes();
                removeAllStepHighlights();

                step.classList.add('highlighted');
                currentHighlightedStep = step;

                if (infoBox) {
                    infoBox.classList.add('visible');
                    currentVisibleInfoBox = infoBox;
                }
            }
        });

         step.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                step.click();
                e.preventDefault();
            }
        });
    });

    // Klik på ikoner i BEGGE bånd (fælles listener)
    allIcons.forEach(icon => {
        icon.addEventListener('click', (event) => {
             event.stopPropagation();

             const parentCimtBand = icon.closest('#cimt-band');
             const parentTrendsBand = icon.closest('#trends-band');

             if (!((parentCimtBand && body.classList.contains('cimt-band-visible')) ||
                   (parentTrendsBand && body.classList.contains('trends-band-visible')))) {
                  return;
             }

             hideAllInfoBoxes();
             removeAllStepHighlights();

            const tooltipId = icon.dataset.tooltipTarget;
            const tooltip = document.getElementById(tooltipId);

             if (tooltip && tooltip.classList.contains('visible')) {
                hideAllTooltips();
             } else {
                hideAllTooltips();
                if (tooltip) {
                    tooltip.classList.add('visible');
                    currentVisibleTooltip = tooltip;
                }
             }
        });

         icon.addEventListener('keypress', (e) => {
             const parentCimtBand = icon.closest('#cimt-band');
             const parentTrendsBand = icon.closest('#trends-band');

             if (((parentCimtBand && body.classList.contains('cimt-band-visible')) ||
                  (parentTrendsBand && body.classList.contains('trends-band-visible'))) &&
                 (e.key === 'Enter' || e.key === ' '))
            {
                 icon.click();
                 e.preventDefault();
             }
         });
    });

     // Klik udenfor popups for at lukke dem
     document.addEventListener('click', (event) => {
         const clickedElement = event.target;

         // Luk info-boks
         if (!clickedElement.closest('.workflow-step') && !clickedElement.closest('.info-box-container') && currentVisibleInfoBox) {
              hideAllInfoBoxes();
              removeAllStepHighlights();
         }

          // Luk tooltip
         if ((body.classList.contains('cimt-band-visible') || body.classList.contains('trends-band-visible')) &&
             !clickedElement.closest('.cimt-icon') && !clickedElement.closest('.tooltip') && currentVisibleTooltip)
         {
              if (!clickedElement.closest('#cimt-band') && !clickedElement.closest('#trends-band')) {
                   hideAllTooltips();
              }
         }
     });

     // Initial opdatering af knaptekster
     updateToggleButtonText(toggleCimtButton, 'Vis CIMT Understøttelse');
     updateToggleButtonText(toggleTrendsButton, 'Vis Tendenser/Risici');

     // Lyt efter resize for at opdatere linjer
     window.addEventListener('resize', handleResize);

}); // End DOMContentLoaded
