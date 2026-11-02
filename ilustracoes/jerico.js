/* Jericó — Josué 2 e 6. Tell com muralha dupla: muro de arrimo de pedra embaixo e muro de tijolos em cima. 1 unidade = 1 m. */
V3D.registrar('jerico', {
  nome: 'Jericó', sub: 'Josué 2 e 6 · a data da destruição ainda é debatida pelos arqueólogos',
  ceu: 0x9fbbd6, neblina: [260, 900], sombra: 120, dist: [4, 500],
  extra: ['Derrubar as muralhas', 'Reerguer as muralhas'],
  estacoes: [
    { id: 'geral', nome: 'Visão geral', ref: 'Josué 6.1', titulo: 'Jericó, a cidade fechada', medida: 'Um monte artificial (tell) de cerca de 4 hectares',
      desc: 'Jericó, perto do Jordão, é uma das cidades mais antigas do mundo. Quando Israel chegou, "estava completamente fechada, ninguém saía nem entrava". As camadas da cidade formaram um monte, cercado por muralhas.',
      cam: [200, 110, 180], alvo: [0, 10, 0] },
    { id: 'muralhas', nome: 'Muralha dupla', ref: 'Josué 2.15', titulo: 'Muro de pedra e muro de tijolos', medida: 'Muro de arrimo de cerca de 4,5 m com muro de tijolos em cima',
      desc: 'As escavações mostram um muro de pedra na base do monte, sustentando um muro de tijolos de barro. No alto do monte havia uma segunda muralha. Entre as duas, casas foram construídas encostadas no muro.',
      cam: [118, 18, 60], alvo: [88, 8, 30] },
    { id: 'raabe', nome: 'A casa de Raabe', ref: 'Josué 2.15-21; 6.22-25', titulo: 'A casa na muralha e o cordão vermelho', medida: 'Uma janela voltada para fora da cidade',
      desc: 'Raabe morava numa casa construída na muralha e desceu os espias por uma corda pela janela. Ela amarrou um cordão vermelho na janela, e sua casa e sua família foram poupadas. Raabe aparece na genealogia de Jesus (Mateus 1.5).',
      cam: [118, 12, -36], alvo: [91, 9, -20] },
    { id: 'cerco', nome: 'As voltas', ref: 'Josué 6.3-15', titulo: 'Sete dias de voltas', medida: 'Uma volta por dia, sete no sétimo dia',
      desc: 'Os soldados, os sacerdotes com sete trombetas e a arca da aliança davam uma volta em torno da cidade por dia, em silêncio. No sétimo dia, deram sete voltas. A animação mostra o povo marchando.',
      cam: [150, 50, 130], alvo: [60, 2, 60] },
    { id: 'queda', nome: 'A queda', ref: 'Josué 6.20', titulo: '"O muro caiu"', medida: 'Escombros de tijolos na base do monte',
      desc: 'Ao som das trombetas, o povo gritou e o muro desabou, e cada um subiu direto para a cidade. Escavações encontraram tijolos caídos amontoados ao pé do muro de pedra e sinais de uma grande destruição por fogo.',
      cam: [160, 40, 90], alvo: [70, 4, 20], extra: true },
    { id: 'fonte', nome: 'A fonte', ref: '2Reis 2.19-22', titulo: 'A fonte de Eliseu', medida: 'Ainda hoje corre ao pé do monte',
      desc: 'Uma fonte abundante ao lado do monte explica por que a cidade existia ali. Séculos depois, o profeta Eliseu purificou suas águas jogando sal nela.',
      cam: [-80, 18, 120], alvo: [-60, 1, 92] },
    { id: 'palmeiras', nome: 'Cidade das palmeiras', ref: 'Deuteronômio 34.3; Lucas 19.1-4', titulo: 'A cidade das palmeiras', medida: 'Um oásis no vale do Jordão',
      desc: 'A Bíblia a chama de cidade das palmeiras. No tempo de Jesus, já reconstruída num lugar próximo, foi em Jericó que Zaqueu subiu numa árvore para vê-lo passar.',
      cam: [-170, 40, -120], alvo: [-90, 8, -60] },
  ],
  montar({ THREE, cena, tex, caixa, cil, sombra, particulas, pessoa }) {
    const solo = tex(256, 256, (g, w, h) => { g.fillStyle = '#b8a27a'; g.fillRect(0, 0, w, h); for (let i = 0; i < 6000; i++) { g.fillStyle = Math.random() > .5 ? 'rgba(120,105,75,.35)' : 'rgba(200,185,150,.3)'; g.fillRect(Math.random() * w, Math.random() * h, 2, 2); } }, [70, 70]);
    const chao = new THREE.Mesh(new THREE.PlaneGeometry(3000, 3000), new THREE.MeshStandardMaterial({ map: solo, roughness: 1 })); chao.rotation.x = -Math.PI / 2; chao.receiveShadow = true; cena.add(chao);
    const tijTex = tex(128, 128, (g, w, h) => { g.fillStyle = '#7a5a3a'; g.fillRect(0, 0, w, h); for (let y = 0; y < h; y += 10) for (let x = (y / 10) % 2 ? -10 : 0; x < w; x += 20) { const v = Math.random() * 25; g.fillStyle = `rgb(${170 + v | 0},${130 + v | 0},${90 + v * 0.6 | 0})`; g.fillRect(x + 1, y + 1, 18, 8); } }, [6, 2]);
    const tij = new THREE.MeshStandardMaterial({ map: tijTex, roughness: 0.95 });
    const pedraTex = tex(128, 128, (g, w, h) => { g.fillStyle = '#8a7b62'; g.fillRect(0, 0, w, h); for (let i = 0; i < 60; i++) { g.fillStyle = `rgb(${150 + Math.random() * 50 | 0},${135 + Math.random() * 40 | 0},${105 + Math.random() * 35 | 0})`; g.beginPath(); g.ellipse(Math.random() * w, Math.random() * h, 8 + Math.random() * 10, 6 + Math.random() * 7, Math.random(), 0, 7); g.fill(); } }, [8, 1]);
    const pedra = new THREE.MeshStandardMaterial({ map: pedraTex, roughness: 1 });

    // o monte (tell)
    const R = 95;
    const tell = new THREE.Mesh(new THREE.CylinderGeometry(R - 12, R + 8, 12, 64), new THREE.MeshStandardMaterial({ map: solo, roughness: 1 })); tell.position.y = 6; tell.receiveShadow = true; cena.add(tell);
    // muro de arrimo de pedra e muro de tijolos em cima, em segmentos (para poderem cair)
    const segmentos = [];
    const N = 72;
    for (let i = 0; i < N; i++) {
      const a = i / N * Math.PI * 2, x = Math.cos(a) * (R + 2), z = Math.sin(a) * (R + 2), L = 2 * Math.PI * (R + 2) / N + 0.3;
      const arrimo = caixa(L, 4.5, 2.4, pedra, x, 2.25, z); arrimo.rotation.y = -a + Math.PI / 2; cena.add(sombra(arrimo));
      const raabe = a > 5.9 || a < 0.06;   // trecho da casa de Raabe, que não caiu (Josué 6.22)
      const muro = caixa(L, 6, 2, tij, Math.cos(a) * (R + 1.6), 4.5 + 3, Math.sin(a) * (R + 1.6)); muro.rotation.y = -a + Math.PI / 2;
      muro.userData = { a, raabe, y0: muro.position.y }; cena.add(sombra(muro)); segmentos.push(muro);
    }
    // muralha superior, no alto do monte
    for (let i = 0; i < 56; i++) {
      const a = i / 56 * Math.PI * 2, r = R - 14, L = 2 * Math.PI * r / 56 + 0.3;
      const m = caixa(L, 7, 2.2, tij, Math.cos(a) * r, 12 + 3.5, Math.sin(a) * r); m.rotation.y = -a + Math.PI / 2; m.userData = { a, raabe: false, y0: m.position.y, alto: true }; cena.add(sombra(m)); segmentos.push(m);
    }
    // casas entre as muralhas e dentro da cidade
    const casaM = [0xc9ad7f, 0xbfa070, 0xd4bb8e].map(c => new THREE.MeshStandardMaterial({ color: c, roughness: 0.95 }));
    const casas = new THREE.Group();
    for (let i = 0; i < 60; i++) { const a = i / 60 * Math.PI * 2 + 0.05, r = R - 4; const c = caixa(5, 4, 5, casaM[i % 3], Math.cos(a) * r, 6.5 + 2, Math.sin(a) * r); c.rotation.y = -a; casas.add(c); }
    for (let i = 0; i < 260; i++) { const a = Math.random() * Math.PI * 2, r = Math.random() * (R - 22); const w = 4 + Math.random() * 4, h = 3 + Math.random() * 3; casas.add(caixa(w, h, w, casaM[i % 3], Math.cos(a) * r, 12 + h / 2, Math.sin(a) * r)); }
    cena.add(sombra(casas));
    // casa de Raabe com janela e cordão vermelho
    const raabe = new THREE.Group();
    raabe.add(caixa(7, 7, 6, casaM[0], 0, 0, 0), caixa(0.2, 1.4, 1.2, new THREE.MeshStandardMaterial({ color: 0x1a140f }), 3.55, 1.5, 0));
    const cordao = cil(0.08, 0.08, 9, new THREE.MeshStandardMaterial({ color: 0xc0151b, emissive: 0x500000 }), 3.7, -3.5, 0.4, 6); raabe.add(cordao);
    raabe.position.set(R + 0.5, 11.5, 0); cena.add(sombra(raabe));

    // escombros que aparecem quando o muro cai
    const escombros = new THREE.Group(); escombros.visible = false;
    for (let i = 0; i < 260; i++) { const a = Math.random() * Math.PI * 2; if (a > 5.85 || a < 0.1) continue; const r = R + 4 + Math.random() * 6; const t = caixa(1.2, 0.5, 0.8, tij, Math.cos(a) * r, 0.3 + Math.random() * 1.8, Math.sin(a) * r); t.rotation.set(Math.random(), Math.random() * 3, Math.random()); escombros.add(t); }
    cena.add(sombra(escombros));
    const poeira = particulas(300, 0xc9ad7c, 6, 0, true); cena.add(poeira);

    // o povo marchando em volta: soldados, sacerdotes com trombetas e a arca
    const marcha = [];
    for (let i = 0; i < 70; i++) {
      const sac = i >= 30 && i < 37, arca = i === 37;
      let p;
      if (arca) { p = new THREE.Group(); p.add(caixa(1.1, 0.7, 0.7, new THREE.MeshStandardMaterial({ color: 0xd8b04c, metalness: 0.9, roughness: 0.3 }), 0, 1.4, 0)); [[-0.8, -0.5], [0.8, -0.5], [-0.8, 0.5], [0.8, 0.5]].forEach(([x, z]) => { const s = pessoa(0xf0ece0, { i, manto: 0xe6dfcc, turbante: 0xffffff }); s.position.set(x, 0, z); p.add(s); }); }
      else { p = pessoa(sac ? 0xf0ece0 : [0x8b5e3c, 0x6f7f5a, 0xa58d68, 0x5b4a6a][i % 4], { i, turbante: sac ? 0xffffff : undefined }); if (sac) { const tr = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.8, 8, 1, true), new THREE.MeshStandardMaterial({ color: 0xd8c08a })); tr.rotation.z = Math.PI / 2.5; tr.position.set(0.3, 1.5, 0.2); p.add(tr); } }
      p.scale.setScalar(1.3); p.userData.k = i; cena.add(sombra(p)); marcha.push(p);
    }
    // fonte e palmeiras
    cena.add(cil(7, 7, 0.2, new THREE.MeshStandardMaterial({ color: 0x4f86a6, roughness: 0.1, metalness: 0.2 }), -60, 0.12, 92, 30));
    const palmas = new THREE.MeshStandardMaterial({ color: 0x5f7a3a, roughness: 1 }), tronco = new THREE.MeshStandardMaterial({ color: 0x7a6040, roughness: 1 });
    for (let i = 0; i < 90; i++) { const g = new THREE.Group(); g.add(cil(0.3, 0.45, 8, tronco, 0, 4, 0, 6)); for (let k = 0; k < 7; k++) { const f = caixa(4.5, 0.1, 0.8, palmas, 2, 8, 0); f.rotation.z = -0.4; const piv = new THREE.Group(); piv.add(f); piv.rotation.y = k / 7 * Math.PI * 2; g.add(piv); } const a = Math.PI * 0.55 + Math.random() * Math.PI * 0.9, r = 125 + Math.random() * 90; g.position.set(Math.cos(a) * r, 0, Math.sin(a) * r); cena.add(g); }

    let caindo = false, tq = 0, marchar = false;
    return {
      aoExtra: on => { caindo = on; tq = 0; escombros.visible = false; if (!on) segmentos.forEach(s => { s.position.y = s.userData.y0; s.rotation.x = 0; s.rotation.z = 0; s.visible = true; }); },
      aoEstacao: e => { marchar = e.id === 'cerco' || e.id === 'geral' || e.id === 'queda'; },
      animar(t, dt, reduz) {
        if (caindo) {
          tq += dt;
          segmentos.forEach((s, i) => {
            if (s.userData.raabe) return;
            const atraso = (i % 9) * 0.06, k = Math.min(1, Math.max(0, (tq - atraso) / 1.2));
            s.position.y = s.userData.y0 - k * (s.userData.alto ? 6 : 6.5); s.rotateOnAxis(new THREE.Vector3(1, 0, 0), 0); s.rotation.x = k * 0.9 * (i % 2 ? 1 : -1) * 0.5;
            if (k >= 1) s.visible = false;
          });
          if (tq > 0.8) escombros.visible = true;
          const p = poeira.geometry.attributes.position, v = poeira.userData.vida;
          poeira.material.opacity = Math.max(0, 0.45 - Math.max(0, tq - 1.5) * 0.08);
          for (let i = 0; i < v.length; i++) { const a = i / v.length * Math.PI * 2; const s = Math.min(1, tq / 3); p.setXYZ(i, Math.cos(a) * (R + 4 + s * 10 * (v[i])), 1 + s * 14 * v[i], Math.sin(a) * (R + 4 + s * 10 * (v[i]))); }
          p.needsUpdate = true;
        }
        if (reduz || !marchar) { marcha.forEach(p => { p.visible = marchar; }); return; }
        marcha.forEach(p => { p.visible = true; const a = (p.userData.k * 0.035 + t * 0.03) % (Math.PI * 2); const r = R + 16; p.position.set(Math.cos(a) * r, Math.abs(Math.sin(t * 6 + p.userData.k)) * 0.06, Math.sin(a) * r); p.rotation.y = -a; });
      },
    };
  },
});
