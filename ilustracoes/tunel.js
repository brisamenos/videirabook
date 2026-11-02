/* Túnel de Ezequias — 2Reis 20.20; 2Crônicas 32.2-4,30. 1 unidade ≈ 5 m. Norte = z negativo. Altura do túnel exagerada para ser vista. */
V3D.registrar('tunel', {
  nome: 'Túnel de Ezequias', sub: 'Cidade de Davi, Jerusalém · cerca de 701 a.C.',
  ceu: 0x86a9c9, neblina: [200, 700], sombra: 90, dist: [1, 400],
  extra: ['Ver dentro da rocha', 'Esconder a rocha'],
  estacoes: [
    { id: 'geral', nome: 'Visão geral', ref: '2Reis 20.20', titulo: 'A água levada para dentro da cidade', medida: 'Cerca de 533 m de túnel escavado na rocha',
      desc: 'A única fonte permanente de Jerusalém, a fonte de Giom, ficava fora da muralha, no vale do Cedrom. O rei Ezequias mandou abrir um túnel por dentro do monte para levar a água até o tanque de Siloé, dentro da cidade.',
      cam: [120, 80, 90], alvo: [8, 4, 4], extra: true },
    { id: 'assiria', nome: 'A ameaça assíria', ref: '2Crônicas 32.1-5', titulo: 'Preparando a cidade para o cerco', medida: 'Campanha de Senaqueribe em 701 a.C.',
      desc: 'Quando Senaqueribe, rei da Assíria, invadiu Judá, Ezequias tapou as fontes de fora da cidade, dizendo: "Por que os reis da Assíria haveriam de encontrar água em abundância?" E reforçou as muralhas.',
      cam: [150, 45, -80], alvo: [30, 4, -25] },
    { id: 'giom', nome: 'Fonte de Giom', ref: '1Reis 1.33-39; 2Crônicas 32.30', titulo: 'A fonte de Giom', medida: 'No vale do Cedrom, ao pé do monte',
      desc: 'A fonte jorra em intervalos, o que explica seu nome, que lembra "jorrar". Foi ali que Salomão foi ungido rei. Ezequias "tapou o manancial superior das águas de Giom e as fez correr para o lado ocidental da Cidade de Davi".',
      cam: [52, 12, -40], alvo: [36, 2, -30], extra: true },
    { id: 'tunel', nome: 'Por dentro', ref: '2Crônicas 32.30', titulo: 'Um túnel em curva de S', medida: 'Cerca de 60 cm de largura; a altura varia de pouco mais de 1 m a mais de 3 m',
      desc: 'O túnel não segue em linha reta: faz curvas largas em forma de S. Hoje ainda dá para atravessá-lo a pé, com água pelas canelas, do Giom até Siloé.',
      cam: [19, 3, -33], alvo: [10, 1.5, -24], extra: true },
    { id: 'encontro', nome: 'O encontro', ref: '2Reis 20.20', titulo: 'Duas equipes, uma de cada lado', medida: 'Encontro perto do meio do caminho',
      desc: 'Os escavadores começaram ao mesmo tempo nas duas pontas e cavaram um na direção do outro, guiados pelo som das picaretas. As luzes mostram as duas frentes de trabalho até se encontrarem.',
      cam: [30, 30, 30], alvo: [6, 2, 2], extra: true },
    { id: 'inscricao', nome: 'A inscrição', ref: '2Reis 20.20', titulo: 'A inscrição de Siloé', medida: 'Achada em 1880, perto da saída do túnel',
      desc: 'Uma placa gravada na parede conta que, "enquanto ainda havia três côvados para cavar, ouviu-se a voz de um homem chamando o outro", e que os escavadores se encontraram picareta contra picareta. A água então correu por 1.200 côvados.',
      cam: [-4, 8, 42], alvo: [-12, 2, 33], extra: true },
    { id: 'siloe', nome: 'Tanque de Siloé', ref: 'João 9.7; Isaías 22.11', titulo: 'O tanque de Siloé', medida: 'Escavado em 2004, com degraus de pedra',
      desc: 'A água do Giom chegava ao tanque de Siloé, no sul da cidade. Séculos depois, Jesus mandou o cego de nascença se lavar ali. Em 2004, operários reparando um cano encontraram os degraus do tanque da época de Jesus.',
      cam: [-2, 14, 66], alvo: [-20, 0, 46] },
  ],
  montar({ THREE, cena, M, tex, caixa, cil, sombra, particulas }) {
    const altura = (x, z) => { // cume da Cidade de Davi correndo de norte a sul, vale do Cedrom a leste
      const cume = 16 * Math.exp(-(((x - 4) / 17) ** 2));
      const sul = z > 30 ? Math.max(0, 1 - (z - 30) / 22) : 1;
      const tanque = Math.hypot(x + 21, z - 47) < 13 ? Math.max(0, 1 - Math.hypot(x + 21, z - 47) / 13) : 0;
      if (Math.abs(x + 21) < 9 && Math.abs(z - 47) < 6) return -1.2;   // a cavidade do tanque
      return (1 + cume * sul) * (1 - tanque) + 0.2 * tanque;
    };
    const geo = new THREE.PlaneGeometry(400, 400, 160, 160); geo.rotateX(-Math.PI / 2);
    const p = geo.attributes.position; for (let i = 0; i < p.count; i++) p.setY(i, altura(p.getX(i), p.getZ(i)) - (Math.abs(p.getX(i) - 36) < 4 ? 0.6 : 0));
    geo.computeVertexNormals();
    const rochaTex = tex(256, 256, (g, w, h) => { g.fillStyle = '#b8a27a'; g.fillRect(0, 0, w, h); for (let i = 0; i < 6000; i++) { const v = Math.random(); g.fillStyle = v > .5 ? 'rgba(120,105,75,.35)' : 'rgba(210,195,160,.3)'; g.fillRect(Math.random() * w, Math.random() * h, 2, 2); } }, [40, 40]);
    const terraM = new THREE.MeshStandardMaterial({ map: rochaTex, roughness: 1, transparent: true, opacity: 1 });
    const terra = new THREE.Mesh(geo, terraM); terra.receiveShadow = true; cena.add(terra);

    // casas e muralha no alto do monte
    const casaM = [0xd9caa8, 0xcdbb95, 0xe3d6ba].map(c => new THREE.MeshStandardMaterial({ color: c, roughness: 0.95, transparent: true }));
    const casas = new THREE.Group();
    for (let i = 0; i < 160; i++) { const x = -10 + Math.random() * 28, z = -45 + Math.random() * 80; const h = altura(x, z); if (h < 9) continue; const w = 2 + Math.random() * 2; const a = 1.5 + Math.random() * 1.5; casas.add(caixa(w, a, w, casaM[i % 3], x, h + a / 2 - 0.2, z)); }
    cena.add(sombra(casas));
    const muroM = new THREE.MeshStandardMaterial({ color: 0xcbbd9d, roughness: 0.95, transparent: true });
    const muro = new THREE.Group();
    for (let z = -50; z < 40; z += 3) { const x = 22 - (z > 20 ? (z - 20) * 0.8 : 0); muro.add(caixa(1.6, 4, 3.2, muroM, x, altura(x, z) + 1.5, z)); }
    cena.add(sombra(muro));

    // o túnel: curva em S do Giom (leste) até Siloé (sudoeste)
    const pts = [[36, -30], [26, -36], [14, -30], [9, -18], [15, -8], [6, 4], [-6, 6], [-5, 18], [-13, 28], [-17, 38], [-19, 44]].map(([x, z], i, a) => new THREE.Vector3(x, 1.8 - i / (a.length - 1) * 0.4, z));
    const curva = new THREE.CatmullRomCurve3(pts, false, 'catmullrom', 0.4);
    const tuboGeo = new THREE.TubeGeometry(curva, 300, 0.7, 10, false);
    const tunel = new THREE.Mesh(tuboGeo, new THREE.MeshStandardMaterial({ color: 0x6e5a3e, roughness: 1, side: THREE.DoubleSide, emissive: 0x2a1d10, emissiveIntensity: 0.5 }));
    cena.add(tunel);
    const fio = new THREE.Mesh(new THREE.TubeGeometry(curva, 300, 0.32, 8, false), new THREE.MeshStandardMaterial({ color: 0x4f9ec4, emissive: 0x1f5f80, emissiveIntensity: 0.7, roughness: 0.2 }));
    fio.position.y = -0.35; cena.add(fio);
    const agua = particulas(220, 0x9fe0ff, 0.7, 0.9); cena.add(agua);

    // fonte de Giom: gruta e água jorrando
    const gruta = new THREE.Mesh(new THREE.SphereGeometry(3, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshStandardMaterial({ color: 0x7d6a4c, roughness: 1, side: THREE.DoubleSide }));
    gruta.position.set(37, 0.8, -30); cena.add(gruta);
    const poca = cil(2.4, 2.4, 0.2, new THREE.MeshStandardMaterial({ color: 0x4f86a6, roughness: 0.1, metalness: 0.2 }), 37, 1.0, -30, 24); cena.add(poca);
    const jorro = particulas(70, 0xbfeaff, 0.6, 0.8); cena.add(jorro);

    // tanque de Siloé com degraus
    const siloe = new THREE.Group(); const pedra = new THREE.MeshStandardMaterial({ color: 0xd8cbb0, roughness: 0.95 });
    // degraus descendo em volta, como molduras cada vez menores e mais baixas, e a água no fundo
    for (let i = 0; i < 5; i++) { const w = 16 - i * 2, d = 10 - i * 2, y = 0.5 - i * 0.3;
      siloe.add(caixa(w, 0.3, 1, pedra, 0, y, -d / 2 + 0.5), caixa(w, 0.3, 1, pedra, 0, y, d / 2 - 0.5), caixa(1, 0.3, d, pedra, -w / 2 + 0.5, y, 0), caixa(1, 0.3, d, pedra, w / 2 - 0.5, y, 0)); }
    siloe.add(caixa(6, 0.1, 2, new THREE.MeshStandardMaterial({ color: 0x4f86a6, roughness: 0.1, metalness: 0.2 }), 0, -0.85, 0));
    siloe.position.set(-21, 0.4, 47); cena.add(sombra(siloe));

    // inscrição: placa na parede perto da saída
    const placa = caixa(1.2, 0.7, 0.12, new THREE.MeshStandardMaterial({ color: 0xe8dcc0, emissive: 0x6a5a3a, emissiveIntensity: 0.4 }), 0, 0, 0);
    const pi = curva.getPointAt(0.9), ti = curva.getTangentAt(0.9);
    placa.position.copy(pi).add(new THREE.Vector3(-ti.z, 0.5, ti.x).multiplyScalar(0.62)); placa.lookAt(pi.x, pi.y + 0.5, pi.z); cena.add(placa);

    // acampamento assírio no monte em frente
    const tendas = new THREE.Group(); const lona = new THREE.MeshStandardMaterial({ color: 0x8a6f4c, roughness: 1 });
    for (let i = 0; i < 40; i++) { const t = new THREE.Mesh(new THREE.ConeGeometry(1.4, 2, 4), lona); t.position.set(80 + Math.random() * 40, 1.8, -70 + Math.random() * 60); t.rotation.y = Math.random(); tendas.add(t); }
    cena.add(sombra(tendas));

    // as duas frentes de escavação (luzes de lamparina)
    const lampM = new THREE.MeshBasicMaterial({ color: 0xffc35a });
    const equipe = () => { const g = new THREE.Group(); g.add(new THREE.Mesh(new THREE.SphereGeometry(0.35, 10, 8), lampM)); const l = new THREE.PointLight(0xffb44a, 2.2, 14, 2); g.add(l); return g; };
    const eqA = equipe(), eqB = equipe(); cena.add(eqA, eqB); eqA.visible = eqB.visible = false;
    let encontro = false, t0 = 0, dentro = false;
    const objsTransp = [terraM, muroM, ...casaM];
    return {
      aoExtra: on => { dentro = on; },
      aoEstacao: e => { encontro = e.id === 'encontro'; t0 = performance.now(); eqA.visible = eqB.visible = encontro; },
      animar(t, dt, reduz) {
        const k = Math.min(1, dt * 3);
        objsTransp.forEach(m => { m.opacity += ((dentro ? 0.28 : 1) - m.opacity) * k; m.depthWrite = m.opacity > 0.95; });
        if (encontro) { // cada equipe anda da sua ponta até o ponto de encontro (cerca de 0,52 do caminho), depois recomeça
          const s = Math.min(1, ((performance.now() - t0) / 1000 % 9) / 7);
          eqA.position.copy(curva.getPointAt(s * 0.52)); eqB.position.copy(curva.getPointAt(1 - s * 0.48));
        }
        if (reduz) return;
        const pa = agua.geometry.attributes.position, va = agua.userData.vida;
        for (let i = 0; i < va.length; i++) { va[i] += dt * 0.05; if (va[i] > 1) va[i] -= 1; const q = curva.getPointAt(va[i]); pa.setXYZ(i, q.x, q.y - 0.3, q.z); }
        pa.needsUpdate = true;
        const pj = jorro.geometry.attributes.position, vj = jorro.userData.vida;
        const pulso = 0.6 + 0.4 * Math.max(0, Math.sin(t * 0.8));
        for (let i = 0; i < vj.length; i++) { vj[i] += dt * 1.2; if (vj[i] > 1) vj[i] -= 1; const a = i * 2.4, r = vj[i] * 1.6; pj.setXYZ(i, 37 + Math.cos(a) * r, 1.1 + Math.sin(vj[i] * Math.PI) * 1.4 * pulso, -30 + Math.sin(a) * r); }
        pj.needsUpdate = true;
      },
    };
  },
});
