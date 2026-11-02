/* Zigurate de Ur (c. 2100 a.C.) — a forma das torres-templo da Mesopotâmia, como a de Babel em Gênesis 11. 1 unidade = 1 m. */
V3D.registrar('zigurate', {
  nome: 'Torre de Babel', sub: 'Gênesis 11 · zigurate de Ur, reconstruído a partir das escavações',
  ceu: 0xc7b691, neblina: [220, 800], sombra: 90, dist: [4, 450],
  extra: ['Ver em construção', 'Ver pronto'],
  estacoes: [
    { id: 'geral', nome: 'Visão geral', ref: 'Gênesis 11.1-4', titulo: '"Uma torre que chegue até o céu"', medida: 'Base de cerca de 64 × 46 m · Ur, por volta de 2100 a.C.',
      desc: 'Os povos da Mesopotâmia construíam zigurates, montanhas artificiais de tijolos em terraços, com um santuário no alto. A torre de Babel de Gênesis 11 é descrita com essa mesma técnica. O modelo segue o zigurate de Ur, o mais bem conservado.',
      cam: [140, 70, 120], alvo: [0, 12, 0] },
    { id: 'tijolos', nome: 'Tijolos e betume', ref: 'Gênesis 11.3', titulo: 'Tijolos queimados e betume', medida: 'Miolo de tijolo cru, revestido de tijolo cozido',
      desc: '"Façamos tijolos e queimemo-los bem." Na planície da Mesopotâmia quase não havia pedra. Os construtores usavam tijolos de barro, os melhores cozidos no forno, e betume como argamassa, exatamente como diz o texto. O betume ainda é visível nas ruínas.',
      cam: [36, 6, 30], alvo: [30, 4, 21] },
    { id: 'escadas', nome: 'As escadarias', ref: 'Gênesis 28.12', titulo: 'Três escadarias de cem degraus', medida: 'Encontram-se num portal no primeiro terraço',
      desc: 'Três grandes escadarias, uma central e duas laterais, subiam até o primeiro terraço. Alguns estudiosos lembram dessas escadas ao ler o sonho de Jacó, com a escada que ligava a terra ao céu.',
      cam: [0, 24, 92], alvo: [0, 12, 20] },
    { id: 'santuario', nome: 'O santuário', ref: 'Gênesis 11.4', titulo: 'O santuário no topo', medida: 'Cerca de 30 m acima da planície',
      desc: 'No alto ficava um pequeno templo dedicado ao deus da cidade. Em Ur, o deus da lua. A construção expressava o desejo de alcançar os deuses e fazer um nome para si, e é isso que o texto de Gênesis critica.',
      cam: [24, 38, 34], alvo: [0, 26, 0] },
    { id: 'ur', nome: 'Ur dos caldeus', ref: 'Gênesis 11.31; Atos 7.2-4', titulo: 'Ur, a cidade de Abraão', medida: 'Escavada por Leonard Woolley entre 1922 e 1934',
      desc: 'Abraão saiu de Ur dos caldeus com a família rumo a Canaã. As escavações revelaram uma cidade rica, com casas de dois andares, escolas e tumbas reais cheias de ouro, dominada por este zigurate.',
      cam: [-120, 50, 110], alvo: [-20, 4, 20] },
    { id: 'construcao', nome: 'A obra', ref: 'Gênesis 11.5-9', titulo: 'A obra interrompida', medida: 'Babel: "confusão"',
      desc: 'Deus confundiu a língua dos construtores, e eles pararam de edificar a cidade. O nome Babel lembra a palavra hebraica para confundir. A vista em construção mostra a torre inacabada, com os trabalhadores carregando tijolos.',
      cam: [90, 45, 85], alvo: [0, 14, 0], extra: true },
  ],
  montar({ THREE, cena, tex, caixa, cil, sombra }) {
    const tijTex = (a, b) => tex(256, 256, (g, w, h) => { g.fillStyle = '#3a2a1e'; g.fillRect(0, 0, w, h); for (let y = 0; y < h; y += 10) for (let x = (y / 10) % 2 ? -12 : 0; x < w; x += 24) { const v = Math.random() * 25; g.fillStyle = `rgb(${a[0] + v | 0},${a[1] + v | 0},${a[2] + v * 0.6 | 0})`; g.fillRect(x + 1, y + 1, 22, 8); } }, b);
    const tij = new THREE.MeshStandardMaterial({ map: tijTex([168, 120, 78], [8, 3]), roughness: 0.95 });
    const tij2 = new THREE.MeshStandardMaterial({ map: tijTex([150, 104, 66], [5, 2]), roughness: 0.95 });
    const azulM = new THREE.MeshStandardMaterial({ color: 0x2c5a9e, roughness: 0.5, metalness: 0.2 });
    const solo = tex(256, 256, (g, w, h) => { g.fillStyle = '#c9b27f'; g.fillRect(0, 0, w, h); for (let i = 0; i < 6000; i++) { g.fillStyle = Math.random() > .5 ? 'rgba(150,125,85,.35)' : 'rgba(220,205,160,.3)'; g.fillRect(Math.random() * w, Math.random() * h, 2, 2); } }, [60, 60]);
    const chao = new THREE.Mesh(new THREE.PlaneGeometry(1600, 1600), new THREE.MeshStandardMaterial({ map: solo, roughness: 1 })); chao.rotation.x = -Math.PI / 2; chao.receiveShadow = true; cena.add(chao);

    const zig = new THREE.Group();
    // terraço 1: 64 × 46 × 11 m, paredes inclinadas
    const terraco = (w, d, h, y, mat) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(1, 1.08, h, 4, 1), mat); m.rotation.y = Math.PI / 4; m.scale.set(w / 1.414, 1, d / 1.414); m.position.y = y + h / 2; return m; };
    zig.add(terraco(64, 46, 11, 0, tij), terraco(46, 32, 6, 11, tij2), terraco(30, 22, 5, 17, tij));
    // contrafortes verticais nas paredes do primeiro terraço
    for (let x = -30; x <= 30; x += 6) zig.add(caixa(1.2, 10.5, 1, tij2, x, 5.2, 23.6), caixa(1.2, 10.5, 1, tij2, x, 5.2, -23.6));
    // escadarias: central perpendicular e duas laterais encostadas na fachada (nordeste)
    const escada = (comp, larg, alt, x, z, rotY) => { const g = new THREE.Group(); const n = 40; for (let i = 0; i < n; i++) g.add(caixa(larg, alt / n, comp / n, tij2, 0, (i + 0.5) * alt / n, comp / 2 - (i + 0.5) * comp / n)); g.position.set(x, 0, z); g.rotation.y = rotY; return g; };
    zig.add(escada(32, 6, 11.5, 0, 39, 0));                      // central, perpendicular à fachada
    zig.add(escada(30, 4.5, 11, -17, 26.5, -Math.PI / 2));        // lateral esquerda, junto à parede
    zig.add(escada(30, 4.5, 11, 17, 26.5, Math.PI / 2));          // lateral direita
    zig.add(caixa(8, 3.5, 6, tij2, 0, 12.8, 22));                 // portal onde as escadas se encontram
    zig.add(escada(12, 5, 11, 0, 18, 0).translateY(11));         // subida para os terraços de cima
    // santuário no topo, com faixa azul vidrada
    const sant = new THREE.Group();
    sant.add(caixa(14, 6, 10, tij, 0, 3, 0), caixa(14.4, 0.8, 10.4, azulM, 0, 5.2, 0), caixa(3, 4, 0.3, new THREE.MeshStandardMaterial({ color: 0x1a120c }), 0, 2, 5.05));
    sant.position.y = 22; zig.add(sant);
    cena.add(sombra(zig));

    // cidade de Ur em volta: casas de tijolo cru e muralha
    const casaM = [0xc9ad7f, 0xbfa070, 0xd4bb8e].map(c => new THREE.MeshStandardMaterial({ color: c, roughness: 0.95 }));
    const cidade = new THREE.Group();
    for (let i = 0; i < 420; i++) { const a = Math.random() * Math.PI * 2, r = 60 + Math.random() * 170; const x = Math.cos(a) * r, z = Math.sin(a) * r * 0.8; const w = 5 + Math.random() * 6, d = 5 + Math.random() * 6, h = 3 + Math.random() * 3.5; cidade.add(caixa(w, h, d, casaM[i % 3], x, h / 2, z)); }
    for (let i = 0; i < 90; i++) { const a = i / 90 * Math.PI * 2; const m = caixa(18, 8, 4, tij2, Math.cos(a) * 250, 4, Math.sin(a) * 200); m.rotation.y = -a + Math.PI / 2; cidade.add(m); }
    cena.add(sombra(cidade));
    // palmeiras e o rio
    const palmas = new THREE.MeshStandardMaterial({ color: 0x5f7a3a, roughness: 1 }), tronco = new THREE.MeshStandardMaterial({ color: 0x7a6040, roughness: 1 });
    for (let i = 0; i < 70; i++) { const g = new THREE.Group(); g.add(cil(0.35, 0.5, 9, tronco, 0, 4.5, 0, 6)); for (let k = 0; k < 7; k++) { const f = caixa(5, 0.1, 0.9, palmas, 2.3, 9, 0); f.rotation.z = -0.4; const piv = new THREE.Group(); piv.add(f); piv.rotation.y = k / 7 * Math.PI * 2; g.add(piv); } const a = Math.random() * Math.PI * 2, r = 270 + Math.random() * 120; g.position.set(Math.cos(a) * r, 0, Math.sin(a) * r * 0.8); cena.add(g); }
    const rio = new THREE.Mesh(new THREE.PlaneGeometry(1600, 50), new THREE.MeshStandardMaterial({ color: 0x5b8aa0, roughness: 0.2, metalness: 0.1 })); rio.rotation.x = -Math.PI / 2; rio.rotation.z = 0.35; rio.position.set(0, 0.05, -420); cena.add(rio);

    // modo construção: topo inacabado, andaimes e carregadores
    const obra = new THREE.Group(); obra.visible = false;
    const madeira = new THREE.MeshStandardMaterial({ color: 0x8a6a44, roughness: 1 });
    for (let x = -14; x <= 14; x += 4) for (let z = -10; z <= 10; z += 10) obra.add(cil(0.15, 0.15, 10, madeira, x, 27, z, 5));
    for (let y = 23; y <= 31; y += 4) obra.add(caixa(30, 0.2, 0.3, madeira, 0, y, -10), caixa(30, 0.2, 0.3, madeira, 0, y, 10));
    const pilhas = new THREE.Group(); for (let i = 0; i < 30; i++) pilhas.add(caixa(2, 1, 1.4, tij2, -40 + (i % 10) * 3, 0.5 + Math.floor(i / 10), 40 + Math.random() * 6)); obra.add(pilhas);
    const fornos = [[-50, 30], [-46, 44], [50, 34]].map(([x, z]) => { const f = new THREE.Mesh(new THREE.SphereGeometry(3, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), tij2); f.position.set(x, 0, z); obra.add(f); return f; });
    const fumaca = []; fornos.forEach(f => { for (let i = 0; i < 6; i++) { const s = new THREE.Mesh(new THREE.SphereGeometry(1.4, 8, 6), new THREE.MeshStandardMaterial({ color: 0x6d655c, transparent: true, opacity: 0.4 })); s.userData = { f, k: i / 6 }; obra.add(s); fumaca.push(s); } });
    const roupa = [0x8b5e3c, 0xd8ccb0, 0x6f7f5a].map(c => new THREE.MeshStandardMaterial({ color: c, roughness: 0.9 }));
    const carregadores = [];
    for (let i = 0; i < 26; i++) { const g = new THREE.Group(); g.add(cil(0.25, 0.4, 1.4, roupa[i % 3], 0, 0.7, 0, 8)); g.add(caixa(0.5, 0.3, 0.4, tij2, 0, 1.75, 0)); g.userData.s = i / 26; obra.add(g); carregadores.push(g); }
    cena.add(sombra(obra));
    const caminho = s => { // da pilha de tijolos, pela escada central, até o topo
      if (s < 0.35) { const k = s / 0.35; return new THREE.Vector3(-30 + k * 30, 0, 50 - k * 4); }
      if (s < 0.75) { const k = (s - 0.35) / 0.4; return new THREE.Vector3(0, k * 11.5, 55 - 16 - k * 32 + 16); }
      const k = (s - 0.75) / 0.25; return new THREE.Vector3(0, 11.5 + k * 11, 23 - k * 12);
    };

    let construindo = false;
    return {
      aoExtra: on => { construindo = on; obra.visible = on; sant.visible = !on; },
      animar(t, dt, reduz) {
        if (!construindo || reduz) return;
        carregadores.forEach(c => { const s = (c.userData.s + t * 0.02) % 1; c.position.copy(caminho(s)); c.position.y += Math.abs(Math.sin(t * 7 + c.userData.s * 40)) * 0.08; });
        fumaca.forEach(s => { const k = (s.userData.k + t * 0.08) % 1; s.position.set(s.userData.f.position.x + Math.sin(k * 6) * 1.5, 3 + k * 16, s.userData.f.position.z); s.scale.setScalar(0.6 + k * 1.8); s.material.opacity = 0.45 * (1 - k); });
      },
    };
  },
});
