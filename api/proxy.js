const CHANNELS = {
  kanal1: {
    base: "https://trox.cinemax6.com:3545/stream/",
    source: "play.m3u8"
  },

  kanal2: {
    base: "https://test.com/live/",
    source: "index.m3u8"
  }

  // buraya istediğin kadar ekle
};

export default async function handler(req, res) {
  try {
    res.setHeader("Access-Control-Allow-Origin", "*");

    const url = new URL(req.url, `http://${req.headers.host}`);
    const ch = url.searchParams.get("ch");
    const segment = url.searchParams.get("url");

    if (!ch || !CHANNELS[ch]) {
      return res.status(404).send("Kanal bulunamadı");
    }

    const { base, source } = CHANNELS[ch];

    // 🔹 TS segment isteği
    if (segment) {
      const segmentUrl = decodeURIComponent(segment);
      const segRes = await fetch(segmentUrl);
      const buffer = await segRes.arrayBuffer();

      res.setHeader("Content-Type", "video/MP2T");
      return res.status(200).send(Buffer.from(buffer));
    }

    // 🔹 Playlist çek
    const response = await fetch(base + source);
    let text = await response.text();

    // 🔹 TS linklerini rewrite et
    text = text.replace(/(.*\.ts)/g, (match) => {
      const fullUrl = base + match.trim();
      return `/api/proxy?ch=${ch}&url=${encodeURIComponent(fullUrl)}`;
    });

    res.setHeader("Content-Type", "application/vnd.apple.mpegurl");
    res.status(200).send(text);

  } catch (err) {
    res.status(500).send("Hata: " + err.message);
  }
}
