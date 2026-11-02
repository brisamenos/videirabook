/* Jerusalém no tempo de Jesus. 1 unidade ≈ 4 m. Leste = x positivo, norte = z negativo. Posições aproximadas, segundo a arqueologia. */
V3D.registrar('jerusalem', {
  nome: 'Jerusalém', sub: 'No tempo de Jesus · posições aproximadas, segundo a arqueologia',
  ceu: 0x86a9c9, neblina: [350, 1100], sombra: 170, dist: [8, 700],
  estacoes: [
    { id: 'geral', nome: 'Visão geral', ref: 'Lucas 19.41', titulo: 'A cidade que Jesus conheceu', medida: 'Cerca de 1 km de leste a oeste',
      desc: 'Quando se aproximou e viu a cidade, Jesus chorou sobre ela. Jerusalém era dominada pelo monte do templo, reconstruído por Herodes, o Grande, e cercada de muralhas, com o monte das Oliveiras do outro lado do vale do Cedrom.',
      cam: [300, 170, 260], alvo: [20, 0, 10] },
    { id: 'templo', nome: 'O templo', ref: 'João 2.20; Marcos 13.1', titulo: 'O templo de Herodes', medida: 'Santuário de cerca de 100 côvados de altura · 45 m',
      desc: '"Este templo levou quarenta e seis anos para ser construído." O santuário, coberto de mármore branco e ouro, ficava no centro de pátios em níveis: o dos gentios, o das mulheres, o de Israel e o dos sacerdotes.',
      cam: [100, 40, 30], alvo: [55, 14, -8] },
    { id: 'esplanada', nome: 'Monte do templo', ref: 'Mateus 21.12-13', titulo: 'A grande esplanada', medida: 'Cerca de 300 × 480 m',
      desc: 'Herodes ampliou a plataforma com muros enormes de pedra. No pátio dos gentios ficavam os cambistas e vendedores de animais que Jesus expulsou, dizendo que a casa de Deus seria chamada casa de oração.',
      cam: [150, 75, 120], alvo: [55, 8, 0] },
    { id: 'portico', nome: 'Pórtico real', ref: 'João 10.23; Atos 3.11', titulo: 'Os pórticos do templo', medida: 'Pórtico real com cerca de 280 m de comprimento',
      desc: 'Colunatas cercavam a esplanada. No lado sul ficava o Pórtico Real, e no lado leste o Pórtico de Salomão, onde Jesus andava no inverno e onde os apóstolos se reuniam depois da ressurreição.',
      cam: [70, 22, 105], alvo: [55, 10, 58] },
    { id: 'antonia', nome: 'Fortaleza Antônia', ref: 'Atos 21.34-40', titulo: 'A fortaleza Antônia', medida: 'Junto ao canto noroeste do templo',
      desc: 'Uma fortaleza com quatro torres, de onde os soldados romanos vigiavam o pátio do templo. Paulo foi levado para lá depois do tumulto no templo e falou ao povo do alto da escadaria.',
      cam: [0, 35, -95], alvo: [24, 10, -60] },
    { id: 'betesda', nome: 'Tanque de Betesda', ref: 'João 5.2-9', titulo: 'O tanque de Betesda', medida: 'Dois tanques cercados por cinco pórticos',
      desc: 'Perto da porta das Ovelhas, ao norte do templo, havia um tanque com cinco pórticos onde muitos doentes esperavam. Ali Jesus curou um homem que estava doente havia trinta e oito anos.',
      cam: [80, 30, -120], alvo: [50, 2, -92] },
    { id: 'palacio', nome: 'Palácio de Herodes', ref: 'Marcos 15.16; Lucas 23.7-11', titulo: 'O palácio de Herodes e suas torres', medida: 'Três torres na parte alta da cidade',
      desc: 'No lado oeste, a parte mais alta da cidade, Herodes construiu um palácio protegido por três grandes torres. Era provavelmente ali que Pilatos ficava quando vinha a Jerusalém para as festas.',
      cam: [-110, 40, 40], alvo: [-55, 8, 0] },
    { id: 'golgota', nome: 'Gólgota', ref: 'João 19.17-20,41-42', titulo: 'O Gólgota e o sepulcro no jardim', medida: 'Fora da muralha, perto da cidade',
      desc: 'Jesus foi crucificado fora da cidade, num lugar chamado Lugar da Caveira, perto de um caminho por onde muita gente passava. Ali perto havia um jardim com um sepulcro novo, escavado na rocha.',
      cam: [-90, 22, -110], alvo: [-55, 4, -80] },
    { id: 'siloe', nome: 'Tanque de Siloé', ref: 'João 9.6-11', titulo: 'O tanque de Siloé', medida: 'No extremo sul da cidade',
      desc: 'O tanque recebia a água da fonte de Giom pelo túnel de Ezequias. Jesus mandou o cego de nascença se lavar ali, e ele voltou enxergando.',
      cam: [70, 20, 150], alvo: [40, 0, 122] },
    { id: 'oliveiras', nome: 'Getsêmani', ref: 'Mateus 26.30,36; Atos 1.12', titulo: 'O monte das Oliveiras e o Getsêmani', medida: 'Do outro lado do vale do Cedrom',
      desc: 'Depois da ceia, Jesus atravessou o Cedrom com os discípulos e foi orar num jardim de oliveiras chamado Getsêmani. Do monte das Oliveiras ele subiu ao céu, à vista dos discípulos.',
      cam: [170, 40, 40], alvo: [125, 4, -10] },
  ],
  montar({ THREE, cena, M, tex, caixa, cil, sombra, particulas }) {
    const solo = tex(256, 256, (g, w, h) => { g.fillStyle = '#b9a47c'; g.fillRect(0, 0, w, h); for (let i = 0; i < 5000; i++) { const v = Math.random(); g.fillStyle = v > .6 ? 'rgba(120,110,70,.35)' : 'rgba(200,185,150,.35)'; g.fillRect(Math.random() * w, Math.random() * h, 2, 2); } }, [70, 70]);
    const pedraTex = tex(128, 128, (g, w, h) => { g.fillStyle = '#ddd0b2'; g.fillRect(0, 0, w, h); g.strokeStyle = 'rgba(120,100,70,.4)'; for (let y = 0; y < h; y += 16) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); for (let x = (y / 16) % 2 ? 0 : 16; x < w; x += 32) { g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + 16); g.stroke(); } } }, [8, 2]);
    const pedra = new THREE.MeshStandardMaterial({ map: pedraTex, roughness: 0.92 });
    const branco = new THREE.MeshStandardMaterial({ color: 0xf2eee6, roughness: 0.5 });
    const casaMat = [0xd9caa8, 0xcdbb95, 0xe3d6ba, 0xc8b38a].map(c => new THREE.MeshStandardMaterial({ color: c, roughness: 0.95 }));
    const oliva = new THREE.MeshStandardMaterial({ color: 0x6b7a45, roughness: 1 });
    const tronco = new THREE.MeshStandardMaterial({ color: 0x5b4632, roughness: 1 });
    const aguaM = new THREE.MeshStandardMaterial({ color: 0x4f86a6, roughness: 0.15, metalness: 0.2 });

    const chao = new THREE.Mesh(new THREE.PlaneGeometry(2400, 2400), new THREE.MeshStandardMaterial({ map: solo, roughness: 1 }));
    chao.rotation.x = -Math.PI / 2; chao.receiveShadow = true; cena.add(chao);
    // vale do Cedrom e monte das Oliveiras
    const cedrom = new THREE.Mesh(new THREE.PlaneGeometry(14, 360), new THREE.MeshStandardMaterial({ color: 0x8c7d5c, roughness: 1 })); cedrom.rotation.x = -Math.PI / 2; cedrom.position.set(100, 0.05, 0); cena.add(cedrom);
    const oliveiras = new THREE.Mesh(new THREE.SphereGeometry(120, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshStandardMaterial({ color: 0xa69468, roughness: 1 }));
    oliveiras.scale.y = 0.28; oliveiras.position.set(230, 0, -10); oliveiras.receiveShadow = true; cena.add(oliveiras);
    const arvore = (x, z, y) => { const g = new THREE.Group(); g.add(cil(0.4, 0.6, 3, tronco, 0, 1.5, 0, 6)); const c = new THREE.Mesh(new THREE.SphereGeometry(2.4, 8, 6), oliva); c.position.y = 3.8; c.scale.y = 0.75; g.add(c); g.position.set(x, y || 0, z); return g; };
    const bosque = new THREE.Group();
    for (let i = 0; i < 60; i++) { const x = 115 + Math.random() * 40, z = -35 + Math.random() * 50; const d = Math.hypot(x - 230, (z + 10)); const y = d < 120 ? 33.6 * Math.sqrt(Math.max(0, 1 - (d / 120) ** 2)) - 1 : 0; bosque.add(arvore(x, z, Math.max(0, y))); }
    for (let i = 0; i < 90; i++) { const a = Math.random() * Math.PI * 2, r = Math.random() * 100; const x = 230 + Math.cos(a) * r, z = -10 + Math.sin(a) * r; if (x < 150) continue; const y = 33.6 * Math.sqrt(Math.max(0, 1 - (r / 120) ** 2)) - 1; bosque.add(arvore(x, z, y)); }
    cena.add(sombra(bosque));

    // ── monte do templo: plataforma de 75 × 120 unidades
    const monte = new THREE.Group();
    monte.add(caixa(75, 8, 120, pedra, 55, 4, 0));
    const pisoP = caixa(74, 0.2, 119, new THREE.MeshStandardMaterial({ color: 0xd6c9aa, roughness: 0.95 }), 55, 8.1, 0); monte.add(pisoP);
    // pórticos (colunatas) nos quatro lados; o real, ao sul, mais alto
    const colunata = (x0, z0, x1, z1, h, larg) => {
      const g = new THREE.Group(); const L = Math.hypot(x1 - x0, z1 - z0), n = Math.floor(L / 2.4);
      const ang = Math.atan2(z1 - z0, x1 - x0);
      g.add(caixa(L, 0.8, larg, pedra, L / 2, h + 0.4, 0));
      for (let i = 0; i <= n; i++) { g.add(cil(0.35, 0.35, h, branco, i * L / n, h / 2, -larg / 2 + 0.5, 8)); g.add(cil(0.35, 0.35, h, branco, i * L / n, h / 2, larg / 2 - 0.5, 8)); }
      g.position.set(x0, 8, z0); g.rotation.y = -ang; return g;
    };
    monte.add(colunata(18, 58, 92, 58, 9, 7));          // pórtico real (sul)
    monte.add(colunata(91, -59, 91, 57, 6, 5));         // pórtico de Salomão (leste)
    monte.add(colunata(18, -59, 91, -59, 6, 5));        // norte
    monte.add(colunata(19, -55, 19, 55, 6, 5));         // oeste
    // escadarias do sul
    for (let i = 0; i < 8; i++) monte.add(caixa(26, 1, 2, pedra, 50, 0.5 + i, 66 - i * 2));
    cena.add(sombra(monte));
    // pátios internos e santuário
    const santuario = new THREE.Group();
    santuario.add(caixa(52, 4, 34, pedra, 0, 2, 0));                  // muro do recinto sagrado
    santuario.add(caixa(16, 5, 18, pedra, 26, 2.5, 0));              // pátio das mulheres
    santuario.add(caixa(50, 0.3, 32, new THREE.MeshStandardMaterial({ color: 0xe8e0cc, roughness: 0.8 }), 0, 4.2, 0));
    const naos = new THREE.Group();
    naos.add(caixa(16, 11, 6.5, branco, -6, 9.8, 0));                // corpo do santuário
    naos.add(caixa(3, 11.5, 11, branco, 3, 10, 0));                  // fachada larga (100 côvados)
    naos.add(caixa(3.2, 0.5, 11.2, M.ouro, 3, 15.9, 0));
    naos.add(caixa(0.3, 6, 2.6, M.ouro, 4.6, 7.4, 0));               // portal de ouro
    for (let i = 0; i < 14; i++) naos.add(new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.8, 4), M.ouro).translateX(-13 + i * 1.2).translateY(16.4).translateZ(3.3));
    santuario.add(naos);
    const altarH = caixa(4, 2.2, 4, pedra, 12, 5.4, 0); santuario.add(altarH);
    santuario.position.set(55, 8, -10); cena.add(sombra(santuario));
    const fumaca = particulas(60, 0x9a948a, 3, 0.25, true); cena.add(fumaca);
    const fogo = particulas(40, 0xff7a2a, 1.2, 0.9); cena.add(fogo);

    // fortaleza Antônia
    const antonia = new THREE.Group();
    antonia.add(caixa(24, 10, 14, pedra, 0, 5, 0));
    [[-11, -6, 16], [11, -6, 14], [-11, 6, 14], [11, 6, 22]].forEach(([x, z, h]) => antonia.add(caixa(4, h, 4, pedra, x, h / 2, z)));
    antonia.position.set(24, 0, -64); cena.add(sombra(antonia));

    // muralhas da cidade
    const muro = (pts, h) => {
      const g = new THREE.Group();
      for (let i = 0; i < pts.length - 1; i++) {
        const [x0, z0] = pts[i], [x1, z1] = pts[i + 1]; const L = Math.hypot(x1 - x0, z1 - z0);
        const m = caixa(L, h, 2, pedra, (x0 + x1) / 2, h / 2, (z0 + z1) / 2); m.rotation.y = -Math.atan2(z1 - z0, x1 - x0); g.add(m);
        const t = caixa(3.4, h + 2.5, 3.4, pedra, x0, (h + 2.5) / 2, z0); g.add(t);
      }
      return g;
    };
    cena.add(sombra(muro([[18, -62], [-20, -62], [-70, -40], [-75, 20], [-60, 80], [-10, 110], [30, 130], [55, 120], [70, 64]], 7)));
    cena.add(sombra(muro([[18, -62], [18, -100], [80, -110], [92, -62]], 6)));

    // palácio de Herodes com as três torres
    const palacio = new THREE.Group();
    palacio.add(caixa(14, 6, 42, pedra, 0, 3, 0), caixa(10, 0.6, 38, new THREE.MeshStandardMaterial({ color: 0x7d9a5a, roughness: 1 }), 0, 6.2, 0));
    [[-3, -24, 22], [4, -24, 18], [0, -30, 26]].forEach(([x, z, h]) => palacio.add(caixa(6, h, 6, pedra, x, h / 2, z)));
    palacio.position.set(-58, 0, 2); cena.add(sombra(palacio));

    // casas da cidade alta e da cidade baixa
    const casas = new THREE.Group();
    const livre = (x, z) => !((x > 14 && x < 96 && z > -64 && z < 70) || (x > -68 && x < -46 && z > -36 && z < 26) || (x > 8 && x < 40 && z > -74 && z < -54));
    const dentro = (x, z) => (x > -68 && x < 66 && z > -55 && z < 110 && (x < 18 || z > 62)) || (x > 20 && x < 90 && z > -105 && z < -66);
    for (let i = 0; i < 900; i++) {
      const x = -70 + Math.random() * 160, z = -105 + Math.random() * 230;
      if (!dentro(x, z) || !livre(x, z)) continue;
      const w = 3 + Math.random() * 4, d = 3 + Math.random() * 4, h = 2.5 + Math.random() * (z < 50 && x < 0 ? 4 : 2.5);
      casas.add(caixa(w, h, d, casaMat[i % 4], x, h / 2, z));
    }
    cena.add(sombra(casas));

    // tanque de Betesda: dois tanques e cinco pórticos
    const betesda = new THREE.Group();
    betesda.add(caixa(22, 1, 16, pedra, 0, 0.5, 0));
    betesda.add(caixa(9, 0.3, 14, aguaM, -5.5, 0.9, 0), caixa(9, 0.3, 14, aguaM, 5.5, 0.9, 0));
    [[0, -8, 22, 0], [0, 8, 22, 0], [-11, 0, 16, 1], [11, 0, 16, 1], [0, 0, 16, 1]].forEach(([x, z, L, rot]) => {
      for (let i = 0; i <= 6; i++) { const c = cil(0.25, 0.25, 4, branco, rot ? x : x - L / 2 + i * L / 6, 3, rot ? z - L / 2 + i * L / 6 : z, 8); betesda.add(c); }
      const t = caixa(rot ? 1.2 : L, 0.4, rot ? L : 1.2, pedra, x, 5.2, z); betesda.add(t);
    });
    betesda.position.set(50, 0, -92); cena.add(sombra(betesda));

    // tanque de Siloé, com degraus
    const siloe = new THREE.Group();
    for (let i = 0; i < 4; i++) siloe.add(caixa(26 - i * 3, 0.5, 14 - i * 3, pedra, 0, 0.25 + i * 0.01, 0));
    siloe.add(caixa(15, 0.3, 4, aguaM, 0, 0.6, 0));
    siloe.position.set(40, 0, 122); cena.add(sombra(siloe));

    // Gólgota e o sepulcro no jardim, fora do muro
    const golgota = new THREE.Group();
    const rocha = new THREE.Mesh(new THREE.SphereGeometry(10, 10, 8, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshStandardMaterial({ color: 0xa89878, roughness: 1, flatShading: true }));
    rocha.scale.y = 0.45; golgota.add(rocha);
    [-3, 0, 3].forEach((x, i) => { const cr = new THREE.Group(); cr.add(caixa(0.4, i === 1 ? 5 : 4.4, 0.4, tronco, 0, 2.4, 0), caixa(2.4, 0.35, 0.35, tronco, 0, i === 1 ? 4.1 : 3.7, 0)); cr.position.set(x, 3.6, 0); golgota.add(cr); });
    const tumulo = new THREE.Group(); tumulo.add(caixa(9, 5, 6, new THREE.MeshStandardMaterial({ color: 0x9d8f72, roughness: 1, flatShading: true }), 0, 2.5, 0));
    const pedraRolar = cil(1.6, 1.6, 0.6, pedra, 3.2, 1.6, 3.2, 20); pedraRolar.rotation.x = Math.PI / 2; tumulo.add(pedraRolar);
    tumulo.add(caixa(1.8, 2.6, 0.3, new THREE.MeshStandardMaterial({ color: 0x2a2520 }), 0.6, 1.3, 3.05));
    tumulo.position.set(14, 0, 8); golgota.add(tumulo);
    for (let i = 0; i < 8; i++) golgota.add(arvore(8 + Math.random() * 14, 12 + Math.random() * 8));
    golgota.position.set(-58, 0, -82); cena.add(sombra(golgota));

    // aves em círculo e nuvens
    const aves = new THREE.Group();
    const aveGeo = new THREE.BufferGeometry(); aveGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array([-1, 0.4, 0, 0, 0, 0.3, 0, 0, 0.3, 1, 0.4, 0]), 3));
    for (let i = 0; i < 12; i++) { const a = new THREE.LineSegments(aveGeo, new THREE.LineBasicMaterial({ color: 0x2a2a2a })); a.userData = { r: 40 + Math.random() * 40, f: Math.random() * 6, v: 0.15 + Math.random() * 0.1, h: 40 + Math.random() * 15 }; aves.add(a); }
    cena.add(aves);

    return {
      animar(t, dt, reduz) {
        if (reduz) return;
        const ax = 55 + 12, ay = 8 + 6.5, az = -10;
        const pm = fumaca.geometry.attributes.position, vm = fumaca.userData.vida;
        for (let i = 0; i < vm.length; i++) { vm[i] += dt * 0.1; if (vm[i] > 1) vm[i] -= 1; pm.setXYZ(i, ax + Math.sin(i * 1.7 + t * .3) * (0.5 + vm[i] * 4) - vm[i] * 10, ay + 1 + vm[i] * 30, az + Math.cos(i * 2.3) * (0.5 + vm[i] * 3)); }
        pm.needsUpdate = true;
        const pf = fogo.geometry.attributes.position, vf = fogo.userData.vida;
        for (let i = 0; i < vf.length; i++) { vf[i] += dt; if (vf[i] > 1) vf[i] -= 1; const a = i * 2.39, r = 1.5 * (1 - vf[i]); pf.setXYZ(i, ax + Math.cos(a) * r, ay + vf[i] * 2.5, az + Math.sin(a) * r); }
        pf.needsUpdate = true;
        aves.children.forEach((a, i) => { const d = a.userData, ang = t * d.v + d.f; a.position.set(55 + Math.cos(ang) * d.r, d.h + Math.sin(t + i) * 2, -10 + Math.sin(ang) * d.r); a.rotation.y = -ang; a.scale.set(1.4, 1 + Math.sin(t * 8 + i) * 0.6, 1.4); });
      },
    };
  },
});
