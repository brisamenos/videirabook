/* Tabernáculo — Êxodo 25–40. 1 unidade = 1 côvado (≈ 45 cm). Leste = x positivo. */
V3D.registrar('tabernaculo', {
  nome: 'Tabernáculo', sub: 'Êxodo 25–40 · medidas em côvados (1 côvado ≈ 45 cm)',
  extra: ['Abrir o teto', 'Fechar o teto'],
  estacoes: [
    { id: 'geral', nome: 'Visão geral', ref: 'Êxodo 25.8-9', titulo: 'O tabernáculo no meio do acampamento', medida: 'Átrio de 100 × 50 côvados · cerca de 45 × 22,5 m',
      desc: '"Faça-me um santuário, para que eu possa habitar no meio deles." O tabernáculo era uma tenda desmontável que acompanhou Israel no deserto. A entrada ficava voltada para o leste, e o caminho até a presença de Deus seguia sempre na mesma ordem: altar, pia, Lugar Santo e Santo dos Santos.',
      cam: [95, 70, 95], alvo: [-5, 2, 0] },
    { id: 'porta', nome: 'Porta do átrio', ref: 'Êxodo 27.16', titulo: 'A única entrada', medida: '20 côvados de largura × 5 de altura · cerca de 9 × 2,25 m',
      desc: 'Uma cortina de azul, púrpura, carmesim e linho fino, presa em quatro colunas. Havia uma só porta para todo o povo, o que lembra as palavras de Jesus em João 10.9: "Eu sou a porta".',
      cam: [78, 9, 22], alvo: [50, 3, 0] },
    { id: 'altar', nome: 'Altar de bronze', ref: 'Êxodo 27.1-8', titulo: 'O altar dos holocaustos', medida: '5 × 5 × 3 côvados · cerca de 2,25 × 2,25 × 1,35 m',
      desc: 'Feito de madeira de acácia revestida de bronze, com um chifre em cada canto e varas para ser carregado. Era a primeira coisa diante de quem entrava: ninguém se aproximava de Deus sem passar pelo sacrifício. O fogo devia ficar sempre aceso (Levítico 6.13).',
      cam: [42, 10, 14], alvo: [30, 2, 0] },
    { id: 'pia', nome: 'Pia de bronze', ref: 'Êxodo 30.17-21; 38.8', titulo: 'A bacia para lavar', medida: 'A Bíblia não informa as medidas',
      desc: 'Os sacerdotes lavavam as mãos e os pés antes de entrar no tabernáculo ou de servir no altar. A pia foi feita com os espelhos de bronze das mulheres que serviam à entrada da tenda.',
      cam: [20, 7, 8], alvo: [12, 2.4, 0] },
    { id: 'tenda', nome: 'A tenda', ref: 'Êxodo 26', titulo: 'O tabernáculo e suas coberturas', medida: '30 × 10 × 10 côvados · cerca de 13,5 × 4,5 × 4,5 m',
      desc: 'Paredes de 48 tábuas de acácia revestidas de ouro, firmadas em bases de prata. Por cima, quatro camadas: cortinas de linho bordadas com querubins, pelos de cabra, peles de carneiro tingidas de vermelho e, por fora, couro resistente.',
      cam: [5, 16, 26], alvo: [-25, 5, 0] },
    { id: 'mesa', nome: 'Mesa dos pães', ref: 'Êxodo 25.23-30; Levítico 24.5-9', titulo: 'A mesa dos pães da presença', medida: '2 × 1 × 1,5 côvado · cerca de 90 × 45 × 67,5 cm',
      desc: 'Ficava no lado norte do Lugar Santo, com doze pães em duas fileiras, um para cada tribo. Os pães eram trocados a cada sábado e comidos pelos sacerdotes. Jesus disse: "Eu sou o pão da vida" (João 6.35).',
      cam: [-15, 4.5, 1.5], alvo: [-20, 1.6, -3.2], extra: true },
    { id: 'candelabro', nome: 'Candelabro', ref: 'Êxodo 25.31-40', titulo: 'O candelabro de ouro', medida: 'Um talento de ouro puro · cerca de 34 kg',
      desc: 'Batido numa só peça de ouro, com uma haste central e seis braços enfeitados como flores de amendoeira. Suas sete lâmpadas eram a única luz do Lugar Santo e deviam arder diante do Senhor da tarde até a manhã.',
      cam: [-15, 4.5, -1], alvo: [-20, 2.6, 3.4], extra: true },
    { id: 'incenso', nome: 'Altar do incenso', ref: 'Êxodo 30.1-10', titulo: 'O altar do incenso', medida: '1 × 1 × 2 côvados · cerca de 45 × 45 × 90 cm',
      desc: 'Revestido de ouro e colocado bem diante do véu. Toda manhã e toda tarde o sacerdote queimava ali um incenso de receita própria. A fumaça que subia passou a ser imagem das orações (Salmo 141.2; Apocalipse 8.3-4).',
      cam: [-23, 4.5, 2.5], alvo: [-28, 1.8, 0], extra: true },
    { id: 'veu', nome: 'O véu', ref: 'Êxodo 26.31-33', titulo: 'O véu do Santo dos Santos', medida: '10 × 10 côvados · cerca de 4,5 × 4,5 m',
      desc: 'Uma cortina pesada de azul, púrpura, carmesim e linho, bordada com querubins, presa em quatro colunas de acácia revestidas de ouro. Só o sumo sacerdote passava por ele, uma vez por ano. Na morte de Jesus, o véu do templo se rasgou de alto a baixo (Mateus 27.51; Hebreus 10.19-20).',
      cam: [-18, 5, 0.01], alvo: [-30, 5, 0], extra: true },
    { id: 'arca', nome: 'Arca da aliança', ref: 'Êxodo 25.10-22; Hebreus 9.4', titulo: 'A arca e o propiciatório', medida: '2,5 × 1,5 × 1,5 côvado · cerca de 1,1 m × 67,5 cm × 67,5 cm',
      desc: 'Uma caixa de acácia revestida de ouro, com tampa de ouro puro chamada propiciatório e dois querubins de asas estendidas. Dentro estavam as tábuas da lei, um vaso de maná e a vara de Arão que floresceu. Ali Deus se encontrava com Moisés.',
      cam: [-31, 4, 3.2], alvo: [-35, 1.4, 0], extra: true },
  ],
  montar({ THREE, cena, M, tex, caixa, cil, sombra, particulas }) {
    const areia = tex(256, 256, (g, w, h) => {
      g.fillStyle = '#c9ab78'; g.fillRect(0, 0, w, h);
      for (let i = 0; i < 5000; i++) { const v = 150 + Math.random() * 70 | 0; g.fillStyle = `rgba(${v},${v * 0.82 | 0},${v * 0.55 | 0},.35)`; g.fillRect(Math.random() * w, Math.random() * h, 2, 2); }
    }, [60, 60]);
    const portaTex = tex(512, 64, (g, w, h) => {
      const cores = ['#2c4f9e', '#6b2c7a', '#b3242e', '#efe9da'];
      for (let i = 0; i < 32; i++) { g.fillStyle = cores[i % 4]; g.fillRect(i * w / 32, 0, w / 32 + 1, h); }
      g.fillStyle = 'rgba(255,255,255,.08)'; for (let y = 0; y < h; y += 4) g.fillRect(0, y, w, 1);
    });
    const linhoTex = tex(256, 64, (g, w, h) => { g.fillStyle = '#f2ede1'; g.fillRect(0, 0, w, h); g.fillStyle = 'rgba(160,150,130,.18)'; for (let x = 0; x < w; x += 6) g.fillRect(x, 0, 1, h); }, [10, 1]);
    const veuTex = tex(512, 512, (g, w, h) => {
      const grad = g.createLinearGradient(0, 0, w, 0); grad.addColorStop(0, '#24427f'); grad.addColorStop(.5, '#5b2a6e'); grad.addColorStop(1, '#9e2430');
      g.fillStyle = grad; g.fillRect(0, 0, w, h);
      g.strokeStyle = 'rgba(232,206,130,.85)'; g.lineWidth = 3;
      [[w * .3, h * .45], [w * .7, h * .45]].forEach(([cx, cy], k) => {
        const lado = k ? -1 : 1;
        for (let i = 0; i < 6; i++) { g.beginPath(); g.moveTo(cx, cy); const a = -Math.PI / 2 - lado * (0.25 + i * 0.22); g.quadraticCurveTo(cx + Math.cos(a) * 60, cy + Math.sin(a) * 40, cx + Math.cos(a) * (120 - i * 6), cy + Math.sin(a) * (120 - i * 6)); g.stroke(); }
        g.beginPath(); g.arc(cx, cy + 18, 14, 0, Math.PI * 2); g.stroke();
        g.beginPath(); g.moveTo(cx, cy + 32); g.lineTo(cx - 18, cy + 110); g.lineTo(cx + 18, cy + 110); g.closePath(); g.stroke();
      });
    });
    Object.assign(M, {
      linho: new THREE.MeshStandardMaterial({ map: linhoTex, roughness: 0.95, side: THREE.DoubleSide }),
      porta: new THREE.MeshStandardMaterial({ map: portaTex, roughness: 0.9, side: THREE.DoubleSide }),
      veu: new THREE.MeshStandardMaterial({ map: veuTex, roughness: 0.85, side: THREE.DoubleSide }),
      couro: new THREE.MeshStandardMaterial({ color: 0x4a3a2e, roughness: 1 }),
      vermelho: new THREE.MeshStandardMaterial({ color: 0x8e2a22, roughness: 0.9 }),
      cabra: new THREE.MeshStandardMaterial({ color: 0x2b2522, roughness: 1 }),
      pao: new THREE.MeshStandardMaterial({ color: 0xc8904e, roughness: 0.9 }),
      agua: new THREE.MeshStandardMaterial({ color: 0x5d8fb0, metalness: 0.2, roughness: 0.1, transparent: true, opacity: 0.85 }),
    });

    const chao = new THREE.Mesh(new THREE.PlaneGeometry(800, 800), new THREE.MeshStandardMaterial({ map: areia, roughness: 1 }));
    chao.rotation.x = -Math.PI / 2; chao.receiveShadow = true; cena.add(chao);
    for (let i = 0; i < 26; i++) {
      const a = i / 26 * Math.PI * 2, r = 230 + Math.random() * 80;
      const d = new THREE.Mesh(new THREE.SphereGeometry(30 + Math.random() * 30, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshStandardMaterial({ color: 0xb08f5e, roughness: 1 }));
      d.scale.y = 0.25 + Math.random() * 0.2; d.position.set(Math.cos(a) * r, 0, Math.sin(a) * r); cena.add(d);
    }

    // átrio
    const atrio = new THREE.Group();
    const coluna = (x, z) => { const g = new THREE.Group(); g.add(cil(0.28, 0.28, 5, M.madeira, 0, 2.5, 0, 10)); g.add(cil(0.45, 0.5, 0.5, M.bronze, 0, 0.25, 0, 10)); g.add(cil(0.36, 0.3, 0.35, M.prata, 0, 5.1, 0, 10)); g.position.set(x, 0, z); return g; };
    for (let i = 0; i <= 20; i++) { const x = -50 + i * 5; atrio.add(coluna(x, -25)); atrio.add(coluna(x, 25)); }
    for (let i = 1; i < 10; i++) { const z = -25 + i * 5; atrio.add(coluna(-50, z)); atrio.add(coluna(50, z)); }
    const cortina = (w, x, z, rotY, mat) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, 4.6), mat); m.position.set(x, 2.6, z); m.rotation.y = rotY; return m; };
    atrio.add(cortina(100, 0, -25, 0, M.linho), cortina(100, 0, 25, 0, M.linho), cortina(50, -50, 0, Math.PI / 2, M.linho), cortina(15, 50, -17.5, Math.PI / 2, M.linho), cortina(15, 50, 17.5, Math.PI / 2, M.linho), cortina(20, 50.6, 0, Math.PI / 2, M.porta));
    cena.add(sombra(atrio));

    // altar de bronze
    const altar = new THREE.Group();
    altar.add(caixa(5, 3, 5, M.bronze, 0, 1.5, 0), caixa(5.2, 0.25, 5.2, M.bronze, 0, 1.7, 0));
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([a, b]) => { const c = new THREE.Mesh(new THREE.ConeGeometry(0.35, 0.8, 8), M.bronze); c.position.set(a * 2.3, 3.35, b * 2.3); altar.add(c); });
    altar.add(cil(0.12, 0.12, 8, M.bronze, 0, 1.6, 2.9).rotateZ(Math.PI / 2), cil(0.12, 0.12, 8, M.bronze, 0, 1.6, -2.9).rotateZ(Math.PI / 2));
    altar.position.set(30, 0, 0); cena.add(sombra(altar));
    const brasa = new THREE.PointLight(0xff8a3a, 1.6, 22, 2); brasa.position.set(30, 4.2, 0); cena.add(brasa);
    const fogo = particulas(90, 0xff7a2a, 1.1, 0.9); cena.add(fogo);
    const fumaca = particulas(60, 0x9a948a, 2.6, 0.25, true); cena.add(fumaca);

    // pia
    const pia = new THREE.Group();
    pia.add(cil(1.0, 1.3, 0.4, M.bronze, 0, 0.2, 0, 24), cil(0.35, 0.5, 1.6, M.bronze, 0, 1.2, 0, 16));
    const bacia = new THREE.Mesh(new THREE.SphereGeometry(1.6, 28, 14, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), M.bronze); bacia.position.y = 2.9; pia.add(bacia);
    pia.add(cil(1.5, 1.5, 0.05, M.agua, 0, 2.85, 0, 28));
    pia.position.set(12, 0, 0); cena.add(sombra(pia));

    // tenda
    const tab = new THREE.Group();
    const parede = (w, x, z, rotY) => { const m = caixa(w, 10, 0.6, M.ouro, x, 5, z); m.rotation.y = rotY; return m; };
    tab.add(parede(30, -25, -5.3, 0), parede(30, -25, 5.3, 0), parede(11.2, -40.3, 0, Math.PI / 2));
    for (let i = 0; i <= 20; i++) { tab.add(caixa(0.08, 10, 0.08, M.ouroEsc, -40 + i * 1.5, 5, -5.62), caixa(0.08, 10, 0.08, M.ouroEsc, -40 + i * 1.5, 5, 5.62)); }
    tab.add(caixa(30.6, 0.5, 0.9, M.prata, -25, 0.25, -5.3), caixa(30.6, 0.5, 0.9, M.prata, -25, 0.25, 5.3), caixa(0.9, 0.5, 11.4, M.prata, -40.3, 0.25, 0));
    for (let i = 0; i < 5; i++) { const z = -4.5 + i * 2.25; tab.add(cil(0.25, 0.25, 10, M.ouro, -10, 5, z, 12), cil(0.4, 0.45, 0.5, M.bronze, -10, 0.25, z, 12)); }
    const entrada = new THREE.Mesh(new THREE.PlaneGeometry(10, 9.2), M.porta); entrada.position.set(-9.7, 4.9, 0); entrada.rotation.y = Math.PI / 2; tab.add(entrada);
    for (let i = 0; i < 4; i++) { const z = -3.75 + i * 2.5; tab.add(cil(0.22, 0.22, 10, M.ouro, -30, 5, z, 12), cil(0.38, 0.4, 0.5, M.prata, -30, 0.25, z, 12)); }
    const veu = new THREE.Mesh(new THREE.PlaneGeometry(10, 9.6), M.veu); veu.position.set(-30.2, 5, 0); veu.rotation.y = Math.PI / 2; tab.add(veu);
    cena.add(sombra(tab));
    const teto = new THREE.Group();
    teto.add(caixa(31, 0.3, 11.4, M.vermelho, -25.3, 10.25, 0), caixa(32, 0.35, 12.6, M.couro, -25.4, 10.6, 0));
    const abaN = caixa(32, 7, 0.25, M.cabra, -25.4, 7.2, -6.2); const abaS = abaN.clone(); abaS.position.z = 6.2;
    teto.add(abaN, abaS, caixa(0.25, 7, 12.6, M.cabra, -41.3, 7.2, 0));
    cena.add(sombra(teto));

    // mesa
    const mesa = new THREE.Group();
    mesa.add(caixa(2, 0.12, 1, M.ouro, 0, 1.5, 0), caixa(2.05, 0.18, 1.05, M.ouroEsc, 0, 1.38, 0));
    [[-.9, -.4], [.9, -.4], [-.9, .4], [.9, .4]].forEach(([a, b]) => mesa.add(caixa(0.1, 1.45, 0.1, M.ouro, a, 0.72, b)));
    for (let s = 0; s < 2; s++) for (let i = 0; i < 6; i++) { const p = cil(0.32, 0.32, 0.09, M.pao, -0.5 + s, 1.62 + i * 0.1, 0, 18); p.scale.z = 0.7; mesa.add(p); }
    mesa.position.set(-20, 0, -3.2); cena.add(sombra(mesa));

    // candelabro
    const cand = new THREE.Group();
    cand.add(cil(0.45, 0.6, 0.25, M.ouro, 0, 0.12, 0, 20), cil(0.08, 0.1, 2.6, M.ouro, 0, 1.45, 0, 10));
    [0.45, 0.8, 1.15].forEach(r => { const arco = new THREE.Mesh(new THREE.TorusGeometry(r, 0.055, 8, 24, Math.PI), M.ouro); arco.rotation.z = Math.PI; arco.position.y = 2.75; cand.add(arco); });
    const chamas = [];
    [-1.15, -0.8, -0.45, 0, 0.45, 0.8, 1.15].forEach(x => {
      cand.add(cil(0.09, 0.05, 0.18, M.ouro, x, 2.8, 0, 10));
      const chama = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.22, 8), new THREE.MeshBasicMaterial({ color: 0xffc35a })); chama.position.set(x, 3.0, 0); cand.add(chama); chamas.push(chama);
    });
    cand.position.set(-20, 0, 3.4); cand.rotation.y = Math.PI / 2; cena.add(sombra(cand));
    const luzCand = new THREE.PointLight(0xffc068, 1.4, 18, 2); luzCand.position.set(-20, 3.5, 3); cena.add(luzCand);

    // altar do incenso
    const incenso = new THREE.Group();
    incenso.add(caixa(1, 2, 1, M.ouro, 0, 1, 0), caixa(1.12, 0.12, 1.12, M.ouroEsc, 0, 1.95, 0));
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([a, b]) => { const c = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.28, 8), M.ouro); c.position.set(a * 0.45, 2.15, b * 0.45); incenso.add(c); });
    incenso.position.set(-28, 0, 0); cena.add(sombra(incenso));
    const fumoIncenso = particulas(40, 0xe8e2d4, 0.9, 0.35, true); cena.add(fumoIncenso);

    // arca da aliança
    const arca = new THREE.Group();
    arca.add(caixa(2.5, 1.5, 1.5, M.ouro, 0, 0.85, 0), caixa(2.6, 0.12, 1.6, M.ouroEsc, 0, 1.66, 0), caixa(2.56, 0.1, 1.56, M.ouroEsc, 0, 1.2, 0));
    arca.add(cil(0.07, 0.07, 6, M.ouro, 0, 0.5, 0.82, 10).rotateZ(Math.PI / 2), cil(0.07, 0.07, 6, M.ouro, 0, 0.5, -0.82, 10).rotateZ(Math.PI / 2));
    const querubim = lado => {
      const q = new THREE.Group();
      const corpo = cil(0.13, 0.2, 0.55, M.ouro, 0, 0.3, 0, 12); corpo.rotation.z = -0.25; q.add(corpo);
      const cab = new THREE.Mesh(new THREE.SphereGeometry(0.12, 14, 10), M.ouro); cab.position.set(0.1, 0.68, 0); q.add(cab);
      [-1, 1].forEach(s => {
        // asa em leque: três penas planas, a mais longa na frente, abertas para o lado e inclinadas para cima e para o centro
        const asa = new THREE.Group();
        [[1.0, 0.2, 0], [0.85, 0.18, 0.14], [0.65, 0.16, 0.27]].forEach(([c, l, off]) => asa.add(caixa(c, 0.03, l, M.ouro, c / 2, -off * 0.3, s * off)));
        asa.position.set(-0.05, 0.6, s * 0.15); asa.rotation.z = 0.55; asa.rotation.x = -s * 0.35; q.add(asa);
      });
      q.rotation.y = lado < 0 ? 0 : Math.PI; q.position.set(lado * 1.0, 1.72, 0); return q;
    };
    arca.add(querubim(-1), querubim(1));
    arca.position.set(-35, 0, 0); cena.add(sombra(arca));
    const gloria = new THREE.PointLight(0xfff1c8, 1.2, 12, 2); gloria.position.set(-35, 4, 0); cena.add(gloria);

    // coluna de nuvem
    const nuvem = new THREE.Group();
    const nuvTex = tex(128, 128, g => { const r = g.createRadialGradient(64, 64, 0, 64, 64, 64); r.addColorStop(0, 'rgba(255,255,255,.9)'); r.addColorStop(.6, 'rgba(240,240,245,.35)'); r.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = r; g.fillRect(0, 0, 128, 128); });
    for (let i = 0; i < 46; i++) {
      const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: nuvTex, transparent: true, opacity: 0.55, depthWrite: false, color: 0xf4f1ea }));
      const h = 16 + Math.random() * 34, r = 2 + (h - 16) * 0.12 + Math.random() * 3, a = Math.random() * Math.PI * 2;
      s.position.set(Math.cos(a) * r, h, Math.sin(a) * r); const t = 7 + Math.random() * 7; s.scale.set(t, t, 1);
      s.userData = { a, r, h, v: 0.05 + Math.random() * 0.1 }; nuvem.add(s);
    }
    nuvem.position.set(-35, 0, 0); cena.add(nuvem);

    let tetoAberto = false;
    return {
      aoExtra: on => { tetoAberto = on; },
      animar(t, dt, reduz) {
        teto.position.y += ((tetoAberto ? 26 : 0) - teto.position.y) * Math.min(1, dt * 4);
        teto.visible = teto.position.y < 25;
        if (reduz) return;
        const pf = fogo.geometry.attributes.position, vf = fogo.userData.vida;
        for (let i = 0; i < vf.length; i++) { vf[i] += dt * (0.8 + (i % 5) * 0.12); if (vf[i] > 1) vf[i] -= 1; const a = i * 2.39, r = 1.6 * (1 - vf[i]) * ((i % 7) / 7 + 0.3); pf.setXYZ(i, 30 + Math.cos(a) * r, 3.3 + vf[i] * 3, Math.sin(a) * r); }
        pf.needsUpdate = true;
        const pm = fumaca.geometry.attributes.position, vm = fumaca.userData.vida;
        for (let i = 0; i < vm.length; i++) { vm[i] += dt * 0.12; if (vm[i] > 1) vm[i] -= 1; pm.setXYZ(i, 30 + Math.sin(i * 1.7 + t * 0.3) * (0.6 + vm[i] * 3) - vm[i] * 6, 6 + vm[i] * 22, Math.cos(i * 2.3) * (0.5 + vm[i] * 2.5)); }
        pm.needsUpdate = true;
        const pi = fumoIncenso.geometry.attributes.position, vi = fumoIncenso.userData.vida;
        for (let i = 0; i < vi.length; i++) { vi[i] += dt * 0.25; if (vi[i] > 1) vi[i] -= 1; pi.setXYZ(i, -28 + Math.sin(i * 1.3 + t * 1.1) * vi[i] * 0.6, 2.3 + vi[i] * 5, Math.cos(i * 2.1 + t) * vi[i] * 0.5); }
        pi.needsUpdate = true;
        brasa.intensity = 1.4 + Math.sin(t * 13) * 0.25 + Math.sin(t * 7.3) * 0.2;
        chamas.forEach((c, i) => { c.scale.y = 1 + Math.sin(t * 11 + i * 1.7) * 0.18; c.scale.x = c.scale.z = 1 + Math.sin(t * 9 + i) * 0.08; });
        luzCand.intensity = 1.3 + Math.sin(t * 10) * 0.12;
        nuvem.children.forEach(s => { const d = s.userData; d.a += d.v * dt; s.position.x = Math.cos(d.a) * d.r; s.position.z = Math.sin(d.a) * d.r; s.position.y = d.h + Math.sin(t * 0.4 + d.a) * 0.6; });
      },
    };
  },
});
