document.addEventListener('DOMContentLoaded', () => {
    const toggleCimtButton = document.getElementById('toggle-cimt');
    const cimtBand = document.getElementById('cimt-band');
    const workflowSteps = document.querySelectorAll('.workflow-step');
    const infoBoxes = document.querySelectorAll('.info-box');
    const cimtIcons = document.querySelectorAll('.cimt-icon');
    const tooltips = document.querySelectorAll('.tooltip');
    const body = document.body;

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

    function updateToggleButtonText() {
        if (body.classList.contains('cimt-visible')) {
            toggleCimtButton.textContent = 'Skjul CIMT Understøttelse';
        } else {
            toggleCimtButton.textContent = 'Vis CIMT Understøttelse';
        }
    }


    // --- Event Listeners ---

    // Knap til at vise/skjule CIMT båndet
    toggleCimtButton.addEventListener('click', () => {
        if (!body.classList.contains('cimt-visible')) {
            // Hvis vi er ved at vise CIMT båndet:
            hideAllInfoBoxes();         // Skjul info-boks
            removeAllStepHighlights();  // Fjern step highlight
        }
        // Ellers (hvis vi er ved at skjule båndet), gør vi ikke noget ved info-bokse/steps

        body.classList.toggle('cimt-visible'); // Vis/skjul bånd via CSS
        updateToggleButtonText(); // Opdater knaptekst

        // Hvis vi lige har skjult båndet, skjul også tooltips
        if (!body.classList.contains('cimt-visible')) {
            hideAllTooltips();
        }
    });

    // Klik på workflow steps
    workflowSteps.forEach(step => {
        step.addEventListener('click', () => {
            const infoBoxId = step.dataset.infoTarget;
            const infoBox = document.getElementById(infoBoxId);

             // Skjul altid CIMT båndet når et step klikkes
             if (body.classList.contains('cimt-visible')) {
                 body.classList.remove('cimt-visible');
                 updateToggleButtonText(); // Opdater knap til "Vis..."
                 hideAllTooltips(); // Skjul evt. åbne tooltips
             }

            if (step === currentHighlightedStep) {
                // Klik på allerede aktivt step: Skjul info-boks og fjern highlight
                hideAllInfoBoxes();
                removeAllStepHighlights();
            } else {
                // Klik på nyt step: Skjul evt. gammel, vis ny, opdater highlight
                hideAllInfoBoxes();
                removeAllStepHighlights();
                // Tooltips er allerede skjult ovenfor hvis båndet var synligt

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
             event.stopPropagation();

             // Tjek om båndet er synligt
             if (!body.classList.contains('cimt-visible')) return;

            // Sørg for at info-bokse er skjult, hvis et ikon klikkes
            // (Selvom det burde være sket da båndet blev vist, for en sikkerheds skyld)
             hideAllInfoBoxes();
             removeAllStepHighlights();

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
            if (body.classList.contains('cimt-visible') && (e.key === 'Enter' || e.key === ' ')) {
                 icon.click();
                 e.preventDefault();
             }
         });
    });

     // Klik udenfor popups for at lukke dem
     document.addEventListener('click', (event) => {
         const clickedElement = event.target;

         // Luk info-boks hvis der klikkes udenfor et step eller info-boks container
         if (!clickedElement.closest('.workflow-step') && !clickedElement.closest('.info-box-container') && currentVisibleInfoBox) {
              hideAllInfoBoxes();
              removeAllStepHighlights();
         }

          // Luk tooltip hvis der klikkes udenfor et CIMT ikon eller tooltip OG udenfor selve båndet
         if (body.classList.contains('cimt-visible') && !clickedElement.closest('.cimt-icon') && !clickedElement.closest('.tooltip') && currentVisibleTooltip) {
              if (!clickedElement.closest('#cimt-band')) {
                   hideAllTooltips();
              }
         }
     });

}); // End DOMContentLoaded
