/* Sepulcro judaico do século 1, com pedra que rola. 1 unidade = 1 m. A entrada fica voltada para z positivo. */
V3D.registrar('sepulcro', {
  nome: 'Sepulcro do século 1', sub: 'Túmulo escavado na rocha, como os achados em volta de Jerusalém',
  ceu: 0x9cb8d0, neblina: [60, 240], sombra: 30, dist: [1.2, 120],
  extra: ['Ver por dentro da rocha', 'Fechar a rocha'],
  estacoes: [
    { id: 'geral', nome: 'O jardim', ref: 'João 19.41-42', titulo: 'Um sepulcro novo num jardim', medida: 'Túmulos de família escavados na rocha',
      desc: 'No lugar onde Jesus foi crucificado havia um jardim, e nele um sepulcro novo, onde ninguém tinha sido posto. Centenas de túmulos desse tipo foram encontrados nas encostas em volta de Jerusalém.',
      cam: [16, 9, 20], alvo: [0, 2, 0] },
    { id: 'pedra', nome: 'A pedra', ref: 'Mateus 27.60; Marcos 16.3-4', titulo: 'A grande pedra que rola', medida: 'Disco de pedra de cerca de 1,2 a 1,8 m',
      desc: 'José de Arimateia rolou uma grande pedra para fechar a entrada. Ela corria num canal escavado na frente do túmulo. As mulheres se perguntavam quem a removeria, mas a encontraram já rolada. A animação mostra a pedra rolando.',
      cam: [5, 2.6, 7], alvo: [0.5, 1.2, 1.6] },
    { id: 'entrada', nome: 'A entrada', ref: 'João 20.5,11', titulo: 'Uma entrada baixa', medida: 'Cerca de 1 m de altura',
      desc: 'A abertura era tão baixa que era preciso se abaixar para olhar ou entrar. Por isso o texto diz que João "se abaixou e viu os lençóis" e que Maria "se abaixou e olhou para dentro do túmulo".',
      cam: [0.3, 1.1, 3.6], alvo: [0, 0.8, -1] },
    { id: 'camara', nome: 'A câmara', ref: 'Marcos 16.5', titulo: 'A câmara e os bancos', medida: 'Sala de cerca de 3 × 3 m',
      desc: 'Por dentro, a sala tinha bancos escavados na rocha onde o corpo era deitado, e nichos estreitos nas paredes para outros membros da família. As mulheres viram um jovem vestido de branco sentado à direita.',
      cam: [2.6, 3.4, 3.2], alvo: [0, 0.6, -2.6], extra: true },
    { id: 'lencois', nome: 'Os lençóis', ref: 'João 20.6-8', titulo: 'Os lençóis e o lenço', medida: 'O lenço dobrado à parte',
      desc: 'Pedro entrou e viu os lençóis de linho no lugar, e o lenço que estivera sobre a cabeça de Jesus dobrado num lugar à parte. Então o outro discípulo também entrou, viu e creu.',
      cam: [0.5, 1.6, -1.9], alvo: [-1.2, 0.6, -3.7], extra: true },
    { id: 'ossuarios', nome: 'Os ossuários', ref: 'Mateus 23.27', titulo: 'Os ossuários', medida: 'Caixas de pedra de cerca de 60 cm',
      desc: 'Depois de cerca de um ano, os ossos eram recolhidos e guardados em caixas de pedra, os ossuários, muitas vezes com o nome do falecido. Um desses foi o ossuário de Caifás. Os túmulos eram caiados para serem vistos e evitados.',
      cam: [2.4, 1.8, -0.8], alvo: [1.4, 0.7, -3.6], extra: true },
  ],
  montar({ THREE, cena, tex, caixa, cil, sombra }) {
    const rochaTex = tex(256, 256, (g, w, h) => { g.fillStyle = '#c4b18c'; g.fillRect(0, 0, w, h); for (let i = 0; i < 7000; i++) { const v = Math.random(); g.fillStyle = v > .5 ? 'rgba(130,115,85,.35)' : 'rgba(220,205,170,.3)'; g.fillRect(Math.random() * w, Math.random() * h, 2 + Math.random() * 3, 2); } }, [3, 3]);
    const rochaM = new THREE.MeshStandardMaterial({ map: rochaTex, roughness: 1, transparent: true });
    const dentroM = new THREE.MeshStandardMaterial({ map: rochaTex, roughness: 1, side: THREE.BackSide });
    const grama = tex(128, 128, (g, w, h) => { g.fillStyle = '#7a8048'; g.fillRect(0, 0, w, h); for (let i = 0; i < 3000; i++) { g.fillStyle = Math.random() > .5 ? 'rgba(60,75,35,.5)' : 'rgba(150,145,90,.35)'; g.fillRect(Math.random() * w, Math.random() * h, 2, 2); } }, [40, 40]);
    const chao = new THREE.Mesh(new THREE.PlaneGeometry(300, 300), new THREE.MeshStandardMaterial({ map: grama, roughness: 1 })); chao.rotation.x = -Math.PI / 2; chao.receiveShadow = true; cena.add(chao);

    // paredão de rocha com fachada lisa
    const morro = new THREE.Group();
    const bloco = new THREE.Mesh(new THREE.BoxGeometry(12, 5.5, 8), rochaM); bloco.position.set(0, 2.75, -2.5); morro.add(bloco);
    const topo = new THREE.Mesh(new THREE.SphereGeometry(7.5, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), rochaM); topo.scale.set(1, 0.35, 0.75); topo.position.set(0, 5.4, -3); morro.add(topo);
    cena.add(sombra(morro));
    // interior visível pela abertura: câmara escavada (caixa vista por dentro)
    const camara = new THREE.Mesh(new THREE.BoxGeometry(3.2, 2.2, 3.2), dentroM); camara.position.set(0, 1.1, -3.1); cena.add(camara);
    // entrada escura e moldura (a câmara de dentro aparece quando a rocha fica transparente)
    const vao = caixa(0.9, 1.0, 1.4, new THREE.MeshStandardMaterial({ color: 0x15110d }), 0, 0.5, 1.0); cena.add(vao);
    // canal da pedra e a pedra que rola
    cena.add(sombra(caixa(4, 0.25, 0.45, new THREE.MeshStandardMaterial({ color: 0xa7966f, roughness: 1 }), 0.8, 0.12, 1.85)));
    const pedra = cil(0.75, 0.75, 0.35, new THREE.MeshStandardMaterial({ map: rochaTex, roughness: 1 }), 0, 0.75, 2.0, 32); pedra.rotation.x = Math.PI / 2; cena.add(sombra(pedra));
    // bancos e nichos (kokhim)
    const bancoM = new THREE.MeshStandardMaterial({ map: rochaTex, roughness: 1 });
    cena.add(sombra(caixa(0.8, 0.55, 2.8, bancoM, -1.2, 0.28, -3.1)), sombra(caixa(0.8, 0.55, 2.8, bancoM, 1.2, 0.28, -3.1)), sombra(caixa(1.6, 0.55, 0.8, bancoM, 0, 0.28, -4.3)));
    const escuro = new THREE.MeshStandardMaterial({ color: 0x1a140f });
    [-0.9, 0, 0.9].forEach(x => cena.add(caixa(0.5, 0.6, 0.15, escuro, x, 1.45, -4.62)));
    [-1, 1].forEach(s => [-3.6, -2.6].forEach(z => cena.add(caixa(0.15, 0.6, 0.5, escuro, s * 1.53, 1.45, z))));
    // lençóis e o lenço dobrado, sobre o banco da esquerda
    const linho = new THREE.MeshStandardMaterial({ color: 0xf1ece0, roughness: 1 });
    const lencol = caixa(0.55, 0.12, 1.8, linho, -1.2, 0.62, -3.2); cena.add(lencol);
    const faixas = cil(0.2, 0.22, 1.4, linho, -1.2, 0.73, -3.0, 12); faixas.rotation.x = Math.PI / 2; faixas.scale.set(1, 1, 0.55); cena.add(faixas);
    const lenco = caixa(0.32, 0.06, 0.25, linho, -1.25, 0.6, -4.25); cena.add(lenco);
    // ossuários no banco da direita
    const ossM = new THREE.MeshStandardMaterial({ color: 0xe2d8c2, roughness: 0.9 });
    [[1.25, -2.5], [1.2, -3.4]].forEach(([x, z]) => { const o = caixa(0.32, 0.32, 0.62, ossM, x, 0.72, z); cena.add(sombra(o)); cena.add(caixa(0.34, 0.06, 0.64, ossM, x, 0.91, z)); });
    // luz que entra pela abertura
    const raio = new THREE.SpotLight(0xfff3d6, 0, 10, 0.35, 0.7); raio.position.set(0, 1.2, 3); raio.target.position.set(-0.5, 0.4, -3.5); cena.add(raio, raio.target);
    const luzDentro = new THREE.PointLight(0xfff0d0, 0.5, 5); luzDentro.position.set(0, 1.8, -3); cena.add(luzDentro);
    // jardim: oliveiras e arbustos
    const oliva = new THREE.MeshStandardMaterial({ color: 0x66753f, roughness: 1 }), tronco = new THREE.MeshStandardMaterial({ color: 0x5b4632, roughness: 1 });
    for (let i = 0; i < 14; i++) { const a = Math.random() * Math.PI - Math.PI, r = 9 + Math.random() * 10; const g = new THREE.Group(); g.add(cil(0.15, 0.25, 1.8, tronco, 0, 0.9, 0, 6)); const c = new THREE.Mesh(new THREE.SphereGeometry(1.3, 8, 6), oliva); c.position.y = 2.3; c.scale.y = 0.75; g.add(c); g.position.set(Math.cos(a) * r, 0, 4 + Math.sin(-a) * r * 0.6); cena.add(sombra(g)); }
    for (let i = 0; i < 20; i++) { const b = new THREE.Mesh(new THREE.SphereGeometry(0.4 + Math.random() * 0.4, 8, 6), oliva); b.position.set(-8 + Math.random() * 16, 0.3, 3 + Math.random() * 8); if (Math.abs(b.position.x) < 2.5 && b.position.z < 6) continue; cena.add(b); }

    let aberto = false, dentro = false, cenaPedra = false, t0 = 0;
    return {
      aoExtra: on => { dentro = on; },
      aoEstacao: e => { cenaPedra = e.id === 'pedra'; t0 = performance.now(); aberto = e.id !== 'pedra' || false; },
      animar(t, dt) {
        const k = Math.min(1, dt * 3);
        rochaM.opacity += ((dentro ? 0.18 : 1) - rochaM.opacity) * k; rochaM.depthWrite = rochaM.opacity > 0.95;
        // a pedra: fechada no começo da estação "A pedra" e rolando para o lado; nas outras, já aberta
        let s = 1;
        if (cenaPedra) { const tt = ((performance.now() - t0) / 1000) % 8; s = tt < 2 ? 0 : Math.min(1, (tt - 2) / 3); }
        const x = s * 1.7; pedra.position.x = x; pedra.rotation.y = -x / 0.75;
        raio.intensity = s * 1.6;
      },
    };
  },
});
