/* Babilônia de Nabucodonosor — Daniel 1–5; 2Reis 25; Jeremias 50–51. 1 unidade = 1 m. Norte = z negativo. Escala da cidade reduzida. */
V3D.registrar('babilonia', {
  nome: 'Babilônia', sub: 'A cidade de Nabucodonosor e de Daniel · século 6 a.C.',
  ceu: 0xd8c39a, neblina: [300, 1100], sombra: 150, dist: [5, 650],
  extra: ['Noite do banquete', 'Voltar ao dia'],
  estacoes: [
    { id: 'geral', nome: 'Visão geral', ref: 'Daniel 1.1-4; 4.29-30', titulo: '"Não é esta a grande Babilônia?"', medida: 'Muralhas com mais de 15 km de perímetro',
      desc: 'Nabucodonosor transformou a Babilônia na maior cidade do mundo. Para lá foram levados Daniel e seus amigos, e milhares de judeus depois da destruição de Jerusalém em 586 a.C. O rio Eufrates atravessava a cidade.',
      cam: [320, 170, 300], alvo: [0, 10, 0] },
    { id: 'ishtar', nome: 'Portão de Ishtar', ref: 'Daniel 3.1; Jeremias 51.58', titulo: 'O Portão de Ishtar', medida: 'Escavado por Robert Koldewey entre 1899 e 1917',
      desc: 'A entrada norte da cidade era coberta de tijolos vidrados azuis com touros e dragões em relevo. Partes do portão foram levadas e reconstruídas no Museu Pergamon, em Berlim. Daniel passou por ele muitas vezes.',
      cam: [36, 14, -150], alvo: [0, 12, -116] },
    { id: 'procissao', nome: 'Rua das Procissões', ref: 'Isaías 46.1-2', titulo: 'A Rua das Procissões', medida: 'Paredes com 120 leões em relevo',
      desc: 'Do portão saía uma avenida ladeada de muros azuis com leões. Por ela as estátuas de Marduque e de outros deuses desfilavam na festa de ano-novo. Isaías zombou desses ídolos que precisavam ser carregados.',
      cam: [26, 8, -96], alvo: [0, 4, -70] },
    { id: 'palacio', nome: 'O palácio', ref: 'Daniel 4.28-33; 5.1-5', titulo: 'O palácio e a sala do trono', medida: 'Sala do trono de cerca de 52 × 17 m',
      desc: 'Do terraço do palácio Nabucodonosor se gabou de ter construído a cidade e foi humilhado. Num salão desse palácio, Belsazar deu o banquete em que apareceu a mão escrevendo na parede. Toque em "Noite do banquete".',
      cam: [-90, 34, -80], alvo: [-44, 10, -60] },
    { id: 'etemenanki', nome: 'Etemenanki', ref: 'Gênesis 11.1-9', titulo: 'O grande zigurate da Babilônia', medida: 'Base de cerca de 91 × 91 m',
      desc: 'No centro da cidade ficava o zigurate chamado Etemenanki, "templo do fundamento do céu e da terra", com cerca de 90 m de altura segundo descrições antigas. Muitos o ligam à lembrança da torre de Babel.',
      cam: [120, 90, 120], alvo: [30, 40, 40] },
    { id: 'eufrates', nome: 'O Eufrates', ref: 'Daniel 5.30-31; Isaías 45.1', titulo: 'O rio e a queda da cidade', medida: 'Queda para os persas em 539 a.C.',
      desc: 'Naquela mesma noite, Belsazar foi morto e a cidade passou aos medos e persas. Segundo o historiador grego Heródoto, os soldados de Ciro entraram pelo leito do Eufrates, cujas águas tinham sido desviadas.',
      cam: [-160, 40, 120], alvo: [-60, 0, 40] },
    { id: 'jardins', nome: 'Os jardins', ref: 'Daniel 4.30', titulo: 'Os jardins suspensos', medida: 'Uma das sete maravilhas do mundo antigo',
      desc: 'Autores antigos contam que Nabucodonosor construiu jardins em terraços para a esposa, saudosa das montanhas de sua terra. A arqueologia ainda não confirmou onde ficavam, e alguns estudiosos acham que estavam em Nínive.',
      cam: [-110, 50, -150], alvo: [-70, 16, -100] },
  ],
  montar({ THREE, cena, sol, tex, caixa, cil, sombra, pessoa }) {
    const tijTex = (a, rep) => tex(256, 256, (g, w, h) => { g.fillStyle = '#3a2a1e'; g.fillRect(0, 0, w, h); for (let y = 0; y < h; y += 10) for (let x = (y / 10) % 2 ? -12 : 0; x < w; x += 24) { const v = Math.random() * 25; g.fillStyle = `rgb(${a[0] + v | 0},${a[1] + v | 0},${a[2] + v * 0.6 | 0})`; g.fillRect(x + 1, y + 1, 22, 8); } }, rep);
    const tij = new THREE.MeshStandardMaterial({ map: tijTex([186, 150, 102], [10, 3]), roughness: 0.95 });
    // tijolos azuis vidrados com animais em relevo (touros, dragões e leões em amarelo e branco) — desenho próprio, estilizado
    const azulTex = (animal) => tex(512, 256, (g, w, h) => {
      g.fillStyle = '#123a7c'; g.fillRect(0, 0, w, h);
      for (let y = 0; y < h; y += 12) for (let x = (y / 12) % 2 ? -12 : 0; x < w; x += 24) { g.fillStyle = `rgba(${20 + Math.random() * 20},${70 + Math.random() * 30},${150 + Math.random() * 40},1)`; g.fillRect(x + 1, y + 1, 22, 10); }
      g.fillStyle = '#e8c45a'; g.strokeStyle = '#7a5a20'; g.lineWidth = 2;
      for (let k = 0; k < 2; k++) {
        const cx = 128 + k * 256, cy = 130;
        g.beginPath(); g.ellipse(cx, cy, 70, 30, 0, 0, 7); g.fill(); g.stroke();             // corpo
        [-50, -25, 25, 50].forEach(dx => { g.fillRect(cx + dx - 5, cy + 20, 10, 45); });     // pernas
        g.beginPath(); g.ellipse(cx + 78, cy - 28, 20, 16, 0, 0, 7); g.fill(); g.stroke();   // cabeça
        if (animal === 'touro') { g.beginPath(); g.moveTo(cx + 80, cy - 42); g.lineTo(cx + 100, cy - 70); g.lineTo(cx + 88, cy - 40); g.fill(); }
        else if (animal === 'dragao') { g.beginPath(); g.moveTo(cx + 70, cy - 40); g.lineTo(cx + 74, cy - 74); g.lineTo(cx + 84, cy - 42); g.fill(); g.beginPath(); g.moveTo(cx - 70, cy); g.quadraticCurveTo(cx - 110, cy - 40, cx - 96, cy - 70); g.lineWidth = 8; g.strokeStyle = '#e8c45a'; g.stroke(); g.lineWidth = 2; g.strokeStyle = '#7a5a20'; }
        else { g.fillStyle = '#f2ead6'; g.beginPath(); g.ellipse(cx + 70, cy - 26, 30, 26, 0, 0, 7); g.fill(); g.fillStyle = '#e8c45a'; g.beginPath(); g.moveTo(cx - 70, cy); g.quadraticCurveTo(cx - 100, cy - 10, cx - 104, cy - 40); g.lineWidth = 6; g.strokeStyle = '#e8c45a'; g.stroke(); g.lineWidth = 2; g.strokeStyle = '#7a5a20'; }
      }
      g.fillStyle = '#f2ead6'; for (let x = 0; x < w; x += 32) { g.beginPath(); g.arc(x + 16, 14, 7, 0, 7); g.fill(); g.beginPath(); g.arc(x + 16, h - 14, 7, 0, 7); g.fill(); }
    });
    const azulTouro = new THREE.MeshStandardMaterial({ map: azulTex('touro'), roughness: 0.35, metalness: 0.1 });
    const azulDragao = new THREE.MeshStandardMaterial({ map: azulTex('dragao'), roughness: 0.35, metalness: 0.1 });
    const azulLeao = new THREE.MeshStandardMaterial({ map: azulTex('leao'), roughness: 0.35, metalness: 0.1 });
    const solo = tex(256, 256, (g, w, h) => { g.fillStyle = '#c4ab7c'; g.fillRect(0, 0, w, h); for (let i = 0; i < 6000; i++) { g.fillStyle = Math.random() > .5 ? 'rgba(140,115,80,.35)' : 'rgba(215,200,160,.3)'; g.fillRect(Math.random() * w, Math.random() * h, 2, 2); } }, [80, 80]);
    const chao = new THREE.Mesh(new THREE.PlaneGeometry(3000, 3000), new THREE.MeshStandardMaterial({ map: solo, roughness: 1 })); chao.rotation.x = -Math.PI / 2; chao.receiveShadow = true; cena.add(chao);

    // o Eufrates atravessando a cidade de norte a sul
    const rioGeo = new THREE.PlaneGeometry(40, 2400, 8, 120); rioGeo.rotateX(-Math.PI / 2);
    const rioBase = rioGeo.attributes.position.array.slice();
    const rio = new THREE.Mesh(rioGeo, new THREE.MeshStandardMaterial({ color: 0x4d7f96, roughness: 0.2, metalness: 0.15 })); rio.position.set(-60, 0.1, 0); cena.add(rio);
    const barcos = []; for (let i = 0; i < 6; i++) { const b = new THREE.Group(); const casco = new THREE.Mesh(new THREE.SphereGeometry(1, 12, 8, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), new THREE.MeshStandardMaterial({ color: 0x7a5a3a, side: THREE.DoubleSide })); casco.scale.set(1.5, 0.6, 4); b.add(casco); b.position.set(-60 + (i % 2 ? 8 : -8), 0.3, -300 + i * 110); b.userData.v = 4 + i; cena.add(b); barcos.push(b); }

    // muralha dupla da cidade interna (quadrada, com torres)
    const muro = (x0, z0, x1, z1, h, larg) => { const g = new THREE.Group(); const L = Math.hypot(x1 - x0, z1 - z0); g.add(caixa(L, h, larg, tij, L / 2, h / 2, 0)); for (let s = 0; s <= L; s += 20) g.add(caixa(6, h + 4, larg + 3, tij, s, (h + 4) / 2, 0)); g.position.set(x0, 0, z0); g.rotation.y = -Math.atan2(z1 - z0, x1 - x0); return g; };
    const S = 120;
    [[-S, -S, -12, -S], [12, -S, S, -S], [S, -S, S, S], [S, S, -S, S], [-S, S, -S, -S]].forEach(([a, b, c, d]) => { cena.add(sombra(muro(a, b, c, d, 14, 6))); cena.add(sombra(muro(a * 1.1, b * 1.1, c * (c === -12 || c === 12 ? 1 : 1.1), d * 1.1, 10, 4))); });

    // Portão de Ishtar (entrada norte) e Rua das Procissões
    const portao = new THREE.Group();
    portao.add(caixa(30, 24, 14, azulTouro, 0, 12, 0));
    portao.add(caixa(10, 16, 15, new THREE.MeshStandardMaterial({ color: 0x0a1428 }), 0, 8, 0));
    [-1, 1].forEach(s => { portao.add(caixa(8, 30, 16, azulDragao, s * 17, 15, 0)); for (let i = 0; i < 6; i++) portao.add(caixa(1.4, 1.6, 16, azulDragao, s * 17 - 3.5 + i * 1.4, 30.8, 0)); });
    for (let i = 0; i < 12; i++) portao.add(caixa(1.4, 1.6, 14.2, azulTouro, -12 + i * 2.2, 24.8, 0));
    portao.position.set(0, 0, -S - 2); cena.add(sombra(portao));
    const rua = new THREE.Mesh(new THREE.PlaneGeometry(16, 170), new THREE.MeshStandardMaterial({ color: 0xcfc3a8, roughness: 0.8 })); rua.rotation.x = -Math.PI / 2; rua.position.set(0, 0.05, -40); cena.add(rua);
    [-1, 1].forEach(s => { const m = caixa(2.5, 9, 120, azulLeao, s * 10, 4.5, -60); cena.add(sombra(m)); });
    // as paredes de leões ficam com os animais na face interna
    // palácio de Nabucodonosor (a oeste da rua, junto ao portão)
    const palacio = new THREE.Group();
    palacio.add(caixa(70, 14, 50, tij, 0, 7, 0), caixa(30, 20, 18, tij, -6, 10, -4));
    palacio.add(caixa(31, 4, 18.4, azulLeao, -6, 17, -4));
    for (let x = -32; x <= 32; x += 4) palacio.add(caixa(2, 2.5, 2, tij, x, 15.2, 24.8));
    const sala = caixa(52 * 0.5, 0.2, 17 * 0.5, new THREE.MeshStandardMaterial({ color: 0x3a2a1e }), 0, 14.1, 8); palacio.add(sala);
    palacio.position.set(-44, 0, -70); cena.add(sombra(palacio));
    // a escrita na parede (Daniel 5.25), que aparece na noite do banquete
    const escrita = tex(512, 128, (g, w, h) => { g.clearRect(0, 0, w, h); g.fillStyle = 'rgba(255,240,200,1)'; g.font = 'bold 52px Georgia, serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.shadowColor = 'rgba(255,200,120,1)'; g.shadowBlur = 18; g.fillText('MENE, MENE, TEQUEL, PARSIM', w / 2, h / 2); });
    const parede = new THREE.Mesh(new THREE.PlaneGeometry(26, 6.5), new THREE.MeshBasicMaterial({ map: escrita, transparent: true, opacity: 0, depthWrite: false, fog: false }));
    parede.position.set(-44 + 0.01, 13, -70 + 25.3); cena.add(parede);
    const janelas = []; for (let i = 0; i < 12; i++) { const j = caixa(1.6, 3, 0.3, new THREE.MeshBasicMaterial({ color: 0x2a1a0a }), -44 - 28 + i * 5, 7, -70 + 25.2); cena.add(j); janelas.push(j); }
    const luzFesta = new THREE.PointLight(0xffb060, 0, 120, 1.6); luzFesta.position.set(-44, 20, -40); cena.add(luzFesta);

    // Etemenanki: zigurate de sete níveis com santuário azul no topo
    const zig = new THREE.Group();
    [[91, 33], [78, 18], [60, 12], [51, 6], [42, 6], [33, 6]].forEach(([w, h], i, arr) => { const y = arr.slice(0, i).reduce((s, x) => s + x[1], 0); zig.add(caixa(w, h, w, tij, 0, y + h / 2, 0)); });
    zig.add(caixa(24, 15, 22, azulLeao, 0, 81 + 7.5, 0));
    for (let i = 0; i < 40; i++) zig.add(caixa(10, 33 / 40, 52 / 40, tij, 0, (i + 0.5) * 33 / 40, 45.5 + 52 - (i + 0.5) * 52 / 40));
    zig.position.set(30, 0, 40); cena.add(sombra(zig));
    // templo de Marduque (Esagila) ao lado
    cena.add(sombra(caixa(80, 16, 70, tij, 30, 8, 125)));
    // jardins em terraços
    const jardim = new THREE.Group(); const verde = new THREE.MeshStandardMaterial({ color: 0x4f7a32, roughness: 1 });
    for (let i = 0; i < 5; i++) { jardim.add(caixa(46 - i * 8, 6, 36 - i * 6, tij, 0, 3 + i * 6, 0)); for (let k = 0; k < 10; k++) { const a = Math.random() * 7; const c = new THREE.Mesh(new THREE.SphereGeometry(1.5 + Math.random(), 8, 6), verde); c.position.set(Math.cos(a) * (20 - i * 4), 6.5 + i * 6, Math.sin(a) * (15 - i * 3)); jardim.add(c); } }
    jardim.position.set(-70, 0, -100); cena.add(sombra(jardim));
    // casas da cidade
    const casaM = [0xc9ad7f, 0xbfa070, 0xd4bb8e].map(c => new THREE.MeshStandardMaterial({ color: c, roughness: 0.95 }));
    const casas = new THREE.Group();
    for (let i = 0; i < 700; i++) { const x = -S + 4 + Math.random() * (2 * S - 8), z = -S + 4 + Math.random() * (2 * S - 8); if (Math.abs(x + 60) < 26 || (Math.abs(x) < 14 && z < 25) || (x > -84 && x < -4 && z > -100 && z < -40) || (x > -20 && x < 80 && z > -10 && z < 165) || (x > -100 && x < -40 && z > -125 && z < -75)) continue; const w = 5 + Math.random() * 6, h = 4 + Math.random() * 6; casas.add(caixa(w, h, w * (0.7 + Math.random() * 0.6), casaM[i % 3], x, h / 2, z)); }
    cena.add(sombra(casas));
    // tochas da rua e gente
    const povo = []; for (let i = 0; i < 30; i++) { const p = pessoa([0x8b5e3c, 0x5b4a6a, 0xa58d68, 0x7a2a2a][i % 4], { i, turbante: 0x3a2a1e }); p.scale.setScalar(1.5); p.userData = { s: Math.random() * 160, lado: (Math.random() - .5) * 10 }; cena.add(sombra(p)); povo.push(p); }
    const palmas = new THREE.MeshStandardMaterial({ color: 0x5f7a3a, roughness: 1 }), tronco = new THREE.MeshStandardMaterial({ color: 0x7a6040, roughness: 1 });
    for (let i = 0; i < 120; i++) { const g = new THREE.Group(); g.add(cil(0.35, 0.5, 9, tronco, 0, 4.5, 0, 6)); for (let k = 0; k < 7; k++) { const f = caixa(5, 0.1, 0.9, palmas, 2.3, 9, 0); f.rotation.z = -0.4; const piv = new THREE.Group(); piv.add(f); piv.rotation.y = k / 7 * Math.PI * 2; g.add(piv); } g.position.set(-60 + (Math.random() > .5 ? 1 : -1) * (24 + Math.random() * 60), 0, -600 + Math.random() * 1200); if (Math.abs(g.position.z) < 140 && Math.abs(g.position.x + 60) < 70) continue; cena.add(g); }

    const DIA = new THREE.Color(0xd8c39a), NOITE = new THREE.Color(0x101624);
    let noite = false, tn = 0;
    return {
      aoExtra: on => { noite = on; tn = 0; },
      animar(t, dt, reduz) {
        const k = Math.min(1, dt * 1.5);
        cena.background.lerp(noite ? NOITE : DIA, k); cena.fog.color.copy(cena.background);
        sol.intensity += ((noite ? 0.12 : 1.25) - sol.intensity) * k;
        luzFesta.intensity += ((noite ? 3 : 0) - luzFesta.intensity) * k;
        janelas.forEach(j => j.material.color.lerp(new THREE.Color(noite ? 0xffb050 : 0x2a1a0a), k));
        if (noite) tn += dt;
        parede.material.opacity += (((noite && tn > 2.5) ? 1 : 0) - parede.material.opacity) * k * 0.6;
        if (reduz) return;
        const p = rioGeo.attributes.position; for (let i = 0; i < p.count; i++) { const z = rioBase[i * 3 + 2]; p.setY(i, Math.sin(z * 0.08 + t * 1.5) * 0.15); } p.needsUpdate = true;
        barcos.forEach(b => { b.position.z += dt * b.userData.v; if (b.position.z > 600) b.position.z = -600; b.rotation.z = Math.sin(t + b.userData.v) * 0.04; });
        povo.forEach(pp => { const s = (pp.userData.s + t * 2) % 160; pp.position.set(pp.userData.lado * 0.7, 0, -120 + s); pp.visible = !noite; });
      },
    };
  },
});
