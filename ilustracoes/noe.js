/* Arca de Noé — Gênesis 6–9. 1 unidade = 1 côvado (≈ 45 cm). Comprimento no eixo x. */
V3D.registrar('noe', {
  nome: 'Arca de Noé', sub: 'Gênesis 6–9 · 300 × 50 × 30 côvados',
  ceu: 0x8fb3cf, neblina: [500, 1600], sombra: 200, dist: [6, 900],
  extra: ['Cortar o casco', 'Fechar o casco'],
  estacoes: [
    { id: 'geral', nome: 'Visão geral', ref: 'Gênesis 6.14-16', titulo: 'A arca', medida: '300 × 50 × 30 côvados · cerca de 135 × 22,5 × 13,5 m',
      desc: 'Deus mandou Noé construir uma grande embarcação de madeira de cipreste, vedada com piche por dentro e por fora. Não era um barco para navegar até um destino, mas uma caixa enorme para flutuar e guardar a vida durante o dilúvio.',
      cam: [330, 150, 330], alvo: [0, 12, 0], estado: 'terra' },
    { id: 'tamanho', nome: 'O tamanho', ref: 'Gênesis 6.15', titulo: 'Do tamanho de um quarteirão', medida: 'Volume de cerca de 41 mil m³ · uma pessoa de 1,70 m ao lado',
      desc: 'A figura perto da rampa tem a altura de um adulto. A arca tinha o comprimento de mais de um campo de futebol e a altura de um prédio de quatro andares. A proporção de 6 por 1 entre comprimento e largura dá estabilidade em águas agitadas.',
      cam: [6, 5, 84], alvo: [24, 5, 62], estado: 'terra' },
    { id: 'porta', nome: 'A porta', ref: 'Gênesis 6.16; 7.16', titulo: 'Uma porta na lateral', medida: 'A Bíblia não informa as medidas da porta',
      desc: 'A arca tinha uma única porta, do lado. Quando todos entraram, "o Senhor fechou a porta" (7.16). Foi Deus quem encerrou e protegeu os que estavam dentro.',
      cam: [95, 28, 125], alvo: [40, 8, 25], estado: 'terra' },
    { id: 'janela', nome: 'A abertura', ref: 'Gênesis 6.16; 8.6', titulo: 'A abertura debaixo do teto', medida: 'Abertura de 1 côvado · cerca de 45 cm',
      desc: 'Uma faixa aberta de um côvado logo abaixo do teto deixava entrar luz e ar. Foi por uma janela que Noé soltou o corvo e a pomba para saber se as águas tinham baixado.',
      cam: [-70, 42, 95], alvo: [-60, 28, 25], estado: 'terra' },
    { id: 'andares', nome: 'Três andares', ref: 'Gênesis 6.14,16', titulo: 'Três andares com compartimentos', medida: 'Cerca de 10 côvados por andar · 4,5 m',
      desc: 'Por dentro, a arca tinha três pavimentos divididos em compartimentos, para os animais, a família de Noé e todo o alimento necessário (6.21). Toque em "Fechar o casco" para ver a arca por fora de novo.',
      cam: [10, 38, 135], alvo: [0, 14, 0], estado: 'terra', extra: true },
    { id: 'animais', nome: 'Os animais', ref: 'Gênesis 6.19-20; 7.2-3', titulo: 'Os animais entram de dois em dois', medida: 'Um casal de cada espécie · sete casais dos animais puros',
      desc: 'Os animais vieram até Noé, macho e fêmea. Dos animais puros e das aves, entraram sete casais, para preservar a descendência e para o sacrifício depois do dilúvio (8.20).',
      cam: [150, 22, 150], alvo: [70, 4, 60], estado: 'terra' },
    { id: 'diluvio', nome: 'O dilúvio', ref: 'Gênesis 7.11-24', titulo: 'Quarenta dias de chuva', medida: 'As águas cobriram a terra por 150 dias',
      desc: 'As fontes do grande abismo se romperam e as comportas do céu se abriram. Choveu quarenta dias e quarenta noites, e a arca flutuava sobre as águas enquanto tudo o mais era coberto.',
      cam: [260, 70, 260], alvo: [0, 14, 0], estado: 'diluvio' },
    { id: 'arcoiris', nome: 'O arco-íris', ref: 'Gênesis 8.4; 9.12-17', titulo: 'O sinal da aliança', medida: 'A arca repousou nos montes de Ararate',
      desc: 'Quando as águas baixaram, a arca parou sobre os montes de Ararate. Deus prometeu nunca mais destruir a terra com um dilúvio e pôs o arco nas nuvens como sinal da aliança com toda criatura viva.',
      cam: [-300, 60, 260], alvo: [0, 40, 0], estado: 'arco' },
  ],
  montar({ THREE, cena, sol, tex, caixa, cil, sombra }) {
    const madeiraTex = tex(256, 256, (g, w, h) => {
      g.fillStyle = '#5a3d22'; g.fillRect(0, 0, w, h);
      for (let y = 0; y < h; y += 16) { g.fillStyle = `rgba(${40 + Math.random() * 30 | 0},${25 + Math.random() * 15 | 0},10,.55)`; g.fillRect(0, y, w, 2); }
      for (let i = 0; i < 1400; i++) { g.fillStyle = 'rgba(30,18,8,.25)'; g.fillRect(Math.random() * w, Math.random() * h, 8 + Math.random() * 20, 1); }
    }, [12, 2]);
    const mad = new THREE.MeshStandardMaterial({ map: madeiraTex, roughness: 0.85, side: THREE.DoubleSide });
    const piche = new THREE.MeshStandardMaterial({ color: 0x1e1610, roughness: 0.6 });
    const madInt = new THREE.MeshStandardMaterial({ color: 0x8a6440, roughness: 0.9, side: THREE.DoubleSide });
    const grama = tex(256, 256, (g, w, h) => { g.fillStyle = '#6f7d45'; g.fillRect(0, 0, w, h); for (let i = 0; i < 6000; i++) { const v = Math.random(); g.fillStyle = v > .5 ? 'rgba(90,110,50,.5)' : 'rgba(130,120,70,.4)'; g.fillRect(Math.random() * w, Math.random() * h, 2, 2); } }, [80, 80]);

    const chao = new THREE.Mesh(new THREE.PlaneGeometry(3000, 3000), new THREE.MeshStandardMaterial({ map: grama, roughness: 1 }));
    chao.rotation.x = -Math.PI / 2; chao.receiveShadow = true; cena.add(chao);

    // montes ao longe (Ararate no fim)
    const montes = new THREE.Group();
    for (let i = 0; i < 14; i++) {
      const a = Math.PI * 0.9 + (i / 14) * Math.PI * 0.9, r = 900 + Math.random() * 200;
      const m = new THREE.Mesh(new THREE.ConeGeometry(120 + Math.random() * 120, 140 + Math.random() * 180, 7), new THREE.MeshStandardMaterial({ color: 0x6d6a66, roughness: 1, flatShading: true }));
      m.position.set(Math.cos(a) * r, 40, Math.sin(a) * r); montes.add(m);
      const neve = new THREE.Mesh(new THREE.ConeGeometry(40, 50, 7), new THREE.MeshStandardMaterial({ color: 0xf2f2f2, roughness: 1, flatShading: true }));
      neve.position.copy(m.position); neve.position.y += m.geometry.parameters.height / 2 - 20; montes.add(neve);
    }
    cena.add(montes);

    // ── a arca
    const arca = new THREE.Group();
    const L = 300, W = 50, H = 28;
    const fundo = caixa(L, 1, W, piche, 0, 0.5, 0);
    const ladoN = caixa(L, H, 1, mad, 0, H / 2, -W / 2);
    const ladoS = caixa(L, H, 1, mad, 0, H / 2, W / 2);
    const proaL = caixa(1, H, W, mad, L / 2, H / 2, 0);
    const popaL = caixa(1, H, W, mad, -L / 2, H / 2, 0);
    arca.add(fundo, ladoN, ladoS, proaL, popaL);
    // faixa de piche na linha d'água
    arca.add(caixa(L + 0.4, 6, W + 0.4, piche, 0, 3, 0));
    // vigas verticais por fora
    for (let x = -L / 2 + 10; x < L / 2; x += 10) { arca.add(caixa(0.8, H, 0.6, piche, x, H / 2, W / 2 + 0.6)); arca.add(caixa(0.8, H, 0.6, piche, x, H / 2, -W / 2 - 0.6)); }
    // pilares da abertura de 1 côvado e o teto em duas águas
    for (let x = -L / 2; x <= L / 2; x += 6) { arca.add(caixa(0.6, 1, 0.6, mad, x, H + 0.5, W / 2 - 0.3)); arca.add(caixa(0.6, 1, 0.6, mad, x, H + 0.5, -W / 2 + 0.3)); }
    const teto = new THREE.Group();
    const forma = new THREE.Shape(); forma.moveTo(-W / 2 - 2, 0); forma.lineTo(0, 6); forma.lineTo(W / 2 + 2, 0); forma.lineTo(-W / 2 - 2, 0);
    const tetoGeo = new THREE.ExtrudeGeometry(forma, { depth: L + 4, bevelEnabled: false });
    const tetoM = new THREE.Mesh(tetoGeo, mad); tetoM.rotation.y = Math.PI / 2; tetoM.position.set(-L / 2 - 2, H + 1, 0); teto.add(tetoM);
    arca.add(teto);
    // porta na lateral sul, com rampa
    const porta = caixa(14, 12, 0.6, piche, 40, 7, W / 2 + 0.9); arca.add(porta);
    const rampa = new THREE.Group();
    const rampaM = caixa(14, 0.8, 34, mad, 0, 0, 17); rampa.add(rampaM);
    rampa.position.set(40, 1.5, W / 2 + 1); rampa.rotation.x = Math.atan2(1.5, 34) * -1 + 0.0; arca.add(rampa);
    rampa.rotation.x = Math.atan(1 / 34);
    // interior: três andares e compartimentos
    const interior = new THREE.Group();
    [10, 20].forEach(y => interior.add(caixa(L - 2, 0.6, W - 2, madInt, 0, y, 0)));
    for (let y = 0; y < 3; y++) for (let x = -L / 2 + 15; x < L / 2; x += 15) {
      interior.add(caixa(0.4, 9, 18, madInt, x, y * 10 + 5, -12));
      interior.add(caixa(0.4, 9, 18, madInt, x, y * 10 + 5, 12));
    }
    // fardos de comida e alguns animais lá dentro
    const palha = new THREE.MeshStandardMaterial({ color: 0xc9a85a, roughness: 1 });
    for (let i = 0; i < 40; i++) interior.add(caixa(3, 2, 3, palha, -L / 2 + 8 + (i % 20) * 14.5, 21.6 + Math.floor(i / 20) * 2.1, -18));
    arca.add(interior);
    cena.add(sombra(arca));
    const ladoSAlto = ladoS;

    // pessoa de 1,70 m (3,8 côvados) ao lado da rampa
    const pessoa = new THREE.Group();
    const roupa = new THREE.MeshStandardMaterial({ color: 0x8b5e3c, roughness: 0.9 });
    const pele = new THREE.MeshStandardMaterial({ color: 0xb07a52, roughness: 0.8 });
    pessoa.add(cil(0.45, 0.8, 2.9, roupa, 0, 1.45, 0, 12));
    const cab = new THREE.Mesh(new THREE.SphereGeometry(0.45, 14, 10), pele); cab.position.y = 3.35; pessoa.add(cab);
    pessoa.position.set(26, 0, 62); cena.add(sombra(pessoa));

    // animais em fila até a rampa
    const animais = new THREE.Group();
    const corpoAnimal = (cor, escala) => {
      const a = new THREE.Group(); const m = new THREE.MeshStandardMaterial({ color: cor, roughness: 0.9 });
      const c = new THREE.Mesh(new THREE.SphereGeometry(1, 14, 10), m); c.scale.set(1.6, 0.9, 0.8); c.position.y = 1.9; a.add(c);
      const h = new THREE.Mesh(new THREE.SphereGeometry(0.55, 12, 8), m); h.position.set(1.7, 2.6, 0); a.add(h);
      [[-0.9, -0.4], [0.9, -0.4], [-0.9, 0.4], [0.9, 0.4]].forEach(([x, z]) => { const p = cil(0.15, 0.15, 1.4, m, x, 0.7, z, 6); p.userData.perna = 1; a.add(p); });
      a.scale.setScalar(escala); return a;
    };
    const tipos = [[0xc9a26b, 1.4], [0x6b4a32, 1.1], [0xeeeeee, 0.8], [0x8a8a8a, 2.2], [0xb56a34, 1.0], [0x3b3b3b, 0.9], [0xd8c27a, 1.6]];
    const fila = [];
    tipos.forEach(([cor, esc], i) => [0, 1].forEach(par => {
      const a = corpoAnimal(cor, esc); a.userData.s = i * 22 + par * 8; fila.push(a); animais.add(a);
    }));
    cena.add(sombra(animais));
    const caminho = s => { // da campina até o pé da rampa
      const t = s / 160; const x = 200 - t * 160, z = 60 + Math.sin(t * 3) * 6;
      return new THREE.Vector3(x, 0, z);
    };

    // água, chuva e arco-íris
    const aguaGeo = new THREE.PlaneGeometry(3000, 3000, 90, 90); aguaGeo.rotateX(-Math.PI / 2);
    const base = aguaGeo.attributes.position.array.slice();
    const agua = new THREE.Mesh(aguaGeo, new THREE.MeshStandardMaterial({ color: 0x2f5f78, roughness: 0.25, metalness: 0.15, transparent: true, opacity: 0.94, flatShading: true }));
    agua.position.y = -8; cena.add(agua);
    const N = 2400, chuvaGeo = new THREE.BufferGeometry(), cp = new Float32Array(N * 6);
    for (let i = 0; i < N; i++) { const x = (Math.random() - .5) * 700, y = Math.random() * 260, z = (Math.random() - .5) * 700; cp.set([x, y, z, x - 1, y - 7, z], i * 6); }
    chuvaGeo.setAttribute('position', new THREE.BufferAttribute(cp, 3));
    const chuva = new THREE.LineSegments(chuvaGeo, new THREE.LineBasicMaterial({ color: 0xaab8c6, transparent: true, opacity: 0.5 }));
    chuva.frustumCulled = false; chuva.visible = false; cena.add(chuva);
    const arco = new THREE.Group();
    ['#e04a3a', '#f08a2c', '#f2d23a', '#5cb85c', '#3a7bd5', '#4b3fa8', '#8a3fa8'].forEach((c, i) => {
      const m = new THREE.Mesh(new THREE.TorusGeometry(520 - i * 9, 4.5, 6, 80, Math.PI), new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: 0, depthWrite: false, fog: false }));
      arco.add(m);
    });
    cena.add(arco);

    const CEU = { terra: new THREE.Color(0x8fb3cf), diluvio: new THREE.Color(0x39424b), arco: new THREE.Color(0xa8c8de) };
    let estado = 'terra', cortado = false;
    const alvo = { aguaY: -8, arcaY: 0, arco: 0, sol: 1.05 };
    function aplicar(e) {
      estado = e;
      if (e === 'terra') Object.assign(alvo, { aguaY: -8, arcaY: 0, arco: 0, sol: 1.05 });
      if (e === 'diluvio') Object.assign(alvo, { aguaY: 26, arcaY: 19, arco: 0, sol: 0.25 });
      if (e === 'arco') Object.assign(alvo, { aguaY: 4, arcaY: 0, arco: 0.5, sol: 1.1 });
      chuva.visible = e === 'diluvio';
      animais.visible = pessoa.visible = e === 'terra'; rampa.visible = e === 'terra';
      if (e === 'arco') { // o arco fica atrás da arca, de frente para quem olha
        const est = this.estacoes.find(x => x.estado === 'arco'); const cam = new THREE.Vector3(...est.cam);
        const dir = new THREE.Vector3(0, 0, 0).sub(cam).setY(0).normalize();
        arco.position.copy(dir.multiplyScalar(700)); arco.position.y = -60; arco.lookAt(cam.x, -60, cam.z);
      }
    }
    const defModelo = this;
    return {
      aoExtra: on => { cortado = on; ladoSAlto.visible = !on; teto.visible = !on; porta.visible = !on; },
      aoEstacao: e => aplicar.call(defModelo, e.estado || 'terra'),
      animar(t, dt, reduz) {
        const k = Math.min(1, dt * 1.2);
        agua.position.y += (alvo.aguaY - agua.position.y) * k;
        arca.position.y += (alvo.arcaY - arca.position.y) * k;
        sol.intensity += (alvo.sol - sol.intensity) * k;
        cena.background.lerp(CEU[estado], k); cena.fog.color.copy(cena.background);
        arco.children.forEach(m => { m.material.opacity += (alvo.arco - m.material.opacity) * k * 0.6; });
        chao.visible = agua.position.y < -1;
        if (reduz) return;
        // ondas
        const p = aguaGeo.attributes.position, amp = estado === 'diluvio' ? 2.2 : 0.6;
        for (let i = 0; i < p.count; i++) { const x = base[i * 3], z = base[i * 3 + 2]; p.setY(i, Math.sin(x * 0.02 + t * 1.3) * amp + Math.cos(z * 0.025 + t * 1.1) * amp); }
        p.needsUpdate = true; aguaGeo.computeVertexNormals();
        if (estado === 'diluvio') { arca.rotation.z = Math.sin(t * 0.7) * 0.02; arca.rotation.x = Math.sin(t * 0.5) * 0.015; }
        else { arca.rotation.z *= 0.95; arca.rotation.x *= 0.95; }
        if (chuva.visible) {
          const c = chuvaGeo.attributes.position.array;
          for (let i = 0; i < N; i++) { let y = c[i * 6 + 1] - dt * 160; if (y < 0) y += 260; c[i * 6 + 1] = y; c[i * 6 + 4] = y - 7; }
          chuvaGeo.attributes.position.needsUpdate = true;
        }
        if (animais.visible) fila.forEach(a => {
          const s = (a.userData.s + t * 9) % 175; const pos = caminho(Math.min(s, 160));
          a.position.copy(pos); a.visible = s < 160;
          const prox = caminho(Math.min(s + 1, 160)); a.lookAt(prox.x, 0, prox.z); a.rotateY(-Math.PI / 2);
          a.children.forEach((c, j) => { if (c.userData.perna) c.rotation.z = Math.sin(t * 8 + j * 1.6) * 0.35; });
        });
      },
    };
  },
});
