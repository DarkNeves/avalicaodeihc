document.addEventListener('DOMContentLoaded', () => {
  // Dados brutos da avaliação
  const resultados = [
    { p: 'Participante 1', t: 1, tempo: 8, erros: 0, concluiu: true, facilidade: 5 },
    { p: 'Participante 1', t: 2, tempo: 10, erros: 0, concluiu: true, facilidade: 5 },
    { p: 'Participante 1', t: 3, tempo: 2, erros: 0, concluiu: true, facilidade: 5 },
    { p: 'Participante 1', t: 4, tempo: 8, erros: 0, concluiu: true, facilidade: 5 },
  
    { p: 'Participante 2', t: 1, tempo: 11, erros: 0, concluiu: true, facilidade: 5 },
    { p: 'Participante 2', t: 2, tempo: 13, erros: 0, concluiu: true, facilidade: 4 },
    { p: 'Participante 2', t: 3, tempo: 5, erros: 0, concluiu: true, facilidade: 5 },
    { p: 'Participante 2', t: 4, tempo: 17, erros: 1, concluiu: true, facilidade: 4 },
  
    { p: 'Participante 3', t: 1, tempo: 15, erros: 1, concluiu: true, facilidade: 4 },
    { p: 'Participante 3', t: 2, tempo: 17, erros: 0, concluiu: true, facilidade: 4 },
    { p: 'Participante 3', t: 3, tempo: 8, erros: 1, concluiu: true, facilidade: 4 },
    { p: 'Participante 3', t: 4, tempo: 26, erros: 2, concluiu: true, facilidade: 3 },
  
    { p: 'Participante 4', t: 1, tempo: 10, erros: 0, concluiu: true, facilidade: 5 },
    { p: 'Participante 4', t: 2, tempo: 12, erros: 0, concluiu: true, facilidade: 5 },
    { p: 'Participante 4', t: 3, tempo: 4, erros: 0, concluiu: true, facilidade: 5 },
    { p: 'Participante 4', t: 4, tempo: 21, erros: 1, concluiu: true, facilidade: 3 },
  
    { p: 'Participante 5', t: 1, tempo: 12, erros: 0, concluiu: true, facilidade: 5 },
    { p: 'Participante 5', t: 2, tempo: 14, erros: 0, concluiu: true, facilidade: 4 },
    { p: 'Participante 5', t: 3, tempo: 6, erros: 0, concluiu: true, facilidade: 5 },
    { p: 'Participante 5', t: 4, tempo: 18, erros: 1, concluiu: true, facilidade: 4 },
  ];

  // Elementos HTML
  const tableBody = document.getElementById('results-table-body');
  
  // Renderizar Tabela
  if (tableBody) {
    let lastParticipant = null;
    resultados.forEach(row => {
      const isNewParticipant = row.p !== lastParticipant;
      lastParticipant = row.p;
      
      const tr = document.createElement('tr');
      if (isNewParticipant) {
        tr.classList.add('participant-group-start');
        tr.innerHTML = `
          <td rowspan="4" class="participant-name-cell"><strong>${row.p}</strong></td>
          <td>Tarefa ${row.t}</td>
          <td>${row.tempo} s</td>
          <td>${row.erros}</td>
          <td>${row.concluiu ? 'Sim' : 'Não'}</td>
          <td>${row.facilidade}</td>
        `;
      } else {
        tr.innerHTML = `
          <td>Tarefa ${row.t}</td>
          <td>${row.tempo} s</td>
          <td>${row.erros}</td>
          <td>${row.concluiu ? 'Sim' : 'Não'}</td>
          <td>${row.facilidade}</td>
        `;
      }
      tableBody.appendChild(tr);
    });
  }

  // Cálculos de Indicadores
  const totalExecucoes = resultados.length;
  const concluidas = resultados.filter(r => r.concluiu).length;
  const taxaConclusao = (concluidas / totalExecucoes) * 100;
  
  const tempoTotal = resultados.reduce((acc, curr) => acc + curr.tempo, 0);
  const tempoMedioGeral = tempoTotal / totalExecucoes;

  const errosTotal = resultados.reduce((acc, curr) => acc + curr.erros, 0);
  
  const facilidadeTotal = resultados.reduce((acc, curr) => acc + curr.facilidade, 0);
  const facilidadeMediaGeral = facilidadeTotal / totalExecucoes;

  const statsPorTarefa = [1, 2, 3, 4].map(t => {
    const r = resultados.filter(x => x.t === t);
    return {
      t,
      tempoMedio: r.reduce((acc, curr) => acc + curr.tempo, 0) / r.length,
      totalErros: r.reduce((acc, curr) => acc + curr.erros, 0),
      facilidadeMedia: r.reduce((acc, curr) => acc + curr.facilidade, 0) / r.length
    };
  });

  // Renderizar Indicadores
  const updateId = (id, val) => {
    const el = document.getElementById(id);
    if(el) el.innerText = val;
  }
  
  updateId('ind-taxa', taxaConclusao.toFixed(0) + '%');
  updateId('ind-tempo', tempoMedioGeral.toFixed(1) + 's');
  updateId('ind-erros', errosTotal);
  updateId('ind-facilidade', facilidadeMediaGeral.toFixed(1) + '/5');

  // Renderizar Gráficos (Barras em HTML/CSS)
  const renderBarChart = (containerId, data, maxVal, isHighlightT4 = false) => {
    const container = document.getElementById(containerId);
    if(!container) return;
    container.innerHTML = '';
    
    data.forEach(item => {
      const pct = (item.val / maxVal) * 100;
      const isT4 = item.label.includes('4');
      
      const row = document.createElement('div');
      row.className = 'bar-row';
      row.innerHTML = `
        <div class="bar-label">${item.label}</div>
        <div class="bar-track">
          <div class="bar-fill ${isHighlightT4 && isT4 ? 'highlight-fill' : ''}" style="width: 0%" data-width="${pct}%" ${isHighlightT4 && isT4 ? 'style="background:var(--warning)"' : ''}></div>
        </div>
        <div class="bar-val">${item.displayVal}</div>
      `;
      container.appendChild(row);
    });
  };

  const chartTempoData = statsPorTarefa.map(s => ({
    label: `Tarefa ${s.t}`, val: s.tempoMedio, displayVal: s.tempoMedio.toFixed(1) + 's'
  }));
  const chartErroData = statsPorTarefa.map(s => ({
    label: `Tarefa ${s.t}`, val: s.totalErros, displayVal: s.totalErros
  }));
  const chartFacilidadeData = statsPorTarefa.map(s => ({
    label: `Tarefa ${s.t}`, val: s.facilidadeMedia, displayVal: s.facilidadeMedia.toFixed(1)
  }));

  renderBarChart('chart-tempo', chartTempoData, 30);
  renderBarChart('chart-erros', chartErroData, 6, true); // highlight T4
  renderBarChart('chart-facilidade', chartFacilidadeData, 5);

  // Reveal Animations & Animar barras dos gráficos
  const revealElements = document.querySelectorAll('.reveal');
  const barFills = document.querySelectorAll('.bar-fill');

  const revealOnScroll = () => {
    const windowHeight = window.innerHeight;
    
    revealElements.forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.top < windowHeight - 50) {
        el.classList.add('active');
      }
    });

    barFills.forEach(bar => {
      const rect = bar.getBoundingClientRect();
      if (rect.top < windowHeight - 50) {
        bar.style.width = bar.getAttribute('data-width');
        // se tiver highlight via inline css, garantir
        if(bar.classList.contains('highlight-fill')) {
           bar.style.background = 'var(--warning)';
        }
      }
    });
  };

  window.addEventListener('scroll', revealOnScroll);
  revealOnScroll(); // trigger on load

  // Lightbox Modal
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxClose = document.getElementById('lightbox-close');
  const galleryContainers = document.querySelectorAll('.visual-img-container');
  const expandButtons = document.querySelectorAll('.visual-expand-button');
  let lightboxTrigger = null;

  if(lightbox && lightboxImg && lightboxClose) {
    const openLightbox = (img, trigger) => {
      lightboxTrigger = trigger;
      lightboxImg.src = img.src;
      lightboxImg.alt = img.alt;
      lightbox.classList.add('active');
      lightbox.setAttribute('aria-hidden', 'false');
      lightboxClose.focus();
    };

    const closeLightbox = () => {
      lightbox.classList.remove('active');
      lightboxImg.src = '';
      lightboxTrigger?.focus();
      lightbox.setAttribute('aria-hidden', 'true');
      lightboxTrigger = null;
    };

    galleryContainers.forEach(container => {
      const img = container.querySelector('img');
      if(!img) return;

      container.addEventListener('click', () => openLightbox(img, container));
      container.addEventListener('keydown', (e) => {
        if(e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openLightbox(img, container);
        }
      });
    });

    expandButtons.forEach(button => {
      button.addEventListener('click', () => {
        const img = button.closest('.visual-item')?.querySelector('.visual-img-container img');
        if(img) openLightbox(img, button);
      });
    });

    lightboxClose.addEventListener('click', closeLightbox);

    lightbox.addEventListener('click', (e) => {
      if(e.target === lightbox) closeLightbox();
    });

    document.addEventListener('keydown', (e) => {
      if(e.key === 'Escape' && lightbox.classList.contains('active')) {
        closeLightbox();
      }

      if(e.key === 'Tab' && lightbox.classList.contains('active')) {
        e.preventDefault();
        lightboxClose.focus();
      }
    });
  }
});
