document.addEventListener('DOMContentLoaded', () => {
    // Knapper
    const toggleCimtButton = document.getElementById('toggle-cimt');
    const toggleTrendsButton = document.getElementById('toggle-trends');

    // Containere / Lag
    const cimtBand = document.getElementById('cimt-band');
    const trendsBand = document.getElementById('trends-band');
    const workflowSteps = document.querySelectorAll('.workflow-step');
    const infoBoxes = document.querySelectorAll('.info-box');
    const allIcons = document.querySelectorAll('.cimt-icon'); // Fælles klasse for alle ikoner i bånd
    const tooltips = document.querySelectorAll('.tooltip');
    const body = document.body;

    // Status variable
    let currentHighlightedStep = null;
    let currentVisibleInfoBox = null;
    let currentVisibleTooltip = null;

    // --- Funktioner til at vise/skjule elementer og opdatere status ---

    function hideAllInfoBoxes() {
        infoBoxes.forEach(box => box.classList.remove('visible'));
        currentVisibleInfoBox = null;
    }

    function hideAllTooltips() {
        tooltips.forEach(tip => tip.classList.remove('visible'));
        currentVisibleTooltip = null;
    }

    function removeAllStepHighlights() {
        workflowSteps.forEach(step => step.classList.remove('highlighted'));
        currentHighlightedStep = null;
    }

    function hideCimtBand() {
        if (body.classList.contains('cimt-band-visible')) {
            body.classList.remove('cimt-band-visible');
            updateToggleButtonText(toggleCimtButton, 'Vis CIMT Understøttelse');
            hideAllTooltips(); // Skjul også tooltips relateret til dette bånd
        }
    }

    function hideTrendsBand() {
        if (body.classList.contains('trends-band-visible')) {
            body.classList.remove('trends-band-visible');
            updateToggleButtonText(toggleTrendsButton, 'Vis Tendenser/Risici');
            hideAllTooltips(); // Skjul også tooltips relateret til dette bånd
        }
    }

    // Funktion til at opdatere en specifik knaps tekst
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

        hideTrendsBand();          // Skjul altid det andet bånd
        hideAllInfoBoxes();        // Skjul altid info-boks
        removeAllStepHighlights(); // Fjern altid step highlight

        if (isCurrentlyVisible) {
            body.classList.remove('cimt-band-visible');
            hideAllTooltips(); // Skjul tooltips når båndet lukkes
        } else {
            body.classList.add('cimt-band-visible');
        }
        updateToggleButtonText(toggleCimtButton, 'Vis CIMT Understøttelse');
        // Opdater også den anden knaps tekst, da dens bånd blev skjult
        updateToggleButtonText(toggleTrendsButton, 'Vis Tendenser/Risici');
    });

    // Knap: Vis/Skjul Tendens bånd
    toggleTrendsButton.addEventListener('click', () => {
        const isCurrentlyVisible = body.classList.contains('trends-band-visible');

        hideCimtBand();            // Skjul altid det andet bånd
        hideAllInfoBoxes();        // Skjul altid info-boks
        removeAllStepHighlights(); // Fjern altid step highlight

        if (isCurrentlyVisible) {
            body.classList.remove('trends-band-visible');
             hideAllTooltips(); // Skjul tooltips når båndet lukkes
        } else {
            body.classList.add('trends-band-visible');
        }
        updateToggleButtonText(toggleTrendsButton, 'Vis Tendenser/Risici');
         // Opdater også den anden knaps tekst, da dens bånd blev skjult
        updateToggleButtonText(toggleCimtButton, 'Vis CIMT Understøttelse');
    });


    // Klik på workflow steps
    workflowSteps.forEach(step => {
        step.addEventListener('click', () => {
            const infoBoxId = step.dataset.infoTarget;
            const infoBox = document.getElementById(infoBoxId);

            // Skjul BEGGE bånd når et step klikkes
            hideCimtBand();
            hideTrendsBand();
            // hideAllTooltips() kaldes inde i hideXBand()

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

             // Tjek om det korrekte bånd er synligt for det klikkede ikon
             if (!((parentCimtBand && body.classList.contains('cimt-band-visible')) ||
                   (parentTrendsBand && body.classList.contains('trends-band-visible')))) {
                  return; // Gør intet hvis det forkerte bånd er synligt
             }

             // Hvis et ikon i et bånd klikkes, skjul info-bokse og step highlights
             hideAllInfoBoxes();
             removeAllStepHighlights();

            const tooltipId = icon.dataset.tooltipTarget;
            const tooltip = document.getElementById(tooltipId);

             if (tooltip && tooltip.classList.contains('visible')) {
                hideAllTooltips(); // Luk aktiv tooltip
             } else {
                hideAllTooltips(); // Skjul andre tooltips
                if (tooltip) {
                    tooltip.classList.add('visible'); // Vis den nye
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
              // Luk kun hvis der klikkes udenfor det aktive bånd
              if (!clickedElement.closest('#cimt-band') && !clickedElement.closest('#trends-band')) {
                   hideAllTooltips();
              }
         }
     });

     // Initial opdatering af knaptekster
     updateToggleButtonText(toggleCimtButton, 'Vis CIMT Understøttelse');
     updateToggleButtonText(toggleTrendsButton, 'Vis Tendenser/Risici');

}); // End DOMContentLoaded
