// Isometric diagram generator. Uses the same projection as the simulator:
// 30 degree axonometric, z mapped straight down the screen.
const A = Math.PI/6, CA = Math.cos(A), SA = Math.sin(A);
const r = n => Math.round(n*10)/10;

function mk(scale){
  const P = (x,y,z) => [ (x*CA - y*CA)*scale, (x*SA + y*SA - z)*scale ];
  return P;
}
function poly(pts, fill, stroke, sw, extra){
  return `<polygon points="${pts.map(p=>`${r(p[0])},${r(p[1])}`).join(' ')}" fill="${fill}"${stroke?` stroke="${stroke}" stroke-width="${sw||1}" stroke-linejoin="round"`:''}${extra||''}/>`;
}
function line(a,b,stroke,sw,dash){
  return `<line x1="${r(a[0])}" y1="${r(a[1])}" x2="${r(b[0])}" y2="${r(b[1])}" stroke="${stroke}" stroke-width="${sw}"${dash?` stroke-dasharray="${dash}"`:''} stroke-linecap="round"/>`;
}
// Three visible faces of an axis-aligned box, painter order back-to-front.
function box(P, x0,x1,y0,y1,z0,z1, c, sw){
  const p=(x,y,z)=>P(x,y,z);
  return [
    poly([p(x0,y0,z1),p(x1,y0,z1),p(x1,y1,z1),p(x0,y1,z1)], c.top, c.edge, sw),
    poly([p(x0,y1,z0),p(x1,y1,z0),p(x1,y1,z1),p(x0,y1,z1)], c.side, c.edge, sw),
    poly([p(x1,y0,z0),p(x1,y1,z0),p(x1,y1,z1),p(x1,y0,z1)], c.end, c.edge, sw)
  ].join('\n    ');
}
// Translucent "empty space" volume: the same three faces, dashed accent.
function ghost(P, x0,x1,y0,y1,z0,z1){
  const p=(x,y,z)=>P(x,y,z);
  const f='var(--dg-ghost)', s='var(--accent)';
  return [
    poly([p(x0,y0,z1),p(x1,y0,z1),p(x1,y1,z1),p(x0,y1,z1)], f, s, 1.1, ' stroke-dasharray="5 4"'),
    poly([p(x0,y1,z0),p(x1,y1,z0),p(x1,y1,z1),p(x0,y1,z1)], f, s, 1.1, ' stroke-dasharray="5 4"'),
    poly([p(x1,y0,z0),p(x1,y1,z0),p(x1,y1,z1),p(x1,y0,z1)], f, s, 1.1, ' stroke-dasharray="5 4"')
  ].join('\n    ');
}
function tag(x,y,text,anchor){
  const w = text.length*6.6 + 16, h = 22;
  const tx = anchor==='middle' ? x : (anchor==='end' ? x-w/2 : x+w/2);
  return `<g><rect x="${r(tx-w/2)}" y="${r(y-h/2)}" width="${r(w)}" height="${h}" rx="2" fill="var(--dg-tagbg)" stroke="var(--accent)" stroke-width="1"/>`
    + `<text x="${r(tx)}" y="${r(y)}" text-anchor="middle" dominant-baseline="central" font-size="12" font-weight="600" fill="var(--dg-tagink)">${text}</text></g>`;
}
// Dimension line with end ticks, drawn in screen space.
function dim(a,b,label,off,anchor){
  const dx=b[0]-a[0], dy=b[1]-a[1], len=Math.hypot(dx,dy)||1;
  let nx=-dy/len, ny=dx/len;
  const ax=a[0]+nx*off, ay=a[1]+ny*off, bx=b[0]+nx*off, by=b[1]+ny*off;
  const t=6;
  return [
    line([ax,ay],[bx,by],'var(--dg-rule)',1.2,'4 4'),
    line([ax-nx*t,ay-ny*t],[ax+nx*t,ay+ny*t],'var(--dg-rule)',1.4),
    line([bx-nx*t,by-ny*t],[bx+nx*t,by+ny*t],'var(--dg-rule)',1.4),
    tag((ax+bx)/2,(ay+by)/2,label,anchor||'middle')
  ].join('\n    ');
}
function frame(parts, pad){
  let minX=1e9,maxX=-1e9,minY=1e9,maxY=-1e9;
  parts.forEach(p=>{ minX=Math.min(minX,p[0]); maxX=Math.max(maxX,p[0]); minY=Math.min(minY,p[1]); maxY=Math.max(maxY,p[1]); });
  return { minX:minX-pad, minY:minY-pad, w:(maxX-minX)+pad*2, h:(maxY-minY)+pad*2 };
}

/* ── Figure 1: what the simulator measures ──────────────────────────────────
   The default state of the tool, drawn to scale: a 40' HC with 6 of 18 pallet
   positions loaded, 4 box layers, 1 tier. Every number below is what the
   simulator itself reports for that configuration. */
function figureOne(){
  const L=473.6, W=92.6, H=106.3;
  const PL=48, PW=45, PH=5, BH=18, LAYERS=4;
  const unitH = PH + LAYERS*BH;              // 77
  const rows=3, cols=2;                      // 6 pallets
  const loadX = rows*PL;                     // 144
  const gridW = cols*PW, y0=(W-gridW)/2, y1=y0+gridW;   // 1.3 .. 91.3
  const s=0.74, P=mk(s), p=(x,y,z)=>P(x,y,z);
  const struct='var(--dg-struct)';

  const pallet={top:'#A39580',side:'#766A58',end:'#524939',edge:'var(--dg-edge)'};
  const boxes =[{top:'#D6A461',side:'#B07D3F',end:'#7C5424',edge:'var(--dg-edge)'},
                {top:'#EDD3A2',side:'#CBA86D',end:'#977443',edge:'var(--dg-edge)'}];

  let g='';
  // Floor and the two far walls.
  g += poly([p(0,0,0),p(L,0,0),p(L,W,0),p(0,W,0)],'var(--dg-floor)',null)+'\n    ';
  g += poly([p(0,0,0),p(L,0,0),p(L,0,H),p(0,0,H)],'var(--dg-wall)',null)+'\n    ';
  g += poly([p(0,0,0),p(0,W,0),p(0,W,H),p(0,0,H)],'var(--dg-wall)',null)+'\n    ';
  // Far/back edges, dashed.
  [[p(L,W,0),p(0,W,0)],[p(L,W,0),p(L,0,0)],[p(L,W,H),p(0,W,H)],[p(L,W,H),p(L,0,H)]]
    .forEach(ab=>{ g+=line(ab[0],ab[1],struct,1,'4 4')+'\n    '; });

  // Load: 3 rows x 2 columns, drawn far-to-near so nearer pallets overlap.
  const stack=[];
  for(let row=0; row<rows; row++) for(let col=0; col<cols; col++)
    stack.push({row,col,d:row+col*0.5});
  stack.sort((a,b)=>a.d-b.d);
  stack.forEach(({row,col})=>{
    const rx=row*PL, ry=y0+col*PW;
    g += box(P, rx,rx+PL, ry,ry+PW, 0,PH, pallet, 0.8)+'\n    ';
    for(let l=0;l<LAYERS;l++){
      const bz=PH+l*BH;
      // 2 boxes per layer: 45 x 24 boxes, one along each half of the deck.
      for(let bx=0;bx<1;bx++) for(let by=0;by<2;by++){
        g += box(P, rx+1.5,rx+46.5, ry+(by*24)+(PW-48)/2, ry+(by*24)+24+(PW-48)/2, bz,bz+BH, boxes[l%2], 0.7)+'\n    ';
      }
    }
  });

  // Empty space the simulator draws: floor beyond the last row, then headroom.
  g += ghost(P, loadX,L, 0,W, 0,H)+'\n    ';
  g += ghost(P, 0,loadX, 0,W, unitH,H)+'\n    ';

  // Near edges of the transport unit, solid.
  [[p(L,0,0),p(L,W,0)],[p(0,W,0),p(L,W,0)],[p(L,0,0),p(L,0,H)],[p(L,W,0),p(L,W,H)],
   [p(0,W,0),p(0,W,H)],[p(L,0,H),p(L,W,H)],[p(0,W,H),p(L,W,H)],
   [p(0,0,0),p(L,0,0)],[p(0,0,0),p(0,W,0)],[p(0,0,0),p(0,0,H)],
   [p(L,0,0),p(L,0,H)],[p(0,0,H),p(L,0,H)],[p(0,0,H),p(0,W,H)]]
    .forEach(ab=>{ g+=line(ab[0],ab[1],struct,1.4)+'\n    '; });

  // Dimension callouts.
  g += dim(p(loadX,W,0), p(L,W,0), '329.6 in free floor', 34)+'\n    ';
  g += dim(p(loadX,W,unitH), p(loadX,W,H), '29.3 in headroom', 44, 'start')+'\n    ';

  const pts=[p(0,0,0),p(L,0,0),p(0,W,0),p(L,W,0),p(0,0,H),p(L,0,H),p(0,W,H),p(L,W,H)];
  const f=frame(pts,34);
  return `<svg class="dg" role="img" aria-label="A 40 foot high cube container loaded with 6 of its 18 pallet positions. 329.6 inches of floor length stay free beyond the last row and 29.3 inches of headroom stay open above the load." viewBox="${r(f.minX)} ${r(f.minY)} ${r(f.w)} ${r(f.h)}" xmlns="http://www.w3.org/2000/svg">\n    ${g}\n  </svg>`;
}

/* ── Figure 2: box layers against pallet tiers ──────────────────────────────
   The two settings are easy to confuse, and they stack to different heights. */
function figureTwo(){
  const PL=48, PW=45, PH=5, BH=18;
  const s=1.5, P=mk(s), p=(x,y,z)=>P(x,y,z);
  const pallet={top:'#A39580',side:'#766A58',end:'#524939',edge:'var(--dg-edge)'};
  const boxes =[{top:'#D6A461',side:'#B07D3F',end:'#7C5424',edge:'var(--dg-edge)'},
                {top:'#EDD3A2',side:'#CBA86D',end:'#977443',edge:'var(--dg-edge)'}];

  function unit(layers, tiers, label, height){
    let g='', z=0;
    for(let t=0;t<tiers;t++){
      g += box(P, 0,PL, 0,PW, z,z+PH, pallet, 0.9)+'\n    ';
      for(let l=0;l<layers;l++){
        const bz=z+PH+l*BH;
        for(let by=0;by<2;by++)
          g += box(P, 1.5,46.5, by*24+(PW-48)/2, by*24+24+(PW-48)/2, bz,bz+BH, boxes[l%2], 0.8)+'\n    ';
      }
      z += PH + layers*BH;
    }
    g += dim(p(0,PW,0), p(0,PW,z), height, -30)+'\n    ';
    const base = p(PL,PW,0)[1] + 46;
    const mid  = (p(0,0,0)[0] + p(PL,PW,0)[0])/2;
    g += `<text x="${r(mid)}" y="${r(base)}" class="lbl" text-anchor="middle" font-size="14" font-weight="600" fill="currentColor">${label}</text>`;
    return { g, top:z, base };
  }

  const a = unit(4, 1, '4 box layers, 1 tier', '77 in');
  const b = unit(2, 2, '2 box layers, 2 tiers', '82 in');
  const DX = 260;
  const g = a.g + `\n    <g transform="translate(${DX},0)">\n    ` + b.g + `\n    </g>`;

  const pts=[p(0,0,0),p(PL,0,0),p(0,PW,0),p(PL,PW,0),p(0,0,a.top),p(PL,PW,a.top),
             [p(0,0,0)[0]+DX,0],[p(PL,PW,0)[0]+DX,p(PL,PW,0)[1]],[p(0,0,b.top)[0]+DX,p(0,0,b.top)[1]],
             [p(0,PW,0)[0]-135, a.base+8],[p(PL,PW,0)[0]+DX+70, a.base+8]];
  const f=frame(pts,30);
  return `<svg class="dg" role="img" aria-label="Left: four box layers on one pallet, 77 inches tall. Right: two box layers on each of two stacked pallets, 82 inches tall, because the second pallet adds its own 5 inch deck." viewBox="${r(f.minX)} ${r(f.minY)} ${r(f.w)} ${r(f.h)}" xmlns="http://www.w3.org/2000/svg">\n    ${g}\n  </svg>`;
}

require('fs').writeFileSync(process.env.S+'/fig1.svg', figureOne());
require('fs').writeFileSync(process.env.S+'/fig2.svg', figureTwo());
console.log('fig1', figureOne().length, 'bytes; fig2', figureTwo().length, 'bytes');
