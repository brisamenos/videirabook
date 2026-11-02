/* Templo de Herodes em detalhe — segundo a Mishná (tratado Middot), Flávio Josefo e a arqueologia. 1 unidade = 1 m. Fachada para o leste (x positivo). */
V3D.registrar('herodes', {
  nome: 'Templo de Herodes', sub: 'O templo que Jesus conheceu · pátios, portas e santuário',
  ceu: 0x7fa6cc, neblina: [300, 1000], sombra: 140, dist: [6, 600],
  estacoes: [
    { id: 'geral', nome: 'Visão geral', ref: 'Marcos 13.1-2', titulo: '"Que pedras, que construções!"', medida: 'Santuário de cerca de 50 m de altura',
      desc: 'Um discípulo se admirou com o templo, e Jesus anunciou que dele não ficaria pedra sobre pedra, o que aconteceu no ano 70, quando os romanos destruíram Jerusalém. O modelo segue as descrições da Mishná e do historiador Flávio Josefo.',
      cam: [230, 130, 200], alvo: [20, 10, 0] },
    { id: 'gentios', nome: 'Pátio dos gentios', ref: 'Marcos 11.15-17', titulo: 'O pátio dos gentios', medida: 'A maior área da esplanada, aberta a todos',
      desc: 'Qualquer pessoa, judeu ou não, podia entrar ali. Era o lugar dos cambistas e vendedores de pombas e animais que Jesus expulsou: "A minha casa será chamada casa de oração para todos os povos".',
      cam: [175, 30, 110], alvo: [140, 2, 60] },
    { id: 'soreg', nome: 'A barreira', ref: 'Efésios 2.14; Atos 21.28-29', titulo: 'A barreira e as placas de advertência', medida: 'Achadas placas em 1871 e em 1935',
      desc: 'Uma mureta de pedra separava o pátio dos gentios da área sagrada. Placas em grego avisavam que o estrangeiro que passasse dali seria responsável pela própria morte. Duas delas já foram encontradas. Paulo fala de Cristo derrubando "o muro de separação".',
      cam: [160, 26, 78], alvo: [124, 1.5, 36] },
    { id: 'formosa', nome: 'Porta Formosa', ref: 'Atos 3.1-10', titulo: 'A Porta Formosa', medida: 'Portas de bronze de Corinto, segundo Josefo',
      desc: 'Na entrada leste do pátio das mulheres, um homem coxo de nascença pedia esmolas. Pedro lhe disse: "Não tenho prata nem ouro, mas o que tenho isto lhe dou: em nome de Jesus Cristo, o Nazareno, ande!"',
      cam: [150, 12, 14], alvo: [116, 6, 0] },
    { id: 'mulheres', nome: 'Pátio das mulheres', ref: 'Marcos 12.41-44; Lucas 2.36-38', titulo: 'O pátio das mulheres', medida: 'Cerca de 67 × 67 m',
      desc: 'Homens e mulheres podiam entrar ali. Junto às paredes ficavam as caixas de ofertas, onde Jesus viu a viúva pobre dar duas pequenas moedas, tudo o que tinha. Na festa dos Tabernáculos, grandes candelabros iluminavam o pátio.',
      cam: [112, 34, 46], alvo: [78, 2, 0] },
    { id: 'nicanor', nome: 'Porta de Nicanor', ref: 'Lucas 2.22-24', titulo: 'A porta de Nicanor e os quinze degraus', medida: 'Quinze degraus em semicírculo',
      desc: 'Uma grande porta de bronze levava ao pátio de Israel. Os levitas cantavam nos quinze degraus em semicírculo. Ali eram apresentadas as ofertas de purificação, como as de Maria e José na apresentação de Jesus.',
      cam: [70, 9, 16], alvo: [46, 7, 0] },
    { id: 'altar', nome: 'O altar', ref: 'Lucas 1.8-10; Hebreus 10.11', titulo: 'O pátio dos sacerdotes e o altar', medida: 'Altar de cerca de 16 × 16 m e 7,5 m de altura',
      desc: 'O grande altar de pedras não lavradas tinha uma rampa no lado sul. Ali, todos os dias, os sacerdotes ofereciam os sacrifícios. Hebreus lembra que esses sacrifícios se repetiam porque nunca podiam tirar pecados.',
      cam: [48, 22, 34], alvo: [20, 4, 0] },
    { id: 'santuario', nome: 'O santuário', ref: 'Lucas 1.8-22', titulo: 'O santuário e a videira de ouro', medida: 'Fachada de 100 côvados · cerca de 50 m',
      desc: 'A fachada era coberta de ouro e brilhava ao sol. Sobre a entrada havia uma videira de ouro com cachos do tamanho de um homem. Foi lá dentro, no Lugar Santo, que o anjo apareceu ao sacerdote Zacarias enquanto ele queimava incenso.',
      cam: [78, 34, 30], alvo: [-6, 24, 0] },
    { id: 'veu', nome: 'O véu', ref: 'Mateus 27.51; Hebreus 10.19-20', titulo: 'O véu que se rasgou', medida: 'Uma cortina de cerca de 20 m de altura',
      desc: 'Uma cortina enorme separava o Lugar Santo do Santo dos Santos, que no tempo de Herodes estava vazio, porque a arca tinha desaparecido. Quando Jesus morreu, o véu se rasgou de alto a baixo, abrindo o caminho até Deus.',
      cam: [20, 22, 4], alvo: [-28, 14, 0] },
    { id: 'pinaculo', nome: 'O pináculo', ref: 'Mateus 4.5-7', titulo: 'O pináculo do templo', medida: 'O canto sudeste, a mais de 40 m do vale',
      desc: 'Muitos identificam o pináculo com o canto sudeste da esplanada, de onde se via o vale do Cedrom bem lá embaixo. Ali o diabo levou Jesus e o tentou a se atirar. Uma pedra achada no canto sudoeste tem a inscrição "ao lugar do toque da trombeta".',
      cam: [250, 30, 230], alvo: [190, 30, 160] },
  ],
  montar({ THREE, cena, M, tex, caixa, cil, sombra, particulas, pessoa }) {
    const pedraTex = tex(256, 256, (g, w, h) => { g.fillStyle = '#e4dbc7'; g.fillRect(0, 0, w, h); g.strokeStyle = 'rgba(130,115,90,.35)'; g.lineWidth = 2; for (let y = 0; y < h; y += 32) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); for (let x = (y / 32) % 2 ? 0 : 48; x < w; x += 96) { g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + 32); g.stroke(); } } for (let i = 0; i < 1600; i++) { g.fillStyle = 'rgba(150,135,110,.12)'; g.fillRect(Math.random() * w, Math.random() * h, 2, 2); } }, [8, 3]);
    const pisoTex = tex(256, 256, (g, w, h) => { g.fillStyle = '#d6cbb2'; g.fillRect(0, 0, w, h); g.strokeStyle = 'rgba(120,105,80,.3)'; for (let i = 0; i <= w; i += 32) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i, h); g.stroke(); g.beginPath(); g.moveTo(0, i); g.lineTo(w, i); g.stroke(); } }, [60, 60]);
    const pedra = new THREE.MeshStandardMaterial({ map: pedraTex, roughness: 0.85 });
    const branco = new THREE.MeshStandardMaterial({ color: 0xf4f1ea, roughness: 0.4 });
    const piso = new THREE.MeshStandardMaterial({ map: pisoTex, roughness: 0.95 });
    const cedro = new THREE.MeshStandardMaterial({ color: 0x8a5a33, roughness: 0.8 });

    // vale e esplanada (plataforma de cerca de 30 m acima do vale)
    const vale = new THREE.Mesh(new THREE.PlaneGeometry(3000, 3000), new THREE.MeshStandardMaterial({ color: 0xa69468, roughness: 1 })); vale.rotation.x = -Math.PI / 2; vale.position.y = -30; vale.receiveShadow = true; cena.add(vale);
    const plataforma = new THREE.Group();
    plataforma.add(caixa(420, 30, 330, pedra, 0, -15, 0));
    const topoP = new THREE.Mesh(new THREE.PlaneGeometry(420, 330), piso); topoP.rotation.x = -Math.PI / 2; topoP.position.y = 0.02; topoP.receiveShadow = true; plataforma.add(topoP);
    cena.add(sombra(plataforma));
    // pórtico real ao sul e colunatas
    const colunata = (x0, z0, x1, z1, h, larg, dupla) => {
      const g = new THREE.Group(); const L = Math.hypot(x1 - x0, z1 - z0), n = Math.floor(L / 5);
      g.add(caixa(L, 1.2, larg, cedro, L / 2, h + 0.6, 0), caixa(L, 0.8, larg + 1, pedra, L / 2, h + 1.6, 0));
      for (let i = 0; i <= n; i++) for (let r = 0; r < (dupla ? 4 : 2); r++) g.add(cil(0.7, 0.75, h, branco, i * L / n, h / 2, -larg / 2 + 1 + r * (larg - 2) / ((dupla ? 4 : 2) - 1), 10));
      g.add(caixa(L, h + 2, 1.2, pedra, L / 2, (h + 2) / 2, larg / 2 + 0.6));
      g.position.set(x0, 0, z0); g.rotation.y = -Math.atan2(z1 - z0, x1 - x0); return g;
    };
    cena.add(sombra(colunata(-205, 150, 205, 150, 14, 24, true)));        // pórtico real
    cena.add(sombra(colunata(205, -160, 205, 145, 10, 14)));              // pórtico de Salomão (leste)
    cena.add(sombra(colunata(-205, -160, 205, -160, 10, 14)));            // norte
    // canto sudeste: o pináculo
    cena.add(sombra(caixa(14, 14, 14, pedra, 202, 7, 157)));
    // fortaleza Antônia no canto noroeste
    const antonia = new THREE.Group(); antonia.add(caixa(60, 22, 34, pedra, 0, 11, 0)); [[-27, -14, 34], [27, -14, 30], [-27, 14, 30], [27, 14, 42]].forEach(([x, z, h]) => antonia.add(caixa(8, h, 8, pedra, x, h / 2, z)));
    antonia.position.set(-170, 0, -192); cena.add(sombra(antonia));

    // a barreira (soreg) em volta da área sagrada
    const soreg = new THREE.Group();
    const lin = (x0, z0, x1, z1) => { const L = Math.hypot(x1 - x0, z1 - z0); const m = caixa(L, 1.5, 0.4, pedra, (x0 + x1) / 2, 0.75, (z0 + z1) / 2); m.rotation.y = -Math.atan2(z1 - z0, x1 - x0); soreg.add(m); };
    lin(-62, -46, 126, -46); lin(126, -46, 126, -5); lin(126, 5, 126, 46); lin(126, 46, -62, 46); lin(-62, 46, -62, -46);
    const placaM = new THREE.MeshStandardMaterial({ map: tex(128, 64, (g, w, h) => { g.fillStyle = '#efe7d6'; g.fillRect(0, 0, w, h); g.fillStyle = '#7a1e1e'; for (let l = 0; l < 6; l++) for (let x = 8; x < w - 8; x += 7) if (Math.random() > .15) g.fillRect(x, 8 + l * 9, 5, 5); }), roughness: 0.8 });
    [[126, 30], [126, -30], [60, 46], [60, -46]].forEach(([x, z]) => { const p = caixa(1.1, 0.7, 0.15, placaM, x + (Math.abs(z) === 46 ? 0 : 0.3), 2.0, z + (Math.abs(z) === 46 ? Math.sign(z) * 0.3 : 0)); if (Math.abs(z) !== 46) p.rotation.y = Math.PI / 2; soreg.add(p); });
    cena.add(sombra(soreg));
    // plataforma elevada da área sagrada (terraço) e muros
    const sagrado = new THREE.Group();
    sagrado.add(caixa(170, 3, 72, pedra, 26, 1.5, 0));
    const muro = (x, z, w, d, h) => sagrado.add(caixa(w, h, d, pedra, x, h / 2 + 3, z));
    muro(26, -35, 170, 2, 12); muro(26, 35, 170, 2, 12); muro(-58, 0, 2, 72, 12);
    muro(111, -20, 2, 30, 12); muro(111, 20, 2, 30, 12);                          // parede leste do pátio das mulheres, com a Porta Formosa
    muro(44, -21, 2, 28, 14); muro(44, 21, 2, 28, 14);                              // parede entre mulheres e Israel, com Nicanor
    // salas nos cantos do pátio das mulheres
    [[52, -28], [104, -28], [52, 28], [104, 28]].forEach(([x, z]) => sagrado.add(caixa(14, 10, 12, pedra, x, 8, z)));
    // pisos
    const pisoS = new THREE.Mesh(new THREE.PlaneGeometry(168, 70), new THREE.MeshStandardMaterial({ color: 0xe9e2d0, roughness: 0.8 })); pisoS.rotation.x = -Math.PI / 2; pisoS.position.set(26, 3.03, 0); sagrado.add(pisoS);
    // Porta Formosa (bronze) e portões de Nicanor
    const bronze = new THREE.MeshStandardMaterial({ color: 0xc08a4a, metalness: 0.8, roughness: 0.35 });
    sagrado.add(caixa(1.2, 10, 10, bronze, 111.4, 8, 0), caixa(2, 2, 12, pedra, 111, 14, 0));
    sagrado.add(caixa(1.2, 12, 9, bronze, 44.4, 10, 0), caixa(2.4, 3, 12, pedra, 44, 17, 0));
    // quinze degraus em semicírculo diante de Nicanor
    for (let i = 0; i < 15; i++) { const d = new THREE.Mesh(new THREE.CylinderGeometry(16 - i * 0.6, 16 - i * 0.6, 0.25, 40, 1, false, 0, Math.PI), pedra); d.rotation.y = Math.PI / 2; d.position.set(44, 3 + i * 0.25, 0); sagrado.add(d); }
    // caixas de ofertas (em forma de trombeta) junto às paredes
    for (let i = 0; i < 6; i++) { const t = new THREE.Mesh(new THREE.ConeGeometry(0.5, 1.6, 10, 1, true), bronze); t.rotation.x = Math.PI; t.position.set(60 + i * 7, 4.2, -32); sagrado.add(t); }
    // candelabros gigantes da festa
    [[66, -14], [66, 14], [92, -14], [92, 14]].forEach(([x, z]) => { const c = new THREE.Group(); c.add(cil(0.4, 0.6, 18, M.ouro, 0, 9, 0, 10)); [-1, 1].forEach(s => c.add(cil(0.25, 0.25, 6, M.ouro, s * 1.8, 17, 0, 8).rotateZ(s * 0.6))); c.position.set(x, 3, z); sagrado.add(c); });
    cena.add(sombra(sagrado));

    // pátio dos sacerdotes: altar com rampa ao sul e pia
    const altar = new THREE.Group();
    altar.add(caixa(16, 6.5, 16, new THREE.MeshStandardMaterial({ color: 0xcfc2a5, roughness: 1 }), 0, 3.25, 0), caixa(14, 1, 14, new THREE.MeshStandardMaterial({ color: 0xbfb294, roughness: 1 }), 0, 7, 0));
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([a, b]) => altar.add(caixa(1, 1, 1, new THREE.MeshStandardMaterial({ color: 0xbfb294 }), a * 6.5, 8, b * 6.5)));
    const rampa = caixa(8, 1, 16, new THREE.MeshStandardMaterial({ color: 0xcfc2a5, roughness: 1 }), 0, 3.6, 15.5); rampa.rotation.x = 0.42; altar.add(rampa);
    altar.position.set(20, 3, -2); cena.add(sombra(altar));
    const fogo = particulas(90, 0xff7a2a, 1.6, 0.9); cena.add(fogo);
    const fumaca = particulas(70, 0x9a948a, 4, 0.22, true); cena.add(fumaca);
    const brasa = new THREE.PointLight(0xff8a3a, 2, 40, 2); brasa.position.set(20, 13, -2); cena.add(brasa);
    cena.add(sombra(cil(2.5, 3, 3, bronze, 6, 4.5, 10, 20)));

    // o santuário: fachada larga (50 m) e corpo mais estreito atrás
    const naos = new THREE.Group();
    naos.add(caixa(10, 50, 50, branco, 0, 25, 0));                         // pórtico com a fachada de 100 côvados
    naos.add(caixa(10.4, 2, 50.4, M.ouro, 0, 49.5, 0));
    for (let i = 0; i < 24; i++) naos.add(new THREE.Mesh(new THREE.ConeGeometry(0.3, 2, 6), M.ouro).translateX(0).translateY(51.5).translateZ(-23.5 + i * 2.05));
    naos.add(caixa(0.4, 30, 18, M.ouro, 5.2, 21, 0));                      // a grande abertura revestida de ouro
    naos.add(caixa(0.3, 20, 9, new THREE.MeshStandardMaterial({ color: 0x2a2014, roughness: 0.6 }), 5.4, 15, 0));
    // videira de ouro sobre a entrada
    const uva = new THREE.MeshStandardMaterial({ color: 0xc9a042, metalness: 0.9, roughness: 0.3 });
    for (let i = 0; i < 26; i++) { const c = new THREE.Mesh(new THREE.SphereGeometry(0.7 + Math.random() * 0.4, 8, 6), uva); c.position.set(5.6, 27 + Math.sin(i) * 1.5, -9 + i * 0.7); naos.add(c); }
    naos.add(caixa(50, 40, 35, branco, -30, 20, 0));                        // Lugar Santo e Santo dos Santos
    naos.add(caixa(50.4, 1.5, 35.4, M.ouro, -30, 39.5, 0));
    naos.add(caixa(20, 34, 2, branco, -18, 17, 22), caixa(20, 34, 2, branco, -18, 17, -22));     // câmaras laterais
    for (let i = 0; i < 20; i++) naos.add(new THREE.Mesh(new THREE.ConeGeometry(0.25, 1.6, 6), M.ouro).translateX(-54 + i * 2.5).translateY(41.2).translateZ(17.2));
    // véu visto pelas aberturas (cortina colorida no fundo do Lugar Santo)
    const veuTex = tex(128, 256, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#24427f'); gr.addColorStop(.5, '#5b2a6e'); gr.addColorStop(1, '#9e2430'); g.fillStyle = gr; g.fillRect(0, 0, w, h); g.fillStyle = 'rgba(255,255,255,.08)'; for (let x = 0; x < w; x += 4) g.fillRect(x, 0, 1, h); });
    const veu = caixa(0.6, 30, 16, new THREE.MeshStandardMaterial({ map: veuTex, roughness: 1, emissive: 0x220a20, emissiveIntensity: 0.5 }), -30, 18, 0); naos.add(veu);
    naos.position.set(-2, 3, 0); cena.add(sombra(naos));

    // pessoas: sacerdotes de branco no pátio, povo no pátio das mulheres, cambistas no pátio dos gentios
    const povo = new THREE.Group();
    for (let i = 0; i < 10; i++) { const p = pessoa(0xf0ece0, { i, manto: 0xe6dfcc, turbante: 0xffffff }); p.scale.setScalar(1.4); p.position.set(8 + Math.random() * 28, 3, -14 + Math.random() * 28); povo.add(p); }
    for (let i = 0; i < 40; i++) { const p = pessoa([0x8b5e3c, 0x6f7f5a, 0xa58d68, 0x5b4a6a, 0x9a6a4a][i % 5], { i }); p.scale.setScalar(1.4); p.position.set(52 + Math.random() * 54, 3, -26 + Math.random() * 52); povo.add(p); }
    for (let i = 0; i < 70; i++) { const p = pessoa([0x8b5e3c, 0x6f7f5a, 0xa58d68, 0x5b4a6a, 0x9a6a4a, 0xc9b896][i % 6], { i }); p.scale.setScalar(1.4); p.position.set(70 + Math.random() * 120, 0, 60 + Math.random() * 70); povo.add(p); }
    // bancas dos cambistas e currais
    for (let i = 0; i < 10; i++) povo.add(caixa(4, 1.2, 1.6, cedro, 100 + i * 9, 0.6, 70));
    cena.add(sombra(povo));
    // cidade em volta, lá embaixo
    const casas = new THREE.Group(); const casaM = [0xd9caa8, 0xcdbb95, 0xe3d6ba].map(c => new THREE.MeshStandardMaterial({ color: c, roughness: 0.95 }));
    for (let i = 0; i < 380; i++) { const a = Math.random() * Math.PI * 2, r = 270 + Math.random() * 420; const x = Math.cos(a) * r, z = Math.sin(a) * r; if (x > 230 && x < 520) continue; const w = 8 + Math.random() * 10, h = 6 + Math.random() * 8; casas.add(caixa(w, h, w * (0.7 + Math.random() * 0.6), casaM[i % 3], x, -30 + h / 2, z)); }
    cena.add(casas);
    const oliveiras = new THREE.Mesh(new THREE.SphereGeometry(400, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshStandardMaterial({ color: 0x98905f, roughness: 1 })); oliveiras.scale.y = 0.18; oliveiras.position.set(780, -30, 0); cena.add(oliveiras);

    return {
      animar(t, dt, reduz) {
        if (reduz) return;
        const ax = 20, ay = 11, az = -2;
        const pf = fogo.geometry.attributes.position, vf = fogo.userData.vida;
        for (let i = 0; i < vf.length; i++) { vf[i] += dt * (0.8 + (i % 5) * 0.1); if (vf[i] > 1) vf[i] -= 1; const a = i * 2.39, r = 4 * (1 - vf[i]) * ((i % 7) / 7 + 0.3); pf.setXYZ(i, ax + Math.cos(a) * r, ay + vf[i] * 5, az + Math.sin(a) * r); }
        pf.needsUpdate = true;
        const pm = fumaca.geometry.attributes.position, vm = fumaca.userData.vida;
        for (let i = 0; i < vm.length; i++) { vm[i] += dt * 0.08; if (vm[i] > 1) vm[i] -= 1; pm.setXYZ(i, ax + Math.sin(i * 1.7 + t * .3) * (1 + vm[i] * 6) - vm[i] * 20, ay + 4 + vm[i] * 60, az + Math.cos(i * 2.3) * (1 + vm[i] * 5)); }
        pm.needsUpdate = true;
        brasa.intensity = 1.8 + Math.sin(t * 13) * 0.3;
      },
    };
  },
});
