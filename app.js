// State management
let currentAnimeUrl = '';
let availableEpisodes = { reguler: [], ova: [], batch: [] };
let selectedResolution = 'highest_mp4';
let downloadQueue = [];

// DOM Elements
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const resultsSection = document.getElementById('resultsSection');
const resultsGrid = document.getElementById('resultsGrid');
const episodeSection = document.getElementById('episodeSection');
const episodeInfo = document.getElementById('episodeInfo');
const resolutionSelect = document.getElementById('resolutionSelect');
const episodeInput = document.getElementById('episodeInput');
const ovaInput = document.getElementById('ovaInput');
const downloadAllBtn = document.getElementById('downloadAllBtn');
const downloadSelectedBtn = document.getElementById('downloadSelectedBtn');
const queueSection = document.getElementById('queueSection');
const queueContainer = document.getElementById('queueContainer');
const logContainer = document.getElementById('logContainer');
const clearLogBtn = document.getElementById('clearLogBtn');

// Event Listeners
searchBtn.addEventListener('click', handleSearch);
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSearch();
});
resolutionSelect.addEventListener('change', (e) => {
    selectedResolution = e.target.value;
    localStorage.setItem('preferredResolution', selectedResolution);
    log(`Kualitas diubah ke: ${e.target.value}`, 'info');
});
downloadAllBtn.addEventListener('click', handleDownloadAll);
downloadSelectedBtn.addEventListener('click', handleDownloadSelected);
clearLogBtn.addEventListener('click', clearLog);

// Load saved preferences
const savedResolution = localStorage.getItem('preferredResolution');
if (savedResolution) {
    selectedResolution = savedResolution;
    resolutionSelect.value = savedResolution;
}

// Logging function
function log(message, type = 'info') {
    const entry = document.createElement('p');
    entry.className = `log-entry log-${type}`;
    entry.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
    logContainer.appendChild(entry);
    logContainer.scrollTop = logContainer.scrollHeight;
}

function clearLog() {
    logContainer.innerHTML = '<p class="log-entry log-info">Log dibersihkan.</p>';
}

// Set button loading state
function setButtonLoading(button, isLoading) {
    if (isLoading) {
        button.classList.add('loading');
        button.disabled = true;
    } else {
        button.classList.remove('loading');
        button.disabled = false;
    }
}

// Search anime
async function handleSearch() {
    const query = searchInput.value.trim();
    if (!query) {
        log('Masukkan judul anime terlebih dahulu!', 'warning');
        return;
    }

    setButtonLoading(searchBtn, true);
    log(`Mencari anime: ${query}...`, 'info');

    try {
        const response = await fetch(`${CONFIG.API_URL}/api/search?q=${encodeURIComponent(query)}`);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Gagal mencari anime');
        }

        displayResults(data.results);
        log(`Ditemukan ${data.results.length} hasil`, 'success');
    } catch (error) {
        log(`Error: ${error.message}`, 'error');
        console.error('Search error:', error);
    } finally {
        setButtonLoading(searchBtn, false);
    }
}

// Helper: Get rating color class
function getRatingColor(rating) {
    const numRating = parseFloat(rating);
    if (isNaN(numRating)) return 'rating-unknown';
    if (numRating >= 9) return 'rating-blue';
    if (numRating >= 8) return 'rating-green';
    if (numRating >= 7) return 'rating-yellow';
    if (numRating >= 6) return 'rating-orange';
    return 'rating-red';
}

// Helper: Get status color class
function getStatusColor(status) {
    if (/completed/i.test(status)) return 'status-completed';
    if (/ongoing/i.test(status)) return 'status-ongoing';
    return 'status-unknown';
}

// Display search results as cards
function displayResults(results) {
    resultsGrid.innerHTML = '';

    if (results.length === 0) {
        resultsSection.style.display = 'none';
        return;
    }

    results.forEach((anime, index) => {
        const card = document.createElement('div');
        card.className = 'anime-card';

        const coverImg = anime.coverImage || 'https://via.placeholder.com/300x420?text=No+Image';
        const ratingClass = getRatingColor(anime.rating);
        const statusClass = getStatusColor(anime.status);

        card.innerHTML = `
            <div class="card-cover">
                <img src="${coverImg}" alt="${anime.title}" loading="lazy" onerror="this.src='https://via.placeholder.com/300x420?text=No+Image'">
            </div>
            <div class="card-content">
                <h3 class="card-title">${anime.title}</h3>
                <div class="card-meta">
                    <span class="meta-item">📺 ${anime.episodes}</span>
                    <span class="meta-item ${statusClass}">${anime.status}</span>
                </div>
                <div class="card-rating ${ratingClass}">
                    <span class="rating-icon">⭐</span>
                    <span class="rating-value">${anime.rating}</span>
                </div>
                <div class="card-genres">${anime.genres}</div>
            </div>
        `;

        card.addEventListener('click', () => selectAnime(anime, card));
        resultsGrid.appendChild(card);
    });

    resultsSection.style.display = 'block';
}

// Select anime and load episodes
async function selectAnime(anime, cardElement) {
    // Highlight selected card
    document.querySelectorAll('.anime-card').forEach(card => {
        card.classList.remove('selected');
    });
    cardElement.classList.add('selected');

    currentAnimeUrl = anime.url;
    log(`Memuat episode untuk: ${anime.title}...`, 'info');
    episodeInfo.innerHTML = '<p class="info-text">Memuat episode...</p>';
    episodeSection.style.display = 'block';

    try {
        const response = await fetch(`${CONFIG.API_URL}/api/episodes?url=${encodeURIComponent(anime.url)}`);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Gagal memuat episode');
        }

        availableEpisodes = data;
        displayEpisodeInfo(data);
        log(`Ditemukan ${data.reguler.length} episode reguler, ${data.ova.length} OVA`, 'success');
    } catch (error) {
        log(`Error: ${error.message}`, 'error');
        episodeInfo.innerHTML = '<p class="info-text" style="color: var(--error);">Gagal memuat episode</p>';
    }
}

// Display episode information
function displayEpisodeInfo(episodes) {
    let infoHTML = '';

    if (episodes.reguler.length > 0) {
        infoHTML += `<p class="info-text">📺 Tersedia ${episodes.reguler.length} episode reguler (1-${episodes.reguler.length})</p>`;
    }

    if (episodes.ova.length > 0) {
        infoHTML += `<p class="info-text">🎬 Tersedia ${episodes.ova.length} OVA</p>`;
    }

    if (episodes.batch.length > 0) {
        infoHTML += `<p class="info-text">📦 Tersedia ${episodes.batch.length} batch download</p>`;
    }

    if (!infoHTML) {
        infoHTML = '<p class="info-text">Tidak ada episode yang tersedia</p>';
    }

    episodeInfo.innerHTML = infoHTML;
}

// Parse episode input (e.g., "1-5,7,10-12")
function parseEpisodeInput(input, maxEpisode) {
    const episodes = new Set();
    const parts = input.split(',').map(p => p.trim()).filter(p => p);

    for (const part of parts) {
        if (part.includes('-')) {
            const [start, end] = part.split('-').map(n => parseInt(n.trim()));
            if (!isNaN(start) && !isNaN(end)) {
                for (let i = start; i <= Math.min(end, maxEpisode); i++) {
                    episodes.add(i);
                }
            }
        } else {
            const num = parseInt(part);
            if (!isNaN(num) && num >= 1 && num <= maxEpisode) {
                episodes.add(num);
            }
        }
    }

    return Array.from(episodes).sort((a, b) => a - b);
}

// Download all episodes
async function handleDownloadAll() {
    if (availableEpisodes.reguler.length === 0) {
        log('Tidak ada episode yang tersedia untuk diunduh', 'warning');
        return;
    }

    const episodeIndices = Array.from({ length: availableEpisodes.reguler.length }, (_, i) => i + 1);
    const ovaIndices = Array.from({ length: availableEpisodes.ova.length }, (_, i) => i + 1);

    await queueDownloads(episodeIndices, ovaIndices);
}

// Download selected episodes
async function handleDownloadSelected() {
    const episodeInputValue = episodeInput.value.trim();
    const ovaInputValue = ovaInput.value.trim();

    const episodeIndices = episodeInputValue
        ? parseEpisodeInput(episodeInputValue, availableEpisodes.reguler.length)
        : [];

    const ovaIndices = ovaInputValue
        ? parseEpisodeInput(ovaInputValue, availableEpisodes.ova.length)
        : [];

    if (episodeIndices.length === 0 && ovaIndices.length === 0) {
        log('Pilih episode atau OVA yang ingin diunduh', 'warning');
        return;
    }

    await queueDownloads(episodeIndices, ovaIndices);
}

// Queue downloads
async function queueDownloads(episodeIndices, ovaIndices) {
    downloadQueue = [];
    queueContainer.innerHTML = '';
    queueSection.style.display = 'block';

    log(`Mempersiapkan ${episodeIndices.length + ovaIndices.length} download...`, 'info');

    // Queue regular episodes
    for (const index of episodeIndices) {
        const episode = availableEpisodes.reguler[index - 1];
        if (episode) {
            downloadQueue.push({
                type: 'episode',
                index,
                name: episode.name,
                url: episode.url
            });
        }
    }

    // Queue OVAs
    for (const index of ovaIndices) {
        const ova = availableEpisodes.ova[index - 1];
        if (ova) {
            downloadQueue.push({
                type: 'ova',
                index,
                name: ova.name,
                url: ova.url
            });
        }
    }

    // Process queue sequentially
    for (let i = 0; i < downloadQueue.length; i++) {
        await processDownload(downloadQueue[i], i);

        // Add delay between downloads for mobile stability
        if (i < downloadQueue.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
    }

    log('Semua download selesai diproses!', 'success');
}

// Process individual download
async function processDownload(item, queueIndex) {
    const queueId = `queue-${queueIndex}`;

    // Create queue item UI
    const queueItem = document.createElement('div');
    queueItem.className = 'queue-item';
    queueItem.id = queueId;
    queueItem.innerHTML = `
        <div class="queue-info">
            <div class="queue-title">${item.name}</div>
            <div class="queue-meta">
                <span class="badge badge-resolution">${selectedResolution.replace('_', ' ').toUpperCase()}</span>
                <span class="badge badge-status" id="${queueId}-status">Menunggu...</span>
                <span class="badge badge-provider" id="${queueId}-provider" style="display: none;"></span>
            </div>
        </div>
        <div class="queue-action" id="${queueId}-action">
            <!-- Download button will be inserted here -->
        </div>
    `;
    queueContainer.appendChild(queueItem);

    const statusBadge = document.getElementById(`${queueId}-status`);
    const providerBadge = document.getElementById(`${queueId}-provider`);
    const actionDiv = document.getElementById(`${queueId}-action`);

    try {
        // Update status
        statusBadge.textContent = 'Mengambil link...';
        statusBadge.classList.add('downloading');
        log(`Mengambil link download untuk ${item.name}...`, 'info');

        // Fetch download links
        const response = await fetch(`${CONFIG.API_URL}/api/download-links?url=${encodeURIComponent(item.url)}`);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Gagal mendapatkan link download');
        }

        // Get download link with intelligent fallback
        let downloadLink = null;
        let actualResolution = selectedResolution;
        let provider = 'Unknown';

        // Define fallback order for each format
        const mp4Fallbacks = ['mp4_720p', 'mp4_480p', 'mp4_360p'];
        const mkvFallbacks = ['mkv_1080p', 'mkv_720p', 'mkv_480p'];

        if (data.pixeldrain) {
            // Try selected resolution first
            if (data.pixeldrain[selectedResolution]) {
                downloadLink = data.pixeldrain[selectedResolution];
                provider = 'Pixeldrain';
            }
            // Handle "highest" selections
            else if (selectedResolution === 'highest_mp4') {
                // Try MP4 in descending order
                for (const res of mp4Fallbacks) {
                    if (data.pixeldrain[res]) {
                        downloadLink = data.pixeldrain[res];
                        actualResolution = res;
                        provider = 'Pixeldrain';
                        break;
                    }
                }
            }
            else if (selectedResolution === 'highest_mkv') {
                // Try MKV in descending order
                for (const res of mkvFallbacks) {
                    if (data.pixeldrain[res]) {
                        downloadLink = data.pixeldrain[res];
                        actualResolution = res;
                        provider = 'Pixeldrain';
                        break;
                    }
                }
            }
            // Fallback for specific resolutions
            else {
                const isMP4 = selectedResolution.startsWith('mp4_');
                const fallbackList = isMP4 ? mp4Fallbacks : mkvFallbacks;
                const selectedIndex = fallbackList.indexOf(selectedResolution);

                // Try lower resolutions in the same format
                if (selectedIndex !== -1) {
                    for (let i = selectedIndex; i < fallbackList.length; i++) {
                        if (data.pixeldrain[fallbackList[i]]) {
                            downloadLink = data.pixeldrain[fallbackList[i]];
                            actualResolution = fallbackList[i];
                            provider = 'Pixeldrain';
                            if (fallbackList[i] !== selectedResolution) {
                                log(`${selectedResolution} tidak tersedia, menggunakan ${actualResolution}`, 'warning');
                            }
                            break;
                        }
                    }
                }

                // If still no link, try any available resolution
                if (!downloadLink) {
                    const available = Object.keys(data.pixeldrain).filter(k => !k.startsWith('highest_'));
                    if (available.length > 0) {
                        actualResolution = available[0];
                        downloadLink = data.pixeldrain[actualResolution];
                        provider = 'Pixeldrain';
                        log(`${selectedResolution} tidak tersedia, menggunakan ${actualResolution}`, 'warning');
                    }
                }
            }
        }

        if (!downloadLink) {
            throw new Error('Link download tidak ditemukan');
        }

        // Extract file ID and get filename
        const fileIdMatch = downloadLink.match(/\/(?:file|u)\/([a-zA-Z0-9]+)/);
        const fileId = fileIdMatch ? fileIdMatch[1] : 'episode';
        const filename = `${item.name.replace(/[^a-z0-9]/gi, '_')}_${actualResolution}.mp4`;

        // Update UI
        statusBadge.textContent = 'Siap Download';
        statusBadge.classList.remove('downloading');
        providerBadge.textContent = provider;
        providerBadge.style.display = 'inline-flex';

        // Create download button - open Pixeldrain page instead of direct API link
        // This bypasses hotlink detection
        const downloadBtn = document.createElement('a');
        downloadBtn.href = `https://pixeldrain.com/u/${fileId}`;
        downloadBtn.target = '_blank';
        downloadBtn.rel = 'noopener noreferrer';
        downloadBtn.className = 'btn btn-success';
        downloadBtn.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M10 14L5 9h3V3h4v6h3l-5 5z" fill="currentColor"/>
                <path d="M3 17h14v2H3v-2z" fill="currentColor"/>
            </svg>
            <span>Buka Link</span>
        `;

        // Click handler
        downloadBtn.addEventListener('click', (e) => {
            log(`Membuka link download: ${item.name}`, 'success');
            statusBadge.textContent = 'Link Dibuka';
            statusBadge.classList.add('downloading');
        });

        actionDiv.appendChild(downloadBtn);

        // Auto-open for sequential download
        setTimeout(() => {
            downloadBtn.click();
        }, 500);

        log(`✅ Link download siap: ${item.name} - Klik "Buka Link" lalu klik tombol Download di Pixeldrain`, 'success');

    } catch (error) {
        log(`❌ Error untuk ${item.name}: ${error.message}`, 'error');
        statusBadge.textContent = 'Error';
        statusBadge.classList.remove('downloading');
        statusBadge.classList.add('error');

        actionDiv.innerHTML = `<span style="color: var(--error); font-size: 0.9rem;">Gagal mendapatkan link</span>`;
    }
}

// Initialize
log('Aplikasi siap digunakan! Cari anime favorit kamu.', 'success');
