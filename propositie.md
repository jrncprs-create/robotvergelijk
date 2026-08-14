# Robotvergelijk.nl — propositie en verdienmodel

*Vastgelegd op 13 augustus 2026. Dit document is de leidraad voor alle inhoudelijke en
technische keuzes. Wijkt iets hiervan af, dan passen we eerst dit document aan.*

---

## 1. De belofte

**Alle robots die werk uit handen nemen op één plek — vergeleken, en uitgelegd in gewone
mensentaal.**

Waar bestaande sites lijstjes plaatsen, leggen wij uit hóé een robot werkt, waarom de ene
beter is dan de andere, en wanneer je er beter geen moet kopen.

## 2. Positionering

De uitstraling van een portaal (Kieskeurig, Consumentenbond), de inhoud van een
redactionele site (Wirecutter, HouseFresh, Vacuum Wars).

| | Kieskeurig / Tweakers | Consumentenbond | Affiliate-lijstjes | **Robotvergelijk** |
|---|---|---|---|---|
| Breedte | Zeer groot | Groot | Klein | Alle robotcategorieën |
| Uitleg techniek | Nee | Beperkt | Nee | **Kern van de site** |
| Betaalmuur | Nee | Ja | Nee | Nee |
| Eerlijk "niet kopen" | Nee | Soms | Nooit | **Expliciet** |
| Eigen beeld/test | Nee | Ja (lab) | Nee | Later: video en eigen tests |

### Waarom geen vol portaal

Kieskeurig en Tweakers draaien op prijsfeeds van honderden winkels. Die slotgracht is voor
een eenling niet te graven, en een portaal zonder die data is een lege huls. Bovendien
ranken portaalpagina's op merk- en modelnamen, waar we altijd achter bol en Coolblue
staan.

### Waarom redactioneel

We winnen op de vragen die niemand goed beantwoordt: waarom dweilt de een beter, welke
maaier werkt onder bomen, is een raamrobot het waard. Eén goed artikel levert jaren
verkeer op. De conversie per bezoeker ligt hoger, en het past bij wat ons uniek gaat
maken: eigen video en tests.

**Concreet:** portaal-uiterlijk (categorietegels, wizard prominent, vergelijkingstabellen,
vertrouwenssignalen bovenaan), redactionele inhoud.

## 3. Doelgroep

Nederlandse consument die €300–€2.500 gaat uitgeven, zich twee tot zes weken oriënteert en
vooral bang is de verkeerde keuze te maken. Niet de techneut die de specs al kent — de
gewone koper die door de bomen het bos niet meer ziet.

## 4. Categorieën

**Fase 1 (nu):** robotstofzuigers · raamrobots · robotmaaiers · zwembadrobots

**Fase 2 (na bewezen verkeer):** slimme kattenbakken · gootreinigers · grillreinigers ·
zwembadskimmers · bewakingsrobots — alles wat autonoom een klus doet.

De verkeersstrategie per categorie verschilt:

| Categorie | Concurrentie | Rol |
|---|---|---|
| Robotstofzuigers | Zeer hoog | Volume en autoriteit, lange adem |
| Raamrobots | Middel, veel spam | Snel te winnen met echte uitleg |
| Robotmaaiers (RTK) | Middel | Seizoenspiek voorjaar, hoge orderwaarde |
| Zwembadrobots | Laag | Snelste winst, hoge orderwaarde |

## 5. Onderscheidend vermogen

1. **Eén plek voor álle robotcategorieën** — niemand doet dit in Nederland.
2. **Keuzewizard** die eindigt in concreet advies, inclusief "niet kopen"-uitkomsten.
3. **Uitlegartikelen** over de techniek: navigatie, dweilsystemen, obstakelherkenning.
4. **Eerlijkheid als merk**: we schrijven op wanneer een robot je probleem niet oplost.
5. **Later: eigen beeld** — robot-POV-opnames en top-down timelapses die laten zien of een
   robot systematisch werkt of chaotisch rondstuitert. Dat heeft geen enkele concurrent.

## 6. Verdienmodel

| Bron | Wanneer | Indicatie |
|---|---|---|
| Affiliate bol (tot 7%) | Vanaf goedkeuring | €20–70 per verkoop |
| Affiliate Amazon, Coolblue, merken (Daisycon, Awin, TradeTracker) | Na 1–3 maanden | Vaak hoger dan bol |
| Leads voor installatie (zwembad, maaier) | Na circa 6 maanden | €15–40 per lead |
| Display en gesponsorde content | Vanaf circa 20.000 bezoekers p/m | Aanvullend |

**Realistische verwachting**

- Maand 1–3: vrijwel geen omzet, verkeer opbouwen
- Maand 6: enkele honderden euro's per maand
- Maand 12: €1.000–2.500 per maand bij consequent publiceren plus YouTube

Geen snelle winst, wel een bezit dat elk jaar meer waard wordt.

**Kritieke succesfactor:** verkeer. Alles staat of valt met vindbaarheid, niet met de site.

## 7. Randvoorwaarden (bol-affiliatevoorwaarden)

- Geldig btw-nummer verplicht (art. 3.13) — aanmelden op naam van het bedrijf
- Geen harde prijzen tonen die kunnen afwijken (art. 3.6) — we tonen prijsklassen en
  verwijzen naar de actuele prijs bij de winkel
- Expliciet vermelden dat we doorlinken naar bol (art. 3.8v) — disclosure op elke pagina
  met affiliate-links
- Originele content met toegevoegde waarde, geen kale productlijsten (art. 2.6i)
- Geen ge-ript beeldmateriaal (art. 3.2) — alleen persmateriaal, stock, of eigen werk
- Uitbetaling vanaf €50 opgebouwde commissie, cookie 5 dagen, last cookie counts

Amazon volgt later: die eist circa tien artikelen én drie verkopen binnen 180 dagen, en
een afgewezen aanvraag kan niet opnieuw worden ingediend.

## 8. Techniek

Statische site, opgebouwd uit losse onderdelen:

```
content/     alle tekst en productdata (json + markdown)
templates/   de opmaak, volledig los van de content
assets/      css, javascript, beeld
build.js     genereert de statische site in public/
```

Gehost bij Cloud86 op het bestaande cprs.nl-pakket. Deze structuur maakt het mogelijk om
later een git-gebaseerd CMS (Decap, Sveltia) aan te koppelen zonder de site te herbouwen.
