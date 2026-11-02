/* Museu de achados arqueológicos ligados à Bíblia. 1 unidade = 10 cm. Réplicas estilizadas: as inscrições são só sugeridas, sem copiar o texto original. */
V3D.registrar('museu', {
  nome: 'Achados arqueológicos', sub: 'Peças que confirmam nomes e fatos da Bíblia · réplicas estilizadas',
  ceu: 0x14110f, neblina: [120, 260], sombra: 60, dist: [3, 160],
  estacoes: [
    { id: 'geral', nome: 'A sala', ref: 'Lucas 19.40', titulo: 'Pedras que falam', medida: 'Nove achados, do século 9 a.C. ao século 1 d.C.',
      desc: 'Escavações dos últimos 180 anos trouxeram à luz inscrições, selos e objetos que citam reis, lugares e pessoas da Bíblia. Toque em cada peça para saber onde foi achada, de quando é e que texto bíblico ela ilumina.',
      cam: [0, 38, 70], alvo: [0, 8, -8] },
    { id: 'tel', nome: 'Estela de Tel Dã', ref: '1Reis 15.20; 2Reis 8.28-29', titulo: 'Estela de Tel Dã: "casa de Davi"', medida: 'Achada em 1993-94 em Tel Dã, Israel · século 9 a.C. · fragmento de cerca de 32 cm',
      desc: 'Pedaços de um monumento de pedra em aramaico, erguido por um rei arameu que se gaba de vitórias sobre Israel e sobre a "casa de Davi". É a primeira menção ao rei Davi fora da Bíblia, cerca de 150 anos depois dele. Está no Museu de Israel.',
      cam: [-30, 12, 6], alvo: [-36, 9, -10], peca: 0 },
    { id: 'mesa', nome: 'Pedra Moabita', ref: '2Reis 3.4-27', titulo: 'A Pedra Moabita, de Mesa, rei de Moabe', medida: 'Achada em 1868 em Dibom, Jordânia · cerca de 840 a.C. · 1,15 m de altura',
      desc: 'Mesa, rei de Moabe, conta como se livrou do domínio de Israel. A pedra cita Onri, rei de Israel, e o nome do Deus de Israel. Moradores locais a quebraram, mas uma cópia em papel feita antes permitiu reconstruí-la. Está no Museu do Louvre.',
      cam: [-16, 13, 2], alvo: [-27, 8, -21], peca: 1 },
    { id: 'obelisco', nome: 'Obelisco Negro', ref: '2Reis 9–10', titulo: 'O Obelisco Negro de Salmaneser III', medida: 'Achado em 1846 em Ninrode, Iraque · cerca de 825 a.C. · cerca de 2 m',
      desc: 'Um pilar de calcário preto com cenas de reis trazendo tributo à Assíria. Num dos painéis, Jeú, rei de Israel, ou seu enviado, aparece curvado diante do rei assírio. É a única imagem antiga conhecida de um rei de Israel. Está no Museu Britânico.',
      cam: [-10, 20, -12], alvo: [-14, 14, -28], peca: 2 },
    { id: 'prisma', nome: 'Prisma de Senaqueribe', ref: '2Reis 18–19; Isaías 36–37', titulo: 'O prisma de Senaqueribe', medida: 'Achado em Nínive, Iraque · cerca de 690 a.C. · cerca de 38 cm',
      desc: 'Um prisma de argila de seis faces com os anais do rei assírio. Sobre a campanha de 701 a.C., ele diz que prendeu Ezequias em Jerusalém "como um pássaro numa gaiola", mas não diz que tomou a cidade, como também conta a Bíblia.',
      cam: [4, 12, -14], alvo: [0, 9, -30], peca: 3 },
    { id: 'siloe', nome: 'Inscrição de Siloé', ref: '2Reis 20.20; 2Crônicas 32.30', titulo: 'A inscrição do túnel de Siloé', medida: 'Achada em 1880 dentro do túnel de Ezequias · cerca de 700 a.C.',
      desc: 'Gravada na parede do túnel, em hebraico antigo, conta o momento em que as duas equipes de escavadores, vindo de lados opostos, ouviram uma à outra e se encontraram. Está no Museu de Arqueologia de Istambul.',
      cam: [18, 12, -10], alvo: [14, 9, -28], peca: 4 },
    { id: 'ciro', nome: 'Cilindro de Ciro', ref: 'Esdras 1.1-4; Isaías 45.1', titulo: 'O cilindro de Ciro', medida: 'Achado em 1879 na Babilônia · cerca de 539 a.C. · 22,5 cm',
      desc: 'Um cilindro de argila em que Ciro, rei da Pérsia, registra a conquista da Babilônia e sua política de devolver povos deportados às suas terras e restaurar seus santuários, o que combina com o decreto que permitiu a volta dos judeus. Está no Museu Britânico.',
      cam: [30, 12, -4], alvo: [27, 9, -21], peca: 5 },
    { id: 'isaias', nome: 'Rolo de Isaías', ref: 'Isaías 53; Lucas 4.17-21', titulo: 'O grande rolo de Isaías, de Qumran', medida: 'Achado em 1947 nas cavernas de Qumran · século 2 a.C. · 7,34 m de comprimento',
      desc: 'Um dos Manuscritos do Mar Morto, com o livro inteiro de Isaías em 54 colunas. É cerca de mil anos mais antigo que os manuscritos hebraicos completos conhecidos antes, e mostra como o texto foi copiado com fidelidade. Está no Museu de Israel.',
      cam: [40, 14, 8], alvo: [36, 8, -8], peca: 6 },
    { id: 'pilatos', nome: 'Pedra de Pilatos', ref: 'Lucas 3.1; João 19.13', titulo: 'A pedra de Pôncio Pilatos', medida: 'Achada em 1961 em Cesareia Marítima · entre 26 e 36 d.C. · 82 cm',
      desc: 'Um bloco de calcário reaproveitado no teatro de Cesareia, com uma inscrição em latim que cita Pôncio Pilatos, prefeito da Judeia, o governador que julgou Jesus. Está no Museu de Israel.',
      cam: [20, 14, 24], alvo: [20, 8, 6], peca: 7 },
    { id: 'caifas', nome: 'Ossuário de Caifás', ref: 'Mateus 26.57; João 18.13-14', titulo: 'O ossuário de Caifás', medida: 'Achado em 1990 em Jerusalém · século 1 d.C. · 74 cm de comprimento',
      desc: 'Uma caixa de calcário para guardar ossos, decorada com rosetas e com a inscrição "José, filho de Caifás". Muitos estudiosos a ligam ao sumo sacerdote que presidiu o julgamento de Jesus. Está no Museu de Israel.',
      cam: [-20, 14, 24], alvo: [-20, 7, 6], peca: 8 },
  ],
  montar({ THREE, cena, tex, caixa, cil, sombra }) {
    // texturas de "escrita" estilizada
    const escrita = (fundo, tinta, tipo, linhas, rep) => tex(256, 256, (g, w, h) => {
      g.fillStyle = fundo; g.fillRect(0, 0, w, h);
      for (let i = 0; i < 3000; i++) { g.fillStyle = 'rgba(0,0,0,.08)'; g.fillRect(Math.random() * w, Math.random() * h, 2, 2); }
      g.strokeStyle = tinta; g.fillStyle = tinta; g.lineWidth = 2;
      const lh = h / linhas;
      for (let l = 0; l < linhas; l++) for (let x = 8; x < w - 8; x += tipo === 'cunha' ? 7 : 10) {
        if (Math.random() < 0.15) continue;
        const y = l * lh + lh * 0.3;
        if (tipo === 'cunha') { g.beginPath(); g.moveTo(x, y); g.lineTo(x + 5, y + 2); g.lineTo(x, y + 4); g.closePath(); g.fill(); if (Math.random() < .5) { g.fillRect(x + 1, y + 4, 1.5, lh * 0.35); } }
        else if (tipo === 'latim') { g.strokeRect(x, y, 6, lh * 0.5); }
        else { g.beginPath(); g.moveTo(x, y); g.lineTo(x + 4 - Math.random() * 8, y + lh * 0.5); g.moveTo(x + 2, y + lh * 0.2); g.lineTo(x + 7, y + lh * 0.1 + Math.random() * lh * 0.3); g.stroke(); }
      }
    }, rep);
    // sala
    const piso = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), new THREE.MeshStandardMaterial({ color: 0x2b2420, roughness: 0.6, metalness: 0.1 }));
    piso.rotation.x = -Math.PI / 2; piso.receiveShadow = true; cena.add(piso);
    const parede = new THREE.Mesh(new THREE.CylinderGeometry(60, 60, 50, 64, 1, true, Math.PI * 0.62, Math.PI * 0.76), new THREE.MeshStandardMaterial({ color: 0x3a312a, roughness: 1, side: THREE.BackSide }));
    parede.position.set(0, 25, 14); cena.add(parede);
    cena.add(new THREE.AmbientLight(0xffe8cc, 0.12));
    const pedestalM = new THREE.MeshStandardMaterial({ color: 0xe9e2d6, roughness: 0.7 });
    const vidroM = new THREE.MeshStandardMaterial({ color: 0xcfe6ef, roughness: 0.05, metalness: 0, transparent: true, opacity: 0.12, depthWrite: false });
    const posicoes = [[-36, -10], [-27, -21], [-14, -28], [0, -30], [14, -28], [27, -21], [36, -8], [20, 6], [-20, 6]];
    const pecas = [];
    const pedestal = (x, z, alt, larg, vidro) => {
      const g = new THREE.Group(); g.add(caixa(larg, alt, larg, pedestalM, 0, alt / 2, 0));
      if (vidro) g.add(caixa(larg * 0.95, vidro, larg * 0.95, vidroM, 0, alt + vidro / 2, 0));
      g.position.set(x, 0, z); cena.add(sombra(g));
      const luz = new THREE.SpotLight(0xffe9c8, 1.3, 70, 0.32, 0.5); luz.position.set(x * 0.8, 40, z + 14); luz.target.position.set(x, alt + 2, z);
      luz.castShadow = true; luz.shadow.mapSize.set(512, 512); cena.add(luz, luz.target);
      return g;
    };
    const basalto = c => new THREE.MeshStandardMaterial({ map: escrita(c, 'rgba(10,10,10,.75)', 'alfabeto', 14), roughness: 0.85 });

    // 0 Tel Dã: fragmento irregular
    { const [x, z] = posicoes[0]; pedestal(x, z, 6, 6, 5);
      const f = new THREE.Shape(); [[-1.6, -1.1], [1.4, -1.2], [1.7, 0.4], [0.6, 1.5], [-0.8, 1.2], [-1.7, 0.2]].forEach(([a, b], i) => i ? f.lineTo(a, b) : f.moveTo(a, b));
      const m = new THREE.Mesh(new THREE.ExtrudeGeometry(f, { depth: 0.5, bevelEnabled: true, bevelSize: 0.1, bevelThickness: 0.1 }), basalto('#4b4642'));
      m.position.set(x, 8.2, z); m.rotation.y = 0.3; cena.add(sombra(m)); pecas.push(m); }
    // 1 Pedra Moabita: estela de topo arredondado, com remendos claros da reconstrução
    { const [x, z] = posicoes[1]; pedestal(x, z, 2, 9);
      const f = new THREE.Shape(); f.moveTo(-3.2, 0); f.lineTo(3.2, 0); f.lineTo(3.2, 8.5); f.absarc(0, 8.5, 3.2, 0, Math.PI, false); f.lineTo(-3.2, 0);
      const m = new THREE.Mesh(new THREE.ExtrudeGeometry(f, { depth: 1.4, bevelEnabled: true, bevelSize: 0.2, bevelThickness: 0.2 }), basalto('#2f2c2a'));
      m.position.set(x, 2, z); m.rotation.y = 0.55; cena.add(sombra(m)); pecas.push(m);
      const rem = new THREE.MeshStandardMaterial({ color: 0x5e5650, roughness: 1 });
      [[1.6, 3, 0.7], [-2, 8.5, 0.55], [2.1, 9.6, 0.45]].forEach(([a, b, r]) => { const p = new THREE.Mesh(new THREE.CircleGeometry(r, 7), rem); p.position.set(a, b, 1.62); m.add(p); }); }
    // 2 Obelisco Negro: quatro faces com cinco faixas de relevo e topo em degraus
    { const [x, z] = posicoes[2]; pedestal(x, z, 1.5, 8);
      const rel = tex(128, 512, (g, w, h) => { g.fillStyle = '#1d1b1a'; g.fillRect(0, 0, w, h); for (let r = 0; r < 5; r++) { const y0 = 60 + r * 80; g.fillStyle = '#2c2927'; g.fillRect(8, y0, w - 16, 52); g.fillStyle = '#3d3936'; for (let k = 0; k < 4; k++) { g.fillRect(16 + k * 26, y0 + 10, 10, 34); g.beginPath(); g.arc(21 + k * 26, y0 + 8, 5, 0, 7); g.fill(); } g.fillStyle = '#141312'; for (let k = 0; k < 40; k++) g.fillRect(10 + (k % 20) * 5.5, y0 + 54 + Math.floor(k / 20) * 6, 3, 2); } });
      const m = new THREE.Mesh(new THREE.BoxGeometry(4.5, 17, 4.5), new THREE.MeshStandardMaterial({ map: rel, roughness: 0.4, metalness: 0.15 }));
      m.position.set(x, 10, z); cena.add(sombra(m)); pecas.push(m);
      for (let i = 0; i < 3; i++) { const d = caixa(4.5 - i * 0.9, 0.9, 4.5 - i * 0.9, m.material, x, 18.9 + i * 0.9, z); cena.add(d); } }
    // 3 Prisma de Senaqueribe: argila, seis faces
    { const [x, z] = posicoes[3]; pedestal(x, z, 6, 6, 6);
      const m = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.5, 3.8, 6), new THREE.MeshStandardMaterial({ map: escrita('#b9935f', 'rgba(70,45,20,.8)', 'cunha', 22), roughness: 0.9 }));
      m.position.set(x, 8, z); cena.add(sombra(m)); pecas.push(m); m.userData.gira = true; }
    // 4 Inscrição de Siloé: placa de calcário com seis linhas
    { const [x, z] = posicoes[4]; pedestal(x, z, 6, 9, 6);
      const m = caixa(7.2, 3.8, 0.6, new THREE.MeshStandardMaterial({ map: escrita('#d8ccb4', 'rgba(60,50,40,.8)', 'alfabeto', 6), roughness: 0.9 }), x, 8.2, z);
      m.rotation.x = -0.5; cena.add(sombra(m)); pecas.push(m); }
    // 5 Cilindro de Ciro: barril de argila com faixa quebrada
    { const [x, z] = posicoes[5]; pedestal(x, z, 6, 6, 5);
      const m = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 2.25, 28), new THREE.MeshStandardMaterial({ map: escrita('#c9a77a', 'rgba(80,55,30,.8)', 'cunha', 30), roughness: 0.9 }));
      m.scale.set(1, 1, 1); m.rotation.z = Math.PI / 2; m.position.set(x, 7.2, z); cena.add(sombra(m)); pecas.push(m); m.userData.giraX = true;
      const quebra = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.6, 0.5), new THREE.MeshStandardMaterial({ color: 0x8a6d4a })); quebra.position.set(0.5, 0.75, 0.6); m.add(quebra); }
    // 6 Rolo de Isaías: rolo meio aberto numa vitrine
    { const [x, z] = posicoes[6]; pedestal(x, z, 5, 12, 4);
      const pergaminho = tex(512, 128, (g, w, h) => { g.fillStyle = '#c9b48c'; g.fillRect(0, 0, w, h); for (let c = 0; c < 6; c++) { g.fillStyle = 'rgba(60,45,30,.75)'; for (let l = 0; l < 14; l++) for (let k = 0; k < 9; k++) if (Math.random() > .1) g.fillRect(12 + c * 84 + k * 8, 14 + l * 7.5, 5, 2); } g.fillStyle = 'rgba(120,90,60,.3)'; for (let i = 0; i < 400; i++) g.fillRect(Math.random() * w, Math.random() * h, 3, 3); });
      const folha = new THREE.Mesh(new THREE.PlaneGeometry(9, 2.5), new THREE.MeshStandardMaterial({ map: pergaminho, roughness: 1, side: THREE.DoubleSide }));
      folha.rotation.x = -Math.PI / 2 + 0.25; folha.position.set(x, 5.6, z); cena.add(folha); pecas.push(folha);
      const rolo = new THREE.MeshStandardMaterial({ color: 0xb59c72, roughness: 1 });
      [-1, 1].forEach(s => { const r = cil(0.6, 0.6, 2.6, rolo, x + s * 4.9, 5.8, z, 20); r.rotation.x = Math.PI / 2; cena.add(r); }); }
    // 7 Pedra de Pilatos: bloco com inscrição em latim, parte faltando
    { const [x, z] = posicoes[7]; pedestal(x, z, 1.5, 10);
      const m = caixa(8.2, 6.5, 2.4, new THREE.MeshStandardMaterial({ map: escrita('#e2d8c3', 'rgba(70,60,50,.7)', 'latim', 4), roughness: 0.9 }), x, 4.8, z);
      m.rotation.y = -0.3; cena.add(sombra(m)); pecas.push(m);
      const falta = caixa(2.6, 6.6, 1.2, new THREE.MeshStandardMaterial({ color: 0x9a907f, roughness: 1 }), -3, 0, 0.7); m.add(falta); }
    // 8 Ossuário de Caifás: caixa com tampa e rosetas
    { const [x, z] = posicoes[8]; pedestal(x, z, 3, 10);
      const ros = tex(256, 128, (g, w, h) => { g.fillStyle = '#e6dcc6'; g.fillRect(0, 0, w, h); g.strokeStyle = 'rgba(110,90,60,.8)'; g.lineWidth = 2; [[70, 64], [186, 64]].forEach(([cx, cy]) => { g.beginPath(); g.arc(cx, cy, 40, 0, 7); g.stroke(); for (let k = 0; k < 6; k++) { const a = k * Math.PI / 3; g.beginPath(); g.arc(cx + Math.cos(a) * 20, cy + Math.sin(a) * 20, 20, a + Math.PI * 0.67, a + Math.PI * 1.33); g.stroke(); } }); g.strokeRect(8, 8, w - 16, h - 16); });
      const m = new THREE.Mesh(new THREE.BoxGeometry(7.4, 3.7, 2.8), [new THREE.MeshStandardMaterial({ color: 0xe2d8c2 }), new THREE.MeshStandardMaterial({ color: 0xe2d8c2 }), new THREE.MeshStandardMaterial({ color: 0xe2d8c2 }), new THREE.MeshStandardMaterial({ color: 0xe2d8c2 }), new THREE.MeshStandardMaterial({ map: ros, roughness: 0.9 }), new THREE.MeshStandardMaterial({ map: ros, roughness: 0.9 })]);
      m.position.set(x, 4.85, z); m.rotation.y = 0.35; cena.add(sombra(m)); pecas.push(m);
      const tampa = caixa(7.5, 0.5, 2.9, new THREE.MeshStandardMaterial({ color: 0xd9ceb6, roughness: 0.9 }), 0, 2.1, 0); tampa.rotation.z = 0.04; m.add(tampa); }

    // poeira no ar, sob as luzes
    const N = 300, geo = new THREE.BufferGeometry(), pos = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) pos.set([(Math.random() - .5) * 90, Math.random() * 30, -35 + Math.random() * 50], i * 3);
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const poeira = new THREE.Points(geo, new THREE.PointsMaterial({ color: 0xffe7c2, size: 0.12, transparent: true, opacity: 0.5 })); cena.add(poeira);

    return {
      animar(t, dt, reduz) {
        if (reduz) return;
        pecas.forEach(p => { if (p.userData.gira) p.rotation.y += dt * 0.4; if (p.userData.giraX) p.rotation.x += dt * 0.4; });
        const a = geo.attributes.position;
        for (let i = 0; i < N; i++) { let y = a.getY(i) + dt * 0.25 * (0.5 + (i % 5) * 0.2); if (y > 30) y = 0; a.setY(i, y); a.setX(i, a.getX(i) + Math.sin(t * 0.3 + i) * 0.003); }
        a.needsUpdate = true;
      },
    };
  },
});
