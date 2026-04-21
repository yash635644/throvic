'use client';

import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

export default function Page() {
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const state = {
      nodes: [] as any[],
      links: [] as any[],
      selectedNode: null as any,
      isGenerating: false,
      history: [] as string[],
      journey: [] as any[],
      maxDepth: 0,
      hiddenCategories: new Set<string>(),
      layoutMode: 'force'
    };

    const ui = {
      searchInput: document.getElementById('search') as HTMLInputElement,
      goBtn: document.getElementById('go-btn') as HTMLButtonElement,
      randomBtn: document.getElementById('random-btn') as HTMLButtonElement,
      resetBtn: document.getElementById('reset-btn') as HTMLButtonElement,
      shareBtn: document.getElementById('share-btn') as HTMLButtonElement,
      layoutSelect: document.getElementById('layout-select') as HTMLSelectElement,
      localSearch: document.getElementById('local-search') as HTMLInputElement,
      emptyState: document.getElementById('empty-state') as HTMLDivElement,
      loading: document.getElementById('loading') as HTMLDivElement,
      loadingText: document.getElementById('loading-text') as HTMLDivElement,
      infoPanel: document.getElementById('info-panel') as HTMLDivElement,
      infoCategory: document.getElementById('info-category') as HTMLDivElement,
      infoTitle: document.getElementById('info-title') as HTMLHeadingElement,
      infoDesc: document.getElementById('info-desc') as HTMLParagraphElement,
      infoImageContainer: document.getElementById('info-image-container') as HTMLDivElement,
      infoImage: document.getElementById('info-image') as HTMLImageElement,
      infoLink: document.getElementById('info-link') as HTMLAnchorElement,
      expandBtn: document.getElementById('expand-btn') as HTMLButtonElement,
      closeInfo: document.getElementById('close-info') as HTMLButtonElement,
      infoError: document.getElementById('info-error') as HTMLDivElement,
      legend: document.getElementById('legend') as HTMLDivElement,
      counters: document.getElementById('counters') as HTMLDivElement,
      countNodes: document.getElementById('count-nodes') as HTMLDivElement,
      countDepth: document.getElementById('count-depth') as HTMLDivElement,
      history: document.getElementById('history') as HTMLDivElement,
      tooltip: document.getElementById('tooltip') as HTMLDivElement,
      toast: document.getElementById('toast') as HTMLDivElement,
      starterPills: document.querySelectorAll('.starter-pill'),
      breadcrumbs: document.getElementById('breadcrumbs') as HTMLDivElement,
      physicsBtn: document.getElementById('physics-btn') as HTMLButtonElement,
      physicsPanel: document.getElementById('physics-panel') as HTMLDivElement,
      closePhysics: document.getElementById('close-physics') as HTMLButtonElement,
      sliderGravity: document.getElementById('slider-gravity') as HTMLInputElement,
      sliderRepulsion: document.getElementById('slider-repulsion') as HTMLInputElement,
      sliderLink: document.getElementById('slider-link') as HTMLInputElement,
      valGravity: document.getElementById('val-gravity') as HTMLSpanElement,
      valRepulsion: document.getElementById('val-repulsion') as HTMLSpanElement,
      valLink: document.getElementById('val-link') as HTMLSpanElement,
      freezeBtn: document.getElementById('freeze-btn') as HTMLButtonElement
    };

    // Colors mapping
    const categoryColors: Record<string, string> = {
      'science': '#7F77DD', 'math': '#7F77DD', 'physics': '#7F77DD',
      'history': '#5DCAA5', 'people': '#5DCAA5', 'person': '#5DCAA5',
      'philosophy': '#EF9F27', 'idea': '#EF9F27', 'concept': '#EF9F27',
      'culture': '#F0997B', 'art': '#F0997B', 'music': '#F0997B', 'literature': '#F0997B',
      'technology': '#85B7EB', 'computing': '#85B7EB', 'engineering': '#85B7EB',
      'nature': '#97C459', 'biology': '#97C459', 'environment': '#97C459',
      'default': '#AFA9EC'
    };

    function getColor(category: string) {
      const cat = (category || '').toLowerCase();
      for (const key in categoryColors) {
        if (cat.includes(key)) return categoryColors[key];
      }
      return categoryColors.default;
    }

    function showToast(msg: string) {
      ui.toast.textContent = msg;
      ui.toast.classList.add('show');
      setTimeout(() => ui.toast.classList.remove('show'), 3000);
    }

    function updateCounters() {
      ui.countNodes.textContent = state.nodes.length.toString();
      ui.countDepth.textContent = state.maxDepth.toString();
      if (state.nodes.length > 0) {
        ui.counters.style.display = 'flex';
        ui.legend.style.display = 'block';
        ui.emptyState.classList.add('hidden');
        if(ui.localSearch) ui.localSearch.style.display = 'block';
      } else {
        ui.counters.style.display = 'none';
        ui.legend.style.display = 'none';
        ui.emptyState.classList.remove('hidden');
        if(ui.localSearch) ui.localSearch.style.display = 'none';
      }
    }

    function updateBreadcrumbs() {
      if (state.journey.length === 0) {
        ui.breadcrumbs.classList.remove('visible');
        return;
      }
      ui.breadcrumbs.classList.add('visible');
      ui.breadcrumbs.innerHTML = '';
      
      state.journey.forEach((node, index) => {
        const item = document.createElement('span');
        item.className = `breadcrumb-item ${index === state.journey.length - 1 ? 'active' : ''}`;
        item.textContent = node.title;
        item.onclick = () => {
          state.journey = state.journey.slice(0, index + 1);
          updateBreadcrumbs();
          selectNode(node);
        };
        ui.breadcrumbs.appendChild(item);
        
        if (index < state.journey.length - 1) {
          const sep = document.createElement('span');
          sep.className = 'breadcrumb-separator';
          sep.textContent = ' → ';
          ui.breadcrumbs.appendChild(sep);
        }
      });
    }

    function updateHistory(topic: string) {
      if (!state.history.includes(topic)) {
        state.history.push(topic);
        if (state.history.length > 5) state.history.shift();
        renderHistory();
      }
    }

    function renderHistory() {
      ui.history.innerHTML = '';
      state.history.forEach(topic => {
        const pill = document.createElement('div');
        pill.className = 'history-pill';
        pill.textContent = topic;
        pill.onclick = () => {
          ui.searchInput.value = topic;
          startExploration(topic);
        };
        ui.history.appendChild(pill);
      });
    }

    ui.layoutSelect.addEventListener('change', (e) => {
      state.layoutMode = (e.target as HTMLSelectElement).value;
      applyLayout();
    });

    // Starter Pills
    ui.starterPills.forEach(pill => {
      pill.addEventListener('click', (e) => {
        const topic = (e.target as HTMLElement).getAttribute('data-topic');
        if (topic) {
          ui.searchInput.value = topic;
          startExploration(topic);
        }
      });
    });

    // Physics Panel
    ui.physicsBtn.addEventListener('click', () => {
      ui.physicsPanel.classList.toggle('visible');
    });
    
    ui.closePhysics.addEventListener('click', () => {
      ui.physicsPanel.classList.remove('visible');
    });

    ui.sliderGravity.addEventListener('input', (e) => {
      const val = (e.target as HTMLInputElement).value;
      ui.valGravity.textContent = val;
      simulation.force('x', d3.forceX(width / 2).strength(parseFloat(val)));
      simulation.force('y', d3.forceY(height / 2).strength(parseFloat(val)));
      simulation.alpha(0.3).restart();
    });

    ui.sliderRepulsion.addEventListener('input', (e) => {
      const val = (e.target as HTMLInputElement).value;
      ui.valRepulsion.textContent = val;
      simulation.force('charge', d3.forceManyBody().strength(parseFloat(val)));
      simulation.alpha(0.3).restart();
    });

    ui.sliderLink.addEventListener('input', (e) => {
      const val = (e.target as HTMLInputElement).value;
      ui.valLink.textContent = val;
      simulation.force('link', d3.forceLink(state.links).id((d: any) => d.id).distance(parseFloat(val)));
      simulation.alpha(0.3).restart();
    });

    // Setup legend interactivity
    const legendItems = document.querySelectorAll('.legend-item');
    legendItems.forEach(item => {
      item.addEventListener('click', (e) => {
        const target = e.currentTarget as HTMLElement;
        const category = target.getAttribute('data-category');
        if (!category) return;

        if (state.hiddenCategories.has(category)) {
          state.hiddenCategories.delete(category);
          target.classList.remove('hidden-category');
        } else {
          state.hiddenCategories.add(category);
          target.classList.add('hidden-category');
        }
        updateGraph();
      });
    });

    ui.resetBtn.addEventListener('click', () => {
      state.nodes = [];
      state.links = [];
      state.selectedNode = null;
      state.maxDepth = 0;
      ui.infoPanel.classList.remove('visible');
      updateGraph();
      updateCounters();
      ui.searchInput.value = '';
    });

    ui.randomBtn.addEventListener('click', () => {
      const topics = ['Quantum Entanglement', 'Roman Architecture', 'Jazz Harmony', 'CRISPR', 'Stoicism', 'Origami Mathematics', 'Cyberpunk', 'Mycology'];
      const randomTopic = topics[Math.floor(Math.random() * topics.length)];
      ui.searchInput.value = randomTopic;
      startExploration(randomTopic);
    });

    ui.shareBtn.addEventListener('click', () => {
      if (state.nodes.length === 0) return;
      const rootNode = state.nodes.find(n => n.depth === 0);
      if (rootNode) {
        const url = new URL(window.location.href);
        url.searchParams.set('q', rootNode.id);
        navigator.clipboard.writeText(url.toString());
        showToast('Link copied to clipboard!');
      }
    });

    ui.localSearch?.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        const q = ui.localSearch.value.toLowerCase().trim();
        if (!q) return;
        const match = state.nodes.find(n => n.title.toLowerCase().includes(q) || n.id.toLowerCase().includes(q));
        if (match) {
          selectNode(match);
          ui.localSearch.value = '';
        } else {
          showToast('Node not found on canvas!');
        }
      }
    });

    let isFrozen = false;
    ui.freezeBtn?.addEventListener('click', () => {
      isFrozen = !isFrozen;
      if (isFrozen) {
        simulation.alpha(0).stop();
        ui.freezeBtn.classList.add('paused');
        ui.freezeBtn.textContent = '▶️';
      } else {
        simulation.alpha(0.3).restart();
        ui.freezeBtn.classList.remove('paused');
        ui.freezeBtn.textContent = '⏸️';
      }
    });

    ui.goBtn.addEventListener('click', () => {
      const topic = ui.searchInput.value.trim();
      if (topic) startExploration(topic);
    });

    ui.searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        const topic = ui.searchInput.value.trim();
        if (topic) startExploration(topic);
      }
    });

    ui.expandBtn.addEventListener('click', () => {
      if (state.selectedNode && !state.isGenerating) {
        expandNode(state.selectedNode);
      }
    });

    ui.closeInfo.addEventListener('click', () => {
      ui.infoPanel.classList.remove('visible');
      state.selectedNode = null;
      nodeElements.classed('selected', false);
    });

    // Swipe-to-dismiss for mobile info panel
    let touchStartY = 0;
    let touchCurrentY = 0;
    let isSwiping = false;

    ui.infoPanel.addEventListener('touchstart', (e) => {
      touchStartY = e.touches[0].clientY;
      isSwiping = true;
      ui.infoPanel.classList.add('swiping');
    }, { passive: true });

    ui.infoPanel.addEventListener('touchmove', (e) => {
      if (!isSwiping) return;
      touchCurrentY = e.touches[0].clientY;
      const deltaY = touchCurrentY - touchStartY;
      if (deltaY > 0) {
        ui.infoPanel.style.transform = `translateY(${deltaY}px)`;
      }
    }, { passive: true });

    ui.infoPanel.addEventListener('touchend', () => {
      if (!isSwiping) return;
      isSwiping = false;
      ui.infoPanel.classList.remove('swiping');
      const deltaY = touchCurrentY - touchStartY;
      if (deltaY > 80) {
        ui.infoPanel.classList.remove('visible');
        ui.infoPanel.style.transform = '';
        state.selectedNode = null;
        nodeElements.classed('selected', false);
      } else {
        ui.infoPanel.style.transform = '';
      }
      touchStartY = 0;
      touchCurrentY = 0;
    }, { passive: true });

    // Check URL params
    const params = new URLSearchParams(window.location.search);
    const q = params.get('q');
    if (q) {
      ui.searchInput.value = q;
      setTimeout(() => startExploration(q), 500);
    }



    async function startExploration(topic: string) {
      if (state.isGenerating) return;

      state.isGenerating = true;
      ui.goBtn.disabled = true;
      ui.loading.style.display = 'flex';
      ui.loadingText.textContent = `Exploring "${topic}"...`;
      ui.infoPanel.classList.remove('visible');

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

      try {
        const res = await fetch(`${apiUrl}/api/explore`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ topic })
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || 'Failed to fetch');
        }
        const result = await res.json();

        // Reset graph
        state.nodes = [];
        state.links = [];
        state.maxDepth = 0;

        // Process result
        const rootId = result.nodes[0].id;

        result.nodes.forEach((n: any) => {
          state.nodes.push({
            id: n.id,
            title: n.title || n.id,
            category: n.category || 'other',
            description: n.description || '',
            url: n.url || '',
            depth: n.id === rootId ? 0 : 1,
            expanded: false,
            x: width / 2 + (Math.random() - 0.5) * 100,
            y: height / 2 + (Math.random() - 0.5) * 100
          });
        });

        result.links.forEach((l: any) => {
          state.links.push({
            source: l.source,
            target: l.target,
            label: l.label || ''
          });
        });

        state.maxDepth = 1;
        updateHistory(topic);
        updateGraph();
        updateCounters();

        // Auto-select root
        const rootNode = state.nodes.find(n => n.id === rootId);
        if (rootNode) {
          state.journey = [rootNode];
          updateBreadcrumbs();
          selectNode(rootNode);
        }

      } catch (err: any) {
        console.error(err);
        alert(`Error: ${err.message}`);
      } finally {
        state.isGenerating = false;
        ui.goBtn.disabled = false;
        ui.loading.style.display = 'none';
      }
    }

    async function expandNode(node: any) {
      if (state.isGenerating || node.expanded) return;

      state.isGenerating = true;
      ui.expandBtn.disabled = true;
      ui.expandBtn.textContent = 'Loading...';
      ui.loading.style.display = 'flex';
      ui.loadingText.textContent = `Expanding "${node.title}"...`;
      ui.infoError.style.display = 'none';

      try {
        // Get context from existing links
        const existingNodeIds = state.nodes.map(n => n.id);
        const existingConnections = state.links
          .filter(l => l.source.id === node.id || l.target.id === node.id)
          .map(l => l.source.id === node.id ? l.target.id : l.source.id);

        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

        const res = await fetch(`${apiUrl}/api/expand`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            node, 
            existingConnections, 
            existingNodeIds 
          })
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || 'Failed to expand');
        }
        const result = await res.json();

        let newNodesAdded = 0;

        result.nodes.forEach((n: any) => {
          // Check if node already exists
          if (!state.nodes.find(existing => existing.id === n.id)) {
            state.nodes.push({
              id: n.id,
              title: n.title || n.id,
              category: n.category || 'other',
              description: n.description || '',
              url: n.url || '',
              depth: node.depth + 1,
              expanded: false,
              x: node.x + (Math.random() - 0.5) * 50,
              y: node.y + (Math.random() - 0.5) * 50
            });
            newNodesAdded++;
          }
        });

        result.links.forEach((l: any) => {
          // Check if link already exists
          const exists = state.links.find(existing =>
            (existing.source.id === l.source && existing.target.id === l.target) ||
            (existing.source === l.source && existing.target === l.target)
          );

          if (!exists) {
            state.links.push({
              source: l.source,
              target: l.target,
              label: l.label || ''
            });
          }
        });

        node.expanded = true;
        if (node.depth + 1 > state.maxDepth) state.maxDepth = node.depth + 1;

        updateGraph();
        updateCounters();

        ui.expandBtn.textContent = 'Node fully expanded';

      } catch (err: any) {
        console.error(err);
        ui.infoError.textContent = `Error: ${err.message}`;
        ui.infoError.style.display = 'block';
        ui.expandBtn.textContent = 'Try again';
        ui.expandBtn.disabled = false;
      } finally {
        state.isGenerating = false;
        ui.loading.style.display = 'none';
      }
    }

    // D3 Setup
    const svg = d3.select('#graph');
    let width = window.innerWidth;
    let height = window.innerHeight;

    svg.attr('width', width).attr('height', height);

    // Add zoom container
    const g = svg.append('g');

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on('zoom', (e) => {
        g.attr('transform', e.transform);
      });

    svg.call(zoom as any);

    // Defs for arrows and filters
    const defs = svg.append('defs');

    // Arrow marker
    defs.append('marker')
      .attr('id', 'arrow')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 25) // Offset from node center
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('fill', 'rgba(255,255,255,0.3)')
      .attr('d', 'M0,-5L10,0L0,5');

    // Glow filter
    const filter = defs.append('filter').attr('id', 'glow');
    filter.append('feGaussianBlur').attr('stdDeviation', '3').attr('result', 'coloredBlur');
    const feMerge = filter.append('feMerge');
    feMerge.append('feMergeNode').attr('in', 'coloredBlur');
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    // Simulation
    const simulation = d3.forceSimulation()
      .force('link', d3.forceLink().id((d: any) => d.id).distance(120))
      .force('charge', d3.forceManyBody().strength(-400))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collide', d3.forceCollide().radius(40));

    let linkElements: any = g.append('g').attr('class', 'links').selectAll('.link');
    let linkLabels: any = g.append('g').attr('class', 'link-labels').selectAll('.link-label');
    let nodeElements: any = g.append('g').attr('class', 'nodes').selectAll('.node-group');

    function applyLayout() {
      if (state.layoutMode === 'force') {
        simulation
          .force('link', d3.forceLink(state.links).id((d: any) => d.id).distance(120))
          .force('charge', d3.forceManyBody().strength(-400))
          .force('center', d3.forceCenter(width / 2, height / 2))
          .force('radial', null)
          .force('y', null)
          .force('x', null);
      } else if (state.layoutMode === 'radial') {
        simulation
          .force('link', d3.forceLink(state.links).id((d: any) => d.id).distance(50))
          .force('charge', d3.forceManyBody().strength(-200))
          .force('center', d3.forceCenter(width / 2, height / 2))
          .force('radial', d3.forceRadial((d: any) => d.depth * 150, width / 2, height / 2).strength(0.8))
          .force('y', null)
          .force('x', null);
      } else if (state.layoutMode === 'tree') {
        simulation
          .force('link', d3.forceLink(state.links).id((d: any) => d.id).distance(50))
          .force('charge', d3.forceManyBody().strength(-300))
          .force('center', null)
          .force('radial', null)
          .force('y', d3.forceY((d: any) => d.depth * 120 + 100).strength(1))
          .force('x', d3.forceX(width / 2).strength(0.1));
      }
      simulation.alpha(1).restart();
    }

    function updateGraph() {
      // Calculate degrees for dynamic sizing
      const degrees: Record<string, number> = {};
      state.links.forEach((l: any) => {
        const sourceId = typeof l.source === 'object' ? l.source.id : l.source;
        const targetId = typeof l.target === 'object' ? l.target.id : l.target;
        degrees[sourceId] = (degrees[sourceId] || 0) + 1;
        degrees[targetId] = (degrees[targetId] || 0) + 1;
      });
      state.nodes.forEach(n => {
        n.degree = degrees[n.id] || 0;
      });

      // Filter logic (visual only, keep in simulation)
      const isHidden = (category: string) => {
        const cat = (category || '').toLowerCase();
        for (const hiddenCat of state.hiddenCategories) {
          if (cat.includes(hiddenCat)) return true;
        }
        if (state.hiddenCategories.has('default') && !Object.keys(categoryColors).some(k => cat.includes(k) && k !== 'default')) {
          return true;
        }
        return false;
      };

      // Update links
      linkElements = linkElements.data(state.links, (d: any) => `${d.source.id || d.source}-${d.target.id || d.target}`);
      linkElements.exit().remove();
      const linkEnter = linkElements.enter().append('path')
        .attr('class', 'link')
        .attr('marker-end', 'url(#arrow)');
      linkElements = linkEnter.merge(linkElements as any);
      
      linkElements.classed('hidden-element', (d: any) => {
        const sourceCat = typeof d.source === 'object' ? d.source.category : state.nodes.find(n => n.id === d.source)?.category;
        const targetCat = typeof d.target === 'object' ? d.target.category : state.nodes.find(n => n.id === d.target)?.category;
        return isHidden(sourceCat) || isHidden(targetCat);
      });

      // Update link labels
      linkLabels = linkLabels.data(state.links, (d: any) => `${d.source.id || d.source}-${d.target.id || d.target}`);
      linkLabels.exit().remove();
      const labelEnter = linkLabels.enter().append('text')
        .attr('class', 'link-label')
        .attr('dy', -4)
        .text((d: any) => d.label);
      linkLabels = labelEnter.merge(linkLabels as any);

      linkLabels.classed('hidden-element', (d: any) => {
        const sourceCat = typeof d.source === 'object' ? d.source.category : state.nodes.find(n => n.id === d.source)?.category;
        const targetCat = typeof d.target === 'object' ? d.target.category : state.nodes.find(n => n.id === d.target)?.category;
        return isHidden(sourceCat) || isHidden(targetCat);
      });

      // Update nodes
      nodeElements = nodeElements.data(state.nodes, (d: any) => d.id);
      nodeElements.exit().remove();

      const nodeEnter = nodeElements.enter().append('g')
        .attr('class', 'node-group')
        .call(d3.drag<SVGGElement, any>()
          .on('start', dragstarted)
          .on('drag', dragged)
          .on('end', dragended))
        .on('click', (e: any, d: any) => {
          if (d.__dragged) return;
          selectNode(d);
        })
        .on('mouseenter', (e: any, d: any) => {
          // Focus mode
          nodeElements.classed('hidden-element', (n: any) => {
            return n.id !== d.id && !state.links.some((l: any) => 
              (l.source.id === d.id && l.target.id === n.id) || 
              (l.source.id === n.id && l.target.id === d.id)
            );
          });
          linkElements.classed('hidden-element', (l: any) => {
            return l.source.id !== d.id && l.target.id !== d.id;
          }).classed('highlighted', (l: any) => {
            return l.source.id === d.id || l.target.id === d.id;
          });
          linkLabels.classed('hidden-element', (l: any) => {
            return l.source.id !== d.id && l.target.id !== d.id;
          });
          
          ui.tooltip.textContent = d.category;
          ui.tooltip.style.opacity = '1';
          ui.tooltip.style.left = (e.pageX + 10) + 'px';
          ui.tooltip.style.top = (e.pageY + 10) + 'px';
        })
        .on('mouseleave', () => {
          // Reset focus mode
          nodeElements.classed('hidden-element', (d: any) => isHidden(d.category));
          linkElements.classed('hidden-element', (d: any) => {
            const sourceCat = typeof d.source === 'object' ? d.source.category : state.nodes.find(n => n.id === d.source)?.category;
            const targetCat = typeof d.target === 'object' ? d.target.category : state.nodes.find(n => n.id === d.target)?.category;
            return isHidden(sourceCat) || isHidden(targetCat);
          }).classed('highlighted', false);
          linkLabels.classed('hidden-element', (d: any) => {
            const sourceCat = typeof d.source === 'object' ? d.source.category : state.nodes.find(n => n.id === d.source)?.category;
            const targetCat = typeof d.target === 'object' ? d.target.category : state.nodes.find(n => n.id === d.target)?.category;
            return isHidden(sourceCat) || isHidden(targetCat);
          });
          
          ui.tooltip.style.opacity = '0';
        });

      // Root pulse animation
      nodeEnter.filter((d: any) => d.depth === 0)
        .append('circle')
        .attr('class', 'root-pulse')
        .attr('r', 28);

      nodeEnter.append('circle')
        .attr('class', 'node')
        .attr('fill', (d: any) => getColor(d.category))
        .attr('r', 0) // Start at 0 for spawn animation
        .transition().duration(600).ease(d3.easeBackOut)
        .attr('r', (d: any) => Math.min(40, 15 + (d.degree * 2.5) + (d.depth === 0 ? 5 : 0)));

      nodeEnter.append('text')
        .attr('class', 'node-label')
        .text((d: any) => d.title)
        .style('opacity', 0)
        .transition().duration(600).delay(200)
        .style('opacity', 1);

      nodeElements = nodeEnter.merge(nodeElements as any);

      // Apply dynamic sizing and visibility
      nodeElements.classed('hidden-element', (d: any) => isHidden(d.category));
      
      nodeElements.select('.node')
        .attr('r', (d: any) => Math.min(40, 15 + (d.degree * 2.5) + (d.depth === 0 ? 5 : 0)));
        
      nodeElements.select('.node-label')
        .attr('dy', (d: any) => Math.min(40, 15 + (d.degree * 2.5) + (d.depth === 0 ? 5 : 0)) + 12);

      // Update simulation
      simulation.nodes(state.nodes).on('tick', ticked);
      (simulation.force('link') as d3.ForceLink<any, any>).links(state.links);
      simulation.alpha(1).restart();
    }

    function ticked() {
      linkElements.attr('d', (d: any) => {
        const dx = d.target.x - d.source.x;
        const dy = d.target.y - d.source.y;
        const dr = Math.sqrt(dx * dx + dy * dy) * 1.5; // Curve radius
        return `M${d.source.x},${d.source.y}A${dr},${dr} 0 0,1 ${d.target.x},${d.target.y}`;
      });

      linkLabels
        .attr('x', (d: any) => (d.source.x + d.target.x) / 2)
        .attr('y', (d: any) => (d.source.y + d.target.y) / 2);

      nodeElements.attr('transform', (d: any) => `translate(${d.x},${d.y})`);
    }

    function dragstarted(e: any, d: any) {
      if (!e.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
      d.__dragged = false;
    }

    function dragged(e: any, d: any) {
      d.fx = e.x;
      d.fy = e.y;
      d.__dragged = true;
    }

    function dragended(e: any, d: any) {
      if (!e.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    async function selectNode(node: any) {
      state.selectedNode = node;

      // Update Journey
      const existingIndex = state.journey.findIndex(n => n.id === node.id);
      if (existingIndex !== -1) {
        state.journey = state.journey.slice(0, existingIndex + 1);
      } else {
        state.journey.push(node);
      }
      updateBreadcrumbs();

      // Update UI
      nodeElements.classed('selected', (d: any) => d.id === node.id);

      ui.infoCategory.textContent = node.category;
      ui.infoCategory.style.color = getColor(node.category);
      ui.infoTitle.textContent = node.title;
      ui.infoDesc.textContent = node.description;
      
      // Handle external link
      if (node.url) {
        ui.infoLink.href = node.url;
        ui.infoLink.style.display = 'inline-block';
      } else {
        ui.infoLink.style.display = 'none';
      }
      
      // Reset image container
      ui.infoImageContainer.style.display = 'none';
      ui.infoImage.src = '';

      if (node.expanded) {
        ui.expandBtn.textContent = 'Node fully expanded';
        ui.expandBtn.disabled = true;
      } else {
        ui.expandBtn.textContent = 'Expand this node →';
        ui.expandBtn.disabled = false;
      }

      ui.infoError.style.display = 'none';
      ui.infoPanel.classList.add('visible');

      // Pan to node
      const transform = d3.zoomTransform(svg.node() as Element);
      const x = width / 2 - node.x * transform.k;
      const y = height / 2 - node.y * transform.k;

      svg.transition().duration(750).call(
        zoom.transform as any,
        d3.zoomIdentity.translate(x, y).scale(transform.k)
      );
      
      // Fetch Wikipedia Image
      try {
        const res = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(node.title)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.thumbnail && data.thumbnail.source) {
            ui.infoImage.src = data.thumbnail.source;
            ui.infoImageContainer.style.display = 'block';
          }
          // If Gemini didn't provide a URL, use Wikipedia's
          if (!node.url && data.content_urls && data.content_urls.desktop) {
            ui.infoLink.href = data.content_urls.desktop.page;
            ui.infoLink.style.display = 'inline-block';
          }
        }
      } catch (err) {
        console.error('Failed to fetch Wikipedia image:', err);
      }
    }

    // Graph Controls Logic
    document.getElementById('zoom-in')?.addEventListener('click', () => {
      svg.transition().duration(300).call(zoom.scaleBy as any, 1.3);
    });
    
    document.getElementById('zoom-out')?.addEventListener('click', () => {
      svg.transition().duration(300).call(zoom.scaleBy as any, 0.7);
    });
    
    document.getElementById('fit-screen')?.addEventListener('click', () => {
      if (state.nodes.length === 0) return;
      const bounds = g.node()?.getBBox();
      if (!bounds || bounds.width === 0 || bounds.height === 0) return;
      const dx = bounds.width, dy = bounds.height, x = bounds.x + dx / 2, y = bounds.y + dy / 2;
      const scale = Math.max(0.1, Math.min(4, 0.85 / Math.max(dx / width, dy / height)));
      const translate = [width / 2 - scale * x, height / 2 - scale * y];
      svg.transition().duration(750).call(zoom.transform as any, d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale));
    });
    
    document.getElementById('export-btn')?.addEventListener('click', () => {
      const svgElement = document.getElementById('graph');
      if (!svgElement) return;
      
      // Clone the SVG to modify it for export (e.g., add background)
      const clone = svgElement.cloneNode(true) as SVGSVGElement;
      
      // Add a dark background rect to the clone
      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('width', '100%');
      rect.setAttribute('height', '100%');
      rect.setAttribute('fill', '#0d0d14');
      clone.insertBefore(rect, clone.firstChild);

      const serializer = new XMLSerializer();
      let source = serializer.serializeToString(clone);
      
      if(!source.match(/^<svg[^>]+xmlns="http\:\/\/www\.w3\.org\/2000\/svg"/)){
          source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
      }
      if(!source.match(/^<svg[^>]+"http\:\/\/www\.w3\.org\/1999\/xlink"/)){
          source = source.replace(/^<svg/, '<svg xmlns:xlink="http://www.w3.org/1999/xlink"');
      }
      
      // Add CSS styles inline for export
      const style = document.createElement('style');
      style.textContent = `
        .link { stroke: rgba(255,255,255,0.15); stroke-width: 1.5px; fill: none; }
        .node { stroke: #0d0d14; stroke-width: 2px; }
        .node-label { fill: #fff; font-size: 13px; font-family: sans-serif; font-weight: 500; text-anchor: middle; }
        .link-label { fill: rgba(255,255,255,0.5); font-size: 10px; font-family: sans-serif; text-anchor: middle; }
      `;
      source = source.replace('</svg>', `<style>${style.textContent}</style></svg>`);
      
      source = '<?xml version="1.0" standalone="no"?>\r\n' + source;
      const url = "data:image/svg+xml;charset=utf-8,"+encodeURIComponent(source);
      
      const a = document.createElement("a");
      a.download = `knowledge-graph-${new Date().getTime()}.svg`;
      a.href = url;
      a.click();
      showToast('Graph exported as SVG!');
    });

    // Handle resize with debounce for virtual keyboards
    let resizeTimer: any;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        width = window.innerWidth;
        height = window.innerHeight;
        svg.attr('width', width).attr('height', height);
        simulation.force('center', d3.forceCenter(width / 2, height / 2));
        applyLayout();
        if (!isFrozen) simulation.alpha(0.3).restart();
      }, 300);
    };
    window.addEventListener('resize', handleResize);

    // Auto-pause physics on mobile to save battery
    let idleTimer: any = null;
    function resetIdleTimer() {
      if (idleTimer) clearTimeout(idleTimer);
      if (window.innerWidth < 768 && !isFrozen) {
        idleTimer = setTimeout(() => {
            simulation.alpha(0).stop();
            if(ui.freezeBtn) {
              ui.freezeBtn.classList.add('paused');
              ui.freezeBtn.textContent = '▶️';
            }
            isFrozen = true;
        }, 5000);
      }
    }
    
    // Bind interaction to wake up physics on mobile
    svg.on('pointerdown touchstart', () => {
        if(isFrozen && window.innerWidth < 768) {
            isFrozen = false;
            if(ui.freezeBtn) {
              ui.freezeBtn.classList.remove('paused');
              ui.freezeBtn.textContent = '⏸️';
            }
            simulation.alpha(0.3).restart();
        }
        resetIdleTimer();
    });

    // Deep Linking: Auto-load shared URLs
    const urlParams = new URLSearchParams(window.location.search);
    const deepLinkQuery = urlParams.get('q');
    if (deepLinkQuery) {
      ui.searchInput.value = deepLinkQuery;
      setTimeout(() => startExploration(deepLinkQuery), 500);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div id="app">
      <div id="topbar">
        <div id="logo">Thro<span>vic</span></div>
        
        <div id="search-container">
          <input type="text" id="search" placeholder="Enter a topic (e.g. black holes, jazz, origami)..." autoComplete="off" />
          <button id="go-btn">Explore</button>
          <button id="random-btn" className="icon-btn" title="Surprise me">↻</button>
          <button id="reset-btn" className="icon-btn" title="Reset graph">✕</button>
          <button id="share-btn" className="icon-btn" title="Share link">➦</button>
          <select id="layout-select" className="icon-btn" style={{ marginLeft: '8px', padding: '4px 8px' }}>
            <option value="force">Force Layout</option>
            <option value="radial">Radial Layout</option>
            <option value="tree">Tree Layout</option>
          </select>
          <input type="text" id="local-search" placeholder="Find node... (Enter)" autoComplete="off" />
        </div>
      </div>
      
      <div id="history"></div>
      
      <div id="canvas-wrap">
        <svg id="graph"></svg>
        
        <div id="empty-state">
          <h2>Where does your curiosity go?</h2>
          <p>Enter a topic above to start generating a knowledge graph.</p>
          <div id="starter-pills">
            <button className="starter-pill" data-topic="Quantum Mechanics">🌌 Quantum Mechanics</button>
            <button className="starter-pill" data-topic="History of Jazz">🎷 History of Jazz</button>
            <button className="starter-pill" data-topic="Stoicism">🏛️ Stoicism</button>
            <button className="starter-pill" data-topic="CRISPR">🧬 CRISPR</button>
            <button className="starter-pill" data-topic="Black Holes">🕳️ Black Holes</button>
          </div>
        </div>
        
        <div id="loading">
          <div className="spinner"></div>
          <div id="loading-text">Generating connections...</div>
        </div>
        
        <div id="breadcrumbs"></div>

        <div id="physics-panel">
          <div className="physics-header">
            <h3>Physics Engine</h3>
            <button className="close-physics" id="close-physics">✕</button>
          </div>
          <div className="slider-group">
            <div className="slider-label"><span>Gravity</span> <span className="slider-val" id="val-gravity">0.05</span></div>
            <input type="range" id="slider-gravity" min="0" max="0.2" step="0.01" defaultValue="0.05" />
          </div>
          <div className="slider-group">
            <div className="slider-label"><span>Repulsion</span> <span className="slider-val" id="val-repulsion">-400</span></div>
            <input type="range" id="slider-repulsion" min="-1000" max="-50" step="10" defaultValue="-400" />
          </div>
          <div className="slider-group">
            <div className="slider-label"><span>Link Length</span> <span className="slider-val" id="val-link">60</span></div>
            <input type="range" id="slider-link" min="20" max="200" step="5" defaultValue="60" />
          </div>
        </div>
        
        <div id="info-panel">
          <div className="swipe-handle"></div>
          <button id="close-info" className="icon-btn" title="Close">✕</button>
          <div id="info-image-container" style={{ display: 'none', width: '100%', height: '160px', borderRadius: '12px', overflow: 'hidden', marginBottom: '16px', background: 'rgba(255,255,255,0.05)' }}>
            <img id="info-image" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div id="info-category">Category</div>
          <h3 id="info-title">Node Title</h3>
          <p id="info-desc">Node description goes here.</p>
          <a id="info-link" href="#" target="_blank" rel="noopener noreferrer" style={{ display: 'none', color: '#7F77DD', fontSize: '14px', marginBottom: '16px', textDecoration: 'none', fontWeight: 500 }}>Read more on Wikipedia ↗</a>
          <button id="expand-btn">Expand this node →</button>
          <div id="info-error"></div>
        </div>
        
        <div id="legend">
          <div className="legend-item" data-category="science"><div className="legend-color" style={{background: '#7F77DD'}}></div>Science / Math</div>
          <div className="legend-item" data-category="history"><div className="legend-color" style={{background: '#5DCAA5'}}></div>History / People</div>
          <div className="legend-item" data-category="philosophy"><div className="legend-color" style={{background: '#EF9F27'}}></div>Philosophy / Ideas</div>
          <div className="legend-item" data-category="culture"><div className="legend-color" style={{background: '#F0997B'}}></div>Culture / Art</div>
          <div className="legend-item" data-category="technology"><div className="legend-color" style={{background: '#85B7EB'}}></div>Technology</div>
          <div className="legend-item" data-category="nature"><div className="legend-color" style={{background: '#97C459'}}></div>Nature / Biology</div>
          <div className="legend-item" data-category="default"><div className="legend-color" style={{background: '#AFA9EC'}}></div>Other</div>
        </div>
        
        <div id="graph-controls">
        <button className="control-btn" id="freeze-btn" title="Freeze Physics" style={{ fontSize: '18px' }}>⏸️</button>
        <button className="control-btn" id="physics-btn" title="Physics Settings">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
        </button>
        <button className="control-btn" id="zoom-in" title="Zoom In">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>
        </button>
        <button className="control-btn" id="zoom-out" title="Zoom Out">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14"/></svg>
        </button>
        <button className="control-btn" id="fit-screen" title="Fit to Screen">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h6v2H6v4H4V4zm10 0h6v6h-2V6h-4V4zM4 14h2v4h4v2H4v-6zm16 0h-2v4h-4v2h6v-6z"/></svg>
        </button>
        <button className="control-btn" id="export-btn" title="Export Graph">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
        </button>
      </div>

      <div id="counters">
          <div className="counter-box">
            <div className="counter-val" id="count-nodes">0</div>
            <div className="counter-label">Nodes</div>
          </div>
          <div className="counter-box">
            <div className="counter-val" id="count-depth">0</div>
            <div className="counter-label">Max Depth</div>
          </div>
        </div>
      </div>
      
      <div id="tooltip"></div>
      <div id="toast">Link copied to clipboard!</div>
    </div>
  );
}
