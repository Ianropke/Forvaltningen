document.addEventListener('DOMContentLoaded', () => {
    const toggleCimtButton = document.getElementById('toggle-cimt');
    const cimtLayer = document.getElementById('cimt-layer');
    const workflowSteps = document.querySelectorAll('.workflow-step');
    const infoBoxes = document.querySelectorAll('.info-box');
    const cimtIcons = document.querySelectorAll('.cimt-icon');
    const tooltips = document.querySelectorAll('.tooltip');
    // const labkaIcon = document.getElementById('icon-labka'); // FJERNET
    const body = document.body;

    let currentHighlightedStep = null;
    let currentVisibleInfoBox = null;
    let currentVisibleTooltip = null;
    // let labkaHighlightTimeout = null; // FJERNET

    // --- Funktioner til at vise/skjule elementer ---

    function hideAllInfoBoxes() {
        infoBoxes.forEach(box => box.classList.remove('visible'));
        currentVisibleInfoBox = null;
    }

    function hideAllTooltips() {
        tooltips.forEach(tip => tip.classList.remove('visible'));
        currentVisibleTooltip = null;
        // Logik for at fjerne Labka highlight er fjernet herfra
    }

    function removeAllStepHighlights() {
        workflowSteps.forEach(step => step.classList.remove('highlighted'));
        currentHighlightedStep = null;
    }

    // --- Event Listeners ---

    // Knap til at vise/skjule CIMT laget
    toggleCimtButton.addEventListener('click', () => {
        body.classList.toggle('cimt-visible');
        if (body.classList.contains('cimt-visible')) {
            toggleCimtButton.textContent = 'Skjul CIMT Understøttelse';
        } else {
            toggleCimtButton.textContent = 'Vis CIMT Understøttelse';
            hideAllTooltips(); // Skjul tooltips når laget skjules
        }
    });

    // Klik på workflow steps
    workflowSteps.forEach(step => {
        step.addEventListener('click', () => {
            const infoBoxId = step.dataset.infoTarget;
            const infoBox = document.getElementById(infoBoxId);

            if (step === currentHighlightedStep) {
                // Klik på allerede aktivt step: Skjul info-boks og fjern highlight
                hideAllInfoBoxes();
                removeAllStepHighlights();
            } else {
                // Klik på nyt step: Skjul evt. gammel, vis ny, opdater highlight
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

    // Klik på CIMT ikoner
    cimtIcons.forEach(icon => {
        icon.addEventListener('click', (event) => {
             event.stopPropagation();

            const tooltipId = icon.dataset.tooltipTarget;
            const tooltip = document.getElementById(tooltipId);

             if (tooltip && tooltip.classList.contains('visible')) {
                // Klik på ikon for vist tooltip: Skjul tooltip
                hideAllTooltips();
             } else {
                // Klik på ikon for skjult tooltip: Skjul andre, vis denne
                hideAllTooltips();

                if (tooltip) {
                    tooltip.classList.add('visible');
                    currentVisibleTooltip = tooltip;

                    // Special handling for Forvalter (LIMS) ikonet - FJERNET
                    // if (icon.id === 'cimt-icon-forvaltning') { ... }
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

         // Luk info-boks hvis der klikkes udenfor et step eller en info-boks container
         if (!clickedElement.closest('.workflow-step') && !clickedElement.closest('.info-box-container') && currentVisibleInfoBox) {
              hideAllInfoBoxes();
              removeAllStepHighlights();
         }

          // Luk tooltip hvis der klikkes udenfor et CIMT ikon eller en tooltip
         if (body.classList.contains('cimt-visible') && !clickedElement.closest('.cimt-icon') && !clickedElement.closest('.tooltip') && currentVisibleTooltip) {
              hideAllTooltips();
         }
     });

}); // End DOMContentLoaded
