---
titel: Hoe werkt navigatie bij robots?
intro: LiDAR, vSLAM, RTK en botssensoren — wat de verschillen betekenen voor het resultaat op je vloer of in je tuin.
beschrijving: Uitleg over robotnavigatie in gewone taal: LiDAR, camera-navigatie, RTK-satelliet en botssensoren, en wanneer welk systeem tekortschiet.
soort: uitleg
bijgewerkt: augustus 2026
---

Navigatie is het verschil tussen een robot die systematisch je huis doet en een die een uur lang rondstuitert en de helft mist. Het is ook de duurste component. Hier staat wat je ervoor terugkrijgt.

::beeld[16/9|Vier navigatiesystemen naast elkaar|Vier kleine plattegronden naast elkaar met de gereden route erin getekend: botssensor (chaotisch), gyroscoop (grove banen), LiDAR (strakke banen), LiDAR plus camera (strakke banen met obstakels netjes ontweken). Dit beeld verkoopt het hele artikel.]

## Botssensoren: rondstuiteren

Het simpelste systeem. De robot rijdt vooruit tot hij ergens tegenaan botst, draait een willekeurige hoek en rijdt verder. Hij heeft geen idee waar hij is geweest.

In een kleine kamer werkt dat verrassend aardig, omdat hij bij genoeg tijd overal wel een keer komt. In een groter huis mist hij structureel stukken en doet hij er drie keer zo lang over. Je vindt dit alleen nog in de goedkoopste modellen.

## Gyroscoop: rechte lijnen zonder kaart

Een stapje verder. De robot houdt met een bewegingssensor bij welke kant hij op rijdt, zodat hij rechte banen kan maaien of stofzuigen. Hij bouwt geen kaart op, dus na het opladen begint hij opnieuw en weet hij niet welk deel al gedaan is.

Prima voor een appartement, frustrerend in een huis met meerdere kamers.

## LiDAR: de ronddraaiende laser

De draaiende koepel bovenop een robotstofzuiger is een laserafstandsmeter. Die schiet honderden keren per seconde een puls af, meet hoelang die terugkomt en bouwt daarmee een plattegrond op — nauwkeurig tot enkele centimeters.

Dit is het punt waarop een robot echt bruikbaar wordt. Hij rijdt in nette banen, weet waar hij al geweest is, kan kamers apart aansturen en onthoudt zijn kaart. Je kunt in de app virtuele muren zetten.

Wat LiDAR **niet** kan: hij ziet vorm, geen inhoud. Een sok, een kabel en een drol zijn voor een laser gewoon obstakels ter grootte van een paar centimeter — en soms ziet hij ze helemaal niet, omdat ze te laag zijn.

## Camera en objectherkenning

Daarom voegen betere modellen een camera toe. Software herkent daarmee wát er ligt: een kabel, een schoen, huisdieruitwerpselen. Die worden ontweken in plaats van overheen gereden.

Werkt dit perfect? Nee. Bij weinig licht wordt het slechter, en donkere kabels op een donkere vloer blijven lastig. Maar het scheelt in de praktijk enorm — het is het verschil tussen een robot die je kunt laten draaien terwijl je weg bent en een die je liever in de gaten houdt.

:::tip Wat dit voor jou betekent
Ligt je vloer meestal leeg, dan is LiDAR zonder camera genoeg en bespaar je een paar honderd euro. Ligt er weleens wat, dan is objectherkenning het meest waardevolle dat je kunt bijkopen — meer dan zuigkracht of een duurder station.
:::

## RTK: satellietnavigatie in de tuin

Robotmaaiers werken buiten en kunnen daarom satellieten gebruiken. Gewone gps is te grof (meters), dus gebruiken ze RTK: een vaste antenne in je tuin meet de fout van het satellietsignaal en corrigeert die, waardoor de maaier tot op enkele centimeters weet waar hij is.

Daarmee verdwijnt de begrenzingsdraad: je loopt de grens één keer uit met de app.

De beperking is fysiek en niet op te lossen met software: onder een dicht bladerdak of vlak langs een hoge gevel bereikt het signaal de antenne niet goed. De maaier stopt dan. Fabrikanten vullen dit aan met camera's en wielsensoren, wat helpt, maar in een tuin met veel bomen blijft een begrenzingsdraad betrouwbaarder.

## Samengevat

| Systeem | Waar | Sterkte | Zwakte |
|---|---|---|---|
| Botssensor | Instap binnen | Goedkoop | Mist stukken, traag |
| Gyroscoop | Instap binnen | Rechte banen | Geen kaart, geen geheugen |
| LiDAR | Binnen vanaf midden | Nauwkeurige kaart, kamers apart | Ziet geen soorten objecten |
| LiDAR plus camera | Binnen, top | Ontwijkt kabels en rommel | Duurder, minder goed in donker |
| RTK-satelliet | Tuin | Geen draad nodig | Hapert onder bomen |
| Begrenzingsdraad | Tuin | Werkt overal | Aanleg kost een middag |

Verder lezen: [dweilsystemen uitgelegd](/dweilen-uitgelegd.html) en [wat obstakelherkenning wel en niet ziet](/obstakelherkenning.html).
