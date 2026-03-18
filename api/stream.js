export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  try {
    const sourceUrl = 'https://trox.cinemax6.com:3545/stream/play.m3u8';
    const response = await fetch(sourceUrl);

    if (!response.ok) throw new Error('Kaynak bulunamadı');

    let text = await response.text();

    // TS linklerini mutlak yap
    text = text.replace(/(.*\.ts)/g, (match) => {
      if (match.startsWith('http')) return match;
      return 'https://trox.cinemax6.com:3545/stream/' + match;
    });

    res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
    res.status(200).send(text);

  } catch (err) {
    res.status(500).send('Hata: ' + err.message);
  }
}
