/* O acampamento das tribos no deserto — Números 2–3; 9–10. Esquema: 1 unidade ≈ 4 m; uma tenda para cada mil homens contados. Leste = x positivo. */
V3D.registrar('acampamento', {
  nome: 'Acampamento das tribos', sub: 'Números 2 · uma tenda para cada mil homens contados · cores ilustrativas',
  ceu: 0xa9c0d6, neblina: [260, 900], sombra: 130, dist: [6, 520],
  extra: ['Ver à noite', 'Ver de dia'],
  estacoes: [
    { id: 'geral', nome: 'Visão geral', ref: 'Números 2.1-2', titulo: 'Cada um junto à sua bandeira', medida: '603.550 homens contados, além dos levitas',
      desc: 'Deus organizou o acampamento: cada tribo acampava junto à sua bandeira, ao redor da tenda do encontro, a certa distância. Cada tenda deste modelo representa mil homens contados no censo de Números.',
      cam: [200, 150, 190], alvo: [0, 0, 0] },
    { id: 'centro', nome: 'O tabernáculo', ref: 'Números 2.17; Êxodo 25.8', titulo: 'Deus no centro do povo', medida: 'Átrio de 100 × 50 côvados',
      desc: 'A tenda do encontro ficava no meio do acampamento. Toda a vida do povo girava em torno da presença de Deus. Abra o modelo do tabernáculo para ver por dentro.',
      cam: [32, 22, 26], alvo: [0, 2, 0] },
    { id: 'sacerdotes', nome: 'Moisés e Arão', ref: 'Números 3.38', titulo: 'Moisés, Arão e os sacerdotes', medida: 'Diante da entrada, a leste',
      desc: 'Do lado do nascer do sol, diante da entrada da tenda, acampavam Moisés, Arão e seus filhos, que cuidavam do santuário em favor dos israelitas.',
      cam: [40, 14, 12], alvo: [17, 1, 0] },
    { id: 'levitas', nome: 'Os levitas', ref: 'Números 3.21-37', titulo: 'Os levitas em volta da tenda', medida: 'Gérson a oeste, Coate ao sul e Merari ao norte',
      desc: 'Os clãs de Levi ficavam entre a tenda e as outras tribos. Cada clã carregava uma parte do santuário na viagem: Coate, os objetos sagrados; Gérson, as cortinas; Merari, as tábuas e colunas.',
      cam: [-30, 40, 46], alvo: [0, 1, 0] },
    { id: 'juda', nome: 'Leste: Judá', ref: 'Números 2.3-9', titulo: 'O acampamento de Judá', medida: 'Judá, Issacar e Zebulom · 186.400 homens',
      desc: 'Do lado leste, de onde nasce o sol, acampavam Judá, Issacar e Zebulom. Eram os primeiros a partir quando o povo levantava acampamento.',
      cam: [130, 40, 50], alvo: [62, 1, 0], pino: [62, 6, 0] },
    { id: 'ruben', nome: 'Sul: Rúben', ref: 'Números 2.10-16', titulo: 'O acampamento de Rúben', medida: 'Rúben, Simeão e Gade · 151.450 homens',
      desc: 'Ao sul ficavam Rúben, Simeão e Gade. Eles partiam em segundo lugar, logo depois do acampamento de Judá.',
      cam: [40, 40, 130], alvo: [0, 1, 60], pino: [0, 6, 60] },
    { id: 'efraim', nome: 'Oeste: Efraim', ref: 'Números 2.18-24', titulo: 'O acampamento de Efraim', medida: 'Efraim, Manassés e Benjamim · 108.100 homens',
      desc: 'No lado oeste ficavam Efraim, Manassés e Benjamim, os descendentes de Raquel. Partiam depois da tenda do encontro, que seguia no meio do povo.',
      cam: [-130, 40, -40], alvo: [-62, 1, 0], pino: [-62, 6, 0] },
    { id: 'da', nome: 'Norte: Dã', ref: 'Números 2.25-31', titulo: 'O acampamento de Dã', medida: 'Dã, Aser e Naftali · 157.600 homens',
      desc: 'Ao norte acampavam Dã, Aser e Naftali. Eram os últimos a partir, a retaguarda de todo o povo.',
      cam: [-40, 40, -130], alvo: [0, 1, -60], pino: [0, 6, -60] },
    { id: 'nuvem', nome: 'Nuvem e fogo', ref: 'Números 9.15-23', titulo: 'A nuvem de dia e o fogo à noite', medida: 'Quando a nuvem se levantava, o povo partia',
      desc: 'Sobre o tabernáculo ficava uma nuvem durante o dia e uma aparência de fogo durante a noite. "Conforme a ordem do Senhor acampavam e conforme a ordem do Senhor partiam." Toque em "Ver à noite" para ver a coluna de fogo.',
      cam: [110, 60, 120], alvo: [0, 30, 0] },
  ],
  montar({ THREE, cena, sol, tex, caixa, cil, sombra, particulas }) {
    const areia = tex(256, 256, (g, w, h) => { g.fillStyle = '#c9ad7c'; g.fillRect(0, 0, w, h); for (let i = 0; i < 6000; i++) { const v = 150 + Math.random() * 70 | 0; g.fillStyle = `rgba(${v},${v * 0.82 | 0},${v * 0.56 | 0},.3)`; g.fillRect(Math.random() * w, Math.random() * h, 2, 2); } }, [90, 90]);
    const chao = new THREE.Mesh(new THREE.PlaneGeometry(3000, 3000), new THREE.MeshStandardMaterial({ map: areia, roughness: 1 })); chao.rotation.x = -Math.PI / 2; chao.receiveShadow = true; cena.add(chao);
    // montes de granito ao fundo (Sinai)
    for (let i = 0; i < 16; i++) { const a = -0.9 + i * 0.12, r = 700 + Math.random() * 120; const m = new THREE.Mesh(new THREE.ConeGeometry(110 + Math.random() * 90, 150 + Math.random() * 160, 6), new THREE.MeshStandardMaterial({ color: 0x8a6650, roughness: 1, flatShading: true })); m.position.set(-Math.cos(a) * r, 50, Math.sin(a) * r); cena.add(m); }

    // tabernáculo no centro (simplificado)
    const tab = new THREE.Group(); const linho = new THREE.MeshStandardMaterial({ color: 0xf2ede1, roughness: 0.95 });
    tab.add(caixa(22.5, 1.2, 0.2, linho, 0, 0.6, -5.6), caixa(22.5, 1.2, 0.2, linho, 0, 0.6, 5.6), caixa(0.2, 1.2, 11.2, linho, -11.2, 0.6, 0), caixa(0.2, 1.2, 3.4, linho, 11.2, 0.6, -3.9), caixa(0.2, 1.2, 3.4, linho, 11.2, 0.6, 3.9));
    tab.add(caixa(0.2, 1.2, 4.4, new THREE.MeshStandardMaterial({ color: 0x5b2a6e }), 11.3, 0.6, 0));
    tab.add(caixa(6.8, 2.4, 2.6, new THREE.MeshStandardMaterial({ color: 0x4a3a2e, roughness: 1 }), -5.5, 1.2, 0));
    tab.add(caixa(1.2, 0.7, 1.2, new THREE.MeshStandardMaterial({ color: 0xa8683a, metalness: 0.7, roughness: 0.4 }), 5, 0.35, 0));
    cena.add(sombra(tab));

    // tendas em instâncias: um bloco por tribo, com bandeira
    const tendaGeo = new THREE.ConeGeometry(1, 1.3, 4); tendaGeo.translate(0, 0.65, 0);
    const tendaMat = new THREE.MeshStandardMaterial({ roughness: 1 });
    const blocos = [];
    const bloco = (nome, qtd, cx, cz, cor, cols) => blocos.push({ nome, qtd, cx, cz, cor, cols });
    // levitas e sacerdotes (1 tenda para cada mil, arredondado)
    bloco('Sacerdotes', 3, 17, 0, 0xffffff, 3); bloco('Coate', 9, 0, 15, 0xd9c79a, 5); bloco('Gérson', 8, -19, 0, 0xd9c79a, 3); bloco('Merari', 6, 0, -15, 0xd9c79a, 5);
    // as doze tribos (Números 2), em milhares
    const T = [
      ['Judá', 75, 62, 0, 0x2e7d4f], ['Issacar', 54, 62, -26, 0x2a4fb5], ['Zebulom', 57, 62, 26, 0xe8eef2],
      ['Rúben', 47, 0, 62, 0xb3261e], ['Simeão', 59, -26, 62, 0xe0b43c], ['Gade', 46, 26, 62, 0x6e6e6e],
      ['Efraim', 41, -62, 0, 0x1d1d1d], ['Manassés', 32, -62, 26, 0x1d1d1d], ['Benjamim', 35, -62, -26, 0x8a3fa8],
      ['Dã', 63, 0, -62, 0x5fb3b3], ['Aser', 42, 26, -62, 0x8c6d5a], ['Naftali', 53, -26, -62, 0xd97a2b],
    ];
    T.forEach(([n, q, x, z, c]) => bloco(n, q, x, z, c, 8));
    const total = blocos.reduce((s, b) => s + b.qtd, 0);
    const tendas = new THREE.InstancedMesh(tendaGeo, tendaMat, total); tendas.castShadow = true; tendas.receiveShadow = true;
    const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), sc = new THREE.Vector3(), pos = new THREE.Vector3(), cor = new THREE.Color();
    let k = 0;
    const bandeiras = [];
    blocos.forEach(b => {
      const linhas = Math.ceil(b.qtd / b.cols);
      for (let i = 0; i < b.qtd; i++) {
        const c = i % b.cols, l = Math.floor(i / b.cols);
        pos.set(b.cx + (c - (b.cols - 1) / 2) * 2.6 + (Math.random() - .5) * 0.5, 0, b.cz + (l - (linhas - 1) / 2) * 2.6 + (Math.random() - .5) * 0.5);
        q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 4 + (Math.random() - .5) * 0.3); sc.set(1, 0.9 + Math.random() * 0.25, 1);
        m4.compose(pos, q, sc); tendas.setMatrixAt(k, m4);
        cor.setHex(b.cor === 0xffffff ? 0xeee8da : (b.cor === 0xd9c79a ? 0x8a7a5e : 0x5e4c3c)).multiplyScalar(0.85 + Math.random() * 0.3); tendas.setColorAt(k, cor);
        k++;
      }
      // bandeira da tribo
      const mastro = cil(0.12, 0.12, 9, new THREE.MeshStandardMaterial({ color: 0x5b4632 }), b.cx, 4.5, b.cz - (linhas / 2 + 1) * 2.6, 6);
      const pano = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 2, 8, 4), new THREE.MeshStandardMaterial({ color: b.cor, roughness: 0.9, side: THREE.DoubleSide }));
      pano.position.set(b.cx + 1.6, 7.8, b.cz - (linhas / 2 + 1) * 2.6);
      cena.add(mastro, pano); bandeiras.push({ pano, base: pano.geometry.attributes.position.array.slice() });
    });
    tendas.instanceMatrix.needsUpdate = true; if (tendas.instanceColor) tendas.instanceColor.needsUpdate = true;
    cena.add(tendas);
    // fogueiras espalhadas (aparecem à noite)
    const fogueiras = []; for (let i = 0; i < 40; i++) { const b = blocos[4 + (i % 12)]; const f = new THREE.Mesh(new THREE.SphereGeometry(0.35, 6, 6), new THREE.MeshBasicMaterial({ color: 0xffa040 })); f.position.set(b.cx + (Math.random() - .5) * 18, 0.3, b.cz + (Math.random() - .5) * 18); f.visible = false; cena.add(f); fogueiras.push(f); }

    // nuvem (dia) e coluna de fogo (noite)
    const nuvTex = tex(128, 128, g => { const r = g.createRadialGradient(64, 64, 0, 64, 64, 64); r.addColorStop(0, 'rgba(255,255,255,.95)'); r.addColorStop(.6, 'rgba(240,240,245,.4)'); r.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = r; g.fillRect(0, 0, 128, 128); });
    const nuvem = new THREE.Group();
    for (let i = 0; i < 60; i++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: nuvTex, transparent: true, opacity: 0.6, depthWrite: false, color: 0xf4f1ea })); const h = 10 + Math.random() * 60, r = 2 + (h - 10) * 0.1 + Math.random() * 3, a = Math.random() * 7; s.position.set(Math.cos(a) * r - 5, h, Math.sin(a) * r); const t = 10 + Math.random() * 10; s.scale.set(t, t, 1); s.userData = { a, r, h, v: 0.05 + Math.random() * 0.1 }; nuvem.add(s); }
    cena.add(nuvem);
    const fogo = particulas(260, 0xff8a2a, 5, 0); cena.add(fogo);
    const luzFogo = new THREE.PointLight(0xff9a40, 0, 260, 1.6); luzFogo.position.set(-5, 30, 0); cena.add(luzFogo);

    const DIA = new THREE.Color(0xa9c0d6), NOITE = new THREE.Color(0x0e1626);
    let noite = false;
    return {
      aoExtra: on => { noite = on; fogueiras.forEach(f => { f.visible = on; }); },
      animar(t, dt, reduz) {
        const k2 = Math.min(1, dt * 1.5);
        cena.background.lerp(noite ? NOITE : DIA, k2); cena.fog.color.copy(cena.background);
        sol.intensity += ((noite ? 0.08 : 1.25) - sol.intensity) * k2;
        fogo.material.opacity += ((noite ? 0.85 : 0) - fogo.material.opacity) * k2;
        luzFogo.intensity += ((noite ? 2.2 : 0) - luzFogo.intensity) * k2;
        nuvem.children.forEach(s => { s.material.opacity += ((noite ? 0 : 0.6) - s.material.opacity) * k2; });
        if (reduz) return;
        nuvem.children.forEach(s => { const d = s.userData; d.a += d.v * dt; s.position.x = Math.cos(d.a) * d.r - 5; s.position.z = Math.sin(d.a) * d.r; });
        if (noite) { const p = fogo.geometry.attributes.position, v = fogo.userData.vida; for (let i = 0; i < v.length; i++) { v[i] += dt * 0.35; if (v[i] > 1) v[i] -= 1; const a = i * 2.39 + t, r = 2 + Math.sin(v[i] * 9 + i) * 2.5; p.setXYZ(i, -5 + Math.cos(a) * r, 8 + v[i] * 75, Math.sin(a) * r); } p.needsUpdate = true; luzFogo.intensity = 2 + Math.sin(t * 7) * 0.3; }
        bandeiras.forEach(({ pano, base }, j) => { const p = pano.geometry.attributes.position; for (let i = 0; i < p.count; i++) { const x = base[i * 3]; p.setZ(i, Math.sin(x * 2 + t * 4 + j) * 0.25 * (x + 1.6) / 3.2); } p.needsUpdate = true; });
      },
    };
  },
});
