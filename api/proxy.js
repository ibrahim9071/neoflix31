const CHANNELS = {
  kanal1:  { base: "https://trox.cinemax6.com:3545/stream/", source: "play.m3u8" },
  kanal2:  { base: "https://trox.cinemax6.com:3545/stream/", source: "play2.m3u8" },
  kanal3:  { base: "https://trox.cinemax6.com:3545/stream/", source: "play3.m3u8" },
  kanal4:  { base: "https://trox.cinemax6.com:3545/stream/", source: "play4.m3u8" },
  kanal5:  { base: "https://trox.cinemax6.com:3545/stream/", source: "play5.m3u8" },
  kanal6:  { base: "https://trox.cinemax6.com:3545/stream/", source: "play6.m3u8" },
  kanal7:  { base: "https://trox.cinemax6.com:3545/stream/", source: "play7.m3u8" },
  kanal8:  { base: "https://trox.cinemax6.com:3545/stream/", source: "play8.m3u8" },
  kanal9:  { base: "https://trox.cinemax6.com:3545/stream/", source: "play9.m3u8" },
  kanal10: { base: "https://trox.cinemax6.com:3545/stream/", source: "play10.m3u8" },
  kanal11: { base: "https://trox.cinemax6.com:3545/stream/", source: "play11.m3u8" },
  kanal12: { base: "https://trox.cinemax6.com:3545/stream/", source: "play12.m3u8" },
  kanal13: { base: "https://trox.cinemax6.com:3545/stream/", source: "play13.m3u8" },
  kanal14: { base: "https://trox.cinemax6.com:3545/stream/", source: "play14.m3u8" },
  kanal15: { base: "https://trox.cinemax6.com:3545/stream/", source: "play15.m3u8" },
  kanal16: { base: "https://trox.cinemax6.com:3545/stream/", source: "play16.m3u8" },
  kanal17: { base: "https://trox.cinemax6.com:3545/stream/", source: "play17.m3u8" },
  kanal18: { base: "https://trox.cinemax6.com:3545/stream/", source: "play18.m3u8" },
  kanal19: { base: "https://trox.cinemax6.com:3545/stream/", source: "play19.m3u8" },
  kanal20: { base: "https://trox.cinemax6.com:3545/stream/", source: "play20.m3u8" },
};

export default async function handler(req, res) {
  try {
    res.setHeader("Access-Control-Allow-Origin", "*");

    const url = new URL(req.url, `http://${req.headers.host}`);
    const ch = url.searchParams.get("ch");
    const segment = url.searchParams.get("url");

    if (!ch || !CHANNELS[ch]) return res.status(404).send("Kanal bulunamadı");

    const { base, source } = CHANNELS[ch];

    // TS segment isteği
    if (segment) {
      const segmentUrl = decodeURIComponent(segment);
      const segRes = await fetch(segmentUrl);
      const buffer = await segRes.arrayBuffer();

      res.setHeader("Content-Type", "video/MP2T");
      return res.status(200).send(Buffer.from(buffer));
    }

    // Playlist çek
    const response = await fetch(base + source);
    let text = await response.text();

    // TS linklerini rewrite
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
