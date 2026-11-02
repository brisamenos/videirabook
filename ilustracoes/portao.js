/* Portão de seis câmaras — Gezer, Hazor e Megido (1Reis 9.15). 1 unidade = 1 m. A estrada entra pelo leste (x positivo). */
V3D.registrar('portao', {
  nome: 'Portão da cidade', sub: 'Portão de seis câmaras · Gezer, Hazor e Megido, século 10 a.C.',
  ceu: 0x8fb0cf, neblina: [140, 520], sombra: 60, dist: [2, 300],
  estacoes: [
    { id: 'geral', nome: 'Visão geral', ref: '1Reis 9.15', titulo: 'Os portões de Salomão', medida: 'Cerca de 20 m de profundidade × 17 m de largura',
      desc: 'A Bíblia diz que Salomão fortificou Jerusalém, Hazor, Megido e Gezer. Nessas três cidades, arqueólogos encontraram portões quase idênticos, com três câmaras de cada lado da passagem, o que muitos atribuem ao mesmo projeto real.',
      cam: [62, 40, 52], alvo: [0, 3, 0] },
    { id: 'entrada', nome: 'A passagem', ref: 'Salmo 24.7-9', titulo: 'Torres e portas de madeira', medida: 'Passagem de cerca de 4 m de largura',
      desc: 'Duas torres protegiam a entrada, fechada por grandes portas de madeira reforçadas com bronze e trancadas com barras (Deuteronômio 3.5). Quem atacava precisava passar por quatro pares de pilares, um atrás do outro.',
      cam: [26, 6, 6], alvo: [6, 4, 0] },
    { id: 'camaras', nome: 'As câmaras', ref: '2Samuel 18.24; 2Reis 7.1', titulo: 'Seis câmaras', medida: 'Três de cada lado, com cerca de 3 × 5 m cada',
      desc: 'As câmaras abrigavam guardas, mas também eram o lugar mais movimentado da cidade: ali se faziam negócios, se trocavam notícias e se vendia de tudo. Davi esperou notícias da batalha sentado entre as duas portas.',
      cam: [2, 12, 16], alvo: [-2, 1, 0] },
    { id: 'anciaos', nome: 'Os anciãos', ref: 'Rute 4.1-11; Provérbios 31.23', titulo: 'Os anciãos sentados à porta', medida: 'Bancos de pedra junto às paredes',
      desc: 'A porta era o tribunal da cidade. Boaz subiu à porta, chamou dez anciãos como testemunhas e ali resgatou a terra de Noemi e tomou Rute como esposa. O marido da mulher virtuosa "é conhecido nas portas".',
      cam: [-4.6, 2.4, 1.2], alvo: [-7, 1.1, -6.8] },
    { id: 'muralha', nome: 'Muralha de casamata', ref: 'Josué 2.15', titulo: 'A muralha dupla, de casamata', medida: 'Duas paredes paralelas, com salas entre elas',
      desc: 'De cada lado do portão saía uma muralha formada por duas paredes ligadas por paredes transversais. As salas entre elas serviam de depósito ou de casa. Em Jericó, Raabe morava numa casa construída na própria muralha.',
      cam: [-22, 22, 46], alvo: [-24, 3, 14] },
  ],
  montar({ THREE, cena, tex, caixa, cil, sombra }) {
    const pedraTex = tex(256, 256, (g, w, h) => { g.fillStyle = '#c7b48e'; g.fillRect(0, 0, w, h); for (let y = 0; y < h; y += 24) for (let x = (y / 24) % 2 ? -18 : 0; x < w; x += 36 + Math.random() * 8) { g.fillStyle = `rgb(${170 + Math.random() * 40 | 0},${150 + Math.random() * 35 | 0},${115 + Math.random() * 30 | 0})`; g.fillRect(x + 1, y + 1, 34, 22); } }, [3, 2]);
    const pedra = new THREE.MeshStandardMaterial({ map: pedraTex, roughness: 0.95 });
    const madeira = new THREE.MeshStandardMaterial({ color: 0x6d4a2c, roughness: 0.85 });
    const bronze = new THREE.MeshStandardMaterial({ color: 0x9a6a3a, metalness: 0.7, roughness: 0.45 });
    const solo = tex(256, 256, (g, w, h) => { g.fillStyle = '#b29c74'; g.fillRect(0, 0, w, h); for (let i = 0; i < 5000; i++) { g.fillStyle = Math.random() > .5 ? 'rgba(120,105,75,.35)' : 'rgba(200,185,150,.3)'; g.fillRect(Math.random() * w, Math.random() * h, 2, 2); } }, [50, 50]);
    const chao = new THREE.Mesh(new THREE.PlaneGeometry(700, 700), new THREE.MeshStandardMaterial({ map: solo, roughness: 1 })); chao.rotation.x = -Math.PI / 2; chao.receiveShadow = true; cena.add(chao);
    const H = 7;
    const portao = new THREE.Group();
    // pilares: quatro pares, formando três câmaras de cada lado da passagem (x de -10 a 10)
    [-10, -4, 2, 8].forEach((x, i) => [-1, 1].forEach(s => portao.add(caixa(i === 3 ? 2.4 : 1.6, H, 6.5, pedra, x, H / 2, s * 5.25)))); // pilares que avançam até a passagem
    [-1, 1].forEach(s => portao.add(caixa(20, H, 1.6, pedra, -1, H / 2, s * 8.3)));                                                      // paredes do fundo das câmaras
    // torres na frente
    [-1, 1].forEach(s => portao.add(caixa(6, H + 3, 7, pedra, 12, (H + 3) / 2, s * 5.5)));
    [-1, 1].forEach(s => { for (let i = 0; i < 4; i++) portao.add(caixa(1, 1, 1, pedra, 9.6 + i * 1.6, H + 3.5, s * 8.6)); });
    // bancos de pedra nas câmaras
    [-7, -1, 5].forEach(x => [-1, 1].forEach(s => portao.add(caixa(4.2, 0.5, 0.7, pedra, x, 0.25, s * 7.1))));
    // piso da passagem e calha
    portao.add(caixa(28, 0.15, 4, new THREE.MeshStandardMaterial({ color: 0xa5916a, roughness: 1 }), 2, 0.08, 0));
    cena.add(sombra(portao));
    // portas de madeira com cravos de bronze, presas à torre
    const portas = [-1, 1].map(s => { const piv = new THREE.Group(); const f = caixa(2, 5.2, 0.25, madeira, -s * 1, 2.6, 0); piv.add(f); for (let y = 0.6; y < 5; y += 0.9) piv.add(caixa(2, 0.12, 0.3, bronze, -s * 1, y, 0)); piv.position.set(9, 0, s * 2); cena.add(sombra(piv)); return piv; });
    // muralha de casamata saindo para os dois lados
    const muro = new THREE.Group();
    [-1, 1].forEach(s => {
      for (let z = 9.1; z < 70; z += 6) {
        muro.add(caixa(1.6, H - 1, 6, pedra, 7.2, (H - 1) / 2, s * (z + 3)), caixa(1.6, H - 1, 6, pedra, 1.2, (H - 1) / 2, s * (z + 3)));
        muro.add(caixa(6, H - 1, 1, pedra, 4.2, (H - 1) / 2, s * (z + 6)));
      }
    });
    cena.add(sombra(muro));
    // casas dentro da cidade
    const casaM = [0xd2c09a, 0xc5b088, 0xdccca8].map(c => new THREE.MeshStandardMaterial({ color: c, roughness: 0.95 }));
    const casas = new THREE.Group();
    for (let i = 0; i < 70; i++) { const x = -18 - Math.random() * 60, z = -50 + Math.random() * 100; if (Math.abs(z) < 4) continue; const w = 4 + Math.random() * 4, d = 4 + Math.random() * 4, h = 2.6 + Math.random() * 1.5; casas.add(caixa(w, h, d, casaM[i % 3], x, h / 2, z)); }
    cena.add(sombra(casas));
    // estrada de fora
    const estrada = new THREE.Mesh(new THREE.PlaneGeometry(120, 4.5), new THREE.MeshStandardMaterial({ color: 0x9b8763, roughness: 1 })); estrada.rotation.x = -Math.PI / 2; estrada.position.set(75, 0.03, 0); cena.add(estrada);

    // pessoas: anciãos sentados, gente passando e um burro de carga
    const roupas = [0x8b5e3c, 0x6f7f5a, 0xa58d68, 0x5b4a6a, 0x9a6a4a, 0xd8ccb0].map(c => new THREE.MeshStandardMaterial({ color: c, roughness: 0.9 }));
    const pele = new THREE.MeshStandardMaterial({ color: 0xa8734f, roughness: 0.8 });
    const barba = new THREE.MeshStandardMaterial({ color: 0xdedad2, roughness: 1 });
    const pessoa = (i, sentado, velho) => { const g = new THREE.Group(); const h = sentado ? 0.95 : 1.4; g.add(cil(0.22, 0.38, h, roupas[i % 6], 0, h / 2 + (sentado ? 0.5 : 0), 0, 10)); const c = new THREE.Mesh(new THREE.SphereGeometry(0.17, 10, 8), pele); c.position.y = h + 0.18 + (sentado ? 0.5 : 0); g.add(c); if (velho) { const b = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.3, 8), barba); b.rotation.x = Math.PI; b.position.set(0, c.position.y - 0.18, 0.1); g.add(b); } return g; };
    const anciaos = new THREE.Group();
    for (let i = 0; i < 10; i++) { const p = pessoa(i + 2, true, true); const lado = i < 5 ? -1 : 1; p.position.set(-8.6 + (i % 5) * 0.9, 0, lado * 6.85); p.rotation.y = lado < 0 ? 0 : Math.PI; anciaos.add(p); }
    const boaz = pessoa(0, false, false); boaz.position.set(-6, 0, -3.8); anciaos.add(boaz);
    cena.add(sombra(anciaos));
    const passantes = [];
    for (let i = 0; i < 7; i++) { const p = pessoa(i, false, i % 3 === 0); p.userData = { s: i * 9, lado: (i % 2 ? 1 : -1) * 0.8 }; cena.add(sombra(p)); passantes.push(p); }
    const burro = new THREE.Group(); const bm = new THREE.MeshStandardMaterial({ color: 0x6e645a, roughness: 1 });
    const corpoB = new THREE.Mesh(new THREE.SphereGeometry(0.5, 12, 8), bm); corpoB.scale.set(1.6, 0.9, 0.8); corpoB.position.y = 1.05; burro.add(corpoB);
    const cabB = new THREE.Mesh(new THREE.SphereGeometry(0.25, 10, 8), bm); cabB.position.set(0.85, 1.35, 0); burro.add(cabB);
    [[-0.5, -0.2], [0.5, -0.2], [-0.5, 0.2], [0.5, 0.2]].forEach(([x, z]) => burro.add(cil(0.07, 0.07, 0.75, bm, x, 0.38, z, 6)));
    burro.add(caixa(0.7, 0.4, 1.1, new THREE.MeshStandardMaterial({ color: 0xb99a62 }), 0, 1.5, 0));
    burro.userData = { s: 30, lado: -0.5 }; cena.add(sombra(burro)); passantes.push(burro);
    // tochas nas torres
    const tochas = [-1, 1].map(s => { const l = new THREE.PointLight(0xffa040, 1.2, 20, 2); l.position.set(14.5, H + 4.2, s * 5.5); cena.add(l); const f = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.6, 8), new THREE.MeshBasicMaterial({ color: 0xffb040 })); f.position.copy(l.position); cena.add(f); return [l, f]; });

    return {
      animar(t, dt, reduz) {
        const ab = 0.5 + 0.5 * Math.sin(t * 0.25);   // portas abrem e fecham devagar
        portas.forEach((p, i) => { p.rotation.y = (i ? -1 : 1) * (0.15 + ab * 1.3); });
        if (reduz) return;
        passantes.forEach(p => { const s = (p.userData.s + t * 2.2) % 70; p.position.set(40 - s, 0, p.userData.lado); p.rotation.y = -Math.PI / 2 + Math.PI / 2; p.position.y = Math.abs(Math.sin(t * 6 + p.userData.s)) * 0.05; });
        tochas.forEach(([l, f], i) => { l.intensity = 1.1 + Math.sin(t * 11 + i) * 0.25; f.scale.y = 1 + Math.sin(t * 13 + i) * 0.2; });
      },
    };
  },
});
