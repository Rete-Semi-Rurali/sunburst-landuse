# 🌱 Sunburst Chart - Landuse

**Visualizzazione interattiva di dati gerarchici sull'agricoltura biologica**

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
![GitHub last commit](https://img.shields.io/github/last-commit/Rete-Semi-Rurali/sunburst-landuse)
![GitHub repo size](https://img.shields.io/github/repo-size/Rete-Semi-Rurali/sunburst-landuse)

## 🚀 Introduzione

Questo progetto offre una visualizzazione dati avanzata tramite sunburst chart per analizzare dataset gerarchici relativi all'agricoltura biologica. Permette di esplorare relazioni parte-tutto tra comuni, tipi di coltivazione, specie e varietà.

## ✨ Funzionalità

- **Visualizzazione gerarchica** multi-livello
- **Zoom interattivo** click-to-drill
- **Tooltip informativi** con dettagli metrici
- **Legenda dinamica** con tabella ordinabile
- **Statistiche automatiche** (aree, percentuali, beneficiari)
- **Design responsive** per desktop e mobile
- **Ottimizzato per stampa** (report PDF)

## 📦 Installazione

1. Clona il repository:
```bash
git clone https://github.com/Rete-Semi-Rurali/sunburst-landuse.git
cd sunburst-landuse
```

2. Apri il file `index.html` nel tuo browser preferito.

## 🛠 Configurazione

Modifica `chart.js` per personalizzare:

```javascript
const sunburst = createSunburstVisualization({
  containerId: "chart",
  dataSource: "./data/yourdata.csv",  // Percorso del tuo CSV
  hierarchyLevels: ["livello1", "livello2", "livello3"], // Gerarchia
  valueAttribute: "colonna_valori",   // Colonna con i valori
  colorMappings: {                    // Schema colori
    root: "#f2c993",
    levelColors: {
      livello1: "#ff7f0e",
      livello2: "#2ca02c"
    }
  }
});
```

## 📂 Struttura file CSV

Il file CSV deve contenere:

- Colonne corrispondenti ai livelli gerarchici
- Una colonna con valori numerici
- (Opzionale) Colonne per colori e beneficiari

Esempio:
```csv
comune,tipo_coltivazione,specie,area,beneficiari
Roma,Frumento,Grano Duro,15000,25
Milano,Orzo,Orzo Distico,12000,18
```

## 🌐 Demo online

[Visualizza demo live](https://rete-semi-rurali.github.io/sunburst-landuse/)

## 📄 Documentazione tecnica

### Architettura
- **Librerie**:
  - [sunburst-chart](https://github.com/vasturiano/sunburst-chart) per la visualizzazione
  - [D3.js](https://d3js.org/) per data manipulation
- **Algoritmi**:
  - Ricorsione per costruzione gerarchia
  - Calcolo bottom-up delle statistiche

### Funzioni principali
1. `buildHierarchy()` - Costruisce la struttura ad albero
2. `calculateStats()` - Calcola metriche e percentuali
3. `updateLegend()` - Genera la legenda interattiva

## 🤝 Come contribuire

1. Fai un fork del progetto
2. Crea un branch (`git checkout -b feature/AmazingFeature`)
3. Commit (`git commit -m 'Add some AmazingFeature'`)
4. Push (`git push origin feature/AmazingFeature`)
5. Apri una Pull Request

## 📜 Licenza

Distribuito con licenza MIT. Vedi `LICENSE` per maggiori informazioni.

## 📧 Contatti

Enrico Corsi - enr.studio@gmail.com

Link progetto: [https://github.com/Rete-Semi-Rurali/sunburst-landuse](https://github.com/Rete-Semi-Rurali/sunburst-landuse)