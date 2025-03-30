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
    const tooltips = document.querySelectorAll('.tooltip'); // Bruges KUN til CIMT ikoner
    const body = document.body;

    // Modal elementer
    const modalOverlay = document.getElementById('modal-overlay');
    const modalContent = document.getElementById('modal-content'); // Til evt. scroll reset
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

     function hideModal() {
        if (modalOverlay && modalOverlay.classList.contains('visible')) {
             modalOverlay.classList.remove('visible');
        }
    }

    function hideAllInfoBoxes() {
        if (currentVisibleInfoBox) {
            infoBoxes.forEach(box => box.classList.remove('visible'));
            currentVisibleInfoBox = null;
        }
         hideModal(); // Skjul også modal hvis en infoboks vises
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
         removeAllLines(); // Fjern også altid linjer når tooltips skjules
         // Skjul ikke modal her, da den styres separat
    }

    function removeAllStepHighlights() {
        if (currentHighlightedStep) {
            workflowSteps.forEach(step => step.classList.remove('highlighted'));
            currentHighlightedStep = null;
        }
    }

    // Skjuler ALLE interaktive popups/overlays/highlights
    function hideAllInteractiveElements() {
         hideAllInfoBoxes(); // Skjuler også modal nu
         hideAllTooltips(); // Skjuler tooltips og linjer
         removeAllStepHighlights();
    }


    // Tegner KUN linjer for et specifikt CIMT ikon
    function drawLinesForIcon(iconElement) {
        removeAllLines(); // Fjern altid gamle linjer først
        if (!iconElement || !document.contains(iconElement) || !body.classList.contains('cimt-band-visible')) return;

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
                                const line = new LeaderLine(stepElement, iconElement, {...lineOptions});
                                activeLines.push(line);
                            } catch(e) { console.error(`Fejl ved tegning af linje fra ${stepId} til ${iconElement.id}:`, e); }
                         }
                    }
                }
            });
             // Genpositioner kort efter for at sikre korrekt placering med fluid
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
            hideModal(); // Skjul modal når trends bånd skjules
        }
    }

    function updateToggleButtonText(button, showText) {
        const baseText = showText.replace('Vis ', '');
        let bodyClassToCheck = (button === toggleCimtButton) ? 'cimt-band-visible' : 'trends-band-visible';
        button.textContent = body.classList.contains(bodyClassToCheck) ? `Skjul ${baseText}` : `Vis ${baseText}`;
    }

    // Debounce funktion (uændret)
    function debounce(func, wait, immediate) { /* ... uændret ... */ }

    // Håndterer resize (Nu kun for linjer - fjern evt. hvis unødvendigt)
    const handleResize = debounce(() => {
        if (body.classList.contains('cimt-band-visible') && activeLines.length > 0) {
            // Simplest: Bare fjern linjer ved resize, brugeren må klikke igen
             removeAllLines();
        }
    }, 250);


    // --- Event Listeners ---

    // Knap: Vis/Skjul CIMT bånd
    toggleCimtButton.addEventListener('click', () => {
        const becomingVisible = !body.classList.contains('cimt-band-visible');
        hideAllInteractiveElements(); // Skjul alt andet FØRST
        hideTrendsBand();

        if (becomingVisible) {
            body.classList.add('cimt-band-visible');
        }
        updateToggleButtonText(toggleCimtButton, 'Vis CIMT Understøttelse');
        updateToggleButtonText(toggleTrendsButton, 'Vis Tendenser/Risici');
    });

    // Knap: Vis/Skjul Tendens bånd
    toggleTrendsButton.addEventListener('click', () => {
        const becomingVisible = !body.classList.contains('trends-band-visible');
        hideAllInteractiveElements(); // Skjul alt andet FØRST
        hideCimtBand();

        if (becomingVisible) {
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
                hideAllInfoBoxes(); // Inkluderer hideModal()
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
            if (e.key === 'Enter' || e.key === ' ') { step.click(); e.preventDefault(); }
         });
    });

    // Klik på ikoner i BEGGE bånd (fælles listener - RETTET LOGIK)
    allIcons.forEach(icon => {
        icon.addEventListener('click', (event) => {
             event.stopPropagation();

             const parentCimtBand = icon.closest('#cimt-band');
             const parentTrendsBand = icon.closest('#trends-band');
             const isCimtVisible = parentCimtBand && body.classList.contains('cimt-band-visible');
             const isTrendsVisible = parentTrendsBand && body.classList.contains('trends-band-visible');

             if (!isCimtVisible && !isTrendsVisible) return;

             // Skjul altid info-bokse og step highlights
             hideAllInfoBoxes();
             removeAllStepHighlights();
             // Skjul tooltips/linjer eller modal specifikt nedenfor

             if (isTrendsVisible && parentTrendsBand) {
                 // *** TRENDS IKON -> VIS MODAL ***
                 hideAllTooltips(); // Skjul evt. CIMT tooltips/linjer

                 const title = icon.querySelector('.cimt-icon-title')?.textContent || 'Tendens/Risiko';
                 const description = icon.dataset.description || 'Ingen beskrivelse.';
                 const examplesRaw = icon.dataset.examples || '';
                 const examplesHtml = examplesRaw.split('<br>')
                                          .map(ex => ex.trim()).filter(ex => ex)
                                          .map(ex => `<li>${ex}</li>`).join('');

                 modalTitle.textContent = title;
                 modalDescription.textContent = description;
                 if (examplesHtml) {
                    modalExamples.innerHTML = `<h3>Eksempler i Workflow:</h3><ul>${examplesHtml}</ul>`;
                 } else {
                    modalExamples.innerHTML = '';
                 }
                 if(modalContent) modalContent.scrollTop = 0;
                 modalOverlay.classList.add('visible');
                 currentVisibleTooltip = null; // Nulstil tooltip status

             } else if (isCimtVisible && parentCimtBand) {
                 // *** CIMT IKON -> VIS TOOLTIP + LINJER ***
                 hideModal(); // Skjul evt. modal

                 const tooltipId = icon.dataset.tooltipTarget;
                 const tooltip = document.getElementById(tooltipId);
                 const isCurrentTooltip = tooltip && tooltip.classList.contains('visible');

                 // Altid fjern gamle linjer/tooltips FØR der vises nyt
                 hideAllTooltips(); // Inkluderer removeAllLines()

                 if (!isCurrentTooltip && tooltip) {
                     // Vis ny tooltip OG tegn linjer
                     tooltip.classList.add('visible');
                     currentVisibleTooltip = tooltip;
                     drawLinesForIcon(icon);
                 }
                 // Hvis tooltip var synlig, er den + linjer allerede fjernet
             }
        });

         icon.addEventListener('keypress', (e) => {
             if ((e.key === 'Enter' || e.key === ' ')) { icon.click(); e.preventDefault(); }
         });
    });

     // Luk Modal
     if (modalOverlay && modalCloseBtn) {
        modalCloseBtn.addEventListener('click', hideModal);
        modalOverlay.addEventListener('click', (event) => {
            if (event.target === modalOverlay) { hideModal(); }
        });
     }

     // Klik udenfor popups/tooltips for at lukke dem
     document.addEventListener('click', (event) => {
         const clickedElement = event.target;

         // Luk info-boks
         if (!clickedElement.closest('.workflow-step') && !clickedElement.closest('.info-box-container') && currentVisibleInfoBox) {
              hideAllInfoBoxes(); // Inkluderer hideModal()
              removeAllStepHighlights();
         }

          // Luk aktiv tooltip (og fjern linjer)
         if (currentVisibleTooltip && !clickedElement.closest('.cimt-icon')) {
              if (!clickedElement.closest('#cimt-band') && !clickedElement.closest('#trends-band')) {
                   hideAllTooltips();
              }
         }
         // Modal lukkes af sin egen listener eller hideAllInfoBoxes()
     });

     // Lyt efter resize for at fjerne linjer
     window.addEventListener('resize', handleResize);

     // Initial opdatering af knaptekster
     updateToggleButtonText(toggleCimtButton, 'Vis CIMT Understøttelse');
     updateToggleButtonText(toggleTrendsButton, 'Vis Tendenser/Risici');

}); // End DOMContentLoaded
