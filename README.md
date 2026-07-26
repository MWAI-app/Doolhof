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
- Elk voltooid level levert een trofee op, en binnen elke reeks van 5 levels stapelt het aantal op (bijv. level 2 → 2x Boer, level 7 → 2x Queen):
  - Level 1 t/m 5: bronzen munt (Boer), 1 tot 5 stuks
  - Level 6 t/m 10: zilveren munt (Queen), 1 tot 5 stuks
  - Level 11 t/m 15: gouden munt (King), 1 tot 5 stuks
  - Level 16 t/m 20: diamanten munt (Ace), 1 tot 5 stuks
  - Level 21 en verder: de kampioensbokaal met een draakje (ook stapelend per 5 levels) — bij level 21 verschijnt eenmalig "You are on top of the world!"
- Je voortgang (level + score) wordt automatisch opgeslagen; bij het herladen van de pagina kun je doorgaan waar je gebleven was.
- Op het level-complete-scherm kun je met **Deel je resultaat** je level, trofee en score delen — via het native deelmenu (mobiel/tablet) of anders gekopieerd naar het klembord.

## Techniek

- [Three.js](https://threejs.org/) (meegeleverd in `vendor/three/`, geen internetverbinding nodig om te spelen)
- Doolhofgeneratie: `js/maze.js`
- Scene, besturing, botsingsdetectie en spellogica: `js/game.js`
- Trofeeën (SVG-munten en bokaal): `js/trophies.js`
- Voortgang opslaan: `js/save.js`
- Delen via sociale media: `js/share.js`
