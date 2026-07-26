# Doolhof

3D first-person doolhofspel dat in de browser draait (Three.js).

## Spelen

Er is geen build-stap nodig. Start een lokale webserver in deze map en open die in de browser, bijvoorbeeld:

```bash
python3 -m http.server 8000
```

Ga dan naar `http://localhost:8000` en klik op **Start**.

## Besturing

### Desktop

- **WASD** of **pijltjestoetsen**: bewegen
- **Muis**: rondkijken (muis wordt vergrendeld na klikken op Start)
- **Esc**: pauzeren / muis vrijgeven

### Tablet / touch

Op een touch-apparaat schakelt het spel automatisch naar twee virtuele joysticks (geen toetsenbord of muis nodig):

- **Linker joystick** (linkerhelft van het scherm): lopen — omhoog/omlaag is vooruit/achteruit, links/rechts is zijwaarts strafen.
- **Rechter joystick** (rechterhelft van het scherm): rondkijken — links/rechts draait de kijkrichting.
- De joysticks verschijnen op de plek waar je duim het scherm raakt en verdwijnen weer zodra je loslaat.
- Gebruik de knop rechtsboven om naar volledig scherm te schakelen; speel bij voorkeur in liggende stand (landscape).

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
