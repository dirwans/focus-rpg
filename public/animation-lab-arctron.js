// animation-lab-arctron.js
// Animation Lab integration using bundled DragonBones + PixiJS runtime
// Requires /lib/dragonbones-pixi.min.js loaded before this script.

(() => {
  const openBtn = document.getElementById('openAnimLabBtn');
  const modal = document.getElementById('animLabModal');
  const closeBtn = document.getElementById('animClose');
  const playPauseBtn = document.getElementById('animPlayPause');
  const animSelect = document.getElementById('animSelect');
  const canvas = document.getElementById('animLabCanvas');

  let isPlaying = false;
  let factory = null;
  let armatureDisplay = null;
  let app = null; // PIXI Application

  // Utility to load JSON/TEX resources
  const loadJSON = (url) => fetch(url).then(res => res.json());
  // Load image returns Image object
  const loadImage = (url) => new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });

  const initDragonBones = async () => {
    if (factory) return; // already initialized

    // Create PIXI Application using the existing canvas
    app = new PIXI.Application({ view: canvas, width: canvas.width, height: canvas.height, transparent: true });
    // Use PixiFactory (singleton)
    factory = dragonBones.PixiFactory.factory;

    const [skeletonData, textureData, textureImg] = await Promise.all([
      loadJSON('assets/arctron/arctron_skeleton.json'),
      loadJSON('assets/arctron/arctron_texture.json'),
      loadImage('assets/arctron/arctron_texture.png')
    ]);

    factory.parseDragonBonesData(skeletonData);
    factory.parseTextureAtlasData(textureData, textureImg);

    // Build armature display and add to Pixi stage
    armatureDisplay = factory.buildArmatureDisplay('Armature');
    armatureDisplay.x = canvas.width / 2;
    armatureDisplay.y = canvas.height / 2;
    app.stage.addChild(armatureDisplay);

    // Play default animation
    armatureDisplay.animation.play('idle');

    // Advance animation on each tick
    app.ticker.add((delta) => {
      if (armatureDisplay) {
        armatureDisplay.advanceTime(app.ticker.deltaMS / 1000);
      }
    });
  };

  const showModal = () => {
    modal.style.display = 'flex';
    initDragonBones().then(() => {
      if (app) app.start();
    }).catch((err) => {
      console.warn('[Animation Lab] Assets not ready:', err.message);
      // Show friendly message on the canvas
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#1a2538';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#ff5222';
      ctx.font = 'bold 18px "Outfit", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('⚠️ Animation assets not found', canvas.width / 2, canvas.height / 2 - 20);
      ctx.fillStyle = '#8e9db5';
      ctx.font = '13px "Outfit", sans-serif';
      ctx.fillText('Place arctron_skeleton.json, arctron_texture.json,', canvas.width / 2, canvas.height / 2 + 15);
      ctx.fillText('and arctron_texture.png in /assets/arctron/', canvas.width / 2, canvas.height / 2 + 35);
    });
    isPlaying = true;
    playPauseBtn.textContent = 'Pause';
  };

  const hideModal = () => {
    modal.style.display = 'none';
    isPlaying = false;
    playPauseBtn.textContent = 'Play';
    if (app) {
      app.stop();
      app.stage.removeChildren();
      armatureDisplay = null;
      factory = null;
      app.destroy(true);
      app = null;
    }
  };

  const togglePlay = () => {
    isPlaying = !isPlaying;
    playPauseBtn.textContent = isPlaying ? 'Pause' : 'Play';
    if (app) {
      if (isPlaying) {
        app.start();
      } else {
        app.stop();
      }
    }
  };

  const changeAnimation = () => {
    const anim = animSelect.value;
    if (armatureDisplay) {
      armatureDisplay.animation.play(anim);
    }
  };

  // Event listeners
  if (openBtn) openBtn.addEventListener('click', showModal);
  if (closeBtn) closeBtn.addEventListener('click', hideModal);
  if (playPauseBtn) playPauseBtn.addEventListener('click', togglePlay);
  if (animSelect) animSelect.addEventListener('change', changeAnimation);
})();
