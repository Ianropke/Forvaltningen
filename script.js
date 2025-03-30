document.addEventListener('DOMContentLoaded', () => {
    // Knapper
    const toggleCimtButton = document.getElementById('toggle-cimt');
    const toggleTrendsButton = document.getElementById('toggle-trends');

    // Containere / Lag
    const cimtBand = document.getElementById('cimt-band');
    const trendsBand = document.getElementById('trends-band');
    const workflowSteps = document.querySelectorAll('.workflow-step');
    const infoBoxes = document.querySelectorAll('.info-box');
    const allIcons = document.querySelectorAll('.cimt-icon'); // Fælles klasse for alle ikoner
    const tooltips = document.querySelectorAll('.tooltip'); // Kun for CIMT ikoner nu
    const body = document.body;

    // Modal elementer
    const modalOverlay = document.getElementById('modal-overlay');
    const modalTitle = document.getElementById('modal-title');
    const modalDescription = document.getElementById('modal-description');
    const modalExamples = document.getElementById('modal-examples');
    const modalCloseBtn = document.getElementById('modal-close-btn');

    // Status variable
    let currentHighlightedStep = null;
    let currentVisibleInfoBox = null;
    let currentVisibleTooltip = null;
    let activeLines = []; // Til LeaderLine instanser

    // --- LeaderLine Options ---
    const lineOptions = {
        color: 'rgba(120, 120, 120, 0.5)',
        size: 2,
        path: 'fluid',
        startSocket: 'bottom',
        endSocket: 'top',
    };

    // --- Funktioner ---

    function hideAllInfoBoxes() {
        if (currentVisibleInfoBox) {
            infoBoxes.forEach(box => box.classList.remove('visible'));
            currentVisibleInfoBox = null;
        }
    }

    function removeAllLines() {
        activeLines.forEach(line => { try { line.remove(); } catch (e) {} });
        activeLines = [];
    }

    function hideAllTooltips() {
        if (currentVisibleTooltip) {
            tooltips.forEach(tip => tip.classList.remove('visible'));
            currentVisibleTooltip = null;
        }
        removeAllLines(); // Fjern linjer når tooltips skjules
    }

    function removeAllStepHighlights() {
        if (currentHighlightedStep) {
            workflowSteps.forEach(step => step.classList.remove('highlighted'));
            currentHighlightedStep = null;
        }
    }

    function hideModal() {
        if (modalOverlay && modalOverlay.classList.contains('visible')) {
             modalOverlay.classList.remove('visible');
        }
    }

    // Skjuler ALLE popups/overlays/highlights
    function hideAllInteractiveElements() {
         hideAllInfoBoxes();
         hideAllTooltips(); // Inkluderer removeAllLines()
         removeAllStepHighlights();
         hideModal();
    }

    // Tegner KUN linjer for et specifikt CIMT ikon
    function drawLinesForIcon(iconElement) {
        removeAllLines(); // Fjern altid gamle linjer først
        if (!iconElement || !document.contains(iconElement) || !body.classList.contains('cimt-band-visible')) return;

        const relevantStepsStr = iconElement.dataset.cimtRelevant || '';
        const relevantSteps = relevantStepsStr.split(' ');

        requestAnimationFrame(() => {
            relevantSteps.forEach(stepId => {
                if (stepId) {
                    const stepElement = document.getElementById(stepId);
                    if (stepElement && document.contains(stepElement)) {
                         const stepStyle = window.getComputedStyle(stepElement);
                         const iconStyle = window.getComputedStyle(iconElement);
                         if (stepStyle.display !== 'none' && iconStyle.display !== 'none') {
                            try {
                                const line = new LeaderLine(stepElement, iconElement, {...lineOptions}); // Kopi af options
                                activeLines.push(line);
                            } catch(e) { console.error(`Fejl ved tegning af linje fra ${stepId} til ${iconElement.id}:`, e); }
                         }
                    }
                }
            });
             setTimeout(() => { activeLines.forEach(l => { try { l.position(); } catch(e){} }); }, 50);
        });
    }

    function hideCimtBand() {
        if (body.classList.contains('cimt-band-visible')) {
            body.classList.remove('cimt-band-visible');
            updateToggleButtonText(toggleCimtButton, 'Vis CIMT Understøttelse');
            hideAllTooltips(); // Skjuler også linjer
        }
    }

    function hideTrendsBand() {
        if (body.classList.contains('trends-band-visible')) {
            body.classList.remove('trends-band-visible');
            updateToggleButtonText(toggleTrendsButton, 'Vis Tendenser/Risici');
            // Ingen linjer at fjerne, men skjul evt. åben modal
            hideModal();
        }
    }

    function updateToggleButtonText(button, showText) {
        const baseText = showText.replace('Vis ', '');
        let bodyClassToCheck = (button === toggleCimtButton) ? 'cimt-band-visible' : 'trends-band-visible';
        button.textContent = body.classList.contains(bodyClassToCheck) ? `Skjul ${baseText}` : `Vis ${baseText}`;
    }

    // --- Event Listeners ---

    // Knap: Vis/Skjul CIMT bånd
    toggleCimtButton.addEventListener('click', () => {
        const becomingVisible = !body.classList.contains('cimt-band-visible');
        hideAllInteractiveElements(); // Skjul alt andet først
        hideTrendsBand(); // Sørg for at trends band er skjult

        if (becomingVisible) {
            body.classList.add('cimt-band-visible');
            // Linjer tegnes ved ikon-klik
        }
        // Opdater begge knapper
        updateToggleButtonText(toggleCimtButton, 'Vis CIMT Understøttelse');
        updateToggleButtonText(toggleTrendsButton, 'Vis Tendenser/Risici');
    });

    // Knap: Vis/Skjul Tendens bånd
    toggleTrendsButton.addEventListener('click', () => {
        const becomingVisible = !body.classList.contains('trends-band-visible');
        hideAllInteractiveElements(); // Skjul alt andet først
        hideCimtBand(); // Sørg for at CIMT band er skjult

        if (becomingVisible) {
            body.classList.add('trends-band-visible');
        }
        // Opdater begge knapper
        updateToggleButtonText(toggleTrendsButton, 'Vis Tendenser/Risici');
        updateToggleButtonText(toggleCimtButton, 'Vis CIMT Understøttelse');
    });


    // Klik på workflow steps
    workflowSteps.forEach(step => {
        step.addEventListener('click', () => {
            const infoBoxId = step.dataset.infoTarget;
            const infoBox = document.getElementById(infoBoxId);

            // Skjul BEGGE bånd (og dermed linjer/tooltips/modal)
            hideCimtBand();
            hideTrendsBand();
            // hideAllInteractiveElements() kaldes implicit næsten

            if (step === currentHighlightedStep) {
                hideAllInfoBoxes();
                removeAllStepHighlights();
            } else {
                hideAllInfoBoxes(); // Skjul forrige info-boks
                removeAllStepHighlights(); // Fjern forrige highlight

                step.classList.add('highlighted');
                currentHighlightedStep = step;

                if (infoBox) {
                    infoBox.classList.add('visible');
                    currentVisibleInfoBox = infoBox;
                }
            }
        });

         step.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' || e.key === ' ') { step.click(); e.preventDefault(); }
         });
    });

    // Klik på ikoner i BEGGE bånd (fælles listener)
    allIcons.forEach(icon => {
        icon.addEventListener('click', (event) => {
             event.stopPropagation();

             const parentCimtBand = icon.closest('#cimt-band');
             const parentTrendsBand = icon.closest('#trends-band');
             const isCimtIcon = parentCimtBand && body.classList.contains('cimt-band-visible');
             const isTrendsIcon = parentTrendsBand && body.classList.contains('trends-band-visible');

             if (!isCimtIcon && !isTrendsIcon) return; // Gør intet hvis forkert bånd er aktivt

             // Skjul andre UI elementer før vi viser nyt
             hideAllInfoBoxes();
             removeAllStepHighlights();
             // Tooltips/linjer skjules specifikt nedenfor

             if (isCimtIcon) {
                 // Håndter CIMT ikon: Vis tooltip og tegn linjer
                 const tooltipId = icon.dataset.tooltipTarget;
                 const tooltip = document.getElementById(tooltipId);
                 const isCurrentTooltip = tooltip && tooltip.classList.contains('visible');

                 hideAllTooltips(); // Fjerner også linjer

                 if (!isCurrentTooltip) {
                     if (tooltip) {
                         tooltip.classList.add('visible');
                         currentVisibleTooltip = tooltip;
                     }
                     drawLinesForIcon(icon);
                 }
             } else if (isTrendsIcon) {
                 // Håndter Trend ikon: Vis modal
                 hideAllTooltips(); // Sørg for at evt. CIMT tooltips/linjer er væk

                 const title = icon.querySelector('.cimt-icon-title')?.textContent || 'Tendens/Risiko';
                 const description = icon.dataset.description || 'Ingen beskrivelse.';
                 const examplesRaw = icon.dataset.examples || '';
                 const examplesHtml = examplesRaw.split('<br>').map(ex => ex.trim() ? `<li>${ex.trim()}</li>` : '').join('');

                 modalTitle.textContent = title;
                 modalDescription.textContent = description;
                 if (examplesHtml) {
                    modalExamples.innerHTML = `<h3>Eksempler i Workflow:</h3><ul>${examplesHtml}</ul>`;
                 } else {
                    modalExamples.innerHTML = ''; // Ingen eksempler
                 }

                 modalOverlay.classList.add('visible');
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

     // Luk Modal
     if (modalOverlay && modalCloseBtn) {
        modalCloseBtn.addEventListener('click', hideModal);
        modalOverlay.addEventListener('click', (event) => {
            // Luk kun hvis der klikkes på selve overlay'et, ikke indholdet
            if (event.target === modalOverlay) {
                hideModal();
            }
        });
     }

     // Klik udenfor (Generel lukning)
     document.addEventListener('click', (event) => {
         const clickedElement = event.target;

         // Luk info-boks
         if (!clickedElement.closest('.workflow-step') && !clickedElement.closest('.info-box-container') && currentVisibleInfoBox) {
              hideAllInfoBoxes();
              removeAllStepHighlights();
         }

          // Luk aktiv tooltip (og fjern linjer) hvis der klikkes udenfor ikonerne i det aktive bånd
         if (currentVisibleTooltip && !clickedElement.closest('.cimt-icon')) {
              if ((body.classList.contains('cimt-band-visible') && !clickedElement.closest('#cimt-band')) ||
                  (body.classList.contains('trends-band-visible') && !clickedElement.closest('#trends-band'))) {
                   hideAllTooltips();
              }
         }
         // Modal lukkes af sin egen listener
     });

     // Initial opdatering af knaptekster
     updateToggleButtonText(toggleCimtButton, 'Vis CIMT Understøttelse');
     updateToggleButtonText(toggleTrendsButton, 'Vis Tendenser/Risici');

}); // End DOMContentLoaded
