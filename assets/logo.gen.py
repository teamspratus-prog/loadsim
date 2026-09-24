# Generator for the CargoLoadStudio mark, kept so the geometry stays
# reproducible rather than hand-tweaked. Not deployed (see .vercelignore).
#
#   python3 assets/logo.gen.py
#
# prints the <svg> to paste into the five pages. Isometric projection, the same
# one the simulator's canvas uses: P(x,y,z) = ((x-y)cos30, (x+y)sin30 - z).
# Proportions were measured off the approved artwork.

import math
C = math.cos(math.radians(30)); S = 0.5
def P(x,y,z): return ((x-y)*C, (x+y)*S - z)
def f(p): return "%.2f,%.2f" % p

L, W, H = 100.0, 45.3, 46.8          # container, length normalised to 100
LX, LZ  = 49.0, 35.6                 # load: length along the floor, height
DZ      = H                          # dashed plane: the ceiling itself

# ── load block: the three faces this projection shows ──────────────────────
top  = [P(0,0,LZ),  P(LX,0,LZ),  P(LX,W,LZ),  P(0,W,LZ)]
left = [P(0,W,LZ),  P(LX,W,LZ),  P(LX,W,0),   P(0,W,0)]
end  = [P(LX,0,LZ), P(LX,W,LZ),  P(LX,W,0),   P(LX,0,0)]

# ── shell: two rectangles and four posts, drawn over the load ──────────────
floor   = [P(0,0,0), P(L,0,0), P(L,W,0), P(0,W,0)]
ceiling = [P(0,0,H), P(L,0,H), P(L,W,H), P(0,W,H)]
posts   = [(P(x,y,0), P(x,y,H)) for x,y in ((0,0),(L,0),(L,W),(0,W))]

# ── empty space: the free deck outlined at ceiling height ──────────────────
dash = [P(LX,0,DZ), P(L,0,DZ), P(L,W,DZ), P(LX,W,DZ)]

pts = top+left+end+floor+ceiling+dash+[p for a,b in posts for p in (a,b)]
pad = 7
x0 = min(p[0] for p in pts)-pad; x1 = max(p[0] for p in pts)+pad
y0 = min(p[1] for p in pts)-pad; y1 = max(p[1] for p in pts)+pad

out = []
out.append('<svg class="logo" viewBox="%.2f %.2f %.2f %.2f" aria-hidden="true">'
           % (x0, y0, x1-x0, y1-y0))
out.append('  <g class="logo-load" stroke="none">')
for name, poly in (('top',top), ('side',left), ('end',end)):
    out.append('    <polygon points="%s" fill="var(--logo-%s)"/>' % (' '.join(f(p) for p in poly), name))
out.append('  </g>')
out.append('  <g class="logo-shell" fill="none" stroke="currentColor" stroke-width="7" stroke-linejoin="miter" stroke-linecap="butt">')
for poly in (floor, ceiling):
    out.append('    <polygon points="%s"/>' % ' '.join(f(p) for p in poly))
for a,b in posts:
    out.append('    <line x1="%.2f" y1="%.2f" x2="%.2f" y2="%.2f"/>' % (a[0],a[1],b[0],b[1]))
out.append('  </g>')
out.append('  <polygon class="logo-empty" points="%s" fill="none" stroke="var(--amber)" stroke-width="5.5" stroke-dasharray="6 7" stroke-linecap="butt" stroke-linejoin="miter"/>'
           % ' '.join(f(p) for p in dash))
out.append('</svg>')
svg = '\n'.join(out)
print(svg)
