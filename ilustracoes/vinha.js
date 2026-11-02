/* Vinha com torre e lagar, e prensa de azeite — Isaías 5; Mateus 21.33. 1 unidade = 1 m. */
V3D.registrar('vinha', {
  nome: 'Vinha e prensas', sub: 'Torre, lagar escavado na rocha e prensa de azeite, como os achados em Israel',
  ceu: 0x93b6d3, neblina: [120, 420], sombra: 45, dist: [1.5, 200],
  estacoes: [
    { id: 'geral', nome: 'A vinha', ref: 'Isaías 5.1-2', titulo: 'A vinha do meu amado', medida: 'Encostas com terraços de pedra',
      desc: '"Ele a cercou, limpou-a das pedras, plantou nela as melhores videiras, construiu uma torre no meio dela e fez também um lagar." Arqueólogos acharam centenas de vinhas antigas em Israel com exatamente esses elementos.',
      cam: [34, 22, 34], alvo: [0, 1, 0] },
    { id: 'torre', nome: 'A torre', ref: 'Mateus 21.33; Marcos 12.1', titulo: 'A torre de vigia', medida: 'Torre redonda de pedra, de 3 a 5 m',
      desc: 'Na época da colheita, a família morava na torre para vigiar a vinha contra ladrões e animais. Jesus usou essa imagem na parábola dos lavradores maus, que mataram os servos e o filho do dono da vinha.',
      cam: [12, 6, 10], alvo: [6, 2.5, 4] },
    { id: 'lagar', nome: 'O lagar', ref: 'Isaías 63.2-3; Apocalipse 14.19-20', titulo: 'O lagar escavado na rocha', medida: 'Piso de pisar uvas e tanque mais baixo para o mosto',
      desc: 'As uvas eram pisadas com os pés num piso de pedra levemente inclinado. O suco escorria por um canal até um tanque mais fundo, onde descansava antes de ir para os jarros. A imagem do lagar é usada para falar do juízo de Deus.',
      cam: [-4, 4, 9], alvo: [-8, 0.4, 3] },
    { id: 'gideao', nome: 'Gideão no lagar', ref: 'Juízes 6.11', titulo: 'Escondido no lagar', medida: 'Um tanque fundo, longe da vista',
      desc: 'Gideão malhava o trigo no lagar, escondido dos midianitas, quando o anjo do Senhor lhe apareceu. Um lagar escavado na rocha era fundo o bastante para trabalhar sem ser visto de longe.',
      cam: [-6, 2.2, 1], alvo: [-8.6, 0, 3.6] },
    { id: 'prensa', nome: 'Prensa de azeite', ref: 'Marcos 14.32', titulo: 'A prensa de azeite', medida: 'Mó de pedra e prensa de viga com pesos',
      desc: 'As azeitonas eram esmagadas por uma mó de pedra que girava numa bacia. A massa ia em cestos sob uma longa viga, puxada para baixo por pesos de pedra. O nome Getsêmani quer dizer "prensa de azeite", o lugar onde Jesus orou antes de ser preso.',
      cam: [16, 5, -12], alvo: [10, 1, -6] },
    { id: 'azeite', nome: 'O azeite', ref: 'Êxodo 27.20; Tiago 5.14', titulo: 'Azeite puro para a luz', medida: 'O primeiro azeite, de azeitonas batidas',
      desc: 'O primeiro azeite, mais puro, era usado nas lâmpadas do santuário e na unção. O azeite também servia de alimento, remédio e combustível. O fio dourado mostra o azeite escorrendo para o tanque.',
      cam: [12.5, 2, -5], alvo: [11.5, 0.6, -7.8] },
  ],
  montar({ THREE, cena, tex, caixa, cil, sombra, particulas }) {
    const solo = tex(256, 256, (g, w, h) => { g.fillStyle = '#a58f68'; g.fillRect(0, 0, w, h); for (let i = 0; i < 6000; i++) { g.fillStyle = Math.random() > .5 ? 'rgba(110,95,65,.35)' : 'rgba(190,175,140,.3)'; g.fillRect(Math.random() * w, Math.random() * h, 2, 2); } }, [50, 50]);
    const chao = new THREE.Mesh(new THREE.PlaneGeometry(500, 500), new THREE.MeshStandardMaterial({ map: solo, roughness: 1 })); chao.rotation.x = -Math.PI / 2; chao.receiveShadow = true; cena.add(chao);
    const pedraM = new THREE.MeshStandardMaterial({ color: 0xbfae8a, roughness: 1 });
    const rochaM = new THREE.MeshStandardMaterial({ color: 0xcbbb97, roughness: 1 });
    const folhaM = new THREE.MeshStandardMaterial({ color: 0x5f7d34, roughness: 1 }), cepaM = new THREE.MeshStandardMaterial({ color: 0x5a4030, roughness: 1 });
    const uvaM = new THREE.MeshStandardMaterial({ color: 0x4a2348, roughness: 0.5 });
    // muro de pedras soltas em volta (a cerca)
    const muro = new THREE.Group();
    for (let a = 0; a < Math.PI * 2; a += 0.04) { if (a > 1.45 && a < 1.65) continue; const p = caixa(1.4 + Math.random() * 0.6, 0.8 + Math.random() * 0.4, 1, pedraM, Math.cos(a) * 26, 0.5, Math.sin(a) * 20); p.rotation.y = -a; muro.add(p); }
    cena.add(sombra(muro));
    // fileiras de videiras com cachos
    const vinhas = new THREE.Group();
    for (let z = -16; z <= 16; z += 2.6) for (let x = -22; x <= 22; x += 2.2) {
      if (Math.hypot(x / 26, z / 20) > 0.92) continue;
      if (x > 2 && x < 15 && z > -11 && z < 7) continue;     // espaço da torre e da prensa
      if (x > -12 && x < -4 && z > 0 && z < 7) continue;     // espaço do lagar
      const g = new THREE.Group(); g.add(cil(0.06, 0.09, 0.9, cepaM, 0, 0.45, 0, 5));
      const copa = new THREE.Mesh(new THREE.SphereGeometry(0.75, 8, 6), folhaM); copa.position.y = 1; copa.scale.set(1.1, 0.6, 0.8); g.add(copa);
      for (let k = 0; k < 3; k++) { const c = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.3, 6), uvaM); c.rotation.x = Math.PI; c.position.set(-0.4 + k * 0.4, 0.7, 0.45); g.add(c); }
      g.position.set(x + (Math.random() - .5) * 0.3, 0, z); vinhas.add(g);
    }
    cena.add(sombra(vinhas));
    // torre de vigia redonda
    const torre = new THREE.Group();
    torre.add(cil(2, 2.2, 4, pedraM, 0, 2, 0, 18), cil(2.15, 2.15, 0.25, new THREE.MeshStandardMaterial({ color: 0x8a6a44 }), 0, 4.1, 0, 18));
    torre.add(caixa(0.9, 1.6, 0.3, new THREE.MeshStandardMaterial({ color: 0x1a140f }), 0, 0.8, 2.12));
    torre.add(new THREE.Mesh(new THREE.ConeGeometry(1.3, 1.4, 4), new THREE.MeshStandardMaterial({ color: 0xa48a5a, roughness: 1 })).translateY(5));
    torre.position.set(6, 0, 4); cena.add(sombra(torre));
    const vigia = new THREE.Group(); vigia.add(cil(0.2, 0.32, 1.2, new THREE.MeshStandardMaterial({ color: 0x8b5e3c }), 0, 0.6, 0, 8)); const cab = new THREE.Mesh(new THREE.SphereGeometry(0.15, 8, 6), new THREE.MeshStandardMaterial({ color: 0xa8734f })); cab.position.y = 1.35; vigia.add(cab);
    vigia.position.set(6.8, 4.2, 4.6); cena.add(sombra(vigia));

    // lagar escavado na rocha: piso de pisar (alto) e tanque (baixo), ligados por canal
    const lagar = new THREE.Group();
    lagar.add(caixa(8, 0.6, 7, rochaM, 0, 0.3, 0));
    lagar.add(caixa(3.6, 0.1, 3.6, new THREE.MeshStandardMaterial({ color: 0x9d8a66 }), -1.6, 0.62, -0.8));   // piso de pisar
    lagar.add(caixa(0.3, 0.12, 1.4, new THREE.MeshStandardMaterial({ color: 0x8a7656 }), 0.6, 0.6, 1.4));   // canal
    const tanque = caixa(1.8, 0.1, 1.6, new THREE.MeshStandardMaterial({ color: 0x5a2140, roughness: 0.2 }), 1.6, 0.2, 2.2); lagar.add(tanque);
    [[-1, 0], [1, 0], [0, -1], [0, 1]].forEach(([a, b]) => lagar.add(caixa(a ? 0.2 : 1.9, 0.5, b ? 0.2 : 1.7, rochaM, 1.6 + a * 0.95, 0.4, 2.2 + b * 0.85)));
    // uvas no piso e pisadores
    for (let i = 0; i < 60; i++) { const u = new THREE.Mesh(new THREE.SphereGeometry(0.1, 6, 5), uvaM); u.position.set(-1.6 + (Math.random() - .5) * 3.2, 0.72, -0.8 + (Math.random() - .5) * 3.2); lagar.add(u); }
    const pisadores = [];
    [[-2.4, -1.4], [-0.9, -0.2]].forEach(([x, z], i) => { const g = new THREE.Group(); g.add(cil(0.2, 0.32, 1.3, new THREE.MeshStandardMaterial({ color: i ? 0xd8ccb0 : 0x6f7f5a }), 0, 0.65, 0, 8)); const c = new THREE.Mesh(new THREE.SphereGeometry(0.15, 8, 6), new THREE.MeshStandardMaterial({ color: 0xa8734f })); c.position.y = 1.45; g.add(c); g.position.set(x, 0.65, z); lagar.add(g); pisadores.push(g); });
    // cestos e jarros
    for (let i = 0; i < 4; i++) { const j = new THREE.Mesh(new THREE.SphereGeometry(0.3, 10, 8), new THREE.MeshStandardMaterial({ color: 0xb4774a, roughness: 0.9 })); j.scale.y = 1.4; j.position.set(3.4, 0.4, -2 + i * 0.7); lagar.add(j); }
    lagar.position.set(-8, 0, 3); cena.add(sombra(lagar));
    const mosto = particulas(40, 0x7a2a5a, 0.18, 0.9, true); cena.add(mosto);

    // prensa de azeite: bacia com mó giratória e prensa de viga com pesos
    const prensa = new THREE.Group();
    const bacia = cil(1.6, 1.7, 0.7, rochaM, 0, 0.35, 0, 28); prensa.add(bacia);
    prensa.add(cil(1.3, 1.3, 0.05, new THREE.MeshStandardMaterial({ color: 0x5a6a2a, roughness: 0.6 }), 0, 0.72, 0, 24));
    const eixo = new THREE.Group(); eixo.position.y = 0.7; prensa.add(eixo);
    eixo.add(cil(0.12, 0.12, 1.2, new THREE.MeshStandardMaterial({ color: 0x6d4a2c }), 0, 0.6, 0, 8));
    const mo = cil(0.55, 0.55, 0.35, pedraM, 0.7, 0.55, 0, 20); mo.rotation.z = Math.PI / 2; eixo.add(mo);
    const braco = caixa(2.6, 0.1, 0.1, new THREE.MeshStandardMaterial({ color: 0x6d4a2c }), 1.3, 0.6, 0); eixo.add(braco);
    prensa.position.set(8, 0, -8); cena.add(sombra(prensa));
    const viga = new THREE.Group();
    viga.add(caixa(1, 2.4, 1, pedraM, -3.3, 1.2, 0));                                                         // parede com o encaixe da viga
    const tronco = caixa(6.5, 0.3, 0.3, new THREE.MeshStandardMaterial({ color: 0x6d4a2c }), 0, 0, 0); const piv = new THREE.Group(); tronco.position.x = 3.1; piv.add(tronco); piv.position.set(-3, 1.6, 0); viga.add(piv);
    const cestos = new THREE.Group(); for (let i = 0; i < 4; i++) cestos.add(cil(0.45, 0.45, 0.18, new THREE.MeshStandardMaterial({ color: 0x9b7a4a, roughness: 1 }), 0, 0.5 + i * 0.2, 0, 16)); cestos.position.set(-1.2, 0, 0); viga.add(cestos);
    viga.add(cil(0.7, 0.75, 0.4, rochaM, -1.2, 0.2, 0, 20));                                                  // pedra de coleta
    viga.add(caixa(0.9, 0.5, 0.9, new THREE.MeshStandardMaterial({ color: 0x8a7b2c, roughness: 0.3 }), -1.2, 0.05, 1.4)); // tanque do azeite
    const pesos = []; [0, 1].forEach(i => { const p = cil(0.35, 0.35, 0.5, pedraM, 3 + i * 0.6, 0.6, 0, 14); viga.add(p); pesos.push(p); });
    viga.position.set(12.8, 0, -6.5); cena.add(sombra(viga));
    const azeite = particulas(30, 0xd9b22a, 0.12, 0.9, true); cena.add(azeite);
    // jumento que gira a mó
    const jumento = new THREE.Group(); const jm = new THREE.MeshStandardMaterial({ color: 0x6e645a, roughness: 1 });
    const cj = new THREE.Mesh(new THREE.SphereGeometry(0.45, 10, 8), jm); cj.scale.set(1.6, 0.9, 0.8); cj.position.y = 0.95; jumento.add(cj);
    const hj = new THREE.Mesh(new THREE.SphereGeometry(0.22, 8, 6), jm); hj.position.set(0.75, 1.25, 0); jumento.add(hj);
    [[-0.45, -0.2], [0.45, -0.2], [-0.45, 0.2], [0.45, 0.2]].forEach(([x, z]) => jumento.add(cil(0.06, 0.06, 0.7, jm, x, 0.35, z, 6)));
    cena.add(sombra(jumento));

    return {
      animar(t, dt, reduz) {
        if (reduz) return;
        const a = t * 0.5;
        eixo.rotation.y = -a; mo.rotation.x = a * 3;
        jumento.position.set(8 + Math.cos(a) * 2.7, 0, -8 + Math.sin(a) * 2.7); jumento.rotation.y = -a - Math.PI;
        pisadores.forEach((p, i) => { p.position.y = 0.65 + Math.abs(Math.sin(t * 3 + i * 1.6)) * 0.12; p.position.x += Math.sin(t * 0.7 + i) * 0.003; });
        const desce = 0.5 + 0.5 * Math.sin(t * 0.4); piv.rotation.z = -0.03 - desce * 0.06; pesos.forEach(p => { p.position.y = 0.6 - desce * 0.25; });
        const pm = mosto.geometry.attributes.position, vm = mosto.userData.vida;
        for (let i = 0; i < vm.length; i++) { vm[i] += dt * 0.6; if (vm[i] > 1) vm[i] -= 1; pm.setXYZ(i, -8 + 0.6 + (Math.random() - .5) * 0.1, 0.6 + 0.05 - vm[i] * 0.3, 3 + 0.7 + vm[i] * 1.5); }
        pm.needsUpdate = true;
        const pa = azeite.geometry.attributes.position, va = azeite.userData.vida;
        for (let i = 0; i < va.length; i++) { va[i] += dt * 0.5; if (va[i] > 1) va[i] -= 1; pa.setXYZ(i, 12.8 - 1.2 + (va[i] < 0.5 ? 0 : 0), 0.4 - va[i] * 0.3, -6.5 + 0.7 + va[i] * 0.7); }
        pa.needsUpdate = true;
      },
    };
  },
});
