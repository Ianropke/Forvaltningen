document.addEventListener('DOMContentLoaded', () => {
    const toggleCimtButton = document.getElementById('toggle-cimt');
    const cimtLayer = document.getElementById('cimt-layer');
    const workflowSteps = document.querySelectorAll('.workflow-step');
    const infoBoxes = document.querySelectorAll('.info-box');
    const cimtIcons = document.querySelectorAll('.cimt-icon');
    const tooltips = document.querySelectorAll('.tooltip');
    const labkaIcon = document.getElementById('icon-labka');
    const body = document.body;

    let currentHighlightedStep = null;
    let currentVisibleInfoBox = null;
    let currentVisibleTooltip = null;
    let labkaHighlightTimeout = null;

    // --- Funktioner til at vise/skjule elementer ---

    function hideAllInfoBoxes() {
        infoBoxes.forEach(box => box.classList.remove('visible'));
        currentVisibleInfoBox = null;
    }

    function hideAllTooltips() {
        tooltips.forEach(tip => tip.classList.remove('visible'));
        currentVisibleTooltip = null;
         // Hvis en tooltip lukkes, og det var den der udløste Labka highlight, fjern highlight
         if (labkaIcon.classList.contains('labka-highlight')) {
             clearTimeout(labkaHighlightTimeout);
             labkaIcon.classList.remove('labka-highlight');
         }
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
            // Opdateret knaptekst
            toggleCimtButton.textContent = 'Skjul CIMT Understøttelse';
        } else {
            // Opdateret knaptekst
            toggleCimtButton.textContent = 'Vis CIMT Understøttelse';
            hideAllTooltips(); // Skjul tooltips når laget skjules
        }
    });

    // Klik på workflow steps
    workflowSteps.forEach(step => {
        step.addEventListener('click', () => {
            const infoBoxId = step.dataset.infoTarget;
            const infoBox = document.getElementById(infoBoxId);

            // Hvis man klikker på det allerede aktive step
            if (step === currentHighlightedStep) {
                hideAllInfoBoxes();
                removeAllStepHighlights();
            } else {
                // Skjul forrige og vis nye
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

         // Tilføj keypress event for Enter/Space for tilgængelighed
         step.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                step.click(); // Simuler klik
                e.preventDefault();
            }
        });
    });

    // Klik på CIMT ikoner (kun når laget er synligt - styres af CSS pointer-events)
    cimtIcons.forEach(icon => {
        icon.addEventListener('click', (event) => {
             event.stopPropagation(); // Undgå at lukke tooltip med det samme pga. body click listener

            const tooltipId = icon.dataset.tooltipTarget;
            const tooltip = document.getElementById(tooltipId);

             // Hvis man klikker på ikonet for den allerede viste tooltip
             if (tooltip && tooltip.classList.contains('visible')) {
                hideAllTooltips(); // Lukker den aktuelle tooltip
             } else {
                // Skjul forrige tooltip og vis ny
                hideAllTooltips();

                if (tooltip) {
                    tooltip.classList.add('visible');
                    currentVisibleTooltip = tooltip;

                    // Special handling for Forvalter (LIMS) ikonet
                    if (icon.id === 'cimt-icon-forvaltning') {
                        clearTimeout(labkaHighlightTimeout); // Ryd evt. gammel timer
                        labkaIcon.classList.add('labka-highlight');
                        labkaHighlightTimeout = setTimeout(() => {
                            labkaIcon.classList.remove('labka-highlight');
                        }, 2000); // Fremhæv i 2 sekunder
                    }
                    // Ingen grund til 'else' for at fjerne highlight her, da hideAllTooltips() nu håndterer det
                }
             }
        });

         // Tilføj keypress event for Enter/Space
         icon.addEventListener('keypress', (e) => {
             if (body.classList.contains('cimt-visible') && (e.key === 'Enter' || e.key === ' ')) {
                 icon.click(); // Simuler klik
                 e.preventDefault();
             }
         });
    });

     // Klik udenfor popups for at lukke dem
     document.addEventListener('click', (event) => {
         const clickedElement = event.target;

         // Luk info-boks hvis der klikkes udenfor et step eller en info-boks
         if (!clickedElement.closest('.workflow-step') && !clickedElement.closest('.info-box') && currentVisibleInfoBox) {
              hideAllInfoBoxes();
              removeAllStepHighlights();
         }

          // Luk tooltip hvis der klikkes udenfor et CIMT ikon eller en tooltip
          // Tjek om laget er synligt FØR vi lukker tooltips, for at undgå at lukke dem når man tænder for laget
         if (body.classList.contains('cimt-visible') && !clickedElement.closest('.cimt-icon') && !clickedElement.closest('.tooltip') && currentVisibleTooltip) {
              hideAllTooltips();
         }
     });

}); // End DOMContentLoaded
