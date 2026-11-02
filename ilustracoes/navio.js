/* O naufrágio de Paulo — Atos 27–28. Navio cargueiro de Alexandria, de cerca de 40 m. 1 unidade = 1 m. A praia de Malta fica a leste (x positivo). */
V3D.registrar('navio', {
  nome: 'O navio de Paulo', sub: 'Atos 27–28 · um cargueiro de trigo de Alexandria',
  ceu: 0x9fbfdc, neblina: [200, 900], sombra: 60, dist: [6, 400],
  estacoes: [
    { id: 'geral', nome: 'O navio', ref: 'Atos 27.1-6,37-38', titulo: 'Um navio de Alexandria rumo à Itália', medida: '276 pessoas a bordo e carga de trigo',
      desc: 'Paulo, preso, foi enviado a Roma num navio que levava trigo do Egito, como os grandes cargueiros que abasteciam a capital do império. Naufrágios desse tipo de navio já foram achados no fundo do Mediterrâneo.',
      cam: [70, 26, 60], alvo: [0, 6, 0], estado: 'calmo' },
    { id: 'tempestade', nome: 'Euroaquilão', ref: 'Atos 27.13-20', titulo: 'O vento Euroaquilão', medida: 'Muitos dias sem ver o sol nem as estrelas',
      desc: 'Um vento violento, o Euroaquilão, desceu da ilha de Creta e arrastou o navio. Durante muitos dias não apareceram nem sol nem estrelas, e todos perderam a esperança de se salvar.',
      cam: [80, 30, 70], alvo: [0, 6, 0], estado: 'tempestade' },
    { id: 'cabos', nome: 'Cabos no casco', ref: 'Atos 27.16-17', titulo: 'Cingindo o navio com cabos', medida: 'Cabos passados por baixo do casco',
      desc: 'Os marinheiros recolheram o bote e passaram cabos por baixo do navio para segurar o casco, que ameaçava se abrir. Com medo de encalhar nos bancos de areia da Sirte, baixaram as velas e deixaram o navio à deriva.',
      cam: [26, 8, 30], alvo: [0, 3, 0], estado: 'tempestade' },
    { id: 'carga', nome: 'A carga ao mar', ref: 'Atos 27.18-19,38', titulo: 'Aliviando o navio', medida: 'Primeiro a carga, depois os equipamentos e o trigo',
      desc: 'No segundo dia jogaram a carga ao mar, no terceiro, os equipamentos do navio. Mais tarde, depois de comerem, jogaram o trigo no mar para deixar o navio mais leve.',
      cam: [-30, 18, 34], alvo: [-4, 5, 0], estado: 'tempestade' },
    { id: 'paulo', nome: 'Paulo anima a todos', ref: 'Atos 27.21-26,33-36', titulo: '"Tenham ânimo"', medida: 'Nenhuma vida se perderia, só o navio',
      desc: 'Um anjo de Deus apareceu a Paulo e lhe disse que ele compareceria diante de César e que todos seriam salvos. Paulo animou os companheiros, deu graças a Deus diante de todos, partiu o pão e começou a comer.',
      cam: [12, 10, 12], alvo: [2, 6, 0], estado: 'tempestade' },
    { id: 'ancoras', nome: 'Quatro âncoras', ref: 'Atos 27.27-32', titulo: 'Quatro âncoras pela popa', medida: 'Sondagens de 20 e depois 15 braças',
      desc: 'Na décima quarta noite, sentindo a terra perto, lançaram quatro âncoras pela popa e esperaram o dia. Alguns marinheiros tentaram fugir no bote, mas os soldados, avisados por Paulo, cortaram as cordas.',
      cam: [-40, 10, 20], alvo: [-20, 2, 0], estado: 'tempestade' },
    { id: 'encalhe', nome: 'O encalhe', ref: 'Atos 27.39-44', titulo: 'Encalhados num banco de areia', medida: 'Todos chegaram salvos à terra',
      desc: 'Tentaram levar o navio até uma praia, mas ele encalhou num banco de areia: a proa ficou presa e a popa se despedaçou com a força das ondas. Uns nadando, outros em tábuas, todos chegaram salvos à terra.',
      cam: [60, 22, 70], alvo: [40, 2, 10], estado: 'encalhe' },
    { id: 'malta', nome: 'Malta', ref: 'Atos 28.1-6', titulo: 'A ilha de Malta', medida: 'Os moradores acenderam uma fogueira',
      desc: 'Os moradores da ilha trataram os náufragos com bondade e acenderam uma fogueira por causa da chuva e do frio. Uma víbora mordeu a mão de Paulo, mas ele a sacudiu no fogo e nada sofreu.',
      cam: [118, 10, 30], alvo: [104, 3, 8], estado: 'encalhe' },
  ],
  montar({ THREE, cena, sol, tex, caixa, cil, sombra, particulas, pessoa }) {
    const madeiraTex = tex(256, 128, (g, w, h) => { g.fillStyle = '#6b4a2e'; g.fillRect(0, 0, w, h); for (let y = 0; y < h; y += 8) { g.fillStyle = `rgba(${40 + Math.random() * 30 | 0},${25 + Math.random() * 15 | 0},10,.5)`; g.fillRect(0, y, w, 1.5); } }, [6, 1]);
    const madeira = new THREE.MeshStandardMaterial({ map: madeiraTex, roughness: 0.85, side: THREE.DoubleSide });
    const piche = new THREE.MeshStandardMaterial({ color: 0x2a1e14, roughness: 0.7 });
    const vela = new THREE.MeshStandardMaterial({ color: 0xe6dcc4, roughness: 1, side: THREE.DoubleSide });
    // mar
    const marGeo = new THREE.PlaneGeometry(1600, 1600, 120, 120); marGeo.rotateX(-Math.PI / 2);
    const marBase = marGeo.attributes.position.array.slice();
    const mar = new THREE.Mesh(marGeo, new THREE.MeshStandardMaterial({ color: 0x2f6a86, roughness: 0.3, metalness: 0.15, flatShading: true })); cena.add(mar);
    const espuma = particulas(260, 0xffffff, 1.4, 0, true); cena.add(espuma);
    // praia e ilha de Malta
    const ilha = new THREE.Group();
    const terra = new THREE.Mesh(new THREE.SphereGeometry(220, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshStandardMaterial({ color: 0x9e9268, roughness: 1 })); terra.scale.y = 0.12; terra.position.set(320, -6, 0); ilha.add(terra);
    const areia = new THREE.Mesh(new THREE.PlaneGeometry(40, 200), new THREE.MeshStandardMaterial({ color: 0xd6c49a, roughness: 1 })); areia.rotation.x = -Math.PI / 2; areia.rotation.z = 0.1; areia.position.set(108, 0.6, 0); ilha.add(areia);
    for (let i = 0; i < 30; i++) { const r = new THREE.Mesh(new THREE.DodecahedronGeometry(2 + Math.random() * 4), new THREE.MeshStandardMaterial({ color: 0x8a8070, roughness: 1, flatShading: true })); r.position.set(118 + Math.random() * 40, 1, -90 + Math.random() * 180); ilha.add(r); }
    const banco = new THREE.Mesh(new THREE.PlaneGeometry(30, 50), new THREE.MeshStandardMaterial({ color: 0xb0a582, roughness: 1, transparent: true, opacity: 0.35, depthWrite: false })); banco.rotation.x = -Math.PI / 2; banco.position.set(48, -0.2, 10); ilha.add(banco);
    cena.add(sombra(ilha));
    // fogueira e moradores
    const fogueira = particulas(60, 0xff8a2a, 0.9, 0.9); cena.add(fogueira);
    const luzFog = new THREE.PointLight(0xff9a40, 1.6, 30, 2); luzFog.position.set(104, 2.5, 8); cena.add(luzFog);
    const roda = new THREE.Group(); for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; const p = pessoa([0x6a5a4a, 0x8b5e3c, 0x5b4a6a, 0xa58d68][i % 4], { i }); p.position.set(104 + Math.cos(a) * 3.2, 0.6, 8 + Math.sin(a) * 3.2); p.rotation.y = -a - Math.PI / 2; roda.add(p); }
    cena.add(sombra(roda));

    // o navio
    const navio = new THREE.Group();
    const cascoGeo = new THREE.SphereGeometry(1, 40, 16, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2);
    const casco = new THREE.Mesh(cascoGeo, madeira); casco.scale.set(20, 6, 6.2); navio.add(casco);
    const faixa = new THREE.Mesh(new THREE.TorusGeometry(1, 0.012, 6, 60), piche); faixa.rotation.x = Math.PI / 2; faixa.scale.set(20, 6.2, 1); faixa.position.y = -0.05; navio.add(faixa);
    const conves = new THREE.Mesh(new THREE.CircleGeometry(1, 40), madeira); conves.rotation.x = -Math.PI / 2; conves.scale.set(19.6, 5.9, 1); conves.position.y = 0.2; navio.add(conves);
    // popa curva com pescoço de ganso (enfeite comum desses navios) e proa
    const popa = new THREE.Group();
    const curva = new THREE.Mesh(new THREE.TorusGeometry(3, 0.5, 8, 16, Math.PI * 0.9), madeira); curva.position.set(-18, 2.5, 0); curva.rotation.z = Math.PI * 0.05; popa.add(curva);
    popa.add(caixa(6, 2.4, 9, madeira, -16, 1.4, 0));
    [-1, 1].forEach(s => { const leme = caixa(0.4, 7, 1.2, madeira, -16.5, -1, s * 5.4); leme.rotation.z = 0.5; popa.add(leme); });
    navio.add(popa);
    const proa = new THREE.Mesh(new THREE.ConeGeometry(0.5, 6, 8), madeira); proa.rotation.z = -Math.PI / 2.6; proa.position.set(21, 2.5, 0); navio.add(proa);
    // mastro principal com vela quadrada e o artemão à proa
    navio.add(cil(0.4, 0.5, 22, madeira, 2, 11, 0, 10), caixa(0.4, 0.4, 18, madeira, 2, 19, 0));
    const velaGeo = new THREE.PlaneGeometry(16, 12, 10, 8); const velaBase = velaGeo.attributes.position.array.slice();
    const velaM = new THREE.Mesh(velaGeo, vela); velaM.rotation.y = Math.PI / 2; velaM.position.set(2.5, 12.8, 0); navio.add(velaM);
    const artemao = cil(0.2, 0.25, 9, madeira, 16, 5, 0, 8); artemao.rotation.z = -0.6; navio.add(artemao);
    const velinha = new THREE.Mesh(new THREE.PlaneGeometry(4, 3), vela); velinha.rotation.y = Math.PI / 2; velinha.position.set(18.3, 8, 0); navio.add(velinha);
    // carga: sacos e ânforas de trigo
    const saco = new THREE.MeshStandardMaterial({ color: 0xc9a86a, roughness: 1 }), anf = new THREE.MeshStandardMaterial({ color: 0xb4774a, roughness: 0.9 });
    const carga = new THREE.Group();
    for (let i = 0; i < 24; i++) carga.add(caixa(1.2, 0.6, 0.9, saco, -10 + (i % 8) * 1.4, 0.55 + Math.floor(i / 8) * 0.6, -1.5 + (i % 3)));
    for (let i = 0; i < 12; i++) { const a = new THREE.Mesh(new THREE.SphereGeometry(0.35, 10, 8), anf); a.scale.y = 1.8; a.position.set(6 + (i % 6) * 1.1, 0.8, -1 + Math.floor(i / 6) * 2); carga.add(a); }
    navio.add(carga);
    // cabos em volta do casco (Atos 27.17)
    const cabos = new THREE.Group(); [-8, -2, 4, 10].forEach(x => { const c = new THREE.Mesh(new THREE.TorusGeometry(1, 0.025, 6, 40), new THREE.MeshStandardMaterial({ color: 0xc9b07a })); c.scale.set(1, 6.1, 6.1); c.rotation.y = Math.PI / 2; c.position.x = x; cabos.add(c); });
    cabos.visible = false; navio.add(cabos);
    // pessoas a bordo e Paulo
    const tripulacao = new THREE.Group();
    for (let i = 0; i < 26; i++) { const p = pessoa([0x8b5e3c, 0x6f7f5a, 0xa58d68, 0x5b4a6a, 0x7a2a2a][i % 5], { i }); p.position.set(-12 + Math.random() * 24, 0.2, -3.5 + Math.random() * 7); tripulacao.add(p); }
    const paulo = pessoa(0x4a3a5a, { i: 0, manto: 0x7a5a3a }); paulo.position.set(2, 0.2, 2); paulo.scale.setScalar(1.05); tripulacao.add(paulo);
    navio.add(tripulacao);
    cena.add(sombra(navio));
    // bote rebocado e âncoras
    const bote = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 8, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), madeira); bote.scale.set(3, 1, 1.3); cena.add(sombra(bote));
    const ancoras = []; for (let i = 0; i < 4; i++) { const l = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]), new THREE.LineBasicMaterial({ color: 0xc9b07a })); l.frustumCulled = false; cena.add(l); ancoras.push(l); }
    // destroços da popa e náufragos nadando (no encalhe)
    const destrocos = new THREE.Group(); for (let i = 0; i < 26; i++) { const t = caixa(2 + Math.random() * 3, 0.3, 0.6, madeira, 0, 0, 0); t.userData = { x: 14 + Math.random() * 40, z: -10 + Math.random() * 40, f: Math.random() * 7 }; destrocos.add(t); } destrocos.visible = false; cena.add(destrocos);
    const nadadores = []; for (let i = 0; i < 14; i++) { const p = pessoa([0x8b5e3c, 0x6f7f5a, 0xa58d68][i % 3], { i }); p.userData = { s: Math.random(), z: -6 + Math.random() * 30 }; p.visible = false; cena.add(p); nadadores.push(p); }
    // chuva e relâmpago
    const N = 2200, chuvaGeo = new THREE.BufferGeometry(), cp = new Float32Array(N * 6);
    for (let i = 0; i < N; i++) { const x = (Math.random() - .5) * 300, y = Math.random() * 120, z = (Math.random() - .5) * 300; cp.set([x, y, z, x - 3, y - 6, z], i * 6); }
    chuvaGeo.setAttribute('position', new THREE.BufferAttribute(cp, 3));
    const chuva = new THREE.LineSegments(chuvaGeo, new THREE.LineBasicMaterial({ color: 0xaab8c6, transparent: true, opacity: 0.45 })); chuva.frustumCulled = false; cena.add(chuva);
    const relampago = new THREE.AmbientLight(0xdfe8ff, 0); cena.add(relampago);

    const CEU = { calmo: new THREE.Color(0x9fbfdc), tempestade: new THREE.Color(0x2e3640), encalhe: new THREE.Color(0x6f7f8e) };
    let estado = 'calmo', proxRaio = 2;
    const onda = (x, z, t, amp) => Math.sin(x * 0.045 + t * 1.3) * amp + Math.cos(z * 0.06 + t * 1.05) * amp * 0.8 + Math.sin((x + z) * 0.11 + t * 2) * amp * 0.25;
    return {
      aoEstacao: e => {
        estado = e.estado || 'calmo';
        cabos.visible = e.id === 'cabos' || estado !== 'calmo';
        carga.visible = !(e.id === 'carga' || e.id === 'paulo' || e.id === 'ancoras' || estado === 'encalhe');
        destrocos.visible = estado === 'encalhe'; nadadores.forEach(n => { n.visible = estado === 'encalhe'; });
        popa.visible = estado !== 'encalhe'; velaM.visible = estado === 'calmo'; bote.visible = estado !== 'encalhe'; banco.visible = estado === 'encalhe';
      },
      animar(t, dt, reduz) {
        const k = Math.min(1, dt * 1.2);
        cena.background.lerp(CEU[estado], k); cena.fog.color.copy(cena.background);
        sol.intensity += ((estado === 'tempestade' ? 0.2 : estado === 'encalhe' ? 0.7 : 1.25) - sol.intensity) * k;
        chuva.visible = estado !== 'calmo';
        const amp = reduz ? 0.2 : (estado === 'tempestade' ? 2.6 : estado === 'encalhe' ? 1.1 : 0.5);
        const p = marGeo.attributes.position;
        for (let i = 0; i < p.count; i++) { const x = marBase[i * 3], z = marBase[i * 3 + 2]; p.setY(i, onda(x, z, t, amp) * (x > 60 ? Math.max(0.2, 1 - (x - 60) / 60) : 1)); }
        p.needsUpdate = true; marGeo.computeVertexNormals();
        if (estado === 'encalhe') {
          navio.position.set(40, 1.2, 10); navio.rotation.set(0.05, 0.25, -0.09);
        } else {
          const h0 = onda(0, 0, t, amp), hf = onda(18, 0, t, amp), hl = onda(0, 5, t, amp);
          navio.position.set(0, h0 + 1.4, 0); navio.rotation.z = Math.atan2(hf - h0, 18) * 0.9; navio.rotation.x = Math.atan2(hl - h0, 5) * 0.7; navio.rotation.y = 0;
        }
        bote.position.set(navio.position.x - 34, onda(-34, 4, t, amp) + 0.4, navio.position.z + 4);
        const ver = estado === 'tempestade' && !reduz;
        ancoras.forEach((l, i) => { l.visible = ver; const a = l.geometry.attributes.position; a.setXYZ(0, -18 + navio.position.x, navio.position.y + 1, -2 + i * 1.4); a.setXYZ(1, -60, -20, -10 + i * 7); a.needsUpdate = true; });
        if (reduz) return;
        if (chuva.visible) { const c = chuvaGeo.attributes.position.array; for (let i = 0; i < N; i++) { let y = c[i * 6 + 1] - dt * 90; let x = c[i * 6] - dt * 40; if (y < 0) { y += 120; x += 60; } if (x < -150) x += 300; c[i * 6] = x; c[i * 6 + 1] = y; c[i * 6 + 3] = x - 3; c[i * 6 + 4] = y - 6; } chuvaGeo.attributes.position.needsUpdate = true; }
        if (estado === 'tempestade') { proxRaio -= dt; if (proxRaio < 0) { relampago.intensity = 2.5; proxRaio = 3 + Math.random() * 6; } }
        relampago.intensity *= 0.85;
        const pv = velaGeo.attributes.position; for (let i = 0; i < pv.count; i++) { const x = velaBase[i * 3]; pv.setZ(i, Math.sin((x + 8) / 16 * Math.PI) * (1.8 + Math.sin(t * 1.5 + velaBase[i * 3 + 1]) * 0.2)); } pv.needsUpdate = true;
        const pe = espuma.geometry.attributes.position, ve = espuma.userData.vida; espuma.material.opacity = estado === 'calmo' ? 0.15 : 0.6;
        for (let i = 0; i < ve.length; i++) { ve[i] += dt * 0.3; if (ve[i] > 1) ve[i] -= 1; const x = (i % 20) * 12 - 120 + ve[i] * 10, z = Math.floor(i / 20) * 18 - 110; pe.setXYZ(i, x, onda(x, z, t, amp) + 0.3, z); }
        pe.needsUpdate = true;
        if (destrocos.visible) destrocos.children.forEach(d => { const u = d.userData; d.position.set(u.x, onda(u.x, u.z, t, amp) + 0.2, u.z); d.rotation.set(Math.sin(t + u.f) * 0.2, u.f, Math.cos(t + u.f) * 0.2); });
        nadadores.forEach(n => { if (!n.visible) return; const s = (n.userData.s + t * 0.03) % 1; const x = 46 + s * 56; n.position.set(x, onda(x, n.userData.z, t, amp) - 1.1 + (s > 0.92 ? (s - 0.92) * 20 : 0), n.userData.z); });
        const pf = fogueira.geometry.attributes.position, vf = fogueira.userData.vida; for (let i = 0; i < vf.length; i++) { vf[i] += dt * 1.1; if (vf[i] > 1) vf[i] -= 1; const a = i * 2.4, r = 0.7 * (1 - vf[i]); pf.setXYZ(i, 104 + Math.cos(a) * r, 0.8 + vf[i] * 2, 8 + Math.sin(a) * r); } pf.needsUpdate = true;
        luzFog.intensity = 1.5 + Math.sin(t * 11) * 0.25;
      },
    };
  },
});
