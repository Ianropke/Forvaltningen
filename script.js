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
    }

    function removeAllStepHighlights() {
        workflowSteps.forEach(step => step.classList.remove('highlighted'));
        currentHighlightedStep = null;
         // Når ingen step er highlighted, nulstil CIMT ikonernes udseende
         resetCimtIconsOpacity();
    }

     function resetCimtIconsOpacity() {
        // Nulstil opacity for alle CIMT ikoner, hvis laget er synligt
        if (body.classList.contains('cimt-visible')) {
            cimtIcons.forEach(icon => {
                 // Sæt en grundlæggende nedtonet opacity, når intet specifikt er valgt
                icon.style.opacity = '0.6'; // Matcher CSS default
                icon.style.backgroundColor = 'rgba(200, 200, 200, 0.7)'; // Matcher CSS default
            });
        }
    }

     function highlightRelevantCimtIcons(stepId) {
        resetCimtIconsOpacity(); // Start med at nulstille alle
        if (body.classList.contains('cimt-visible') && stepId) {
            cimtIcons.forEach(icon => {
                const relevantSteps = icon.dataset.cimtRelevant || '';
                if (relevantSteps.includes(stepId)) {
                    icon.style.opacity = '1'; // Fuld synlighed
                    icon.style.backgroundColor = 'rgba(0, 123, 255, 0.2)'; // Fremhævningsfarve
                } else {
                    icon.style.opacity = '0.4'; // Gør irrelevante MERE nedtonede
                    icon.style.backgroundColor = 'rgba(200, 200, 200, 0.7)'; // Tilbage til default baggrund
                }
            });
        }
    }


    // --- Event Listeners ---

    // Knap til at vise/skjule CIMT laget
    toggleCimtButton.addEventListener('click', () => {
        body.classList.toggle('cimt-visible');
        if (body.classList.contains('cimt-visible')) {
            toggleCimtButton.textContent = 'Skjul CIMT Support';
            // Opdater CIMT ikonernes synlighed baseret på evt. allerede valgt step
            if (currentHighlightedStep) {
                 highlightRelevantCimtIcons(currentHighlightedStep.id);
            } else {
                 resetCimtIconsOpacity(); // Sørg for at alle er nedtonede hvis intet step er valgt
            }
        } else {
            toggleCimtButton.textContent = 'Vis CIMT Support';
            hideAllTooltips(); // Skjul tooltips når laget skjules
            // Nulstil opacity på ikonerne (selvom laget er usynligt, er det god praksis)
             cimtIcons.forEach(icon => {
                icon.style.opacity = ''; // Lad CSS styre igen
                icon.style.backgroundColor = ''; // Lad CSS styre igen
             });
        }
    });

    // Klik på workflow steps
    workflowSteps.forEach(step => {
        step.addEventListener('click', () => {
            const infoBoxId = step.dataset.infoTarget;
            const infoBox = document.getElementById(infoBoxId);
            const stepId = step.id;

            // Hvis man klikker på det allerede aktive step
            if (step === currentHighlightedStep) {
                hideAllInfoBoxes();
                removeAllStepHighlights();
                 highlightRelevantCimtIcons(null); // Nulstil CIMT highlights
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
                 // Opdater CIMT ikon highlights
                 highlightRelevantCimtIcons(stepId);
            }
        });

         // Tilføj keypress event for Enter/Space for tilgængelighed
         step.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                step.click(); // Simuler klik
                e.preventDefault(); // Undgå standard handling (fx scroll)
            }
        });
    });

    // Klik på CIMT ikoner
    cimtIcons.forEach(icon => {
        icon.addEventListener('click', (event) => {
            // Stop propagation for at forhindre evt. klik på underliggende elementer
             event.stopPropagation();

             // Gør kun noget hvis CIMT laget er synligt
            if (!body.classList.contains('cimt-visible')) {
                 return;
             }

            const tooltipId = icon.dataset.tooltipTarget;
            const tooltip = document.getElementById(tooltipId);

             // Hvis man klikker på ikonet for den allerede viste tooltip
             if (tooltip === currentVisibleTooltip) {
                hideAllTooltips();
                // Hvis det var Forvalter, fjern highlight med det samme
                if (icon.id === 'cimt-icon-forvaltning') {
                    clearTimeout(labkaHighlightTimeout);
                    labkaIcon.classList.remove('labka-highlight');
                }
             } else {
                // Skjul forrige tooltip og vis ny
                hideAllTooltips();

                if (tooltip) {
                    tooltip.classList.add('visible');
                    currentVisibleTooltip = tooltip;

                    // Special handling for Forvalter (LIMS) ikonet
                    if (icon.id === 'cimt-icon-forvaltning') {
                        // Ryd tidligere timeout hvis der klikkes hurtigt
                        clearTimeout(labkaHighlightTimeout);

                        labkaIcon.classList.add('labka-highlight');

                        // Sæt timeout til at fjerne highlight igen efter lidt tid
                        labkaHighlightTimeout = setTimeout(() => {
                            labkaIcon.classList.remove('labka-highlight');
                        }, 2000); // Fremhæv i 2 sekunder
                    } else {
                         // Hvis et andet ikon klikkes, fjern evt. eksisterende Labka highlight
                         clearTimeout(labkaHighlightTimeout);
                         labkaIcon.classList.remove('labka-highlight');
                    }
                } else {
                    // Hvis der ikke var et tooltip, sørg for at fjerne Labka highlight
                     clearTimeout(labkaHighlightTimeout);
                     labkaIcon.classList.remove('labka-highlight');
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

     // Klik udenfor popups for at lukke dem (simpel implementering)
     document.addEventListener('click', (event) => {
         // Luk info-boks hvis der klikkes udenfor et step eller en info-boks
         const clickedElement = event.target;
         if (!clickedElement.closest('.workflow-step') && !clickedElement.closest('.info-box') && currentVisibleInfoBox) {
              hideAllInfoBoxes();
              removeAllStepHighlights();
              highlightRelevantCimtIcons(null); // Nulstil CIMT highlights
         }

          // Luk tooltip hvis der klikkes udenfor et CIMT ikon eller en tooltip (og laget er synligt)
         if (body.classList.contains('cimt-visible') && !clickedElement.closest('.cimt-icon') && !clickedElement.closest('.tooltip') && currentVisibleTooltip) {
              hideAllTooltips();
              // Fjern Labka highlight hvis det var aktivt pga. Forvalter tooltip
              if (labkaIcon.classList.contains('labka-highlight')) {
                   clearTimeout(labkaHighlightTimeout);
                   labkaIcon.classList.remove('labka-highlight');
              }
         }
     });

}); // End DOMContentLoaded
