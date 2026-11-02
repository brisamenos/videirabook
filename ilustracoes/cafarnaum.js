/* Cafarnaum no tempo de Jesus. 1 unidade = 1 m. O mar da Galileia fica ao sul (z positivo). */
V3D.registrar('cafarnaum', {
  nome: 'Cafarnaum', sub: 'À beira do mar da Galileia · casas, sinagoga e o barco do século 1',
  ceu: 0x8db4d4, neblina: [160, 600], sombra: 70, dist: [2, 320],
  extra: ['Tirar os telhados', 'Pôr os telhados'],
  estacoes: [
    { id: 'geral', nome: 'Visão geral', ref: 'Mateus 4.13', titulo: 'A cidade de Jesus', medida: 'Uma vila de pescadores e agricultores · entre 600 e 1.500 moradores, segundo as estimativas',
      desc: 'Jesus deixou Nazaré e foi morar em Cafarnaum, à beira do mar da Galileia, que passou a ser chamada "sua cidade" (Mateus 9.1). As escavações mostram casas de basalto escuro agrupadas em volta de pátios, ruas estreitas e um porto de pesca.',
      cam: [70, 50, 80], alvo: [-5, 0, 5] },
    { id: 'casas', nome: 'As casas', ref: 'Marcos 1.29-33', titulo: 'Casas de basalto em volta de um pátio', medida: 'Cômodos pequenos, de 3 a 5 m',
      desc: 'Várias famílias aparentadas moravam em cômodos ao redor de um pátio comum, onde se cozinhava e se trabalhava. As paredes eram de pedras de basalto empilhadas, e o teto, de vigas cobertas com galhos e barro amassado.',
      cam: [26, 16, 22], alvo: [10, 1, 6], extra: true },
    { id: 'pedro', nome: 'Casa de Pedro', ref: 'Mateus 8.14-16', titulo: 'A casa de Pedro', medida: 'Venerada pelos cristãos desde o século 1',
      desc: 'Arqueólogos encontraram uma casa cujo cômodo principal foi rebocado e usado como local de reunião já no século 1, com inscrições cristãs nas paredes. Mais tarde construíram ali uma igreja octogonal. Muitos a identificam com a casa de Pedro, onde Jesus curou a sogra dele.',
      cam: [-14, 10, 22], alvo: [-4, 1.5, 10] },
    { id: 'teto', nome: 'O paralítico', ref: 'Marcos 2.1-12', titulo: 'Abriram o teto', medida: 'Teto de vigas, galhos e barro, fácil de abrir',
      desc: 'A casa estava tão cheia que quatro homens não conseguiram chegar à porta. Subiram ao telhado, abriram um buraco e desceram o paralítico na maca diante de Jesus. Telhados assim eram refeitos todo ano.',
      cam: [9, 9, 9], alvo: [0, 2, 0] },
    { id: 'sinagoga', nome: 'A sinagoga', ref: 'Marcos 1.21-28; Lucas 7.5; João 6.59', titulo: 'A sinagoga de Cafarnaum', medida: 'Prédio de cerca de 24 × 18 m',
      desc: 'As ruínas brancas de calcário são de uma sinagoga do século 4 ou 5. Por baixo dela, os arqueólogos acharam um piso e alicerces de basalto mais antigos, provavelmente da sinagoga do século 1, onde Jesus ensinou e expulsou um espírito imundo.',
      cam: [6, 17, 26], alvo: [-26, 3, -12] },
    { id: 'barco', nome: 'O barco da Galileia', ref: 'Lucas 5.1-11; Marcos 4.35-41', titulo: 'Um barco de pesca do século 1', medida: 'Achado em 1986 · 8,2 m de comprimento × 2,3 m de largura',
      desc: 'Numa seca, dois irmãos acharam na lama do mar da Galileia o casco de um barco da época de Jesus. Cabiam cerca de quinze pessoas: Jesus e os doze discípulos caberiam nele. Era movido a remo e a vela. Está num museu em Ginosar, perto dali.',
      cam: [22, 6, 58], alvo: [8, 1, 46] },
  ],
  montar({ THREE, cena, tex, caixa, cil, sombra }) {
    const basaltoTex = tex(256, 256, (g, w, h) => { g.fillStyle = '#3f3d3b'; g.fillRect(0, 0, w, h); for (let y = 0; y < h; y += 22) for (let x = (y / 22) % 2 ? -14 : 0; x < w; x += 28) { g.fillStyle = `rgb(${50 + Math.random() * 30 | 0},${48 + Math.random() * 28 | 0},${46 + Math.random() * 26 | 0})`; g.fillRect(x + 1, y + 1, 26, 20); } }, [2, 1]);
    const basalto = new THREE.MeshStandardMaterial({ map: basaltoTex, roughness: 0.95 });
    const barroM = new THREE.MeshStandardMaterial({ color: 0x9a7c55, roughness: 1, transparent: true });
    const calcario = new THREE.MeshStandardMaterial({ color: 0xece5d6, roughness: 0.75 });
    const madeira = new THREE.MeshStandardMaterial({ color: 0x6d4a2c, roughness: 0.85 });
    const solo = tex(256, 256, (g, w, h) => { g.fillStyle = '#8d8a62'; g.fillRect(0, 0, w, h); for (let i = 0; i < 5000; i++) { g.fillStyle = Math.random() > .5 ? 'rgba(70,75,45,.4)' : 'rgba(150,140,100,.35)'; g.fillRect(Math.random() * w, Math.random() * h, 2, 2); } }, [50, 50]);
    const chao = new THREE.Mesh(new THREE.PlaneGeometry(600, 300), new THREE.MeshStandardMaterial({ map: solo, roughness: 1 })); chao.rotation.x = -Math.PI / 2; chao.position.z = -110; chao.receiveShadow = true; cena.add(chao);
    const praia = new THREE.Mesh(new THREE.PlaneGeometry(600, 14), new THREE.MeshStandardMaterial({ color: 0x6a655c, roughness: 1 })); praia.rotation.x = -Math.PI / 2; praia.position.set(0, 0.02, 37); cena.add(praia);
    const aguaGeo = new THREE.PlaneGeometry(800, 500, 80, 50); aguaGeo.rotateX(-Math.PI / 2);
    const base = aguaGeo.attributes.position.array.slice();
    const agua = new THREE.Mesh(aguaGeo, new THREE.MeshStandardMaterial({ color: 0x3f7f9c, roughness: 0.25, metalness: 0.1, flatShading: true }));
    agua.position.set(0, -0.3, 294); cena.add(agua);
    // montes do outro lado do lago
    for (let i = 0; i < 10; i++) { const m = new THREE.Mesh(new THREE.SphereGeometry(80 + Math.random() * 40, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshStandardMaterial({ color: 0x8a8460, roughness: 1 })); m.scale.y = 0.35; m.position.set(-400 + i * 90, -5, 560 + Math.random() * 60); cena.add(m); }

    const telhados = [];
    const comodo = (x, z, w, d, h, aberto) => {
      const g = new THREE.Group(); const e = 0.5;
      g.add(caixa(w, h, e, basalto, 0, h / 2, -d / 2), caixa(w, h, e, basalto, 0, h / 2, d / 2), caixa(e, h, d, basalto, -w / 2, h / 2, 0), caixa(e, h, d, basalto, w / 2, h / 2, 0));
      const porta = caixa(1, 2, e + 0.05, new THREE.MeshStandardMaterial({ color: 0x1e1a16 }), 0, 1, d / 2); g.add(porta);
      const teto = new THREE.Group();
      if (aberto) { // teto com o buraco aberto pelos amigos do paralítico
        teto.add(caixa(w + 0.4, 0.35, (d + 0.4) / 2 - 0.6, barroM, 0, h + 0.17, -(d + 0.4) / 4 - 0.3), caixa(w + 0.4, 0.35, (d + 0.4) / 2 - 0.6, barroM, 0, h + 0.17, (d + 0.4) / 4 + 0.3));
        teto.add(caixa((w + 0.4) / 2 - 0.8, 0.35, 1.2, barroM, -(w + 0.4) / 4 - 0.4, h + 0.17, 0), caixa((w + 0.4) / 2 - 0.8, 0.35, 1.2, barroM, (w + 0.4) / 4 + 0.4, h + 0.17, 0));
      } else teto.add(caixa(w + 0.4, 0.35, d + 0.4, barroM, 0, h + 0.17, 0));
      for (let i = -w / 2 + 0.5; i < w / 2; i += 0.8) teto.add(cil(0.08, 0.08, d + 0.6, madeira, i, h - 0.05, 0, 6).rotateX(Math.PI / 2));
      g.add(teto); telhados.push(teto); g.position.set(x, 0, z); return g;
    };
    const insula = (cx, cz, rot) => {
      const g = new THREE.Group();
      [[-6, -6, 5, 4], [0, -6.5, 5, 3.5], [6, -6, 4, 4], [-6.5, 0, 3.5, 5], [6.5, 0.5, 3.5, 5], [-5, 6, 5, 3.5], [5, 6, 4, 3.5]].forEach(([x, z, w, d]) => { if (Math.random() < 0.85) g.add(comodo(x, z, w, d, 2.6 + Math.random() * 0.5)); });
      g.add(cil(0.6, 0.7, 0.8, basalto, 0, 0.4, 0, 10));   // forno no pátio
      g.position.set(cx, 0, cz); g.rotation.y = rot || 0; return g;
    };
    const vila = new THREE.Group();
    [[14, 6], [14, -14], [28, -4], [-12, -30], [10, -34], [32, -26], [-40, 12], [-44, -30], [46, 8], [50, -18], [-58, -8], [26, -48]].forEach(([x, z], i) => vila.add(insula(x, z, (i % 3) * 0.05)));
    cena.add(sombra(vila));
    // casa do paralítico, com o teto aberto
    const casaP = comodo(0, 0, 5, 5, 3, true); cena.add(sombra(casaP));
    // casa de Pedro: cômodo rebocado em volta de um pátio
    const pedro = new THREE.Group(); pedro.add(comodo(-4, 10, 6, 5, 3)); pedro.add(comodo(-11, 10, 4, 5, 2.8)); pedro.add(comodo(-7, 4, 4, 3.5, 2.8));
    const reboco = new THREE.Mesh(new THREE.BoxGeometry(5.2, 2.7, 4.2), new THREE.MeshStandardMaterial({ color: 0xe6dccb, roughness: 1, side: THREE.BackSide })); reboco.position.set(-4, 1.4, 10); pedro.add(reboco);
    cena.add(sombra(pedro));

    // pessoas
    const roupas = [0x8b5e3c, 0x6f7f5a, 0xa58d68, 0x5b4a6a, 0x9a6a4a, 0xc9b896].map(c => new THREE.MeshStandardMaterial({ color: c, roughness: 0.9 }));
    const pele = new THREE.MeshStandardMaterial({ color: 0xa8734f, roughness: 0.8 });
    const pessoa = (x, y, z, i) => { const g = new THREE.Group(); g.add(cil(0.22, 0.38, 1.4, roupas[i % 6], 0, 0.7, 0, 10)); const c = new THREE.Mesh(new THREE.SphereGeometry(0.17, 10, 8), pele); c.position.y = 1.58; g.add(c); g.position.set(x, y, z); return g; };
    const povo = new THREE.Group();
    for (let i = 0; i < 26; i++) { const a = Math.random() * Math.PI - Math.PI * 0.05, r = 3.4 + Math.random() * 3; povo.add(pessoa(Math.cos(a) * r * 1.1, 0, 2.6 + Math.sin(a) * r * 0.8, i)); }
    for (let i = 0; i < 8; i++) povo.add(pessoa(-1.6 + (i % 4) * 1.1, 0, -1.4 + Math.floor(i / 4) * 2.8, i + 3));   // dentro da casa
    const amigos = [[-1.3, -1.3], [1.3, -1.3], [-1.3, 1.3], [1.3, 1.3]].map(([x, z], i) => pessoa(x, 3.35, z, i + 1)); amigos.forEach(a => povo.add(a));
    cena.add(sombra(povo));
    const maca = new THREE.Group(); maca.add(caixa(0.8, 0.08, 1.9, new THREE.MeshStandardMaterial({ color: 0xc9b07c, roughness: 1 }), 0, 0, 0)); const deitado = cil(0.2, 0.2, 1.5, roupas[5], 0, 0.2, 0, 8); deitado.rotation.x = Math.PI / 2; maca.add(deitado);
    const cordas = []; [[-0.35, -0.9], [0.35, -0.9], [-0.35, 0.9], [0.35, 0.9]].forEach(([x, z]) => { const c = cil(0.015, 0.015, 1, new THREE.MeshStandardMaterial({ color: 0xd8c8a0 }), x, 0.5, z, 4); maca.add(c); cordas.push(c); });
    cena.add(maca);
    const jesus = pessoa(0, 0, -0.8, 0); jesus.children[0].material = new THREE.MeshStandardMaterial({ color: 0xe8e0cf, roughness: 0.9 }); cena.add(jesus);

    // sinagoga: alicerce de basalto (séc. 1) e prédio de calcário branco (séc. 4-5)
    const sin = new THREE.Group();
    sin.add(caixa(26, 1.2, 20, basalto, 0, 0.6, 0));
    sin.add(caixa(24.4, 7, 0.7, calcario, 0, 4.7, -9), caixa(0.7, 7, 18.6, calcario, -12, 4.7, 0), caixa(0.7, 7, 18.6, calcario, 12, 4.7, 0));
    // fachada voltada para o sul (Jerusalém), com três portas
    [[-8.5, 7], [8.5, 7], [-3.2, 4], [3.2, 4]].forEach(([x, w]) => sin.add(caixa(w === 7 ? 7 : 3, 7, 0.7, calcario, x, 4.7, 9)));
    sin.add(caixa(24.4, 1.4, 0.8, calcario, 0, 8.9, 9));
    for (let i = 0; i < 7; i++) { sin.add(cil(0.35, 0.35, 6, calcario, -9 + i * 3, 4.2, -5.5, 12)); sin.add(cil(0.35, 0.35, 6, calcario, -9 + i * 3, 4.2, 5.5, 12)); }
    const tetoS = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 13.5, 3, 4, 1), new THREE.MeshStandardMaterial({ color: 0x9c6b4a, roughness: 0.9 })); tetoS.rotation.y = Math.PI / 4; tetoS.scale.set(1.3, 1, 0.98); tetoS.position.y = 9.8; sin.add(tetoS); telhados.push(tetoS);
    sin.position.set(-26, 0, -12); cena.add(sombra(sin));

    // o barco da Galileia: casco de madeira, mastro, vela e remos
    const barco = new THREE.Group();
    const casco = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 12, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), madeira); casco.material = madeira.clone(); casco.material.side = THREE.DoubleSide;
    casco.scale.set(4.1, 1.2, 1.15); barco.add(casco);
    barco.add(caixa(8, 0.12, 0.12, madeira, 0, 0, 1.12), caixa(8, 0.12, 0.12, madeira, 0, 0, -1.12));
    for (let i = -2; i <= 2; i++) barco.add(caixa(0.25, 0.08, 2.1, madeira, i * 1.4, -0.15, 0));
    barco.add(cil(0.07, 0.09, 6, madeira, 0.6, 2.8, 0, 8));
    const vela = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 3.2, 8, 8), new THREE.MeshStandardMaterial({ color: 0xe9dfc8, roughness: 1, side: THREE.DoubleSide })); vela.position.set(0.6, 3.6, 0); vela.rotation.y = Math.PI / 2; barco.add(vela);
    const velaBase = vela.geometry.attributes.position.array.slice();
    [-1, 1].forEach(s => [-1.5, 1.5].forEach(x => { const r = cil(0.04, 0.04, 3.2, madeira, x, 0, s * 1.8, 6); r.rotation.x = Math.PI / 2 - s * 0.3; barco.add(r); }));
    for (let i = 0; i < 4; i++) barco.add(pessoa(-2.2 + i * 1.4, -0.4, (i % 2 ? 0.4 : -0.4), i + 2));
    barco.position.set(8, 0, 46); cena.add(sombra(barco));

    let semTeto = false, cenaTeto = false, t0 = 0;
    return {
      aoExtra: on => { semTeto = on; telhados.forEach(t => { t.visible = !on; }); },
      aoEstacao: e => { cenaTeto = e.id === 'teto'; t0 = performance.now(); },
      animar(t, dt, reduz) {
        // maca descendo pelo buraco do teto (ciclo de 10 s na estação do paralítico)
        const s = cenaTeto ? Math.min(1, Math.max(0, (((performance.now() - t0) / 1000) % 10 - 1.5) / 6)) : 1;
        const y = 3.4 - s * 3.1; maca.position.set(0, y, 0);
        cordas.forEach(c => { const L = Math.max(0.05, 3.4 - y); c.scale.y = L; c.position.y = L / 2; });
        amigos.forEach((a, i) => { a.rotation.x = Math.sin(t * 2 + i) * 0.05; });
        if (reduz) return;
        const p = aguaGeo.attributes.position;
        for (let i = 0; i < p.count; i++) { const x = base[i * 3], z = base[i * 3 + 2]; p.setY(i, Math.sin(x * 0.05 + t * 1.2) * 0.25 + Math.cos(z * 0.07 + t) * 0.25); }
        p.needsUpdate = true; aguaGeo.computeVertexNormals();
        barco.position.y = Math.sin(t * 1.2) * 0.15 + 0.1; barco.rotation.x = Math.sin(t * 0.9) * 0.05; barco.rotation.z = Math.sin(t * 0.7) * 0.03;
        const vp = vela.geometry.attributes.position;
        for (let i = 0; i < vp.count; i++) { const x = velaBase[i * 3], yv = velaBase[i * 3 + 1]; vp.setZ(i, Math.sin((x + 1.7) / 3.4 * Math.PI) * (0.35 + Math.sin(t * 2 + yv) * 0.08)); }
        vp.needsUpdate = true;
      },
    };
  },
});
