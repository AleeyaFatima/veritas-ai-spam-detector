document.addEventListener("DOMContentLoaded", () => {
    // ----------------------------------------------------
    // 1. Navigation Pages Router (Sidebar Nav Click Handles)
    // ----------------------------------------------------
    const navItems = document.querySelectorAll(".nav-item:not(.disabled)");
    const pageSections = document.querySelectorAll(".page-section");

    navItems.forEach(item => {
        item.addEventListener("click", () => {
            navItems.forEach(nav => nav.classList.remove("active"));
            item.classList.add("active");

            const targetPageId = item.getAttribute("data-target");

            pageSections.forEach(section => {
                section.classList.remove("active");
                if (section.id === targetPageId) {
                    section.classList.add("active");
                }
            });
        });
    });

    // Hamburger Dropdown Toggle Logic for mobile/tablet
    const menuToggle = document.getElementById("mobile-menu-toggle");
    const navPillsRow = document.querySelector(".nav-pills-row");

    if (menuToggle && navPillsRow) {
        menuToggle.addEventListener("click", (e) => {
            e.stopPropagation();
            navPillsRow.classList.toggle("show-menu");
        });

        // Close menu on nav pill click
        navItems.forEach(item => {
            item.addEventListener("click", () => {
                navPillsRow.classList.remove("show-menu");
            });
        });

        // Close menu when clicking outside
        document.addEventListener("click", (e) => {
            if (!navPillsRow.contains(e.target) && !menuToggle.contains(e.target)) {
                navPillsRow.classList.remove("show-menu");
            }
        });
    }

    // ----------------------------------------------------
    // 2. Preset Chips Click handler
    // ----------------------------------------------------
    const presetsChips = document.querySelectorAll(".chip");
    const inputArea = document.getElementById("message-input");
    const form = document.getElementById("prediction-form");
    const submitBtn = document.getElementById("submit-btn");

    presetsChips.forEach(chip => {
        chip.addEventListener("click", () => {
            const text = chip.getAttribute("data-text");
            inputArea.value = text;
            triggerPrediction();
        });
    });

    function triggerPrediction() {
        const event = new Event("submit", { cancelable: true });
        form.dispatchEvent(event);
    }

    // ----------------------------------------------------
    // 3. Initialize Framer Studio Chart.js Analytics
    // ----------------------------------------------------
    
    // Global Chart.js configurations - professional warm cream & maroon theme defaults
    Chart.defaults.color = "#6B5558"; // Ink Muted secondary Slate-Maroon
    Chart.defaults.font.family = "'Outfit', 'Inter', -apple-system, sans-serif";
    Chart.defaults.font.size = 11;

    // Chart 1: Spam Trend Line Chart
    const ctxTrend = document.getElementById("chart-spam-trend").getContext("2d");
    const trendGradient = ctxTrend.createLinearGradient(0, 0, 0, 200);
    trendGradient.addColorStop(0, "rgba(128, 0, 32, 0.18)");
    trendGradient.addColorStop(1, "rgba(128, 0, 32, 0.0)");

    new Chart(ctxTrend, {
        type: "line",
        data: {
            labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
            datasets: [{
                label: "Spam Blocked",
                data: [18, 32, 24, 45, 38, 15, 29],
                borderColor: "#800020", // Deep Crimson Maroon
                backgroundColor: trendGradient,
                fill: true,
                tension: 0.35, // Smooth Bezier Splines
                borderWidth: 2.5,
                pointRadius: 5,
                pointBackgroundColor: "#FAF6EE", // Cream centers
                pointBorderColor: "#800020", // Maroon borders
                pointBorderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                x: { grid: { display: false }, border: { color: "rgba(128, 0, 32, 0.12)", width: 1 } },
                y: { grid: { color: "rgba(128, 0, 32, 0.06)" }, border: { color: "rgba(128, 0, 32, 0.12)", width: 1 }, min: 0 }
            }
        }
    });

    // Chart 2: Spam vs Ham Doughnut Chart
    const ctxPie = document.getElementById("chart-spam-ham-pie").getContext("2d");
    new Chart(ctxPie, {
        type: "doughnut",
        data: {
            labels: ["Ham (Safe)", "Spam (Blocked)"],
            datasets: [{
                data: [87, 13],
                backgroundColor: ["#800020", "#D4AF37"], // Maroon vs Warm Gold
                borderColor: "#FFFFFF", // Fits the card background perfectly
                borderWidth: 2.5
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: "bottom",
                    labels: { boxWidth: 10, padding: 12, color: "#2E1A1E" }
                }
            },
            cutout: "72%"
        }
    });

    // Chart 3: Confidence Distribution Bar Chart
    const ctxDist = document.getElementById("chart-confidence-dist").getContext("2d");
    const barGradient = ctxDist.createLinearGradient(0, 0, 0, 200);
    barGradient.addColorStop(0, "#800020");
    barGradient.addColorStop(1, "rgba(128, 0, 32, 0.5)");

    new Chart(ctxDist, {
        type: "bar",
        data: {
            labels: ["0-20%", "20-40%", "40-60%", "60-80%", "80-100%"],
            datasets: [{
                data: [5, 12, 18, 25, 40],
                backgroundColor: barGradient,
                borderColor: "transparent",
                borderWidth: 0,
                borderRadius: 5,
                barThickness: 14
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                x: { grid: { display: false }, border: { color: "rgba(128, 0, 32, 0.12)", width: 1 } },
                y: { grid: { color: "rgba(128, 0, 32, 0.06)" }, border: { color: "rgba(128, 0, 32, 0.12)", width: 1 }, min: 0 }
            }
        }
    });

    // Chart 4: Latency sparkline
    const ctxLatency = document.getElementById("chart-latency-sparkline").getContext("2d");
    new Chart(ctxLatency, {
        type: "line",
        data: {
            labels: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
            datasets: [{
                data: [15, 12, 22, 18, 14, 16, 25, 14, 18, 16],
                borderColor: "#800020", // Maroon path
                borderWidth: 2,
                fill: false,
                tension: 0.3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: { enabled: false }
            },
            scales: {
                x: { display: false },
                y: { display: false, min: 0 }
            },
            elements: { point: { radius: 0 } }
        }
    });

    // ----------------------------------------------------
    // 4. Predict Request & Animation Sequencer
    // ----------------------------------------------------
    const animationOverlay = document.getElementById("animation-overlay");
    const animationStatusLabel = document.getElementById("animation-status-label");
    const resultViewPanel = document.getElementById("result-view-panel");
    
    // Checklist steps
    const stage1 = document.getElementById("stage-1");
    const stage2 = document.getElementById("stage-2");
    const stage3 = document.getElementById("stage-3");
    const stage4 = document.getElementById("stage-4");
    
    // Result panels
    const resBadge = document.getElementById("res-badge");
    const resConfidenceText = document.getElementById("res-confidence-text");
    const resBarFill = document.getElementById("res-bar-fill");
    const resRiskLevel = document.getElementById("res-risk-level");
    const resKeywordsBox = document.getElementById("res-keywords-box");
    
    // Pipeline text variables
    const nlpRaw = document.getElementById("nlp-raw");
    const nlpSymbols = document.getElementById("nlp-symbols");
    const nlpStopwords = document.getElementById("nlp-stopwords");

    // TF-IDF page components
    const tfidfTableBody = document.querySelector("#table-tfidf-weights tbody");
    let tfidfChartInstance = null;
    
    // Prediction history table body
    const historyTableBody = document.querySelector("#history-scans-table tbody");

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const messageText = inputArea.value.trim();
        if (!messageText) return;

        // Reset checkmark list states
        stage1.className = "pending";
        stage2.className = "pending";
        stage3.className = "pending";
        stage4.className = "pending";

        // Show Loading Overlay
        animationOverlay.classList.remove("hidden");
        submitBtn.disabled = true;

        // Trigger API Fetch request immediately in background to prevent lag later
        let apiData = null;
        let fetchError = null;

        const apiPromise = fetch("/predict", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ message: messageText })
        })
        .then(res => {
            if (!res.ok) throw new Error("API call failed");
            return res.json();
        })
        .then(data => { apiData = data; })
        .catch(err => { fetchError = err; });

        // Run the 1.2s visual staging diagnostic sequence (Simulating Framer Motion spring delays)
        try {
            // Stage 1: Features
            animationStatusLabel.innerText = "Extracting Features...";
            stage1.className = "active-stage";
            await delay(250);

            // Stage 2: TF-IDF
            stage1.className = "done";
            // Replace the circle/clock SVG inside with a Lucide-style Check icon
            stage1.querySelector("svg").innerHTML = `<polyline points="20 6 9 17 4 12"/>`;
            
            stage2.className = "active-stage";
            animationStatusLabel.innerText = "Generating TF-IDF Matrix...";
            await delay(250);

            // Stage 3: Naive Bayes
            stage2.className = "done";
            stage2.querySelector("svg").innerHTML = `<polyline points="20 6 9 17 4 12"/>`;
            
            stage3.className = "active-stage";
            animationStatusLabel.innerText = "Running Naive Bayes...";
            await delay(250);

            // Stage 4: Confidence
            stage3.className = "done";
            stage3.querySelector("svg").innerHTML = `<polyline points="20 6 9 17 4 12"/>`;
            
            stage4.className = "active-stage";
            animationStatusLabel.innerText = "Calculating Confidence...";
            await delay(250);

            // Stage 5: Prediction Complete
            stage4.className = "done";
            stage4.querySelector("svg").innerHTML = `<polyline points="20 6 9 17 4 12"/>`;
            animationStatusLabel.innerText = "Scan Complete!";
            await delay(200);

            // Wait for API promise to resolve if not yet completed
            await apiPromise;

            if (fetchError) {
                throw fetchError;
            }

            // Hide overlay & show outputs
            animationOverlay.classList.add("hidden");
            displayResult(apiData);
            prependHistoryLog(messageText, apiData.label, Math.round(apiData.confidence * 100));

        } catch (error) {
            console.error(error);
            animationOverlay.classList.add("hidden");
            alert("Spam Detection API call failed. Verify Flask server is active.");
        } finally {
            submitBtn.disabled = false;
        }
    });

    // Helper Promise for delays
    function delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // 5. Display Prediction Results
    function displayResult(data) {
        resultViewPanel.classList.remove("hidden");

        const isSpam = data.label.toLowerCase() === "spam";
        const confidencePct = Math.round(data.confidence * 100);

        // Update badge
        resBadge.innerText = data.label.toUpperCase();
        resBadge.className = `result-badge-display ${isSpam ? "spam" : "ham"}`;

        // Update progress bar
        resConfidenceText.innerText = `${confidencePct}%`;
        resBarFill.className = `res-bar-fill ${isSpam ? "spam" : "ham"}`;
        resBarFill.style.width = `${confidencePct}%`;

        // Update Risk Level
        resRiskLevel.innerText = isSpam ? "High" : "Low";
        resRiskLevel.className = `detail-val ${isSpam ? "text-red" : "text-green"}`;

        // Clear and add detected keywords checkboxes
        resKeywordsBox.innerHTML = "";
        const terms = Object.keys(data.tfidf_scores);
        if (terms.length === 0) {
            resKeywordsBox.innerHTML = `<span style="font-size: 0.8rem; color: var(--ink-dark);">None detected</span>`;
        } else {
            terms.forEach(term => {
                const span = document.createElement("span");
                span.className = "keyword-badge";
                span.innerHTML = `✓ ${term}`;
                resKeywordsBox.appendChild(span);
            });
        }

        // Update NLP Preprocessing Tab values
        nlpRaw.innerText = data.steps.raw || "[Empty message]";
        nlpSymbols.innerText = data.steps.no_symbols || "[Empty after symbol cleaning]";
        nlpStopwords.innerText = data.steps.no_stopwords || "[Empty (all words filtered)]";

        // Render TF-IDF Page features
        renderTfidfPage(data.tfidf_scores);
    }

    // Helper to calculate initials from full name
    function getInitials(fullName) {
        return fullName
            .split(" ")
            .map(word => word.charAt(0))
            .join("")
            .substring(0, 2)
            .toUpperCase();
    }

    // 6. Prepend scan logs to history table
    const mockNames = ["Darrell Steward", "Eleanor Pena", "Albert Flores", "Jenny Wilson"];

    function prependHistoryLog(message, label, confidence) {
        const row = document.createElement("tr");
        row.className = "history-row";
        
        // Pick a random mock name
        const randIdx = Math.floor(Math.random() * mockNames.length);
        const senderName = mockNames[randIdx];
        const initials = getInitials(senderName);

        let snippet = message;
        if (snippet.length > 50) {
            snippet = snippet.substring(0, 47) + "...";
        }

        row.innerHTML = `
            <td>
                <div class="sender-cell">
                    <div class="table-avatar-badge">${initials}</div>
                    <span>${senderName}</span>
                </div>
            </td>
            <td class="message-snippet-td" title="${message}">${snippet}</td>
            <td><span class="status-badge ${label.toLowerCase()}">${label.toUpperCase()}</span></td>
            <td class="time-td">Just Now (${confidence}%)</td>
        `;

        // Prepend to history table
        historyTableBody.insertBefore(row, historyTableBody.firstChild);

        // Keep table size limited to 8 rows to prevent overflow
        if (historyTableBody.children.length > 8) {
            historyTableBody.removeChild(historyTableBody.lastChild);
        }
    }

    // 7. Render TF-IDF Tab features
    function renderTfidfPage(tfidfScores) {
        tfidfTableBody.innerHTML = "";

        const words = Object.keys(tfidfScores);
        const scores = Object.values(tfidfScores);

        if (words.length === 0) {
            tfidfTableBody.innerHTML = `<tr><td colspan="2" style="text-align: center; color: var(--ink-dark); padding: 20px;">No active vocabulary words in this message. Try typing standard English words.</td></tr>`;
            if (tfidfChartInstance) {
                tfidfChartInstance.destroy();
                tfidfChartInstance = null;
            }
            return;
        }

        // Sort weights descending
        const items = words.map((w, idx) => ({ word: w, score: scores[idx] }));
        items.sort((a, b) => b.score - a.score);

        // Fill Table
        items.forEach(item => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td><strong>${item.word}</strong></td>
                <td><code>${item.score.toFixed(4)}</code></td>
            `;
            tfidfTableBody.appendChild(tr);
        });

        // Fill Horizontal Bar Chart
        const chartWords = items.map(item => item.word);
        const chartScores = items.map(item => item.score);

        const ctx = document.getElementById("chart-tfidf-words").getContext("2d");
        
        if (tfidfChartInstance) {
            tfidfChartInstance.destroy();
        }

        const tfidfGradient = ctx.createLinearGradient(0, 0, 300, 0);
        tfidfGradient.addColorStop(0, "rgba(128, 0, 32, 0.5)");
        tfidfGradient.addColorStop(1, "#800020");

        tfidfChartInstance = new Chart(ctx, {
            type: "bar",
            data: {
                labels: chartWords,
                datasets: [{
                    label: "TF-IDF Weight",
                    data: chartScores,
                    backgroundColor: tfidfGradient,
                    borderColor: "transparent",
                    borderWidth: 0,
                    borderRadius: 5
                }]
            },
            options: {
                indexAxis: "y",
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    x: {
                        grid: { color: "rgba(128, 0, 32, 0.06)" },
                        border: { color: "rgba(128, 0, 32, 0.12)", width: 1 },
                        ticks: { color: "#6B5558" }
                    },
                    y: {
                        grid: { display: false },
                        border: { color: "rgba(128, 0, 32, 0.12)", width: 1 },
                        ticks: { color: "#2E1A1E", font: { weight: "600" } }
                    }
                }
            }
        });
    }

    // ----------------------------------------------------
    // 8. 3D Parallax Rotate Effect on Landing Hero Card
    // ----------------------------------------------------
    const heroCard = document.getElementById("isometric-3d-card");
    const perspectiveViewport = document.querySelector(".perspective-viewport");
    
    if (heroCard && perspectiveViewport) {
        perspectiveViewport.addEventListener("mousemove", (e) => {
            const rect = perspectiveViewport.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            
            // Limit angles to avoid extreme distortions
            const rotateX = -(y / rect.height) * 40;
            const rotateY = (x / rect.width) * 40;
            
            heroCard.style.transform = `rotateX(${32 + rotateX}deg) rotateY(${-24 + rotateY}deg)`;
        });
        
        perspectiveViewport.addEventListener("mouseleave", () => {
            heroCard.style.transform = "rotateX(32deg) rotateY(-24deg)";
        });
    }

    // ----------------------------------------------------
    // 9. AJAX Active Learning Live Refiner Form Handler
    // ----------------------------------------------------
    const refinerForm = document.getElementById("refiner-form");
    const refineInput = document.getElementById("refine-message-input");
    const refinerOverlay = document.getElementById("refiner-loading-overlay");
    const refineStatusLabel = document.getElementById("refine-status-text");
    
    const statSamples = document.getElementById("refine-stat-samples");
    const statVocab = document.getElementById("refine-stat-vocab");
    const statCustom = document.getElementById("refine-stat-custom");
    
    let customInjectionsCount = 0;
    
    if (refinerForm && refineInput) {
        refinerForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            
            const text = refineInput.value.trim();
            const labelChoice = document.querySelector('input[name="refine-label"]:checked').value;
            
            if (!text) return;
            
            // Show loader and start interactive re-training
            refinerOverlay.classList.remove("hidden");
            refineStatusLabel.innerText = "Appending training instance to CSV corpus...";
            
            try {
                // Micro-staged status changes for premium aesthetic feel
                await new Promise(r => setTimeout(r, 600));
                refineStatusLabel.innerText = "Parsing terms & fitting TfidfVectorizer...";
                
                const response = await fetch("/refine", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ message: text, label: labelChoice })
                });
                
                if (!response.ok) {
                    throw new Error("Active training fit failed on server.");
                }
                
                const result = await response.json();
                
                await new Promise(r => setTimeout(r, 700));
                refineStatusLabel.innerText = "Recomputing Bayesian Likelihood coefficients...";
                
                await new Promise(r => setTimeout(r, 500));
                refineStatusLabel.innerText = "Persisting updated pickles to server memory...";
                
                await new Promise(r => setTimeout(r, 400));
                
                // Update live counters
                if (statSamples && result.total_samples) {
                    statSamples.innerText = Number(result.total_samples).toLocaleString();
                }
                if (statVocab && result.vocabulary_size) {
                    statVocab.innerText = Number(result.vocabulary_size).toLocaleString();
                }
                
                customInjectionsCount++;
                if (statCustom) {
                    statCustom.innerText = customInjectionsCount;
                }
                
                // Clear state & close overlay
                refineInput.value = "";
                refinerOverlay.classList.add("hidden");
                
                // Native professional alert showing updated specifications
                alert(`[SUCCESS] Naive Bayes Model Refined!\n\nSentence: "${text}"\nTrained class: ${labelChoice.toUpperCase()}\nNew Vocabulary Size: ${result.vocabulary_size} terms\nTotal Corpus Size: ${result.total_samples} samples.\n\nYou can now test your newly trained word immediately inside the scan console!`);
                
            } catch (err) {
                refinerOverlay.classList.add("hidden");
                alert("[ERROR] Model refinement failed: " + err.message);
            }
        });
    }
});
