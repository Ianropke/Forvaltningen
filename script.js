document.addEventListener('DOMContentLoaded', () => {
    const toggleCimtButton = document.getElementById('toggle-cimt');
    // const cimtLayer = document.getElementById('cimt-layer'); // FJERNET
    const cimtBand = document.getElementById('cimt-band'); // TILFØJET
    const workflowSteps = document.querySelectorAll('.workflow-step');
    const infoBoxes = document.querySelectorAll('.info-box');
    const cimtIcons = document.querySelectorAll('.cimt-icon');
    const tooltips = document.querySelectorAll('.tooltip');
    const body = document.body; // Stadig brugt til at styre synlighed

    let currentHighlightedStep = null;
    let currentVisibleInfoBox = null;
    let currentVisibleTooltip = null;

    // --- Funktioner til at vise/skjule elementer ---

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

    // --- Event Listeners ---

    // Knap til at vise/skjule CIMT båndet via body klasse
    toggleCimtButton.addEventListener('click', () => {
        body.classList.toggle('cimt-visible'); // Klassen styrer nu #cimt-band via CSS
        if (body.classList.contains('cimt-visible')) {
            toggleCimtButton.textContent = 'Skjul CIMT Understøttelse';
        } else {
            toggleCimtButton.textContent = 'Vis CIMT Understøttelse';
            hideAllTooltips(); // Skjul tooltips når båndet skjules
        }
    });

    // Klik på workflow steps
    workflowSteps.forEach(step => {
        step.addEventListener('click', () => {
            const infoBoxId = step.dataset.infoTarget;
            const infoBox = document.getElementById(infoBoxId);

            if (step === currentHighlightedStep) {
                hideAllInfoBoxes();
                removeAllStepHighlights();
            } else {
                hideAllInfoBoxes();
                removeAllStepHighlights();
                hideAllTooltips(); // Skjul også tooltips når man skifter step

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

    // Klik på CIMT ikoner i båndet
    cimtIcons.forEach(icon => {
        icon.addEventListener('click', (event) => {
             event.stopPropagation(); // Undgå at klik går videre til body/band

             // Tjek om båndet er synligt (selvom ikonet er klikket)
             if (!body.classList.contains('cimt-visible')) return;

            const tooltipId = icon.dataset.tooltipTarget;
            const tooltip = document.getElementById(tooltipId);

             if (tooltip && tooltip.classList.contains('visible')) {
                hideAllTooltips();
             } else {
                hideAllTooltips(); // Skjul andre først

                if (tooltip) {
                    tooltip.classList.add('visible');
                    currentVisibleTooltip = tooltip;
                }
             }
        });

         icon.addEventListener('keypress', (e) => {
             // Tjek om båndet er synligt
            if (body.classList.contains('cimt-visible') && (e.key === 'Enter' || e.key === ' ')) {
                 icon.click();
                 e.preventDefault();
             }
         });
    });

     // Klik udenfor popups for at lukke dem
     document.addEventListener('click', (event) => {
         const clickedElement = event.target;

         // Luk info-boks hvis der klikkes udenfor et step eller en info-boks container
         if (!clickedElement.closest('.workflow-step') && !clickedElement.closest('.info-box-container') && currentVisibleInfoBox) {
              hideAllInfoBoxes();
              removeAllStepHighlights();
         }

          // Luk tooltip hvis der klikkes udenfor et CIMT ikon eller en tooltip (men indenfor båndet, hvis det er synligt)
         if (body.classList.contains('cimt-visible') && !clickedElement.closest('.cimt-icon') && !clickedElement.closest('.tooltip') && currentVisibleTooltip) {
              // Skal vi kun lukke, hvis der klikkes UDENFOR selve båndet også? Måske smartest.
              if (!clickedElement.closest('#cimt-band')) {
                   hideAllTooltips();
              }
         }
     });

}); // End DOMContentLoaded
