// Download e-library file (ALWAYS force .pdf download)
router.get('/elibrary/download/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const file = await ElibraryFile.findById(id);

    if (!file) {
      return res.status(404).json({ success: false, message: 'File not found' });
    }

    const remoteUrl = file.url;

    // Fetch file from Cloudinary
    const resp = await fetch(remoteUrl);
    if (!resp.ok) {
      console.error('Cloudinary fetch error:', resp.status, resp.statusText);
      return res.status(502).json({ success: false, message: 'Failed to fetch file from storage' });
    }

    // Force correct downloadable filename
    const safeFilename =
      `${(file.title || 'document').replace(/[^a-z0-9._- ]/gi, '')}.pdf`;

    // Force correct PDF headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${safeFilename}"`);
    res.setHeader('Content-Transfer-Encoding', 'binary');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    // STREAM SUPPORT (Undici / node-fetch)
    const body = resp.body;

    if (!body) {
      return res.status(500).json({
        success: false,
        message: 'Empty response from cloud storage'
      });
    }

    // If Node Readable stream, pipe directly
    if (typeof body.pipe === 'function') {
      return body.pipe(res);
    }

    // If Web Stream (Undici), convert to Node stream
    const { Readable } = require('stream');
    if (typeof Readable.fromWeb === 'function') {
      return Readable.fromWeb(body).pipe(res);
    }

    // Fallback: read manually from Web stream
    const reader = body.getReader();
    const stream = new Readable({ read() {} });

    (async () => {
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          stream.push(Buffer.from(value));
        }
        stream.push(null);
      } catch (err) {
        stream.destroy(err);
      }
    })();

    stream.pipe(res);
  } catch (err) {
    console.error('Error downloading PDF:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to download PDF file',
      error: err.message
    });
  }
});
