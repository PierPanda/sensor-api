# La Browser Sensor API

## C'est quoi ?

La **Browser Sensor API** (ou *Generic Sensor API*) est un ensemble d'interfaces JavaScript standardisées qui permettent à une page web d'accéder aux **capteurs physiques d'un appareil** — accéléromètre, gyroscope, magnétomètre, lumière ambiante — directement depuis le navigateur, sans plugin ni application native.

L'idée centrale : un seul modèle de programmation unifié pour tous les capteurs, au lieu d'APIs disparates inventées au cas par cas.

---

## Un peu d'histoire

| Année | Événement |
|-------|-----------|
| **2007** | Sortie de l'iPhone. Le web mobile explose, mais les capteurs restent inaccessibles aux développeurs web. |
| **2009–2011** | Apparition des premières APIs expérimentales : `DeviceOrientationEvent` et `DeviceMotionEvent` (W3C). Pratiques, mais non standardisées, peu précises, syntaxe incohérente. |
| **2015** | Le W3C lance le groupe de travail **Devices and Sensors**. Objectif : reprendre tout ça proprement. |
| **2016** | Premier brouillon public de la **Generic Sensor API**. Intel contribue activement aux spécifications. |
| **2018** | Chrome 67 est le premier navigateur à implémenter l'API en production (`Accelerometer`, `Gyroscope`, `LinearAccelerationSensor`, `AbsoluteOrientationSensor`). |
| **2019–2021** | Ajout progressif : `GravitySensor`, `RelativeOrientationSensor`, `AmbientLightSensor` (derrière flag). |
| **Aujourd'hui** | L'API est stable sur Chrome/Edge. Firefox et Safari n'ont pas encore implémenté le standard générique. |

---

## Pourquoi cette API ?

### Le problème avant

Avant la Generic Sensor API, chaque capteur avait son propre fonctionnement :

```js
// Ancienne façon — incohérente, peu précise
window.addEventListener('devicemotion', (event) => {
  console.log(event.accelerationIncludingGravity.x);
});
```

Problèmes :
- Pas de contrôle sur la **fréquence** de lecture
- Pas de gestion des **permissions** claire
- Pas de **timestamp** synchronisé entre capteurs
- Comportement différent selon les navigateurs

### La solution

```js
// Nouvelle façon — Generic Sensor API
const sensor = new Accelerometer({ frequency: 60 });
sensor.addEventListener('reading', () => {
  console.log(sensor.x, sensor.y, sensor.z);
});
sensor.start();
```

Un modèle unique : **instancier → écouter → démarrer**.

---

## Par qui ?

- **W3C** — *World Wide Web Consortium* : l'organisme de standardisation du web, qui publie les spécifications
- **Intel** : contributeur principal des premières spécifications (intérêt pour les appareils embarqués)
- **Google / Chromium** : premier implémenteur, moteur principal du développement
- **Mozilla & Apple** : observateurs — pas encore d'implémentation côté Firefox et Safari

---

## Pour quoi faire ?

La Generic Sensor API ouvre la voie à des expériences web qui n'étaient possibles qu'en natif :

| Usage | Capteur utilisé |
|-------|----------------|
| Jeux contrôlés par le mouvement | Accelerometer, Gyroscope |
| Navigation et boussole | Magnetometer, AbsoluteOrientationSensor |
| Réalité augmentée dans le navigateur | AbsoluteOrientationSensor |
| Niveau à bulle, outil de mesure | GravitySensor |
| Interface adaptative à la luminosité | AmbientLightSensor |
| Fitness / détection de pas | LinearAccelerationSensor |

---

## Les capteurs disponibles

```
Generic Sensor API
│
├── Mouvement
│   ├── Accelerometer          → x, y, z en m/s² (avec gravité)
│   ├── LinearAccelerationSensor → x, y, z en m/s² (sans gravité)
│   └── GravitySensor          → composante gravitationnelle seule
│
├── Rotation
│   └── Gyroscope              → vitesse angulaire en rad/s
│
├── Orientation
│   ├── AbsoluteOrientationSensor → quaternion relatif à la Terre
│   └── RelativeOrientationSensor → quaternion relatif au démarrage
│
├── Environnement
│   ├── Magnetometer           → champ magnétique en μT
│   └── AmbientLightSensor     → luminosité en lux
```

---

## Comment ça fonctionne ?

### 1. Sécurité d'abord

L'accès aux capteurs est soumis à :
- Un **contexte sécurisé** (HTTPS ou localhost)
- L'**API Permissions** du navigateur
- Une **Permissions Policy** côté serveur (pour les iframes)

```js
const result = await navigator.permissions.query({ name: 'accelerometer' });
// result.state === 'granted' | 'denied' | 'prompt'
```

### 2. Cycle de vie d'un capteur

```
new Sensor({ frequency: 60 })
    │
    ▼
.start()  ──► 'activate'
    │
    ▼
boucle de lecture ──► 'reading'  (sensor.x, sensor.y, sensor.z)
    │
    ▼
.stop()   ──► capteur mis en pause
```

### 3. Limites connues

- **Desktop** : les APIs de mouvement ne sont pas exposées sur ordinateur (pas de hardware)
- **Firefox / Safari** : pas d'implémentation de la Generic Sensor API
- **Vie privée** : les navigateurs limitent la précision pour éviter le fingerprinting
- **Batterie** : un capteur actif consomme de l'énergie — toujours appeler `.stop()` quand inutile

---

## Ce projet

Ce projet illustre trois APIs de capteurs disponibles **sur navigateur desktop** :

| API | Capteur simulé | Donnée |
|-----|---------------|--------|
| `getUserMedia` (audio) | Microphone | Niveau sonore en dB |
| `getUserMedia` (vidéo) | Caméra | Luminosité ambiante en % |
| `Network Information API` | Réseau | Débit, latence, type de connexion |

> Ces APIs ne font pas partie de la Generic Sensor API au sens strict, mais elles suivent le même principe : **lire des données physiques du monde réel depuis le navigateur**.

---

## Ressources

- [W3C Generic Sensor API Spec](https://www.w3.org/TR/generic-sensor/)
- [MDN — Sensor APIs](https://developer.mozilla.org/en-US/docs/Web/API/Sensor_APIs)
- [Chrome Developers — Sensors for the Web](https://developer.chrome.com/docs/capabilities/web-apis/generic-sensor)
