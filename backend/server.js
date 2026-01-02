require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// CORS configuration
const corsOptions = {
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
};

app.use(cors(corsOptions));
app.use(express.json());

// Headers for otakudesu.best
const HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Referer': 'https://otakudesu.best/'
};

// Helper function to extract resolution from text
function extractResolution(text) {
    const resMatch = text.match(/(\d+)p/i);
    return resMatch ? parseInt(resMatch[1]) : 0;
}

// Helper function to determine format (MP4 or MKV)
function extractFormat(text) {
    if (/mkv/i.test(text)) return 'mkv';
    if (/mp4/i.test(text)) return 'mp4';
    return 'unknown';
}

// API endpoint: Search anime
app.get('/api/search', async (req, res) => {
    try {
        const query = req.query.q;
        if (!query) {
            return res.status(400).json({ error: 'Query parameter "q" is required' });
        }

        const searchUrl = `https://otakudesu.best/?s=${encodeURIComponent(query)}&post_type=anime`;
        console.log(`[SEARCH] ${searchUrl}`);

        const response = await axios.get(searchUrl, { headers: HEADERS });
        const $ = cheerio.load(response.data);

        const results = [];
        $('ul.chivsrc li[style="list-style:none;"]').each((i, elem) => {
            const $elem = $(elem);
            const titleElem = $elem.find('h2 a');

            if (!titleElem.length) return;

            const title = titleElem.text().trim();
            const url = titleElem.attr('href');

            // Extract cover image
            let coverImage = '';
            const imgElem = $elem.find('img');
            if (imgElem.length) {
                // Get the main src (not srcset)
                coverImage = imgElem.attr('src') || '';
            }

            let genres = 'Unknown';
            let status = 'Unknown';
            let rating = 'Unknown';
            let episodes = 'Unknown';

            $elem.find('div.set').each((j, setDiv) => {
                const $setDiv = $(setDiv);
                const strongTag = $setDiv.find('b').text();

                if (strongTag === 'Genres') {
                    genres = $setDiv.find('a').map((k, a) => $(a).text()).get().join(', ');
                } else if (strongTag === 'Status') {
                    status = $setDiv.text().replace('Status :', '').trim();
                } else if (strongTag === 'Rating') {
                    rating = $setDiv.text().replace('Rating :', '').trim();
                }
            });

            // Extract episode info from title
            const episodeMatch = title.match(/Episode\s+(\d+)\s*–\s*(\d+)/i);
            if (episodeMatch) {
                episodes = `${episodeMatch[1]}-${episodeMatch[2]}`;
            } else {
                const singleEpMatch = title.match(/Episode\s+(\d+)/i);
                if (singleEpMatch) {
                    episodes = singleEpMatch[1];
                }
            }

            results.push({ title, url, coverImage, genres, status, rating, episodes });
        });

        console.log(`[SEARCH] Found ${results.length} results`);
        res.json({ results });
    } catch (error) {
        console.error('[SEARCH ERROR]', error.message);
        res.status(500).json({ error: 'Failed to search anime', details: error.message });
    }
});

// API endpoint: Get episode list
app.get('/api/episodes', async (req, res) => {
    try {
        const animeUrl = req.query.url;
        if (!animeUrl) {
            return res.status(400).json({ error: 'Query parameter "url" is required' });
        }

        console.log(`[EPISODES] ${animeUrl}`);

        const response = await axios.get(animeUrl, { headers: HEADERS });
        const $ = cheerio.load(response.data);

        const reguler = [];
        const ova = [];
        const batch = [];

        $('.episodelist').each((i, elist) => {
            $(elist).find('ul li').each((j, li) => {
                const $a = $(li).find('a');
                if (!$a.length) return;

                const href = $a.attr('href');
                const text = $a.text().trim();

                if (!href) return;

                // Categorize episodes
                if (/batch/i.test(href)) {
                    batch.push({ name: text, url: href });
                } else if (/OVA/i.test(text)) {
                    ova.push({ name: text, url: href });
                } else if (/episode[- ]?\d+/i.test(href) && /Episode\s*\d+/i.test(text)) {
                    reguler.push({ name: text, url: href });
                }
            });
        });

        console.log(`[EPISODES] Regular: ${reguler.length}, OVA: ${ova.length}, Batch: ${batch.length}`);
        res.json({ reguler, ova, batch });
    } catch (error) {
        console.error('[EPISODES ERROR]', error.message);
        res.status(500).json({ error: 'Failed to get episodes', details: error.message });
    }
});

// API endpoint: Get download links with resolutions
app.get('/api/download-links', async (req, res) => {
    try {
        const episodeUrl = req.query.url;
        if (!episodeUrl) {
            return res.status(400).json({ error: 'Query parameter "url" is required' });
        }

        console.log(`[DOWNLOAD-LINKS] ${episodeUrl}`);

        const response = await axios.get(episodeUrl, { headers: HEADERS });
        const $ = cheerio.load(response.data);

        const links = {
            pixeldrain: {},
            other: {}
        };

        // Find all download sections
        $('.download ul li').each((i, li) => {
            const $li = $(li);
            const strongText = $li.find('strong').text().trim();

            // Extract resolution and format from strong text (e.g., "Mp4 720p", "Mkv 1080p")
            const resolution = extractResolution(strongText);
            const format = extractFormat(strongText);

            if (resolution === 0 || format === 'unknown') return;

            // Find Pdrain link
            $li.find('a').each((j, a) => {
                const $a = $(a);
                const linkText = $a.text().trim();
                const href = $a.attr('href');

                if (/Pdrain/i.test(linkText) && href) {
                    const key = `${format}_${resolution}p`;
                    links.pixeldrain[key] = href;
                }
            });
        });

        // Process Pixeldrain links through safelink
        const processedLinks = { pixeldrain: {} };

        for (const [key, safelinkUrl] of Object.entries(links.pixeldrain)) {
            try {
                const finalUrl = await bypassSafelink(safelinkUrl);
                if (finalUrl) {
                    processedLinks.pixeldrain[key] = finalUrl;
                }
            } catch (err) {
                console.error(`[BYPASS ERROR] ${key}:`, err.message);
            }
        }

        // Add convenience links for "highest" quality
        const mp4Links = Object.entries(processedLinks.pixeldrain)
            .filter(([key]) => key.startsWith('mp4_'))
            .sort((a, b) => extractResolution(b[0]) - extractResolution(a[0]));

        const mkvLinks = Object.entries(processedLinks.pixeldrain)
            .filter(([key]) => key.startsWith('mkv_'))
            .sort((a, b) => extractResolution(b[0]) - extractResolution(a[0]));

        if (mp4Links.length > 0) {
            processedLinks.pixeldrain.highest_mp4 = mp4Links[0][1];
        }
        if (mkvLinks.length > 0) {
            processedLinks.pixeldrain.highest_mkv = mkvLinks[0][1];
        }

        console.log(`[DOWNLOAD-LINKS] Found ${Object.keys(processedLinks.pixeldrain).length} links`);
        res.json(processedLinks);
    } catch (error) {
        console.error('[DOWNLOAD-LINKS ERROR]', error.message);
        res.status(500).json({ error: 'Failed to get download links', details: error.message });
    }
});

// Helper function to bypass safelink
async function bypassSafelink(url) {
    try {
        const response = await axios.get(url, {
            headers: HEADERS,
            maxRedirects: 5
        });

        // Check if already redirected to pixeldrain
        if (response.request.res.responseUrl && /pixeldrain\.com/i.test(response.request.res.responseUrl)) {
            return response.request.res.responseUrl;
        }

        // Parse HTML to find pixeldrain link
        const $ = cheerio.load(response.data);
        const pixeldrainLink = $('a[href*="pixeldrain.com"]').attr('href');

        if (pixeldrainLink) {
            return pixeldrainLink;
        }

        return null;
    } catch (error) {
        console.error('[BYPASS ERROR]', error.message);
        return null;
    }
}

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
    console.log(`🚀 Anime Downloader API running on port ${PORT}`);
    console.log(`📡 CORS enabled for: ${process.env.CORS_ORIGIN || '*'}`);
});
