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
    const infoBoxes = document.querySelectorAll('.info-box:not(#info-significance):not(#info-trend)'); // Ekskluder trend info box
    const significanceInfoBox = document.getElementById('info-significance');
    const trendInfoBox = document.getElementById('info-trend'); // NYT: Trend info box
    const allIcons = document.querySelectorAll('.cimt-icon'); // Alle ikoner (CIMT + Trends)
    const allCimtIcons = document.querySelectorAll('#cimt-band .cimt-icon'); // Kun CIMT ikoner
    const trendIcons = document.querySelectorAll('#trends-band .cimt-icon'); // NYT: Kun Trend ikoner
    const tooltips = document.querySelectorAll('.tooltip');
    const body = document.body;
    const fadeableElements = document.querySelectorAll('#workflow-layer .workflow-step, #cimt-band .cimt-icon'); // NYT: Elementer til fade

    // Elementer og state for 'Betydning' visualisering
    const significanceListItems = significanceInfoBox?.querySelectorAll('li[data-visual]');
    const priorityNumberElements = document.querySelectorAll('.priority-number');
    const riskMarkers = document.querySelectorAll('.risk-marker');
    let activeSignificanceVisual = null;
    let unifiedEffortLine = null;

    // State variable
    let activeLines = [];
    let currentVisibleInfoBox = null;
    let currentHighlightedStep = null;
    let currentVisibleTooltip = null;
    let currentTrendFocus = null; // NYT: Holder styr på aktiv trend fokus

    // LeaderLine Options
    const defaultLineOptions = { color: 'rgba(120, 120, 120, 0.5)', size: 2, path: 'fluid', startSocket: 'bottom', endSocket: 'top' };
    const unifiedLineOptions = { color: 'rgba(0, 95, 96, 0.7)', size: 10, path: 'arc', startSocketOffsetY: 15, endSocketOffsetY: -15, endPlug: 'arrow2', endPlugSize: 2 };


    // --- Funktioner ---

    // NYT: Funktion til at rydde Trend Fokus
    function clearTrendFocus() {
        if (body.classList.contains('trend-focus-active')) {
            // console.log("Clearing Trend Focus");
            body.classList.remove('trend-focus-active');
            // Fjern specifikke trend-klasser (hvis vi brugte den model - bruger nu relevant-for-trend)
            // body.className = body.className.replace(/\btrend-focus-\S+/g, '').trim();

            // Fjern relevant-klassen fra alle elementer
            fadeableElements.forEach(el => el.classList.remove('relevant-for-trend'));

            // Skjul trend info boksen
            if (trendInfoBox?.classList.contains('visible')) {
                trendInfoBox.classList.remove('visible');
                if (currentVisibleInfoBox === trendInfoBox) {
                    currentVisibleInfoBox = null;
                }
            }
            currentTrendFocus = null;
             // Sørg for at knapperne er opdaterede
             updateAllButtonTexts();
        }
    }


    function hideAllWorkflowAndSignificanceInfoBoxes() {
        let wasVisible = false;
        infoBoxes.forEach(box => { if (box.classList.contains('visible')) { box.classList.remove('visible'); wasVisible = true; } });
        if (significanceInfoBox?.classList.contains('visible')) { significanceInfoBox.classList.remove('visible'); wasVisible = true; hideAllSignificanceVisuals(); }
        // NYT: Skjul også trend info box, hvis den er synlig
        if (trendInfoBox?.classList.contains('visible')) {
            trendInfoBox.classList.remove('visible');
            wasVisible = true;
            // Hvis vi skjuler alle bokse, skal vi også rydde trend fokus effekten
            clearTrendFocus();
        }
        if (wasVisible && currentVisibleInfoBox !== significanceInfoBox && currentVisibleInfoBox !== trendInfoBox) {
            currentVisibleInfoBox = null; // Nulstil kun hvis det var en workflow boks
        }
    }

    function removeAllLines() {
        activeLines.forEach(line => { try { line.remove(); } catch (e) {} });
        activeLines = [];
        hideUnifiedEffortLine();
    }

    function hideAllTooltips() {
        let wasVisible = false;
        tooltips.forEach(tip => { if (tip.classList.contains('visible')) { tip.classList.remove('visible'); wasVisible = true; } });
        if (wasVisible) { removeAllLines(); currentVisibleTooltip = null; }
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

    // Funktioner til 'Betydning' Visualiseringer
    function hidePriorityNumbers() { priorityNumberElements.forEach(el => el.classList.remove('visible')); }
    function showPriorityNumbers() { hideAllSignificanceVisuals(); priorityNumberElements.forEach(el => el.classList.add('visible')); activeSignificanceVisual = 'priority'; }
    function hideUnifiedEffortLine() { if (unifiedEffortLine) { try { unifiedEffortLine.remove(); } catch(e) {} unifiedEffortLine = null; } }

    function showUnifiedEffortLine() {
        hideAllSignificanceVisuals(); hideAllTooltips();
        const startElement = infoBoxContainer; const endElement = workflowLayer;
        if (startElement && endElement && document.contains(startElement) && document.contains(endElement)) {
            workflowLayer?.classList.add('workflow-frame-active');
            try { unifiedEffortLine = new LeaderLine( startElement, endElement, {...unifiedLineOptions}); activeSignificanceVisual = 'unified'; }
            catch (e) { console.error("Error drawing unified effort line:", e); workflowLayer?.classList.remove('workflow-frame-active'); hideUnifiedEffortLine(); }
        } else { console.error("Cannot draw unified line: start or end element not found/visible."); }
    }
    function hideRiskMarkers() { riskMarkers.forEach(marker => marker.classList.remove('visible')); }
    function showRiskMarkers() { hideAllSignificanceVisuals(); riskMarkers.forEach(marker => marker.classList.add('visible')); activeSignificanceVisual = 'risk'; }


    function hideAllSignificanceVisuals() {
        hidePriorityNumbers();
        hideUnifiedEffortLine();
        hideRiskMarkers(); // Opdateret
        workflowLayer?.classList.remove('workflow-frame-active');
        significanceListItems?.forEach(li => li.classList.remove('active-visual'));
        activeSignificanceVisual = null;
    }


    function updateAllButtonTexts() {
        if (toggleCimtButton) { toggleCimtButton.textContent = body.classList.contains('cimt-band-visible') ? 'Skjul CIMT Understøttelse' : 'Vis CIMT Understøttelse'; }
        if (toggleTrendsButton) { toggleTrendsButton.textContent = body.classList.contains('trends-band-visible') ? 'Skjul Tendenser/Risici' : 'Vis Tendenser/Risici'; }
        if (toggleSignificanceButton) { toggleSignificanceButton.textContent = significanceInfoBox?.classList.contains('visible') ? 'Skjul Betydning for CIMT' : 'Vis Betydning for CIMT'; }
    }

    function debounce(func, wait) { let timeout; return function executedFunction(...args) { const later = () => { clearTimeout(timeout); func(...args); }; clearTimeout(timeout); timeout = setTimeout(later, wait); }; }
    const handleResize = debounce(() => {
        removeAllLines();
        workflowLayer?.classList.remove('workflow-frame-active');
        // Hvis en trend var aktiv, kunne man overveje at fjerne fade-effekten ved resize for simpelhedens skyld
        // clearTrendFocus();
        }, 250);

    // --- Event Listeners ---
     if (toggleCimtButton) {
        toggleCimtButton.addEventListener('click', () => {
            const shouldShow = !body.classList.contains('cimt-band-visible');
            // Ryd ALTID andre hovedvisninger
            clearTrendFocus(); // Ryd trend-fokus
            hideAllWorkflowAndSignificanceInfoBoxes(); // Skjul info-bokse (inkl. significance/trend)
            removeAllStepHighlights();
            body.classList.remove('trends-band-visible'); // Skjul trends-bånd
            // Vis/skjul CIMT
            if (shouldShow) { body.classList.add('cimt-band-visible'); }
            else { body.classList.remove('cimt-band-visible'); hideAllTooltips(); } // Skjul tooltips når bånd skjules
            updateAllButtonTexts();
        });
    }

    if (toggleTrendsButton) {
        toggleTrendsButton.addEventListener('click', () => {
            const shouldShow = !body.classList.contains('trends-band-visible');
            // Ryd ALTID andre hovedvisninger
            hideAllWorkflowAndSignificanceInfoBoxes(); // Skjul info-bokse (inkl. significance/trend)
            hideAllTooltips(); // Skjul CIMT tooltips/linjer
            removeAllStepHighlights();
            body.classList.remove('cimt-band-visible'); // Skjul CIMT-bånd
            // Vis/skjul Trends
            if (shouldShow) { body.classList.add('trends-band-visible'); }
            else { body.classList.remove('trends-band-visible'); clearTrendFocus(); } // Ryd trend-fokus når bånd skjules
            updateAllButtonTexts();
        });
    }

     if (toggleSignificanceButton && significanceInfoBox) {
        toggleSignificanceButton.addEventListener('click', () => {
            const shouldShow = !significanceInfoBox.classList.contains('visible');
            // Ryd ALTID andre hovedvisninger
            clearTrendFocus(); // Ryd trend-fokus
            hideAllTooltips(); // Skjul CIMT tooltips/linjer
            removeAllStepHighlights();
            body.classList.remove('cimt-band-visible');
            body.classList.remove('trends-band-visible');
            infoBoxes.forEach(box => box.classList.remove('visible')); // Skjul workflow-bokse
            if(trendInfoBox) trendInfoBox.classList.remove('visible'); // Skjul trend-boks

            if (shouldShow) { significanceInfoBox.classList.add('visible'); currentVisibleInfoBox = significanceInfoBox; }
            else { significanceInfoBox.classList.remove('visible'); hideAllSignificanceVisuals(); currentVisibleInfoBox = null; } // Skjul visuals når boksen lukkes
            updateAllButtonTexts();
        });
     }

    workflowSteps.forEach(step => {
        step.addEventListener('click', () => {
            const infoBoxId = step.dataset.infoTarget; const targetInfoBox = document.getElementById(infoBoxId);
            // Ryd ALTID andre hovedvisninger
            clearTrendFocus();
            hideAllTooltips();
            hideAllWorkflowAndSignificanceInfoBoxes(); // Skjuler significance/trend boks
            body.classList.remove('cimt-band-visible');
            body.classList.remove('trends-band-visible');
            // Håndter klik på step
            if (step === currentHighlightedStep) { removeAllStepHighlights(); /* currentVisibleInfoBox = null; */ } // Nulstilles i hideAll...
            else { removeAllStepHighlights(); step.classList.add('highlighted'); currentHighlightedStep = step; if (targetInfoBox) { targetInfoBox.classList.add('visible'); currentVisibleInfoBox = targetInfoBox; } }
            updateAllButtonTexts();
        });
        step.addEventListener('keypress', (e) => { if (e.key === 'Enter' || e.key === ' ') { step.click(); }});
    });

    // Opdateret listener for CIMT ikoner (ingen ændring i logik)
    allCimtIcons.forEach(icon => {
        icon.addEventListener('click', (event) => {
            event.stopPropagation();
            if (!body.classList.contains('cimt-band-visible')) return; // Gør intet hvis båndet ikke er aktivt

            hideAllWorkflowAndSignificanceInfoBoxes(); // Skjul andre info bokse
            removeAllStepHighlights();
            clearTrendFocus(); // Ryd trend fokus

            const tooltipId = icon.dataset.tooltipTarget;
            const tooltip = document.getElementById(tooltipId);
            const isClickingVisibleTooltip = tooltip && tooltip === currentVisibleTooltip;

            hideAllTooltips(); // Skjul evt. andre tooltips/linjer FØRST

            if (!isClickingVisibleTooltip && tooltip) {
                tooltip.classList.add('visible');
                currentVisibleTooltip = tooltip;
                drawLinesForIcon(icon);
            }
             // Hvis man klikkede på den synlige, har hideAllTooltips() allerede lukket den
        });
        icon.addEventListener('keypress', (e) => { if (e.key === 'Enter' || e.key === ' ') { icon.click(); } });
    });

    // NY listener for Trend ikoner
    trendIcons.forEach(icon => {
         icon.addEventListener('click', (event) => {
            event.stopPropagation();
            if (!body.classList.contains('trends-band-visible')) return; // Gør intet hvis båndet ikke er aktivt

            const trendId = icon.id;
            const isClickingActiveTrend = trendId && trendId === currentTrendFocus;

            // Ryd ALTID andre visninger
            hideAllWorkflowAndSignificanceInfoBoxes();
            hideAllTooltips();
            removeAllStepHighlights();
            // Ryd tidligere trend fokus før evt. nyt sættes
            clearTrendFocus();

            if (!isClickingActiveTrend && trendId) {
                // Sæt nyt trend fokus
                // console.log("Setting Trend Focus:", trendId);
                currentTrendFocus = trendId;
                body.classList.add('trend-focus-active');

                // Find og marker relevante elementer
                const relevantSteps = icon.dataset.relevantSteps?.split(' ') || [];
                const relevantCimt = icon.dataset.relevantCimt?.split(' ') || [];
                const relevantIds = [...relevantSteps, ...relevantCimt];

                fadeableElements.forEach(el => {
                    if (relevantIds.includes(el.id)) {
                        el.classList.add('relevant-for-trend');
                    }
                });

                // Udfyld og vis info boks
                const title = icon.querySelector('.cimt-icon-title')?.textContent || 'Tendens/Risiko';
                const description = icon.dataset.description || 'Ingen beskrivelse.';
                const examplesRaw = icon.dataset.examples || '';
                const examplesHtml = examplesRaw.split('<br>')
                                         .map(ex => ex.trim())
                                         .filter(ex => ex)
                                         .map(ex => `<li>${ex.replace(/<strong>(.*?)<\/strong>/g, '<strong>$1</strong>')}</li>`) // Sørg for at beholde strong tags korrekt
                                         .join('');

                if (trendInfoBox) {
                    const trendTitleEl = trendInfoBox.querySelector('#trend-info-title');
                    const trendDescEl = trendInfoBox.querySelector('#trend-info-description');
                    const trendExamplesEl = trendInfoBox.querySelector('#trend-info-examples');

                    // Sørg for at elementerne findes før opdatering (sikrere)
                    // Opret dem dynamisk hvis de mangler? Eller tilføj dem i HTML-skabelonen
                    if (!trendTitleEl || !trendDescEl || !trendExamplesEl) {
                         // Simpel fallback - sætter hele HTML for boksen
                         trendInfoBox.innerHTML = `
                              <h2 id="trend-info-title">${title}</h2>
                              <p id="trend-info-description">${description}</p>
                              <div id="trend-info-examples">
                                   ${examplesHtml ? `<h3>Eksempler i Workflow:</h3><ul>${examplesHtml}</ul>` : ''}
                              </div>
                         `;
                    } else {
                         trendTitleEl.textContent = title;
                         trendDescEl.textContent = description;
                         trendExamplesEl.innerHTML = examplesHtml ? `<h3>Eksempler i Workflow:</h3><ul>${examplesHtml}</ul>` : '';
                    }

                    trendInfoBox.classList.add('visible');
                    currentVisibleInfoBox = trendInfoBox;
                }

            }
            // Hvis man klikkede på aktiv trend, har clearTrendFocus() allerede ryddet op.
            updateAllButtonTexts(); // Opdater knapper
         });
         icon.addEventListener('keypress', (e) => { if (e.key === 'Enter' || e.key === ' ') { icon.click(); } });
    });


    // Listener for Betydning List Items (uændret logik, men kalder nye risk func)
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

     // Global click listener (uændret, men clearTrendFocus er nu i hideAll...)
     document.addEventListener('click', (event) => {
          const clickedElement = event.target;
          const isInteractive = clickedElement.closest('#controls button, .cimt-icon, .workflow-step, #info-significance li[data-visual]'); // Modal fjernet
          if (!isInteractive) {
               if (currentVisibleInfoBox && !clickedElement.closest('.info-box-container')) { hideAllWorkflowAndSignificanceInfoBoxes(); removeAllStepHighlights(); } // Dette kalder clearTrendFocus hvis trend-boksen var synlig
               else if (currentVisibleTooltip && !clickedElement.closest('#cimt-band')) { hideAllTooltips(); }
          }
     });

     window.addEventListener('resize', handleResize);
     updateAllButtonTexts();

}); // End DOMContentLoaded
