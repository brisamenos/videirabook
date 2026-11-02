/* O Egito de José e de Moisés — Gênesis 41–50; Êxodo 1–2; 5. 1 unidade = 1 m (pirâmides em escala reduzida ao fundo). O Nilo corre de sul (z+) para norte (z-). */
V3D.registrar('egito', {
  nome: 'Egito', sub: 'De José a Moisés · Nilo, celeiros, tijolos e pirâmides',
  ceu: 0xd6c9a4, neblina: [500, 1800], sombra: 130, dist: [5, 900],
  estacoes: [
    { id: 'geral', nome: 'Visão geral', ref: 'Gênesis 46.3-4; Êxodo 1.7', titulo: 'Israel no Egito', medida: 'Cerca de 430 anos no Egito (Êxodo 12.40)',
      desc: 'Jacó e sua família desceram ao Egito no tempo de José e se tornaram um povo numeroso. A vida do Egito dependia do Nilo: uma faixa verde de plantações no meio do deserto, com cidades, templos e, ao longe, as pirâmides.',
      cam: [260, 130, 260], alvo: [0, 5, 0] },
    { id: 'piramides', nome: 'As pirâmides', ref: 'Gênesis 12.10', titulo: 'As pirâmides de Gizé', medida: 'A Grande Pirâmide tinha cerca de 146 m de altura',
      desc: 'As grandes pirâmides foram construídas por volta de 2500 a.C. Quando Abraão desceu ao Egito, elas já tinham centenas de anos, e quando Moisés nasceu, mais de mil. Elas não foram feitas por israelitas, como às vezes se diz.',
      cam: [-420, 120, -360], alvo: [-560, 50, -560] },
    { id: 'nilo', nome: 'O Nilo', ref: 'Gênesis 41.1-4; Êxodo 7.20', titulo: 'O rio que dava vida', medida: 'A cheia anual adubava a terra com lodo',
      desc: 'O faraó sonhou com sete vacas gordas e sete magras subindo do Nilo. Todo ano o rio transbordava e deixava lodo fértil nos campos. Por isso a primeira praga, a água transformada em sangue, atingiu o coração do Egito.',
      cam: [60, 20, 80], alvo: [-20, 0, 30] },
    { id: 'celeiros', nome: 'Os celeiros', ref: 'Gênesis 41.46-57', titulo: 'Os celeiros de José', medida: 'Silos de tijolo com teto em cúpula',
      desc: 'Nos sete anos de fartura, José armazenou trigo em cada cidade "como a areia do mar". Pinturas e modelos achados em tumbas egípcias mostram celeiros em forma de cúpula, cheios por uma abertura no alto.',
      cam: [100, 26, -40], alvo: [70, 5, -70] },
    { id: 'tijolos', nome: 'Os tijolos', ref: 'Êxodo 1.11-14; 5.6-18', titulo: 'Tijolos com palha', medida: 'Barro do Nilo misturado com palha, secando ao sol',
      desc: 'Os israelitas foram obrigados a fazer tijolos para as cidades-armazéns de Pitom e Ramessés. Quando o faraó parou de dar a palha, tiveram de buscá-la eles mesmos, sem diminuir a quantidade. Pinturas egípcias mostram exatamente esse trabalho.',
      cam: [58, 10, 70], alvo: [42, 1, 52] },
    { id: 'cidade', nome: 'Pitom e Ramessés', ref: 'Êxodo 1.11', titulo: 'As cidades-armazéns', medida: 'Escavações em Tell el-Dab\'a e Qantir, no delta',
      desc: 'Arqueólogos identificam Ramessés com ruínas no delta do Nilo, capital do faraó Ramsés II, com palácios, templos e depósitos de tijolos. O portal do templo deste modelo segue o estilo desses edifícios.',
      cam: [170, 40, 40], alvo: [120, 10, 0] },
    { id: 'moises', nome: 'O cesto de Moisés', ref: 'Êxodo 2.1-10', titulo: 'Um cesto entre os juncos', medida: 'Cesto de papiro vedado com betume e piche',
      desc: 'A mãe de Moisés fez um cesto de papiro, vedou com betume e piche e o pôs entre os juncos na beira do rio. A filha do faraó o encontrou e o criou como filho. O cesto aparece flutuando entre os papiros.',
      cam: [-30, 4, 52], alvo: [-36, 0.4, 40] },
    { id: 'merneptah', nome: 'Estela de Merneptá', ref: 'Êxodo 1.7; Juízes 1', titulo: 'A primeira menção a "Israel"', medida: 'Achada em 1896 em Tebas · cerca de 1208 a.C.',
      desc: 'Uma grande pedra com as vitórias do faraó Merneptá traz, entre os povos de Canaã, o nome "Israel". É a menção mais antiga a Israel fora da Bíblia, e mostra que Israel já era um povo em Canaã nessa época. Está no Museu Egípcio do Cairo.',
      cam: [132, 8, 34], alvo: [126, 4, 22] },
  ],
  montar({ THREE, cena, tex, caixa, cil, sombra, particulas, pessoa }) {
    const areia = tex(256, 256, (g, w, h) => { g.fillStyle = '#d8bf8a'; g.fillRect(0, 0, w, h); for (let i = 0; i < 6000; i++) { const v = 170 + Math.random() * 60 | 0; g.fillStyle = `rgba(${v},${v * 0.85 | 0},${v * 0.6 | 0},.3)`; g.fillRect(Math.random() * w, Math.random() * h, 2, 2); } }, [100, 100]);
    const chao = new THREE.Mesh(new THREE.PlaneGeometry(5000, 5000), new THREE.MeshStandardMaterial({ map: areia, roughness: 1 })); chao.rotation.x = -Math.PI / 2; chao.receiveShadow = true; cena.add(chao);
    // faixa verde de plantações dos dois lados do rio
    const verde = new THREE.Mesh(new THREE.PlaneGeometry(260, 5000), new THREE.MeshStandardMaterial({ map: tex(128, 128, (g, w, h) => { for (let y = 0; y < h; y += 16) for (let x = 0; x < w; x += 32) { g.fillStyle = ['#6e8a3a', '#869a48', '#5f7a32', '#a49a58'][Math.random() * 4 | 0]; g.fillRect(x, y, 32, 16); } }, [8, 150]), roughness: 1 }));
    verde.rotation.x = -Math.PI / 2; verde.position.set(-30, 0.03, 0); cena.add(verde);
    // o Nilo
    const rioGeo = new THREE.PlaneGeometry(60, 5000, 10, 200); rioGeo.rotateX(-Math.PI / 2);
    const rioBase = rioGeo.attributes.position.array.slice();
    const rio = new THREE.Mesh(rioGeo, new THREE.MeshStandardMaterial({ color: 0x4f8098, roughness: 0.2, metalness: 0.15 })); rio.position.set(-40, 0.1, 0); cena.add(rio);
    // papiros na margem
    const papiro = new THREE.MeshStandardMaterial({ color: 0x5f8a3a, roughness: 1 });
    for (let i = 0; i < 260; i++) { const g = new THREE.Group(); g.add(cil(0.04, 0.05, 2.4, papiro, 0, 1.2, 0, 4)); const t = new THREE.Mesh(new THREE.SphereGeometry(0.3, 6, 4), papiro); t.position.y = 2.5; t.scale.y = 0.5; g.add(t); const lado = i % 2 ? 1 : -1; g.position.set(-40 + lado * (27 + Math.random() * 6), 0, -200 + Math.random() * 400); cena.add(g); }
    // barcos com vela no rio
    const barcos = []; for (let i = 0; i < 5; i++) { const b = new THREE.Group(); const casco = new THREE.Mesh(new THREE.SphereGeometry(1, 14, 8, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), new THREE.MeshStandardMaterial({ color: 0x8a6a40, side: THREE.DoubleSide })); casco.scale.set(1.6, 0.8, 6); b.add(casco); b.add(cil(0.08, 0.08, 7, new THREE.MeshStandardMaterial({ color: 0x6a4a2a }), 0, 3.5, 0, 6)); const v = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 4.5), new THREE.MeshStandardMaterial({ color: 0xece4cf, side: THREE.DoubleSide })); v.position.y = 4.5; b.add(v); b.position.set(-40 + (i % 2 ? 10 : -10), 0.3, -400 + i * 170); b.userData.v = 3 + i; cena.add(sombra(b)); barcos.push(b); }

    // pirâmides ao fundo (escala reduzida)
    const pedraP = new THREE.MeshStandardMaterial({ color: 0xd9c08a, roughness: 0.95 });
    [[-560, -560, 146], [-660, -480, 136], [-740, -420, 65]].forEach(([x, z, h]) => { const p = new THREE.Mesh(new THREE.ConeGeometry(h * 1.08, h, 4), pedraP); p.rotation.y = Math.PI / 4; p.position.set(x, h / 2, z); cena.add(sombra(p)); });
    const esfinge = new THREE.Group(); esfinge.add(caixa(36, 10, 9, pedraP, 0, 5, 0), caixa(8, 12, 8, pedraP, 16, 12, 0)); esfinge.position.set(-500, 0, -420); cena.add(sombra(esfinge));

    // celeiros de cúpula com escada
    const tij = new THREE.MeshStandardMaterial({ color: 0x9a7a52, roughness: 1 });
    const celeiros = new THREE.Group();
    for (let i = 0; i < 8; i++) { const g = new THREE.Group(); g.add(cil(3, 3, 5, tij, 0, 2.5, 0, 18)); const c = new THREE.Mesh(new THREE.SphereGeometry(3, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2), tij); c.position.y = 5; g.add(c); g.add(caixa(0.8, 0.8, 0.3, new THREE.MeshStandardMaterial({ color: 0x2a1e14 }), 0, 7.6, 1.6)); g.position.set(60 + (i % 4) * 8, 0, -76 + Math.floor(i / 4) * 10); celeiros.add(g); }
    celeiros.add(caixa(36, 2.5, 0.8, tij, 72, 1.25, -82), caixa(36, 2.5, 0.8, tij, 72, 1.25, -58));
    for (let i = 0; i < 10; i++) celeiros.add(caixa(1.2, 0.6, 0.9, new THREE.MeshStandardMaterial({ color: 0xc9a86a }), 64 + i * 1.6, 0.3, -54));
    cena.add(sombra(celeiros));

    // olaria: poços de barro, fôrmas, tijolos secando, palha e trabalhadores
    const olaria = new THREE.Group();
    olaria.add(cil(4, 4, 0.3, new THREE.MeshStandardMaterial({ color: 0x5a4430, roughness: 1 }), 36, 0.1, 46, 20));
    const palha = new THREE.MeshStandardMaterial({ color: 0xd6bf72, roughness: 1 });
    for (let i = 0; i < 4; i++) { const m = new THREE.Mesh(new THREE.SphereGeometry(1.4, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), palha); m.position.set(28 + i * 2.5, 0, 40); olaria.add(m); }
    const tijolo = new THREE.MeshStandardMaterial({ color: 0x7a5a3a, roughness: 1 }), tijoloSeco = new THREE.MeshStandardMaterial({ color: 0xa88a62, roughness: 1 });
    for (let i = 0; i < 120; i++) olaria.add(caixa(0.4, 0.13, 0.2, i < 70 ? tijolo : tijoloSeco, 42 + (i % 12) * 0.6, 0.07, 48 + Math.floor(i / 12) * 0.5));
    for (let i = 0; i < 6; i++) for (let k = 0; k < 4; k++) olaria.add(caixa(1.2, 0.14, 0.6, tijoloSeco, 52 + i * 1.4, 0.07 + k * 0.15, 54));
    cena.add(sombra(olaria));
    const trabalhadores = []; for (let i = 0; i < 12; i++) { const p = pessoa([0xe6dcc4, 0xd8ccb0, 0x8b5e3c][i % 3], { i, turbante: i % 3 === 2 ? undefined : 0xe6dcc4 }); p.position.set(34 + (i % 6) * 3, 0, 44 + Math.floor(i / 6) * 7); p.userData = { f: i * 0.7, y0: 0 }; cena.add(sombra(p)); trabalhadores.push(p); }
    const capataz = pessoa(0xf2ede0, { i: 2, turbante: 0x2a2a2a }); capataz.scale.setScalar(1.05); capataz.position.set(50, 0, 60); cena.add(sombra(capataz));
    const vara = cil(0.03, 0.03, 1.6, new THREE.MeshStandardMaterial({ color: 0x5b4632 }), 0.3, 1.1, 0, 4); vara.rotation.z = 0.6; capataz.add(vara);

    // cidade-armazém com portal de templo (pilono), obelisco e casas de tijolo
    const cidade = new THREE.Group(); const pedraC = new THREE.MeshStandardMaterial({ color: 0xe0cfa6, roughness: 0.9 });
    const pilono = (x, z) => { const g = new THREE.Group(); [-1, 1].forEach(s => { const t = new THREE.Mesh(new THREE.CylinderGeometry(1, 1.25, 18, 4), pedraC); t.rotation.y = Math.PI / 4; t.scale.set(9, 1, 4); t.position.set(0, 9, s * 11); g.add(t); }); g.add(caixa(5, 11, 6, pedraC, 0, 5.5, 0), caixa(5.4, 1.4, 6.4, new THREE.MeshStandardMaterial({ color: 0x2c5a9e }), 0, 11.6, 0)); g.position.set(x, 0, z); return g; };
    cidade.add(pilono(112, 0));
    const obeliscoM = new THREE.MeshStandardMaterial({ color: 0xb98a6a, roughness: 0.6 });
    [-14, 14].forEach(z => { const o = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 1.2, 20, 4), obeliscoM); o.rotation.y = Math.PI / 4; o.position.set(98, 10, z); cidade.add(o); const pt = new THREE.Mesh(new THREE.ConeGeometry(0.9, 1.6, 4), new THREE.MeshStandardMaterial({ color: 0xd8b04c, metalness: 0.9, roughness: 0.3 })); pt.rotation.y = Math.PI / 4; pt.position.set(98, 20.8, z); cidade.add(pt); });
    cidade.add(caixa(50, 14, 40, pedraC, 140, 7, 0));
    for (let i = 0; i < 12; i++) cidade.add(cil(1.2, 1.2, 14, pedraC, 116.5, 7, -15 + i * 2.7, 12));
    const casaM = [0xb39570, 0xa88a62, 0xc4a77e].map(c => new THREE.MeshStandardMaterial({ color: c, roughness: 1 }));
    for (let i = 0; i < 260; i++) { const x = 90 + Math.random() * 180, z = -160 + Math.random() * 320; if (x < 170 && Math.abs(z) < 40) continue; const w = 5 + Math.random() * 6, h = 3 + Math.random() * 4; cidade.add(caixa(w, h, w, casaM[i % 3], x, h / 2, z)); }
    cena.add(sombra(cidade));
    // estela de Merneptá
    const estTex = tex(128, 256, (g, w, h) => { g.fillStyle = '#4a4440'; g.fillRect(0, 0, w, h); g.fillStyle = '#6a625c'; g.beginPath(); g.arc(w / 2, 40, 30, 0, 7); g.fill(); g.fillStyle = '#26221f'; for (let l = 0; l < 22; l++) for (let x = 10; x < w - 10; x += 7) if (Math.random() > .2) g.fillRect(x, 80 + l * 7.5, 4, 4); });
    const f = new THREE.Shape(); f.moveTo(-1.6, 0); f.lineTo(1.6, 0); f.lineTo(1.6, 6.4); f.absarc(0, 6.4, 1.6, 0, Math.PI, false); f.lineTo(-1.6, 0);
    const estela = new THREE.Mesh(new THREE.ExtrudeGeometry(f, { depth: 0.6, bevelEnabled: false }), [new THREE.MeshStandardMaterial({ map: estTex, roughness: 0.6 }), new THREE.MeshStandardMaterial({ color: 0x3a3430 })]);
    estela.position.set(126, 0.6, 20); estela.rotation.y = 0.3; cena.add(sombra(estela));
    estTex.repeat.set(1 / 3.2, 1 / 8); estTex.offset.set(0.5, 0);
    cena.add(sombra(caixa(4.4, 0.6, 1.6, pedraC, 126, 0.3, 20.3)));

    // o cesto de Moisés entre os juncos, e a filha do faraó
    const cesto = new THREE.Group(); const cestoM = new THREE.MeshStandardMaterial({ color: 0x8a6a3a, roughness: 1 });
    cesto.add(new THREE.Mesh(new THREE.SphereGeometry(0.5, 14, 8, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), cestoM)); cesto.children[0].scale.set(1.2, 0.6, 0.7);
    const tampa = new THREE.Mesh(new THREE.SphereGeometry(0.5, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), cestoM); tampa.scale.set(1.2, 0.35, 0.7); cesto.add(tampa);
    cesto.position.set(-36, 0.3, 40); cena.add(cesto);
    for (let i = 0; i < 30; i++) { const j = cil(0.03, 0.04, 1.8, papiro, -36 + (Math.random() - .5) * 5, 0.9, 40 + (Math.random() - .5) * 5, 4); if (Math.hypot(j.position.x + 36, j.position.z - 40) < 0.9) continue; cena.add(j); }
    const princesa = pessoa(0xf6f1e4, { i: 2, turbante: 0x1a1a1a }); princesa.position.set(-31, 0, 44); princesa.rotation.y = -2.3; cena.add(sombra(princesa));
    const serva = pessoa(0xe8e0cc, { i: 1, turbante: 0x1a1a1a }); serva.position.set(-30, 0, 46); serva.rotation.y = -2.5; cena.add(sombra(serva));
    const palmas = new THREE.MeshStandardMaterial({ color: 0x5f7a3a, roughness: 1 }), tronco = new THREE.MeshStandardMaterial({ color: 0x7a6040, roughness: 1 });
    for (let i = 0; i < 120; i++) { const g = new THREE.Group(); g.add(cil(0.3, 0.45, 9, tronco, 0, 4.5, 0, 6)); for (let k = 0; k < 7; k++) { const fo = caixa(4.5, 0.1, 0.8, palmas, 2.1, 9, 0); fo.rotation.z = -0.4; const piv = new THREE.Group(); piv.add(fo); piv.rotation.y = k / 7 * Math.PI * 2; g.add(piv); } const lado = Math.random() > .5 ? 1 : -1; g.position.set(-40 + lado * (40 + Math.random() * 80), 0, -500 + Math.random() * 1000); if (g.position.x > 20 && g.position.x < 280 && Math.abs(g.position.z) < 180) continue; cena.add(g); }

    return {
      animar(t, dt, reduz) {
        if (reduz) return;
        const p = rioGeo.attributes.position; for (let i = 0; i < p.count; i++) { const z = rioBase[i * 3 + 2]; p.setY(i, Math.sin(z * 0.05 - t * 1.2) * 0.12); } p.needsUpdate = true;
        barcos.forEach(b => { b.position.z -= dt * b.userData.v; if (b.position.z < -800) b.position.z = 800; b.rotation.z = Math.sin(t + b.userData.v) * 0.04; });
        cesto.position.y = 0.25 + Math.sin(t * 1.5) * 0.05; cesto.rotation.z = Math.sin(t * 1.2) * 0.08;
        trabalhadores.forEach(w => { const u = w.userData; w.rotation.x = Math.max(0, Math.sin(t * 2 + u.f)) * 0.6; });
        vara.rotation.z = 0.6 + Math.sin(t * 1.4) * 0.3;
      },
    };
  },
});
