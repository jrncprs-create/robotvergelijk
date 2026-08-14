/* Robotvergelijk — menu, vergelijker en keuzehulp */

(function () {
  'use strict';

  /* ---------------------------------------------------- mobiel menu */
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.querySelector('.main-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  /* ---------------------------------------------------- vergelijker
     Twee tot vijf producten naast elkaar. Uitvinken verbergt een kolom;
     onder de twee kun je niet zakken, want dan valt er niets te vergelijken. */
  document.querySelectorAll('[data-vergelijker]').forEach(function (blok) {
    var vinkjes = blok.querySelectorAll('input[data-vgl]');

    function bijwerken() {
      var aan = [].filter.call(vinkjes, function (v) { return v.checked; });

      vinkjes.forEach(function (v) {
        var id = v.getAttribute('data-vgl');
        var verborgen = !v.checked;
        v.closest('th').classList.toggle('vgl-uit', verborgen);
        blok.querySelectorAll('[data-col="' + id + '"]').forEach(function (cel) {
          cel.classList.toggle('vgl-uit', verborgen);
        });
        // laatste twee kunnen niet uit
        v.disabled = v.checked && aan.length <= 2;
      });
    }

    vinkjes.forEach(function (v) { v.addEventListener('change', bijwerken); });
    bijwerken();
  });

  /* ---------------------------------------------------- keuzehulp */
  var wrap = document.querySelector('[data-wizard]');
  if (!wrap || !window.WIZARD) return;

  var W = window.WIZARD;
  var PRODUCTEN = window.PRODUCTEN || {};
  var body = document.getElementById('wizard-body');
  var stapLabel = document.getElementById('wizard-stap');
  var titelLabel = document.getElementById('wizard-titel');
  var balk = document.getElementById('wizard-progress');

  var pad = [];          // afgelegde vragen
  var score = {};        // product-id -> punten
  var waarschuwingen = [];

  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function toonVraag(sleutel) {
    var v = W.vragen[sleutel];
    if (!v) return;

    titelLabel.textContent = W.intro.titel;
    stapLabel.textContent = 'Vraag ' + (pad.length + 1);
    balk.style.width = Math.min(100, (pad.length / 4) * 100) + '%';

    var html = '<p class="q">' + esc(v.vraag) + '</p>';
    if (v.sub) html += '<p class="qsub">' + esc(v.sub) + '</p>';
    html += '<div class="options">';
    v.opties.forEach(function (o, i) {
      html += '<button class="opt" data-i="' + i + '"><span class="dot"></span><span><b>' +
        esc(o.label) + '</b>' + (o.uitleg ? '<span class="uitleg">' + esc(o.uitleg) + '</span>' : '') +
        '</span></button>';
    });
    html += '</div>';
    html += '<div class="wizard-foot"><button class="linkbtn" data-terug>' +
      (pad.length ? '← Vorige vraag' : '&nbsp;') + '</button>' +
      '<button class="linkbtn" data-opnieuw>Opnieuw beginnen</button></div>';

    body.innerHTML = html;

    body.querySelectorAll('.opt').forEach(function (knop) {
      knop.addEventListener('click', function () {
        var o = v.opties[+knop.getAttribute('data-i')];
        pad.push({ sleutel: sleutel, optie: o });
        if (o.score) for (var k in o.score) score[k] = (score[k] || 0) + o.score[k];
        if (o.waarschuwing) waarschuwingen.push(o.waarschuwing);

        if (o.volgende) toonVraag(o.volgende);
        else toonUitslag(o.resultaat);
        wrap.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });

    var terug = body.querySelector('[data-terug]');
    if (terug && pad.length) terug.addEventListener('click', stapTerug);
    body.querySelector('[data-opnieuw]').addEventListener('click', opnieuw);
  }

  function stapTerug() {
    var vorige = pad.pop();
    if (!vorige) return;
    if (vorige.optie.score) for (var k in vorige.optie.score) score[k] -= vorige.optie.score[k];
    if (vorige.optie.waarschuwing) {
      var idx = waarschuwingen.indexOf(vorige.optie.waarschuwing);
      if (idx > -1) waarschuwingen.splice(idx, 1);
    }
    toonVraag(vorige.sleutel);
  }

  function opnieuw() {
    pad = []; score = {}; waarschuwingen = [];
    toonVraag(W.start);
    wrap.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function toonUitslag(categorie) {
    var lijst = (PRODUCTEN[categorie] || []).slice().sort(function (a, b) {
      return (score[b.id] || 0) - (score[a.id] || 0);
    });
    var top3 = lijst.slice(0, 3);

    balk.style.width = '100%';
    titelLabel.textContent = 'Jouw advies';
    stapLabel.textContent = 'Klaar';

    var html = '';

    // eerlijk advies eerst, ook als dat tegen ons eigen verdienmodel ingaat
    waarschuwingen.forEach(function (w) {
      var waar = W.waarschuwingen[w];
      if (!waar) return;
      html += '<div class="callout warn"><strong>' + esc(waar.kop) + '</strong><p>' + esc(waar.tekst) + '</p></div>';
    });

    if (top3.length) {
      html += '<div class="uitslag-kop"><h3>Jouw top 3</h3>' +
        '<p>Op basis van jouw antwoorden, op volgorde: nummer 1 past het best bij je situatie.</p></div>';

      var rangLabels = ['Onze keuze voor jouw situatie', 'Tweede keuze', 'Derde keuze'];
      top3.forEach(function (p, i) {
        var foto = p.img
          ? '<img class="pick-foto" src="' + p.img + '" alt="' + esc(p.naam) + '" loading="lazy">'
          : '';
        html += '<article class="pick' + (i === 0 ? ' best' : '') + '"><div>' +
          '<span class="rang">' + (i + 1) + '</span>' +
          '<span class="tag' + (i === 0 ? '' : ' alt') + '">' + esc(rangLabels[i]) + '</span>' +
          '<h3>' + esc(p.naam) + '</h3>' +
          '<p>' + esc(p.kort) + '</p>' +
          (i === 0
            ? '<div class="pros-cons">' +
              '<div><h4>Sterk</h4><ul>' + p.voor.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul></div>' +
              '<div><h4>Let op</h4><ul>' + p.tegen.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul></div>' +
              '</div>'
            : '') +
          '</div>' +
          '<div class="pick-cta">' + foto +
          '<a class="btn' + (i === 0 ? '' : ' btn-ghost') + '" href="' + p.link + '" rel="sponsored nofollow noopener" target="_blank">' +
          (i === 0 ? 'Bekijk prijs bij bol' : 'Prijs bekijken') + '</a>' +
          '<small>Prijsklasse ' + esc(p.prijsklasse) + '<br>Actuele prijs zie je bij de winkel</small>' +
          '</div></article>';
      });
    }

    html += '<div class="wizard-foot"><button class="linkbtn" data-terug>← Vorige vraag</button>' +
      '<button class="linkbtn" data-opnieuw>Opnieuw beginnen</button></div>';

    body.innerHTML = html;
    body.querySelector('[data-terug]').addEventListener('click', stapTerug);
    body.querySelector('[data-opnieuw]').addEventListener('click', opnieuw);
  }

  toonVraag(W.start);
})();

/* ---------------------------------------------------- galerij-wissel + video inline afspelen */
(function () {
  document.addEventListener('click', function (e) {
    var t = e.target.closest('.gal-thumb');
    if (t) {
      var gal = t.closest('[data-galerij]');
      gal.querySelector('.gal-hoofd').src = t.getAttribute('data-foto');
      gal.querySelectorAll('.gal-thumb').forEach(function (x) { x.classList.remove('actief'); });
      t.classList.add('actief');
      return;
    }
    var v = e.target.closest('.video-start');
    if (v) {
      e.preventDefault();
      var id = v.getAttribute('data-video');
      var frame = document.createElement('iframe');
      frame.src = 'https://www.youtube-nocookie.com/embed/' + id + '?autoplay=1';
      frame.allow = 'autoplay; encrypted-media; picture-in-picture';
      frame.allowFullscreen = true;
      frame.title = 'Productvideo';
      v.replaceWith(frame);
    }
  });
})();
