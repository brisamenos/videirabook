/* Casa israelita de quatro cômodos (Idade do Ferro, c. 1200-586 a.C.), como as escavadas em Israel. 1 unidade = 1 m. Entrada voltada para o sul (z positivo). */
V3D.registrar('casa', {
  nome: 'Casa israelita', sub: 'A casa de quatro cômodos dos tempos dos reis · vida diária',
  ceu: 0x9cbcd8, neblina: [80, 320], sombra: 30, dist: [1.5, 140],
  extra: ['Cortar a casa', 'Fechar a casa'],
  estacoes: [
    { id: 'geral', nome: 'A casa', ref: 'Deuteronômio 6.6-9', titulo: 'A casa de quatro cômodos', medida: 'Cerca de 10 × 12 m, com dois andares',
      desc: 'Arqueólogos encontraram em quase todas as cidades israelitas o mesmo tipo de casa: um pátio no meio, cômodos compridos dos lados e um cômodo largo no fundo. Nelas vivia uma família com várias gerações. Era nessas casas que os pais ensinavam a lei aos filhos.',
      cam: [16, 11, 20], alvo: [0, 2, 0] },
    { id: 'patio', nome: 'O pátio', ref: 'Mateus 24.41; Provérbios 31.15', titulo: 'O pátio, coração da casa', medida: 'Forno, mós, tear e boca da cisterna',
      desc: 'No pátio se cozinhava no forno de barro, se moía o trigo nas pedras de moinho todas as manhãs e se tecia no tear. A água da chuva era guardada numa cisterna escavada na rocha, debaixo do chão.',
      cam: [2.4, 4.5, 7], alvo: [0, 0.8, 0.5], extra: true },
    { id: 'estabulo', nome: 'Animais e manjedoura', ref: 'Lucas 2.7; 1Samuel 28.24', titulo: 'Os animais dentro de casa', medida: 'Pilares de pedra e cochos entre eles',
      desc: 'Um dos cômodos laterais, separado do pátio por pilares, abrigava os animais à noite. Entre os pilares havia cochos de pedra, as manjedouras. Ajuda a imaginar onde Maria pôs o recém-nascido Jesus, "porque não havia lugar para eles na hospedaria".',
      cam: [-0.6, 3.2, 4.6], alvo: [-3.4, 0.8, 0.5], extra: true },
    { id: 'deposito', nome: 'O depósito', ref: 'Lucas 12.16-18', titulo: 'O cômodo do fundo', medida: 'Jarros para cereais, azeite e vinho',
      desc: 'O cômodo largo do fundo guardava a colheita do ano em grandes jarros de barro. A segurança da família dependia do que estava ali, como na parábola do rico que queria construir celeiros maiores.',
      cam: [2, 3.6, -0.5], alvo: [0, 0.8, -4.3], extra: true },
    { id: 'andar', nome: 'O andar de cima', ref: 'Lucas 11.5-7; 2Reis 4.10', titulo: 'O andar de cima', medida: 'Escada de madeira ou de pedra',
      desc: 'A família dormia no andar de cima, sobre esteiras, todos juntos. Por isso o homem da parábola diz ao amigo que bate de madrugada: "eu e meus filhos já estamos deitados". A sunamita fez um quartinho em cima para o profeta Eliseu.',
      cam: [6, 6.5, 3], alvo: [3.4, 3, -1.5], extra: true },
    { id: 'telhado', nome: 'O telhado', ref: 'Deuteronômio 22.8; Josué 2.6; Atos 10.9', titulo: 'O telhado plano e o parapeito', medida: 'Vigas, galhos e barro amassado com rolo de pedra',
      desc: 'O teto plano servia para secar linho e frutas, dormir no calor e orar. A lei mandava fazer um parapeito em volta para ninguém cair. Raabe escondeu os espias debaixo do linho no telhado, e Pedro orava no terraço quando teve a visão.',
      cam: [9, 10, 9], alvo: [0, 5.4, 0] },
  ],
  montar({ THREE, cena, tex, caixa, cil, sombra, pessoa }) {
    const pedraTex = tex(128, 128, (g, w, h) => { g.fillStyle = '#7d7262'; g.fillRect(0, 0, w, h); for (let i = 0; i < 70; i++) { g.fillStyle = `rgb(${160 + Math.random() * 50 | 0},${145 + Math.random() * 40 | 0},${115 + Math.random() * 35 | 0})`; g.beginPath(); g.ellipse(Math.random() * w, Math.random() * h, 8 + Math.random() * 10, 5 + Math.random() * 6, Math.random(), 0, 7); g.fill(); } }, [2, 1]);
    const pedra = new THREE.MeshStandardMaterial({ map: pedraTex, roughness: 1, transparent: true });
    const reboco = new THREE.MeshStandardMaterial({ color: 0xd9ccb0, roughness: 1, transparent: true });
    const barro = new THREE.MeshStandardMaterial({ color: 0xa8875e, roughness: 1, transparent: true });
    const madeira = new THREE.MeshStandardMaterial({ color: 0x6d4a2c, roughness: 0.9 });
    const terra = tex(128, 128, (g, w, h) => { g.fillStyle = '#a99268'; g.fillRect(0, 0, w, h); for (let i = 0; i < 3000; i++) { g.fillStyle = Math.random() > .5 ? 'rgba(120,100,70,.35)' : 'rgba(200,185,150,.3)'; g.fillRect(Math.random() * w, Math.random() * h, 2, 2); } }, [60, 60]);
    const chao = new THREE.Mesh(new THREE.PlaneGeometry(300, 300), new THREE.MeshStandardMaterial({ map: terra, roughness: 1 })); chao.rotation.x = -Math.PI / 2; chao.receiveShadow = true; cena.add(chao);
    const piso = new THREE.Mesh(new THREE.PlaneGeometry(10, 12), new THREE.MeshStandardMaterial({ color: 0x9b8462, roughness: 1 })); piso.rotation.x = -Math.PI / 2; piso.position.y = 0.02; cena.add(piso);

    const H = 2.6, E = 0.5;
    const paredes = new THREE.Group(), frente = new THREE.Group(), cima = new THREE.Group(), teto = new THREE.Group();
    // paredes externas do térreo e do andar de cima
    paredes.add(caixa(10, H * 2, E, pedra, 0, H, -6), caixa(E, H * 2, 12, pedra, -5, H, 0));
    frente.add(caixa(E, H * 2, 12, pedra, 5, H, 0));                                          // parede leste (some no corte)
    frente.add(caixa(3.8, H * 2, E, pedra, -3.1, H, 6), caixa(3.8, H * 2, E, pedra, 3.1, H, 6), caixa(2.4, H * 2 - 2.1, E, pedra, 0, H * 2 - (H * 2 - 2.1) / 2, 6));
    // parede do cômodo do fundo e fileiras de pilares dos lados do pátio
    paredes.add(caixa(10, H, 0.4, reboco, 0, H / 2, -3), caixa(1.4, H, 0.42, new THREE.MeshStandardMaterial({ color: 0x2a221a }), 0, 1, -3));
    [-2, 2].forEach(x => { for (let z = -2.4; z <= 5.6; z += 1.6) paredes.add(caixa(0.4, H, 0.4, pedra, x, H / 2, z)); });
    // cochos (manjedouras) entre os pilares do lado oeste
    for (let z = -1.6; z <= 4.8; z += 1.6) { const c = caixa(0.45, 0.55, 1.1, pedra, -2, 0.28, z); paredes.add(c); paredes.add(caixa(0.3, 0.08, 0.9, new THREE.MeshStandardMaterial({ color: 0xc9b07a }), -2, 0.57, z)); }
    // piso do andar de cima sobre os cômodos laterais e do fundo; o pátio fica aberto
    cima.add(caixa(3.2, 0.25, 9, barro, -3.6, H, 1.5), caixa(3.2, 0.25, 9, barro, 3.6, H, 1.5), caixa(10, 0.25, 3.2, barro, 0, H, -4.5));
    for (let x = -4.8; x <= 4.8; x += 0.6) cima.add(caixa(0.12, 0.12, 3.2, madeira, x, H - 0.18, -4.5));
    // esteiras e um baú no andar de cima
    [[-3.6, 0], [-3.6, 2], [3.6, 0.5], [-1, -4.5], [1.4, -4.5]].forEach(([x, z]) => cima.add(caixa(0.9, 0.06, 1.9, new THREE.MeshStandardMaterial({ color: 0xc8a96a, roughness: 1 }), x, H + 0.16, z)));
    cima.add(caixa(1, 0.6, 0.6, madeira, 4.2, H + 0.42, -1.5));
    // telhado plano com parapeito e linho secando
    teto.add(caixa(10.4, 0.35, 12.4, barro, 0, H * 2 + 0.17, 0));
    teto.add(caixa(10.4, 0.8, 0.25, pedra, 0, H * 2 + 0.75, -6.1), caixa(10.4, 0.8, 0.25, pedra, 0, H * 2 + 0.75, 6.1), caixa(0.25, 0.8, 12.4, pedra, -5.1, H * 2 + 0.75, 0), caixa(0.25, 0.8, 12.4, pedra, 5.1, H * 2 + 0.75, 0));
    const linho = new THREE.MeshStandardMaterial({ color: 0xc9b98a, roughness: 1 });
    for (let i = 0; i < 9; i++) teto.add(cil(0.12, 0.12, 2.6, linho, -3 + i * 0.35, H * 2 + 0.45, -2, 6).rotateX(Math.PI / 2));
    teto.add(cil(0.25, 0.25, 0.8, pedra, 3, H * 2 + 0.6, 3, 12).rotateZ(Math.PI / 2));   // rolo de pedra para alisar o barro
    cena.add(sombra(paredes), sombra(frente), sombra(cima), sombra(teto));

    // pátio: forno, mós, tear, cisterna, escada
    const patio = new THREE.Group();
    const forno = new THREE.Mesh(new THREE.SphereGeometry(0.55, 14, 10, 0, Math.PI * 2, 0, Math.PI / 2), barro); forno.position.set(1, 0, 3.6); patio.add(forno);
    const brasa = new THREE.PointLight(0xff8a3a, 0.8, 4, 2); brasa.position.set(1, 0.4, 3.6); patio.add(brasa);
    patio.add(caixa(0.9, 0.18, 0.5, pedra, -0.8, 0.25, 2.2));               // mó de baixo
    const mo = caixa(0.35, 0.12, 0.3, pedra, -0.8, 0.4, 2.2); patio.add(mo);
    patio.add(cil(0.35, 0.4, 0.15, pedra, 0.6, 0.08, -0.6, 16), cil(0.22, 0.22, 0.02, new THREE.MeshStandardMaterial({ color: 0x1a1612 }), 0.6, 0.16, -0.6, 16));
    // tear vertical com pesos de barro
    patio.add(cil(0.05, 0.05, 2.2, madeira, -1.3, 1.1, -2.2, 6), cil(0.05, 0.05, 2.2, madeira, 0.1, 1.1, -2.2, 6), cil(0.04, 0.04, 1.5, madeira, -0.6, 2.1, -2.2, 6).rotateZ(Math.PI / 2));
    patio.add(caixa(1.3, 1.2, 0.02, new THREE.MeshStandardMaterial({ color: 0xd8c8a0, roughness: 1, side: THREE.DoubleSide }), -0.6, 1.4, -2.2));
    for (let i = 0; i < 8; i++) patio.add(new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.03, 6, 10), barro).translateX(-1.2 + i * 0.16).translateY(0.75).translateZ(-2.2));
    // escada para o andar de cima
    for (let i = 0; i < 8; i++) patio.add(caixa(0.8, 0.12, 0.3, pedra, 1.5, 0.3 + i * 0.3, 1.4 - i * 0.3));
    cena.add(sombra(patio));
    // jarros no depósito
    const jarroM = new THREE.MeshStandardMaterial({ color: 0xb4774a, roughness: 0.9 });
    for (let i = 0; i < 14; i++) { const j = new THREE.Mesh(new THREE.SphereGeometry(0.3, 12, 10), jarroM); j.scale.y = 1.6; j.position.set(-4.2 + (i % 7) * 1.35, 0.5, -5.2 + Math.floor(i / 7) * 0.8); cena.add(sombra(j)); }
    // animais no cômodo oeste: cabras e um jumento
    const animal = (cor, esc, x, z) => { const a = new THREE.Group(); const m = new THREE.MeshStandardMaterial({ color: cor, roughness: 1 }); const c = new THREE.Mesh(new THREE.SphereGeometry(0.35, 10, 8), m); c.scale.set(1.5, 0.9, 0.8); c.position.y = 0.6; a.add(c); const h = new THREE.Mesh(new THREE.SphereGeometry(0.17, 8, 6), m); h.position.set(0.55, 0.85, 0); a.add(h); [[-0.3, -0.15], [0.3, -0.15], [-0.3, 0.15], [0.3, 0.15]].forEach(([px, pz]) => a.add(cil(0.04, 0.04, 0.45, m, px, 0.22, pz, 5))); a.scale.setScalar(esc); a.position.set(x, 0, z); a.rotation.y = Math.PI / 2; return a; };
    const bichos = [animal(0x3a3330, 1, -3.6, 0), animal(0xe8e2d6, 0.9, -3.4, 2.2), animal(0x7a6a5a, 1.5, -3.8, 4.2)];
    bichos.forEach(b => cena.add(sombra(b)));
    // a família: mulher no moinho, criança, homem chegando
    const mulher = pessoa(0x7a3a3a, { i: 1, turbante: 0x2a4f8e }); mulher.scale.setScalar(0.62); mulher.position.set(-0.8, 0, 2.75); mulher.rotation.y = Math.PI; cena.add(sombra(mulher));
    const crianca = pessoa(0xc9b896, { i: 2 }); crianca.scale.setScalar(0.45); crianca.position.set(0.4, 0, 1.6); cena.add(sombra(crianca));
    const homem = pessoa(0x6f7f5a, { i: 0 }); homem.position.set(0.3, 0, 7.2); cena.add(sombra(homem));
    // lamparina de barro no nicho
    const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 6), new THREE.MeshBasicMaterial({ color: 0xffc35a })); lamp.position.set(-1.9, 1.6, -2.95); cena.add(lamp);
    const luzLamp = new THREE.PointLight(0xffb050, 0.7, 4, 2); luzLamp.position.copy(lamp.position); cena.add(luzLamp);
    // aldeia em volta
    const vizinhas = new THREE.Group(); const casaM = [0xa99a80, 0xb5a588, 0x9d8f75].map(c => new THREE.MeshStandardMaterial({ color: c, roughness: 1 }));
    [[-14, 2], [14, -2], [-13, -15], [2, -18], [16, -16], [-16, 16], [16, 15], [0, 20]].forEach(([x, z], i) => { vizinhas.add(caixa(9, 5, 10, casaM[i % 3], x, 2.5, z)); vizinhas.add(caixa(9.4, 0.8, 10.4, casaM[(i + 1) % 3], x, 5.4, z)); });
    cena.add(sombra(vizinhas));
    const oliva = new THREE.MeshStandardMaterial({ color: 0x66753f, roughness: 1 });
    for (let i = 0; i < 20; i++) { const g = new THREE.Group(); g.add(cil(0.15, 0.25, 1.6, madeira, 0, 0.8, 0, 6)); const c = new THREE.Mesh(new THREE.SphereGeometry(1.2, 8, 6), oliva); c.position.y = 2.1; c.scale.y = 0.75; g.add(c); const a = Math.random() * 7, r = 26 + Math.random() * 20; g.position.set(Math.cos(a) * r, 0, Math.sin(a) * r); cena.add(g); }

    let cortado = false;
    const somem = [frente, teto];
    somem.forEach(g => g.traverse(o => { if (o.material) { o.material = o.material.clone(); o.material.transparent = true; } }));   // materiais próprios, para só estas partes sumirem
    return {
      aoExtra: on => { cortado = on; },
      animar(t, dt, reduz) {
        const k = Math.min(1, dt * 4);
        somem.forEach(g => g.traverse(o => { if (o.material && o.material.transparent) { o.material.opacity += ((cortado ? 0 : 1) - o.material.opacity) * k; o.visible = o.material.opacity > 0.03; o.material.depthWrite = o.material.opacity > 0.95; } }));
        if (reduz) return;
        mo.position.x = -0.8 + Math.sin(t * 2.4) * 0.25;
        mulher.rotation.x = Math.sin(t * 2.4) * 0.08;
        brasa.intensity = 0.7 + Math.sin(t * 9) * 0.15; luzLamp.intensity = 0.65 + Math.sin(t * 11) * 0.08;
        bichos.forEach((b, i) => { b.children[1].position.y = 0.85 + Math.sin(t * 1.3 + i * 2) * 0.05; });
        homem.position.z = 7.2 + Math.sin(t * 0.25) * 2.5;
      },
    };
  },
});
