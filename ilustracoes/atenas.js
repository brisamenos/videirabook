/* Atenas no tempo de Paulo — Atos 17.16-34. Acrópole, Areópago e Ágora. 1 unidade = 1 m. Norte = z negativo. */
V3D.registrar('atenas', {
  nome: 'Atenas', sub: 'Atos 17 · Acrópole, Areópago e a praça onde Paulo debatia',
  ceu: 0x8fb8dd, neblina: [400, 1400], sombra: 220, dist: [6, 800],
  estacoes: [
    { id: 'geral', nome: 'Visão geral', ref: 'Atos 17.16', titulo: 'Uma cidade cheia de ídolos', medida: 'A Acrópole fica cerca de 70 m acima da cidade',
      desc: 'Enquanto esperava Silas e Timóteo, Paulo andou por Atenas e ficou profundamente indignado ao ver a cidade cheia de ídolos. No alto da Acrópole brilhavam os templos de mármore construídos quinhentos anos antes.',
      cam: [320, 200, 260], alvo: [-80, 30, -60] },
    { id: 'agora', nome: 'A Ágora', ref: 'Atos 17.17', titulo: 'A praça do mercado', medida: 'O centro da vida pública da cidade',
      desc: 'Paulo discutia na sinagoga com judeus e gregos tementes a Deus e, todos os dias, na praça com quem encontrasse. A Ágora era o mercado, o lugar dos tribunais, dos templos e das longas conversas.',
      cam: [-150, 40, -170], alvo: [-230, 2, -250] },
    { id: 'stoa', nome: 'Os pórticos', ref: 'Atos 17.18-21', titulo: 'Epicureus e estoicos', medida: 'Pórtico de Átalo, com 116 m, reconstruído na década de 1950',
      desc: 'Filósofos epicureus e estoicos discutiam com Paulo nos pórticos da praça e o chamaram de "tagarela". Os estoicos tiravam o nome justamente de "stoa", pórtico. O Pórtico de Átalo foi reconstruído e hoje é um museu.',
      cam: [-110, 18, -220], alvo: [-150, 6, -260] },
    { id: 'hefesto', nome: 'Templo de Hefesto', ref: 'Atos 17.24-25', titulo: 'O templo de Hefesto', medida: 'Um dos templos gregos mais bem conservados do mundo',
      desc: 'Do alto de uma colina, o templo de Hefesto, deus dos ferreiros, dominava a praça. Ainda está de pé. Paulo diria que o Deus que fez o mundo não habita em templos feitos por mãos humanas.',
      cam: [-290, 24, -200], alvo: [-330, 12, -240] },
    { id: 'altar', nome: 'Deus desconhecido', ref: 'Atos 17.22-23', titulo: '"Ao Deus desconhecido"', medida: 'Escritores antigos citam altares assim em Atenas',
      desc: 'Paulo começou seu discurso citando um altar com a inscrição "Ao Deus desconhecido": "Esse que vocês adoram sem conhecer é o que eu lhes anuncio." O altar deste modelo é ilustrativo.',
      cam: [-196, 6, -214], alvo: [-206, 1.6, -226] },
    { id: 'areopago', nome: 'O Areópago', ref: 'Atos 17.19-22,32-34', titulo: 'Paulo no Areópago', medida: 'Uma colina de rocha abaixo da Acrópole',
      desc: 'Levaram Paulo ao Areópago, onde se reunia o conselho da cidade. Ele falou do Deus criador, "em quem vivemos, nos movemos e existimos", e da ressurreição. Uns zombaram, outros creram, entre eles Dionísio, membro do conselho, e uma mulher chamada Dâmaris.',
      cam: [-130, 46, -40], alvo: [-170, 30, -70] },
    { id: 'partenon', nome: 'O Partenon', ref: 'Atos 17.29', titulo: 'O Partenon', medida: '69,5 × 30,9 m, com 46 colunas externas',
      desc: 'O grande templo de Atena, a deusa da cidade, guardava uma estátua de ouro e marfim de cerca de 12 m. Paulo disse que não se deve pensar que a divindade é semelhante a ouro, prata ou pedra, esculpidos pela arte humana.',
      cam: [60, 100, 70], alvo: [10, 80, 0] },
  ],
  montar({ THREE, cena, tex, caixa, cil, sombra, pessoa }) {
    const marmore = new THREE.MeshStandardMaterial({ color: 0xf2ede2, roughness: 0.45 });
    const marmoreQ = new THREE.MeshStandardMaterial({ color: 0xe8dcc6, roughness: 0.55 });
    const telha = new THREE.MeshStandardMaterial({ color: 0xa65a3a, roughness: 0.8 });
    const rochaM = new THREE.MeshStandardMaterial({ color: 0x75685a, roughness: 1, flatShading: true });
    const solo = tex(256, 256, (g, w, h) => { g.fillStyle = '#b6a682'; g.fillRect(0, 0, w, h); for (let i = 0; i < 6000; i++) { g.fillStyle = Math.random() > .5 ? 'rgba(120,110,80,.35)' : 'rgba(205,195,160,.3)'; g.fillRect(Math.random() * w, Math.random() * h, 2, 2); } }, [90, 90]);
    const chao = new THREE.Mesh(new THREE.PlaneGeometry(4000, 4000), new THREE.MeshStandardMaterial({ map: solo, roughness: 1 })); chao.rotation.x = -Math.PI / 2; chao.receiveShadow = true; cena.add(chao);

    // a Acrópole: rocha de topo plano
    const acro = new THREE.Mesh(new THREE.CylinderGeometry(120, 165, 70, 18), rochaM); acro.scale.set(1.15, 1, 0.62); acro.position.y = 35; cena.add(sombra(acro));
    const topo = new THREE.Mesh(new THREE.CircleGeometry(120, 18), new THREE.MeshStandardMaterial({ color: 0xc9bea6, roughness: 1 })); topo.rotation.x = -Math.PI / 2; topo.scale.set(1.15, 0.62, 1); topo.position.y = 70.05; cena.add(topo);
    // templo grego genérico: colunas, entablamento e frontão
    const templo = (L, W, colL, colW, h) => {
      const g = new THREE.Group();
      for (let i = 0; i < 3; i++) g.add(caixa(L + 3 - i, 0.5, W + 3 - i, marmoreQ, 0, 0.25 + i * 0.5, 0));
      const base = 1.5;
      const col = (x, z) => { const c = cil(h * 0.085, h * 0.1, h, marmore, x, base + h / 2, z, 16); g.add(c); g.add(caixa(h * 0.25, h * 0.04, h * 0.25, marmore, x, base + h + h * 0.02, z)); };
      for (let i = 0; i < colL; i++) { const x = -L / 2 + i * L / (colL - 1); col(x, -W / 2); col(x, W / 2); }
      for (let i = 1; i < colW - 1; i++) { const z = -W / 2 + i * W / (colW - 1); col(-L / 2, z); col(L / 2, z); }
      g.add(caixa(L * 0.86, h * 0.95, W * 0.62, marmoreQ, 0, base + h * 0.48, 0));     // cela
      g.add(caixa(L + 1.6, h * 0.22, W + 1.6, marmore, 0, base + h * 1.15, 0));        // entablamento
      const f = new THREE.Shape(); f.moveTo(-(W + 1.6) / 2, 0); f.lineTo(0, h * 0.28); f.lineTo((W + 1.6) / 2, 0); f.lineTo(-(W + 1.6) / 2, 0);
      const fr = new THREE.Mesh(new THREE.ExtrudeGeometry(f, { depth: L + 1.6, bevelEnabled: false }), telha); fr.rotation.y = Math.PI / 2; fr.position.set(-(L + 1.6) / 2, base + h * 1.26, 0); g.add(fr);
      return g;
    };
    // Partenon (8 × 17 colunas), Erecteion, Propileus e a estátua de Atena Prómacos
    const partenon = templo(69.5, 30.9, 17, 8, 10.4); partenon.position.set(15, 70, 2); cena.add(sombra(partenon));
    const erec = templo(23, 12, 6, 4, 7); erec.position.set(10, 70, -36); cena.add(sombra(erec));
    const prop = templo(24, 20, 6, 6, 9); prop.position.set(-108, 70, -8); cena.add(sombra(prop));
    const atena = new THREE.Group(); atena.add(caixa(3, 3, 3, marmore, 0, 1.5, 0)); atena.add(cil(0.9, 1.3, 7, new THREE.MeshStandardMaterial({ color: 0x8a6a3a, metalness: 0.8, roughness: 0.35 }), 0, 6.5, 0, 12)); const lanca = cil(0.08, 0.08, 10, new THREE.MeshStandardMaterial({ color: 0xd8b04c, metalness: 0.9 }), 1.2, 9, 0, 6); atena.add(lanca);
    atena.position.set(-70, 70, -12); cena.add(sombra(atena));
    // caminho de subida (Via Sacra) na face oeste
    for (let i = 0; i < 30; i++) cena.add(caixa(14, 2.4, 6, marmoreQ, -150 + i * 1.3, 1.2 + i * 2.33, 8 - i * 0.2));

    // o Areópago: colina de rocha com degraus escavados
    const areo = new THREE.Mesh(new THREE.DodecahedronGeometry(1, 1), rochaM); areo.scale.set(55, 30, 32); areo.position.set(-170, 0, -70); cena.add(sombra(areo));
    for (let i = 0; i < 14; i++) cena.add(caixa(3, 0.6, 2, rochaM, -205 + i * 1.8, 8 + i * 1.6, -46));
    const plato = new THREE.Mesh(new THREE.CircleGeometry(14, 16), new THREE.MeshStandardMaterial({ color: 0xb2a78f, roughness: 1 })); plato.rotation.x = -Math.PI / 2; plato.position.set(-170, 29.6, -70); cena.add(plato);
    // Paulo e os ouvintes
    const plateia = new THREE.Group();
    const paulo = pessoa(0x4a3a5a, { i: 0, manto: 0x7a5a3a }); paulo.scale.setScalar(1.4); paulo.position.set(-170, 29.6, -62); paulo.rotation.y = Math.PI; plateia.add(paulo);
    const braco = cil(0.07, 0.07, 0.8, new THREE.MeshStandardMaterial({ color: 0x4a3a5a }), 0.3, 1.5, 0.15, 6); braco.rotation.z = -1.1; paulo.add(braco);
    for (let i = 0; i < 18; i++) { const a = -0.8 + i / 17 * 1.6; const p = pessoa(i % 3 ? 0xece6d8 : [0x6a7a9a, 0x9a6a4a, 0x7a8a5a][i % 3], { i, turbante: false }); p.scale.setScalar(1.35); p.position.set(-170 + Math.sin(a) * (7 + (i % 2) * 2.5), 29.6, -62 - Math.cos(a) * (7 + (i % 2) * 2.5)); p.lookAt(-170, 29.6, -62); plateia.add(p); }
    cena.add(sombra(plateia));

    // a Ágora: pórtico de Átalo, outros pórticos, templo de Hefesto e altares
    const stoa = (L, h, dois) => { const g = new THREE.Group(); const n = Math.floor(L / 4); for (let i = 0; i <= n; i++) { g.add(cil(0.45, 0.5, h, marmore, i * L / n - L / 2, h / 2 + 0.6, 0, 10)); if (dois) g.add(cil(0.35, 0.4, h * 0.85, marmore, i * L / n - L / 2, h * 1.5 + 1, 0, 10)); } g.add(caixa(L + 2, 0.6, 12, marmoreQ, 0, 0.3, 3)); g.add(caixa(L, h * (dois ? 2.1 : 1.05), 1, marmoreQ, 0, h * (dois ? 1.05 : 0.52) + 0.6, 8)); g.add(caixa(L + 1, 0.8, 12, telha, 0, h * (dois ? 2.1 : 1.05) + 1, 3)); if (dois) g.add(caixa(L, 0.6, 9, marmoreQ, 0, h + 0.9, 3)); return g; };
    const atalo = stoa(116, 6, true); atalo.rotation.y = Math.PI / 2; atalo.position.set(-150, 0, -265); cena.add(sombra(atalo));
    const sul = stoa(80, 5, false); sul.position.set(-230, 0, -185); sul.rotation.y = Math.PI; cena.add(sombra(sul));
    const zeus = stoa(44, 5, false); zeus.rotation.y = -Math.PI / 2; zeus.position.set(-300, 0, -280); cena.add(sombra(zeus));
    const colina = new THREE.Mesh(new THREE.SphereGeometry(60, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshStandardMaterial({ color: 0xa69a78, roughness: 1 })); colina.scale.y = 0.18; colina.position.set(-330, 0, -240); cena.add(colina);
    const hef = templo(31.8, 13.7, 13, 6, 7); hef.rotation.y = Math.PI / 2; hef.position.set(-330, 10.5, -240); cena.add(sombra(hef));
    // altar "Ao Deus desconhecido" (inscrição ilustrativa)
    const insc = tex(256, 64, (g, w, h) => { g.fillStyle = '#e8e0cf'; g.fillRect(0, 0, w, h); g.fillStyle = '#5a4a3a'; g.font = '600 22px Georgia, serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('AO DEUS DESCONHECIDO', w / 2, h / 2); });
    const altar = new THREE.Group(); altar.add(caixa(2.4, 1.4, 1.6, new THREE.MeshStandardMaterial({ map: insc, roughness: 0.8 }), 0, 0.7, 0), caixa(2.7, 0.25, 1.9, marmore, 0, 1.52, 0));
    altar.position.set(-206, 0, -226); altar.rotation.y = 0.5; cena.add(sombra(altar));
    // estátuas e hermas espalhadas pela praça (os ídolos de Atos 17.16)
    const bronze = new THREE.MeshStandardMaterial({ color: 0x7a6a4a, metalness: 0.6, roughness: 0.5 });
    for (let i = 0; i < 26; i++) { const g = new THREE.Group(); g.add(caixa(1.2, 1.5, 1.2, marmoreQ, 0, 0.75, 0)); g.add(cil(0.35, 0.5, 2.2, i % 2 ? bronze : marmore, 0, 2.6, 0, 8)); const c = new THREE.Mesh(new THREE.SphereGeometry(0.3, 10, 8), i % 2 ? bronze : marmore); c.position.y = 3.95; g.add(c); g.position.set(-280 + Math.random() * 110, 0, -300 + Math.random() * 100); cena.add(sombra(g)); }
    // povo na praça
    const povo = []; for (let i = 0; i < 50; i++) { const p = pessoa(i % 3 ? 0xece6d8 : [0x6a7a9a, 0x9a6a4a, 0x7a8a5a][i % 3], { i, turbante: false }); p.scale.setScalar(1.3); p.userData = { x: -270 + Math.random() * 100, z: -290 + Math.random() * 90, f: Math.random() * 7 }; cena.add(sombra(p)); povo.push(p); }
    // casas da cidade
    const casaM = [0xe2d6bc, 0xd6c6a6, 0xeadfc8].map(c => new THREE.MeshStandardMaterial({ color: c, roughness: 0.95 }));
    const casas = new THREE.Group();
    for (let i = 0; i < 700; i++) { const a = Math.random() * Math.PI * 2, r = 200 + Math.random() * 600; const x = Math.cos(a) * r, z = Math.sin(a) * r * 0.9; if (x > -360 && x < -110 && z > -330 && z < -150) continue; if (Math.hypot((x + 170) / 70, (z + 70) / 45) < 1) continue; const w = 8 + Math.random() * 10, h = 5 + Math.random() * 6; casas.add(caixa(w, h, w * (0.7 + Math.random() * 0.6), casaM[i % 3], x, h / 2, z)); casas.add(caixa(w + 0.6, 1, w * 0.9, telha, x, h + 0.5, z)); }
    cena.add(sombra(casas));
    // oliveiras e o monte Licabeto ao fundo
    const lic = new THREE.Mesh(new THREE.ConeGeometry(160, 220, 9), rochaM); lic.position.set(700, 60, -900); cena.add(lic);

    return {
      animar(t, dt, reduz) {
        if (reduz) return;
        braco.rotation.z = -1.1 + Math.sin(t * 2) * 0.35;
        povo.forEach((p, i) => { const u = p.userData; p.position.set(u.x + Math.sin(t * 0.15 + u.f) * 6, 0, u.z + Math.cos(t * 0.12 + u.f) * 6); p.rotation.y = t * 0.15 + u.f; });
      },
    };
  },
});
