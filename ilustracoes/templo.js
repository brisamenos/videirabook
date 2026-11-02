/* Templo de Salomão — 1Reis 6–7; 2Crônicas 3–4. 1 unidade = 1 côvado (≈ 45 cm). Fachada para o leste (x positivo). */
V3D.registrar('templo', {
  nome: 'Templo de Salomão', sub: '1Reis 6–7 · 2Crônicas 3–4 · medidas em côvados',
  ceu: 0x6e8fb0, neblina: [260, 900], sombra: 110, dist: [5, 500],
  extra: ['Abrir o telhado', 'Fechar o telhado'],
  estacoes: [
    { id: 'geral', nome: 'Visão geral', ref: '1Reis 6.1-2', titulo: 'A casa do Senhor em Jerusalém', medida: 'Casa de 60 × 20 × 30 côvados · cerca de 27 × 9 × 13,5 m',
      desc: 'Salomão começou a construção no quarto ano do seu reinado, 480 anos depois da saída do Egito, no monte Moriá. O templo seguiu a planta do tabernáculo em tamanho dobrado e levou sete anos para ficar pronto (6.38).',
      cam: [150, 85, 150], alvo: [0, 10, 0] },
    { id: 'altar', nome: 'Altar de bronze', ref: '2Crônicas 4.1; 7.1', titulo: 'O grande altar', medida: '20 × 20 × 10 côvados · cerca de 9 × 9 × 4,5 m',
      desc: 'Muito maior que o altar do tabernáculo, ficava no pátio diante da casa. Na dedicação, desceu fogo do céu e consumiu o holocausto, e a glória do Senhor encheu o templo.',
      cam: [100, 26, 40], alvo: [62, 6, 0] },
    { id: 'mar', nome: 'Mar de bronze', ref: '1Reis 7.23-26', titulo: 'O mar de metal fundido', medida: '10 côvados de diâmetro × 5 de altura · cerca de 4,5 × 2,25 m',
      desc: 'Um enorme tanque redondo de bronze, apoiado sobre doze bois, três voltados para cada ponto cardeal. Servia para os sacerdotes se lavarem (2Crônicas 4.6) e cabia cerca de 2 mil batos de água.',
      cam: [64, 14, 42], alvo: [44, 4, 24] },
    { id: 'pias', nome: 'As dez pias', ref: '1Reis 7.27-39', titulo: 'Pias sobre carrinhos de bronze', medida: 'Cada base com 4 × 4 × 3 côvados · cerca de 1,8 × 1,8 × 1,35 m',
      desc: 'Dez bacias móveis, sobre bases com rodas, cinco de cada lado da casa. Nelas eram lavadas as partes dos animais oferecidos em holocausto (2Crônicas 4.6).',
      cam: [10, 14, 52], alvo: [-12, 3, 24] },
    { id: 'colunas', nome: 'Jaquim e Boaz', ref: '1Reis 7.15-22', titulo: 'As duas colunas de bronze', medida: '18 côvados de altura e 12 de circunferência · cerca de 8 m',
      desc: 'Duas colunas de bronze ficavam à entrada do pórtico, com capitéis em forma de lírio e romãs. A da direita se chamava Jaquim, "ele estabelece", e a da esquerda Boaz, "nele há força".',
      cam: [52, 12, 14], alvo: [30, 12, 0] },
    { id: 'portico', nome: 'O pórtico', ref: '1Reis 6.3', titulo: 'O pórtico de entrada', medida: '20 côvados de largura × 10 de profundidade · cerca de 9 × 4,5 m',
      desc: 'Um salão de entrada na frente da casa, da largura do templo. Por ele se chegava às portas de cipreste do Lugar Santo, entalhadas com querubins, palmeiras e flores e cobertas de ouro (6.34-35).',
      cam: [44, 9, 9], alvo: [22, 7, 0] },
    { id: 'santo', nome: 'Lugar Santo', ref: '1Reis 6.15-22; 2Crônicas 4.7-8', titulo: 'O Lugar Santo', medida: '40 × 20 × 30 côvados · cerca de 18 × 9 × 13,5 m',
      desc: 'As paredes eram forradas de cedro e cobertas de ouro, sem nenhuma pedra à vista. Havia dez candelabros e dez mesas, cinco de cada lado, e o altar de ouro do incenso diante do Santo dos Santos.',
      cam: [6, 75, 14], alvo: [0, 0, 0], extra: true },
    { id: 'santissimo', nome: 'Santo dos Santos', ref: '1Reis 6.19-28; 8.6-11', titulo: 'O Santo dos Santos e os querubins', medida: 'Um cubo de 20 côvados · cerca de 9 m de cada lado',
      desc: 'Uma sala em forma de cubo, toda revestida de ouro puro. Dois querubins de oliveira com 10 côvados de altura abriam as asas de parede a parede, e a arca da aliança foi colocada debaixo delas. Então a nuvem encheu a casa do Senhor.',
      cam: [-24, 60, 9], alvo: [-30, 2, 0], extra: true },
    { id: 'camaras', nome: 'Câmaras laterais', ref: '1Reis 6.5-10', titulo: 'Três andares de salas ao redor', medida: 'Andares de 5, 6 e 7 côvados de largura',
      desc: 'Em volta da casa, dos lados e nos fundos, havia salas em três andares, usadas como depósitos para os utensílios e as ofertas. As pedras foram preparadas na pedreira, e não se ouviu martelo no local da obra (6.7).',
      cam: [-70, 30, 70], alvo: [-20, 10, 0] },
  ],
  montar({ THREE, cena, M, tex, caixa, cil, sombra, particulas }) {
    const pedraTex = tex(256, 256, (g, w, h) => {
      g.fillStyle = '#e1d6bd'; g.fillRect(0, 0, w, h);
      g.strokeStyle = 'rgba(120,105,80,.35)'; g.lineWidth = 2;
      for (let y = 0; y < h; y += 32) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); for (let x = (y / 32) % 2 ? 0 : 32; x < w; x += 64) { g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + 32); g.stroke(); } }
      for (let i = 0; i < 1500; i++) { g.fillStyle = 'rgba(150,135,110,.15)'; g.fillRect(Math.random() * w, Math.random() * h, 2, 2); }
    }, [6, 3]);
    const pisoTex = tex(256, 256, (g, w, h) => { g.fillStyle = '#cfc3a6'; g.fillRect(0, 0, w, h); g.strokeStyle = 'rgba(110,95,70,.35)'; for (let i = 0; i <= w; i += 32) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i, h); g.stroke(); g.beginPath(); g.moveTo(0, i); g.lineTo(w, i); g.stroke(); } }, [40, 40]);
    const pedra = new THREE.MeshStandardMaterial({ map: pedraTex, roughness: 0.9 });
    const piso = new THREE.MeshStandardMaterial({ map: pisoTex, roughness: 0.95 });
    const telhaM = new THREE.MeshStandardMaterial({ color: 0x8c6a48, roughness: 0.9 });
    const romaM = new THREE.MeshStandardMaterial({ color: 0x8e2a22, roughness: 0.6, metalness: 0.4 });

    // monte e pátio
    const monte = new THREE.Mesh(new THREE.CylinderGeometry(260, 340, 30, 40), new THREE.MeshStandardMaterial({ color: 0x9a8a6a, roughness: 1 }));
    monte.position.y = -15.2; cena.add(monte);
    const patio = new THREE.Mesh(new THREE.PlaneGeometry(190, 120), piso); patio.rotation.x = -Math.PI / 2; patio.position.set(15, 0.02, 0); patio.receiveShadow = true; cena.add(patio);
    const muro = new THREE.Group();   // três fileiras de pedra e uma de cedro (6.36)
    const muroLado = (w, x, z, rot) => { const g = new THREE.Group(); g.add(caixa(w, 3, 2, pedra, 0, 1.5, 0), caixa(w, 1, 2.2, M.cedro, 0, 3.5, 0)); g.position.set(x, 0, z); g.rotation.y = rot; return g; };
    muro.add(muroLado(190, 15, -60, 0), muroLado(190, 15, 60, 0), muroLado(120, -80, 0, Math.PI / 2), muroLado(48, 110, -36, Math.PI / 2), muroLado(48, 110, 36, Math.PI / 2));
    cena.add(sombra(muro));
    for (let i = 0; i < 40; i++) { const a = i / 40 * Math.PI * 2, r = 300 + Math.random() * 60; const o = new THREE.Mesh(new THREE.SphereGeometry(6 + Math.random() * 6, 8, 6), new THREE.MeshStandardMaterial({ color: 0x5d6b3a, roughness: 1 })); o.position.set(Math.cos(a) * r, 4, Math.sin(a) * r); o.scale.y = 1.2; cena.add(o); }

    // ── a casa: santo dos santos x -40..-20, lugar santo -20..20, pórtico 20..30
    const casa = new THREE.Group();
    casa.add(caixa(60, 30, 1.5, pedra, -10, 15, -10.75), caixa(60, 30, 1.5, pedra, -10, 15, 10.75), caixa(1.5, 30, 23, pedra, -40.75, 15, 0));
    casa.add(caixa(1.5, 30, 8, pedra, 20, 15, -7), caixa(1.5, 30, 8, pedra, 20, 15, 7), caixa(1.5, 18, 6, pedra, 20, 21, 0));   // parede com a porta
    casa.add(caixa(1.5, 30, 6, pedra, -20, 15, -7.5), caixa(1.5, 30, 6, pedra, -20, 15, 7.5), caixa(1.5, 14, 9, pedra, -20, 23, 0)); // divisória
    // forro de ouro por dentro
    casa.add(caixa(59, 29.6, 0.2, M.ouro, -10, 15, -9.9), caixa(59, 29.6, 0.2, M.ouro, -10, 15, 9.9), caixa(0.2, 29.6, 19.6, M.ouro, -39.9, 15, 0));
    casa.add(caixa(60, 0.4, 20, M.ouroEsc, -10, 0.2, 0));
    // portas de cipreste revestidas de ouro
    const portaG = new THREE.Group(); portaG.add(caixa(0.4, 12, 2.9, M.ouro, 0, 6, -1.5), caixa(0.4, 12, 2.9, M.ouro, 0, 6, 1.5)); portaG.position.set(20.9, 0, 0); casa.add(portaG);
    // pórtico
    casa.add(caixa(10, 30, 1.5, pedra, 25, 15, -10.75), caixa(10, 30, 1.5, pedra, 25, 15, 10.75), caixa(10, 4, 23, pedra, 25, 28, 0));
    casa.add(caixa(10.4, 0.6, 23, pedra, 25, 0.3, 0));
    // câmaras laterais em três andares
    const camaras = new THREE.Group();
    [[-10, -15.5, 60, 9], [-10, 15.5, 60, 9]].forEach(([x, z, w, d]) => { for (let a = 0; a < 3; a++) { camaras.add(caixa(w, 5.6, d, pedra, x, 2.8 + a * 6, z)); camaras.add(caixa(w, 0.4, d + 0.4, M.cedro, x, 5.8 + a * 6, z)); } });
    for (let a = 0; a < 3; a++) { camaras.add(caixa(9, 5.6, 40, pedra, -46, 2.8 + a * 6, 0)); camaras.add(caixa(9.4, 0.4, 40.4, M.cedro, -46, 5.8 + a * 6, 0)); }
    // janelas estreitas no alto (6.4)
    for (let x = -36; x < 18; x += 6) { casa.add(caixa(1.2, 2.5, 0.3, M.cedro, x, 25, -11.6)); casa.add(caixa(1.2, 2.5, 0.3, M.cedro, x, 25, 11.6)); }
    cena.add(sombra(casa)); cena.add(sombra(camaras));
    const telhado = new THREE.Group();
    telhado.add(caixa(72, 1.4, 25, M.cedro, -8, 30.7, 0), caixa(73, 0.6, 26, telhaM, -8, 31.6, 0));
    for (let x = -42; x < 30; x += 2.2) telhado.add(caixa(1, 1, 1, pedra, x, 32.4, -12.6), caixa(1, 1, 1, pedra, x, 32.4, 12.6));
    cena.add(sombra(telhado));

    // colunas Jaquim (sul, à direita de quem olha para o leste) e Boaz (norte)
    const coluna = z => {
      const g = new THREE.Group();
      g.add(cil(2.2, 2.4, 1.2, M.bronze, 0, 0.6, 0, 24), cil(1.9, 1.9, 18, M.bronze, 0, 10, 0, 24));
      const cap = new THREE.Mesh(new THREE.SphereGeometry(2.6, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.62), M.bronze); cap.rotation.x = Math.PI; cap.position.y = 21.6; g.add(cap);
      g.add(cil(2.4, 1.9, 2.4, M.bronze, 0, 20.2, 0, 24));
      const lirio = new THREE.Mesh(new THREE.ConeGeometry(2.4, 2.2, 12, 1, true), M.ouroEsc); lirio.rotation.x = Math.PI; lirio.position.y = 23.3; g.add(lirio);
      for (let f = 0; f < 2; f++) for (let i = 0; i < 20; i++) { const a = i / 20 * Math.PI * 2; const r = new THREE.Mesh(new THREE.SphereGeometry(0.28, 8, 6), romaM); r.position.set(Math.cos(a) * 2.5, 19.4 + f * 1.1, Math.sin(a) * 2.5); g.add(r); }
      g.position.set(32, 0, z); return g;
    };
    cena.add(sombra(coluna(6)), sombra(coluna(-6)));

    // altar de bronze 20 × 20 × 10, com rampa
    const altar = new THREE.Group();
    altar.add(caixa(20, 7, 20, M.bronze, 0, 3.5, 0), caixa(17, 3, 17, M.bronze, 0, 8.5, 0));
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([a, b]) => { const c = new THREE.Mesh(new THREE.ConeGeometry(0.8, 1.8, 8), M.bronze); c.position.set(a * 7.8, 10.9, b * 7.8); altar.add(c); });
    const rampa = caixa(6, 1, 22, pedra, 0, 5, 18); rampa.rotation.x = 0.43; altar.add(rampa);
    altar.position.set(62, 0, 0); cena.add(sombra(altar));
    const fogo = particulas(110, 0xff7a2a, 2.2, 0.9); cena.add(fogo);
    const fumaca = particulas(60, 0x9a948a, 5, 0.22, true); cena.add(fumaca);
    const brasa = new THREE.PointLight(0xff8a3a, 2, 45, 2); brasa.position.set(62, 13, 0); cena.add(brasa);

    // mar de bronze sobre doze bois, no canto sudeste
    const mar = new THREE.Group();
    const bacia = new THREE.Mesh(new THREE.CylinderGeometry(5, 4.2, 5, 40, 1, true), M.bronze); bacia.material.side = THREE.DoubleSide; bacia.position.y = 6.5; mar.add(bacia);
    mar.add(cil(4.2, 4.2, 0.4, M.bronze, 0, 4.2, 0, 40));
    const borda = new THREE.Mesh(new THREE.TorusGeometry(5.05, 0.25, 8, 48), M.bronze); borda.rotation.x = Math.PI / 2; borda.position.y = 9; mar.add(borda);
    mar.add(cil(4.8, 4.8, 0.05, new THREE.MeshStandardMaterial({ color: 0x5d8fb0, roughness: 0.1, metalness: 0.2 }), 0, 8.6, 0, 40));
    const boi = () => { const b = new THREE.Group(); b.add(caixa(3, 1.8, 1.4, M.bronze, 0, 2.6, 0)); const c = caixa(1, 1, 1, M.bronze, 1.9, 3.1, 0); b.add(c); [[-1.1, -0.5], [1.1, -0.5], [-1.1, 0.5], [1.1, 0.5]].forEach(([x, z]) => b.add(caixa(0.4, 1.8, 0.4, M.bronze, x, 0.9, z))); return b; };
    for (let d = 0; d < 4; d++) for (let k = -1; k <= 1; k++) { const b = boi(); const a = d * Math.PI / 2 + k * 0.42; b.position.set(Math.cos(a) * 2.6, 0, Math.sin(a) * 2.6); b.rotation.y = -a; mar.add(b); }
    mar.position.set(44, 0, 24); cena.add(sombra(mar));

    // dez pias sobre bases com rodas
    for (let i = 0; i < 5; i++) [-1, 1].forEach(s => {
      const p = new THREE.Group();
      p.add(caixa(4, 2.4, 4, M.bronze, 0, 2.0, 0));
      [[-1.6, -2.05], [1.6, -2.05], [-1.6, 2.05], [1.6, 2.05]].forEach(([x, z]) => { const r = cil(0.75, 0.75, 0.25, M.bronze, x, 0.75, z, 16); r.rotation.x = Math.PI / 2; p.add(r); });
      const b = new THREE.Mesh(new THREE.SphereGeometry(1.9, 20, 10, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), M.bronze); b.position.y = 4.9; p.add(b);
      p.position.set(-32 + i * 10, 0, s * 24); cena.add(sombra(p));
    });

    // Lugar Santo: dez candelabros, dez mesas e o altar de ouro
    const chamas = [];
    for (let i = 0; i < 5; i++) [-1, 1].forEach(s => {
      const x = -14 + i * 7;
      const c = new THREE.Group(); c.add(cil(0.5, 0.7, 0.3, M.ouro, 0, 0.15, 0, 14), cil(0.1, 0.12, 3, M.ouro, 0, 1.6, 0, 8));
      [0.5, 0.9, 1.3].forEach(r => { const a = new THREE.Mesh(new THREE.TorusGeometry(r, 0.06, 6, 18, Math.PI), M.ouro); a.rotation.z = Math.PI; a.position.y = 3.1; c.add(a); });
      [-1.3, -0.9, -0.5, 0, 0.5, 0.9, 1.3].forEach(xx => { const f = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.25, 6), new THREE.MeshBasicMaterial({ color: 0xffc35a })); f.position.set(xx, 3.3, 0); c.add(f); chamas.push(f); });
      c.position.set(x, 0, s * 8.3); cena.add(c);
      const m = new THREE.Group(); m.add(caixa(2, 0.15, 1, M.ouro, 0, 1.5, 0)); [[-.9, -.4], [.9, -.4], [-.9, .4], [.9, .4]].forEach(([a, b]) => m.add(caixa(0.12, 1.5, 0.12, M.ouro, a, 0.75, b)));
      m.position.set(x + 3.5, 0, s * 6.5); cena.add(m);
    });
    const luzSanto = new THREE.PointLight(0xffc068, 0.9, 40, 2); luzSanto.position.set(0, 14, 0); cena.add(luzSanto);
    const incenso = new THREE.Group(); incenso.add(caixa(1, 2, 1, M.ouro, 0, 1, 0)); incenso.position.set(-17, 0, 0); cena.add(incenso);

    // Santo dos Santos: dois querubins de 10 côvados, asas de parede a parede, e a arca debaixo delas
    const querubim = z => {
      const q = new THREE.Group();
      q.add(cil(1.2, 1.8, 6, M.ouro, 0, 3, 0, 16));
      const cab = new THREE.Mesh(new THREE.SphereGeometry(1.1, 16, 12), M.ouro); cab.position.y = 7; q.add(cab);
      [-1, 1].forEach(s => { const asa = caixa(0.4, 2.2, 5, M.ouro, 0, 8.4, s * 2.6); asa.rotation.x = -s * 0.12; q.add(asa); });
      q.position.set(-32, 0, z); return q;
    };
    cena.add(sombra(querubim(-5)), sombra(querubim(5)));
    const arca = new THREE.Group(); arca.add(caixa(2.5, 1.5, 1.5, M.ouro, 0, 0.95, 0), caixa(2.6, 0.12, 1.6, M.ouroEsc, 0, 1.76, 0));
    arca.add(cil(0.07, 0.07, 6, M.ouro, 0, 0.6, 0.82, 8).rotateZ(Math.PI / 2), cil(0.07, 0.07, 6, M.ouro, 0, 0.6, -0.82, 8).rotateZ(Math.PI / 2));
    arca.position.set(-30, 0, 0); cena.add(sombra(arca));
    const gloria = particulas(140, 0xfff2cc, 3.2, 0.0, true); cena.add(gloria);
    const luzGloria = new THREE.PointLight(0xfff1c8, 0, 40, 2); luzGloria.position.set(-30, 10, 0); cena.add(luzGloria);

    let aberto = false;
    return {
      aoExtra: on => { aberto = on; },
      animar(t, dt, reduz) {
        telhado.position.y += ((aberto ? 40 : 0) - telhado.position.y) * Math.min(1, dt * 4);
        telhado.visible = telhado.position.y < 39;
        gloria.material.opacity += ((aberto ? 0.32 : 0) - gloria.material.opacity) * Math.min(1, dt * 2);
        luzGloria.intensity = gloria.material.opacity * 4;
        if (reduz) return;
        const pf = fogo.geometry.attributes.position, vf = fogo.userData.vida;
        for (let i = 0; i < vf.length; i++) { vf[i] += dt * (0.7 + (i % 5) * 0.1); if (vf[i] > 1) vf[i] -= 1; const a = i * 2.39, r = 6 * (1 - vf[i]) * ((i % 7) / 7 + 0.3); pf.setXYZ(i, 62 + Math.cos(a) * r, 10 + vf[i] * 6, Math.sin(a) * r); }
        pf.needsUpdate = true;
        const pm = fumaca.geometry.attributes.position, vm = fumaca.userData.vida;
        for (let i = 0; i < vm.length; i++) { vm[i] += dt * 0.1; if (vm[i] > 1) vm[i] -= 1; pm.setXYZ(i, 62 + Math.sin(i * 1.7 + t * .3) * (1 + vm[i] * 6) - vm[i] * 14, 15 + vm[i] * 45, Math.cos(i * 2.3) * (1 + vm[i] * 5)); }
        pm.needsUpdate = true;
        brasa.intensity = 1.8 + Math.sin(t * 13) * 0.3;
        chamas.forEach((c, i) => { c.scale.y = 1 + Math.sin(t * 11 + i * 1.7) * 0.18; });
        const pg = gloria.geometry.attributes.position, vg = gloria.userData.vida;
        for (let i = 0; i < vg.length; i++) { vg[i] += dt * 0.05; if (vg[i] > 1) vg[i] -= 1; const a = i * 2.4 + t * 0.15; pg.setXYZ(i, -30 + Math.cos(a) * (3 + (i % 9)), 2 + vg[i] * 18, Math.sin(a) * (3 + (i % 9)) * 0.9); }
        pg.needsUpdate = true;
      },
    };
  },
});
