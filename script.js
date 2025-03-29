document.addEventListener('DOMContentLoaded', () => {
    // Knapper
    const toggleCimtButton = document.getElementById('toggle-cimt');
    const toggleTrendsButton = document.getElementById('toggle-trends');

    // Containere / Lag
    const cimtBand = document.getElementById('cimt-band');
    const trendsBand = document.getElementById('trends-band');
    const workflowSteps = document.querySelectorAll('.workflow-step');
    const infoBoxes = document.querySelectorAll('.info-box');
    const cimtIcons = document.querySelectorAll('#cimt-band .cimt-icon');
    const trendIcons = document.querySelectorAll('#trends-band .cimt-icon');
    const allIcons = document.querySelectorAll('.cimt-icon');
    const tooltips = document.querySelectorAll('.tooltip');
    const body = document.body;

    // Status variable
    let currentHighlightedStep = null;
    let currentVisibleInfoBox = null;
    let currentVisibleTooltip = null;
    let activeLines = []; // Til at gemme LeaderLine instanser

    // --- LeaderLine Options ---
    const lineOptions = {
        color: 'rgba(120, 120, 120, 0.6)', // Lidt mørkere grå, stadig transparent
        size: 1,                          // Tyndere linje
        path: 'straight',                 // Lige linjer
        startSocket: 'bottom',
        endSocket: 'top',
        endPlug: 'arrow1',                // Tilføj en lille pil ved CIMT ikon
        endPlugSize: 1.5,                 // Størrelse på pil
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
            try { line.remove(); } catch (e) {}
        });
        activeLines = [];
    }

    // Tegner linjer for CIMT båndet
    function drawCimtLines() {
        removeAllLines();
        // Sikrer at elementerne er klar i DOM'en før vi tegner
        requestAnimationFrame(() => {
            cimtIcons.forEach(icon => {
                const relevantStepsStr = icon.dataset.cimtRelevant || '';
                const relevantSteps = relevantStepsStr.split(' ');

                relevantSteps.forEach(stepId => {
                    if (stepId) {
                        const stepElement = document.getElementById(stepId);
                        // Tjek om både stepElement og icon er synlige/findes i DOM
                        if (stepElement && icon && document.contains(stepElement) && document.contains(icon)) {
                             // Tjek også at de ikke er skjult af f.eks. display: none
                             const stepStyle = window.getComputedStyle(stepElement);
                             const iconStyle = window.getComputedStyle(icon);
                             if (stepStyle.display !== 'none' && iconStyle.display !== 'none') {
                                try {
                                    const line = new LeaderLine(stepElement, icon, lineOptions);
                                    activeLines.push(line);
                                } catch(e) {
                                    console.error(`Fejl ved tegning af linje fra ${stepId} til ${icon.id}:`, e);
                                }
                             }
                        } else {
                             console.warn(`Element ikke fundet for linje: ${stepId} eller ${icon.id}`);
                        }
                    }
                });
            });
        });
    }


    function hideCimtBand() {
        if (body.classList.contains('cimt-band-visible')) {
            body.classList.remove('cimt-band-visible');
            updateToggleButtonText(toggleCimtButton, 'Vis CIMT Understøttelse');
            removeAllLines();
            hideAllTooltips();
        }
    }

    function hideTrendsBand() {
        if (body.classList.contains('trends-band-visible')) {
            body.classList.remove('trends-band-visible');
            updateToggleButtonText(toggleTrendsButton, 'Vis Tendenser/Risici');
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

    // Debounce funktion
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

    // Håndterer resize
    const handleResize = debounce(() => {
        if (body.classList.contains('cimt-band-visible')) {
             drawCimtLines(); // Gen-tegn alle linjer
        }
    }, 250);


    // --- Event Listeners ---

    // Knap: Vis/Skjul CIMT bånd
    toggleCimtButton.addEventListener('click', () => {
        const isCurrentlyVisible = body.classList.contains('cimt-band-visible');

        hideTrendsBand();
        hideAllInfoBoxes();
        removeAllStepHighlights();

        if (isCurrentlyVisible) {
            body.classList.remove('cimt-band-visible');
            removeAllLines();
            hideAllTooltips();
        } else {
            body.classList.add('cimt-band-visible');
             // Vent lidt for CSS display:flex at slå igennem før tegning
             setTimeout(drawCimtLines, 50);
        }
        updateToggleButtonText(toggleCimtButton, 'Vis CIMT Understøttelse');
        updateToggleButtonText(toggleTrendsButton, 'Vis Tendenser/Risici');
    });

    // Knap: Vis/Skjul Tendens bånd
    toggleTrendsButton.addEventListener('click', () => {
        const isCurrentlyVisible = body.classList.contains('trends-band-visible');

        hideCimtBand(); // Skjuler også linjer
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

            hideCimtBand(); // Skjuler også linjer
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
