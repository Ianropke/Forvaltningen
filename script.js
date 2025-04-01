document.addEventListener('DOMContentLoaded', () => {
    // --- Element Selektorer ---
    const toggleCimtButton = document.getElementById('toggle-cimt');
    const toggleTrendsButton = document.getElementById('toggle-trends');
    const toggleSignificanceButton = document.getElementById('toggle-significance');

    const cimtBand = document.getElementById('cimt-band');
    const trendsBand = document.getElementById('trends-band');
    const workflowSteps = document.querySelectorAll('.workflow-step');
    const workflowLayer = document.getElementById('workflow-layer');
    const infoBoxContainer = document.querySelector('.info-box-container');
    const infoBoxes = document.querySelectorAll('.info-box:not(#info-significance)');
    const significanceInfoBox = document.getElementById('info-significance');
    const allCimtIcons = document.querySelectorAll('#cimt-band .cimt-icon');
    const trendIcons = document.querySelectorAll('#trends-band .cimt-icon');
    const tooltips = document.querySelectorAll('#cimt-band .tooltip'); // Kun CIMT tooltips
    const body = document.body;

    // Fadeable elements (for focus effects)
    const fadeableWorkflowSteps = document.querySelectorAll('#workflow-layer .workflow-step');
    const fadeableCimtIcons = document.querySelectorAll('#cimt-band .cimt-icon');
    const fadeableTrendIcons = document.querySelectorAll('#trends-band .cimt-icon'); // Trends ikoner fader også

    // Elementer for 'Betydning' visualisering
    const significanceListItems = significanceInfoBox?.querySelectorAll('li[data-visual]');
    const priorityNumberElements = document.querySelectorAll('.priority-number');
    const riskMarkers = document.querySelectorAll('.risk-marker');
    const trendIndicators = document.querySelectorAll('.trend-indicator'); // De små ikoner på steps

    // --- State Variabler ---
    let activeSignificanceVisual = null; // 'priority', 'unified', 'risk'
    let unifiedEffortLine = null; // Holder LeaderLine instans for unified pil
    let currentVisibleInfoBox = null; // Holder styr på aktiv info-boks
    let currentHighlightedStep = null; // Holder styr på highlightet step
    let currentVisibleTooltip = null; // Holder styr på aktiv CIMT tooltip
    let currentTrendFocusIcon = null; // Holder styr på aktivt Trend ikon
    let currentCimtFocusIcon = null; // Holder styr på aktivt CIMT ikon (ID bruges)
    let currentTrendExampleTooltip = null; // Holder det dynamisk oprettede trend tooltip element

    // --- LeaderLine Options ---
    const unifiedLineOptions = {
        color: 'rgba(0, 95, 96, 0.7)', // Mørk cyan, semi-transparent
        size: 4, // Lidt tykkere end default
        path: 'arc', // Bue sti
        startSocket: 'auto', // Automatisk bedste startpunkt
        endSocket: 'auto',   // Automatisk bedste slutpunkt
        // startSocketGravity: [0, -100], // Forsøg at starte lidt højere oppe fra info-boks området
        // endSocketGravity: [0, -100], // Forsøg at ramme lidt højere oppe på workflow-laget
        endPlug: 'arrow1', // Simpel pilespids
        endPlugSize: 1.5,
        outline: true,       // Tilføj en tynd outline
        outlineColor: 'rgba(0, 95, 96, 0.2)', // Meget svag outline
        outlineSize: 1.5      // Outline størrelse
    };

    // --- Debounce Funktion ---
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // --- Funktioner til rydning og state management ---

    // Rydder CIMT fokus (fade-effekt og aktivt ikon)
    function clearCimtFocus() {
        if (body.classList.contains('cimt-focus-active')) {
            body.classList.remove('cimt-focus-active');
            fadeableWorkflowSteps.forEach(el => el.classList.remove('relevant-for-cimt'));
            fadeableCimtIcons.forEach(el => el.classList.remove('cimt-focus-icon')); // Fjerner markering af aktivt ikon
            currentCimtFocusIcon = null;
        }
        hideAllTooltips(); // Skjul altid tooltips når fokus fjernes
    }

    // Rydder Trend fokus (fade-effekt, små ikoner, aktivt ikon)
    function clearTrendFocus() {
        if (body.classList.contains('trend-focus-active')) {
            body.classList.remove('trend-focus-active');
            fadeableWorkflowSteps.forEach(el => el.classList.remove('relevant-for-trend'));
            fadeableCimtIcons.forEach(el => el.classList.remove('relevant-for-trend'));
            // Ingen grund til at fjerne fra fadeableTrendIcons, da de ikke får klassen
            trendIndicators.forEach(indicator => indicator.classList.remove('visible')); // Skjul små ikoner
            hideTrendExampleTooltip(); // Skjul evt. aktivt hover-tooltip
            currentTrendFocusIcon = null;
        }
    }

    // Skjuler alle info-bokse og fjerner alle fokus-tilstande
    function hideAllInfoAndFocus() {
        let wasInfoBoxVisible = false;
        let wasSignificanceVisible = false;

        // Skjul almindelige info-bokse
        infoBoxes.forEach(box => {
            if (box.classList.contains('visible')) {
                box.classList.remove('visible');
                wasInfoBoxVisible = true;
            }
        });

        // Skjul significance info-boks og dens visuals
        if (significanceInfoBox?.classList.contains('visible')) {
            significanceInfoBox.classList.remove('visible');
            hideAllSignificanceVisuals(); // Ryd visuals når boksen skjules
            wasSignificanceVisible = true;
        }

        // Ryd fokus-tilstande
        clearTrendFocus();
        clearCimtFocus(); // clearCimtFocus kalder hideAllTooltips internt

        // Nulstil state variabler for synlige bokse
        if (wasInfoBoxVisible || wasSignificanceVisible) {
            currentVisibleInfoBox = null;
        }

        // Fjern step highlight HVIS en info-boks var synlig (undtagen significance)
        if (wasInfoBoxVisible) {
             removeAllStepHighlights();
        }
    }

    // Skjuler KUN den samlede indsats-pil (da CIMT pile er fjernet)
    function removeAllLines() {
        hideUnifiedEffortLine(); // Skjuler og nulstiller unifiedEffortLine
    }

    // Skjuler alle CIMT tooltips
    function hideAllTooltips() {
        let wasVisible = false;
        tooltips.forEach(tip => {
            if (tip.classList.contains('visible')) {
                tip.classList.remove('visible');
                wasVisible = true;
            }
        });
        if (wasVisible) {
            currentVisibleTooltip = null;
            // Ingen grund til at fjerne CIMT fokus her, det gøres af den kaldende funktion
        }
    }

    // Fjerner highlight fra alle workflow steps
    function removeAllStepHighlights() {
        let wasVisible = false;
        workflowSteps.forEach(step => {
            if (step.classList.contains('highlighted')) {
                step.classList.remove('highlighted');
                wasVisible = true;
            }
        });
        if (wasVisible) {
             currentHighlightedStep = null;
        }
    }


    // --- Funktioner til 'Betydning' Visualiseringer ---

    function hidePriorityNumbers() {
        priorityNumberElements.forEach(el => el.classList.remove('visible'));
    }
    function showPriorityNumbers() {
        hideAllSignificanceVisuals(); // Ryd andre først
        priorityNumberElements.forEach(el => el.classList.add('visible'));
        activeSignificanceVisual = 'priority';
    }

    function hideUnifiedEffortLine() {
        if (unifiedEffortLine) {
            try {
                unifiedEffortLine.remove();
            } catch (e) { /* Ignorer fejl hvis linjen allerede er fjernet */ }
            unifiedEffortLine = null;
        }
        workflowLayer?.classList.remove('workflow-frame-active'); // Fjern rammen
    }

    function showUnifiedEffortLine() {
        hideAllSignificanceVisuals(); // Ryd andre først
        // Sørg for at elementerne findes og er i DOM'en
        const startElement = infoBoxContainer; // Start fra hele info-området
        const endElement = workflowLayer; // Slut ved hele workflow-området

        if (startElement && endElement && document.contains(startElement) && document.contains(endElement)) {
             workflowLayer?.classList.add('workflow-frame-active'); // Tilføj rammen
            try {
                 // Opret LeaderLine
                unifiedEffortLine = new LeaderLine(startElement, endElement, unifiedLineOptions);
                activeSignificanceVisual = 'unified';

                // Ompositioner linjen efter kort tid, hvis layout skifter
                 setTimeout(() => {
                     if (unifiedEffortLine) unifiedEffortLine.position();
                 }, 50);

            } catch (e) {
                console.error("Error drawing unified effort line:", e);
                workflowLayer?.classList.remove('workflow-frame-active'); // Ryd op hvis fejl
                hideUnifiedEffortLine();
            }
        } else {
            console.error("Cannot draw unified effort line: start or end element not found/visible.");
            workflowLayer?.classList.remove('workflow-frame-active'); // Ryd op
        }
    }

    function hideRiskMarkers() {
        riskMarkers.forEach(marker => marker.classList.remove('visible'));
    }
    function showRiskMarkers() {
        hideAllSignificanceVisuals(); // Ryd andre først
        riskMarkers.forEach(marker => marker.classList.add('visible'));
        activeSignificanceVisual = 'risk';
    }

    // Rydder ALLE betydnings-visualiseringer
    function hideAllSignificanceVisuals() {
        hidePriorityNumbers();
        hideUnifiedEffortLine(); // Fjerner pil og ramme
        hideRiskMarkers();
        // Fjern aktiv markering fra list items
        significanceListItems?.forEach(li => li.classList.remove('active-visual'));
        activeSignificanceVisual = null;
    }


    // --- Funktioner til Trend Eksempel Tooltips ---

    function hideTrendExampleTooltip() {
        if (currentTrendExampleTooltip) {
            // Fjern fra body
            if (document.body.contains(currentTrendExampleTooltip)) {
                document.body.removeChild(currentTrendExampleTooltip);
            }
            currentTrendExampleTooltip = null;
        }
    }

    function showTrendExampleTooltip(stepElement, text) {
        hideTrendExampleTooltip(); // Skjul evt. eksisterende
        if (!text || !stepElement) return; // Stop hvis ingen tekst eller element

        const tooltipEl = document.createElement('div');
        tooltipEl.className = 'trend-example-tooltip';
        tooltipEl.textContent = text;

        // Tilføj til body for at kunne måle dimensioner
        document.body.appendChild(tooltipEl);

        // Beregn position med 'fixed'
        const stepRect = stepElement.getBoundingClientRect();
        const tooltipRect = tooltipEl.getBoundingClientRect();
        const margin = 10; // Afstand fra step

        let top = stepRect.top + (stepRect.height / 2) - (tooltipRect.height / 2);
        let left = stepRect.right + margin;

        // Juster hvis den går udenfor skærmen
        if (left + tooltipRect.width > window.innerWidth - margin) { // Går ud til højre
            left = stepRect.left - tooltipRect.width - margin; // Placer til venstre
        }
        if (left < margin) { // Går ud til venstre
            left = margin; // Sæt til kant
             // Overvej at placere over/under hvis venstre/højre ikke virker
            top = stepRect.top - tooltipRect.height - margin;
            if (top < margin) {
                top = stepRect.bottom + margin;
            }
        }

        if (top < margin) { // Går ud i toppen
            top = margin;
        }
        if (top + tooltipRect.height > window.innerHeight - margin) { // Går ud i bunden
            top = window.innerHeight - tooltipRect.height - margin;
        }


        // Anvend position
        tooltipEl.style.top = `${top}px`;
        tooltipEl.style.left = `${left}px`;

        // Gør synlig (med lille forsinkelse for at sikre position er sat)
        requestAnimationFrame(() => {
            tooltipEl.classList.add('visible');
        });

        currentTrendExampleTooltip = tooltipEl; // Gem reference
    }


    // --- Event Listeners ---

    // Opdaterer teksten på alle kontrolknapper
    function updateAllButtonTexts() {
        if (toggleCimtButton) {
            toggleCimtButton.textContent = body.classList.contains('cimt-band-visible')
                ? 'Skjul CIMT Understøttelse' : 'Vis CIMT Understøttelse';
        }
        if (toggleTrendsButton) {
            toggleTrendsButton.textContent = body.classList.contains('trends-band-visible')
                ? 'Skjul Tendenser/Risici' : 'Vis Tendenser/Risici';
        }
        if (toggleSignificanceButton) {
            toggleSignificanceButton.textContent = significanceInfoBox?.classList.contains('visible')
                ? 'Skjul Betydning for CIMT' : 'Vis Betydning for CIMT';
        }
    }

    // Debounced resize handler
    const handleResize = debounce(() => {
        removeAllLines(); // Fjerner unified line (den eneste der er tilbage)
        clearTrendFocus(); // Nulstil fokus ved resize
        clearCimtFocus();
        hideTrendExampleTooltip();
        // Hvis en info-boks eller tooltip var synlig, skal den måske genpositioneres
        // Simplest er at skjule dem:
        hideAllInfoAndFocus();
        removeAllStepHighlights();
        updateAllButtonTexts(); // Knapper kan have ændret sig
    }, 250);

    // --- Klik-Listeners for Kontrolknapper ---

    if (toggleCimtButton) {
        toggleCimtButton.addEventListener('click', () => {
            const shouldShow = !body.classList.contains('cimt-band-visible');
            hideAllInfoAndFocus(); // Ryd alt andet
            removeAllStepHighlights(); // Fjern step highlights
            body.classList.remove('trends-band-visible'); // Sørg for at trends-bånd er skjult

            if (shouldShow) {
                body.classList.add('cimt-band-visible');
            } else {
                body.classList.remove('cimt-band-visible');
                // clearCimtFocus() kaldes implicit af hideAllInfoAndFocus,
                // som også kalder hideAllTooltips()
            }
            updateAllButtonTexts();
        });
    }

    if (toggleTrendsButton) {
        toggleTrendsButton.addEventListener('click', () => {
            const shouldShow = !body.classList.contains('trends-band-visible');
            hideAllInfoAndFocus(); // Ryd alt andet
            removeAllStepHighlights(); // Fjern step highlights
            body.classList.remove('cimt-band-visible'); // Sørg for at CIMT-bånd er skjult

            if (shouldShow) {
                body.classList.add('trends-band-visible');
            } else {
                 body.classList.remove('trends-band-visible');
                 // clearTrendFocus() kaldes implicit af hideAllInfoAndFocus
            }
            updateAllButtonTexts();
        });
    }

     if (toggleSignificanceButton && significanceInfoBox) {
        toggleSignificanceButton.addEventListener('click', () => {
            const shouldShow = !significanceInfoBox.classList.contains('visible');

            // Ryd altid andre visninger FØRST
            hideAllInfoAndFocus();
            removeAllStepHighlights();
            body.classList.remove('cimt-band-visible');
            body.classList.remove('trends-band-visible');
            // hideAllInfoAndFocus har allerede skjult alle info-bokse

            if (shouldShow) {
                significanceInfoBox.classList.add('visible');
                currentVisibleInfoBox = significanceInfoBox; // Sæt denne som aktiv
            } else {
                // hideAllInfoAndFocus har allerede skjult boksen og kaldt hideAllSignificanceVisuals
                currentVisibleInfoBox = null;
            }
            updateAllButtonTexts();
        });
    }

    // --- Klik/Keypress Listeners for Workflow Steps ---
    workflowSteps.forEach(step => {
        // Klik for at vise info-boks
        step.addEventListener('click', () => {
            const infoBoxId = step.dataset.infoTarget;
            const targetInfoBox = document.getElementById(infoBoxId);

            // Håndter klik på samme step for at lukke igen
            if (step === currentHighlightedStep) {
                 hideAllInfoAndFocus(); // Skjul boksen
                 removeAllStepHighlights(); // Fjern highlight
                 currentVisibleInfoBox = null;
                 currentHighlightedStep = null;
            } else {
                hideAllInfoAndFocus(); // Ryd alt andet
                removeAllStepHighlights(); // Fjern evt. andet highlight
                body.classList.remove('cimt-band-visible'); // Skjul bånd
                body.classList.remove('trends-band-visible');

                step.classList.add('highlighted'); // Highlight det klikkede step
                currentHighlightedStep = step;

                if (targetInfoBox) {
                    targetInfoBox.classList.add('visible'); // Vis den korrekte info-boks
                    currentVisibleInfoBox = targetInfoBox;
                }
            }
            updateAllButtonTexts(); // Opdater knaptekster (ifald bånd blev skjult)
        });

        // Keypress for tilgængelighed
        step.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault(); // Undgå scroll ved space
                step.click(); // Simuler klik
            }
        });

        // --- Hover Listeners for Trend Eksempler ---
        step.addEventListener('mouseover', () => {
            // Vis KUN tooltip hvis trend-fokus er aktivt,
            // OG dette step er relevant for den aktive trend,
            // OG der ER et aktivt trend-ikon
            if (body.classList.contains('trend-focus-active') &&
                step.classList.contains('relevant-for-trend') &&
                currentTrendFocusIcon)
            {
                const examplesMapStr = currentTrendFocusIcon.dataset.examplesMap;
                const stepId = step.id;
                if (examplesMapStr && stepId) {
                    try {
                        // Erstatter enkelt-quotes med dobbelt-quotes for valid JSON
                        const examplesMap = JSON.parse(examplesMapStr.replace(/'/g, '"'));
                        // Find tekst for dette step, eller fald tilbage til "Generelt"
                        const exampleText = examplesMap[stepId] || examplesMap["Generelt"] || null;

                        if (exampleText) {
                            showTrendExampleTooltip(step, exampleText);
                        } else {
                            hideTrendExampleTooltip(); // Skjul hvis ingen tekst findes
                        }
                    } catch (e) {
                        console.error("Error parsing data-examples-map JSON:", e, examplesMapStr);
                        hideTrendExampleTooltip();
                    }
                } else {
                     hideTrendExampleTooltip(); // Skjul hvis data mangler
                }
            }
        });

        // Skjul tooltip når musen forlader step'et (med lille delay)
        step.addEventListener('mouseout', () => {
            // Lille timeout så man kan nå at flytte musen over på tooltip'en
            // hvis den skulle blive interaktiv i fremtiden (lige nu er den ikke)
            setTimeout(() => {
                    hideTrendExampleTooltip();
            }, 100); // 100ms delay
        });

         // Skjul tooltip ved fokus ud (accessibility)
         step.addEventListener('focusout', () => {
             setTimeout(() => {
                 // Check om det nye fokus er inden i tooltip (hvis den var interaktiv)
                 // Lige nu skjuler vi den bare
                  hideTrendExampleTooltip();
             }, 100);
         });

    }); // End workflowSteps.forEach

    // --- Klik/Keypress Listeners for CIMT Ikoner ---
    allCimtIcons.forEach(icon => {
        icon.addEventListener('click', (event) => {
            event.stopPropagation(); // Undgå at global listener lukker med det samme
            if (!body.classList.contains('cimt-band-visible')) return; // Gør intet hvis båndet ikke er synligt

            const iconId = icon.id;
            const tooltipId = icon.dataset.tooltipTarget;
            const tooltip = document.getElementById(tooltipId);
            const isClickingActiveCimt = iconId && iconId === currentCimtFocusIcon;

            // Ryd altid andre visninger/fokus FØRST
            hideAllInfoAndFocus();
            removeAllStepHighlights();
            // clearTrendFocus() er kaldt af hideAllInfoAndFocus

             // Håndter klik på samme ikon for at lukke
            if (isClickingActiveCimt) {
                clearCimtFocus(); // Rydder fokus og skjuler tooltip
                currentCimtFocusIcon = null;
                currentVisibleTooltip = null;
            } else {
                 // Ryd evt. eksisterende CIMT fokus FØRST
                 clearCimtFocus();

                // Vis nyt fokus
                 if (tooltip && iconId) {
                     currentCimtFocusIcon = iconId; // Gem ID for aktivt ikon
                     body.classList.add('cimt-focus-active'); // Aktiver fade-effekt
                     icon.classList.add('cimt-focus-icon'); // Marker dette ikon som aktivt

                     // Find og marker relevante steps
                     const relevantSteps = icon.dataset.cimtRelevant?.split(' ') || [];
                     fadeableWorkflowSteps.forEach(el => {
                         if (relevantSteps.includes(el.id)) {
                             el.classList.add('relevant-for-cimt');
                         }
                     });

                     tooltip.classList.add('visible'); // Vis tooltip
                     currentVisibleTooltip = tooltip;

                     // INGEN drawLinesForIcon() her - linjer er fjernet fra CIMT
                 }
            }
        }); // End click listener

        icon.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                icon.click();
            }
        });
    }); // End allCimtIcons.forEach

    // --- Klik/Keypress Listeners for Trend Ikoner ---
    trendIcons.forEach(icon => {
         icon.addEventListener('click', (event) => {
            event.stopPropagation(); // Undgå global listener
            if (!body.classList.contains('trends-band-visible')) return; // Gør intet hvis båndet er skjult

            const trendId = icon.id;
            const isClickingActiveTrend = trendId && currentTrendFocusIcon && trendId === currentTrendFocusIcon.id;

            // Ryd altid andre visninger/fokus FØRST
             hideAllInfoAndFocus();
             removeAllStepHighlights();
             // clearCimtFocus() er kaldt af hideAllInfoAndFocus

             // Håndter klik på samme ikon for at lukke
             if (isClickingActiveTrend) {
                 clearTrendFocus(); // Rydder fokus, små ikoner og tooltip
                 currentTrendFocusIcon = null;
             } else {
                 // Ryd evt. eksisterende trend fokus FØRST
                  clearTrendFocus();

                 // Vis nyt fokus
                 if (trendId) {
                     currentTrendFocusIcon = icon; // Gem reference til aktivt ikon
                     body.classList.add('trend-focus-active'); // Aktiver fade-effekt

                     // Find og marker relevante steps og CIMT ikoner
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

                     // Vis de små trend-indikator-ikoner på relevante steps
                     trendIndicators.forEach(indicator => {
                          const parentStep = indicator.closest('.workflow-step');
                          // Tjek om indikatoren matcher den klikkede trend ID OG om dens parent step er relevant
                          if (indicator.classList.contains(`trend-icon-${trendId.replace('trend-', '')}`) &&
                              parentStep?.classList.contains('relevant-for-trend'))
                          {
                               indicator.classList.add('visible');
                          }
                     });
                 }
             }
             updateAllButtonTexts(); // Opdater knaptekster
         }); // End click listener

        icon.addEventListener('keypress', (e) => {
             if (e.key === 'Enter' || e.key === ' ') {
                 e.preventDefault();
                 icon.click();
             }
         });
    }); // End trendIcons.forEach


    // --- Klik/Keypress Listeners for Betydning List Items ---
    if (significanceListItems) {
        significanceListItems.forEach(item => {
            item.addEventListener('click', (event) => {
                event.stopPropagation(); // Undgå global listener
                if (!significanceInfoBox?.classList.contains('visible')) return; // Gør intet hvis boksen ikke er synlig

                const visualType = item.dataset.visual;
                const wasActive = item.classList.contains('active-visual'); // Tjek om den *var* aktiv

                // Ryd altid andre visninger/fokus FØRST
                // hideAllInfoAndFocus(); // Fjerner også significance boksen - undlad her
                clearTrendFocus();
                clearCimtFocus();
                removeAllStepHighlights();
                body.classList.remove('cimt-band-visible'); // Skjul bånd
                body.classList.remove('trends-band-visible');

                // Ryd alle betydning visuals FØRST (fjerner også active-visual klassen)
                 hideAllSignificanceVisuals();

                // Hvis den *ikke* var aktiv før, så vis den nye
                if (!wasActive && visualType) {
                     switch (visualType) {
                        case 'priority':
                             showPriorityNumbers();
                             break;
                        case 'unified':
                             showUnifiedEffortLine();
                             break;
                        case 'risk':
                             showRiskMarkers();
                             break;
                        default:
                            console.warn("Unknown visual type:", visualType);
                    }
                    item.classList.add('active-visual'); // Marker den nu som aktiv
                    // activeSignificanceVisual sættes i showXxx funktionerne
                }
                // Hvis den *var* aktiv, gør intet mere (da alt blev ryddet af hideAllSignificanceVisuals)

                 // Sørg for at significanceInfoBox forbliver synlig
                 if (significanceInfoBox) {
                     significanceInfoBox.classList.add('visible');
                     currentVisibleInfoBox = significanceInfoBox; // Sæt den som aktiv boks
                 }
                 updateAllButtonTexts(); // Opdater knaptekster
            }); // End click listener

            item.addEventListener('keypress', (e) => {
                 if (e.key === 'Enter' || e.key === ' ') {
                     e.preventDefault();
                     item.click();
                 }
             });
        }); // End significanceListItems.forEach
    }


     // --- Global Click Listener (Lukker ting ved klik udenfor) ---
     document.addEventListener('click', (event) => {
          const clickedElement = event.target;

          // Definer elementer der IKKE skal udløse lukning
          const isInteractive = clickedElement.closest(`
              #controls button,
              .cimt-icon,
              .workflow-step,
              #info-significance li[data-visual],
              .leader-line
              /* Tooltips er ikke interaktive (pointer-events: none) */
          `);

          // Hvis der klikkes udenfor interaktive elementer
          if (!isInteractive) {
               let closedSomething = false;

               // Hvis en info-boks er synlig OG klikket er udenfor containeren
               if (currentVisibleInfoBox && !clickedElement.closest('.info-box-container')) {
                   // Hvis det er significance boksen, skjul kun dens visuals
                   if (currentVisibleInfoBox === significanceInfoBox) {
                       hideAllSignificanceVisuals();
                       closedSomething = true;
                   } else {
                       // Ellers skjul boksen og fjern step highlight
                       hideAllInfoAndFocus(); // Skjuler boksen
                       removeAllStepHighlights(); // Fjerner highlight
                       closedSomething = true;
                   }
                   currentVisibleInfoBox = null; // Nulstil altid
               }

               // Hvis en CIMT tooltip er synlig OG klikket er udenfor CIMT-båndet
               // OG der ikke lige er lukket en info boks (som kan have kaldt clearCimtFocus)
               if (currentVisibleTooltip && !closedSomething && !clickedElement.closest('#cimt-band')) {
                    clearCimtFocus(); // Rydder fokus og tooltip
                    closedSomething = true;
               }

               // Hvis der ikke blev lukket noget specifikt, ryd evt. resterende fokus
               if (!closedSomething) {
                   if (body.classList.contains('trend-focus-active')) {
                        clearTrendFocus();
                        closedSomething = true;
                   } else if (body.classList.contains('cimt-focus-active')) {
                        clearCimtFocus();
                        closedSomething = true;
                   }
               }

               // Opdater knapper hvis noget blev lukket/ændret
               if (closedSomething) {
                    updateAllButtonTexts();
               }
          }
     }); // End global click listener


     // --- Initialisering ---
     window.addEventListener('resize', handleResize); // Tilføj resize listener
     updateAllButtonTexts(); // Sæt korrekt knaptekst ved start

}); // End DOMContentLoaded
