# Doolhof

3D first-person doolhofspel dat in de browser draait (Three.js).

## Spelen

Er is geen build-stap nodig. Start een lokale webserver in deze map en open die in de browser, bijvoorbeeld:

```bash
python3 -m http.server 8000
```

Ga dan naar `http://localhost:8000` en klik op **Start**.

## Besturing

- **WASD** of **pijltjestoetsen**: bewegen
- **Muis**: rondkijken (muis wordt vergrendeld na klikken op Start)
- **Esc**: pauzeren / muis vrijgeven

## Spelregels

- Elk level krijg je een willekeurig gegenereerd doolhof (recursive backtracker algoritme).
- Vind de groen oplichtende uitgang om het level te voltooien.
- Elk volgend level is groter en dus moeilijker.
- Je scoort punten op basis van hoe snel je een level uitloopt; hogere levels leveren meer punten op.
- De totale speeltijd en score zijn zichtbaar linksboven in beeld.

## Techniek

- [Three.js](https://threejs.org/) (meegeleverd in `vendor/three/`, geen internetverbinding nodig om te spelen)
- Doolhofgeneratie: `js/maze.js`
- Scene, besturing, botsingsdetectie en spellogica: `js/game.js`
