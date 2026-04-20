const canvas = document.getElementById("neural-field");

if (canvas) {
  const context = canvas.getContext("2d");
  const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  const palette = ["#24c6c8", "#f05a45", "#9fbf50", "#d6a83c"];
  let width = 0;
  let height = 0;
  let ratio = 1;
  let nodes = [];
  let frame = 0;

  const seedNodes = () => {
    nodes = Array.from({ length: 54 }, (_, index) => {
      const band = index % 6;
      return {
        x: 0.08 + ((index * 37) % 89) / 105,
        y: 0.12 + ((index * 53) % 73) / 96,
        r: 1.8 + (index % 5) * 0.42,
        band,
        phase: index * 0.37,
        color: palette[index % palette.length]
      };
    });
  };

  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    ratio = Math.min(window.devicePixelRatio || 1, 2);
    width = Math.max(1, Math.floor(rect.width));
    height = Math.max(1, Math.floor(rect.height));
    canvas.width = Math.floor(width * ratio);
    canvas.height = Math.floor(height * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
  };

  const draw = () => {
    context.clearRect(0, 0, width, height);
    context.fillStyle = "#101213";
    context.fillRect(0, 0, width, height);

    context.globalAlpha = 0.16;
    context.strokeStyle = "#eef0e8";
    context.lineWidth = 1;
    for (let x = 0; x < width; x += 44) {
      context.beginPath();
      context.moveTo(x, 0);
      context.lineTo(x, height);
      context.stroke();
    }
    for (let y = 0; y < height; y += 44) {
      context.beginPath();
      context.moveTo(0, y);
      context.lineTo(width, y);
      context.stroke();
    }

    const drift = motionQuery.matches ? 0 : frame * 0.008;
    const points = nodes.map((node) => ({
      ...node,
      px: node.x * width + Math.sin(drift + node.phase) * 12,
      py: node.y * height + Math.cos(drift * 0.7 + node.phase) * 10
    }));

    context.globalAlpha = 0.42;
    points.forEach((node, index) => {
      for (let next = index + 1; next < points.length; next += 1) {
        const peer = points[next];
        const dx = node.px - peer.px;
        const dy = node.py - peer.py;
        const distance = Math.hypot(dx, dy);
        if (distance < 150 && Math.abs(node.band - peer.band) <= 2) {
          context.strokeStyle = node.color;
          context.lineWidth = Math.max(0.4, 1.4 - distance / 140);
          context.beginPath();
          context.moveTo(node.px, node.py);
          context.lineTo(peer.px, peer.py);
          context.stroke();
        }
      }
    });

    context.globalAlpha = 0.95;
    points.forEach((node) => {
      context.fillStyle = node.color;
      context.beginPath();
      context.arc(node.px, node.py, node.r, 0, Math.PI * 2);
      context.fill();
    });

    context.globalAlpha = 1;
    frame += 1;
    if (!motionQuery.matches) {
      window.requestAnimationFrame(draw);
    }
  };

  seedNodes();
  resize();
  draw();
  window.addEventListener("resize", () => {
    resize();
    draw();
  });
}

