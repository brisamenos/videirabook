/* Qumran e as cavernas dos Manuscritos do Mar Morto. 1 unidade = 1 m. O mar fica a leste (x positivo); os penhascos, a oeste. */
V3D.registrar('qumran', {
  nome: 'Qumran', sub: 'Onde foram achados os Manuscritos do Mar Morto · 1947-1956',
  ceu: 0xb9cde0, neblina: [400, 1500], sombra: 140, dist: [4, 700],
  estacoes: [
    { id: 'geral', nome: 'Visão geral', ref: 'Isaías 40.8', titulo: 'Um povoado à beira do deserto', medida: 'Ocupado de cerca de 100 a.C. até 68 d.C.',
      desc: 'Num terraço entre os penhascos e o mar Morto ficava um povoado com cisternas, salas de reunião e oficinas. Nas cavernas em volta foram achados restos de cerca de 900 manuscritos, entre eles os mais antigos livros do Antigo Testamento que se conhecem.',
      cam: [260, 140, 220], alvo: [20, 0, 0] },
    { id: 'caverna1', nome: 'Caverna 1', ref: 'Jeremias 32.14', titulo: 'A descoberta de 1947', medida: 'Sete rolos guardados em jarros de barro',
      desc: 'Um pastor beduíno procurando uma cabra perdida jogou uma pedra numa caverna e ouviu barulho de cerâmica quebrando. Lá dentro havia jarros com rolos de couro, entre eles o grande rolo de Isaías. Lembra Jeremias, que mandou guardar documentos "num jarro de barro, para que durem muitos dias".',
      cam: [-96, 34, -346], alvo: [-137, 27, -380] },
    { id: 'caverna4', nome: 'Caverna 4', ref: 'Salmo 119.89', titulo: 'A caverna dos milhares de fragmentos', medida: 'Restos de mais de 500 manuscritos',
      desc: 'Escavada no próprio terraço, bem perto do povoado, a caverna 4 guardava dezenas de milhares de fragmentos. Há partes de quase todos os livros do Antigo Testamento, menos Ester, além de comentários, regras da comunidade e hinos.',
      cam: [50, 30, 90], alvo: [30, 8, 62] },
    { id: 'povoado', nome: 'O povoado', ref: 'Mateus 3.1-4', titulo: 'Quem morava em Qumran?', medida: 'Torre, salas e oficinas em volta de pátios',
      desc: 'Muitos estudiosos pensam que ali vivia um grupo de judeus muito rigorosos, provavelmente os essênios, que copiavam e estudavam as Escrituras à espera do Messias. O assunto ainda é debatido. João Batista pregou não muito longe dali, no deserto da Judeia.',
      cam: [70, 45, 60], alvo: [0, 3, 0] },
    { id: 'escritorio', nome: 'A sala dos escribas', ref: '2Timóteo 4.13', titulo: 'A sala das mesas e dos tinteiros', medida: 'Mesas de reboco e tinteiros de barro e bronze',
      desc: 'Numa sala foram achados restos de mesas compridas de gesso e tinteiros, um deles ainda com tinta seca. Muitos acreditam que ali se copiavam os rolos. Paulo também pediu a Timóteo que trouxesse "os livros, especialmente os pergaminhos".',
      cam: [22, 10, 16], alvo: [8, 1, 4] },
    { id: 'banhos', nome: 'Cisternas e banhos', ref: 'Salmo 51.7', titulo: 'Aqueduto, cisternas e banhos rituais', medida: 'Água da chuva trazida dos penhascos',
      desc: 'Um aqueduto trazia a água das chuvas de inverno do vale até grandes cisternas com degraus. Vários desses tanques eram banhos de purificação, usados antes das refeições e das orações em comum.',
      cam: [-30, 22, 40], alvo: [-8, 0, 10] },
    { id: 'cemiterio', nome: 'O cemitério', ref: 'Daniel 12.2', titulo: 'O cemitério', medida: 'Cerca de 1.100 sepulturas',
      desc: 'A leste do povoado há um cemitério com cerca de mil e cem sepulturas simples, quase todas alinhadas de norte a sul, cobertas por montinhos de pedras.',
      cam: [150, 30, 40], alvo: [100, 0, 0] },
    { id: 'mar', nome: 'O mar Morto', ref: 'Ezequiel 47.8-9', titulo: 'O mar Morto', medida: 'O lugar mais baixo da terra · mais de 400 m abaixo do nível do mar',
      desc: 'A água é tão salgada que nada vive nela. Ezequiel viu um rio saindo do templo e tornando doces as águas desse mar, que então se encheria de peixes: uma imagem da vida que vem de Deus.',
      cam: [220, 30, -60], alvo: [400, 0, 0] },
  ],
  montar({ THREE, cena, tex, caixa, cil, sombra, particulas, pessoa }) {
    const margaTex = tex(256, 256, (g, w, h) => { g.fillStyle = '#c4af88'; g.fillRect(0, 0, w, h); for (let i = 0; i < 6000; i++) { g.fillStyle = Math.random() > .5 ? 'rgba(170,150,115,.35)' : 'rgba(235,225,200,.3)'; g.fillRect(Math.random() * w, Math.random() * h, 2, 2); } for (let y = 0; y < h; y += 6) { g.fillStyle = 'rgba(160,140,105,.15)'; g.fillRect(0, y, w, 1); } }, [40, 40]);
    const marga = new THREE.MeshStandardMaterial({ map: margaTex, roughness: 1 });
    const rocha = new THREE.MeshStandardMaterial({ color: 0xa88f6c, roughness: 1, flatShading: true });
    const muroM = new THREE.MeshStandardMaterial({ color: 0xc7b48e, roughness: 1 });
    const escuro = new THREE.MeshStandardMaterial({ color: 0x1a140f, roughness: 1 });
    // terreno: penhascos a oeste, terraço de marga, descida até o mar
    const altura = (x, z) => { if (x < -150) return 70 + Math.min(70, (-150 - x) * 1.2) + Math.sin(z * 0.03) * 8; if (x < 70) return 0; return Math.max(-40, -(x - 70) * 0.35); };
    const geo = new THREE.PlaneGeometry(1600, 1600, 200, 200); geo.rotateX(-Math.PI / 2);
    const p = geo.attributes.position; for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i); let h = altura(x, z); if (Math.abs(x + 150) < 20 && x > -170) h = 70 * Math.max(0, Math.min(1, (-x - 130) / 20)); if (z > 40 && z < 70 && x > -150 && x < 60) h -= 10 * Math.max(0, 1 - Math.abs(z - 55) / 15); p.setY(i, h); }
    geo.computeVertexNormals();
    const terreno = new THREE.Mesh(geo, marga); terreno.receiveShadow = true; cena.add(terreno);
    // o mar Morto
    const marGeo = new THREE.PlaneGeometry(1200, 1600, 40, 40); marGeo.rotateX(-Math.PI / 2);
    const marBase = marGeo.attributes.position.array.slice();
    const mar = new THREE.Mesh(marGeo, new THREE.MeshStandardMaterial({ color: 0x4a8fa0, roughness: 0.15, metalness: 0.2 })); mar.position.set(760, -30, 0); cena.add(mar);
    for (let i = 0; i < 12; i++) { const m = new THREE.Mesh(new THREE.ConeGeometry(160, 120 + Math.random() * 60, 6), new THREE.MeshStandardMaterial({ color: 0x9c7d68, roughness: 1, flatShading: true })); m.position.set(1300, 20, -700 + i * 130); cena.add(m); }
    // rochedos espalhados no penhasco
    for (let i = 0; i < 60; i++) { const r = new THREE.Mesh(new THREE.DodecahedronGeometry(6 + Math.random() * 10), rocha); r.position.set(-160 - Math.random() * 60, 60 + Math.random() * 30, -500 + Math.random() * 1000); cena.add(r); }

    // povoado: muro externo, torre, salas, pátios
    const pov = new THREE.Group();
    const muro = (x, z, w, d, h = 3) => pov.add(caixa(w, h, d, muroM, x, h / 2, z));
    muro(0, -30, 80, 1); muro(0, 30, 80, 1); muro(-40, 0, 1, 60); muro(40, 0, 1, 60);
    pov.add(caixa(12, 9, 12, muroM, -26, 4.5, -22));                                        // torre
    pov.add(caixa(12.2, 0.4, 12.2, new THREE.MeshStandardMaterial({ color: 0x8a6a44 }), -26, 9.2, -22));
    muro(-10, -10, 1, 30); muro(10, -15, 30, 1); muro(-25, 5, 30, 1); muro(18, 10, 1, 40);
    // sala de reunião e refeitório (comprido, ao sul)
    pov.add(caixa(22, 4, 6, muroM, 12, 2, 24)); pov.add(caixa(22.4, 0.3, 6.4, new THREE.MeshStandardMaterial({ color: 0x8a6a44 }), 12, 4.15, 24));
    // sala dos escribas, com mesas compridas e tinteiros
    pov.add(caixa(13, 3.2, 0.5, muroM, 8, 1.6, -0.5), caixa(13, 3.2, 0.5, muroM, 8, 1.6, 8.5), caixa(0.5, 3.2, 9, muroM, 1.5, 1.6, 4));
    const gesso = new THREE.MeshStandardMaterial({ color: 0xece4d2, roughness: 0.9 });
    [1.8, 4.2, 6.6].forEach(z => { pov.add(caixa(9, 0.12, 0.6, gesso, 8.5, 0.75, z)); pov.add(caixa(9, 0.7, 0.3, gesso, 8.5, 0.35, z)); pov.add(caixa(9, 0.4, 0.35, gesso, 8.5, 0.2, z + 0.55)); });
    [[5, 1.8], [10, 4.2], [7, 6.6]].forEach(([x, z]) => pov.add(cil(0.07, 0.07, 0.12, new THREE.MeshStandardMaterial({ color: 0x4a3626 }), x, 0.87, z, 10)));
    const rolos = []; [[6, 1.8], [11, 4.2], [8, 6.6]].forEach(([x, z]) => { const r = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 0.4), new THREE.MeshStandardMaterial({ color: 0xd4c098, roughness: 1, side: THREE.DoubleSide })); r.rotation.x = -Math.PI / 2; r.position.set(x, 0.82, z); pov.add(r); rolos.push(r); });
    // forno de cerâmica
    const forno = new THREE.Mesh(new THREE.SphereGeometry(2, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), muroM); forno.position.set(30, 0, -20); pov.add(forno);
    cena.add(sombra(pov));
    // aqueduto, cisternas com degraus e banhos rituais
    const aguaM = new THREE.MeshStandardMaterial({ color: 0x5a9ab4, roughness: 0.1, metalness: 0.2, emissive: 0x0a2a3a, emissiveIntensity: 0.4 });
    const aqueduto = new THREE.CatmullRomCurve3([[-150, 40, -40], [-120, 8, -36], [-60, 1.2, -32], [-38, 0.8, -20], [-20, 0.6, 0], [0, 0.5, 14], [20, 0.4, 16]].map(v => new THREE.Vector3(...v)));
    cena.add(new THREE.Mesh(new THREE.TubeGeometry(aqueduto, 120, 0.6, 6, false), muroM));
    const fio = new THREE.Mesh(new THREE.TubeGeometry(aqueduto, 120, 0.35, 6, false), aguaM); fio.position.y = 0.3; cena.add(fio);
    const gotas = particulas(90, 0xbfeaff, 0.6, 0.9); cena.add(gotas);
    const tanque = (x, z, w, d, degraus) => { const g = new THREE.Group(); for (let i = 0; i < degraus; i++) g.add(caixa(w, 0.4, 0.8, muroM, 0, 0.1 - i * 0.4, -d / 2 + 0.4 + i * 0.8)); g.add(caixa(w, 0.1, d * 0.4, aguaM, 0, -degraus * 0.4 + 0.3, d * 0.28)); g.position.set(x, 0, z); return g; };
    cena.add(sombra(tanque(-20, 10, 5, 8, 7)), sombra(tanque(-30, -8, 4, 6, 5)), sombra(tanque(28, 4, 6, 10, 9)), sombra(tanque(0, -20, 4, 6, 5)));

    // caverna 4: aberturas escavadas na ponta do terraço
    const c4 = new THREE.Group(); c4.add(caixa(14, 12, 10, marga, 0, 6, 0));
    [[-3, 6], [2, 8], [4, 4]].forEach(([x, y]) => c4.add(caixa(1.6, 2, 0.4, escuro, x, y, 5.1)));
    c4.position.set(30, 0, 62); cena.add(sombra(c4));
    // caverna 1, no alto do penhasco, com jarros e o rolo
    const c1 = new THREE.Group();
    c1.add(new THREE.Mesh(new THREE.SphereGeometry(4.5, 14, 10, 0, Math.PI * 2, 0, Math.PI / 2), escuro));
    const jarroM = new THREE.MeshStandardMaterial({ color: 0xc9a77a, roughness: 0.9 });
    const tampas = [];
    [[-1.4, 1.2], [0, 1.8], [1.5, 1], [-0.6, 3.1]].forEach(([x, z]) => { const j = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.3, 1.2, 14), jarroM); j.position.set(x, 0.6, z); c1.add(j); const t = cil(0.37, 0.37, 0.15, jarroM, x, 1.27, z, 14); c1.add(t); tampas.push(t); });
    const rolo = cil(0.18, 0.18, 0.9, new THREE.MeshStandardMaterial({ color: 0xe0cfa2, emissive: 0x6a5020, emissiveIntensity: 0.3 }), 0, 1.4, 1.8, 12); rolo.rotation.z = Math.PI / 2; c1.add(rolo);
    const luzC1 = new THREE.PointLight(0xffe4a8, 1.4, 14, 2); luzC1.position.set(0, 3, 4); c1.add(luzC1);
    c1.position.set(-137, 26, -380); c1.rotation.z = -0.5; cena.add(c1);
    // cemitério: montinhos de pedra alinhados de norte a sul
    const cem = new THREE.Group(); const pedrinha = new THREE.MeshStandardMaterial({ color: 0xa8957a, roughness: 1 });
    for (let i = 0; i < 300; i++) { const m = new THREE.Mesh(new THREE.SphereGeometry(0.8, 6, 4), pedrinha); m.scale.set(0.7, 0.35, 1.4); m.position.set(60 + (i % 15) * 3.2, 0.1, -30 + Math.floor(i / 15) * 3.2); cem.add(m); }
    cena.add(cem);
    // pastor e cabras
    const pastor = pessoa(0x6a4a3a, { i: 1, turbante: 0xe8e0cc }); pastor.scale.setScalar(1.2); pastor.position.set(-124, 0, -366); cena.add(sombra(pastor));
    const cabras = []; for (let i = 0; i < 8; i++) { const a = new THREE.Group(); const m = new THREE.MeshStandardMaterial({ color: i % 2 ? 0x2a2420 : 0x6a5a4a, roughness: 1 }); const c = new THREE.Mesh(new THREE.SphereGeometry(0.4, 8, 6), m); c.scale.set(1.5, 0.9, 0.8); c.position.y = 0.7; a.add(c); const h = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 6), m); h.position.set(0.6, 1, 0); a.add(h); [[-0.3, -0.15], [0.3, -0.15], [-0.3, 0.15], [0.3, 0.15]].forEach(([x, z]) => a.add(cil(0.05, 0.05, 0.5, m, x, 0.25, z, 5))); a.userData = { a: Math.random() * 7, r: 6 + Math.random() * 10 }; cena.add(sombra(a)); cabras.push(a); }

    let abrir = false, ta = 0;
    return {
      aoEstacao: e => { abrir = e.id === 'caverna1'; ta = 0; },
      animar(t, dt, reduz) {
        if (abrir) { ta += dt; tampas.forEach((tp, i) => { const k = Math.min(1, Math.max(0, (ta - 1 - i * 0.3) / 1)); tp.position.y = 1.27 + k * 0.6; tp.rotation.x = k * 0.8; }); luzC1.intensity = 1.4 + Math.min(1, ta / 3) * 1.2; }
        if (reduz) return;
        const pm = marGeo.attributes.position; for (let i = 0; i < pm.count; i++) { const x = marBase[i * 3], z = marBase[i * 3 + 2]; pm.setY(i, Math.sin(x * 0.02 + t) * 0.3 + Math.cos(z * 0.03 + t * 0.8) * 0.3); } pm.needsUpdate = true;
        const pg = gotas.geometry.attributes.position, vg = gotas.userData.vida; for (let i = 0; i < vg.length; i++) { vg[i] += dt * 0.06; if (vg[i] > 1) vg[i] -= 1; const q = aqueduto.getPointAt(vg[i]); pg.setXYZ(i, q.x, q.y + 0.5, q.z); } pg.needsUpdate = true;
        cabras.forEach((c, i) => { const d = c.userData; d.a += dt * 0.08 * (i % 2 ? 1 : -1); c.position.set(-112 + Math.cos(d.a) * d.r * 0.6, 0, -350 + Math.sin(d.a) * d.r); c.rotation.y = -d.a; });
      },
    };
  },
});
