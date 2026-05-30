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
    // 3. Initialize Production-Grade Dashboard & Sparkline Charts
    // ----------------------------------------------------
    
    // Global Chart.js configuration tweaks
    Chart.defaults.color = "#94a3b8";
    Chart.defaults.font.family = "Space Grotesk";

    // Chart 1: Spam Trend Line Chart
    const ctxTrend = document.getElementById("chart-spam-trend").getContext("2d");
    new Chart(ctxTrend, {
        type: "line",
        data: {
            labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
            datasets: [{
                label: "Spam Blocked",
                data: [18, 32, 24, 45, 38, 15, 29],
                borderColor: "#3B82F6",
                backgroundColor: "rgba(59, 130, 246, 0.1)",
                fill: true,
                tension: 0.4,
                borderWidth: 3,
                pointRadius: 4,
                pointBackgroundColor: "#06B6D4"
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                x: { grid: { display: false } },
                y: { grid: { color: "rgba(255, 255, 255, 0.03)" }, min: 0 }
            }
        }
    });

    // Chart 2: Spam vs Ham Pie Chart (87% Ham / 13% Spam)
    const ctxPie = document.getElementById("chart-spam-ham-pie").getContext("2d");
    new Chart(ctxPie, {
        type: "doughnut",
        data: {
            labels: ["Ham (Safe)", "Spam (Blocked)"],
            datasets: [{
                data: [87, 13],
                backgroundColor: ["#10B981", "#EF4444"],
                borderWidth: 0,
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: "bottom",
                    labels: { boxWidth: 12, padding: 15, color: "#F8FAFC" }
                }
            },
            cutout: "70%"
        }
    });

    // Chart 3: Confidence Distribution Bar Chart
    const ctxDist = document.getElementById("chart-confidence-dist").getContext("2d");
    new Chart(ctxDist, {
        type: "bar",
        data: {
            labels: ["0-20%", "20-40%", "40-60%", "60-80%", "80-100%"],
            datasets: [{
                data: [5, 12, 18, 25, 40],
                backgroundColor: "rgba(6, 182, 212, 0.8)",
                borderRadius: 6,
                barThickness: 15
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                x: { grid: { display: false } },
                y: { grid: { color: "rgba(255, 255, 255, 0.03)" }, min: 0 }
            }
        }
    });

    // Chart 4: Latency sparkline (Line chart)
    const ctxLatency = document.getElementById("chart-latency-sparkline").getContext("2d");
    new Chart(ctxLatency, {
        type: "line",
        data: {
            labels: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
            datasets: [{
                data: [15, 12, 22, 18, 14, 16, 25, 14, 18, 16],
                borderColor: "#06B6D4",
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

        // Run the 1.5s visual staging animation sequence
        try {
            // Stage 1: Features
            animationStatusLabel.innerText = "Extracting Features...";
            stage1.className = "active-stage";
            await delay(300);

            // Stage 2: TF-IDF
            stage1.className = "done";
            stage2.className = "active-stage";
            animationStatusLabel.innerText = "Generating TF-IDF Matrix...";
            await delay(300);

            // Stage 3: Naive Bayes
            stage2.className = "done";
            stage3.className = "active-stage";
            animationStatusLabel.innerText = "Running Naive Bayes...";
            await delay(300);

            // Stage 4: Confidence
            stage3.className = "done";
            stage4.className = "active-stage";
            animationStatusLabel.innerText = "Calculating Confidence...";
            await delay(300);

            // Stage 5: Prediction Complete
            stage4.className = "done";
            animationStatusLabel.innerText = "Prediction Complete!";
            await delay(300);

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
            resKeywordsBox.innerHTML = `<span style="font-size: 0.8rem; color: var(--text-secondary);">None detected</span>`;
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

        // Render TF-IDF Tab features
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
        row.className = "history-row fadeIn";
        
        // Pick a random mock name
        const randIdx = Math.floor(Math.random() * mockNames.length);
        const senderName = mockNames[randIdx];
        const initials = getInitials(senderName);
        
        const randColorClass = `color-${Math.floor(Math.random() * 5) + 1}`;

        let snippet = message;
        if (snippet.length > 50) {
            snippet = snippet.substring(0, 47) + "...";
        }

        row.innerHTML = `
            <td>
                <div class="sender-cell">
                    <div class="table-avatar-badge ${randColorClass}">${initials}</div>
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
            tfidfTableBody.innerHTML = `<tr><td colspan="2" style="text-align: center; color: #a1a1aa; padding: 20px;">No active vocabulary words in this message. Try typing standard English words.</td></tr>`;
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

        tfidfChartInstance = new Chart(ctx, {
            type: "bar",
            data: {
                labels: chartWords,
                datasets: [{
                    label: "TF-IDF Weight",
                    data: chartScores,
                    backgroundColor: "rgba(59, 130, 246, 0.75)",
                    borderColor: "#3b82f6",
                    borderWidth: 1,
                    borderRadius: 4
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
                        grid: { color: "rgba(255, 255, 255, 0.03)" },
                        ticks: { color: "#64748b" }
                    },
                    y: {
                        grid: { display: false },
                        ticks: { color: "#fff", font: { family: "Space Grotesk", weight: 600 } }
                    }
                }
            }
        });
    }
});
