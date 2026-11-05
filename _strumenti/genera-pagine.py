"""Rigenera le pagine interne partendo da _pagine/*.html usando intestazione e
pie' di pagina di index.html. Uso:  python _strumenti/genera-pagine.py"""
import re, pathlib
R = pathlib.Path(__file__).resolve().parent.parent
idx = (R / "index.html").read_text(encoding="utf-8")
head = idx[:idx.index('<script type="application/ld+json">')] + "</head>\n"
header = idx[idx.index("<body>"):idx.index('<main id="contenuto">')]
footer = idx[idx.index("</main>"):idx.index("<!-- Modale prenotazione -->")]
BASE = "https://www.ashtangayogacatania.it/"
for src in sorted((R / "_pagine").glob("*.html")):
    meta, body = src.read_text(encoding="utf-8").split("\n---\n", 1)
    m = dict(l.split(": ", 1) for l in meta.splitlines() if ": " in l)
    h = re.sub(r"<title>.*?</title>", "<title>" + m["TITLE"] + "</title>", head)
    h = re.sub(r'(<meta name="description" content=")[^"]*', lambda x: x.group(1) + m["DESC"], h)
    h = re.sub(r'(<meta property="og:description" content=")[^"]*', lambda x: x.group(1) + m["DESC"], h)
    h = re.sub(r'(<meta property="og:title" content=")[^"]*', lambda x: x.group(1) + m["TITLE"], h)
    h = h.replace('href="' + BASE + '"', 'href="' + BASE + src.name + '"').replace('content="' + BASE + '"', 'content="' + BASE + src.name + '"')
    if "NOINDEX" in meta: h = h.replace("</head>", '<meta name="robots" content="noindex">\n</head>')
    # le ancore del menu puntano alle sezioni della home (tranne il link "Vai al contenuto")
    hd = re.sub(r'href="#(?!contenuto")([\w-]+)"', lambda x: 'href="./#' + x.group(1) + '"', header)
    hd = hd.replace('<a href="' + src.name + '">', '<a href="' + src.name + '" aria-current="page">')
    out = h + hd + '<main id="contenuto">\n' + body.strip() + "\n" + footer + '<script src="js/config.js"></script>\n<script src="js/main.js"></script>\n</body>\n</html>\n'
    (R / src.name).write_text(out, encoding="utf-8")
    print("ok", src.name)
