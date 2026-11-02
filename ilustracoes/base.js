/* Base comum dos modelos 3D bíblicos: cena, materiais, câmera que voa entre as partes, passeio guiado e painel.
   Cada modelo chama V3D.registrar(id, { nome, sub, ceu, extra, estacoes, montar(ctx) }). */
(function () {
  const reduz = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const modelos = {};
  const V3D = window.V3D = { registrar: (id, def) => { modelos[id] = def; def.id = id; }, modelos };

  let renderer, camera, ctr, cena, rel, anim = null, def = null, voo = null, atual = 0, passeio = null, ocioso = 0, extraOn = false;
  const $ = s => document.querySelector(s);

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

  function iniciar() {
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.setSize(innerWidth, innerHeight);
    renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputEncoding = THREE.sRGBEncoding;
    $('#palco').appendChild(renderer.domElement);
    camera = new THREE.PerspectiveCamera(45, innerWidth / innerHeight, 0.2, 2000);
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
      passeio = setInterval(() => ir((atual + 1) % def.estacoes.length), 9000);
    });
    $('#b-extra').addEventListener('click', () => setExtra(!extraOn));
    // seletor de modelos
    const sel = $('#modelos');
    Object.values(modelos).forEach(m => { const b = document.createElement('button'); b.type = 'button'; b.className = 'modelo'; b.textContent = m.nome; b.dataset.m = m.id; b.addEventListener('click', () => { location.hash = m.id; }); sel.appendChild(b); });
    addEventListener('hashchange', rota);
    rota();
    animar();
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
    if (cena) liberar(cena);
    def = m; cena = new THREE.Scene(); extraOn = false;
    const ceu = m.ceu || 0x2a3442;
    cena.background = new THREE.Color(ceu); cena.fog = new THREE.Fog(ceu, m.neblina ? m.neblina[0] : 160, m.neblina ? m.neblina[1] : 420);
    cena.add(new THREE.HemisphereLight(0xbcd0ff, 0x8a6a3c, 0.55));
    const sol = new THREE.DirectionalLight(0xffd9a0, 1.05);
    sol.position.set(80, 90, 40); sol.castShadow = true; sol.shadow.mapSize.set(2048, 2048);
    const s = m.sombra || 80;
    Object.assign(sol.shadow.camera, { left: -s, right: s, top: s * 0.75, bottom: -s * 0.75, near: 10, far: 400 });
    cena.add(sol);
    ctr.minDistance = m.dist ? m.dist[0] : 4; ctr.maxDistance = m.dist ? m.dist[1] : 260;
    anim = m.montar({ THREE, cena, sol, M: materiais(), tex, caixa, cil, sombra, particulas, reduz }) || {};
    document.title = `${m.nome} 3D`;
    $('#titulo').innerHTML = `${m.nome}<small>${m.sub}</small>`;
    const bx = $('#b-extra'); bx.hidden = !m.extra; if (m.extra) bx.textContent = m.extra[0];
    bx.setAttribute('aria-pressed', 'false');
    document.querySelectorAll('.modelo').forEach(b => b.setAttribute('aria-current', String(b.dataset.m === m.id)));
    const lista = $('#estacoes'); lista.innerHTML = '';
    m.estacoes.forEach((e, i) => {
      const b = document.createElement('button'); b.type = 'button'; b.className = 'estacao'; b.textContent = e.nome; b.dataset.i = i;
      b.addEventListener('click', () => { pararPasseio(); ir(i); });
      lista.appendChild(b);
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
    const lista = $('#estacoes');
    lista.querySelectorAll('.estacao').forEach(b => b.setAttribute('aria-current', String(Number(b.dataset.i) === i)));
    const ativo = lista.children[i]; if (ativo && ativo.scrollIntoView && !abertura) ativo.scrollIntoView({ inline: 'center', block: 'nearest', behavior: reduz ? 'auto' : 'smooth' });
    if (def.extra) setExtra(!!e.extra);
    if (anim.aoEstacao) anim.aoEstacao(e);
    voo = { t0: performance.now(), dur: reduz ? 1 : (abertura ? 3000 : 1800), p0: camera.position.clone(), a0: ctr.target.clone(), p1: new THREE.Vector3(...e.cam), a1: new THREE.Vector3(...e.alvo) };
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
    renderer.render(cena, camera);
  }

  addEventListener('DOMContentLoaded', () => { iniciar(); const c = $('#carregando'); if (c) c.remove(); });
})();
