<!DOCTYPE html>
<html lang="da">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Interaktiv Infografik - Sammen om forvaltningen i CIMT (Forenklet)</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div id="infographic-container">
        <h1>Sammen om forvaltningen i CIMT</h1>
        <p class="center-text"><em>Klik på trinene i blodprøvens rejse for detaljer. Aktiver knapperne nedenfor for at se CIMT funktioner eller Kontekst (Tendenser & Betydning). Klik på ikonerne for info eller visuelle effekter.</em></p>
        <div id="controls">
            <button id="toggle-cimt">Vis CIMT Understøttelse</button>
            <button id="toggle-context">Vis Kontekst & Tendenser</button>
            </div>
        <div id="main-diagram">
            <div id="workflow-layer">
                <div class="workflow-step" id="step-proevetagning" data-info-target="info-proevetagning" tabindex="0" aria-label="Trin 1: Prøvetagning"><span class="priority-number">3</span><span class="risk-marker"><svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-alert-triangle-filled" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 1.669l10.36 18.644a1.006 1.006 0 0 1-.877 1.504h-20.967a1.006 1.006 0 0 1-.876-1.504l10.36-18.644a1.006 1.006 0 0 1 1.754 0z" stroke-width="0" fill="currentColor"/><path d="M12 16a1 1 0 1 0 0 2a1 1 0 0 0 0-2z" stroke-width="0" fill="#ffffff"/><path d="M12 6a1 1 0 0 0-.993.883l-.007.117v6l.007.117a1 1 0 0 0 1.993 0l.007-.117v-6l-.007-.117a1 1 0 0 0-.993-.883z" stroke-width="0" fill="#ffffff"/></svg></span><span class="trend-indicator trend-icon-security"><svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-shield-lock" viewBox="0 0 24 24" stroke-width="1.5" stroke="#ffffff" fill="#6c757d" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 3a12 12 0 0 0 8.5 3a12 12 0 0 1-8.5 15a12 12 0 0 1-8.5-15a12 12 0 0 0 8.5-3"/><path d="M12 11m-1 0a1 1 0 1 0 2 0a1 1 0 1 0-2 0"/><path d="M10 14a2 2 0 1 0 4 0a2 2 0 1 0-4 0"/></svg></span><svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-needle-thread" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M17.026 11.893l-1.01-1.01a1.414 1.414 0 0 0-2 0l-6.061 6.061a1.414 1.414 0 0 0 0 2l1.01 1.01c.544.544 1.29.806 2.026.806s1.482-.262 2.026-.806l6.061-6.061a1.414 1.414 0 0 0 0-2z"/><path d="M17 12l2.5-2.5"/><path d="M12 17l-2.5 2.5"/><path d="M4 16l3-3"/><path d="M15 5l-4.878 4.878a2.828 2.828 0 0 0-.824 1.989v1.268m3.553-5.135l2.121-2.121a1.414 1.414 0 0 0-2-2l-2.121 2.121"/><path d="M18 8a3 3 0 1 0-3-3"/></svg><p>Prøvetagning</p></div>
                <div class="arrow"><svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-arrow-right" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M5 12l14 0"/><path d="M13 18l6-6"/><path d="M13 6l6 6"/></svg></div>
                <div class="workflow-step" id="step-transport" data-info-target="info-transport" tabindex="0" aria-label="Trin 2: Transport (Rørpost)"><span class="priority-number">5</span><svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-submarine" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M3 11v6h2l1-1.5l3 1.5h10v-6h-10l-3 1.5l-1-1.5h-2z"/><path d="M17 11l-1-3h-5l-1 3"/><path d="M13 8v-2a1 1 0 0 1 1-1h1"/></svg><p>Transport</p></div>
                <div class="arrow"><svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-arrow-right" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M5 12l14 0"/><path d="M13 18l6-6"/><path d="M13 6l6 6"/></svg></div>
                <div class="workflow-step" id="step-analyse" data-info-target="info-analyse" tabindex="0" aria-label="Trin 3: Primær Analyse"><span class="priority-number">1</span><span class="risk-marker"><svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-alert-triangle-filled" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 1.669l10.36 18.644a1.006 1.006 0 0 1-.877 1.504h-20.967a1.006 1.006 0 0 1-.876-1.504l10.36-18.644a1.006 1.006 0 0 1 1.754 0z" stroke-width="0" fill="currentColor"/><path d="M12 16a1 1 0 1 0 0 2a1 1 0 0 0 0-2z" stroke-width="0" fill="#ffffff"/><path d="M12 6a1 1 0 0 0-.993.883l-.007.117v6l.007.117a1 1 0 0 0 1.993 0l.007-.117v-6l-.007-.117a1 1 0 0 0-.993-.883z" stroke-width="0" fill="#ffffff"/></svg></span><span class="trend-indicator trend-icon-tech"><svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-atom-2" viewBox="0 0 24 24" stroke-width="1.5" stroke="#ffffff" fill="#6c757d" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0-6 0"/><path d="M12 21l0-6"/><path d="M3.634 15.366l1.827-1.133"/><path d="M20.366 15.366l-1.827-1.133"/><path d="M12 3l0 6"/><path d="M20.366 8.634l-1.827 1.133"/><path d="M3.634 8.634l1.827 1.133"/></svg></span><span class="trend-indicator trend-icon-security"><svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-shield-lock" viewBox="0 0 24 24" stroke-width="1.5" stroke="#ffffff" fill="#6c757d" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 3a12 12 0 0 0 8.5 3a12 12 0 0 1-8.5 15a12 12 0 0 1-8.5-15a12 12 0 0 0 8.5-3"/><path d="M12 11m-1 0a1 1 0 1 0 2 0a1 1 0 1 0-2 0"/><path d="M10 14a2 2 0 1 0 4 0a2 2 0 1 0-4 0"/></svg></span><span class="trend-indicator trend-icon-region"><svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-arrows-join-2" viewBox="0 0 24 24" stroke-width="1.5" stroke="#ffffff" fill="#6c757d" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M3 7h5l3.5 5h9.5"/><path d="M3 17h5l3.5-5h9.5"/><path d="M18 15l3-3l-3-3"/></svg></span><span class="trend-indicator trend-icon-growth"><svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-activity" viewBox="0 0 24 24" stroke-width="1.5" stroke="#ffffff" fill="#6c757d" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M3 12h4l3 8l4-16l3 8h4"/></svg></span><svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-flask-2" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M6.1 15h11.8"/><path d="M14 3v7.342a6 6 0 0 1 1.318 10.658h-6.635a6 6 0 0 1 1.317-10.66v-7.34h4z"/><path d="M9 3h6"/></svg><p>Primær Analyse</p></div>
                <div class="arrow"><svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-arrow-right" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M5 12l14 0"/><path d="M13 18l6-6"/><path d="M13 6l6 6"/></svg></div>
                <div class="workflow-step" id="step-andre-analyser" data-info-target="info-andre-analyser" tabindex="0" aria-label="Trin 4: Videresendelse / Andre Analyser"><span class="priority-number">4</span><span class="trend-indicator trend-icon-tech"><svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-atom-2" viewBox="0 0 24 24" stroke-width="1.5" stroke="#ffffff" fill="#6c757d" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0-6 0"/><path d="M12 21l0-6"/><path d="M3.634 15.366l1.827-1.133"/><path d="M20.366 15.366l-1.827-1.133"/><path d="M12 3l0 6"/><path d="M20.366 8.634l-1.827 1.133"/><path d="M3.634 8.634l1.827 1.133"/></svg></span><span class="trend-indicator trend-icon-growth"><svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-activity" viewBox="0 0 24 24" stroke-width="1.5" stroke="#ffffff" fill="#6c757d" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M3 12h4l3 8l4-16l3 8h4"/></svg></span><svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-forklift" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M2 12h3a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1h-3a1 1 0 0 1-1-1v-5a1 1 0 0 1 1-1z"/><path d="M12 19v-11h-4"/><path d="M8 13h7"/><path d="M13 19h4a1 1 0 0 0 1-1v-7a1 1 0 0 0-1-1h-1"/><path d="M14 11v-5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v5"/><path d="M5 15h-1"/><path d="M16 14l2 0"/></svg><p>Videresendelse</p></div>
                <div class="arrow"><svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-arrow-right" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M5 12l14 0"/><path d="M13 18l6-6"/><path d="M13 6l6 6"/></svg></div>
                <div class="workflow-step" id="step-resultat-sp" data-info-target="info-resultat-sp" tabindex="0" aria-label="Trin 5: Resultat til Sundhedsplatformen og nationale baser"><span class="priority-number">2</span><span class="risk-marker"><svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-alert-triangle-filled" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 1.669l10.36 18.644a1.006 1.006 0 0 1-.877 1.504h-20.967a1.006 1.006 0 0 1-.876-1.504l10.36-18.644a1.006 1.006 0 0 1 1.754 0z" stroke-width="0" fill="currentColor"/><path d="M12 16a1 1 0 1 0 0 2a1 1 0 0 0 0-2z" stroke-width="0" fill="#ffffff"/><path d="M12 6a1 1 0 0 0-.993.883l-.007.117v6l.007.117a1 1 0 0 0 1.993 0l.007-.117v-6l-.007-.117a1 1 0 0 0-.993-.883z" stroke-width="0" fill="#ffffff"/></svg></span><span class="trend-indicator trend-icon-tech"><svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-atom-2" viewBox="0 0 24 24" stroke-width="1.5" stroke="#ffffff" fill="#6c757d" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0-6 0"/><path d="M12 21l0-6"/><path d="M3.634 15.366l1.827-1.133"/><path d="M20.366 15.366l-1.827-1.133"/><path d="M12 3l0 6"/><path d="M20.366 8.634l-1.827 1.133"/><path d="M3.634 8.634l1.827 1.133"/></svg></span><span class="trend-indicator trend-icon-security"><svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-shield-lock" viewBox="0 0 24 24" stroke-width="1.5" stroke="#ffffff" fill="#6c757d" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 3a12 12 0 0 0 8.5 3a12 12 0 0 1-8.5 15a12 12 0 0 1-8.5-15a12 12 0 0 0 8.5-3"/><path d="M12 11m-1 0a1 1 0 1 0 2 0a1 1 0 1 0-2 0"/><path d="M10 14a2 2 0 1 0 4 0a2 2 0 1 0-4 0"/></svg></span><span class="trend-indicator trend-icon-region"><svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-arrows-join-2" viewBox="0 0 24 24" stroke-width="1.5" stroke="#ffffff" fill="#6c757d" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M3 7h5l3.5 5h9.5"/><path d="M3 17h5l3.5-5h9.5"/><path d="M18 15l3-3l-3-3"/></svg></span><span class="trend-indicator trend-icon-growth"><svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-activity" viewBox="0 0 24 24" stroke-width="1.5" stroke="#ffffff" fill="#6c757d" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M3 12h4l3 8l4-16l3 8h4"/></svg></span><svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-database-export" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M4 6c0 1.657 3.582 3 8 3s8-1.343 8-3s-3.582-3-8-3s-8 1.343-8 3"/><path d="M4 6v6c0 1.657 3.582 3 8 3s8-1.343 8-3v-6"/><path d="M4 12v6c0 1.657 3.582 3 8 3c.157 0 .312-.002 .466-.005"/><path d="M15 15h6v6"/><path d="M21 15l-6 6"/></svg><p>Resultat til SP og nationale baser</p></div>
                <div class="arrow"><svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-arrow-right" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M5 12l14 0"/><path d="M13 18l6-6"/><path d="M13 6l6 6"/></svg></div>
                <div class="workflow-step" id="step-kliniker-adgang" data-info-target="info-kliniker-adgang" tabindex="0" aria-label="Trin 6: Kliniker og patientadgang (via SP)"><span class="priority-number">6</span><span class="trend-indicator trend-icon-security"><svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-shield-lock" viewBox="0 0 24 24" stroke-width="1.5" stroke="#ffffff" fill="#6c757d" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 3a12 12 0 0 0 8.5 3a12 12 0 0 1-8.5 15a12 12 0 0 1-8.5-15a12 12 0 0 0 8.5-3"/><path d="M12 11m-1 0a1 1 0 1 0 2 0a1 1 0 1 0-2 0"/><path d="M10 14a2 2 0 1 0 4 0a2 2 0 1 0-4 0"/></svg></span><span class="trend-indicator trend-icon-region"><svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-arrows-join-2" viewBox="0 0 24 24" stroke-width="1.5" stroke="#ffffff" fill="#6c757d" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M3 7h5l3.5 5h9.5"/><path d="M3 17h5l3.5-5h9.5"/><path d="M18 15l3-3l-3-3"/></svg></span><span class="trend-indicator trend-icon-growth"><svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-activity" viewBox="0 0 24 24" stroke-width="1.5" stroke="#ffffff" fill="#6c757d" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M3 12h4l3 8l4-16l3 8h4"/></svg></span><svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-user-search" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M8 7a4 4 0 1 0 8 0a4 4 0 0 0-8 0"/><path d="M6 21v-2a4 4 0 0 1 4-4h1.5"/><path d="M18 18m-3 0a3 3 0 1 0 6 0a3 3 0 1 0-6 0"/><path d="M20.2 20.2l1.8 1.8"/></svg><p>Kliniker og patientadgang</p></div>
                 </div> </div> <div id="cimt-band">
             <div class="cimt-icon" id="cimt-icon-servicedesk" data-info-target="info-cimt-servicedesk" data-cimt-relevant="step-proevetagning step-analyse step-kliniker-adgang" tabindex="0" aria-label="CIMT Funktion: Servicedesk"><svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-headset" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M4 14v-3a8 8 0 1 1 16 0v3"/><path d="M18 19c0 1.657-2.686 3-6 3s-6-1.343-6-3s2.686-3 6-3s6 1.343 6 3z"/><path d="M4 14a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3z"/><path d="M15 14a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3z"/></svg><p class="cimt-icon-title">Servicedesk</p></div>
             <div class="cimt-icon" id="cimt-icon-onsite" data-info-target="info-cimt-onsite" data-cimt-relevant="step-proevetagning step-analyse step-kliniker-adgang" tabindex="0" aria-label="CIMT Funktion: On-site"><svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-user-cog" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M8 7a4 4 0 1 0 8 0a4 4 0 0 0-8 0"/><path d="M6 21v-2a4 4 0 0 1 4-4h2.5"/><path d="M19.001 19m-2 0a2 2 0 1 0 4 0a2 2 0 1 0-4 0"/><path d="M19.001 15.5v1.5"/><path d="M19.001 21v1.5"/><path d="M22.032 17.496l-1.299.75"/><path d="M17.27 20.504l-1.3.75"/><path d="M15.97 17.496l1.3.75"/><path d="M20.733 20.504l1.299.75"/></svg><p class="cimt-icon-title">On-site</p></div>
             <div class="cimt-icon" id="cimt-icon-lokalsys" data-info-target="info-cimt-lokalsys" data-cimt-relevant="step-proevetagning step-analyse step-andre-analyser" tabindex="0" aria-label="CIMT Funktion: Lokale Systemer"><svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-building-community" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M8 9l5 5v7h-5v-4m0 4h-5v-7l5-5m1 1v-6a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v17h-8"/><path d="M13 7l0 .01"/><path d="M17 7l0 .01"/><path d="M17 11l0 .01"/><path d="M17 15l0 .01"/></svg><p class="cimt-icon-title">Lokale Sys.</p></div>
             <div class="cimt-icon" id="cimt-icon-infra" data-info-target="info-cimt-infra" data-cimt-relevant="step-transport step-analyse step-andre-analyser step-resultat-sp" tabindex="0" aria-label="CIMT Funktion: Infrastruktur"><svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-network" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M6 9a6 6 0 1 0 12 0a6 6 0 0 0-12 0"/><path d="M12 3c1.333.333 2 .667 2 1"/><path d="M12 3c-1.333.333-2 .667-2 1"/><path d="M12 15c1.333-.333 2-.667 2-1"/><path d="M12 15c-1.333-.333-2-.667-2-1"/><path d="M15 6a3 3 0 1 0 6 0a3 3 0 0 0-6 0"/><path d="M9 6a3 3 0 1 0 6 0a3 3 0 0 0-6 0"/><path d="M3 6a3 3 0 1 0 6 0a3 3 0 0 0-6 0"/><path d="M6 9v12"/><path d="M18 9v12"/><path d="M12 9v6"/><path d="M9 15h6"/><path d="M9 18h6"/><path d="M9 21h6"/></svg><p class="cimt-icon-title">Infrastruktur</p></div>
             <div class="cimt-icon" id="cimt-icon-medico" data-info-target="info-cimt-medico" data-cimt-relevant="step-proevetagning step-analyse step-andre-analyser" tabindex="0" aria-label="CIMT Funktion: Medico"><svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-stethoscope" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M6 4h-1a2 2 0 0 0-2 2v3.5h0a5.5 5.5 0 0 0 11 0v-3.5a2 2 0 0 0-2-2h-1"/><path d="M8 15a6 6 0 1 0 12 0v-3"/><path d="M11 3v2"/><path d="M6 6v2"/><path d="M20 10m-2 0a2 2 0 1 0 4 0a2 2 0 1 0-4 0"/></svg><p class="cimt-icon-title">Medico</p></div>
             <div class="cimt-icon" id="cimt-icon-applikationer" data-info-target="info-cimt-applikationer" data-cimt-relevant="step-proevetagning step-analyse step-andre-analyser step-resultat-sp" tabindex="0" aria-label="CIMT Funktion: Applikationer (LIMS)"><svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-settings-cog" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12.038 18.918l-.467.1a2 2 0 0 1-1.9-1.243l-.233-.7a2 2 0 0 0-1.71-1.33l-.705-.087a2 2 0 0 1-1.312-1.935l.088-.7a2 2 0 0 0-1.33-1.71l-.7-.233a2 2 0 0 1-1.243-1.9l.1-.467a2 2 0 0 1 1.9-1.243l.7-.233a2 2 0 0 0 1.71-1.33l.087-.705a2 2 0 0 1 1.935-1.312l.7.088a2 2 0 0 0 1.71-1.33l.233-.7a2 2 0 0 1 1.9-1.243l.467.1a2 2 0 0 1 1.243 1.9l.233.7a2 2 0 0 0 1.33 1.71l.705.087a2 2 0 0 1 1.312 1.935l-.088.7a2 2 0 0 0 1.33 1.71l.7.233a2 2 0 0 1 1.243 1.9l-.1.467a2 2 0 0 1-1.9 1.243l-.7.233a2 2 0 0 0-1.71 1.33l-.087.705a2 2 0 0 1-1.935 1.312l-.7-.088a2 2 0 0 0-1.71 1.33l-.233.7a2 2 0 0 1-1.9-1.243z"/><path d="M10 9a3 3 0 1 0 6 0a3 3 0 0 0-6 0"/><path d="M19.001 19m-2 0a2 2 0 1 0 4 0a2 2 0 1 0-4 0"/><path d="M19.001 15.5v1.5"/><path d="M19.001 21v1.5"/><path d="M22.032 17.496l-1.299.75"/><path d="M17.27 20.504l-1.3.75"/><path d="M15.97 17.496l1.3.75"/><path d="M20.733 20.504l1.299.75"/></svg><p class="cimt-icon-title">Applikationer</p></div>
             <div class="cimt-icon" id="cimt-icon-strategi" data-info-target="info-cimt-strategi" data-cimt-relevant="step-analyse step-resultat-sp" tabindex="0" aria-label="CIMT Funktion: Strategiske projekter"><svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-route" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M3 19a2 2 0 1 0 4 0a2 2 0 0 0-4 0"/><path d="M19 7a2 2 0 1 0 4 0a2 2 0 0 0-4 0"/><path d="M11 19h5.5a3.5 3.5 0 0 0 0-7h-8a3.5 3.5 0 0 1 0-7h4.5"/></svg><p class="cimt-icon-title">Strategi & Proj.</p></div>
            <div class="cimt-icon" id="cimt-icon-govsec" data-info-target="info-cimt-govsec" data-cimt-relevant="step-proevetagning step-transport step-analyse step-andre-analyser step-resultat-sp step-kliniker-adgang" tabindex="0" aria-label="CIMT Funktion: Styring & Sikkerhed">
                 <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-shield-cog" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                   <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                   <path d="M12 21a12 12 0 0 1-8.5 -15a12 12 0 0 0 8.5 -3a12 12 0 0 0 8.5 3a12 12 0 0 1 .112 4.13" />
                   <path d="M19.001 19m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
                   <path d="M19.001 15.5v1.5" />
                   <path d="M19.001 21v1.5" />
                   <path d="M22.032 17.496l-1.299 .75" />
                   <path d="M17.27 20.504l-1.3 .75" />
                   <path d="M15.97 17.496l1.3 .75" />
                   <path d="M20.733 20.504l1.299 .75" />
                 </svg>
                 <p class="cimt-icon-title">Styring & Sikkerhed</p>
             </div>
            </div> <div id="trends-band">
             <div class="cimt-icon" id="trend-tech" data-info-target="info-trend-tech" data-examples-map="{&quot;step-analyse&quot;: &quot;AI/IoT på udstyr&quot;,&quot;step-resultat-sp&quot;: &quot;Cloud-muligheder&quot;,&quot;step-andre-analyser&quot;: &quot;Automatisering/robotter&quot;,&quot;Generelt&quot;: &quot;Integration af IoT&quot;}" data-relevant-steps="step-analyse step-andre-analyser step-resultat-sp" data-relevant-cimt="cimt-icon-infra cimt-icon-medico cimt-icon-applikationer cimt-icon-strategi cimt-icon-govsec" tabindex="0" aria-label="Tendens/Risiko: Ny Teknologi"><svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-atom-2" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0-6 0"/><path d="M12 21l0-6"/><path d="M3.634 15.366l1.827-1.133"/><path d="M20.366 15.366l-1.827-1.133"/><path d="M12 3l0 6"/><path d="M20.366 8.634l-1.827 1.133"/><path d="M3.634 8.634l1.827 1.133"/></svg><p class="cimt-icon-title">Ny Teknologi</p></div>
             <div class="cimt-icon" id="trend-security" data-info-target="info-trend-security" data-examples-map="{&quot;step-analyse&quot;: &quot;Malware-risiko på udstyr/net&quot;,&quot;step-resultat-sp&quot;: &quot;Krav til kryptering/logning&quot;,&quot;step-kliniker-adgang&quot;: &quot;Phishing/MFA&quot;,&quot;step-proevetagning&quot;: &quot;Datasikkerhed ved registrering&quot;,&quot;Generelt&quot;: &quot;Overholdelse af NIS2/GDPR&quot;}" data-relevant-steps="step-proevetagning step-analyse step-resultat-sp step-kliniker-adgang" data-relevant-cimt="cimt-icon-govsec cimt-icon-infra" tabindex="0" aria-label="Trend/Risiko: Sikkerhed & Krav"><svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-shield-lock" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 3a12 12 0 0 0 8.5 3a12 12 0 0 1-8.5 15a12 12 0 0 1-8.5-15a12 12 0 0 0 8.5-3"/><path d="M12 11m-1 0a1 1 0 1 0 2 0a1 1 0 1 0-2 0"/><path d="M10 14a2 2 0 1 0 4 0a2 2 0 1 0-4 0"/></svg><p class="cimt-icon-title">Sikkerhed & Krav</p></div>
             <div class="cimt-icon" id="trend-region" data-info-target="info-trend-region" data-examples-map="{&quot;step-resultat-sp&quot;: &quot;Harmonisering af data/formater&quot;,&quot;step-analyse&quot;: &quot;Konsolidering af LIMS?&quot;,&quot;step-kliniker-adgang&quot;: &quot;Fælles adgang/SP&quot;,&quot;Generelt&quot;: &quot;Behov for standarder & governance&quot;}" data-relevant-steps="step-analyse step-resultat-sp step-kliniker-adgang" data-relevant-cimt="cimt-icon-infra cimt-icon-applikationer cimt-icon-strategi cimt-icon-govsec cimt-icon-servicedesk cimt-icon-lokalsys" tabindex="0" aria-label="Trend/Risiko: Region Øst"><svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-arrows-join-2" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M3 7h5l3.5 5h9.5"/><path d="M3 17h5l3.5-5h9.5"/><path d="M18 15l3-3l-3-3"/></svg><p class="cimt-icon-title">Region Øst</p></div>
             <div class="cimt-icon" id="trend-growth" data-info-target="info-trend-growth" data-examples-map="{&quot;step-analyse&quot;: &quot;Skalerbarhed af udstyr/LIMS&quot;,&quot;step-resultat-sp&quot;: &quot;Flere integrationer (FHIR/HL7)&quot;,&quot;step-kliniker-adgang&quot;: &quot;Øget bruger-support&quot;,&quot;step-andre-analyser&quot;:&quot;Øget datamængde&quot;,&quot;Generelt&quot;: &quot;Kapacitetsplanlægning&quot;}" data-relevant-steps="step-analyse step-andre-analyser step-resultat-sp step-kliniker-adgang" data-relevant-cimt="cimt-icon-infra cimt-icon-applikationer cimt-icon-govsec cimt-icon-servicedesk" tabindex="0" aria-label="Trend/Risiko: Vækst & Integration"><svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-activity" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M3 12h4l3 8l4-16l3 8h4"/></svg><p class="cimt-icon-title">Vækst & Integration</p></div>
             <div class="separator"></div> <div class="cimt-icon" id="betydning-priority" data-betydning-visual="priority" tabindex="0" aria-label="Visuel effekt: Prioritering">
                 <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-list-numbers" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M11 6h9" /><path d="M11 12h9" /><path d="M12 18h8" /><path d="M4 16a2 2 0 1 1 4 0c0 .591 -.5 1 -1 1.5l-3 2.5h4" /><path d="M6 10v-6l-2 2" /></svg>
                 <p class="cimt-icon-title">Prioritering</p>
             </div>
             <div class="cimt-icon" id="betydning-unified" data-betydning-visual="unified" tabindex="0" aria-label="Visuel effekt: Samlet Indsats">
                 <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-box-multiple" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M7 3m0 2a2 2 0 0 1 2 -2h10a2 2 0 0 1 2 2v10a2 2 0 0 1 -2 2h-10a2 2 0 0 1 -2 -2z" /><path d="M17 17v2a2 2 0 0 1 -2 2h-10a2 2 0 0 1 -2 -2v-10a2 2 0 0 1 2 -2h2" /></svg>
                 <p class="cimt-icon-title">Samlet Indsats</p>
             </div>
             <div class="cimt-icon" id="betydning-risk" data-betydning-visual="risk" tabindex="0" aria-label="Visuel effekt: Risici">
                 <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-alert-triangle" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 9v4" /><path d="M10.363 3.591l-8.106 13.534a1.914 1.914 0 0 0 1.636 2.871h16.214a1.914 1.914 0 0 0 1.636 -2.87l-8.106 -13.536a1.914 1.914 0 0 0 -3.274 0z" /><path d="M12 16h.01" /></svg>
                 <p class="cimt-icon-title">Risici</p>
             </div>
        </div> <div class="info-box-container">
            <div class="info-box" id="info-proevetagning"><h2>Prøvetagning (Afdeling)</h2><p>...</p></div>
            <div class="info-box" id="info-transport"><h2>Transport (Rørpost)</h2><p>...</p></div>
            <div class="info-box" id="info-analyse"><h2>Primær Analyse (Biokemisk Lab)</h2><p>...</p></div>
            <div class="info-box" id="info-andre-analyser"><h2>Evt. Videresendelse / Andre Analyser</h2><p>...</p></div>
            <div class="info-box" id="info-resultat-sp"><h2>Resultat til Sundhedsplatformen og nationale baser</h2><p>...</p></div>
            <div class="info-box" id="info-kliniker-adgang"><h2>Kliniker og patientadgang (via SP)</h2><p>...</p></div>

            <div class="info-box" id="info-cimt-servicedesk"><h2>CIMT: Servicedesk</h2><p>Første kontakt for brugere ved IT-problemer. Håndterer incidents, service requests (fx nye brugere, adgang) og generel support til Labka, SP mv.</p></div>
            <div class="info-box" id="info-cimt-onsite"><h2>CIMT: On-site</h2><p>Yder hjælp ude på hospitalerne med PC'ere, printere, skærme og andet lokalt IT-udstyr.</p></div>
            <div class="info-box" id="info-cimt-lokalsys"><h2>CIMT: Lokale Systemer</h2><p>Hjælper hospitalerne ved problemer med lokalt forvaltede systemer, f.eks. mindre systemer der kun bruges til udvalgte analyser.</p></div>
            <div class="info-box" id="info-cimt-infra"><h2>CIMT: Infrastruktur</h2><p>Leverer fundamentet: Netværk, servere (fysiske/virtuelle), storage, databaser og operativsystemer for Labka, SP og integrationer.</p></div>
            <div class="info-box" id="info-cimt-medico"><h2>CIMT: Medico</h2><p>Sikrer integration mellem medicoteknisk udstyr (analyseapparater) og Labka II. Supporterer dataflow, netværk for udstyr og relateret fejlsøgning.</p></div>
            <div class="info-box" id="info-cimt-applikationer"><h2>CIMT: Applikationer (LIMS)</h2><p><strong>Systemejer for Labka II.</strong> Ansvarlig for konfiguration (analyser, regler), opdateringer, test, 2./3. level support og daglig drift. Koordinerer tæt med lab, leverandør og andre CIMT-teams for at sikre LIMS-systemets funktion og integrationer.</p></div>
            <div class="info-box" id="info-cimt-strategi"><h2>CIMT: Strategiske projekter</h2><p>Driver større, tværgående strategiske projekter, f.eks. anskaffelse og implementering af nye, store IT-systemer som LIMS/Biokemi.</p></div>
             <div class="info-box" id="info-cimt-govsec"><h2>CIMT: Styring & Sikkerhed</h2>
                <p><strong>IT-Kontrakter:</strong> Formulerer krav til IT-kontrakter og styringen af leverandører, herunder kravspecifikationer og opfølgning på leverandøraftaler.</p>
                <p><strong>Arkitekt:</strong> Definerer IT-løsningernes design, integrationsmønstre og sikrer overholdelse af standarder. Arbejder med langsigtede strategier og teknologivalg.</p>
                <p><strong>Operationel Sikkerhed:</strong> Overvåger systemernes sikkerhed. Sikrer patching, håndtering af sårbarheder, backup og restore for kritiske systemer.</p>
                <p><strong>Informationssikkerhed:</strong> Sikrer fortrolighed og integritet af patientdata (GDPR). Styrer adgangskontrol, logning, kryptering og sikkerhedshændelser.</p>
            </div>
             <div class="info-box" id="info-trend-tech"><h2>Tendens/Risiko: Ny Teknologi</h2><p>...</p><p><em>(...)</em></p></div>
            <div class="info-box" id="info-trend-security"><h2>Tendens/Risiko: Sikkerhed & Krav</h2><p>...</p><p><em>(...)</em></p></div>
            <div class="info-box" id="info-trend-region"><h2>Tendens/Risiko: Region Øst</h2><p>...</p><p><em>(...)</em></p></div>
            <div class="info-box" id="info-trend-growth"><h2>Tendens/Risiko: Vækst & Integration</h2><p>...</p><p><em>(...)</em></p></div>

        </div> </div> <script src="https://cdn.jsdelivr.net/npm/leader-line-new@1.1.9/leader-line.min.js"></script>
    <script src="script.js"></script>
</body>
</html>
