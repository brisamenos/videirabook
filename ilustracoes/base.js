/* Base comum dos modelos 3D bíblicos: cena com céu e luz de cinema, câmera que voa entre as partes, marcadores na cena,
   passeio guiado, leitura em voz alta e catálogo de modelos.
   Cada modelo chama V3D.registrar(id, { nome, sub, ceu, extra, estacoes, montar(ctx) }). */
(function () {
  const reduz = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const modelos = {};
  const V3D = window.V3D = { registrar: (id, def) => { modelos[id] = def; def.id = id; }, modelos };
  // grupos do catálogo e modelos de interior (sem céu)
  const GRUPOS = ['Antigo Testamento', 'Tempo de Jesus', 'Igreja primitiva', 'Arqueologia e vida diária'];
  const GRUPO = {
    tabernaculo: 0, acampamento: 0, noe: 0, zigurate: 0, egito: 0, jerico: 0, templo: 0, vestes: 0, babilonia: 0, portao: 0,
    jerusalem: 1, herodes: 1, cafarnaum: 1, sepulcro: 1,
    navio: 2, atenas: 2,
    museu: 3, tunel: 3, qumran: 3, casa: 3, vinha: 3,
  };
  const INTERNO = new Set(['museu', 'vestes']);

  let renderer, camera, ctr, cena, rel, anim = null, def = null, voo = null, atual = 0, passeio = null, ocioso = 0, extraOn = false;
  let ceuDomo = null, pinos = [], falando = false;
  const $ = s => document.querySelector(s);
  const v3 = new THREE.Vector3();

  function tex(w, h, desenha, rep) {
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    desenha(c.getContext('2d'), w, h);
    const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding;
    if (rep) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rep[0], rep[1]); }
    t.anisotropy = 4; return t;
  }
  const caixa = (w, h, d, mat, x, y, z) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(x || 0, y || 0, z || 0); return m; };
  const cil = (r1, r2, h, mat, x, y, z, seg) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(r1, r2, h, seg || 16), mat); m.position.set(x || 0, y || 0, z || 0); return m; };
  const sombra = o => { o.traverse(m => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; } }); return o; };
  let brilho = null;
  function particulas(qtd, cor, tam, op, normal) {
    const geo = new THREE.BufferGeometry(); const pos = new Float32Array(qtd * 3); const vida = new Float32Array(qtd);
    for (let i = 0; i < qtd; i++) vida[i] = Math.random();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    if (!brilho) brilho = tex(64, 64, g => { const r = g.createRadialGradient(32, 32, 0, 32, 32, 32); r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = r; g.fillRect(0, 0, 64, 64); });
    const mat = new THREE.PointsMaterial({ color: cor, size: tam, map: brilho, transparent: true, opacity: op, depthWrite: false, blending: normal ? THREE.NormalBlending : THREE.AdditiveBlending });
    const p = new THREE.Points(geo, mat); p.userData.vida = vida; p.frustumCulled = false; return p;
  }
  // pessoa estilizada (túnica, manto e cabeça), usada por vários modelos
  const PELE = [0xa8734f, 0x8d5e3e, 0xb98563];
  function pessoa(cor, opc = {}) {
    const g = new THREE.Group(); const h = opc.altura || 1.7; const k = h / 1.7;
    const m = new THREE.MeshStandardMaterial({ color: cor, roughness: 0.9 });
    const corpo = new THREE.Mesh(new THREE.CylinderGeometry(0.2 * k, 0.36 * k, 1.38 * k, 12), m); corpo.position.y = 0.69 * k; g.add(corpo);
    const manto = new THREE.Mesh(new THREE.CylinderGeometry(0.23 * k, 0.3 * k, 0.55 * k, 12, 1, true), new THREE.MeshStandardMaterial({ color: opc.manto || new THREE.Color(cor).multiplyScalar(0.75), roughness: 1, side: THREE.DoubleSide })); manto.position.y = 1.1 * k; g.add(manto);
    const cab = new THREE.Mesh(new THREE.SphereGeometry(0.15 * k, 12, 10), new THREE.MeshStandardMaterial({ color: PELE[(opc.i || 0) % 3], roughness: 0.8 })); cab.position.y = 1.55 * k; g.add(cab);
    if (opc.turbante !== false) { const t = new THREE.Mesh(new THREE.SphereGeometry(0.16 * k, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.55), new THREE.MeshStandardMaterial({ color: opc.turbante || 0xe8e0cc, roughness: 1 })); t.position.y = 1.57 * k; g.add(t); }
    return g;
  }
  function materiais() {
    return {
      ouro: new THREE.MeshStandardMaterial({ color: 0xd8b04c, metalness: 0.9, roughness: 0.28 }),
      ouroEsc: new THREE.MeshStandardMaterial({ color: 0xb48a2c, metalness: 0.85, roughness: 0.35 }),
      bronze: new THREE.MeshStandardMaterial({ color: 0xa8683a, metalness: 0.8, roughness: 0.4 }),
      prata: new THREE.MeshStandardMaterial({ color: 0xd9dde2, metalness: 0.9, roughness: 0.25 }),
      madeira: new THREE.MeshStandardMaterial({ color: 0x8a5a33, roughness: 0.8 }),
      pedra: new THREE.MeshStandardMaterial({ color: 0xd8cbb0, roughness: 0.95 }),
      cedro: new THREE.MeshStandardMaterial({ color: 0x9b6237, roughness: 0.75 }),
    };
  }
  // céu em degradê com o brilho do sol; acompanha a cor de fundo da cena (o dilúvio escurece o céu, por exemplo)
  function criarCeu(sol) {
    const mat = new THREE.ShaderMaterial({
      uniforms: { horiz: { value: new THREE.Color() }, topo: { value: new THREE.Color() }, solDir: { value: sol.position.clone().normalize() }, solCor: { value: new THREE.Color(0xfff1d0) }, solForca: { value: 1 } },
      vertexShader: 'varying vec3 vDir; void main(){ vDir = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
      fragmentShader: `uniform vec3 horiz; uniform vec3 topo; uniform vec3 solDir; uniform vec3 solCor; uniform float solForca; varying vec3 vDir;
        void main(){ float h = clamp(vDir.y, 0.0, 1.0); vec3 c = mix(horiz, topo, pow(h, 0.55));
          float s = max(dot(normalize(vDir), solDir), 0.0); c += solCor * (pow(s, 600.0) * 1.6 + pow(s, 12.0) * 0.22) * solForca;
          gl_FragColor = vec4(c, 1.0); }`,
      side: THREE.BackSide, depthWrite: false, fog: false,
    });
    const m = new THREE.Mesh(new THREE.SphereGeometry(1700, 32, 16), mat); m.renderOrder = -10; m.frustumCulled = false; return m;
  }

  function iniciar() {
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.setSize(innerWidth, innerHeight);
    renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 0.92;
    $('#palco').appendChild(renderer.domElement);
    camera = new THREE.PerspectiveCamera(45, innerWidth / innerHeight, 0.2, 4000);
    ctr = new THREE.OrbitControls(camera, renderer.domElement);
    ctr.enableDamping = true; ctr.dampingFactor = 0.08; ctr.maxPolarAngle = Math.PI * 0.49;
    ctr.addEventListener('start', () => { ocioso = 0; });
    renderer.domElement.addEventListener('pointerdown', () => { voo = null; if (passeio) pararPasseio(); });
    rel = new THREE.Clock();
    addEventListener('resize', () => { camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); renderer.setSize(innerWidth, innerHeight); });
    $('#b-passeio').addEventListener('click', () => {
      if (passeio) { pararPasseio(); return; }
      $('#b-passeio').setAttribute('aria-pressed', 'true'); $('#b-passeio').textContent = 'Parar passeio';
      ir((atual + 1) % def.estacoes.length);
      passeio = setInterval(() => { if (!falando || !speechSynthesis.speaking) ir((atual + 1) % def.estacoes.length); }, 9000);
    });
    $('#b-extra').addEventListener('click', () => setExtra(!extraOn));
    $('#b-ant').addEventListener('click', () => { pararPasseio(); ir((atual - 1 + def.estacoes.length) % def.estacoes.length); });
    $('#b-prox').addEventListener('click', () => { pararPasseio(); ir((atual + 1) % def.estacoes.length); });
    // leitura em voz alta (voz do próprio aparelho, em português)
    const bo = $('#b-ouvir');
    if (!('speechSynthesis' in window)) bo.hidden = true;
    bo.addEventListener('click', () => { falando = !falando; bo.setAttribute('aria-pressed', String(falando)); bo.textContent = falando ? 'Parar leitura' : 'Ouvir'; if (falando) falar(); else speechSynthesis.cancel(); });
    // catálogo
    const cat = $('#catalogo'), grade = $('#cat-grade');
    grade.innerHTML = GRUPOS.map((g, gi) => {
      const ms = Object.values(modelos).filter(m => (GRUPO[m.id] ?? 3) === gi); if (!ms.length) return '';
      return `<section><h2>${g}</h2><div class="cat-lista">${ms.map(m => `<button type="button" class="cat-item" data-m="${m.id}"><b>${m.nome}</b><span>${m.sub}</span></button>`).join('')}</div></section>`;
    }).join('');
    const abrirCat = on => { cat.hidden = !on; $('#b-modelos').setAttribute('aria-expanded', String(on)); if (on) { const a = grade.querySelector(`[data-m="${def.id}"]`); if (a) a.focus(); } };
    $('#b-modelos').addEventListener('click', () => abrirCat(cat.hidden));
    $('#cat-fechar').addEventListener('click', () => abrirCat(false));
    cat.addEventListener('click', e => { if (e.target === cat) abrirCat(false); const b = e.target.closest('[data-m]'); if (b) { abrirCat(false); location.hash = b.dataset.m; } });
    addEventListener('keydown', e => { if (e.key === 'Escape' && !cat.hidden) abrirCat(false); });
    addEventListener('hashchange', rota);
    rota();
    animar();
  }

  function falar() {
    if (!falando || !def) return;
    speechSynthesis.cancel();
    const e = def.estacoes[atual];
    const u = new SpeechSynthesisUtterance(`${e.titulo}. ${e.desc.replace(/"/g, '')}`);
    u.lang = 'pt-BR'; u.rate = 1;
    const voz = speechSynthesis.getVoices().find(v => /pt[-_]BR/i.test(v.lang)) || speechSynthesis.getVoices().find(v => /^pt/i.test(v.lang));
    if (voz) u.voice = voz;
    speechSynthesis.speak(u);
  }

  function liberar(obj) {
    obj.traverse(o => {
      if (o.geometry) o.geometry.dispose();
      if (o.material) [].concat(o.material).forEach(m => { if (m.map && m.map !== brilho) m.map.dispose(); m.dispose(); });
    });
  }

  function rota() {
    const h = decodeURIComponent(location.hash.slice(1));
    const [mid, eid] = h.split('-');
    const m = modelos[mid] || Object.values(modelos)[0];
    if (!def || def.id !== m.id) montar(m);
    const i = eid ? def.estacoes.findIndex(e => e.id === eid) : -1;
    ir(i >= 0 ? i : 0, !eid);
  }

  function montar(m) {
    pararPasseio();
    const veu = $('#veu'); if (veu && !reduz) { veu.classList.remove('some'); void veu.offsetWidth; veu.classList.add('some'); }
    if (cena) liberar(cena);
    def = m; cena = new THREE.Scene(); extraOn = false;
    const ceu = m.ceu || 0x2a3442;
    cena.background = new THREE.Color(ceu); cena.fog = new THREE.Fog(ceu, m.neblina ? m.neblina[0] : 160, m.neblina ? m.neblina[1] : 420);
    cena.add(new THREE.HemisphereLight(0xc4d6ff, 0x8a6a3c, 0.62));
    const sol = new THREE.DirectionalLight(0xffdcae, 1.25);
    sol.position.set(80, 90, 40); sol.castShadow = true; sol.shadow.mapSize.set(2048, 2048); sol.shadow.bias = -0.0004; sol.shadow.normalBias = 0.02;
    const s = m.sombra || 80;
    Object.assign(sol.shadow.camera, { left: -s, right: s, top: s * 0.75, bottom: -s * 0.75, near: 10, far: 400 });
    cena.add(sol);
    ceuDomo = INTERNO.has(m.id) ? null : criarCeu(sol);
    if (ceuDomo) cena.add(ceuDomo);
    ctr.minDistance = m.dist ? m.dist[0] : 4; ctr.maxDistance = m.dist ? m.dist[1] : 260;
    anim = m.montar({ THREE, cena, sol, M: materiais(), tex, caixa, cil, sombra, particulas, pessoa, reduz }) || {};
    document.title = `${m.nome} 3D`;
    $('#titulo').innerHTML = `${m.nome}<small>${m.sub}</small>`;
    const bx = $('#b-extra'); bx.hidden = !m.extra; if (m.extra) bx.textContent = m.extra[0];
    bx.setAttribute('aria-pressed', 'false');
    const lista = $('#estacoes'); lista.innerHTML = '';
    m.estacoes.forEach((e, i) => {
      const b = document.createElement('button'); b.type = 'button'; b.className = 'estacao'; b.dataset.i = i;
      b.innerHTML = i ? `<i>${i}</i>${e.nome}` : e.nome;
      b.addEventListener('click', () => { pararPasseio(); ir(i); });
      lista.appendChild(b);
    });
    // marcadores numerados flutuando sobre cada parte
    const camada = $('#pinos'); camada.innerHTML = '';
    pinos = m.estacoes.map((e, i) => {
      if (!i || e.pino === false) return null;
      const b = document.createElement('button'); b.type = 'button'; b.className = 'pino'; b.innerHTML = `<i>${i}</i><span>${e.nome}</span>`;
      b.setAttribute('aria-label', `Ir para ${e.nome}`);
      b.addEventListener('click', () => { pararPasseio(); ir(i); });
      camada.appendChild(b);
      return { b, pos: new THREE.Vector3(...(e.pino || e.alvo)) };
    });
    const e0 = m.estacoes[0];
    camera.position.set(...e0.cam).multiplyScalar(1.5); ctr.target.set(...e0.alvo);
  }

  function setExtra(on) {
    extraOn = on; const bx = $('#b-extra');
    bx.setAttribute('aria-pressed', String(on)); if (def.extra) bx.textContent = def.extra[on ? 1 : 0];
    if (anim.aoExtra) anim.aoExtra(on);
  }

  function ir(i, abertura) {
    atual = i; const e = def.estacoes[i];
    $('#info').innerHTML = `<div class="ref">${e.ref}</div><h2>${e.titulo}</h2><p class="medida">${e.medida}</p><p class="desc">${e.desc}</p>`;
    $('#info').scrollTop = 0;
    $('#contador').textContent = `${i + 1} de ${def.estacoes.length}`;
    const lista = $('#estacoes');
    lista.querySelectorAll('.estacao').forEach(b => b.setAttribute('aria-current', String(Number(b.dataset.i) === i)));
    const ativo = lista.children[i]; if (ativo && ativo.scrollIntoView && !abertura) ativo.scrollIntoView({ inline: 'center', block: 'nearest', behavior: reduz ? 'auto' : 'smooth' });
    pinos.forEach((p, k) => { if (p) p.b.classList.toggle('atual', k === i); });
    if (def.extra) setExtra(!!e.extra);
    if (anim.aoEstacao) anim.aoEstacao(e);
    voo = { t0: performance.now(), dur: reduz ? 1 : (abertura ? 3000 : 1800), p0: camera.position.clone(), a0: ctr.target.clone(), p1: new THREE.Vector3(...e.cam), a1: new THREE.Vector3(...e.alvo) };
    if (falando) falar();
  }
  function pararPasseio() { clearInterval(passeio); passeio = null; const b = $('#b-passeio'); if (b) { b.setAttribute('aria-pressed', 'false'); b.textContent = 'Passeio guiado'; } }
  const suave = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

  function animar() {
    requestAnimationFrame(animar);
    const dt = Math.min(rel.getDelta(), 0.05), t = rel.elapsedTime;
    if (voo) {
      const k = Math.min(1, (performance.now() - voo.t0) / voo.dur), s = suave(k);
      camera.position.lerpVectors(voo.p0, voo.p1, s); ctr.target.lerpVectors(voo.a0, voo.a1, s);
      if (k >= 1) voo = null;
    }
    ocioso += dt;
    ctr.autoRotate = !reduz && !voo && !passeio && atual === 0 && ocioso > 4;
    ctr.autoRotateSpeed = 0.35;
    if (anim.animar) anim.animar(t, dt, reduz);
    ctr.update();
    if (ceuDomo) {
      ceuDomo.position.copy(camera.position);
      const u = ceuDomo.material.uniforms, bg = cena.background;
      u.horiz.value.copy(bg).lerp(new THREE.Color(0xffffff), 0.12);
      u.topo.value.copy(bg).multiplyScalar(0.62).lerp(new THREE.Color(0x2c5aa0), 0.28);
      u.solForca.value = Math.min(1, (bg.r + bg.g + bg.b) / 1.2);
    }
    // marcadores: projeta a posição 3D na tela; some atrás da câmera ou fora da tela
    const W = innerWidth, H = innerHeight;
    pinos.forEach(p => {
      if (!p) return;
      v3.copy(p.pos).project(camera);
      const vis = v3.z < 1 && v3.x > -1.05 && v3.x < 1.05 && v3.y > -1.05 && v3.y < 1.05;
      p.b.style.display = vis ? '' : 'none';
      if (vis) p.b.style.transform = `translate(${(v3.x + 1) / 2 * W}px, ${(1 - v3.y) / 2 * H}px) translate(-50%, -50%)`;
    });
    renderer.render(cena, camera);
  }

  addEventListener('DOMContentLoaded', () => { iniciar(); const c = $('#carregando'); if (c) c.remove(); });
})();
