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
        color: 'rgba(120, 120, 120, 0.5)', // Diskret grå
        size: 2,                          // Tilbage til tykkelse 2
        path: 'fluid',                    // Kurvede linjer
        startSocket: 'bottom',
        endSocket: 'top',
        // endPlug: 'arrow1',             // Ingen pil
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
         removeAllLines(); // Fjern også altid linjer når tooltips skjules
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

        if (!iconElement || !document.contains(iconElement)) return;

        const relevantStepsStr = iconElement.dataset.cimtRelevant || '';
        const relevantSteps = relevantStepsStr.split(' ');

        requestAnimationFrame(() => { // Vent på næste frame
            relevantSteps.forEach(stepId => {
                if (stepId) {
                    const stepElement = document.getElementById(stepId);
                    if (stepElement && document.contains(stepElement)) {
                         const stepStyle = window.getComputedStyle(stepElement);
                         const iconStyle = window.getComputedStyle(iconElement);
                         if (stepStyle.display !== 'none' && iconStyle.display !== 'none') {
                            try {
                                const currentOptions = {...lineOptions};
                                const line = new LeaderLine(stepElement, iconElement, currentOptions);
                                activeLines.push(line);
                            } catch(e) {
                                console.error(`Fejl ved tegning af linje fra ${stepId} til ${iconElement.id}:`, e);
                            }
                         }
                    } else {
                        // console.warn(`Element ikke fundet for linje: ${stepId} eller ${iconElement.id}`);
                    }
                }
            });
             // Genpositioner kort efter for at sikre korrekt placering med fluid
             setTimeout(() => {
                activeLines.forEach(l => { try { l.position(); } catch(e){} });
             }, 50);
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

    // Debounce funktion (uændret)
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
        // Hvis CIMT-båndet er synligt og der er aktive linjer, gen-tegn dem
        // (eller bare fjern dem, hvis gen-tegning giver problemer)
        if (body.classList.contains('cimt-band-visible') && activeLines.length > 0) {
             // Gen-tegning kan være nødvendig for 'fluid' path ved resize
             // Find det ikon, hvis linjer er aktive (kræver at gemme info om hvilket ikon der er aktivt)
             // Simplere: Bare fjern linjer ved resize, brugeren må klikke igen.
             removeAllLines();
             // Alternativt, hvis vi gemmer 'activeIcon': drawLinesForIcon(activeIcon);
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
             hideCimtBand(); // Skjuler bånd og fjerner linjer/tooltips
        } else {
            body.classList.add('cimt-band-visible');
            // Linjer tegnes først ved ikon-klik
        }
        updateToggleButtonText(toggleCimtButton, 'Vis CIMT Understøttelse');
        updateToggleButtonText(toggleTrendsButton, 'Vis Tendenser/Risici');
    });

    // Knap: Vis/Skjul Tendens bånd
    toggleTrendsButton.addEventListener('click', () => {
        const isCurrentlyVisible = body.classList.contains('trends-band-visible');

        hideCimtBand(); // Skjuler også linjer hvis de var synlige
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

             if (!isCimtVisible && !isTrendsVisible) return;

             hideAllInfoBoxes();
             removeAllStepHighlights();

            const tooltipId = icon.dataset.tooltipTarget;
            const tooltip = document.getElementById(tooltipId);
            const isCurrentTooltip = tooltip && tooltip.classList.contains('visible');

            // Altid fjern gamle linjer og tooltips FØR vi gør noget nyt
            // MEN: Hvis vi klikker på samme ikon igen for at lukke tooltip, skal hideAllTooltips() kaldes *efter* tjekket
            if(isCurrentTooltip) {
                 hideAllTooltips(); // Lukker tooltip og fjerner linjer
            } else {
                 hideAllTooltips(); // Skjuler andre tooltips og fjerner evt. andre linjer
                 if (tooltip) {
                    tooltip.classList.add('visible'); // Viser ny tooltip
                    currentVisibleTooltip = tooltip;
                 }
                 // Tegn KUN linjer hvis det er et ikon i CIMT båndet
                 if (isCimtVisible) {
                      drawLinesForIcon(icon); // Tegn nye linjer for dette ikon
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

          // Luk tooltip (og fjern linjer)
         if ((body.classList.contains('cimt-band-visible') || body.classList.contains('trends-band-visible')) &&
             !clickedElement.closest('.cimt-icon') && !clickedElement.closest('.tooltip') && currentVisibleTooltip)
         {
              if (!clickedElement.closest('#cimt-band') && !clickedElement.closest('#trends-band')) {
                   hideAllTooltips();
              }
         }
     });

     // Lyt efter resize for at fjerne/gentegne linjer
     window.addEventListener('resize', handleResize);

     // Initial opdatering af knaptekster
     updateToggleButtonText(toggleCimtButton, 'Vis CIMT Understøttelse');
     updateToggleButtonText(toggleTrendsButton, 'Vis Tendenser/Risici');

}); // End DOMContentLoaded
