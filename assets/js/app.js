
(function(){
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------- Motion: reveals ----------
  function initReveals(){
    const els = document.querySelectorAll('[data-reveal]');
    if (!els.length) return;
    if (reduceMotion){
      els.forEach(el=>el.classList.add('is-in'));
      return;
    }
    const io = new IntersectionObserver((entries)=>{
      entries.forEach(e=>{
        if (e.isIntersecting){
          e.target.classList.add('is-in');
          io.unobserve(e.target);
        }
      });
    }, {threshold:0.12});
    els.forEach(el=>{
      el.classList.add('reveal');
      io.observe(el);
    });
  }

  // ---------- Parallax ----------
  function initParallax(){
    const heroBg = document.querySelector('[data-parallax]');
    if (!heroBg || reduceMotion) return;
    const onScroll = ()=>{
      const y = window.scrollY || 0;
      heroBg.style.setProperty('--parallax', `${Math.round(y * 0.35)}px`);
    };
    window.addEventListener('scroll', onScroll, {passive:true});
    onScroll();
  }

  // ---------- Carousels ----------
  function initCarousels(){
    document.querySelectorAll('[data-carousel]').forEach((wrap)=>{
      const scroller = wrap.querySelector('.hscroll');
      const left = wrap.querySelector('[data-left]');
      const right = wrap.querySelector('[data-right]');
      if (!scroller) return;

      const step = ()=> Math.min(480, scroller.clientWidth * 0.7);

      function scrollBy(dx){
        scroller.scrollBy({left: dx, behavior: reduceMotion ? 'auto' : 'smooth'});
      }

      left?.addEventListener('click', ()=> scrollBy(-step()));
      right?.addEventListener('click', ()=> scrollBy(step()));

      // keyboard accessibility (left/right when focused)
      scroller.setAttribute('tabindex','0');
      scroller.addEventListener('keydown', (e)=>{
        if (e.key === 'ArrowLeft'){ e.preventDefault(); scrollBy(-step()); }
        if (e.key === 'ArrowRight'){ e.preventDefault(); scrollBy(step()); }
      });
    });
  }

  // ---------- Command Palette (⌘K / Ctrl+K) ----------
  function initCommandPalette(){
    const palette = document.getElementById('cmdk');
    const input = document.getElementById('cmdkInput');
    const list = document.getElementById('cmdkList');
    if (!palette || !input || !list) return;

    const actions = [
      {label:'Go: Home', kbd:'G H', run:()=> location.href='index.html'},
      {label:'Go: Products', kbd:'G P', run:()=> location.href='products.html'},
      {label:'Go: Dashboard', kbd:'G D', run:()=> location.href='dashboard.html'},
      {label:'Go: Resources', kbd:'G R', run:()=> location.href='resources.html'},
      {label:'Create purchase order', kbd:'P O', run:()=> alert('Demo: Create PO flow')},
      {label:'Open cart', kbd:'C', run:()=> openDrawer()},
      {label:'Saved view: Contract items', kbd:'V 1', run:()=> applySavedView('contract')},
      {label:'Saved view: Approved suppliers', kbd:'V 2', run:()=> applySavedView('approved')},
      {label:'Saved view: Branch essentials', kbd:'V 3', run:()=> applySavedView('essentials')}
    ];

    let filtered = actions.slice();
    let activeIdx = 0;

    function render(){
      list.innerHTML = '';
      filtered.forEach((a, idx)=>{
        const div = document.createElement('div');
        div.className = 'palette-item';
        div.setAttribute('role','option');
        div.setAttribute('aria-selected', idx===activeIdx ? 'true' : 'false');
        div.innerHTML = `<div style="font-weight:800;">${a.label}</div><div class="kbd">${a.kbd}</div>`;
        div.addEventListener('click', ()=>{ a.run(); close(); });
        list.appendChild(div);
      });
    }

    function open(){
      palette.classList.add('open');
      palette.setAttribute('aria-hidden','false');
      input.value='';
      filtered = actions.slice();
      activeIdx=0;
      render();
      setTimeout(()=>input.focus(), 0);
    }

    function close(){
      palette.classList.remove('open');
      palette.setAttribute('aria-hidden','true');
    }

    function onKeyDown(e){
      const isK = (e.key.toLowerCase() === 'k') && (e.metaKey || e.ctrlKey);
      if (isK){
        e.preventDefault();
        if (palette.classList.contains('open')) close(); else open();
      }
      if (e.key === 'Escape' && palette.classList.contains('open')){
        e.preventDefault(); close();
      }
    }

    document.addEventListener('keydown', onKeyDown);

    input.addEventListener('input', ()=>{
      const q = input.value.trim().toLowerCase();
      filtered = actions.filter(a=>a.label.toLowerCase().includes(q));
      activeIdx=0;
      render();
    });

    input.addEventListener('keydown', (e)=>{
      if (e.key === 'ArrowDown'){ e.preventDefault(); activeIdx = Math.min(filtered.length-1, activeIdx+1); render(); }
      if (e.key === 'ArrowUp'){ e.preventDefault(); activeIdx = Math.max(0, activeIdx-1); render(); }
      if (e.key === 'Enter'){
        e.preventDefault();
        const a = filtered[activeIdx];
        if (a){ a.run(); close(); }
      }
    });

    palette.addEventListener('click', (e)=>{
      if (e.target === palette) close();
    });
  }

  // ---------- Cart / PO Summary ----------
  const CART_KEY = 'b2b_cart_v1';
  const MAX_BUDGET = 40000;

  function loadCart(){
    try { return JSON.parse(localStorage.getItem(CART_KEY) || '[]'); } catch { return []; }
  }
  function saveCart(items){
    localStorage.setItem(CART_KEY, JSON.stringify(items));
    updateCartUI();
  }
  function money(n){
    return n.toLocaleString(undefined,{style:'currency', currency:'USD'});
  }
  function cartTotal(items){
    return items.reduce((s,i)=>s + i.price*i.qty, 0);
  }

  function updateCartUI(){
    const items = loadCart();
    const meta = document.getElementById('cartMeta');
    const totalEl = document.getElementById('cartTotal');
    const list = document.getElementById('cartItems');
    const impact = document.getElementById('budgetImpact');

    if (meta) meta.textContent = `${items.reduce((s,i)=>s+i.qty,0)} items • ${money(cartTotal(items))}`;
    if (totalEl) totalEl.textContent = money(cartTotal(items));
    if (impact){
      const t = cartTotal(items);
      const pct = Math.min(100, Math.round((t/MAX_BUDGET)*100));
      impact.textContent = `Impact: ${pct}% of cap`;
      impact.style.borderColor = t > MAX_BUDGET ? 'rgba(236,32,40,.65)' : 'var(--line)';
      impact.style.color = t > MAX_BUDGET ? 'var(--red)' : 'var(--text)';
    }
    if (!list) return;

    list.innerHTML = '';
    if (!items.length){
      const empty = document.createElement('div');
      empty.className = 'card';
      empty.style.padding = '14px';
      empty.innerHTML = `<div style="font-weight:900;">Your cart is empty</div><div class="mini" style="margin-top:6px;">Add items from the catalog to build a purchase order.</div>`;
      list.appendChild(empty);
      return;
    }

    items.forEach((it, idx)=>{
      const row = document.createElement('div');
      row.className = 'card';
      row.style.padding = '12px';
      row.innerHTML = `
        <div class="drawer-row">
          <div class="drawer-item">
            <img src="${it.img}" alt="${it.name}" loading="lazy"/>
            <div>
              <div style="font-weight:900;">${it.name}</div>
              <div class="mini">${it.sku} • ${it.brand}</div>
              <div style="font-weight:900; color: var(--red); margin-top:6px;">${money(it.price)}</div>
            </div>
          </div>
          <div style="display:grid; gap:8px; justify-items:end;">
            <div class="qty" aria-label="Quantity controls">
              <button class="btn" type="button" data-dec="${idx}" aria-label="Decrease quantity">−</button>
              <strong aria-label="Quantity">${it.qty}</strong>
              <button class="btn" type="button" data-inc="${idx}" aria-label="Increase quantity">+</button>
            </div>
            <button class="btn btn-ghost" type="button" data-rm="${idx}" aria-label="Remove item">Remove</button>
          </div>
        </div>
      `;
      list.appendChild(row);
    });

    list.querySelectorAll('[data-inc]').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        const i = Number(btn.getAttribute('data-inc'));
        const items = loadCart();
        items[i].qty += 1;
        saveCart(items);
      });
    });
    list.querySelectorAll('[data-dec]').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        const i = Number(btn.getAttribute('data-dec'));
        const items = loadCart();
        items[i].qty = Math.max(1, items[i].qty - 1);
        saveCart(items);
      });
    });
    list.querySelectorAll('[data-rm]').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        const i = Number(btn.getAttribute('data-rm'));
        const items = loadCart();
        items.splice(i,1);
        saveCart(items);
      });
    });
  }

  function openDrawer(){
    const drawer = document.getElementById('cartDrawer');
    const backdrop = document.getElementById('backdrop');
    if (!drawer || !backdrop) return;
    drawer.classList.add('open');
    drawer.setAttribute('aria-hidden','false');
    backdrop.classList.add('open');
    backdrop.setAttribute('aria-hidden','false');
    updateCartUI();
    // focus close button
    drawer.querySelector('[data-close-drawer]')?.focus();
  }
  function closeDrawer(){
    const drawer = document.getElementById('cartDrawer');
    const backdrop = document.getElementById('backdrop');
    if (!drawer || !backdrop) return;
    drawer.classList.remove('open');
    drawer.setAttribute('aria-hidden','true');
    backdrop.classList.remove('open');
    backdrop.setAttribute('aria-hidden','true');
  }

  // Saved views (Products page)
  function applySavedView(view){
    const el = document.querySelector('[data-savedview]');
    if (el) el.value = view;
    // lightweight demo: set badges/filters visually
    const banner = document.getElementById('savedViewBanner');
    if (banner){
      const map = {
        contract: 'Showing Contract Items • negotiated pricing applied',
        approved: 'Approved Suppliers Only • policy compliant',
        essentials: 'Branch Essentials • frequently reordered in BC + AB'
      };
      banner.textContent = map[view] || '';
      banner.style.display = view ? 'block' : 'none';
    }
  }

  function initProducts(){
    const grid = document.querySelector('.product-grid');
    if (!grid) return;

    // Skeleton loading effect
    if (!reduceMotion){
      const real = grid.innerHTML;
      grid.innerHTML = '';
      for (let i=0;i<12;i++){
        const sk = document.createElement('div');
        sk.className = 'prod';
        sk.innerHTML = `
          <div class="thumb skel"></div>
          <div class="skel" style="height:16px; width:70%; margin-top:10px;"></div>
          <div class="skel" style="height:12px; width:55%; margin-top:8px;"></div>
          <div class="skel" style="height:16px; width:35%; margin-top:12px;"></div>
          <div class="skel" style="height:44px; width:100%; margin-top:14px; border-radius:12px;"></div>
        `;
        grid.appendChild(sk);
      }
      setTimeout(()=>{ grid.innerHTML = real; wireProductCTAs(); }, 550);
    } else {
      wireProductCTAs();
    }

    // View cart buttons
    document.querySelectorAll('[data-open-cart]').forEach(btn=>{
      btn.addEventListener('click', openDrawer);
    });

    // Saved views dropdown (if present)
    const sv = document.querySelector('[data-savedview]');
    sv?.addEventListener('change', ()=> applySavedView(sv.value));
  }

  function wireProductCTAs(){
    document.querySelectorAll('[data-add]').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        const card = btn.closest('.prod');
        if (!card) return;
        const item = {
          id: card.getAttribute('data-id'),
          name: card.getAttribute('data-name'),
          sku: card.getAttribute('data-sku'),
          brand: card.getAttribute('data-brand'),
          price: Number(card.getAttribute('data-price') || '0'),
          img: card.querySelector('img')?.getAttribute('src') || ''
        };
        const items = loadCart();
        const existing = items.find(i=>i.id===item.id);
        if (existing) existing.qty += 1;
        else items.push({...item, qty:1});
        saveCart(items);
        openDrawer();
      });
    });
  }

  // Submit PO demo
  function initPOActions(){
    document.getElementById('clearCart')?.addEventListener('click', ()=>{
      localStorage.removeItem(CART_KEY);
      updateCartUI();
    });

    document.getElementById('submitPO')?.addEventListener('click', ()=>{
      const items = loadCart();
      const total = cartTotal(items);
      if (!items.length){ alert('Cart is empty. Add items from Products.'); return; }

      // Demo approval policy
      const needsApproval = total >= 5000 || items.some(i=>i.price*i.qty >= 2500);
      localStorage.setItem('b2b_last_po_total', String(total));
      localStorage.setItem('b2b_last_po_needs_approval', needsApproval ? '1' : '0');
      localStorage.setItem('b2b_last_po_branch', document.getElementById('shipBranch')?.value || 'Vancouver, BC');

      // Create an approval item for dashboard
      const approvals = JSON.parse(localStorage.getItem('b2b_approvals_v1') || '[]');
      approvals.unshift({
        id: 'PO-CT-' + Math.floor(Math.random()*90000+10000),
        branch: localStorage.getItem('b2b_last_po_branch'),
        total: total,
        supplier: 'Mixed',
        created: new Date().toISOString(),
        status: needsApproval ? 'Pending approval' : 'Approved (auto)',
        flags: needsApproval ? ['Threshold', 'Budget policy'] : []
      });
      localStorage.setItem('b2b_approvals_v1', JSON.stringify(approvals.slice(0,12)));

      if (needsApproval){
        alert('Submitted. This PO routes to approvals (demo policy). Check Dashboard → Approvals.');
      } else {
        alert('Submitted. Auto-approved (demo policy).');
      }
      closeDrawer();
    });

    // Close actions
    document.querySelectorAll('[data-close-drawer]').forEach(btn=>btn.addEventListener('click', closeDrawer));
    document.getElementById('backdrop')?.addEventListener('click', closeDrawer);
    document.addEventListener('keydown', (e)=>{ if (e.key==='Escape') closeDrawer(); });
  }

  // ---------- Dashboard tabs + modules ----------
  function initTabs(){
    const root = document.querySelector('[data-tabs]');
    if (!root) return;

    const tabs = Array.from(root.querySelectorAll('[role="tab"]'));
    const panes = Array.from(document.querySelectorAll('[role="tabpanel"]'));
    let current = tabs.findIndex(t=>t.getAttribute('aria-selected')==='true');
    if (current < 0) current = 0;

    function activate(idx){
      tabs.forEach((t,i)=>{
        const selected = i===idx;
        t.setAttribute('aria-selected', selected ? 'true' : 'false');
        t.tabIndex = selected ? 0 : -1;
      });
      panes.forEach((p,i)=>{
        p.classList.toggle('is-active', i===idx);
        if (i===idx){
          p.classList.remove('anim-in');
          void p.offsetWidth;
          p.classList.add('anim-in');
        }
      });
      current = idx;
      tabs[idx].focus();
    }

    tabs.forEach((t,i)=>{
      t.addEventListener('click', ()=>activate(i));
      t.addEventListener('keydown', (e)=>{
        if (e.key==='ArrowRight'){ e.preventDefault(); activate((current+1)%tabs.length); }
        if (e.key==='ArrowLeft'){ e.preventDefault(); activate((current-1+tabs.length)%tabs.length); }
        if (e.key==='Home'){ e.preventDefault(); activate(0); }
        if (e.key==='End'){ e.preventDefault(); activate(tabs.length-1); }
      });
    });

    // initial
    panes.forEach((p,i)=>p.classList.toggle('is-active', i===current));
  }

  function initApprovalsTable(){
    const table = document.getElementById('approvalsTable');
    if (!table) return;

    const data = JSON.parse(localStorage.getItem('b2b_approvals_v1') || '[]');
    if (!data.length){
      table.innerHTML = `<div class="card" style="padding:14px;"><div style="font-weight:900;">No approvals yet</div><div class="mini" style="margin-top:6px;">Submit a PO from Products to generate a pending approval.</div></div>`;
      return;
    }

    table.innerHTML = '';
    data.forEach((po, idx)=>{
      const row = document.createElement('div');
      row.className = 'card hover';
      row.style.padding = '14px';
      row.style.cursor = 'pointer';
      row.innerHTML = `
        <div class="drawer-row">
          <div>
            <div style="font-weight:900;">${po.id} • ${po.branch}</div>
            <div class="mini">${new Date(po.created).toLocaleString()} • ${po.supplier}</div>
          </div>
          <div style="text-align:right;">
            <div style="font-weight:900; color: var(--red);">${money(po.total)}</div>
            <div class="mini">${po.status}</div>
          </div>
        </div>
        <div class="hr" style="margin:12px 0;"></div>
        <div class="mini">Flags: ${po.flags.length ? po.flags.join(', ') : 'None'}</div>
        <div class="details" style="display:none; margin-top:12px;">
          <div class="grid" style="grid-template-columns: 1fr; gap:10px;">
            <div class="card" style="padding:12px; background: var(--bg2);">
              <div style="font-weight:900;">Policy checks</div>
              <ul style="margin:8px 0 0; padding-left:18px;">
                <li>Budget cap: ${po.total > MAX_BUDGET ? 'Exceeded' : 'Within cap'}</li>
                <li>Supplier compliance: ${po.supplier==='Mixed' ? 'Review required' : 'OK'}</li>
                <li>Threshold routing: ${po.total >= 5000 ? 'Yes' : 'No'}</li>
              </ul>
            </div>
            <div style="display:flex; gap:10px; flex-wrap:wrap;">
              <button class="btn btn-primary" type="button" data-approve="${idx}">Approve</button>
              <button class="btn" type="button" data-reject="${idx}">Request changes</button>
            </div>
          </div>
        </div>
      `;
      row.addEventListener('click', ()=>{
        const details = row.querySelector('.details');
        const open = details.style.display !== 'none';
        details.style.display = open ? 'none' : 'block';
        if (!reduceMotion && !open){
          details.classList.remove('anim-in');
          void details.offsetWidth;
          details.classList.add('anim-in');
        }
      });
      table.appendChild(row);
    });

    table.querySelectorAll('[data-approve]').forEach(btn=>{
      btn.addEventListener('click', (e)=>{
        e.stopPropagation();
        const i = Number(btn.getAttribute('data-approve'));
        const data = JSON.parse(localStorage.getItem('b2b_approvals_v1') || '[]');
        data[i].status = 'Approved';
        data[i].flags = [];
        localStorage.setItem('b2b_approvals_v1', JSON.stringify(data));
        initApprovalsTable();
      });
    });

    table.querySelectorAll('[data-reject]').forEach(btn=>{
      btn.addEventListener('click', (e)=>{
        e.stopPropagation();
        alert('Demo: request changes sent to requester.');
      });
    });
  }

  // Activity timeline filters
  function initActivityFilters(){
    const list = document.getElementById('activityList');
    const branch = document.getElementById('filterBranch');
    const type = document.getElementById('filterType');
    if (!list || !branch || !type) return;

    const items = Array.from(list.querySelectorAll('[data-branch]'));
    function apply(){
      const b = branch.value;
      const t = type.value;
      items.forEach(el=>{
        const okB = (b==='All') || (el.dataset.branch===b);
        const okT = (t==='All') || (el.dataset.type===t);
        el.style.display = (okB && okT) ? 'flex' : 'none';
      });
    }
    branch.addEventListener('change', apply);
    type.addEventListener('change', apply);
    apply();
  }

  // ---------- Boot ----------
  document.addEventListener('DOMContentLoaded', ()=>{
    if (window.lucide && typeof window.lucide.createIcons==='function'){ window.lucide.createIcons(); }
    initParallax();
    initCarousels();
    initReveals();

    initCommandPalette();
    initProducts();
    initPOActions();

    initTabs();
    initApprovalsTable();
    initActivityFilters();

    // global "View cart" buttons on any page
    document.querySelectorAll('[data-open-cart]').forEach(btn=>btn.addEventListener('click', openDrawer));

    updateCartUI();
  });
})();
