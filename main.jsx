useEffect(() => {
  const count = 120;
  const minDistance = 60;
  const positions = [];

  for (let i = 0; i < count; i++) {
    let x, y;
    let tooClose;

    // Uygun bir yer bulana kadar tekrar dene
    do {
      x = Math.random() * window.innerWidth;
      y = Math.random() * window.innerHeight;
      tooClose = positions.some(
        (pos) =>
          Math.hypot(pos.x - x, pos.y - y) < minDistance
      );
    } while (tooClose);

    positions.push({ x, y });

    const img = document.createElement("div");
    img.className = "donut";

    img.style.left = `${x}px`;
    img.style.top = `${y}px`;

    const rotation = Math.floor(Math.random() * 360);
    img.style.transform = `rotate(${rotation}deg)`;
    if (Math.random() > 0.5) {
      img.style.transform += " scaleX(-1)";
    }

    document.body.appendChild(img);
  }
}, []);
