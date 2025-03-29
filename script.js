document.addEventListener('DOMContentLoaded', () => {
    // Knapper
    const toggleCimtButton = document.getElementById('toggle-cimt');
    const toggleTrendsButton = document.getElementById('toggle-trends');

    // Containere / Lag
    const cimtBand = document.getElementById('cimt-band');
    const trendsBand = document.getElementById('trends-band');
    const workflowSteps = document.querySelectorAll('.workflow-step');
    const infoBoxes = document.querySelectorAll('.info-box');
    const cimtIcons = document.querySelectorAll('#cimt-band .cimt-icon'); // Kun CIMT ikoner (til linjetegning)
    const allIcons = document.querySelectorAll('.cimt-icon'); // Alle ikoner (til tooltip)
    const tooltips = document.querySelectorAll('.tooltip');
    const body = document.body;

    // Status variable
    let currentHighlightedStep = null;
    let currentVisibleInfoBox = null;
    let currentVisibleTooltip = null;
    let activeLines = []; // Til at gemme LeaderLine instanser

    // --- LeaderLine Options ---
    const lineOptions = {
        color: 'rgba(120, 120, 120, 0.6)',
        size: 1,
        path: 'straight',
        startSocket: 'bottom',
        endSocket: 'top',
        endPlug: 'arrow1',
        endPlugSize: 1.5,
    };


    // --- Funktioner ---

    function hideAllInfoBoxes() {
        if (currentVisibleInfoBox) {
            infoBoxes.forEach(box => box.classList.remove('visible'));
            currentVisibleInfoBox = null;
        }
    }

    // Fjerner alle tegnede LeaderLine linjer
    function removeAllLines() {
        activeLines.forEach(line => {
            try { line.remove(); } catch (e) {}
        });
        activeLines = [];
    }

    function hideAllTooltips() {
         if (currentVisibleTooltip) {
            tooltips.forEach(tip => tip.classList.remove('visible'));
            currentVisibleTooltip = null;
         }
         // Fjern også altid linjer når tooltips skjules
         removeAllLines();
    }

    function removeAllStepHighlights() {
        if (currentHighlightedStep) {
            workflowSteps.forEach(step => step.classList.remove('highlighted'));
            currentHighlightedStep = null;
        }
    }

    // Tegner KUN linjer for et specifikt ikon
    function drawLinesForIcon(iconElement) {
        removeAllLines(); // Fjern altid gamle linjer først

        if (!iconElement || !document.contains(iconElement)) return; // Stop hvis ikonet ikke findes

        const relevantStepsStr = iconElement.dataset.cimtRelevant || '';
        const relevantSteps = relevantStepsStr.split(' ');

        // Sikrer at elementerne er klar i DOM'en før vi tegner
        requestAnimationFrame(() => {
            relevantSteps.forEach(stepId => {
                if (stepId) {
                    const stepElement = document.getElementById(stepId);
                    // Tjek om begge elementer findes og er synlige
                    if (stepElement && document.contains(stepElement)) {
                        const stepStyle = window.getComputedStyle(stepElement);
                        const iconStyle = window.getComputedStyle(iconElement);
                        if (stepStyle.display !== 'none' && iconStyle.display !== 'none') {
                            try {
                                const line = new LeaderLine(stepElement, iconElement, lineOptions);
                                activeLines.push(line);
                            } catch(e) {
                                console.error(`Fejl ved tegning af linje fra ${stepId} til ${iconElement.id}:`, e);
                            }
                        }
                    } else {
                        console.warn(`Element ikke fundet for linje: ${stepId} eller ${iconElement.id}`);
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
            hideAllTooltips(); // Skjul også tooltips
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

    // --- Event Listeners ---

    // Knap: Vis/Skjul CIMT bånd
    toggleCimtButton.addEventListener('click', () => {
        const isCurrentlyVisible = body.classList.contains('cimt-band-visible');

        hideTrendsBand();
        hideAllInfoBoxes();
        removeAllStepHighlights();
        // removeAllLines(); // Fjernes når båndet skjules i hideCimtBand()

        if (isCurrentlyVisible) {
            // Skjuler båndet - hideCimtBand() kaldes implicit via body class fjernelse,
            // men vi kalder den eksplicit for at fjerne linjer etc.
             hideCimtBand();
        } else {
            body.classList.add('cimt-band-visible');
            // Linjer tegnes IKKE her længere, først ved ikon-klik
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
             hideTrendsBand();
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
             const isCimtVisible = parentCimtBand && body.classList.contains('cimt-band-visible');
             const isTrendsVisible = parentTrendsBand && body.classList.contains('trends-band-visible');

             // Tjek om det korrekte bånd er synligt
             if (!isCimtVisible && !isTrendsVisible) {
                  return;
             }

             hideAllInfoBoxes();
             removeAllStepHighlights();

            const tooltipId = icon.dataset.tooltipTarget;
            const tooltip = document.getElementById(tooltipId);
            const isCurrentTooltip = tooltip && tooltip.classList.contains('visible');

            // Altid fjern gamle linjer og tooltips FØR vi gør noget nyt
            hideAllTooltips(); // hideAllTooltips kalder nu også removeAllLines()

            if (!isCurrentTooltip) {
                // Hvis tooltip var skjult, skal vi vise den OG tegne linjer (hvis det er CIMT båndet)
                if (tooltip) {
                    tooltip.classList.add('visible');
                    currentVisibleTooltip = tooltip;
                }
                // Tegn KUN linjer hvis det er et ikon i CIMT båndet
                if (isCimtVisible) {
                     drawLinesForIcon(icon);
                }
            }
            // Hvis tooltip VAR synlig, har hideAllTooltips() allerede lukket den og fjernet linjer.
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

          // Luk tooltip (og fjern linjer via hideAllTooltips)
         if ((body.classList.contains('cimt-band-visible') || body.classList.contains('trends-band-visible')) &&
             !clickedElement.closest('.cimt-icon') && !clickedElement.closest('.tooltip') && currentVisibleTooltip)
         {
              // Luk kun hvis der klikkes udenfor det aktive bånd
              if (!clickedElement.closest('#cimt-band') && !clickedElement.closest('#trends-band')) {
                   hideAllTooltips();
              }
         }
     });

     // Fjern resize listener, da linjer nu er midlertidige
     // window.removeEventListener('resize', handleResize);

     // Initial opdatering af knaptekster
     updateToggleButtonText(toggleCimtButton, 'Vis CIMT Understøttelse');
     updateToggleButtonText(toggleTrendsButton, 'Vis Tendenser/Risici');

}); // End DOMContentLoaded
