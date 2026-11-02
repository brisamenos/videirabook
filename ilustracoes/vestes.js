/* Vestes do sumo sacerdote — Êxodo 28; 39. 1 unidade = 10 cm. Figura de frente para z positivo. */
V3D.registrar('vestes', {
  nome: 'Vestes do sumo sacerdote', sub: 'Êxodo 28 e 39 · nomes das pedras segundo a ARA',
  ceu: 0x1f1b18, neblina: [80, 220], sombra: 30, dist: [3, 90],
  extra: ['Separar as peças', 'Juntar as peças'],
  estacoes: [
    { id: 'geral', nome: 'Visão geral', ref: 'Êxodo 28.2-4', titulo: 'Vestes sagradas, para glória e beleza', medida: 'Peitoral, éfode, manto, túnica, mitra e cinto',
      desc: 'Deus mandou fazer para Arão roupas especiais, feitas por artesãos cheios de sabedoria. Cada peça tinha um sentido: o sumo sacerdote representava o povo diante de Deus. Em Hebreus, Jesus é apresentado como o grande sumo sacerdote (Hebreus 4.14).',
      cam: [0, 13, 34], alvo: [0, 9.5, 0] },
    { id: 'tunica', nome: 'Túnica de linho', ref: 'Êxodo 28.39-40', titulo: 'A túnica de linho fino', medida: 'Até os pés, com mangas compridas',
      desc: 'Por baixo de tudo ficava uma túnica branca de linho fino, tecida em xadrez, presa com um cinto bordado. Os sacerdotes comuns usavam túnicas semelhantes. No Dia da Expiação, o sumo sacerdote entrava no Santo dos Santos vestido só de linho (Levítico 16.4).',
      cam: [6, 7, 20], alvo: [0, 6, 0] },
    { id: 'manto', nome: 'Manto azul', ref: 'Êxodo 28.31-32', titulo: 'O manto do éfode', medida: 'Todo de tecido azul, sem mangas',
      desc: 'Uma veste inteira de azul, com uma abertura no meio para a cabeça, reforçada para não rasgar. Era vestida por cima da túnica e por baixo do éfode.',
      cam: [-10, 9, 18], alvo: [0, 8, 0] },
    { id: 'campainhas', nome: 'Romãs e campainhas', ref: 'Êxodo 28.33-35', titulo: 'Romãs e campainhas de ouro', medida: 'Alternadas em toda a barra do manto',
      desc: 'Na barra do manto havia romãs de fio azul, púrpura e carmesim, alternadas com campainhas de ouro. O som das campainhas era ouvido quando o sacerdote entrava e saía do Lugar Santo.',
      cam: [4, 3.5, 9], alvo: [0, 3.2, 0] },
    { id: 'efode', nome: 'O éfode', ref: 'Êxodo 28.6-8', titulo: 'O éfode', medida: 'Ouro, azul, púrpura, carmesim e linho fino',
      desc: 'Uma veste curta, como um avental de duas partes, feita com fios de ouro entrelaçados aos tecidos coloridos. Era presa por ombreiras e por um cinto do mesmo material.',
      cam: [5, 12, 12], alvo: [0, 11, 0] },
    { id: 'onix', nome: 'Pedras de ônix', ref: 'Êxodo 28.9-12', titulo: 'As pedras de ônix nos ombros', medida: 'Seis nomes em cada pedra',
      desc: 'Em cada ombreira havia uma pedra de ônix engastada em ouro, com os nomes das doze tribos de Israel, seis em cada uma, na ordem de nascimento. Assim, Arão levava o povo sobre os ombros diante do Senhor.',
      cam: [3, 17, 7], alvo: [0, 13.8, 0] },
    { id: 'peitoral', nome: 'O peitoral', ref: 'Êxodo 28.15-21', titulo: 'O peitoral do juízo', medida: 'Um palmo de lado, cerca de 22 cm, com 12 pedras',
      desc: 'Um quadrado dobrado, do mesmo tecido do éfode, com doze pedras preciosas em quatro fileiras de três, cada uma com o nome de uma tribo. 1ª fileira: sárdio, topázio e carbúnculo. 2ª: esmeralda, safira e diamante. 3ª: jacinto, ágata e ametista. 4ª: berilo, ônix e jaspe.',
      cam: [0.5, 11.6, 9.5], alvo: [0, 11.3, 0] },
    { id: 'urim', nome: 'Urim e Tumim', ref: 'Êxodo 28.29-30', titulo: 'O Urim e o Tumim', medida: 'Guardados dentro do peitoral',
      desc: 'Dentro do peitoral ficavam o Urim e o Tumim, usados para consultar a vontade de Deus em decisões importantes (Números 27.21). A Bíblia não descreve sua forma.',
      cam: [-3, 12, 6.5], alvo: [0, 11.3, 0] },
    { id: 'mitra', nome: 'Mitra e lâmina', ref: 'Êxodo 28.36-38', titulo: 'A mitra e a lâmina de ouro', medida: '"Santidade ao Senhor"',
      desc: 'Na mitra de linho fino, presa por um cordão azul, ficava uma lâmina de ouro puro gravada com as palavras "Santidade ao Senhor". Ela lembrava que o sacerdote levava diante de Deus a culpa das ofertas do povo.',
      cam: [2, 17, 7], alvo: [0, 16, 0] },
  ],
  montar({ THREE, cena, M, tex, caixa, cil, sombra }) {
    const linhoTex = tex(128, 128, (g, w, h) => { g.fillStyle = '#f4f0e6'; g.fillRect(0, 0, w, h); g.strokeStyle = 'rgba(170,160,140,.35)'; for (let i = 0; i < w; i += 8) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i, h); g.stroke(); g.beginPath(); g.moveTo(0, i); g.lineTo(w, i); g.stroke(); } }, [6, 8]);
    const azulTex = tex(128, 128, (g, w, h) => { g.fillStyle = '#21407e'; g.fillRect(0, 0, w, h); g.fillStyle = 'rgba(255,255,255,.05)'; for (let y = 0; y < h; y += 3) g.fillRect(0, y, w, 1); }, [4, 4]);
    const efodeTex = tex(256, 64, (g, w, h) => {
      const cores = ['#d9b04c', '#2c4f9e', '#d9b04c', '#6b2c7a', '#d9b04c', '#b3242e', '#efe9da'];
      for (let i = 0; i < 28; i++) { g.fillStyle = cores[i % cores.length]; g.fillRect(0, i * h / 28, w, h / 28 + 1); }
      g.fillStyle = 'rgba(255,230,150,.25)'; for (let x = 0; x < w; x += 4) g.fillRect(x, 0, 1, h);
    }, [3, 1]);
    const linho = new THREE.MeshStandardMaterial({ map: linhoTex, roughness: 0.9, transparent: true });
    const azul = new THREE.MeshStandardMaterial({ map: azulTex, roughness: 0.8, transparent: true, side: THREE.DoubleSide });
    const efode = new THREE.MeshStandardMaterial({ map: efodeTex, roughness: 0.55, metalness: 0.35, transparent: true, side: THREE.DoubleSide });
    const pele = new THREE.MeshStandardMaterial({ color: 0xb98563, roughness: 0.75 });
    const barba = new THREE.MeshStandardMaterial({ color: 0x4a4038, roughness: 1 });

    // sala escura com o véu ao fundo
    const piso = new THREE.Mesh(new THREE.CircleGeometry(40, 48), new THREE.MeshStandardMaterial({ color: 0x5a4c3c, roughness: 0.9 })); piso.rotation.x = -Math.PI / 2; piso.receiveShadow = true; cena.add(piso);
    const pedestal = cil(5, 5.4, 0.8, new THREE.MeshStandardMaterial({ color: 0x7a6650, roughness: 0.8 }), 0, 0.4, 0, 40); pedestal.receiveShadow = true; cena.add(pedestal);
    const veuTex = tex(256, 256, (g, w, h) => { const gr = g.createLinearGradient(0, 0, w, 0); gr.addColorStop(0, '#24427f'); gr.addColorStop(.5, '#5b2a6e'); gr.addColorStop(1, '#9e2430'); g.fillStyle = gr; g.fillRect(0, 0, w, h); g.fillStyle = 'rgba(0,0,0,.25)'; for (let x = 0; x < w; x += 16) g.fillRect(x, 0, 6, h); });
    const veu = new THREE.Mesh(new THREE.CylinderGeometry(30, 30, 40, 48, 1, true, Math.PI * 0.75, Math.PI * 0.5), new THREE.MeshStandardMaterial({ map: veuTex, roughness: 1, side: THREE.BackSide }));
    veu.position.y = 20; cena.add(veu);
    const luz1 = new THREE.SpotLight(0xffe2b0, 1.6, 90, 0.45, 0.6); luz1.position.set(14, 34, 22); luz1.target.position.set(0, 8, 0); luz1.castShadow = true; cena.add(luz1, luz1.target);
    const luz2 = new THREE.PointLight(0xffb070, 0.6, 50); luz2.position.set(-14, 12, 10); cena.add(luz2);

    const figura = new THREE.Group(); figura.position.y = 0.8; cena.add(figura);
    const lathe = (pts, mat, seg) => new THREE.Mesh(new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(r, y)), seg || 40), mat);
    const pecas = {};
    // túnica de linho
    const tunica = new THREE.Group();
    tunica.add(lathe([[0.01, 0], [2.5, 0.05], [2.35, 3], [2.1, 6], [1.85, 9], [2.0, 11], [2.15, 12.8], [1.7, 13.7], [0.65, 14.1], [0.01, 14.15]], linho));
    [-1, 1].forEach(s => { const braco = cil(0.5, 0.65, 5.6, linho, s * 2.45, 10.6, 0.4, 14); braco.rotation.z = s * 0.18; braco.rotation.x = -0.25; tunica.add(braco); const mao = new THREE.Mesh(new THREE.SphereGeometry(0.42, 12, 10), pele); mao.position.set(s * 2.95, 7.7, 1.1); tunica.add(mao); });
    figura.add(tunica); pecas.tunica = tunica;
    // cabeça
    const cabeca = new THREE.Group();
    cabeca.add(cil(0.45, 0.5, 0.9, pele, 0, 14.4, 0, 14));
    const cab = new THREE.Mesh(new THREE.SphereGeometry(0.95, 20, 16), pele); cab.position.y = 15.5; cab.scale.set(0.92, 1.08, 0.98); cabeca.add(cab);
    const b = new THREE.Mesh(new THREE.SphereGeometry(0.8, 16, 12, 0, Math.PI * 2, Math.PI * 0.45, Math.PI * 0.5), barba); b.position.set(0, 15.0, 0.28); b.scale.set(1, 1.3, 0.9); cabeca.add(b);
    figura.add(cabeca);
    // manto azul, com romãs e campainhas na barra
    const manto = new THREE.Group();
    manto.add(lathe([[2.75, 3.1], [2.55, 6], [2.25, 9], [2.3, 11], [2.42, 12.9], [1.85, 13.85], [0.78, 14.15]], azul));
    const borda = new THREE.Mesh(new THREE.TorusGeometry(2.75, 0.08, 6, 60), new THREE.MeshStandardMaterial({ color: 0x1a2f5c, roughness: 0.8 })); borda.rotation.x = Math.PI / 2; borda.position.y = 3.1; manto.add(borda);
    const sinos = [];
    const romaCores = [0x2c4f9e, 0x6b2c7a, 0xb3242e];
    for (let i = 0; i < 44; i++) {
      const a = i / 44 * Math.PI * 2; const g = new THREE.Group(); g.position.set(Math.cos(a) * 2.78, 3.05, Math.sin(a) * 2.78);
      if (i % 2) { const s = new THREE.Mesh(new THREE.ConeGeometry(0.17, 0.32, 10, 1, true), M.ouro); s.material.side = THREE.DoubleSide; s.position.y = -0.22; g.add(s); const bola = new THREE.Mesh(new THREE.SphereGeometry(0.05, 6, 6), M.ouro); bola.position.y = -0.38; g.add(bola); }
      else { const r = new THREE.Mesh(new THREE.SphereGeometry(0.16, 10, 8), new THREE.MeshStandardMaterial({ color: romaCores[(i / 2) % 3], roughness: 0.7 })); r.position.y = -0.22; r.scale.y = 1.1; g.add(r); const c = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.1, 6), new THREE.MeshStandardMaterial({ color: romaCores[(i / 2) % 3] })); c.position.y = -0.04; g.add(c); }
      g.userData.f = i * 0.7; manto.add(g); sinos.push(g);
    }
    figura.add(manto); pecas.manto = manto;
    // éfode com cinto e ombreiras
    const ef = new THREE.Group();
    ef.add(lathe([[2.4, 8.9], [2.36, 10.5], [2.5, 12.9], [1.95, 13.9], [0.85, 14.18]], efode));
    const cinto = new THREE.Mesh(new THREE.TorusGeometry(2.42, 0.22, 8, 48), efode); cinto.rotation.x = Math.PI / 2; cinto.position.y = 9.1; cinto.scale.z = 1.6; ef.add(cinto);
    [-1, 1].forEach(s => {
      const fita = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.9, 0.08), efode); fita.position.set(s * 0.4, 8.5, 2.45); ef.add(fita);
    });
    figura.add(ef); pecas.efode = ef;
    // pedras de ônix nos ombros
    const onix = new THREE.Group();
    const onixM = new THREE.MeshStandardMaterial({ color: 0x1b2420, roughness: 0.15, metalness: 0.3 });
    [-1, 1].forEach(s => {
      const eng = cil(0.42, 0.42, 0.14, M.ouro, 0, 0, 0, 20); const p = new THREE.Mesh(new THREE.SphereGeometry(0.34, 16, 10), onixM); p.scale.y = 0.4; p.position.y = 0.08;
      const g = new THREE.Group(); g.add(eng, p); g.position.set(s * 1.3, 14.0, 0.15); g.rotation.z = s * -0.5; onix.add(g);
    });
    figura.add(onix); pecas.onix = onix;
    // peitoral com doze pedras e correntes de ouro
    const peitoral = new THREE.Group();
    peitoral.add(caixa(2.3, 2.3, 0.18, efode, 0, 0, 0));
    peitoral.add(caixa(2.45, 2.45, 0.08, M.ouro, 0, 0, -0.08));
    const pedras = [0xb3261e, 0xe0b43c, 0x2e8b57, 0x138a5e, 0x2a4fb5, 0xe8eef2, 0xd97a2b, 0x8c6d5a, 0x7a4fa8, 0x5fb3b3, 0x1d1d1d, 0x8a3324];
    pedras.forEach((c, i) => {
      const lin = Math.floor(i / 3), col = i % 3;
      const eng = caixa(0.56, 0.44, 0.06, M.ouro, (col - 1) * 0.68, 0.78 - lin * 0.52, 0.11);
      const p = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.33, 0.12), new THREE.MeshStandardMaterial({ color: c, roughness: 0.1, metalness: 0.2, emissive: c, emissiveIntensity: 0.12 }));
      p.position.set((col - 1) * 0.68, 0.78 - lin * 0.52, 0.17); peitoral.add(eng, p);
    });
    [-1, 1].forEach(s => { const cor = cil(0.04, 0.04, 2.6, M.ouro, s * 1.15, 1.9, -0.25, 6); cor.rotation.z = s * 0.25; cor.rotation.x = -0.35; peitoral.add(cor); });
    peitoral.position.set(0, 11.3, 2.55); peitoral.rotation.x = -0.08; figura.add(peitoral); pecas.peitoral = peitoral;
    // Urim e Tumim: brilho discreto atrás do peitoral (forma desconhecida)
    const urim = new THREE.PointLight(0xfff0c0, 0, 5); urim.position.set(0, 11.3, 3.2); figura.add(urim);
    // mitra de linho com a lâmina de ouro e o cordão azul
    const mitra = new THREE.Group();
    mitra.add(lathe([[0.98, 15.55], [1.12, 16.1], [1.15, 16.7], [1.0, 17.2], [0.6, 17.5], [0.01, 17.55]], linho));
    for (let i = 0; i < 4; i++) { const v = new THREE.Mesh(new THREE.TorusGeometry(1.1 - i * 0.03, 0.06, 6, 40), linho); v.rotation.x = Math.PI / 2; v.position.y = 15.9 + i * 0.38; mitra.add(v); }
    const lamina = new THREE.Mesh(new THREE.CylinderGeometry(1.17, 1.17, 0.42, 30, 1, true, -0.45, 0.9), M.ouro); lamina.material = M.ouro.clone(); lamina.material.side = THREE.DoubleSide; lamina.position.y = 16.25; mitra.add(lamina);
    const cordao = new THREE.Mesh(new THREE.TorusGeometry(1.19, 0.03, 6, 48), new THREE.MeshStandardMaterial({ color: 0x2c4f9e })); cordao.rotation.x = Math.PI / 2; cordao.position.y = 16.5; mitra.add(cordao);
    figura.add(mitra); pecas.mitra = mitra;
    sombra(figura);

    // posições quando as peças estão separadas
    const longe = { tunica: [-14, 0, -2], manto: [-7, 0, 0], efode: [7, 0, 0], peitoral: [14, 11.3, 2.55], onix: [7, 0, 0], mitra: [14, 0, -2] };
    const perto = { tunica: [0, 0, 0], manto: [0, 0, 0], efode: [0, 0, 0], peitoral: [0, 11.3, 2.55], onix: [0, 0, 0], mitra: [0, 0, 0] };
    let separado = false, girar = true, transp = false, brilhoUrim = 0;
    const camadasDeFora = [manto, ef, peitoral, onix];
    return {
      aoExtra: on => { separado = on; },
      aoEstacao: e => { girar = e.id === 'geral'; transp = e.id === 'tunica'; brilhoUrim = e.id === 'urim' ? 1.4 : 0; },
      animar(t, dt, reduz) {
        const k = Math.min(1, dt * 3);
        Object.keys(pecas).forEach(n => { const alvo = separado ? longe[n] : perto[n]; pecas[n].position.x += (alvo[0] - pecas[n].position.x) * k; pecas[n].position.y += (alvo[1] - pecas[n].position.y) * k; pecas[n].position.z += (alvo[2] - pecas[n].position.z) * k; });
        if (girar && !separado && !reduz) figura.rotation.y += dt * 0.3; else figura.rotation.y += (Math.round(figura.rotation.y / (Math.PI * 2)) * Math.PI * 2 - figura.rotation.y) * k;
        camadasDeFora.forEach(c => c.traverse(o => { if (o.material && o.material.transparent !== undefined) { o.material.transparent = true; o.material.opacity += ((transp ? 0.12 : 1) - o.material.opacity) * k; o.material.depthWrite = o.material.opacity > 0.9; } }));
        urim.intensity += (brilhoUrim * (0.8 + Math.sin(t * 2) * 0.2) - urim.intensity) * k;
        if (!reduz) sinos.forEach(s => { s.rotation.z = Math.sin(t * 2.2 + s.userData.f) * 0.18; s.rotation.x = Math.cos(t * 1.7 + s.userData.f) * 0.12; });
      },
    };
  },
});
