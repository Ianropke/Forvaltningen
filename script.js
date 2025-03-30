document.addEventListener('DOMContentLoaded', () => {
    // Knapper
    const toggleCimtButton = document.getElementById('toggle-cimt');
    const toggleTrendsButton = document.getElementById('toggle-trends');
    const toggleSignificanceButton = document.getElementById('toggle-significance');

    // Containere / Lag
    const cimtBand = document.getElementById('cimt-band');
    const trendsBand = document.getElementById('trends-band');
    const workflowSteps = document.querySelectorAll('.workflow-step');
    const workflowLayer = document.getElementById('workflow-layer');
    const infoBoxContainer = document.querySelector('.info-box-container');
    const infoBoxes = document.querySelectorAll('.info-box:not(#info-significance)'); // Alle standard info bokse
    const significanceInfoBox = document.getElementById('info-significance');
    const allIcons = document.querySelectorAll('.cimt-icon'); // Alle ikoner (CIMT + Trends)
    const allCimtIcons = document.querySelectorAll('#cimt-band .cimt-icon');
    const trendIcons = document.querySelectorAll('#trends-band .cimt-icon');
    const tooltips = document.querySelectorAll('#cimt-band .tooltip'); // Kun CIMT tooltips
    const body = document.body;
    const fadeableWorkflowSteps = document.querySelectorAll('#workflow-layer .workflow-step'); // Kun workflow steps til fade
    const fadeableCimtIcons = document.querySelectorAll('#cimt-band .cimt-icon'); // Kun CIMT ikoner til fade
    const dynamicTooltipContainer = document.getElementById('dynamic-tooltip-container'); // Til trend eksempler

    // Elementer og state for 'Betydning' visualisering
    const significanceListItems = significanceInfoBox?.querySelectorAll('li[data-visual]');
    const priorityNumberElements = document.querySelectorAll('.priority-number');
    const riskMarkers = document.querySelectorAll('.risk-marker');
    const trendIndicators = document.querySelectorAll('.trend-indicator'); // NYT
    let activeSignificanceVisual = null;
    let unifiedEffortLine = null;

    // State variable
    let activeLines = [];
    let currentVisibleInfoBox = null;
    let currentHighlightedStep = null;
    let currentVisibleTooltip = null;
    let currentTrendFocusIcon = null; // NYT: Holder det aktive trend ikon
    let currentCimtFocusIcon = null; // NYT: Holder det aktive CIMT ikon (ift fade)
    let currentTrendExampleTooltip = null; // NYT: Holder det dynamiske trend tooltip

    // LeaderLine Options
    const defaultLineOptions = { color: 'rgba(120, 120, 120, 0.5)', size: 2, path: 'fluid', startSocket: 'bottom', endSocket: 'top' };
    // Opdateret "almindelig" pil
    const unifiedLineOptions = {
        color: 'rgba(0, 95, 96, 0.7)',
        size: 4, // Tyndere pil
        path: 'arc', // Tilbage til bue
        endPlug: 'arrow1', // Enkel standard pilespids
        endPlugSize: 1.5, // Standard pilespids størrelse
        // Ingen socket offsets
    };


    // --- Funktioner ---

    // NYT: Funktion til at rydde CIMT Fokus (fade)
    function clearCimtFocus() {
        if (body.classList.contains('cimt-focus-active')) {
            body.classList.remove('cimt-focus-active');
            fadeableWorkflowSteps.forEach(el => el.classList.remove('relevant-for-cimt'));
            currentCimtFocusIcon = null;
        }
    }

    // Opdateret clearTrendFocus til også at fjerne trend indikator ikoner
    function clearTrendFocus() {
        if (body.classList.contains('trend-focus-active')) {
            body.classList.remove('trend-focus-active');
            // Fjern relevant-klassen fra alle fadeable elementer
            fadeableWorkflowSteps.forEach(el => el.classList.remove('relevant-for-trend'));
            fadeableCimtIcons.forEach(el => el.classList.remove('relevant-for-trend'));
            // Skjul trend indikator ikoner
            trendIndicators.forEach(indicator => indicator.classList.remove('visible'));
            // Skjul evt. åben trend eksempel tooltip
            hideTrendExampleTooltip();
            currentTrendFocusIcon = null;
            // Sørg for at knapperne er opdaterede
            updateAllButtonTexts();
        }
    }

    // Opdateret hideAllWorkflow... til at rydde begge typer fokus
    function hideAllWorkflowAndSignificanceInfoBoxes() {
        let wasVisible = false;
        infoBoxes.forEach(box => { if (box.classList.contains('visible')) { box.classList.remove('visible'); wasVisible = true; } });
        if (significanceInfoBox?.classList.contains('visible')) { significanceInfoBox.classList.remove('visible'); wasVisible = true; hideAllSignificanceVisuals(); }
        // Ryd OGSÅ trend fokus (som nu ikke har en info boks)
        clearTrendFocus();
        // Nulstil kun hvis det var en standard workflow boks der var synlig
        if (wasVisible && currentVisibleInfoBox !== significanceInfoBox) {
            currentVisibleInfoBox = null;
        }
    }

    function removeAllLines() {
        activeLines.forEach(line => { try { line.remove(); } catch (e) {} });
        activeLines = [];
        hideUnifiedEffortLine();
    }

    // Opdateret hideAllTooltips til at rydde CIMT fokus
    function hideAllTooltips() {
        let wasVisible = false;
        tooltips.forEach(tip => { if (tip.classList.contains('visible')) { tip.classList.remove('visible'); wasVisible = true; } });
        if (wasVisible) {
             removeAllLines(); // Fjerner også unified line hvis den er der
             clearCimtFocus(); // <<< NYT: Ryd CIMT fade effekt når tooltip lukkes
             currentVisibleTooltip = null;
        }
    }

    function removeAllStepHighlights() {
        let wasVisible = false;
        workflowSteps.forEach(step => { if (step.classList.contains('highlighted')) { step.classList.remove('highlighted'); wasVisible = true; } });
        if (wasVisible) currentHighlightedStep = null;
    }

    function drawLinesForIcon(iconElement) {
        if (!iconElement || !document.contains(iconElement) || !body.classList.contains('cimt-band-visible')) return;
        const relevantStepsStr = iconElement.dataset.cimtRelevant || '';
        const relevantSteps = relevantStepsStr.split(' ');
        relevantSteps.forEach(stepId => {
            if (stepId) {
                const stepElement = document.getElementById(stepId);
                if (stepElement && document.contains(stepElement) && document.contains(iconElement)) {
                    try { const line = new LeaderLine(stepElement, iconElement, {...defaultLineOptions}); if (line) activeLines.push(line); }
                    catch(e) { console.error(`Error drawing line from ${stepId} to ${iconElement.id}:`, e); }
                }
            }
        });
    }

    // --- Funktioner til 'Betydning' Visualiseringer ---
    function hidePriorityNumbers() { priorityNumberElements.forEach(el => el.classList.remove('visible')); }
    function showPriorityNumbers() { hideAllSignificanceVisuals(); priorityNumberElements.forEach(el => el.classList.add('visible')); activeSignificanceVisual = 'priority'; }
    function hideUnifiedEffortLine() { if (unifiedEffortLine) { try { unifiedEffortLine.remove(); } catch(e) {} unifiedEffortLine = null; } }

    // Opdateret for ramme logik og pil options
    function showUnifiedEffortLine() {
        hideAllSignificanceVisuals(); hideAllTooltips();
        const startElement = infoBoxContainer; const endElement = workflowLayer;
        if (startElement && endElement && document.contains(startElement) && document.contains(endElement)) {
            workflowLayer?.classList.add('workflow-frame-active');
            try { unifiedEffortLine = new LeaderLine( startElement, endElement, {...unifiedLineOptions}); activeSignificanceVisual = 'unified'; } // Brug opdaterede options
            catch (e) { console.error("Error drawing unified effort line:", e); workflowLayer?.classList.remove('workflow-frame-active'); hideUnifiedEffortLine(); }
        } else { console.error("Cannot draw unified line: start or end element not found/visible."); }
    }
    function hideRiskMarkers() { riskMarkers.forEach(marker => marker.classList.remove('visible')); }
    function showRiskMarkers() { hideAllSignificanceVisuals(); riskMarkers.forEach(marker => marker.classList.add('visible')); activeSignificanceVisual = 'risk'; }

    // Opdateret hideAllSignificanceVisuals til at rydde alt
    function hideAllSignificanceVisuals() {
        hidePriorityNumbers();
        hideUnifiedEffortLine();
        hideRiskMarkers();
        workflowLayer?.classList.remove('workflow-frame-active');
        significanceListItems?.forEach(li => li.classList.remove('active-visual'));
        activeSignificanceVisual = null;
    }

    // --- NYT: Funktioner til Trend Eksempel Tooltips ---
    function hideTrendExampleTooltip() {
        if (currentTrendExampleTooltip) {
            currentTrendExampleTooltip.remove(); // Fjern elementet fra DOM
            currentTrendExampleTooltip = null;
        }
    }

    function showTrendExampleTooltip(stepElement, text) {
        hideTrendExampleTooltip(); // Skjul evt. tidligere

        if (!text || !stepElement || !dynamicTooltipContainer) return;

        const tooltipEl = document.createElement('div');
        tooltipEl.className = 'trend-example-tooltip';
        tooltipEl.textContent = text;

        dynamicTooltipContainer.appendChild(tooltipEl);

        // Positioner tooltip ved siden af stepElement (lidt til højre og over)
        const stepRect = stepElement.getBoundingClientRect();
        const containerRect = dynamicTooltipContainer.getBoundingClientRect(); // Eller infographic-container

        // Beregn position relativt til containeren
        let top = stepRect.top - containerRect.top - (tooltipEl.offsetHeight / 2) + (stepRect.height / 2) ;
        let left = stepRect.right - containerRect.left + 10; // 10px til højre for step

         // Juster hvis tooltip går uden for containeren
         tooltipEl.style.position = 'absolute'; // Skal sættes før offsetHeight/Width virker pålideligt
         tooltipEl.offsetHeight; // Force reflow to get height

         top = stepRect.top - containerRect.top - (tooltipEl.offsetHeight / 2) + (stepRect.height / 2) ; // Genberegn top
         if (left + tooltipEl.offsetWidth > containerRect.width - 10) {
             left = stepRect.left - containerRect.left - tooltipEl.offsetWidth - 10; // Placer til venstre i stedet
         }
          if (top < 0) {
              top = 5; // Undgå at gå over toppen
          }
          if (top + tooltipEl.offsetHeight > containerRect.height) {
               top = containerRect.height - tooltipEl.offsetHeight - 5; // Undgå at gå under bunden
          }


        tooltipEl.style.top = `${top}px`;
        tooltipEl.style.left = `${left}px`;

        // Gør den synlig med lille forsinkelse
        setTimeout(() => {
             if (dynamicTooltipContainer.contains(tooltipEl)) { // Tjek om den stadig skal vises
                 tooltipEl.classList.add('visible');
             }
        }, 50); // Kort delay

        currentTrendExampleTooltip = tooltipEl;
    }


    // --- Opdaterede Event Listeners ---

    function updateAllButtonTexts() {
        if (toggleCimtButton) { toggleCimtButton.textContent = body.classList.contains('cimt-band-visible') ? 'Skjul CIMT Understøttelse' : 'Vis CIMT Understøttelse'; }
        if (toggleTrendsButton) { toggleTrendsButton.textContent = body.classList.contains('trends-band-visible') ? 'Skjul Tendenser/Risici' : 'Vis Tendenser/Risici'; }
        if (toggleSignificanceButton) { toggleSignificanceButton.textContent = significanceInfoBox?.classList.contains('visible') ? 'Skjul Betydning for CIMT' : 'Vis Betydning for CIMT'; }
    }

    const handleResize = debounce(() => {
        removeAllLines();
        workflowLayer?.classList.remove('workflow-frame-active');
        clearTrendFocus(); // Ryd også trend fokus ved resize
        clearCimtFocus(); // Ryd også CIMT fokus ved resize
        hideTrendExampleTooltip(); // Skjul tooltip ved resize
        }, 250);


    if (toggleCimtButton) {
        toggleCimtButton.addEventListener('click', () => {
            const shouldShow = !body.classList.contains('cimt-band-visible');
            clearTrendFocus();
            hideAllWorkflowAndSignificanceInfoBoxes();
            removeAllStepHighlights();
            body.classList.remove('trends-band-visible');
            clearCimtFocus(); // Ryd evt. CIMT fokus FØR til/fra-kobling

            if (shouldShow) { body.classList.add('cimt-band-visible'); }
            else { body.classList.remove('cimt-band-visible'); hideAllTooltips(); } // hideAllTooltips kalder nu clearCimtFocus
            updateAllButtonTexts();
        });
    }

    if (toggleTrendsButton) {
        toggleTrendsButton.addEventListener('click', () => {
            const shouldShow = !body.classList.contains('trends-band-visible');
            hideAllWorkflowAndSignificanceInfoBoxes();
            hideAllTooltips(); // Rydder også CIMT fokus
            removeAllStepHighlights();
            body.classList.remove('cimt-band-visible');

            if (shouldShow) { body.classList.add('trends-band-visible'); }
            else { body.classList.remove('trends-band-visible'); clearTrendFocus(); } // Ryd trend fokus når båndet skjules
            updateAllButtonTexts();
        });
    }

     if (toggleSignificanceButton && significanceInfoBox) {
        toggleSignificanceButton.addEventListener('click', () => {
            const shouldShow = !significanceInfoBox.classList.contains('visible');
            clearTrendFocus();
            clearCimtFocus(); // Ryd CIMT fokus
            hideAllTooltips();
            removeAllStepHighlights();
            body.classList.remove('cimt-band-visible'); body.classList.remove('trends-band-visible');
            infoBoxes.forEach(box => box.classList.remove('visible'));

            if (shouldShow) { significanceInfoBox.classList.add('visible'); currentVisibleInfoBox = significanceInfoBox; }
            else { significanceInfoBox.classList.remove('visible'); hideAllSignificanceVisuals(); currentVisibleInfoBox = null; }
            updateAllButtonTexts();
        });
     }

    workflowSteps.forEach(step => {
        step.addEventListener('click', () => {
            const infoBoxId = step.dataset.infoTarget; const targetInfoBox = document.getElementById(infoBoxId);
            clearTrendFocus();
            clearCimtFocus(); // Ryd CIMT fokus
            hideAllTooltips();
            hideAllWorkflowAndSignificanceInfoBoxes();
            body.classList.remove('cimt-band-visible'); body.classList.remove('trends-band-visible');

            if (step === currentHighlightedStep) { removeAllStepHighlights(); }
            else { removeAllStepHighlights(); step.classList.add('highlighted'); currentHighlightedStep = step; if (targetInfoBox) { targetInfoBox.classList.add('visible'); currentVisibleInfoBox = targetInfoBox; } }
            updateAllButtonTexts();
        });
        step.addEventListener('keypress', (e) => { if (e.key === 'Enter' || e.key === ' ') { step.click(); }});

        // NYT: Hover listener for trend eksempler
        step.addEventListener('mouseover', () => {
            if (body.classList.contains('trend-focus-active') && step.classList.contains('relevant-for-trend') && currentTrendFocusIcon) {
                const examplesMapStr = currentTrendFocusIcon.dataset.examplesMap;
                const stepId = step.id;
                if (examplesMapStr && stepId) {
                    try {
                        const examplesMap = JSON.parse(examplesMapStr.replace(/'/g, '"')); // Erstatter ' med " for valid JSON
                        const exampleText = examplesMap[stepId] || examplesMap["Generelt"] || null; // Find specifik eller generel tekst
                        if (exampleText) {
                            showTrendExampleTooltip(step, exampleText);
                        }
                    } catch (e) {
                        console.error("Error parsing data-examples-map JSON:", e, examplesMapStr);
                    }
                }
            }
        });
        step.addEventListener('mouseout', () => {
             // Skjul tooltip når musen forlader step, med lille delay så man kan ramme tooltip hvis den skulle blive interaktiv
             setTimeout(hideTrendExampleTooltip, 100);
        });

    });

    // Opdateret CIMT ikon listener til at håndtere fade
    allCimtIcons.forEach(icon => {
        icon.addEventListener('click', (event) => {
            event.stopPropagation();
            if (!body.classList.contains('cimt-band-visible')) return;

            const iconId = icon.id;
            const isClickingActiveCimt = iconId && iconId === currentCimtFocusIcon;

            hideAllWorkflowAndSignificanceInfoBoxes();
            removeAllStepHighlights();
            clearTrendFocus();
            // Ryd tidligere CIMT fokus før evt. nyt sættes (eller tooltip lukkes)
            clearCimtFocus(); // Kaldes af hideAllTooltips hvis en var åben, ellers her
            hideAllTooltips(); // Skjul altid andre tooltips

            if (!isClickingActiveCimt) {
                 const tooltipId = icon.dataset.tooltipTarget;
                 const tooltip = document.getElementById(tooltipId);
                 if (tooltip) {
                     // Sæt nyt CIMT fokus
                     currentCimtFocusIcon = iconId;
                     body.classList.add('cimt-focus-active');

                     // Find og marker relevante steps
                     const relevantSteps = icon.dataset.cimtRelevant?.split(' ') || [];
                     fadeableWorkflowSteps.forEach(el => {
                         if (relevantSteps.includes(el.id)) {
                             el.classList.add('relevant-for-cimt');
                         }
                     });

                     // Vis tooltip og linjer
                     tooltip.classList.add('visible');
                     currentVisibleTooltip = tooltip;
                     drawLinesForIcon(icon);
                 }
            }
            // Hvis man klikkede på aktivt ikon, har clearCimtFocus/hideAllTooltips ryddet op.
        });
        icon.addEventListener('keypress', (e) => { if (e.key === 'Enter' || e.key === ' ') { icon.click(); } });
    });

    // Opdateret Trend ikon listener (fjerner info box, tilføjer indikator-visning)
    trendIcons.forEach(icon => {
         icon.addEventListener('click', (event) => {
            event.stopPropagation();
            if (!body.classList.contains('trends-band-visible')) return;

            const trendId = icon.id;
            const isClickingActiveTrend = trendId && trendId === currentTrendFocusIcon?.id; // Sammenlign ID

            // Ryd ALTID andre visninger
            hideAllWorkflowAndSignificanceInfoBoxes(); // Skjuler også evt. gammel #info-trend
            hideAllTooltips(); // Rydder også CIMT fokus
            removeAllStepHighlights();
            // Ryd tidligere trend fokus før evt. nyt sættes
            clearTrendFocus();

            if (!isClickingActiveTrend && trendId) {
                // Sæt nyt trend fokus
                currentTrendFocusIcon = icon; // Gem referencen til ikonet
                body.classList.add('trend-focus-active');

                // Find og marker relevante elementer (både steps og CIMT ikoner)
                const relevantSteps = icon.dataset.relevantSteps?.split(' ') || [];
                const relevantCimt = icon.dataset.relevantCimt?.split(' ') || [];

                fadeableWorkflowSteps.forEach(el => {
                    if (relevantSteps.includes(el.id)) {
                        el.classList.add('relevant-for-trend');
                    }
                });
                 fadeableCimtIcons.forEach(el => {
                    if (relevantCimt.includes(el.id)) {
                        el.classList.add('relevant-for-trend');
                    }
                });

                 // Vis de relevante trend indikator ikoner på workflow steps
                 trendIndicators.forEach(indicator => {
                     const parentStep = indicator.closest('.workflow-step');
                     // Tjek om indikatoren har en klasse der matcher trendId (fx 'trend-icon-tech' hvis trendId='trend-tech')
                     // OG om parent step er relevant
                     if (indicator.classList.contains(`trend-icon-${trendId.replace('trend-', '')}`) && parentStep?.classList.contains('relevant-for-trend')) {
                          indicator.classList.add('visible');
                     }
                 });

            }
            // Hvis man klikkede på aktiv trend, har clearTrendFocus() allerede ryddet op.
            updateAllButtonTexts(); // Opdater knapper
         });
         icon.addEventListener('keypress', (e) => { if (e.key === 'Enter' || e.key === ' ') { icon.click(); } });
    });


    // Listener for Betydning List Items (uændret)
    if (significanceListItems) {
        significanceListItems.forEach(item => {
            item.addEventListener('click', (event) => {
                event.stopPropagation(); const visualType = item.dataset.visual;
                if (visualType === activeSignificanceVisual) { hideAllSignificanceVisuals(); }
                else { hideAllSignificanceVisuals(); switch (visualType) { case 'priority': showPriorityNumbers(); break; case 'unified': showUnifiedEffortLine(); break; case 'risk': showRiskMarkers(); break; default: console.warn("Unknown visual type:", visualType); } item.classList.add('active-visual'); }
            });
            item.addEventListener('keypress', (e) => { if (e.key === 'Enter' || e.key === ' ') { item.click(); } });
        });
    }

     // Global click listener (opdateret til at rydde begge fokus modes)
     document.addEventListener('click', (event) => {
          const clickedElement = event.target;
          // Opdateret til at inkludere trend eksempel tooltip som "interaktiv" for at undgå luk ved klik på den
          const isInteractive = clickedElement.closest('#controls button, .cimt-icon, .workflow-step, #info-significance li[data-visual], .trend-example-tooltip');

          if (!isInteractive) {
               let closedSomething = false;
               if (currentVisibleInfoBox && currentVisibleInfoBox !== trendInfoBox && !clickedElement.closest('.info-box-container')) { // Undgå at lukke trend box her
                    hideAllWorkflowAndSignificanceInfoBoxes(); // Skjuler også significance box
                    removeAllStepHighlights();
                    closedSomething = true;
               }
               if (currentVisibleTooltip && !clickedElement.closest('#cimt-band')) {
                   hideAllTooltips(); // Rydder også CIMT fokus
                   closedSomething = true;
               }
               // Hvis der ikke blev lukket noget specifikt, men et trend-fokus er aktivt, luk det
               if (!closedSomething && body.classList.contains('trend-focus-active')) {
                    clearTrendFocus();
               }
               // Hvis der ikke blev lukket noget specifikt, men et cimt-fokus er aktivt (og ingen tooltip var synlig)
               // Dette sker sjældent, da CIMT fokus er knyttet til synlig tooltip
               else if (!closedSomething && !currentVisibleTooltip && body.classList.contains('cimt-focus-active')) {
                   clearCimtFocus();
               }

          }
     });

     window.addEventListener('resize', handleResize);
     updateAllButtonTexts();

}); // End DOMContentLoaded
